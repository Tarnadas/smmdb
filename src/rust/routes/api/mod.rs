use actix_web::{dev, guard, web, App, HttpResponse};

mod getcourses;

pub fn service() -> impl dev::HttpServiceFactory {
    web::scope("/api/")
        .service(getcourses::get_courses)
        .service(getcourses::get_courses_by_id)
}
