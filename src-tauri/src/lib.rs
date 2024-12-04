use rusqlite::Connection;
use serde_json::{json, Value as JsonValue};
use std::sync::{Arc, Mutex};
use tauri::Manager;

#[tauri::command]
fn greet() -> String {
    "Hello, Backend Is Up along with DB".to_string()
}

#[tauri::command]
fn save_node(
    heading: &str,
    subheading: &str,
    blocks: Vec<JsonValue>,
    db: tauri::State<Arc<Mutex<rusqlite::Connection>>>,
) -> Result<String, String> {
    println!("Saving node ...");

    let mut conn = db.lock().map_err(|e| e.to_string())?;

    let tx = conn.transaction().map_err(|e| {
        println!("Failed to start transaction: {}", e);
        e.to_string()
    })?;

    if let Err(e) = tx.execute(
        "INSERT INTO headings (id, name) VALUES (?1, ?2)
        ON CONFLICT(id) DO UPDATE SET name = excluded.name",
        &[heading, heading],
    ) {
        println!("Error saving heading '{}': {}", heading, e);
        return Err(format!("Failed to save heading: {}", e));
    } else {
        println!("Heading '{}' saved successfully.", heading);
    }

    let subheading_id = format!("{} {}", heading, subheading);
    if let Err(e) = tx.execute(
        "INSERT INTO subheadings (id, name) VALUES (?1, ?2)
        ON CONFLICT(id) DO UPDATE SET name = excluded.name",
        &[&subheading_id, subheading],
    ) {
        println!("Error saving subheading '{}': {}", subheading, e);
        return Err(format!("Failed to save subheading: {}", e));
    } else {
        println!("Subheading '{}' saved successfully.", subheading);
    }

    if let Err(e) = tx.execute(
        "INSERT INTO has_subheading (heading_id, subheading_id) VALUES (?1, ?2)
        ON CONFLICT(heading_id, subheading_id) DO NOTHING",
        &[heading, &subheading_id],
    ) {
        println!(
            "Error linking heading '{}' to subheading '{}': {}",
            heading, subheading, e
        );
        return Err(format!("Failed to link heading to subheading: {}", e));
    } else {
        println!(
            "Linked heading '{}' to subheading '{}'.",
            heading, subheading
        );
    }

    let mut new_block_ids = vec![];
    for block in blocks.clone() {
        let block_value: JsonValue =
            serde_json::from_str(&block.as_str().unwrap()).unwrap_or_default();

        let block_id = block_value["id"].as_str().unwrap_or_default().to_string();
        let content = serde_json::to_string(&block_value["content"]).unwrap_or_default();
        let block_type = block_value["type"].as_str().unwrap_or_default().to_string();
        let styles = serde_json::to_string(&block_value["props"]).unwrap_or_default();

        if let Err(e) = tx.execute(
            "INSERT INTO blocks (id, type, content, styles) VALUES (?1, ?2, ?3, ?4)
            ON CONFLICT(id) DO UPDATE SET type = excluded.type, content = excluded.content, styles = excluded.styles",
            [block_id.clone(), block_type, content, styles],
        ) {
            println!("Error saving block '{}': {}", block_id, e);
            return Err(format!("Failed to save block: {}", e));
        } else {
            println!("Block '{}' saved successfully.", block_id);
        }

        new_block_ids.push(block_id.to_string());

        if let Err(e) = tx.execute(
            "INSERT INTO has_block (subheading_id, block_id) VALUES (?1, ?2)
            ON CONFLICT(subheading_id, block_id) DO NOTHING",
            [&subheading_id, &block_id],
        ) {
            println!(
                "Error linking subheading '{}' to block '{}': {}",
                subheading_id, block_id, e
            );
            return Err(format!("Failed to link subheading to block: {}", e));
        } else {
            println!(
                "Linked subheading '{}' to block '{}'.",
                subheading_id, block_id
            );
        }
    }

    let delete_orphans_query = format!(
        "DELETE FROM has_block WHERE block_id IN (
            SELECT b.id FROM Blocks b
            LEFT JOIN has_block sb ON b.id = sb.block_id
            WHERE sb.block_id IS NULL AND b.id NOT IN ({})
        )",
        new_block_ids
            .iter()
            .map(|id| format!("'{}'", id))
            .collect::<Vec<_>>()
            .join(", ")
    );

    tx.execute(&delete_orphans_query, [])
        .map_err(|e| format!("Failed to delete orphaned block references: {}", e))?;
    let delete_blocks_query = format!(
        "DELETE FROM Blocks WHERE id IN (
            SELECT b.id FROM Blocks b
            LEFT JOIN has_block sb ON b.id = sb.block_id
            WHERE sb.block_id IS NULL AND b.id NOT IN ({})
        )",
        new_block_ids
            .iter()
            .map(|id| format!("'{}'", id))
            .collect::<Vec<_>>()
            .join(", ")
    );

    tx.execute(&delete_blocks_query, [])
        .map_err(|e| format!("Failed to delete orphaned blocks: {}", e))?;
    if let Err(e) = tx.execute(&delete_blocks_query, []) {
        println!("Error deleting orphaned blocks: {}", e);
        return Err(format!("Failed to delete orphaned blocks: {}", e));
    } else {
        println!("Orphaned blocks deleted successfully.");
    }

    if let Err(e) = tx.commit() {
        println!("Error committing transaction: {}", e);
        return Err(format!("Failed to commit transaction: {}", e));
    }

    println!(
        "Node '{}' saved successfully with subheading '{}'.",
        heading, subheading
    );

    Ok(format!(
        "Node '{}' with subheading '{}' and blocks saved successfully!",
        heading, subheading
    ))
}

#[tauri::command]
fn get_node(
    heading: &str,
    subheading: &str,
    db: tauri::State<Arc<Mutex<rusqlite::Connection>>>,
) -> Result<String, String> {
    println!("Fetching nodes ...");

    let conn = db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

    let subheading_id = format!("{} {}", heading, subheading);

    let mut stmt = conn
        .prepare(
            "SELECT b.id, b.type, b.content, b.styles
            FROM headings h
            JOIN has_subheading hs ON h.id = hs.heading_id
            JOIN subheadings s ON hs.subheading_id = s.id
            JOIN has_block sb ON s.id = sb.subheading_id
            JOIN blocks b ON sb.block_id = b.id
            WHERE s.id = ?1",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let blocks = stmt
        .query_map([&subheading_id], |row| {
            Ok(json!({
                "block_id": row.get::<_, String>(0)?,
                "block_type": row.get::<_, String>(1)?,
                "block_content": row.get::<_, String>(2)?,
                "block_styles": row.get::<_, String>(3)?
            }))
        })
        .map_err(|e| format!("Failed to fetch blocks: {}", e))?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();

    if blocks.is_empty() {
        println!(
            "No blocks found for heading '{}' and subheading '{}'.",
            heading, subheading
        );
        return Ok(json!({
            "heading": heading,
            "subheading": subheading,
            "blocks": []
        })
        .to_string());
    }

    let response = json!({
        "heading": heading,
        "subheading": subheading,
        "blocks": blocks
    });

    println!(
        "Successfully fetched {} blocks for heading '{}' and subheading '{}'.",
        blocks.len(),
        heading,
        subheading
    );

    Ok(response.to_string())
}

pub fn run(db: Arc<Mutex<Connection>>) {
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
