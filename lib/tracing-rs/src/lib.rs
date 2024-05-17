#![cfg_attr(feature = "fail-on-warnings", deny(warnings))]
#![cfg_attr(feature = "fail-on-warnings", deny(clippy::all))]

use opentelemetry::{global, KeyValue};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_sdk::{
    propagation::TraceContextPropagator,
    resource::{EnvResourceDetector, OsResourceDetector, ProcessResourceDetector},
    trace, Resource,
};
use opentelemetry_semantic_conventions::resource::{
    SERVICE_INSTANCE_ID, SERVICE_NAME, SERVICE_NAMESPACE,
};
use serde::{Deserialize, Serialize};
use tracing_subscriber::{filter::EnvFilter, fmt, layer::SubscriberExt, util::SubscriberInitExt};

pub use tracing::*;

use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TracingConfig {
    host: String,
    port: u16,
    service_name: String,
    #[serde(default)]
    pub service_instance_id: String,
}

impl Default for TracingConfig {
    fn default() -> Self {
        Self {
            host: "localhost".to_string(),
            port: 4317,
            service_name: "lava-dev".to_string(),
            service_instance_id: "lava-dev".to_string(),
        }
    }
}

pub fn init_tracer(config: TracingConfig) -> anyhow::Result<()> {
    let tracing_endpoint = format!("http://{}:{}", config.host, config.port);
    println!("Sending traces to {tracing_endpoint}");
    global::set_text_map_propagator(TraceContextPropagator::new());
    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(
            opentelemetry_otlp::new_exporter()
                .tonic()
                .with_endpoint(tracing_endpoint),
        )
        .with_trace_config(trace::config().with_resource(telemetry_resource(&config)))
        .install_batch(opentelemetry_sdk::runtime::Tokio)?;
    let telemetry = tracing_opentelemetry::layer().with_tracer(tracer);

    let fmt_layer = fmt::layer().json();
    let filter_layer = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new("info,otel::tracing=trace,sqlx=warn,sqlx_ledger=info"))
        .unwrap();
    tracing_subscriber::registry()
        .with(filter_layer)
        .with(fmt_layer)
        .with(telemetry)
        .try_init()?;

    Ok(())
}

fn telemetry_resource(config: &TracingConfig) -> Resource {
    Resource::from_detectors(
        Duration::from_secs(3),
        vec![
            Box::new(EnvResourceDetector::new()),
            Box::new(OsResourceDetector),
            Box::new(ProcessResourceDetector),
        ],
    )
    .merge(&Resource::new(vec![
        KeyValue::new(SERVICE_NAME, config.service_name.clone()),
        KeyValue::new(SERVICE_INSTANCE_ID, config.service_instance_id.clone()),
        KeyValue::new(SERVICE_NAMESPACE, "lava"),
    ]))
}

pub fn insert_error_fields(level: tracing::Level, error: impl std::fmt::Display) {
    Span::current().record("error", &tracing::field::display("true"));
    Span::current().record("error.level", &tracing::field::display(level));
    Span::current().record("error.message", &tracing::field::display(error));
}

#[cfg(feature = "http")]
pub mod http {
    pub fn extract_tracing(headers: &axum_extra::headers::HeaderMap) {
        use opentelemetry_http::HeaderExtractor;
        use tracing_opentelemetry::OpenTelemetrySpanExt;
        // http in opentelemetry_http is not on the same version as in axum_extra
        // Change this when opentelemetry_http has http >= v1.x
        let mut map = http::HeaderMap::new();
        for (key, value) in headers.iter() {
            if let Ok(key) = http::HeaderName::from_bytes(key.as_str().as_bytes()) {
                if let Ok(s) = value.to_str() {
                    if let Ok(v) = http::HeaderValue::from_str(s) {
                        map.insert(key, v);
                    }
                }
            }
        }
        let extractor = HeaderExtractor(&map);
        let ctx = opentelemetry::global::get_text_map_propagator(|propagator| {
            propagator.extract(&extractor)
        });
        tracing::Span::current().set_parent(ctx)
    }
}
