#[macro_use]
extern crate mongodb;

#[macro_use]
extern crate failure;

mod account;
mod collections;
mod config;
mod course;
mod course2;
mod database;
mod minhash;
mod routes;
mod server;
mod session;

pub use course::Course;
pub use course2::Course2;
pub use session::Identity;

use crate::database::Database;
use crate::server::Server;

fn main() {
    use std::sync::Arc;

    let database = Database::new();
    Server::start(Arc::new(database)).unwrap();
}
