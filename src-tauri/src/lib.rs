use rusqlite::Connection;
use std::sync::{Arc, Mutex};
use tauri::Manager;

#[tauri::command]
fn greet() -> String {
    "Hello, Backend Is Up along with DB".to_string()
}

pub fn run(db: Arc<Mutex<Connection>>) {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            app.manage(db);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
