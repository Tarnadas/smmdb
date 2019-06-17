#[macro_use]
extern crate mongodb;

mod collections;
mod course;
mod database;
mod routes;
mod server;

// use cemu_smm::course::*;
use crate::database::Database;
use crate::server::Server;

// static COURSE_ASSET: &[u8] = include_bytes!("test/course");

fn main() {
    use std::sync::{Arc, Mutex};
    //     println!("Hello, world!");
    //     let course = Course::from_proto(COURSE_ASSET);
    //     dbg!(course.get_course_ref().get_title());

    let database = Database::new();
    Server::start(Arc::new(Mutex::new(database))).unwrap();
}
