use crate::server::ServerData;

use cemu_smm::{course2::Course2, errors::DecompressionError};

use actix_web::{
    error::{PayloadError, ResponseError},
    http::StatusCode,
    put,
    web::{self, BytesMut},
    HttpRequest, HttpResponse,
};
use futures::{self, Future, Stream};

#[put("")]
pub fn put_courses(
    data: web::Data<ServerData>,
    req: HttpRequest,
    payload: web::Payload,
) -> impl Future<Item = HttpResponse, Error = PutCourses2Error> {
    let data = data.clone();
    payload
        .from_err()
        .fold(BytesMut::new(), |mut acc, chunk| {
            acc.extend_from_slice(&chunk);
            Ok::<BytesMut, PayloadError>(acc)
        })
        .map(move |buffer| match Course2::from_packed(&buffer[..]) {
            Ok(courses) => match data.lock().unwrap().put_courses2(courses) {
                Ok(_) => HttpResponse::NoContent().into(),
                Err(_) => HttpResponse::BadRequest().into(),
            },
            Err(err) => PutCourses2Error::from(err).error_response(),
        })
}

#[derive(Fail, Debug)]
pub enum PutCourses2Error {
    #[fail(display = "[PutCourses2Error::Payload]: {}", _0)]
    Payload(PayloadError),
    #[fail(display = "[PutCourses2Error::Decompression]: {}", _0)]
    Decompression(DecompressionError),
    #[fail(display = "[PutCourses2Error::SerdeJson]: {}", _0)]
    SerdeJson(serde_json::Error),
    #[fail(display = "[PutCourses2Error::ThumbnailMissing]: course is missing thumbnail")]
    ThumbnailMissing,
    #[fail(display = "[PutCourses2Error::Mongo]: {}", _0)]
    Mongo(mongodb::Error),
}

impl From<PayloadError> for PutCourses2Error {
    fn from(err: PayloadError) -> Self {
        PutCourses2Error::Payload(err)
    }
}

impl From<DecompressionError> for PutCourses2Error {
    fn from(err: DecompressionError) -> Self {
        PutCourses2Error::Decompression(err)
    }
}

impl From<serde_json::Error> for PutCourses2Error {
    fn from(err: serde_json::Error) -> Self {
        PutCourses2Error::SerdeJson(err)
    }
}

impl From<mongodb::Error> for PutCourses2Error {
    fn from(err: mongodb::Error) -> Self {
        PutCourses2Error::Mongo(err)
    }
}

impl ResponseError for PutCourses2Error {
    fn error_response(&self) -> HttpResponse {
        match *self {
            PutCourses2Error::Payload(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            PutCourses2Error::Decompression(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            PutCourses2Error::SerdeJson(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            PutCourses2Error::ThumbnailMissing => HttpResponse::new(StatusCode::BAD_REQUEST),
            PutCourses2Error::Mongo(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
        }
    }
}
