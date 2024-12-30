use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::Manager;

#[tauri::command]
fn greet() -> String {
    "Hello, Backend Is Up along with DB".to_string()
}

#[derive(Serialize, Deserialize)]
struct Blob {
    key: String,
    value: Vec<u8>,
}

lazy_static::lazy_static! {
    static ref DB_CONN: Mutex<Connection> = Mutex::new(Connection::open("data.db").unwrap());
}

#[tauri::command]
fn init_db() -> Result<(), String> {
    print!("Initializing DB");
    let conn = DB_CONN.lock().unwrap();
    conn.execute(
        "CREATE TABLE IF NOT EXISTS blobs (
            key TEXT PRIMARY KEY,
            value BLOB
        )",
        [],
    )
    .map_err(|e| e.to_string())?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS updates (
      update_id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id TEXT,
      update_data BLOB,
      FOREIGN KEY (doc_id) REFERENCES docs(doc_id)
    )",
        [],
    )
    .map_err(|e| e.to_string())?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS docs (
      doc_id TEXT PRIMARY KEY,
      root_doc_id TEXT,
      FOREIGN KEY (root_doc_id) REFERENCES docs(doc_id)
    )",
        [],
    )
    .map_err(|e| e.to_string())?;
    print!("DB Initialized");
    Ok(())
}

#[tauri::command]
fn insert_blob(key: String, value: Vec<u8>) -> Result<(), String> {
    print!("Inserting Blob");
    let conn = DB_CONN.lock().unwrap();
    conn.execute(
        "INSERT OR REPLACE INTO blobs (key, value) VALUES (?1, ?2)",
        [&key as &dyn rusqlite::ToSql, &value as &dyn rusqlite::ToSql],
    )
    .map_err(|e| e.to_string())?;
    print!("Blob Inserted");
    Ok(())
}

#[tauri::command]
fn insert_root(db_id: String, doc_id: String) -> Result<(), String> {
    print!("Inserting Root{:?}", db_id);

    let conn = DB_CONN.lock().unwrap();
    let count: i32 = conn
        .query_row("SELECT COUNT(*) FROM docs WHERE doc_id = ?1", [&doc_id], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    if count == 0 {
        conn.execute(
            "INSERT INTO docs (doc_id, root_doc_id) VALUES (?1, NULL)",
            [&doc_id as &dyn rusqlite::ToSql],
        )
        .map_err(|e| e.to_string())?;
        print!("Root Inserted");
    } else {
        print!("Root already exists");
    }
    Ok(())
}


#[tauri::command]
fn insert_update(db_id: String, doc_id: String, update: Vec<u8>) -> Result<(), String> {
    print!("Inserting Update {:?}", db_id);
    let conn = DB_CONN.lock().unwrap();

    let count: i32 = conn
        .query_row("SELECT COUNT(*) FROM docs WHERE doc_id = ?1", [doc_id.clone()], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    if count == 0 {
        return Err("Document does not exist".to_string());
    }

    conn.execute(
        "INSERT INTO updates (doc_id, update_data) VALUES (?1, ?2)",
        [
            &doc_id as &dyn rusqlite::ToSql,
            &update as &dyn rusqlite::ToSql,
        ],
    )
    .map_err(|e| e.to_string())?;

    print!("Update Inserted");
    Ok(())
}


#[tauri::command]
fn get_blob(key: String) -> Result<Vec<u8>, String> {
    print!("Getting Blob");
    let conn = DB_CONN.lock().unwrap();
    conn.query_row("SELECT value FROM blobs WHERE key = ?1", [key], |row| {
        row.get(0)
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_blob(key: String) -> Result<(), String> {
    print!("Deleting Blob");
    let conn = DB_CONN.lock().unwrap();
    conn.execute("DELETE FROM blobs WHERE key = ?1", [key])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn list_blobs() -> Result<Vec<String>, String> {
    print!("Listing Blobs");
    let conn = DB_CONN.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT key FROM blobs")
        .map_err(|e| e.to_string())?;
    let keys = stmt
        .query_map([], |row| row.get(0))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<String>, _>>()
        .map_err(|e| e.to_string())?;
    print!("Blobs Listed");
    Ok(keys)
}

#[tauri::command]
fn insert_doc(doc_id: String, root_doc_id: Option<String>) -> Result<(), String> {
    print!("Inserting Doc");
    let conn = DB_CONN.lock().unwrap();

    if let Some(root_doc_id) = &root_doc_id {
        let count: i32 = conn
            .query_row("SELECT COUNT(*) FROM docs WHERE doc_id = ?1", [root_doc_id], |row| row.get(0))
            .map_err(|e| e.to_string())?;

        if count == 0 {
            return Err("Root document does not exist".to_string());
        }
    }

    conn.execute(
        "INSERT INTO docs (doc_id, root_doc_id) VALUES (?1, ?2)",
        [&doc_id as &dyn rusqlite::ToSql, &root_doc_id],
    )
    .map_err(|e| e.to_string())?;

    print!("Doc Inserted");
    Ok(())
}


#[tauri::command]
fn get_root_doc_id() -> Result<String, String> {
    print!("Getting Root Doc ID");
    let conn = DB_CONN.lock().unwrap();
    conn.query_row(
        "SELECT * FROM docs WHERE root_doc_id IS NULL",
        [],
        |row| row.get(0),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_updates(doc_id: String) -> Result<Vec<Vec<u8>>, String> {
    print!("Getting Updates");
    let conn = DB_CONN.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT update_data FROM updates WHERE doc_id = ?1")
        .map_err(|e| e.to_string())?;
    let updates = stmt
        .query_map([doc_id], |row| row.get(0))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<Vec<u8>>, _>>()
        .map_err(|e| e.to_string())?;
    print!("Updates Retrieved :{:?}", updates);
    Ok(updates)
}

#[tauri::command]
fn is_table_empty(table_name: String) -> Result<bool, String> {
    print!("Checking if table is empty");
    let conn = DB_CONN.lock().unwrap();
    let query = format!("SELECT COUNT(*) FROM {}", table_name);
    let count: i32 = conn
        .query_row(&query, [], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    print!("Table is empty: {}", count == 0);
    Ok(count == 0)
}

#[tauri::command]
fn load_db(file_path: String) -> Result<(), String> {
    print!("Loading DB");
    let conn = Connection::open(file_path).map_err(|e| e.to_string())?;
    *DB_CONN.lock().unwrap() = conn;
    print!("DB Loaded");
    Ok(())
}

pub fn run(db: Arc<Mutex<Connection>>) {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            init_db,
            insert_blob,
            get_blob,
            delete_blob,
            list_blobs,
            insert_doc,
            get_root_doc_id,
            get_updates,
            is_table_empty,
            load_db,
            insert_root,
            insert_update,
        ])
        .setup(|app| {
            app.manage(db);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

