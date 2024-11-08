mod models;

use kuzu::{Connection, Database};
use models::node::{Block, Node};
use serde_json::Value as JsonValue;
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
    let conn = Connection::new(&db).expect("Failed to create connection");

    let heading_query = format!(
        "MERGE INTO headings (id, name) VALUES ('{}', '{}')",
        heading, heading
    );
    conn.query(&heading_query).map_err(|e| e.to_string())?;

    let subheading_id = format!("{} {}", heading, subheading);
    let subheading_query = format!(
        "MERGE INTO subheadings (id, name) VALUES ('{}', '{}')",
        subheading_id, subheading
    );
    conn.query(&subheading_query).map_err(|e| e.to_string())?;

    let heading_to_subheading = format!(
        "INSERT INTO has_subheading (FROM, TO) VALUES ('{}', '{}')",
        heading, subheading_id
    );
    conn.query(&heading_to_subheading)
        .map_err(|e| e.to_string())?;

    for block in blocks {
        let block_id = block["id"].as_str().unwrap_or_default().to_string();
        let content = serde_json::to_string(&block["content"]).unwrap_or_default();
        let block_type = block["type"].as_str().unwrap_or_default().to_string();
        let styles = serde_json::to_string(&block["props"]).unwrap_or_default();

        let block_query = format!(
            "MERGE INTO blocks (id, type, content, styles) VALUES ('{}', '{}', '{}', '{}')",
            block_id, block_type, content, styles
        );
        conn.query(&block_query).map_err(|e| e.to_string())?;

        let subheading_to_block = format!(
            "INSERT INTO has_block (FROM, TO) VALUES ('{}', '{}')",
            subheading_id, block_id
        );
        conn.query(&subheading_to_block)
            .map_err(|e| e.to_string())?;
    }

    Ok(format!(
        "Node '{}' with subheading '{}' and blocks saved successfully!",
        heading, subheading
    ))
}

#[tauri::command]
fn get_node(heading: &str, subheading: &str, db: State<Database>) -> Result<Node, String> {
    let conn = Connection::new(&db).expect("Failed to create connection");

    let subheading_id = format!("{} {}", heading, subheading);

    let block_query = format!(
        "MATCH (h:Heading)-[:HAS_SUBHEADING]->(s:Subheading)-[:HAS_BLOCK]->(b:Block) WHERE s.id = '{}' RETURN b.id, b.type, b.content, b.styles",
        subheading_id
    );

    let mut blocks = Vec::new();

    let result = conn.query(&block_query).map_err(|e| e.to_string())?;

    for row in result {
        let block = Block {
            id: row[0].to_string(),
            r#type: row[1].to_string(),
            content: row[2].to_string(),
            styles: row[3].to_string(),
        };
        blocks.push(block);
    }

    Ok(Node {
        heading: heading.to_string(),
        subheading: subheading.to_string(),
        blocks,
    })
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
