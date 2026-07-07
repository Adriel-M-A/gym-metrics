pub mod models;
pub mod db;

use models::{Session, SessionSummary, ExerciseSummary, ExerciseProgression, MuscleVolume, ExerciseNote, SessionVolume};

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

#[tauri::command]
fn get_session_history(db_path: String, since_date: Option<String>) -> Result<Vec<SessionSummary>, String> {
    db::get_session_history(&db_path, since_date.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_exercises_list(db_path: String) -> Result<Vec<ExerciseSummary>, String> {
    db::get_exercises_list(&db_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_exercise_progression(db_path: String, exercise_name: String, since_date: Option<String>) -> Result<Vec<ExerciseProgression>, String> {
    db::get_exercise_progression(&db_path, &exercise_name, since_date.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_muscle_volume_distribution(db_path: String, since_date: Option<String>) -> Result<Vec<MuscleVolume>, String> {
    db::get_muscle_volume_distribution(&db_path, since_date.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_exercise_notes(db_path: String, exercise_name: String, since_date: Option<String>) -> Result<Vec<ExerciseNote>, String> {
    db::get_exercise_notes(&db_path, &exercise_name, since_date.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_volume_per_session(db_path: String, since_date: Option<String>) -> Result<Vec<SessionVolume>, String> {
    db::get_volume_per_session(&db_path, since_date.as_deref()).map_err(|e| e.to_string())
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
        .invoke_handler(tauri::generate_handler![
            greet,
            save_session,
            verify_db,
            get_session_history,
            get_exercises_list,
            get_exercise_progression,
            get_muscle_volume_distribution,
            get_exercise_notes,
            get_volume_per_session,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
