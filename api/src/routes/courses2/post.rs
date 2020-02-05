use crate::server::ServerData;

use cemu_smm::{course2::Course2, errors::DecompressionError, proto::SMM2Course::SMM2Course};

use actix_web::{
    error::{PayloadError, ResponseError},
    http::StatusCode,
    post,
    web::{self},
    HttpRequest, HttpResponse,
};
use futures::{self, StreamExt};

#[post("analyze")]
pub async fn post_analyze_courses(
    _data: web::Data<ServerData>,
    _req: HttpRequest,
    mut payload: web::Payload,
) -> Result<HttpResponse, PostCourses2Error> {
    let mut bytes = web::BytesMut::new();
    while let Some(item) = payload.next().await {
        bytes.extend_from_slice(&item?);
    }
    match Course2::from_packed(&bytes[..]) {
        Ok(courses) => {
            let courses: Vec<SMM2Course> = courses
                .into_iter()
                .map(|course| course.take_course())
                .collect();
            Ok(HttpResponse::Ok().json(courses))
        }
        Err(err) => Ok(PostCourses2Error::from(err).error_response()),
    }
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
