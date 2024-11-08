-- KUZU DB SCHEMA

CREATE NODE TABLE headings (
    id STRING PRIMARY KEY,       
    name STRING                  
);

CREATE NODE TABLE subheadings (
    id STRING PRIMARY KEY,       
    name STRING                   
);

CREATE NODE TABLE blocks (
    id STRING PRIMARY KEY,       
    type STRING,                 
    content STRING,              
    styles STRING               
);

CREATE EDGE TABLE has_subheading (
    FROM headings TO subheadings 
);

CREATE EDGE TABLE has_block (
    FROM subheadings TO blocks   
);


-- SurrealDB Schema 

-- DEFINE TABLE Node SCHEMAFULL
--   PERMISSIONS NONE;

-- DEFINE FIELD heading ON Node TYPE string;
-- DEFINE FIELD sub_heading ON Node TYPE string;
-- DEFINE FIELD content_ids ON Node TYPE array;

-- DEFINE TABLE ContentBlock SCHEMAFULL
--   PERMISSIONS NONE;

-- DEFINE FIELD node_id ON ContentBlock TYPE record(Node); 
-- DEFINE FIELD type ON ContentBlock TYPE string;
-- DEFINE FIELD props ON ContentBlock TYPE object; 
-- DEFINE FIELD content ON ContentBlock TYPE array; 

-- DEFINE INDEX content_text ON ContentBlock.content[].text; 
