mod models;
use anyhow::Result;
use serde_json::Value as JsonValue;
use std::collections::BTreeMap;
use tauri::Manager;

#[tauri::command]
fn greet() -> String {
    format!("Hello, Backend Is Up along with DB")
}

#[tauri::command]
fn save_node(
    heading: &str,
    subheading: &str,
    blocks: Vec<JsonValue>,
    db: tauri::State<cozo::DbInstance>,
) -> Result<String, String> {
    println!("Saving node...");

    let mut parameters1 = BTreeMap::new();
    parameters1.insert("id".to_string(), cozo::DataValue::Str(heading.into()));
    parameters1.insert("name".to_string(), cozo::DataValue::Str(heading.into()));

    match db.run_script(
        "
        create headings {
            id: String,
            name: String,
        };
        ?[id, name] <- [[$id, $name]]
        :put headings {id => name}
        ",
        parameters1,
        cozo::ScriptMutability::Mutable,
    ) {
        Ok(_) => println!("Heading '{}' saved successfully.", heading),
        Err(err) => {
            eprintln!("Failed to save heading '{}'. Error: {:?}", heading, err);
            return Err(format!("Failed to save heading: {}", err));
        }
    }

    let subheading_id = format!("{} {}", heading, subheading);

    let subheading_query = format!(
        ":put subheadings {{id: '{}', name: '{}'}}",
        subheading_id, subheading
    );

    match db.run_script(
        &subheading_query,
        Default::default(),
        cozo::ScriptMutability::Mutable,
    ) {
        Ok(_) => println!("Subheading '{}' saved successfully.", subheading),
        Err(err) => {
            eprintln!(
                "Failed to save subheading '{}'. Error: {:?}",
                subheading, err
            );
            return Err(format!("Failed to save subheading: {}", err));
        }
    }

    let heading_to_subheading_query = format!(
        ":put has_subheading {{from: '{}', to: '{}'}}",
        heading, subheading_id
    );

    match db.run_script(
        &heading_to_subheading_query,
        Default::default(),
        cozo::ScriptMutability::Mutable,
    ) {
        Ok(_) => println!("Created 'Heading -> Subheading' relationship successfully."),
        Err(err) => {
            eprintln!(
                "Failed to create 'Heading -> Subheading' relationship. Error: {:?}",
                err
            );
            return Err(format!(
                "Failed to create heading-subheading relationship: {}",
                err
            ));
        }
    }

    let mut list_new_block_ids: Vec<String> = Vec::new();

    for block in blocks {
        let block_id = block["id"].as_str().unwrap_or_default().to_string();
        let content = serde_json::to_string(&block["content"]).unwrap_or_default();
        let block_type = block["type"].as_str().unwrap_or_default().to_string();
        let styles = serde_json::to_string(&block["props"]).unwrap_or_default();

        let insert_block_query = format!(
            ":put blocks {{id: '{}', type: '{}', content: '{}', styles: '{}'}}",
            block_id, block_type, content, styles
        );

        match db.run_script(
            &insert_block_query,
            Default::default(),
            cozo::ScriptMutability::Mutable,
        ) {
            Ok(_) => {
                if !block_id.is_empty() {
                    list_new_block_ids.push(block_id.clone());
                    println!("Inserted block with id '{}'.", block_id);
                } else {
                    println!("Inserted Block ID is empty!");
                }
            }
            Err(err) => {
                eprintln!(
                    "Failed to insert block with id '{}'. Error: {:?}",
                    block_id, err
                );
                return Err(format!("Failed to insert block: {}", err));
            }
        }

        let subheading_to_block_query = format!(
            ":put has_block {{from: '{}', to: '{}'}}",
            subheading_id, block_id
        );

        match db.run_script(
            &subheading_to_block_query,
            Default::default(),
            cozo::ScriptMutability::Mutable,
        ) {
            Ok(_) => println!("Created 'Subheading -> Block' relationship successfully."),
            Err(err) => {
                eprintln!(
                    "Failed to create 'Subheading -> Block' relationship. Error: {:?}",
                    err
                );
                return Err(format!(
                    "Failed to create subheading-block relationship: {}",
                    err
                ));
            }
        }
    }

    if !list_new_block_ids.is_empty() {
        let delete_query = format!(
            ":remove {{ [rel, b] <- (has_block {{from: '{}'}}, blocks {{id: b}}) where not b in {} }}", subheading_id, 
            serde_json::to_string(&list_new_block_ids).unwrap()
        );

        match db.run_script(
            &delete_query,
            Default::default(),
            cozo::ScriptMutability::Mutable,
        ) {
            Ok(_) => println!("Deleted duplicate blocks successfully."),
            Err(err) => {
                eprintln!("Failed to delete blocks. Error: {:?}", err);
                return Err(format!("Failed to delete blocks: {}", err));
            }
        }
    }

    Ok(format!(
        "Node '{}' with subheading '{}' and blocks saved/updated successfully!",
        heading, subheading
    ))
}

// #[tauri::command]
// fn get_node(heading: &str, subheading: &str, db: State<Database>) -> Result<String, String> {
//     println!("Fetching nodes ...");

//     let conn = Connection::new(&db).expect("Failed to create connection");

//     let subheading_id = format!("{} {}", heading, subheading);

//     let block_query = format!(
//         "MATCH (h:Headings)-[:HAS_SUBHEADING]->(s:Subheadings)-[:HAS_BLOCK]->(b:Blocks)
//          WHERE s.id = '{}'
//          RETURN b.id AS block_id, b.type AS block_type, b.content AS block_content, b.styles AS block_styles",
//         subheading_id
//     );
//     let result = match conn.query(&block_query) {
//         Ok(res) => res,
//         Err(err) => {
//             println!("Error executing query: {}", err);
//             return Err(format!("Query execution failed: {}", err));
//         }
//     };

//     let mut blocks = vec![];

//     for row in result.into_iter() {
//         let block_id = row
//             .get(0)
//             .and_then(|value| {
//                 if let kuzu::Value::String(id) = value {
//                     Some(id.clone())
//                 } else {
//                     None
//                 }
//             })
//             .unwrap_or_default();

//         let block_type = row
//             .get(1)
//             .and_then(|value| {
//                 if let kuzu::Value::String(block_type) = value {
//                     Some(block_type.clone())
//                 } else {
//                     None
//                 }
//             })
//             .unwrap_or_default();

//         let block_content = row
//             .get(2)
//             .and_then(|value| {
//                 if let kuzu::Value::String(content) = value {
//                     Some(content.clone())
//                 } else {
//                     None
//                 }
//             })
//             .unwrap_or_default();

//         let block_styles = row
//             .get(3)
//             .and_then(|value| {
//                 if let kuzu::Value::String(styles) = value {
//                     Some(styles.clone())
//                 } else {
//                     None
//                 }
//             })
//             .unwrap_or_default();

//         let block = json!({
//             "block_id": block_id,
//             "block_type": block_type,
//             "block_content": block_content,
//             "block_styles": block_styles
//         });

//         blocks.push(block);
//     }

//     Ok(json!({
//         "heading": heading,
//         "subheading": subheading,
//         "blocks": blocks
//     })
//     .to_string())
// }

pub fn run(db: cozo::DbInstance) {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, save_node])
        .setup(|app| {
            app.manage(db);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
