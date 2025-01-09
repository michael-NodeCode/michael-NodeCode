use serde::{Deserialize, Serialize};
use surrealdb::RecordId;

#[derive(Debug, Serialize, Deserialize)]
pub struct Name<'a> {
    pub first: &'a str,
    pub last: &'a str,
}

#[derive(Debug, Serialize)]
#[derive(serde::Deserialize)]
pub struct Person<'a> {
    pub title: &'a str,
    pub name: Name<'a>,
    pub marketing: bool,
}


#[derive(Debug, Serialize)]
pub struct Responsibility {
    pub marketing: bool,
}

#[derive(Debug, Deserialize)]
pub struct Record {
    #[allow(dead_code)]
    pub id: RecordId,
}