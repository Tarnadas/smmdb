use actix_http::{body::Body, Response};
use actix_web::{get, http::StatusCode};

static INDEX: &str = include_str!("../../swagger/index.html");
static SWAGGER: &str = include_str!("../../swagger/swagger.json");

#[get("/")]
pub fn index() -> Response {
    let mut res = Response::with_body(StatusCode::OK, Body::from_message(INDEX));
    res
}

#[get("/swagger.json")]
pub fn swagger() -> Response {
    let mut res = Response::with_body(StatusCode::OK, Body::from_message(SWAGGER));
    res
}
