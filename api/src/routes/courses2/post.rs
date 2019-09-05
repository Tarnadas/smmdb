use crate::server::ServerData;

use cemu_smm::{course2::Course2, errors::DecompressionError, proto::SMM2Course::SMM2Course};

use actix_web::{
    error::{PayloadError, ResponseError},
    http::StatusCode,
    post,
    web::{self, BytesMut},
    HttpRequest, HttpResponse,
};
use futures::{self, Future, Stream};

#[post("analyze")]
pub fn post_analyze_courses(
    data: web::Data<ServerData>,
    req: HttpRequest,
    payload: web::Payload,
) -> impl Future<Item = HttpResponse, Error = PostCourses2Error> {
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
            Err(err) => PostCourses2Error::from(err).error_response(),
        })
}

#[derive(Fail, Debug)]
pub enum PostCourses2Error {
    #[fail(display = "PostCourses2Error::Payload: {}", _0)]
    Payload(PayloadError),
    #[fail(display = "PostCourses2Error::Decompression: {}", _0)]
    Decompression(DecompressionError),
}

impl From<PayloadError> for PostCourses2Error {
    fn from(err: PayloadError) -> Self {
        PostCourses2Error::Payload(err)
    }
}

impl From<DecompressionError> for PostCourses2Error {
    fn from(err: DecompressionError) -> Self {
        PostCourses2Error::Decompression(err)
    }
}

impl ResponseError for PostCourses2Error {
    fn error_response(&self) -> HttpResponse {
        match *self {
            PostCourses2Error::Payload(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            PostCourses2Error::Decompression(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
        }
    }
}
