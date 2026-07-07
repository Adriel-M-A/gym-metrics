import { Check } from "lucide-react";
import { useSessionStore } from "../../store/useSessionStore";
import { cn } from "../../lib/cn";

export default function SessionTableEditor() {
  const session = useSessionStore((state) => state.session);
  const updateSerieField = useSessionStore((state) => state.updateSerieField);

  if (!session) return null;

  return (
    <div className="w-full flex flex-col gap-10">
      {session.ejercicios.map((ejercicio) => (
        <div
          key={ejercicio.ejercicio_id}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4"
        >
          {/* Header de Ejercicio */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-850 pb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-zinc-100">{ejercicio.nombre}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                {ejercicio.categoria}
              </span>
            </div>
            <div className="text-xs text-zinc-500 font-medium font-mono">
              Descanso: {ejercicio.descanso_min_seg}s - {ejercicio.descanso_max_seg}s
            </div>
          </div>

          {/* Tabla de Series */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="py-3 px-2 text-center w-12">S</th>
                  <th className="py-3 px-4 text-center w-28">Peso Sug.</th>
                  <th className="py-3 px-4 text-center w-28">Reps Sug.</th>
                  <th className="py-3 px-4 text-center w-28">Esf. Sug.</th>
                  <th className="py-3 px-4 text-center w-28">Peso Real</th>
                  <th className="py-3 px-4 text-center w-28">Reps Real</th>
                  <th className="py-3 px-4 text-center min-w-[200px]">Esfuerzo (RIR)</th>
                  <th className="py-3 px-4 text-center w-28">Control.</th>
                  <th className="py-3 px-4">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {ejercicio.series.map((serie) => (
                  <tr key={serie.numero_serie} className="group hover:bg-zinc-950/20">
                    {/* Número de Serie */}
                    <td className="py-3.5 px-2 text-center font-bold text-zinc-500 group-hover:text-zinc-400 font-mono text-sm">
                      S{serie.numero_serie}
                    </td>

                    {/* Peso Sugerido */}
                    <td className="py-3.5 px-4 text-center text-zinc-400 font-mono text-sm">
                      {serie.peso_sugerido !== null ? `${serie.peso_sugerido} kg` : "P. Corp"}
                    </td>

                    {/* Repeticiones Sugeridas */}
                    <td className="py-3.5 px-4 text-center text-zinc-400 font-mono text-sm">
                      {serie.reps_sugeridas_min} - {serie.reps_sugeridas_max}
                    </td>

                    {/* Esfuerzo Sugerido */}
                    <td className="py-3.5 px-4 text-center text-zinc-400 font-mono text-sm">
                      {serie.esfuerzo_sugerido === 0 ? "Normal" : `[${serie.esfuerzo_sugerido}]`}
                    </td>

                    {/* Peso Real */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        value={serie.peso ?? ""}
                        onChange={(e) =>
                          updateSerieField(
                            ejercicio.ejercicio_id,
                            serie.numero_serie,
                            "peso",
                            e.target.value === "" ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-20 bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1 text-center text-zinc-200 font-mono focus:outline-none focus:border-brand-primary text-sm"
                        placeholder="--"
                      />
                    </td>

                    {/* Repeticiones Reales */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        value={serie.repeticiones ?? ""}
                        onChange={(e) =>
                          updateSerieField(
                            ejercicio.ejercicio_id,
                            serie.numero_serie,
                            "repeticiones",
                            e.target.value === "" ? null : parseInt(e.target.value, 10)
                          )
                        }
                        className="w-20 bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1 text-center text-zinc-200 font-mono focus:outline-none focus:border-brand-primary text-sm"
                        placeholder="--"
                      />
                    </td>

                    {/* Esfuerzo Percibido (RIR) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {[0, 1, 2, 3, 4, 5].map((val) => {
                          const isSelected = (serie.esfuerzo ?? 0) === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() =>
                                updateSerieField(
                                  ejercicio.ejercicio_id,
                                  serie.numero_serie,
                                  "esfuerzo",
                                  val
                                )
                              }
                              className={cn(
                                "w-7 h-7 rounded-full text-xs font-bold font-mono transition-all duration-150 border flex items-center justify-center",
                                isSelected
                                  ? "bg-brand-primary border-brand-primary text-zinc-950 shadow-sm"
                                  : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-750"
                              )}
                              title={
                                val === 0
                                  ? "Normal"
                                  : val === 5
                                  ? "Fallo [5]"
                                  : `Esfuerzo [${val}]`
                              }
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Serie Controlada */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          updateSerieField(
                            ejercicio.ejercicio_id,
                            serie.numero_serie,
                            "serie_controlada",
                            serie.serie_controlada === 1 ? 0 : 1
                          )
                        }
                        className={cn(
                          "w-5 h-5 rounded border mx-auto flex items-center justify-center transition-all duration-150",
                          serie.serie_controlada === 1
                            ? "bg-brand-primary border-brand-primary text-zinc-950"
                            : "bg-zinc-950 border-zinc-800 text-transparent hover:border-zinc-700"
                        )}
                        title="Marcar si se controló el tempo excéntrico"
                      >
                        <Check size={12} strokeWidth={3} />
                      </button>
                    </td>

                    {/* Notas */}
                    <td className="py-3 px-2">
                      <input
                        type="text"
                        value={serie.notas ?? ""}
                        onChange={(e) =>
                          updateSerieField(
                            ejercicio.ejercicio_id,
                            serie.numero_serie,
                            "notas",
                            e.target.value
                          )
                        }
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1 text-zinc-300 focus:outline-none focus:border-brand-primary text-sm"
                        placeholder="Agregar nota..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
