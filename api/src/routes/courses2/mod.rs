mod get;
mod put;

use actix_web::{dev, web};
pub use get::*;
pub use put::*;

pub fn service() -> impl dev::HttpServiceFactory {
    web::scope("/courses2")
        .service(get::get_courses)
        .service(put::put_courses)
}
