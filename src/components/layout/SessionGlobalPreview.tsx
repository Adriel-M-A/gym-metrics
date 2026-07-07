import { Zap } from "lucide-react";
import { useSessionStore } from "../../store/useSessionStore";
import { cn } from "../../lib/cn";

export default function SessionGlobalPreview() {
  const session = useSessionStore((state) => state.session);
  const updateGlobalField = useSessionStore((state) => state.updateGlobalField);

  if (!session) return null;

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
            Sesión Cargada
          </span>
          <h2 className="text-2xl font-bold text-zinc-100 mt-1">
            Día {session.dia_rutina} — {session.nombre_dia}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 font-medium">Fecha de Ejecución</p>
          <p className="text-sm font-mono text-zinc-300 mt-1">{session.fecha}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sueño */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-400">Sueño (Horas)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={session.suenio_horas ?? ""}
            onChange={(e) =>
              updateGlobalField(
                "suenio_horas",
                e.target.value === "" ? null : parseFloat(e.target.value)
              )
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 font-mono focus:outline-none focus:border-brand-primary transition-colors duration-200"
            placeholder="Ej: 7.5"
          />
        </div>

        {/* Peso Corporal */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-400">Peso Corporal (kg)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={session.peso_corporal ?? ""}
            onChange={(e) =>
              updateGlobalField(
                "peso_corporal",
                e.target.value === "" ? null : parseFloat(e.target.value)
              )
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 font-mono focus:outline-none focus:border-brand-primary transition-colors duration-200"
            placeholder="Ej: 70.0"
          />
        </div>

        {/* Duración */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-400">Duración (Minutos)</label>
          <input
            type="number"
            min="0"
            value={session.duracion_minutos ?? ""}
            onChange={(e) =>
              updateGlobalField(
                "duracion_minutos",
                e.target.value === "" ? null : parseInt(e.target.value, 10)
              )
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 font-mono focus:outline-none focus:border-brand-primary transition-colors duration-200"
            placeholder="Ej: 60"
          />
        </div>

        {/* Energía */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-400">Energía Percibida</label>
          <div className="flex items-center gap-1.5 h-full py-1">
            {[1, 2, 3, 4, 5].map((level) => {
              const isActive = session.energia === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateGlobalField("energia", level)}
                  title={`Nivel ${level} de energía`}
                  className={cn(
                    "flex-1 py-2 rounded-lg border transition-all duration-200 flex items-center justify-center gap-1",
                    isActive
                      ? "bg-brand-primary/10 border-brand-primary text-brand-primary"
                      : "bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700"
                  )}
                >
                  <Zap
                    size={14}
                    className={cn(
                      "transition-all duration-200",
                      isActive ? "fill-brand-primary" : "fill-none"
                    )}
                  />
                  <span className="text-xs font-bold font-mono">{level}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
