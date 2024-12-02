// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
use db::db::initialize_db;
use db::db::initialize_schema;

use app_lib::run;

fn main() {
    println!("Starting the application...");
    let db = match initialize_db() {
        Ok(database) => {
            println!("Database initialized successfully.");
            database
        },
        Err(err) => {
            eprintln!("Failed to initialize database: {}", err);
            std::process::exit(1);
        },
    };
    
    println!("Attempting to initialize schema...");
    if let Err(err) = initialize_schema(&db) {
        eprintln!("Failed to initialize schema: {}", err);
    }

    println!("Running the application...");
    let db_instance = cozo::DbInstance::Sqlite(db);
    run(db_instance);
}
