use crate::server::ServerData;

use actix_web::{delete, error::ResponseError, http::StatusCode, web, HttpRequest, HttpResponse};
use mongodb::oid::ObjectId;

#[delete("{course_id}")]
pub fn delete_course(
    data: web::Data<ServerData>,
    path: web::Path<String>,
    req: HttpRequest,
) -> Result<HttpResponse, DeleteCourse2Error> {
    let course_id = path.into_inner();
    let course_oid = ObjectId::with_string(&course_id)?;
    data.delete_course2(course_id.clone(), course_oid)?;
    Ok(HttpResponse::NoContent().into())
}

#[derive(Debug, Fail)]
pub enum DeleteCourse2Error {
    #[fail(display = "Object id invalid.\nReason: {}", _0)]
    MongoOid(mongodb::oid::Error),
    #[fail(display = "Course with ID {} not found", _0)]
    ObjectIdUnknown(String),
    #[fail(display = "[DeleteCourse2Error::Mongo]: {}", _0)]
    Mongo(mongodb::Error),
}

impl From<mongodb::oid::Error> for DeleteCourse2Error {
    fn from(err: mongodb::oid::Error) -> Self {
        DeleteCourse2Error::MongoOid(err)
    }
}

impl From<mongodb::Error> for DeleteCourse2Error {
    fn from(err: mongodb::Error) -> Self {
        match err {
            mongodb::Error::ArgumentError(s) => DeleteCourse2Error::ObjectIdUnknown(s),
            _ => DeleteCourse2Error::Mongo(err),
        }
    }
}

impl ResponseError for DeleteCourse2Error {
    fn error_response(&self) -> HttpResponse {
        match *self {
            DeleteCourse2Error::MongoOid(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            DeleteCourse2Error::ObjectIdUnknown(_) => HttpResponse::new(StatusCode::NOT_FOUND),
            DeleteCourse2Error::Mongo(_) => HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR),
        }
    }
}
