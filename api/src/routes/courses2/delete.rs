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
    let course_id = ObjectId::with_string(&course_id)
        .map_err(|_| DeleteCourse2Error::InvalidObjectId(course_id))?;
    data.delete_course2(course_id)?;
    Ok(HttpResponse::NoContent().into())
}

#[derive(Debug, Fail)]
pub enum DeleteCourse2Error {
    #[fail(
        display = "Object id for course must be given as hex string.\nReceived: {}",
        _0
    )]
    InvalidObjectId(String),
    #[fail(display = "[DeleteCourse2Error::Mongo]: {}", _0)]
    Mongo(mongodb::Error),
}

impl From<mongodb::Error> for DeleteCourse2Error {
    fn from(err: mongodb::Error) -> Self {
        DeleteCourse2Error::Mongo(err)
    }
}

impl ResponseError for DeleteCourse2Error {
    fn error_response(&self) -> HttpResponse {
        match *self {
            DeleteCourse2Error::InvalidObjectId(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            DeleteCourse2Error::Mongo(_) => HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR),
        }
    }
}
