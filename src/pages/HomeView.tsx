import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import UploadZone from "../components/ui/UploadZone";
import SessionGlobalPreview from "../components/layout/SessionGlobalPreview";
import SessionTableEditor from "../components/layout/SessionTableEditor";
import { useSessionStore } from "../store/useSessionStore";
import { useAppStore } from "../store/useAppStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { Loader2, AlertTriangle, ArrowRight } from "lucide-react";

export default function HomeView() {
  const session = useSessionStore((state) => state.session);
  const clearSession = useSessionStore((state) => state.clearSession);
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const dbPath = useSettingsStore((state) => state.dbPath);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!session) return;

    if (!dbPath) {
      setSaveError(
        "No se ha configurado la ruta de la base de datos. Por favor, andá a la sección de Ajustes y configurá una ruta válida para poder guardar tu sesión."
      );
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await invoke("save_session", { dbPath, session });

      // Limpiamos la sesión local tras guardar con éxito
      clearSession();
      setCurrentView("dashboard");
    } catch (error: any) {
      console.error("Error al guardar sesión:", error);
      let userFriendlyError = "Ocurrió un problema inesperado al intentar guardar el entrenamiento en la base de datos.";

      if (typeof error === "string") {
        if (error.includes("UNIQUE constraint failed: sesiones.fecha")) {
          userFriendlyError = `Ya existe un entrenamiento registrado para el día ${session.fecha}. No podés registrar dos entrenamientos en la misma fecha.`;
        } else {
          userFriendlyError = `Error del sistema: ${error}`;
        }
      } else if (error && typeof error === "object" && error.message) {
        if (error.message.includes("UNIQUE constraint failed: sesiones.fecha")) {
          userFriendlyError = `Ya existe un entrenamiento registrado para el día ${session.fecha}. No podés registrar dos entrenamientos en la misma fecha.`;
        } else {
          userFriendlyError = `Error del sistema: ${error.message}`;
        }
      }

      setSaveError(userFriendlyError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 w-full min-h-screen flex flex-col">
      {session === null ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-zinc-100 mb-3">Cargar Sesión</h2>
            <p className="text-zinc-500">Procesá y visualizá los datos de tu último entrenamiento.</p>
          </div>
          <UploadZone />
        </div>
      ) : (
        <div className="flex flex-col gap-8 max-w-6xl w-full mx-auto pb-16">
          <SessionGlobalPreview />
          <SessionTableEditor />

          {/* Alerta de Error */}
          {saveError && (
            <div className="bg-rose-500/5 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex items-start gap-3">
              <AlertTriangle className="mt-0.5 flex-shrink-0" size={18} />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">No se pudo guardar el entrenamiento</h4>
                <p className="text-xs opacity-90 leading-relaxed">{saveError}</p>
                {!dbPath && (
                  <button
                    onClick={() => setCurrentView("settings")}
                    className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
                  >
                    Configurar Base de Datos <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Barra de Controles Inferior */}
          <div className="flex items-center justify-end gap-4 border-t border-zinc-800 pt-6">
            <button
              onClick={clearSession}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200 cursor-pointer"
            >
              Descartar
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-brand-primary text-zinc-950 hover:bg-brand-primary/95 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200 cursor-pointer"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Confirmar y Subir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
