use anyhow::Result;
use cozo::{new_cozo_sqlite, Db, SqliteStorage};

use crate::db::create_db::check_and_create_file;

pub fn initialize_db() -> Result<Db<SqliteStorage>> {
    match check_and_create_file("nodecode.db", None) {
        Ok(file_path) => println!("File is ready at: {:?}", file_path),
        Err(err) => eprintln!("Error: {}", err),
    }
    let db_path = std::env::current_dir()?.join("nodecode.db");

    let sqlite_storage =
        new_cozo_sqlite(db_path.to_str().unwrap()).map_err(|e| anyhow::anyhow!(e))?;

    Ok(sqlite_storage)
}

pub fn initialize_schema(db: &cozo::Db<cozo::SqliteStorage>) -> Result<(), anyhow::Error> {
    let schema_creation_script = "
        :create headings {
            id: String,
            name: String,
        };

        :create subheadings {
            id: String,
            name: String,
        };

        :create blocks {
            id: String,
            type: String,
            content: String,
            styles: String
        };

        :create has_subheading {
            from: String, 
            to: String    
        };

        :create has_block {
            from: String,  
            to: String    
        };
    ";

    match db.run_script(
        schema_creation_script,
        Default::default(),
        cozo::ScriptMutability::Mutable,
    ) {
        Ok(_) => {
            println!("Schema creation or insertion successful.");
            Ok(())
        }
        Err(e) => {
            println!("Failed to initialize schema: {}", e);
            Err(anyhow::anyhow!("Schema initialization failed: {}", e))
        }
    }
}
