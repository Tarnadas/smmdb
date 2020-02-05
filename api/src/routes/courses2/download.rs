use crate::server::ServerData;

use actix_http::http::header;
use actix_web::{error::ResponseError, get, http::StatusCode, web, HttpResponse};
use bson::{oid::ObjectId, ValueAccessError};
use compression::prelude::*;
use serde::Deserialize;
use serde_qs::actix::QsQuery;
use std::io;
use tar::{Builder, Header};

#[get("download/{course_id}")]
pub async fn download_course(
    data: web::Data<ServerData>,
    path: web::Path<String>,
    _query: QsQuery<DownloadCourse2>,
) -> Result<HttpResponse, DownloadCourse2Error> {
    let course_id = path.into_inner();
    let course_oid = ObjectId::with_string(&course_id)?;
    let (data, thumb) = data.get_course2(course_oid)?;
    let data = data
        .into_iter()
        .decode(&mut GZipDecoder::new())
        .collect::<Result<Vec<_>, _>>()?;

    let mut builder = Builder::new(vec![]);

    let mut header = Header::new_gnu();
    header.set_path("course_data_000.bcd").unwrap();
    header.set_size(data.len() as u64);
    header.set_cksum();
    builder.append(&header, &data[..])?;

    let mut header = Header::new_gnu();
    header.set_path("course_thumb_000.btl").unwrap();
    header.set_size(thumb.len() as u64);
    header.set_cksum();
    builder.append(&header, &thumb[..])?;

    Ok(HttpResponse::Ok()
        .content_type("application/tar+gzip")
        .set_header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{}.tar.gz\"", course_id),
        )
        .body(builder.into_inner()?))
}

#[derive(Debug, Deserialize)]
pub struct DownloadCourse2 {
    #[serde(default)]
    pub format: Format,
}

#[derive(Clone, Debug, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Format {
    TGZ,
}

impl Default for Format {
    fn default() -> Self {
        Format::TGZ
    }
}

impl Into<String> for Format {
    fn into(self) -> String {
        match self {
            Format::TGZ => "tgz".to_string(),
        }
    }
}

#[derive(Debug, Fail)]
pub enum DownloadCourse2Error {
    #[fail(display = "")]
    CourseNotFound(ObjectId),
    #[fail(display = "[DownloadCourse2Error::IoError]: {}", _0)]
    IoError(io::Error),
    #[fail(display = "Object id invalid.\nReason: {}", _0)]
    MongoOid(bson::oid::Error),
    #[fail(display = "[DownloadCourse2Error::Mongo]: {}", _0)]
    Mongo(mongodb::error::Error),
    #[fail(display = "[DownloadCourse2Error::ValueAccessError]: {}", _0)]
    ValueAccessError(ValueAccessError),
    #[fail(display = "[DownloadCourse2Error::CompressionError]: {}", _0)]
    Compression(CompressionError),
}

impl From<io::Error> for DownloadCourse2Error {
    fn from(err: io::Error) -> Self {
        DownloadCourse2Error::IoError(err)
    }
}

impl From<bson::oid::Error> for DownloadCourse2Error {
    fn from(err: bson::oid::Error) -> Self {
        DownloadCourse2Error::MongoOid(err)
    }
}

impl From<mongodb::error::Error> for DownloadCourse2Error {
    fn from(err: mongodb::error::Error) -> Self {
        DownloadCourse2Error::Mongo(err)
    }
}

impl From<ValueAccessError> for DownloadCourse2Error {
    fn from(err: ValueAccessError) -> Self {
        DownloadCourse2Error::ValueAccessError(err)
    }
}

impl From<CompressionError> for DownloadCourse2Error {
    fn from(err: CompressionError) -> Self {
        DownloadCourse2Error::Compression(err)
    }
}

impl ResponseError for DownloadCourse2Error {
    fn error_response(&self) -> HttpResponse {
        match *self {
            DownloadCourse2Error::IoError(_) => {
                HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR)
            }
            DownloadCourse2Error::CourseNotFound(_) => HttpResponse::new(StatusCode::NOT_FOUND),
            DownloadCourse2Error::MongoOid(bson::oid::Error::FromHexError(_)) => {
                HttpResponse::new(StatusCode::BAD_REQUEST)
            }
            DownloadCourse2Error::MongoOid(_) => {
                HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR)
            }
            DownloadCourse2Error::Mongo(_) => HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR),
            DownloadCourse2Error::ValueAccessError(_) => {
                HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR)
            }
            DownloadCourse2Error::Compression(_) => {
                HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR)
            }
        }
    }
}
