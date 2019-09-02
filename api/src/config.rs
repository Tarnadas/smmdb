use std::env;

pub fn get_google_client_id() -> String {
    match env::var("GOOGLE_CLIENT_ID") {
        Ok(google_id) => google_id,
        Err(_) => {
            panic!();
        }
    }
}
