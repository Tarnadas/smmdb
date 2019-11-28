mod delete;
pub mod download;
mod get;
pub mod meta;
mod post;
mod put;
pub mod thumbnail;

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
        .service(download::download_course)
        .service(thumbnail::get_thumbnail)
        .service(meta::post_meta)
}
