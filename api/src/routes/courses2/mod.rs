mod delete;
mod get;
mod post;
mod put;

use actix_web::{dev, web};
pub use delete::*;
pub use get::*;
pub use post::*;
pub use put::*;

pub fn service() -> impl dev::HttpServiceFactory {
    web::scope("/courses2")
        .service(get::get_courses)
        .service(put::put_courses)
        .service(post::post_analyze_courses)
        .service(delete::delete_course)
}
