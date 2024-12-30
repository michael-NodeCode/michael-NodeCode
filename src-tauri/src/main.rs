// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
use db::db::initialize_db;

mod migrations;

use app_lib::run;

fn main() {
    let db = match initialize_db() {
        Ok(connection) => connection,
        Err(err) => {
            eprintln!("Failed to initialize database: {}", err);
            std::process::exit(1);
        },
    };
    

    run(db);
}