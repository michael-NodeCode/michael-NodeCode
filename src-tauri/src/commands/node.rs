use serde_json::Value;
use colored::Colorize;
use tauri::{command, State};
use crate::{
    types::{NodeBlock, Record},
    AppState,
};

#[command]
pub async fn insert_node_blocks(
    state: State<'_, AppState>,
    blocks: Vec<NodeBlock>,
) -> Result<String, String> {
    for block in blocks {
        let existing: Option<crate::types::Record> = state
            .db
            .select(("node_blocks", &block.node_id))
            .await
            .map_err(|e| e.to_string())?;
        println!("[insert_node_blocks] Existing: {:?}", existing);
        if existing.is_some() {
            state
                .db
                .update::<Option<Record>>(("node_blocks", &block.node_id))
                .content(block.clone())
                .await
                .map_err(|e| e.to_string())?;
            println!("[insert_node_blocks] Updated node block with id: {}", block.node_id);
        } else {
            state
                .db
                .create::<Option<Record>>(("node_blocks", &block.node_id))
                .content(block.clone())
                .await
                .map_err(|e| e.to_string())?;
            println!("[insert_node_blocks] Inserted node block with id: {}", block.node_id);
        }
    }
    Ok("Inserted/Updated node blocks successfully.".to_string())
}


#[command]
pub async fn get_all_node_blocks(state: State<'_, AppState>) -> Result<Vec<NodeBlock>, String> {
    let results: Vec<NodeBlock> = state
        .db
        .select("node_blocks")
        .await
        .map_err(|e| e.to_string())?;

    println!(
        "{}",
        "[get_all_node_blocks] Retrieved all node blocks".green()
    );
    Ok(results)
}

#[command]
pub async fn get_all_node_blocks_raw(
    state: State<'_, AppState>
) -> Result<Vec<Value>, String> {
    let results: Vec<Value> = state
        .db
        .select("node_blocks")
        .await
        .map_err(|e| e.to_string())?;

    println!("[get_all_node_blocks] Retrieved all node blocks");
    Ok(results)
}

#[command]
pub async fn get_node_block_by_id(
    state: State<'_, AppState>,
    block_id: String,
) -> Result<Option<NodeBlock>, String> {
    let result: Option<NodeBlock> = state
        .db
        .select(("node_blocks", block_id))
        .await
        .map_err(|e| e.to_string())?;

    println!(
        "{}",
        "[get_node_block_by_id] Retrieved node block by id".green()
    );
    Ok(result)
}

#[command]
pub async fn get_children_of_node(
    state: State<'_, AppState>,
    parent_id: String,
) -> Result<Vec<NodeBlock>, String> {
    let sql = "SELECT * FROM node_blocks WHERE parentNodeId = $parent";
    let mut result = state
        .db
        .query(sql)
        .bind(("parent", parent_id))
        .await
        .map_err(|e| e.to_string())?;

    let blocks: Vec<NodeBlock> = result.take(0).map_err(|e| e.to_string())?;

    println!(
        "{}",
        "[get_children_of_node] Retrieved children of node".green()
    );
    Ok(blocks)
}
