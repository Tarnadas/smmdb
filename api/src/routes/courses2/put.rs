use crate::server::ServerData;
use crate::Database;

use actix_web::{error, http::StatusCode, put, web, Error, HttpRequest, HttpResponse};
use futures::{future::result, Future, Stream};

#[put("")]
pub fn put_courses(
    data: web::Data<ServerData>,
    req: HttpRequest,
    payload: web::Payload,
) -> impl Future<Item = HttpResponse, Error = Error> {
    // data.get_courses2(query.into_inner())
    payload
        .from_err()
        .fold((), |_, chunk| {
            println!("Chunk: {:?}", chunk);
            result::<_, error::PayloadError>(Ok(()))
        })
        .map(|a| {
            dbg!(a);
            HttpResponse::Ok().into()
        })
    // Ok("".to_owned())
}

// #[derive(Debug, Display)]
// enum PutCourses2Error {}

// impl ResponseError for PutCourses2Error {
//     fn error_response(&self) -> HttpResponse {
//         match *self {
//             _ => HttpResponse::new(StatusCode::BAD_REQUEST),
//         }
//     }
// }
