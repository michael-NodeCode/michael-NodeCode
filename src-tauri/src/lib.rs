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
    println!(
        "Saving node with heading: '{}' and subheading: '{}'",
        heading, subheading
    );

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

    // let query = "MATCH (b:blocks) RETURN b.id";
    // let result = conn.query(query);
    // let existing_block_ids: Vec<String> = match result {
    //     Ok(query_result) => query_result
    //         .into_iter()
    //         .filter_map(|row| {
    //             if let Some(id_value) = row.get(0) {
    //                 if let kuzu::Value::String(id) = id_value {
    //                     Some(id.clone())
    //                 } else {
    //                     None
    //                 }
    //             } else {
    //                 None
    //             }
    //         })
    //         .collect(),
    //     Err(e) => {
    //         println!("Error querying block IDs: {}", e);
    //         return Err(e.to_string());
    //     }
    // };

    // println!("existing_block_ids-> {:?}", existing_block_ids);
    // println!("blocks-> {:?}", blocks);

    for block in blocks.clone() {
        print!("current block-> {:?}", block);

        let block_value: JsonValue =
            serde_json::from_str(&block.as_str().unwrap()).unwrap_or_default();

        println!("block_value-> {:?}", block_value);

        let block_id = block_value["id"].as_str().unwrap_or_default().to_string();
        let content = serde_json::to_string(&block_value["content"]).unwrap_or_default();
        let block_type = block_value["type"].as_str().unwrap_or_default().to_string();
        let styles = serde_json::to_string(&block_value["props"]).unwrap_or_default();

        println!("Block ID: {}", block_id);
        println!("Block Content: {}", content);
        println!("Block Type: {}", block_type);
        println!("Block Styles: {}", styles);

        // if existing_block_ids.contains(&block_id) {
        //     let update_query = format!(
        //         "MATCH (b:blocks {{id: '{}'}}) SET b.type = '{}', b.content = '{}', b.styles = '{}'",
        //         block_id, block_type, content, styles
        //     );
        //     match conn.query(&update_query) {
        //         Ok(_) => println!("Updated block with id '{}'.", block_id),
        //         Err(e) => {
        //             println!(
        //                 "Failed to update block with id '{}'. Error: {}",
        //                 block_id, e
        //             );
        //             return Err(e.to_string());
        //         }
        //     }
        // } else {
        // }
        let insert_query = format!(
            "MERGE (b:blocks {{id: '{}'}}) ON CREATE SET b.type = '{}', b.content = '{}', b.styles = '{}' 
             ON MATCH SET b.type = '{}', b.content = '{}', b.styles = '{}'",
            block_id, block_type, content, styles, block_type, content, styles
        );
        match conn.query(&insert_query) {
            Ok(_) => println!("Inserted block with id '{}'.", block_id),
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

    // for existing_id in existing_block_ids {
    //     if !blocks.iter().any(|b| b["id"].as_str() == Some(&existing_id)) {
    //         // Delete block if it's not in the new list
    //         let delete_block_query = format!(
    //             "MATCH (b:blocks {{id: '{}'}}) DETACH DELETE b",
    //             existing_id
    //         );
    //         match conn.query(&delete_block_query) {
    //             Ok(_) => {
    //                 println!("Deleted block with id '{}'.", existing_id);
    //             }
    //             Err(e) => {
    //                 println!(
    //                     "Failed to delete block with id '{}'. Error: {}",
    //                     existing_id, e
    //                 );
    //                 return Err(e.to_string());
    //             }
    //         }
    //     }
    // }

    Ok(format!(
        "Node '{}' with subheading '{}' and blocks saved/updated successfully!",
        heading, subheading
    ))
}

#[tauri::command]
fn get_node(heading: &str, subheading: &str, db: State<Database>) -> Result<String, String> {
    println!(
        "Fetching node for Heading: '{}' and Subheading: '{}'",
        heading, subheading
    );

    let conn = Connection::new(&db).expect("Failed to create connection");

    let subheading_id = format!("{} {}", heading, subheading);
    print!("Constructed Subheading ID: '{}'", subheading_id);

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
    println!("Query executed successfully");

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

    println!("Processed blocks: {:?}", blocks);

    print!("Returning response: {:?}", json!({
        "heading": heading,
        "subheading": subheading,
        "blocks": blocks
    }));

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
