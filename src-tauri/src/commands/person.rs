use colored::Colorize;
use tauri::{command, State};

use crate::types::{Name, Person, Record, Responsibility};
use crate::AppState;

#[command]
pub async fn create_person(state: State<'_, AppState>) -> Result<String, String> {
    let result: Result<Option<Record>, surrealdb::Error> = state
        .db
        .create("person")
        .content(Person {
            title: "Founder & CEO",
            name: Name {
                first: "Tobie",
                last: "Morgan Hitchcock",
            },
            marketing: true,
        })
        .await;

    match result {
        Ok(created) => {
            println!(
                "{}",
                format!("[create_person] Created record: {:?}", created).green()
            );
            Ok(format!("Created record: {:?}", created))
        }
        Err(e) => {
            println!("{}", format!("Error creating record: {}", e).red());
            Err(e.to_string())
        }
    }
}

#[command]
pub async fn update_and_select(state: State<'_, AppState>) -> Result<String, String> {
    let updated: Result<Option<Record>, surrealdb::Error> = state
        .db
        .update(("person", "jaime"))
        .merge(Responsibility { marketing: true })
        .await;

    let all_people: Result<Vec<Record>, surrealdb::Error> = state.db.select("person").await;

    match (updated, all_people) {
        (Ok(up), Ok(people)) => {
            println!(
                "{}",
                format!("[update_and_read] Updated: {:?}\nPeople: {:?}", up, people).green()
            );
            Ok(format!("Updated: {:?}\nPeople: {:?}", up, people))
        }
        (Err(e), _) => {
            println!(
                "{}",
                format!("[update_and_read]  update error: {}", e).red()
            );
            Err(e.to_string())
        }
        (_, Err(e)) => {
            println!(
                "{}",
                format!("[update_and_read]  select error: {}", e).red()
            );
            Err(e.to_string())
        }
    }
}
