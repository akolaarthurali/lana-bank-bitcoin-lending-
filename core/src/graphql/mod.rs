mod fixed_term_loan;
mod fixed_term_loan_balance;
mod objects;
mod primitives;
mod schema;
mod user;
mod user_balance;

use async_graphql::*;

pub use schema::*;

use crate::app::LavaApp;

pub fn schema(app: Option<LavaApp>) -> Schema<Query, Mutation, EmptySubscription> {
    let schema = Schema::build(Query, Mutation, EmptySubscription);
    if let Some(app) = app {
        schema.data(app).finish()
    } else {
        schema.finish()
    }
}
