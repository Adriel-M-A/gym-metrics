use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Serie {
    pub numero_serie: i32,
    pub peso_sugerido: Option<f64>,
    pub reps_sugeridas_min: i32,
    pub reps_sugeridas_max: i32,
    pub esfuerzo_sugerido: i32,
    pub peso: Option<f64>,
    pub repeticiones: Option<i32>,
    pub esfuerzo: Option<i32>,
    pub serie_controlada: Option<i32>,
    pub notas: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Ejercicio {
    pub ejercicio_id: i32,
    pub nombre: String,
    pub categoria: String,
    pub descanso_min_seg: i32,
    pub descanso_max_seg: i32,
    pub series: Vec<Serie>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Session {
    pub dia_rutina: i32,
    pub nombre_dia: String,
    pub fecha: String,
    pub energia: Option<i32>,
    pub suenio_horas: Option<f64>,
    pub peso_corporal: Option<f64>,
    pub duracion_minutos: Option<i32>,
    pub ejercicios: Vec<Ejercicio>,
}
