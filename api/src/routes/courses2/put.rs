use crate::server::ServerData;
use crate::Database;

use cemu_smm::{course2::Course2, errors::DecompressionError, proto::SMM2Course::SMM2Course};

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
    // data.get_courses2(query.into_inner())
    payload
        .from_err()
        .fold(BytesMut::new(), |mut acc, chunk| {
            acc.extend_from_slice(&chunk);
            Ok::<BytesMut, PayloadError>(acc)
        })
        .map(|buffer| match Course2::from_packed(&buffer[..]) {
            Ok(courses) => {
                let courses: Vec<SMM2Course> = courses
                    .into_iter()
                    .map(|course| course.take_course())
                    .collect();
                HttpResponse::Ok().json(courses)
            }
            Err(err) => PutCourses2Error::from(err).error_response(),
        })
}

#[derive(Fail, Debug)]
pub enum PutCourses2Error {
    #[fail(display = "{}", _0)]
    PayloadError(PayloadError),
    #[fail(display = "placeholder")]
    DecompressionError(DecompressionError),
}

impl From<PayloadError> for PutCourses2Error {
    fn from(err: PayloadError) -> Self {
        PutCourses2Error::PayloadError(err)
    }
}

impl From<DecompressionError> for PutCourses2Error {
    fn from(err: DecompressionError) -> Self {
        PutCourses2Error::DecompressionError(err)
    }
}

impl ResponseError for PutCourses2Error {
    fn error_response(&self) -> HttpResponse {
        match *self {
            PutCourses2Error::PayloadError(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            PutCourses2Error::DecompressionError(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
        }
    }
}
