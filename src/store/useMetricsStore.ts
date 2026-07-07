import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface SessionSummary {
  id: number;
  fecha: string;
  dia_rutina: number | null;
  energia: number | null;
  suenio_horas: number | null;
  duracion_minutos: number | null;
  ejercicios_realizados: number;
  series_totales: number;
}

export interface ExerciseSummary {
  id: number;
  nombre: string;
  grupo_muscular: string;
}

export interface ExerciseProgression {
  semana: string;
  peso_maximo: number | null;
  reps_maximas: number | null;
  esfuerzo_promedio: number | null;
}

export interface MuscleVolume {
  grupo_muscular: string;
  series_totales: number;
}

export interface ExerciseNote {
  fecha: string;
  serie: number;
  notas: string;
}

export interface SessionVolume {
  fecha: string;
  tonelaje_total: number;
}

export type TimeRange = "1M" | "3M" | "6M" | "ALL";

function getSinceDate(range: TimeRange): string | null {
  if (range === "ALL") return null;
  const d = new Date();
  if (range === "1M") d.setDate(d.getDate() - 28);
  if (range === "3M") d.setMonth(d.getMonth() - 3);
  if (range === "6M") d.setMonth(d.getMonth() - 6);
  return d.toISOString().split("T")[0];
}

interface MetricsState {
  isLoading: boolean;
  error: string | null;

  sessions: SessionSummary[];
  exercises: ExerciseSummary[];
  selectedExercise: string;
  timeRange: TimeRange;
  exerciseProgression: ExerciseProgression[];
  exerciseNotes: ExerciseNote[];
  muscleVolume: MuscleVolume[];
  sessionVolume: SessionVolume[];

  loadDashboard: (dbPath: string) => Promise<void>;
  loadExerciseProgression: (dbPath: string, exerciseName: string) => Promise<void>;
  setSelectedExercise: (name: string) => void;
  setTimeRange: (range: TimeRange) => void;
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  isLoading: false,
  error: null,
  sessions: [],
  exercises: [],
  selectedExercise: "",
  timeRange: "3M",
  exerciseProgression: [],
  exerciseNotes: [],
  muscleVolume: [],
  sessionVolume: [],

  /** Carga en paralelo el historial de sesiones, la lista de ejercicios y el volumen muscular. */
  loadDashboard: async (dbPath: string) => {
    set({ isLoading: true, error: null });
    const sinceDate = getSinceDate(get().timeRange);
    try {
      const [sessions, exercises, muscleVolume, sessionVolume] = await Promise.all([
        invoke<SessionSummary[]>("get_session_history", { dbPath, sinceDate }),
        invoke<ExerciseSummary[]>("get_exercises_list", { dbPath }),
        invoke<MuscleVolume[]>("get_muscle_volume_distribution", { dbPath, sinceDate }),
        invoke<SessionVolume[]>("get_volume_per_session", { dbPath, sinceDate }),
      ]);

      set({ sessions, exercises, muscleVolume, sessionVolume });

      // Cargar progresión del primer ejercicio disponible como selección por defecto
      if (exercises.length > 0 && !get().selectedExercise) {
        const defaultExercise = exercises[0].nombre;
        set({ selectedExercise: defaultExercise });
        const [progression, notes] = await Promise.all([
          invoke<ExerciseProgression[]>("get_exercise_progression", { dbPath, exerciseName: defaultExercise, sinceDate }),
          invoke<ExerciseNote[]>("get_exercise_notes", { dbPath, exerciseName: defaultExercise, sinceDate }),
        ]);
        set({ exerciseProgression: progression, exerciseNotes: notes });
      }
    } catch (err) {
      set({ error: typeof err === "string" ? err : "No se pudieron cargar los datos de métricas." });
    } finally {
      set({ isLoading: false });
    }
  },

  /** Carga la progresión histórica de un ejercicio específico. */
  loadExerciseProgression: async (dbPath: string, exerciseName: string) => {
    set({ isLoading: true, error: null, selectedExercise: exerciseName });
    const sinceDate = getSinceDate(get().timeRange);
    try {
      const [progression, notes] = await Promise.all([
        invoke<ExerciseProgression[]>("get_exercise_progression", { dbPath, exerciseName, sinceDate }),
        invoke<ExerciseNote[]>("get_exercise_notes", { dbPath, exerciseName, sinceDate }),
      ]);
      set({ exerciseProgression: progression, exerciseNotes: notes });
    } catch (err) {
      set({ error: typeof err === "string" ? err : "No se pudo cargar la progresión del ejercicio." });
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedExercise: (name: string) => set({ selectedExercise: name }),
  setTimeRange: (range: TimeRange) => set({ timeRange: range }),
}));
