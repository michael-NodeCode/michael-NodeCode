use rusqlite::{Connection, Result};
use std::sync::{Arc, Mutex};

use crate::migrations::schema::MIGRATION_001;

pub fn initialize_db() -> Result<Arc<Mutex<rusqlite::Connection>>> {
    let db_path = "db.sqlite";

    let conn = match Connection::open(db_path) {
        Ok(conn) => {
            println!("Database initialized at path: {}", db_path);
            conn
        }
        Err(e) => {
            println!("Failed to open database: {}", e);
            return Err(e);
        }
    };

    if let Err(e) = run_migrations(&conn) {
        println!("Migration failed: {}", e);
        return Err(e);
    }

    Ok(Arc::new(Mutex::new(conn)))
}

fn run_migrations(conn: &Connection)  -> Result<()> {
    let current_version = match get_current_version(conn) {
        Ok(version) => version,
        Err(e) => {
            println!("Failed to get current schema version: {}", e);
            return Err(e);
        }
    };
    print!("Current schema version: {}", current_version);
    if current_version < 1 {
        if let Err(e) = apply_migration(conn, MIGRATION_001) {
            println!("Failed to apply migration 001: {}", e);
            return Err(e);
        } else {
            println!("Migration 001 applied successfully");
            if let Err(e) = set_schema_version(conn, 1) {
                println!("Failed to update schema version after migration: {}", e);
                return Err(e);
            }
        }
    }

    Ok(())
}

fn apply_migration(conn: &Connection, sql: &str) -> Result<()> {
    if let Err(e) = conn.execute_batch(sql) {
        println!("Failed to execute migration: {}", e);
        return Err(e);
    }
    Ok(())
}

fn get_current_version(conn: &Connection) -> Result<i32> {
    let version_exists = match conn.query_row(
        "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'schema_version'",
        [],
        |row| row.get::<_, i32>(0),
    ) {
        Ok(count) => count > 0,
        Err(e) => {
            println!("Failed to check for schema_version table: {}", e);
            return Err(e);
        }
    };

    if !version_exists {
        if let Err(e) = conn.execute(
            "CREATE TABLE IF NOT EXISTS schema_version (version INTEGER)",
            [],
        ) {
            println!("Failed to create schema_version table: {}", e);
            return Err(rusqlite::Error::ExecuteReturnedResults);
        }

        if let Err(e) = conn.execute("INSERT INTO schema_version (version) VALUES (0)", []) {
            println!("Failed to insert initial version: {}", e);
            return Err(rusqlite::Error::from(e));
        }
        println!("Initial schema version set to 0");
        return Ok(0);
    }

    match conn.query_row("SELECT version FROM schema_version", [], |row| row.get(0)) {
        Ok(version) => Ok(version),
        Err(e) => {
            println!("Failed to retrieve current schema version: {}", e);
            Err(rusqlite::Error::from(e))
        }
    }
}

fn set_schema_version(conn: &Connection, version: i32) -> Result<()> {
    if let Err(e) = conn.execute("UPDATE schema_version SET version = ?1", &[&version]) {
        println!("Failed to update schema version: {}", e);
        return Err(rusqlite::Error::ToSqlConversionFailure(Box::new(e)));
    }

    println!("Schema version updated to {}", version);
    Ok(())
}
