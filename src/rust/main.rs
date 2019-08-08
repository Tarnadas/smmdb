#[macro_use]
extern crate mongodb;

#[macro_use]
extern crate failure;

mod account;
mod collections;
mod course;
mod course2;
mod database;
mod routes;
mod server;

use crate::database::Database;
use crate::server::Server;

fn main() {
    use std::sync::{Arc, Mutex};

    let database = Database::new();
    Server::start(Arc::new(Mutex::new(database))).unwrap();
}
