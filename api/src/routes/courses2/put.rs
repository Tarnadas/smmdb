use crate::{
    course2::{Course2Response, Course2SimilarityError, Difficulty},
    server::ServerData,
    Identity,
};

use cemu_smm::errors::DecompressionError;

use actix_web::{
    error::{PayloadError, ResponseError},
    http::StatusCode,
    put,
    web::{self},
    HttpRequest, HttpResponse,
};
use futures::{self, StreamExt};
use serde::{Deserialize, Serialize, Serializer};
use serde_qs::actix::QsQuery;
use std::io;

#[derive(Debug, Deserialize)]
pub struct PutCourses2 {
    difficulty: Option<Difficulty>,
}

#[put("")]
pub async fn put_courses(
    data: web::Data<ServerData>,
    _req: HttpRequest,
    query: QsQuery<PutCourses2>,
    mut payload: web::Payload,
    identity: Identity,
) -> Result<HttpResponse, PutCourses2Error> {
    let query = query.into_inner();
    let mut bytes = web::BytesMut::new();
    while let Some(item) = payload.next().await {
        bytes.extend_from_slice(&item?);
    }
    match cemu_smm::Course2::from_packed(&bytes[..]) {
        Ok(courses) => {
            let account = identity.get_account();
            match data.put_courses2(courses, &account, query.difficulty) {
                Ok(res) => Ok(res.into()),
                Err(_) => Ok(HttpResponse::BadRequest().into()),
            }
        }
        Err(err) => Ok(PutCourses2Error::from(err).error_response()),
    }
}

#[derive(Debug, Fail)]
pub enum PutCourses2Error {
    #[fail(display = "[PutCourses2Error::Course2SimilarityError]: {}", _0)]
    Similarity(Course2SimilarityError),
    #[fail(display = "[PutCourses2Error::IoError]: {}", _0)]
    IoError(io::Error),
    #[fail(display = "[PutCourses2Error::Payload]: {}", _0)]
    Payload(PayloadError),
    #[fail(display = "[PutCourses2Error::Decompression]: {}", _0)]
    Decompression(DecompressionError),
    #[fail(display = "[PutCourses2Error::SerdeJson]: {}", _0)]
    SerdeJson(serde_json::Error),
    #[fail(display = "[PutCourses2Error::ThumbnailMissing]: course is missing thumbnail")]
    ThumbnailMissing,
    #[fail(display = "[PutCourses2Error::Mongo]: {}", _0)]
    Mongo(mongodb::error::Error),
    #[fail(display = "[PutCourses2Error::Compression]: {}", _0)]
    Compression(compression::prelude::CompressionError),
}

impl From<io::Error> for PutCourses2Error {
    fn from(err: io::Error) -> Self {
        PutCourses2Error::IoError(err)
    }
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

impl From<mongodb::error::Error> for PutCourses2Error {
    fn from(err: mongodb::error::Error) -> Self {
        PutCourses2Error::Mongo(err)
    }
}

impl From<compression::prelude::CompressionError> for PutCourses2Error {
    fn from(err: compression::prelude::CompressionError) -> Self {
        PutCourses2Error::Compression(err)
    }
}

impl ResponseError for PutCourses2Error {
    fn error_response(&self) -> HttpResponse {
        match *self {
            PutCourses2Error::IoError(_) => HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR),
            PutCourses2Error::Similarity(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            PutCourses2Error::Payload(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            PutCourses2Error::Decompression(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            PutCourses2Error::SerdeJson(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            PutCourses2Error::ThumbnailMissing => HttpResponse::new(StatusCode::BAD_REQUEST),
            PutCourses2Error::Mongo(_) => HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR),
            PutCourses2Error::Compression(_) => {
                HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR)
            }
        }
    }
}

impl Serialize for PutCourses2Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        if let PutCourses2Error::Similarity(err) = self {
            err.serialize(serializer)
        } else {
            serializer.collect_str(&format!("{}", self))
        }
    }
}

#[derive(Debug, Serialize)]
pub struct PutCourses2Response {
    succeeded: Vec<Course2Response>,
    failed: Vec<PutCourses2Error>,
}

impl PutCourses2Response {
    pub fn new() -> Self {
        PutCourses2Response {
            succeeded: vec![],
            failed: vec![],
        }
    }

    pub fn set_succeeded(&mut self, succeeded: Vec<Course2Response>) {
        self.succeeded = succeeded;
    }

    pub fn add_failed(&mut self, failed: PutCourses2Error) {
        self.failed.push(failed);
    }
}

impl Into<HttpResponse> for PutCourses2Response {
    fn into(self: PutCourses2Response) -> HttpResponse {
        HttpResponse::Ok().json(self)
    }
}
