use crate::server::ServerData;
use crate::Database;

use actix_web::{error::ResponseError, get, http::StatusCode, web, HttpRequest, HttpResponse};
use mongodb::{oid::ObjectId, ordered::OrderedDocument, Bson};
use serde::{de, Deserialize, Deserializer};
use serde_qs::actix::QsQuery;

#[get("")]
pub fn get_courses(
    data: web::Data<ServerData>,
    query: QsQuery<GetCourses2>,
    req: HttpRequest,
) -> Result<String, GetCourses2Error> {
    data.get_courses2(query.into_inner())
}

#[derive(Deserialize, Debug)]
pub struct GetCourses2 {
    #[serde(default)]
    limit: Limit,
    skip: Option<u32>,
    id: Option<String>,
    ids: Option<Vec<String>>,
    title: Option<String>,
    owner: Option<String>,
    uploader: Option<String>,
    sort: Option<Vec<Sort>>,
}

impl GetCourses2 {
    pub fn into_ordered_document(
        self,
        database: &Database,
    ) -> Result<Vec<OrderedDocument>, GetCourses2Error> {
        let mut pipeline = vec![];

        if let Some(pipeline_match) = self.get_match(database)? {
            pipeline.push(doc! { "$match" => pipeline_match });
        }

        pipeline.push(self.get_sort_doc());

        let limit = self.get_limit();
        pipeline.push(doc! {
            "$limit" => limit
        });

        if let Some(skip) = self.skip {
            pipeline.push(doc! {
                "$skip" => skip
            });
        }

        Ok(pipeline)
    }

    fn get_match(&self, database: &Database) -> Result<Option<OrderedDocument>, GetCourses2Error> {
        let mut res = doc! {};
        if let Some(id) = &self.id {
            GetCourses2::insert_objectid(&mut res, "_id".to_string(), id)?;
        }

        if let Some(ids) = self.ids.clone() {
            let ids: Vec<Bson> = ids
                .iter()
                .map(|id| -> Result<Bson, GetCourses2Error> {
                    let object_id = ObjectId::with_string(id)
                        .map_err(|_| GetCourses2Error::DeserializeError("ids".to_string()))?;
                    Ok(Bson::ObjectId(object_id))
                })
                .filter_map(Result::ok)
                .collect();
            res.insert_bson(
                "_id".to_string(),
                Bson::Document(doc! {
                    "$in" => ids
                }),
            );
        }

        if let Some(title) = self.title.clone() {
            GetCourses2::insert_regexp(&mut res, "title".to_string(), title);
        }

        if let Some(owner) = &self.owner {
            GetCourses2::insert_objectid(&mut res, "owner".to_string(), owner)?;
        }

        if let Some(uploader) = &self.uploader {
            let filter = doc! {
                "username" => Bson::RegExp(format!("^{}$", uploader), "i".to_string())
            };
            match database.find_account(filter) {
                Some(account) => {
                    res.insert_bson("owner".to_string(), Bson::ObjectId(account.get_id()));
                }
                None => return Err(GetCourses2Error::UploaderUnknown(uploader.clone())),
            };
        }

        if res.is_empty() {
            Ok(None)
        } else {
            Ok(Some(res))
        }
    }

    fn get_sort_doc(&self) -> OrderedDocument {
        let mut query = OrderedDocument::new();
        for sort in self.get_sort() {
            query.insert(sort.val, sort.dir);
        }
        doc! {
            "$sort" => query
        }
    }

    fn get_sort(&self) -> Vec<Sort> {
        if self.sort.is_some() {
            self.sort.clone().unwrap()
        } else {
            vec![Sort::default()]
        }
    }

    fn get_limit(&self) -> u32 {
        self.limit.0 + self.skip.unwrap_or_default()
    }

    fn insert_regexp(doc: &mut OrderedDocument, key: String, regexp: String) {
        doc.insert_bson(
            key,
            Bson::RegExp(format!(".*{}.*", regexp), "i".to_string()),
        );
    }

    fn insert_objectid(
        doc: &mut OrderedDocument,
        key: String,
        oid: &str,
    ) -> Result<(), GetCourses2Error> {
        doc.insert_bson(
            key.clone(),
            Bson::ObjectId(
                ObjectId::with_string(oid).map_err(|_| GetCourses2Error::DeserializeError(key))?,
            ),
        );
        Ok(())
    }
}

#[derive(Deserialize, Debug)]
struct Limit(#[serde(deserialize_with = "deserialize_limit")] u32);

impl Default for Limit {
    fn default() -> Limit {
        Limit(120)
    }
}

fn deserialize_limit<'de, D>(de: D) -> Result<u32, D::Error>
where
    D: Deserializer<'de>,
{
    let val = u32::deserialize(de)?;
    if val == 0 {
        Err(de::Error::invalid_value(
            de::Unexpected::Unsigned(val.into()),
            &"limit must be at least 1",
        ))
    } else if val > 120 {
        Err(de::Error::invalid_value(
            de::Unexpected::Unsigned(val.into()),
            &"limit must be at most 120",
        ))
    } else {
        Ok(val)
    }
}

#[derive(Clone, Deserialize, Debug)]
struct Sort {
    val: String,
    #[serde(deserialize_with = "deserialize_dir")]
    dir: i32,
}

impl Default for Sort {
    fn default() -> Self {
        Sort {
            val: "last_modified".to_string(),
            dir: -1,
        }
    }
}

fn deserialize_dir<'de, D>(de: D) -> Result<i32, D::Error>
where
    D: Deserializer<'de>,
{
    let val = i32::deserialize(de)?;
    if val != -1 && val != 1 {
        Err(de::Error::invalid_value(
            de::Unexpected::Signed(val.into()),
            &"sort direction must either be -1 or 1",
        ))
    } else {
        Ok(val)
    }
}

#[derive(Fail, Debug)]
pub enum GetCourses2Error {
    #[fail(display = "could not deserialize {} from hex string", _0)]
    DeserializeError(String),
    #[fail(display = "uploader with name {} unknown", _0)]
    UploaderUnknown(String),
    #[fail(display = "[PutCourses2Error::SerdeJson]: {}", _0)]
    SerdeJson(serde_json::Error),
    #[fail(display = "[GetCourses2Error::Mongo]: {}", _0)]
    Mongo(mongodb::Error),
}

impl From<serde_json::Error> for GetCourses2Error {
    fn from(err: serde_json::Error) -> Self {
        GetCourses2Error::SerdeJson(err)
    }
}

impl From<mongodb::Error> for GetCourses2Error {
    fn from(err: mongodb::Error) -> Self {
        GetCourses2Error::Mongo(err)
    }
}

impl ResponseError for GetCourses2Error {
    fn error_response(&self) -> HttpResponse {
        match *self {
            GetCourses2Error::DeserializeError(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            GetCourses2Error::UploaderUnknown(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            GetCourses2Error::SerdeJson(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            GetCourses2Error::Mongo(_) => HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR),
        }
    }
}
