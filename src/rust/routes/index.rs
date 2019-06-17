use actix_web::get;

#[get("/")]
pub fn index() -> &'static str {
    "Hello world!\r\n"
}
