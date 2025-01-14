mod commands;
mod types;

use colored::Colorize;
use surrealdb::engine::local::{Db, RocksDb};
use surrealdb::Surreal;
use tauri::async_runtime;
use tauri::Manager;

pub struct AppState {
    pub db: Surreal<Db>,
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app_handle| {
            println!(
                "{}",
                "[setup] Setting up SurrealDB with RocksDB...".yellow()
            );
            async_runtime::block_on(async {
                let db = Surreal::new::<RocksDb>("nodecode_db")
                    .await
                    .expect("Failed to init SurrealDB file-based");

                db.use_ns("nodecode")
                    .use_db("db")
                    .await
                    .expect("Failed to set NS/DB");

                app_handle.manage(AppState { db });

                const WELCOME_MSG: &str = "Welcome to NodeCode Dev ENV!";
                println!(
                    "{}",
                    format!(
                        "[setup] SurrealDB initiated successfully!\n: {}",
                        WELCOME_MSG
                    )
                    .green()
                );
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::create_person,
            commands::update_and_select,
            commands::insert_node_blocks,
            commands::get_all_node_blocks,
            commands::get_node_block_by_id,
            commands::get_children_of_node
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
