use crate::database::Database;
use crate::routes::{courses, courses2, index, login, swagger};
use crate::session::Auth;

use actix_cors::Cors;
use actix_session::CookieSession;
use actix_web::{
    http::header,
    middleware::{Compress, Logger},
    App, HttpServer,
};
use std::sync::{Arc, Mutex};

mod data;

pub use data::*;

pub struct Server;

impl Server {
    pub fn start(database: Arc<Database>) -> std::io::Result<()> {
        std::env::set_var("RUST_LOG", "actix_web=debug");
        env_logger::init();

        HttpServer::new(move || {
            App::new()
                .data(Arc::new(Mutex::new(Data::new(database.clone()))))
                .service(courses::service())
                .service(courses2::service())
                .service(login::service())
                .service(swagger)
                .service(index)
                .wrap(Auth)
                .wrap(
                    CookieSession::signed(&[0; 32])
                        .name("smmdb")
                        .path("/")
                        .max_age(3600 * 24 * 7)
                        .secure(false),
                )
                .wrap(
                    Cors::new()
                        .allowed_methods(vec!["GET", "POST", "PUT", "OPTIONS"])
                        .allowed_headers(vec![
                            header::AUTHORIZATION,
                            header::ACCEPT,
                            header::CONTENT_TYPE,
                        ])
                        .supports_credentials()
                        .max_age(3600),
                )
                .wrap(Compress::default())
                .wrap(Logger::default())
        })
        .bind("0.0.0.0:3030")?
        .workers(1) // TODO num cpus
        .run()
    }
}
