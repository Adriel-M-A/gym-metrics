pub mod models;
pub mod db;

use models::Session;

#[tauri::command]
fn save_session(db_path: String, session: Session) -> Result<(), String> {
    match db::save_session_to_db(&db_path, &session) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Error saving to DB: {}", e)),
    }
}

#[tauri::command]
fn verify_db(db_path: String) -> Result<i32, String> {
    db::verify_db_connection(&db_path).map_err(|e| format!("Conexión fallida: {}", e))
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, save_session, verify_db])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
