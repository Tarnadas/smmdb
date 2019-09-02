use crate::account::{Account, AccountRes};
use crate::config::get_google_client_id;
use crate::database::Database;
use crate::routes::{courses, courses2, index, login, swagger};
use crate::session::Session;

use actix_cors::Cors;
use actix_web::{
    http::header,
    middleware::{Compress, Logger},
    App, HttpServer,
};
use std::sync::{Arc, Mutex};

pub struct Server {}

pub struct ServerData {
    pub database: Arc<Mutex<Database>>,
    pub google_client_id: String,
}

impl Server {
    pub fn start(database: Arc<Mutex<Database>>) -> std::io::Result<()> {
        std::env::set_var("RUST_LOG", "actix_web=debug");
        env_logger::init();

        HttpServer::new(move || {
            App::new()
                .data(ServerData {
                    database: database.clone(),
                    google_client_id: get_google_client_id(),
                })
                .wrap(
                    Cors::new()
                        .allowed_methods(vec!["GET", "POST", "PUT"])
                        .allowed_headers(vec![
                            header::AUTHORIZATION,
                            header::ACCEPT,
                            header::CONTENT_TYPE,
                        ])
                        .max_age(3600),
                )
                .wrap(Compress::default())
                .wrap(Logger::default())
                .service(index)
                .service(swagger)
                .service(courses::service())
                .service(courses2::service())
                .service(login::service())
        })
        .bind("0.0.0.0:3030")?
        .workers(1)
        .run()
    }
}

impl ServerData {
    pub fn get_courses(
        &self,
        query: courses::GetCourses,
    ) -> Result<String, courses::GetCoursesError> {
        let database = self
            .database
            .lock()
            .expect("[ServerData::get_courses] lock() failed");
        match query.into_ordered_document(&database) {
            Ok(query) => Ok(database.get_courses(query)),
            Err(error) => Err(error),
        }
    }

    pub fn get_courses2(
        &self,
        query: courses2::GetCourses2,
    ) -> Result<String, courses2::GetCourses2Error> {
        let database = self
            .database
            .lock()
            .expect("[ServerData::get_courses] lock() failed");
        match query.into_ordered_document(&database) {
            Ok(query) => Ok(database.get_courses2(query)),
            Err(error) => Err(error),
        }
    }

    pub fn add_or_get_account(
        &self,
        account: AccountRes,
        session: Session,
    ) -> Result<Account, mongodb::Error> {
        let database = self
            .database
            .lock()
            .expect("[ServerData::get_courses] lock() failed");
        match database.find_account(account.as_find()) {
            Some(account) => Ok(account),
            None => database.add_account(account, session),
        }
    }
}
