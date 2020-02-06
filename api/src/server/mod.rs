use crate::database::Database;
use crate::routes::{courses, courses2, index, login, logout, swagger};
use crate::session::Auth;

use actix_cors::Cors;
use actix_session::CookieSession;
use actix_web::{
    client::Client,
    dev::Server as ActixServer,
    http::header,
    middleware::{Compress, Logger},
    App, HttpServer,
};
use std::{io, sync::Arc};

mod data;

pub use data::*;

pub struct Server;

impl Server {
    pub fn start(database: Arc<Database>) -> Result<ActixServer, io::Error> {
        std::env::set_var("RUST_LOG", "actix_web=debug");
        env_logger::init();
        let data = Arc::new(Data::new(database));

        Ok(HttpServer::new(move || {
            App::new()
                .data(data.clone())
                .data(Client::default())
                .service(courses::service())
                .service(courses2::service())
                .service(login::service())
                .service(logout::service())
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
                        .allowed_methods(vec!["GET", "POST", "PUT", "OPTIONS", "DELETE"])
                        .allowed_headers(vec![
                            header::AUTHORIZATION,
                            header::ACCEPT,
                            header::CONTENT_TYPE,
                        ])
                        .supports_credentials()
                        .max_age(3600)
                        .finish(),
                )
                .wrap(Compress::default())
                .wrap(Logger::default())
        })
        .bind("0.0.0.0:3030")?
        .workers(num_cpus::get())
        .run())
    }
}
