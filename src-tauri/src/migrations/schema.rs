
pub const MIGRATION_001: &str = r#"
    CREATE TABLE IF NOT EXISTS headings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subheadings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS blocks (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        styles TEXT
    );

    CREATE TABLE IF NOT EXISTS has_subheading (
        heading_id TEXT NOT NULL,
        subheading_id TEXT NOT NULL,
        PRIMARY KEY (heading_id, subheading_id),
        FOREIGN KEY (heading_id) REFERENCES headings (id),
        FOREIGN KEY (subheading_id) REFERENCES subheadings (id)
    );

    CREATE TABLE IF NOT EXISTS has_block (
        subheading_id TEXT NOT NULL,
        block_id TEXT NOT NULL,
        PRIMARY KEY (subheading_id, block_id),
        FOREIGN KEY (subheading_id) REFERENCES subheadings (id),
        FOREIGN KEY (block_id) REFERENCES blocks (id)
    );

    CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY
    );

    INSERT OR IGNORE INTO schema_version (version) VALUES (1);
"#;

