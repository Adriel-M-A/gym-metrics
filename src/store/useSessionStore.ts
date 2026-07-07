import { create } from "zustand";
import { Session, Serie } from "../types/session";

interface SessionState {
  session: Session | null;
  setSession: (session: Session) => void;
  updateGlobalField: <K extends keyof Omit<Session, "ejercicios">>(
    field: K,
    value: Session[K]
  ) => void;
  updateSerieField: <K extends keyof Serie>(
    ejercicioId: number,
    numeroSerie: number,
    field: K,
    value: Serie[K]
  ) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,

  setSession: (session) => set({ session }),

  updateGlobalField: (field, value) =>
    set((state) => {
      if (!state.session) return {};
      return {
        session: {
          ...state.session,
          [field]: value,
        },
      };
    }),

  updateSerieField: (ejercicioId, numeroSerie, field, value) =>
    set((state) => {
      if (!state.session) return {};
      
      const updatedEjercicios = state.session.ejercicios.map((ej) => {
        if (ej.ejercicio_id !== ejercicioId) return ej;

        const updatedSeries = ej.series.map((ser) => {
          if (ser.numero_serie !== numeroSerie) return ser;
          return {
            ...ser,
            [field]: value,
          };
        });

        return {
          ...ej,
          series: updatedSeries,
        };
      });

      return {
        session: {
          ...state.session,
          ejercicios: updatedEjercicios,
        },
      };
    }),

  clearSession: () => set({ session: null }),
}));
