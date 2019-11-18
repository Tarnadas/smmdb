use actix_http::{body::Body, Response};
use actix_web::{get, http::StatusCode};

static INDEX: &str = include_str!("../../swagger/index.html");
static SWAGGER: &str = include_str!("../../swagger/swagger.json");

#[get("/")]
pub fn index() -> Response {
    Response::with_body(StatusCode::OK, Body::from_message(INDEX))
}

#[get("/swagger.json")]
pub fn swagger() -> Response {
    Response::with_body(StatusCode::OK, Body::from_message(SWAGGER))
}
