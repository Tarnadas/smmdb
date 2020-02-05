use crate::server::ServerData;

use actix_web::{error::ResponseError, get, http::StatusCode, web, HttpRequest, HttpResponse};
use bson::oid::ObjectId;
use serde::Deserialize;
use serde_qs::actix::QsQuery;

#[get("thumbnail/{course_id}")]
pub async fn get_thumbnail(
    data: web::Data<ServerData>,
    path: web::Path<String>,
    query: QsQuery<GetThumbnail2>,
    _req: HttpRequest,
) -> Result<HttpResponse, GetCourse2ThumbnailError> {
    let course_id = path.into_inner();
    let course_id = ObjectId::with_string(&course_id)?;
    let thumb = data.get_course2_thumbnail(course_id, query.into_inner())?;
    Ok(HttpResponse::Ok().content_type("image/jpeg").body(thumb))
}

#[derive(Debug, Deserialize)]
pub struct GetThumbnail2 {
    #[serde(default)]
    pub size: Size2,
}

#[derive(Clone, Debug, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Size2 {
    S,
    M,
    L,
    ORIGINAL,
}

impl Size2 {
    pub fn get_dimensions(&self) -> (u32, u32) {
        match *self {
            Size2::S => (160, 90),
            Size2::M => (320, 180),
            Size2::L => (480, 270),
            Size2::ORIGINAL => (640, 360),
        }
    }
}

impl Default for Size2 {
    fn default() -> Self {
        Size2::ORIGINAL
    }
}

impl Into<String> for Size2 {
    fn into(self) -> String {
        match self {
            Size2::S => "thumb_s".to_string(),
            Size2::M => "thumb_m".to_string(),
            Size2::L => "thumb_l".to_string(),
            Size2::ORIGINAL => "thumb".to_string(),
        }
    }
}

#[derive(Debug, Fail)]
pub enum GetCourse2ThumbnailError {
    #[fail(display = "")]
    CourseNotFound(ObjectId),
    #[fail(display = "Object id invalid.\nReason: {}", _0)]
    MongoOid(bson::oid::Error),
    #[fail(display = "[GetCourse2ThumbnailError::Mongo]: {}", _0)]
    Mongo(mongodb::error::Error),
    #[fail(display = "[GetCourse2ThumbnailError::Image]: {}", _0)]
    Image(image::ImageError),
}

impl From<bson::oid::Error> for GetCourse2ThumbnailError {
    fn from(err: bson::oid::Error) -> Self {
        GetCourse2ThumbnailError::MongoOid(err)
    }
}

impl From<mongodb::error::Error> for GetCourse2ThumbnailError {
    fn from(err: mongodb::error::Error) -> Self {
        GetCourse2ThumbnailError::Mongo(err)
    }
}

impl From<image::ImageError> for GetCourse2ThumbnailError {
    fn from(err: image::ImageError) -> Self {
        GetCourse2ThumbnailError::Image(err)
    }
}

impl ResponseError for GetCourse2ThumbnailError {
    fn error_response(&self) -> HttpResponse {
        match *self {
            GetCourse2ThumbnailError::CourseNotFound(_) => HttpResponse::new(StatusCode::NOT_FOUND),
            GetCourse2ThumbnailError::MongoOid(bson::oid::Error::FromHexError(_)) => {
                HttpResponse::new(StatusCode::BAD_REQUEST)
            }
            GetCourse2ThumbnailError::MongoOid(_) => {
                HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR)
            }
            GetCourse2ThumbnailError::Mongo(_) => {
                HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR)
            }
            GetCourse2ThumbnailError::Image(_) => {
                HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR)
            }
        }
    }
}
