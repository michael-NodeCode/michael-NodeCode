use kuzu::{Connection, Database, Error, SystemConfig};

pub fn initialize_db() -> Result<Database, Error> {
    let db_path = "nodecode.db";
    let config = SystemConfig::default();
    let db = Database::new(db_path, config)?;

    println!("Database initialized at path: {}", db_path);

    {
        let conn = Connection::new(&db)?;

        let create_heading_node_query = "CREATE NODE TABLE IF NOT EXISTS headings(id STRING, name STRING, PRIMARY KEY (id))";

        match conn.query(create_heading_node_query) {
            Ok(_) => println!("'Heading Node' created successfully."),
            Err(err) => {
                if err.to_string().contains("already exists") {
                    println!("'Heading Node' already exists.");
                } else {
                    return Err(err); 
                }
            }
        }
        let create_subheading_node_query = "CREATE NODE TABLE IF NOT EXISTS subheadings(id STRING, name STRING, PRIMARY KEY (id))";

        match conn.query(create_subheading_node_query) {
            Ok(_) => println!("'Sub Heading Node' created successfully."),
            Err(err) => {
                if err.to_string().contains("already exists") {
                    println!("'Sub Heading Node' already exists.");
                } else {
                    return Err(err); 
                }
            }
        }
        let create_blocks_node_query = "CREATE NODE TABLE IF NOT EXISTS blocks(id STRING, type STRING, content STRING, styles STRING, PRIMARY KEY (id))";

        match conn.query(create_blocks_node_query) {
            Ok(_) => println!("'Blocks Node' created successfully."),
            Err(err) => {
                if err.to_string().contains("already exists") {
                    println!("'Blocks Node' already exists.");
                } else {
                    return Err(err); 
                }
            }
        }
        let create_heading_rel_query = "CREATE REL TABLE IF NOT EXISTS has_subheading(FROM headings TO subheadings)";

        match conn.query(create_heading_rel_query) {
            Ok(_) => println!("'Heading Realtion' created successfully."),
            Err(err) => {
                if err.to_string().contains("already exists") {
                    println!("'Heading Realtion' already exists.");
                } else {
                    return Err(err); 
                }
            }
        }
        let create_blocks_rel_query = "CREATE REL TABLE IF NOT EXISTS has_block(FROM subheadings TO blocks)";

        match conn.query(create_blocks_rel_query) {
            Ok(_) => println!("'Blocks Relation' created successfully."),
            Err(err) => {
                if err.to_string().contains("already exists") {
                    println!("'Blocks Relation' already exists.");
                } else {
                    return Err(err); 
                }
            }
        }


    }

    Ok(db)
}