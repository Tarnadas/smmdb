use crate::account::{Account, AccountReq};
use crate::config::get_google_client_id;
use crate::course2::Course2;
use crate::database::Database;
use crate::routes::{courses, courses2, index, login, swagger};
use crate::session::AuthSession;

use actix_cors::Cors;
use actix_session::{CookieSession, Session};
use actix_web::{
    http::header,
    middleware::{Compress, Logger},
    web, App, HttpResponse, HttpServer,
};
use mongodb::{spec::BinarySubtype, Bson};
use std::{
    convert::TryInto,
    sync::{Arc, Mutex},
};

pub struct Server {}

pub struct Data {
    database: Arc<Database>,
    pub google_client_id: String,
}

pub type ServerData = Arc<Mutex<Data>>;

impl Server {
    pub fn start(database: Arc<Database>) -> std::io::Result<()> {
        std::env::set_var("RUST_LOG", "actix_web=debug");
        env_logger::init();

        HttpServer::new(move || {
            App::new()
                .data(Arc::new(Mutex::new(Data {
                    database: database.clone(),
                    google_client_id: get_google_client_id(),
                })))
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
                .wrap(CookieSession::signed(&[0; 32]).secure(true))
                .service(web::resource("/").to(|| HttpResponse::Ok()))
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

impl Data {
    pub fn get_courses(
        &self,
        query: courses::GetCourses,
    ) -> Result<String, courses::GetCoursesError> {
        match query.into_ordered_document(&self.database) {
            Ok(query) => Ok(self.database.get_courses(query)),
            Err(error) => Err(error),
        }
    }

    pub fn get_courses2(
        &self,
        query: courses2::GetCourses2,
    ) -> Result<String, courses2::GetCourses2Error> {
        match query.into_ordered_document(&self.database) {
            Ok(query) => Ok(self.database.get_courses2(query)),
            Err(error) => Err(error),
        }
    }

    pub fn put_courses2(
        &self,
        mut courses: Vec<cemu_smm::Course2>,
    ) -> Result<(), courses2::PutCourses2Error> {
        let res: Result<Vec<_>, _> = courses
            .iter_mut()
            .map(|course| -> Result<(), courses2::PutCourses2Error> {
                // // let course_meta = serde_json::to_value(course.get_course())?;
                // let course = Course2::new(mongodb::oid::ObjectId::new()?, course.take_course());
                // let data = Bson::Binary(BinarySubtype::Generic, course.get_course_data().clone());
                // let course_thumb = course
                //     .get_course_thumb_mut()
                //     .ok_or(courses2::PutCourses2Error::ThumbnailMissing)?;
                // let thumb = Bson::Binary(
                //     BinarySubtype::Generic,
                //     course_thumb.get_jpeg_no_opt().to_vec(),
                // );
                // let thumb_opt =
                //     Bson::Binary(BinarySubtype::Generic, course_thumb.get_jpeg().to_vec());
                // // if let Bson::Document(doc_meta) = Bson::from(course_meta) {
                // self.database
                //     .put_course2(course.try_into()?, data, thumb, thumb_opt)?;
                // // }
                Ok(())
            })
            .collect();
        res?;
        Ok(())
    }

    pub fn add_or_get_account(
        &self,
        account: AccountReq,
        session: AuthSession,
    ) -> Result<Account, mongodb::Error> {
        match self.database.find_account(account.as_find()) {
            Some(account) => Ok(account),
            None => self.database.add_account(account, session),
        }
    }
}
