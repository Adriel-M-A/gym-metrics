import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "../store/useSettingsStore";
import { Database, CheckCircle, AlertCircle, RefreshCw, Sparkles } from "lucide-react";

export default function SettingsView() {
  const { dbPath, setDbPath } = useSettingsStore();
  const [localPath, setLocalPath] = useState(dbPath);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "idle";
    message: string;
  }>({ type: "idle", message: "" });

  const DEFAULT_PATH = "D:\\cerebro\\yo\\gimnasio\\database\\entrenamiento.db";

  // Sincronizar el estado local si el store cambia
  useEffect(() => {
    setLocalPath(dbPath);
  }, [dbPath]);

  const testConnection = async (pathToCheck: string) => {
    if (!pathToCheck.trim()) {
      setStatus({ type: "error", message: "La ruta de la base de datos no puede estar vacía." });
      return;
    }

    setTesting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const exerciseCount = await invoke<number>("verify_db", { dbPath: pathToCheck });
      setStatus({
        type: "success",
        message: `¡Conexión exitosa! Se encontraron ${exerciseCount} ejercicios en el catálogo.`,
      });
      // Si la conexión es exitosa, guardamos inmediatamente en el store persistido
      setDbPath(pathToCheck);
    } catch (error) {
      setStatus({
        type: "error",
        message: typeof error === "string" ? error : "No se pudo conectar a la base de datos en esa ruta.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    testConnection(localPath);
  };

  const handleUseDefault = () => {
    setLocalPath(DEFAULT_PATH);
    testConnection(DEFAULT_PATH);
  };

  return (
    <div className="p-8 w-full min-h-screen flex flex-col justify-start max-w-4xl mx-auto">
      {/* Cabecera */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
          <Database className="text-brand-primary" size={28} />
          Configuración
        </h2>
        <p className="text-zinc-500 mt-2">
          Establecé las credenciales y rutas del sistema para conectar el registro con el motor SQLite local.
        </p>
      </div>

      {/* Contenedor Principal (Glassmorphism) */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-300 flex items-center justify-between">
            <span>Ruta Absoluta de la Base de Datos (.db)</span>
            <span className="text-xs text-zinc-500 font-normal">SQLite 3</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                placeholder="Ej: D:\ruta\a\entrenamiento.db"
                className="w-full pl-4 pr-10 py-3 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand-primary/60 transition-colors duration-200 text-sm font-mono"
              />
              <Database className="absolute right-3 top-3.5 text-zinc-600" size={16} />
            </div>
            <button
              onClick={handleSave}
              disabled={testing}
              className="px-5 py-3 bg-brand-primary text-zinc-950 hover:bg-brand-primary/95 font-semibold rounded-xl text-sm transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              {testing ? <RefreshCw size={16} className="animate-spin" /> : "Guardar"}
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Esta ruta se utiliza para registrar sesiones de entrenamiento mediante transacciones atómicas.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800/60">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400 font-medium">¿Usando la ruta del ecosistema?</span>
            <span className="text-[11px] text-zinc-600 font-mono mt-0.5">{DEFAULT_PATH}</span>
          </div>
          <button
            onClick={handleUseDefault}
            disabled={testing}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-semibold rounded-xl text-xs transition-all duration-200"
          >
            <Sparkles size={13} className="text-brand-primary" />
            Usar ruta por defecto
          </button>
        </div>

        {/* Feedback de Estado */}
        {status.type !== "idle" && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl text-sm border transition-all duration-300 ${
              status.type === "success"
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/5 border-rose-500/20 text-rose-400"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h4 className="font-semibold mb-0.5">
                {status.type === "success" ? "Configuración Correcta" : "Error en Configuración"}
              </h4>
              <p className="text-xs opacity-90 leading-relaxed">{status.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
