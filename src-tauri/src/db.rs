use crate::models::Session;
use rusqlite::{params, Connection, Result};

pub fn save_session_to_db(db_path: &str, session: &Session) -> Result<()> {
    let mut conn = Connection::open(db_path)?;
    
    // Start a transaction
    let tx = conn.transaction()?;

    // Insert session
    tx.execute(
        "INSERT INTO sesiones (fecha, energia, suenio_horas, peso_corporal, dia_rutina, duracion_minutos)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            session.fecha,
            session.energia,
            session.suenio_horas,
            session.peso_corporal,
            session.dia_rutina,
            session.duracion_minutos,
        ],
    )?;

    let sesion_id = tx.last_insert_rowid();

    // Insert series
    for ejercicio in &session.ejercicios {
        for serie in &ejercicio.series {
            tx.execute(
                "INSERT INTO series (
                    sesion_id, ejercicio_id, numero_serie, peso, repeticiones, 
                    esfuerzo, notas, peso_sugerido, reps_sugeridas_min, reps_sugeridas_max, 
                    esfuerzo_sugerido, serie_controlada
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
                params![
                    sesion_id,
                    ejercicio.ejercicio_id,
                    serie.numero_serie,
                    serie.peso,
                    serie.repeticiones,
                    serie.esfuerzo.unwrap_or(0),
                    serie.notas,
                    serie.peso_sugerido,
                    serie.reps_sugeridas_min,
                    serie.reps_sugeridas_max,
                    serie.esfuerzo_sugerido,
                    serie.serie_controlada.unwrap_or(0),
                ],
            )?;
        }
    }

    // Commit the transaction
    tx.commit()?;
    Ok(())
}

pub fn verify_db_connection(db_path: &str) -> Result<i32> {
    let conn = Connection::open(db_path)?;
    let mut stmt = conn.prepare("SELECT COUNT(*) FROM ejercicios")?;
    let count: i32 = stmt.query_row([], |row| row.get(0))?;
    Ok(count)
}
