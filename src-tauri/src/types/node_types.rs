use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeBlock {
    pub node_id: String,
    pub node_block_type: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_node_id: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub left_sibling_node_id: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub node_type_content_json: Option<serde_json::Value>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub additional_props: Option<Value>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub node_mentions: Option<Vec<String>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub vector: Option<Vec<f32>>,
}
