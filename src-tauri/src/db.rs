use crate::models::{Session, SessionSummary, ExerciseSummary, ExerciseProgression, MuscleVolume, ExerciseNote, SessionVolume};
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

pub fn get_session_history(db_path: &str, since_date: Option<&str>) -> Result<Vec<SessionSummary>> {
    let conn = Connection::open(db_path)?;
    let mut stmt = conn.prepare(
        "SELECT id, fecha, dia_rutina, energia, suenio_horas, duracion_minutos,
                ejercicios_realizados, series_totales
         FROM v_historial_sesiones
         WHERE ?1 IS NULL OR fecha >= ?1
         ORDER BY fecha DESC",
    )?;
    let rows = stmt.query_map(params![since_date], |row| {
        Ok(SessionSummary {
            id: row.get(0)?,
            fecha: row.get(1)?,
            dia_rutina: row.get(2)?,
            energia: row.get(3)?,
            suenio_horas: row.get(4)?,
            duracion_minutos: row.get(5)?,
            ejercicios_realizados: row.get(6)?,
            series_totales: row.get(7)?,
        })
    })?;
    rows.collect()
}

pub fn get_exercises_list(db_path: &str) -> Result<Vec<ExerciseSummary>> {
    let conn = Connection::open(db_path)?;
    let mut stmt = conn.prepare(
        "SELECT e.id, e.nombre, e.grupo_muscular
         FROM ejercicios e
         ORDER BY e.nombre ASC",
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(ExerciseSummary {
            id: row.get(0)?,
            nombre: row.get(1)?,
            grupo_muscular: row.get(2)?,
        })
    })?;
    rows.collect()
}

pub fn get_exercise_progression(db_path: &str, exercise_name: &str, since_date: Option<&str>) -> Result<Vec<ExerciseProgression>> {
    let conn = Connection::open(db_path)?;
    let mut stmt = conn.prepare(
        "SELECT semana, peso_maximo, reps_maximas, esfuerzo_promedio
         FROM v_progresion_semanal
         WHERE ejercicio = ?1 AND (?2 IS NULL OR semana >= ?2)
         ORDER BY semana ASC",
    )?;
    let rows = stmt.query_map(params![exercise_name, since_date], |row| {
        Ok(ExerciseProgression {
            semana: row.get(0)?,
            peso_maximo: row.get(1)?,
            reps_maximas: row.get(2)?,
            esfuerzo_promedio: row.get(3)?,
        })
    })?;
    rows.collect()
}

pub fn get_muscle_volume_distribution(db_path: &str, since_date: Option<&str>) -> Result<Vec<MuscleVolume>> {
    let conn = Connection::open(db_path)?;
    let mut stmt = conn.prepare(
        "SELECT e.grupo_muscular, COUNT(s.id) AS series_totales
         FROM series s
         JOIN ejercicios e ON s.ejercicio_id = e.id
         JOIN sesiones ses ON s.sesion_id = ses.id
         WHERE ?1 IS NULL OR ses.fecha >= ?1
         GROUP BY e.grupo_muscular
         ORDER BY series_totales DESC",
    )?;
    let rows = stmt.query_map(params![since_date], |row| {
        Ok(MuscleVolume {
            grupo_muscular: row.get(0)?,
            series_totales: row.get(1)?,
        })
    })?;
    rows.collect()
}

pub fn get_exercise_notes(db_path: &str, exercise_name: &str, since_date: Option<&str>) -> Result<Vec<ExerciseNote>> {
    let conn = Connection::open(db_path)?;
    let mut stmt = conn.prepare(
        "SELECT ses.fecha, s.numero_serie, s.notas
         FROM series s
         JOIN sesiones ses ON s.sesion_id = ses.id
         JOIN ejercicios e ON s.ejercicio_id = e.id
         WHERE e.nombre = ?1 AND s.notas IS NOT NULL AND s.notas != ''
           AND (?2 IS NULL OR ses.fecha >= ?2)
         ORDER BY ses.fecha DESC, s.numero_serie ASC",
    )?;
    let rows = stmt.query_map(params![exercise_name, since_date], |row| {
        Ok(ExerciseNote {
            fecha: row.get(0)?,
            serie: row.get(1)?,
            notas: row.get(2)?,
        })
    })?;
    rows.collect()
}

pub fn get_volume_per_session(db_path: &str, since_date: Option<&str>) -> Result<Vec<SessionVolume>> {
    let conn = Connection::open(db_path)?;
    let mut stmt = conn.prepare(
        "SELECT ses.fecha, SUM(IFNULL(s.peso, 0) * IFNULL(s.repeticiones, 0)) as tonelaje
         FROM series s
         JOIN sesiones ses ON s.sesion_id = ses.id
         WHERE ?1 IS NULL OR ses.fecha >= ?1
         GROUP BY ses.id, ses.fecha
         ORDER BY ses.fecha ASC",
    )?;
    let rows = stmt.query_map(params![since_date], |row| {
        Ok(SessionVolume {
            fecha: row.get(0)?,
            tonelaje_total: row.get(1)?,
        })
    })?;
    rows.collect()
}
