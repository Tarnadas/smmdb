use crate::{server::ServerData, Identity};

use actix_web::{delete, error::ResponseError, http::StatusCode, web, HttpRequest, HttpResponse};
use bson::oid::ObjectId;

#[delete("{course_id}")]
pub async fn delete_course(
    data: web::Data<ServerData>,
    path: web::Path<String>,
    _req: HttpRequest,
    identity: Identity,
) -> Result<HttpResponse, DeleteCourse2Error> {
    let course_id = path.into_inner();
    let course_oid = ObjectId::with_string(&course_id)?;
    let account = identity.get_account();
    if !data.does_account_own_course(account.get_id(), course_oid.clone()) {
        return Err(DeleteCourse2Error::Unauthorized.into());
    }
    data.delete_course2(course_id, course_oid)?;
    Ok(HttpResponse::NoContent().into())
}

#[derive(Debug, Fail)]
pub enum DeleteCourse2Error {
    #[fail(display = "Object id invalid.\nReason: {}", _0)]
    MongoOid(bson::oid::Error),
    #[fail(display = "Course with ID {} not found", _0)]
    ObjectIdUnknown(String),
    #[fail(display = "[DeleteCourse2Error::Mongo]: {}", _0)]
    Mongo(mongodb::error::Error),
    #[fail(display = "")]
    Unauthorized,
}

impl From<bson::oid::Error> for DeleteCourse2Error {
    fn from(err: bson::oid::Error) -> Self {
        match err {
            bson::oid::Error::ArgumentError(s) => DeleteCourse2Error::ObjectIdUnknown(s),
            _ => DeleteCourse2Error::MongoOid(err),
        }
    }
}

impl From<mongodb::error::Error> for DeleteCourse2Error {
    fn from(err: mongodb::error::Error) -> Self {
        DeleteCourse2Error::Mongo(err)
    }
}

impl ResponseError for DeleteCourse2Error {
    fn error_response(&self) -> HttpResponse {
        match *self {
            DeleteCourse2Error::MongoOid(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            DeleteCourse2Error::ObjectIdUnknown(_) => HttpResponse::new(StatusCode::NOT_FOUND),
            DeleteCourse2Error::Mongo(_) => HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR),
            DeleteCourse2Error::Unauthorized => HttpResponse::new(StatusCode::UNAUTHORIZED),
        }
    }
}
