use chrono::{DateTime, Utc};
use sqlx::{postgres::types::PgInterval, PgPool, Postgres, Transaction};
use tokio::sync::RwLock;
use tracing::{instrument, Span};

use std::{collections::HashMap, sync::Arc};

use super::{
    config::*, current::*, entity::*, error::JobError, registry::*, repo::*, traits::*, JobId,
};

#[derive(Clone)]
pub(crate) struct JobExecutor {
    config: JobExecutorConfig,
    pool: PgPool,
    registry: Arc<RwLock<JobRegistry>>,
    poller_handle: Option<Arc<tokio::task::JoinHandle<()>>>,
    running_jobs: Arc<RwLock<HashMap<JobId, JobHandle>>>,
    jobs: JobRepo,
}

impl JobExecutor {
    pub fn new(
        pool: &PgPool,
        config: JobExecutorConfig,
        registry: Arc<RwLock<JobRegistry>>,
        jobs: &JobRepo,
    ) -> Self {
        Self {
            pool: pool.clone(),
            poller_handle: None,
            config,
            registry,
            running_jobs: Arc::new(RwLock::new(HashMap::new())),
            jobs: jobs.clone(),
        }
    }

    pub async fn spawn_job<I: JobInitializer>(
        &self,
        db: &mut Transaction<'_, Postgres>,
        job: &Job,
        schedule_at: Option<DateTime<Utc>>,
    ) -> Result<(), JobError> {
        if job.job_type != I::job_type() {
            return Err(JobError::JobTypeMismatch(
                job.job_type.clone(),
                I::job_type(),
            ));
        }
        if !self
            .registry
            .try_read()
            .expect("Cannot read registry")
            .initializer_exists(&job.job_type)
        {
            return Err(JobError::NoInitializerPresent);
        }
        sqlx::query!(
            r#"
          INSERT INTO job_executions (id, reschedule_after)
          VALUES ($1, COALESCE($2, NOW()))
        "#,
            job.id as JobId,
            schedule_at
        )
        .execute(&mut **db)
        .await?;
        Ok(())
    }

    pub async fn start_poll(&mut self) -> Result<(), JobError> {
        let pool = self.pool.clone();
        let poll_interval = self.config.poll_interval;
        let pg_interval = PgInterval::try_from(poll_interval * 4)
            .map_err(|e| JobError::InvalidPollInterval(e.to_string()))?;
        let running_jobs = Arc::clone(&self.running_jobs);
        let registry = Arc::clone(&self.registry);
        let jobs = self.jobs.clone();
        let handle = tokio::spawn(async move {
            let poll_limit = 2;
            let mut keep_alive = false;
            loop {
                let _ = Self::poll_jobs(
                    &pool,
                    &registry,
                    &mut keep_alive,
                    poll_limit,
                    pg_interval.clone(),
                    &running_jobs,
                    &jobs,
                )
                .await;
                tokio::time::sleep(poll_interval).await;
            }
        });
        self.poller_handle = Some(Arc::new(handle));
        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    #[instrument(
        level = "trace",
        name = "job_executor.poll_jobs",
        skip(pool, registry, running_jobs, jobs),
        fields(n_jobs_to_spawn, n_jobs_running),
        err
    )]
    async fn poll_jobs(
        pool: &PgPool,
        registry: &Arc<RwLock<JobRegistry>>,
        keep_alive: &mut bool,
        poll_limit: u32,
        pg_interval: PgInterval,
        running_jobs: &Arc<RwLock<HashMap<JobId, JobHandle>>>,
        jobs: &JobRepo,
    ) -> Result<(), JobError> {
        let span = Span::current();
        span.record("keep_alive", *keep_alive);
        {
            let jobs = running_jobs.read().await;
            span.record("n_jobs_running", jobs.len());
            if *keep_alive {
                let ids = jobs.keys().cloned().collect::<Vec<_>>();
                sqlx::query!(
                    r#"
                    UPDATE job_executions
                    SET reschedule_after = NOW() + $2::interval
                    WHERE id = ANY($1)
                    "#,
                    &ids as &[JobId],
                    pg_interval
                )
                .fetch_all(pool)
                .await?;
                // mark 'lost' jobs as 'pending'
                sqlx::query!(
                    r#"
                    UPDATE job_executions
                    SET state = 'pending', attempt_index = attempt_index + 1
                    WHERE state = 'running' AND reschedule_after < NOW() + $1::interval
                    "#,
                    pg_interval
                )
                .fetch_all(pool)
                .await?;
            }
        }
        *keep_alive = !*keep_alive;
        let rows = sqlx::query!(
            r#"
              WITH selected_jobs AS (
                  SELECT je.id, je.execution_state_json AS data_json
                  FROM job_executions je
                  JOIN jobs ON je.id = jobs.id
                  WHERE reschedule_after < NOW()
                  AND je.state = 'pending'
                  LIMIT $1
                  FOR UPDATE
              )
              UPDATE job_executions AS je
              SET state = 'running', reschedule_after = NOW() + $2::interval
              FROM selected_jobs
              WHERE je.id = selected_jobs.id
              RETURNING je.id AS "id!: JobId", selected_jobs.data_json, je.attempt_index
              "#,
            poll_limit as i32,
            pg_interval
        )
        .fetch_all(pool)
        .await?;
        span.record("n_jobs_to_spawn", rows.len());
        if !rows.is_empty() {
            for row in rows {
                let job = jobs.find_by_id(row.id).await?;
                let _ = Self::start_job(
                    pool,
                    registry,
                    running_jobs,
                    job,
                    row.attempt_index as u32,
                    row.data_json,
                    jobs.clone(),
                )
                .await;
            }
        }
        Ok(())
    }

    #[instrument(
        name = "job_executor.start_job",
        skip(registry, running_jobs, job, repo),
        fields(job_id, job_type),
        err
    )]
    async fn start_job(
        pool: &PgPool,
        registry: &Arc<RwLock<JobRegistry>>,
        running_jobs: &Arc<RwLock<HashMap<JobId, JobHandle>>>,
        job: Job,
        attempt: u32,
        job_payload: Option<serde_json::Value>,
        repo: JobRepo,
    ) -> Result<(), JobError> {
        let runner = registry
            .try_read()
            .expect("cannot read registry")
            .init_job(&job)?;
        let id = job.id;
        let span = Span::current();
        span.record("job_id", tracing::field::display(&id));
        span.record("job_type", tracing::field::display(&job.job_type));
        let job_type = job.job_type.clone();
        let all_jobs = Arc::clone(running_jobs);
        let pool = pool.clone();
        let registry = Arc::clone(registry);
        let handle = tokio::spawn(async move {
            let res = Self::execute_job(
                job,
                attempt,
                pool.clone(),
                job_payload,
                runner,
                repo.clone(),
                &registry,
            )
            .await;
            let mut write_lock = all_jobs.write().await;
            if let Err(e) = res {
                match pool.begin().await {
                    Ok(db) => {
                        let _ = Self::fail_job(
                            db,
                            id,
                            attempt,
                            e,
                            repo,
                            registry
                                .try_read()
                                .expect("Cannot read registry")
                                .retry_settings(&job_type),
                        )
                        .await;
                    }
                    Err(_) => {
                        eprintln!("Could not start transaction when failing job");
                        tracing::error!("Could not start transaction when failing job");
                    }
                }
            }
            write_lock.remove(&id);
        });
        running_jobs
            .write()
            .await
            .insert(id, JobHandle(Some(handle)));
        Ok(())
    }

    #[instrument(name = "job.execute", skip_all,
        fields(job_id, job_type, attempt, error, error.level, error.message),
    err)]
    async fn execute_job(
        job: Job,
        attempt: u32,
        pool: PgPool,
        payload: Option<serde_json::Value>,
        runner: Box<dyn JobRunner>,
        repo: JobRepo,
        registry: &Arc<RwLock<JobRegistry>>,
    ) -> Result<(), JobError> {
        let id = job.id;
        let span = Span::current();
        span.record("job_id", tracing::field::display(&id));
        span.record("job_type", tracing::field::display(&job.job_type));
        span.record("attempt", attempt);
        let current_job_pool = pool.clone();
        let current_job = CurrentJob::new(id, attempt, current_job_pool, payload);

        match runner.run(current_job).await.map_err(|e| {
            let error = e.to_string();
            Span::current().record("error", tracing::field::display("true"));
            Span::current().record("error.message", tracing::field::display(&error));
            let n_warn_attempts = registry
                .try_read()
                .expect("Cannot read registry")
                .retry_settings(&job.job_type)
                .n_warn_attempts;
            if attempt <= n_warn_attempts.unwrap_or(u32::MAX) {
                Span::current()
                    .record("error.level", tracing::field::display(tracing::Level::WARN));
            } else {
                Span::current().record(
                    "error.level",
                    tracing::field::display(tracing::Level::ERROR),
                );
            }
            JobError::JobExecutionError(error)
        })? {
            JobCompletion::Complete => {
                let tx = pool.begin().await?;
                Self::complete_job(tx, id, repo).await?;
            }
            JobCompletion::CompleteWithTx(tx) => {
                Self::complete_job(tx, id, repo).await?;
            }
            JobCompletion::RescheduleAt(t) => {
                let tx = pool.begin().await?;
                Self::reschedule_job(tx, id, t).await?;
            }
            JobCompletion::RescheduleAtWithTx(tx, t) => {
                Self::reschedule_job(tx, id, t).await?;
            }
        }
        Ok(())
    }

    async fn complete_job(
        mut db: Transaction<'_, Postgres>,
        id: JobId,
        repo: JobRepo,
    ) -> Result<(), JobError> {
        let mut job = repo.find_by_id(&id).await?;
        sqlx::query!(
            r#"
          DELETE FROM job_executions
          WHERE id = $1
        "#,
            id as JobId
        )
        .execute(&mut *db)
        .await?;
        job.completed();
        repo.update_in_tx(&mut db, &mut job).await?;
        db.commit().await?;
        Ok(())
    }

    async fn reschedule_job(
        mut db: Transaction<'_, Postgres>,
        id: JobId,
        reschedule_at: DateTime<Utc>,
    ) -> Result<(), JobError> {
        sqlx::query!(
            r#"
          UPDATE job_executions
          SET state = 'pending', reschedule_after = $2, attempt_index = 1
          WHERE id = $1
        "#,
            id as JobId,
            reschedule_at,
        )
        .execute(&mut *db)
        .await?;
        db.commit().await?;
        Ok(())
    }

    async fn fail_job(
        mut db: Transaction<'_, Postgres>,
        id: JobId,
        attempt: u32,
        error: JobError,
        repo: JobRepo,
        retry_settings: &RetrySettings,
    ) -> Result<(), JobError> {
        let mut job = repo.find_by_id(id).await?;
        job.fail(error.to_string());
        repo.update_in_tx(&mut db, &mut job).await?;

        if retry_settings.n_attempts.unwrap_or(u32::MAX) > attempt {
            let reschedule_at = retry_settings.next_attempt_at(attempt);
            sqlx::query!(
                r#"
                UPDATE job_executions
                SET state = 'pending', reschedule_after = $2, attempt_index = $3
                WHERE id = $1
              "#,
                id as JobId,
                reschedule_at,
                (attempt + 1) as i32
            )
            .execute(&mut *db)
            .await?;
        } else {
            sqlx::query!(
                r#"
                DELETE FROM job_executions
                WHERE id = $1
              "#,
                id as JobId
            )
            .execute(&mut *db)
            .await?;
        }

        db.commit().await?;
        Ok(())
    }
}

struct JobHandle(Option<tokio::task::JoinHandle<()>>);
impl Drop for JobHandle {
    fn drop(&mut self) {
        if let Some(handle) = self.0.take() {
            handle.abort();
        }
    }
}
