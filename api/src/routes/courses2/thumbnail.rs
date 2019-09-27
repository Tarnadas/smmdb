use crate::server::ServerData;

use actix_http::http::header;
use actix_web::{error::ResponseError, get, http::StatusCode, web, HttpRequest, HttpResponse};
use mongodb::oid::ObjectId;

#[get("thumbnail/{course_id}")]
pub fn get_thumbnail(
    data: web::Data<ServerData>,
    path: web::Path<String>,
    req: HttpRequest,
) -> Result<HttpResponse, GetCourse2ThumbnailError> {
    let course_id = path.into_inner();
    let course_id = ObjectId::with_string(&course_id)?;
    let thumb = data.get_course2_thumbnail(course_id)?;
    Ok(HttpResponse::Ok()
        .set_header(header::CONTENT_TYPE, "image/jpeg")
        .body(thumb))
}

#[derive(Debug, Fail)]
pub enum GetCourse2ThumbnailError {
    #[fail(display = "")]
    CourseNotFound(ObjectId),
    #[fail(display = "Object id invalid.\nReason: {}", _0)]
    MongoOid(mongodb::oid::Error),
    #[fail(display = "[GetCourse2ThumbnailError::Mongo]: {}", _0)]
    Mongo(mongodb::Error),
}

impl From<mongodb::oid::Error> for GetCourse2ThumbnailError {
    fn from(err: mongodb::oid::Error) -> Self {
        GetCourse2ThumbnailError::MongoOid(err)
    }
}

impl From<mongodb::Error> for GetCourse2ThumbnailError {
    fn from(err: mongodb::Error) -> Self {
        GetCourse2ThumbnailError::Mongo(err)
    }
}

impl ResponseError for GetCourse2ThumbnailError {
    fn error_response(&self) -> HttpResponse {
        match *self {
            GetCourse2ThumbnailError::CourseNotFound(_) => HttpResponse::new(StatusCode::NOT_FOUND),
            GetCourse2ThumbnailError::MongoOid(mongodb::oid::Error::FromHexError(_)) => {
                HttpResponse::new(StatusCode::BAD_REQUEST)
            }
            GetCourse2ThumbnailError::MongoOid(_) => {
                HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR)
            }
            GetCourse2ThumbnailError::Mongo(_) => {
                HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR)
            }
        }
    }
}
