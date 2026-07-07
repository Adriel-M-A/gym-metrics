import { z } from "zod";

export const SerieSchema = z.object({
  numero_serie: z.number().int().positive(),
  peso_sugerido: z.number().nullable(),
  reps_sugeridas_min: z.number().int().nonnegative(),
  reps_sugeridas_max: z.number().int().nonnegative(),
  esfuerzo_sugerido: z.number().int().min(0).max(5),
  peso: z.number().nullable(),
  repeticiones: z.number().int().nonnegative().nullable(),
  esfuerzo: z.number().int().min(0).max(5).nullable().default(0),
  serie_controlada: z.number().int().min(0).max(1).nullable().default(0),
  notas: z.string().nullable().default(""),
});

export const EjercicioSchema = z.object({
  ejercicio_id: z.number().int().positive(),
  nombre: z.string().min(1),
  categoria: z.enum(["Fuerza (Compuesto)", "Fuerza (Aislado)", "Core"]),
  descanso_min_seg: z.number().int().nonnegative(),
  descanso_max_seg: z.number().int().nonnegative(),
  series: z.array(SerieSchema),
});

export const SessionSchema = z.object({
  dia_rutina: z.number().int().min(1).max(4),
  nombre_dia: z.string().min(1),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "La fecha debe cumplir el formato YYYY-MM-DD",
  }),
  energia: z.number().int().min(1).max(5).nullable(),
  suenio_horas: z.number().nonnegative().nullable(),
  peso_corporal: z.number().nonnegative().nullable(),
  duracion_minutos: z.number().int().nonnegative().nullable(),
  ejercicios: z.array(EjercicioSchema),
});

export type Serie = z.infer<typeof SerieSchema>;
export type Ejercicio = z.infer<typeof EjercicioSchema>;
export type Session = z.infer<typeof SessionSchema>;
