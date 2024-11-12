mod models;

use kuzu::{Connection, Database};
// use models::node::{Block, Node};
use serde_json::{json, Value as JsonValue};
use tauri::{Manager, State};

#[tauri::command]
fn greet() -> String {
    format!("Hello, Backend Is Up along with DB")
}

#[tauri::command]
fn save_node(
    heading: &str,
    subheading: &str,
    blocks: Vec<JsonValue>,
    db: State<Database>,
) -> Result<String, String> {
    println!("Saving node ...");

    let conn = Connection::new(&db).expect("Failed to create connection");

    let heading_query = format!(
        "MERGE (n:Headings {{id: '{}'}}) SET n.name = '{}'",
        heading, heading
    );

    match conn.query(&heading_query) {
        Ok(_) => println!("'Heading Node' with name '{}' saved successfully.", heading),
        Err(err) => {
            eprintln!(
                "Failed to store 'Heading Node' with name '{}'. Error: {:?}",
                heading, err
            );
            return Err(err.to_string());
        }
    }

    let subheading_id = format!("{} {}", heading, subheading);

    let subheading_query = format!(
        "MERGE (n:Subheadings {{id: '{}'}}) SET n.name = '{}'",
        subheading_id, subheading
    );

    match conn.query(&subheading_query) {
        Ok(_) => println!(
            "'Sub Heading Node' with subheading '{}' stored successfully.",
            subheading
        ),
        Err(e) => {
            println!(
                "Failed to store 'Sub Heading Node' with subheading '{}'. Error: {}",
                subheading, e
            );
            return Err(e.to_string());
        }
    }

    let heading_to_subheading = format!(
        "MERGE (h:Headings {{id: '{}'}}) MERGE (s:Subheadings {{id: '{}'}}) MERGE (h)-[:HAS_SUBHEADING]->(s)",
        heading, subheading_id
    );

    match conn.query(&heading_to_subheading) {
        Ok(_) => println!("Created relationship 'Heading -> Subheading' successfully."),
        Err(e) => {
            println!(
                "Failed to create relationship 'Heading -> Subheading'. Error: {}",
                e
            );
            return Err(e.to_string());
        }
    }

    let mut list_new_block_ids: Vec<String> = vec![];

    for block in blocks.clone() {
        let block_value: JsonValue =
            serde_json::from_str(&block.as_str().unwrap()).unwrap_or_default();

        let block_id = block_value["id"].as_str().unwrap_or_default().to_string();
        let content = serde_json::to_string(&block_value["content"]).unwrap_or_default();
        let block_type = block_value["type"].as_str().unwrap_or_default().to_string();
        let styles = serde_json::to_string(&block_value["props"]).unwrap_or_default();

        let insert_query = format!(
            "MERGE (b:blocks {{id: '{}'}}) ON CREATE SET b.type = '{}', b.content = '{}', b.styles = '{}' 
             ON MATCH SET b.type = '{}', b.content = '{}', b.styles = '{}'",
            block_id, block_type, content, styles, block_type, content, styles
        );
        match conn.query(&insert_query) {
            Ok(_) => {
                if block_id.clone() == "" {
                    println!("Inserted Block ID is empty!");
                } else {
                    list_new_block_ids.push(block_id.clone());
                    println!("Inserted block with id '{}'.", block_id);
                }
            }
            Err(e) => {
                println!(
                    "Failed to insert block with id '{}'. Error: {}",
                    block_id, e
                );
                return Err(e.to_string());
            }
        }

        let subheading_to_block = format!(
            "MATCH (s:Subheadings {{id: '{}'}}), (b:blocks {{id: '{}'}}) \
             MERGE (s)-[r:HAS_BLOCK]->(b)",
            subheading_id, block_id
        );
        match conn.query(&subheading_to_block) {
            Ok(_) => println!("Created relationship 'Subheading -> Block' successfully."),
            Err(e) => {
                println!(
                    "Failed to create relationship 'Subheading -> Block'. Error: {}",
                    e
                );
                return Err(e.to_string());
            }
        }
    }

    let delete_query = format!(
        "MATCH (s:Subheadings {{id: '{}'}})-[r:HAS_BLOCK]->(b:blocks) WHERE NOT b.id IN {:?} DELETE r, b",
        subheading_id, list_new_block_ids
    );
    match conn.query(&delete_query) {
        Ok(_) => println!("Deleted duplicate blocks successfully."),
        Err(e) => {
            println!("Failed to delete blocks. Error: {}", e);
            return Err(e.to_string());
        }
    }

    Ok(format!(
        "Node '{}' with subheading '{}' and blocks saved/updated successfully!",
        heading, subheading
    ))
}

#[tauri::command]
fn get_node(heading: &str, subheading: &str, db: State<Database>) -> Result<String, String> {
    println!("Fetching nodes ...");

    let conn = Connection::new(&db).expect("Failed to create connection");

    let subheading_id = format!("{} {}", heading, subheading);

    let block_query = format!(
        "MATCH (h:Headings)-[:HAS_SUBHEADING]->(s:Subheadings)-[:HAS_BLOCK]->(b:Blocks) 
         WHERE s.id = '{}' 
         RETURN b.id AS block_id, b.type AS block_type, b.content AS block_content, b.styles AS block_styles",
        subheading_id
    );
    let result = match conn.query(&block_query) {
        Ok(res) => res,
        Err(err) => {
            println!("Error executing query: {}", err);
            return Err(format!("Query execution failed: {}", err));
        }
    };

    let mut blocks = vec![];

    for row in result.into_iter() {
        let block_id = row
            .get(0)
            .and_then(|value| {
                if let kuzu::Value::String(id) = value {
                    Some(id.clone())
                } else {
                    None
                }
            })
            .unwrap_or_default();

        let block_type = row
            .get(1)
            .and_then(|value| {
                if let kuzu::Value::String(block_type) = value {
                    Some(block_type.clone())
                } else {
                    None
                }
            })
            .unwrap_or_default();

        let block_content = row
            .get(2)
            .and_then(|value| {
                if let kuzu::Value::String(content) = value {
                    Some(content.clone())
                } else {
                    None
                }
            })
            .unwrap_or_default();

        let block_styles = row
            .get(3)
            .and_then(|value| {
                if let kuzu::Value::String(styles) = value {
                    Some(styles.clone())
                } else {
                    None
                }
            })
            .unwrap_or_default();

        let block = json!({
            "block_id": block_id,
            "block_type": block_type,
            "block_content": block_content,
            "block_styles": block_styles
        });

        blocks.push(block);
    }

    Ok(json!({
        "heading": heading,
        "subheading": subheading,
        "blocks": blocks
    })
    .to_string())
}

pub fn run(db: Database) {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, save_node, get_node])
        .setup(|app| {
            app.manage(db);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
