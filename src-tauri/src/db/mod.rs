use std::sync::Arc;
use surrealdb::engine::remote::ws::{Client, Ws};
use surrealdb::opt::auth::Root;
use surrealdb::{Session, Surreal};
use tokio::sync::Mutex;

pub struct DbConnections {
    pub remote: Arc<Mutex<Surreal<Client>>>,
}

impl DbConnections {
    pub async fn new() -> Self {
        // SurrealDB local database
        // let local = Surreal::new::<RocksDb>("file://./nodecodelocaldb.db").await.unwrap();

        // SurrealDB remote database
        let remote = Surreal::new::<Ws>("http://remote-server:port")
            .await
            .unwrap();
        remote
            .signin(Root {
                username: "root",
                password: "root",
            })
            .await
            .unwrap();
        remote
            .use_ns("namespace")
            .use_db("remote_db")
            .await
            .unwrap();

        DbConnections {
            local: Arc::new(Mutex::new(local)),
            remote: Arc::new(Mutex::new(remote)),
        }
    }

    pub async fn check_local_connection(&self) -> bool {
        let local = self.local.lock().await;
        let session = Session::for_db("namespace", "local_db");
        local
            .execute("RETURN true;", &session, None, false)
            .await
            .is_ok()
    }

    pub async fn check_remote_connection(&self) -> bool {
        let remote = self.remote.lock().await;
        let session = Session::for_db("namespace", "remote_db");
        remote
            .execute("RETURN true;", &session, None, false)
            .await
            .is_ok()
    }
}
