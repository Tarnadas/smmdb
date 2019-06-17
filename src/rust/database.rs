use crate::course::Course;

use mongodb::coll::options::FindOptions;
use mongodb::db::ThreadedDatabase;
use mongodb::{Client, ThreadedClient};

#[derive(Clone)]
pub struct Database {
    client: Client,
}

impl Database {
    pub fn new() -> Self {
        let client = Client::with_uri("mongodb://localhost:27017")
            .expect("Failed to initialize standalone client.");

        // let coll = client.db("test").collection("movies");

        // let doc = doc! {
        //     "title": "Jaws",
        //     "array": [ 1, 2, 3 ],
        // };

        // // Insert document into 'test.movies' collection
        // coll.insert_one(doc.clone(), None)
        //     .ok().expect("Failed to insert document.");

        // // Find the document and receive a cursor
        // let mut cursor = coll.find(Some(doc.clone()), None)
        //     .ok().expect("Failed to execute find.");

        // let item = cursor.next();

        // // cursor.next() returns an Option<Result<Document>>
        // match item {
        //     Some(Ok(doc)) => match doc.get("title") {
        //         Some(&Bson::String(ref title)) => println!("{}", title),
        //         _ => panic!("Expected title to be a string!"),
        //     },
        //     Some(Err(_)) => panic!("Failed to get next from server!"),
        //     None => panic!("Server returned no results!"),
        // }
        Database { client }
    }

    pub fn get_courses(&self) -> String {
        let courses = self.client.db("admin").collection("courses");
        match courses.aggregate(
            vec![doc! {
                "$limit" => 10
            }],
            None,
        ) {
            Ok(cursor) => {
                let course: Vec<Course> = cursor.map(|item| item.unwrap().into()).collect();
                serde_json::to_string(&course).unwrap()
            }
            Err(e) => e.to_string(),
        }
    }
}
