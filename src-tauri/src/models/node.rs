use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Node {
    pub heading: String,
    pub subheading: String,
    pub blocks: Vec<Block>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Block {
    pub id: String,
    pub r#type: String,
    pub content: String,
    pub styles: String,
}
