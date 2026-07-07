import { useEffect } from "react";
import {
  LineChart,
  ComposedChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMetricsStore } from "../store/useMetricsStore";
import { useSettingsStore } from "../store/useSettingsStore";
import ActivityHeatmap from "../components/ui/ActivityHeatmap";
import {
  Activity,
  Clock,
  Moon,
  Zap,
  TrendingUp,
  AlertCircle,
  Loader2,
  BarChart2,
  Database,
  Calendar,
} from "lucide-react";

// --- Componente KPI ---

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}

function KpiCard({ icon, label, value, sub, color }: KpiCardProps) {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 hover:border-zinc-700 transition-colors duration-200">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-zinc-100 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// --- Tooltip personalizado para Recharts ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs shadow-xl">
        <p className="text-zinc-400 font-semibold mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-zinc-300">{entry.name}:</span>
            <span className="font-bold text-zinc-100">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- Vista Principal ---

/** Abrevia los nombres de grupos musculares largos para el eje Y del gráfico de barras. */
function abreviarGrupo(nombre: string): string {
  const mapa: Record<string, string> = {
    "Piernas (Femoral / Isquiotibiales)": "Femoral",
    "Piernas (Cuádriceps/Glúteos)": "Cuádriceps / Glúteos",
    "Piernas (Cuádriceps)": "Cuádriceps",
    "Piernas (Pantorrillas)": "Pantorrillas",
    "Hombros (Deltoides Anterior)": "Hombros Ant.",
    "Hombros (Deltoides Lateral)": "Hombros Lat.",
    "Bíceps (y Antebrazo)": "Bíceps / Antebrazo",
    "Tríceps (y Pecho inferior)": "Tríceps / Pecho inf.",
    "Espalda (Dorsal)": "Dorsal",
  };
  return mapa[nombre] ?? nombre;
}

export default function DashboardView() {
  const dbPath = useSettingsStore((s) => s.dbPath);
  const {
    isLoading,
    error,
    sessions,
    exercises,
    selectedExercise,
    timeRange,
    exerciseProgression,
    exerciseNotes,
    muscleVolume,
    sessionVolume,
    loadDashboard,
    loadExerciseProgression,
    setTimeRange,
  } = useMetricsStore();

  useEffect(() => {
    if (dbPath) loadDashboard(dbPath);
  }, [dbPath, timeRange]);

  const handleExerciseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (dbPath) loadExerciseProgression(dbPath, e.target.value);
  };

  // --- Cálculo de KPIs ---
  const totalSesiones = sessions.length;
  const duracionPromedio =
    sessions.filter((s) => s.duracion_minutos != null).length > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + (s.duracion_minutos ?? 0), 0) /
            sessions.filter((s) => s.duracion_minutos != null).length
        )
      : null;
  const suenioPromedio =
    sessions.filter((s) => s.suenio_horas != null).length > 0
      ? (
          sessions.reduce((acc, s) => acc + (s.suenio_horas ?? 0), 0) /
          sessions.filter((s) => s.suenio_horas != null).length
        ).toFixed(1)
      : null;
  const energiaPromedio =
    sessions.filter((s) => s.energia != null).length > 0
      ? (
          sessions.reduce((acc, s) => acc + (s.energia ?? 0), 0) /
          sessions.filter((s) => s.energia != null).length
        ).toFixed(1)
      : null;

  // --- Estado sin DB configurada ---
  if (!dbPath) {
    return (
      <div className="p-8 w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <Database className="text-zinc-500" size={24} />
        </div>
        <div className="text-center">
          <h3 className="text-zinc-200 font-semibold text-lg">Base de datos no configurada</h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-xs">
            Configurá la ruta a tu base de datos en la sección de Ajustes para visualizar tus métricas.
          </p>
        </div>
      </div>
    );
  }

  // --- Estado de carga inicial ---
  if (isLoading && sessions.length === 0) {
    return (
      <div className="p-8 w-full h-full flex items-center justify-center">
        <Loader2 className="text-brand-primary animate-spin" size={32} />
      </div>
    );
  }

  // --- Error global ---
  if (error && sessions.length === 0) {
    return (
      <div className="p-8 w-full h-full flex flex-col items-center justify-center gap-4">
        <AlertCircle className="text-rose-400" size={32} />
        <div className="text-center">
          <h3 className="text-zinc-200 font-semibold">Error al cargar métricas</h3>
          <p className="text-zinc-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // --- Sin datos ---
  if (!isLoading && sessions.length === 0) {
    return (
      <div className="p-8 w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <BarChart2 className="text-zinc-500" size={24} />
        </div>
        <div className="text-center">
          <h3 className="text-zinc-200 font-semibold text-lg">Sin registros todavía</h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-xs">
            Cargá tu primer sesión de entrenamiento para ver tus métricas y gráficos de progresión acá.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full min-h-screen flex flex-col gap-8 max-w-7xl mx-auto pb-16">
      {/* --- Cabecera y Filtros --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
            <TrendingUp className="text-brand-primary" size={28} />
            Métricas y Rendimiento
          </h2>
          <p className="text-zinc-500 mt-1 text-sm">
            Progresión de cargas y distribución de volumen basadas en {totalSesiones} sesión
            {totalSesiones !== 1 ? "es" : ""} registrada{totalSesiones !== 1 ? "s" : ""}.
          </p>
        </div>
        
        {/* Selector de Rango Temporal */}
        <div className="flex items-center gap-2 bg-zinc-900/60 p-1 rounded-lg border border-zinc-800">
          <Calendar size={14} className="text-zinc-500 ml-2" />
          {(
            [
              { value: "1M", label: "4 sem" },
              { value: "3M", label: "3 meses" },
              { value: "6M", label: "6 meses" },
              { value: "ALL", label: "Todo" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeRange(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 ${
                timeRange === opt.value
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- KPIs --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Activity size={18} className="text-brand-primary" />}
          label="Sesiones Totales"
          value={String(totalSesiones)}
          sub="entrenamientos registrados"
          color="bg-brand-primary/10"
        />
        <KpiCard
          icon={<Clock size={18} className="text-violet-400" />}
          label="Duración Promedio"
          value={duracionPromedio != null ? `${duracionPromedio} min` : "—"}
          sub="por sesión"
          color="bg-violet-400/10"
        />
        <KpiCard
          icon={<Moon size={18} className="text-blue-400" />}
          label="Sueño Promedio"
          value={suenioPromedio != null ? `${suenioPromedio} hs` : "—"}
          sub="últimas sesiones"
          color="bg-blue-400/10"
        />
        <KpiCard
          icon={<Zap size={18} className="text-amber-400" />}
          label="Energía Promedio"
          value={energiaPromedio != null ? `${energiaPromedio} / 5` : "—"}
          sub="nivel reportado"
          color="bg-amber-400/10"
        />
      </div>

      {/* --- Heatmap de Adherencia --- */}
      <ActivityHeatmap sessions={sessions} />

      {/* --- Gráfico de Progresión de Cargas --- */}
      <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Progresión de Cargas</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Peso máximo y repeticiones por semana</p>
          </div>
          <div className="relative">
            <select
              value={selectedExercise}
              onChange={handleExerciseChange}
              disabled={isLoading}
              className="appearance-none pl-4 pr-10 py-2.5 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-brand-primary/60 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.nombre}>
                  {ex.nombre}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-3 text-zinc-500">▾</span>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="text-brand-primary animate-spin" size={24} />
          </div>
        ) : exerciseProgression.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-zinc-500 text-sm">
            Sin datos históricos para este ejercicio.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={exerciseProgression} margin={{ top: 16, right: 24, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="semana"
                tick={{ fill: "#71717a", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#3f3f46" }}
              />
              <YAxis
                yAxisId="left"
                domain={[
                  (dataMin: number) => Math.floor(dataMin * 0.85),
                  (dataMax: number) => Math.ceil(dataMax * 1.15),
                ]}
                tick={{ fill: "#71717a", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                label={{ value: "kg", angle: -90, position: "insideLeft", fill: "#52525b", fontSize: 11, dx: 10 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[
                  (dataMin: number) => Math.max(0, Math.floor(dataMin * 0.85)),
                  (dataMax: number) => Math.ceil(dataMax * 1.15),
                ]}
                tick={{ fill: "#71717a", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                label={{ value: "reps", angle: 90, position: "insideRight", fill: "#52525b", fontSize: 11, dx: -4 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px", color: "#a1a1aa", paddingTop: "16px" }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="peso_maximo"
                name="Peso máx. (kg)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3, fill: "#3b82f6" }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="reps_maximas"
                name="Reps máx."
                stroke="#818cf8"
                strokeWidth={2}
                dot={{ r: 3, fill: "#818cf8" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Tabla de Notas Históricas (solo visible si hay notas) */}
        {!isLoading && exerciseNotes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80">
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Notas Históricas</h4>
            <div className="max-h-48 overflow-y-auto pr-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="pb-2 font-medium w-24">Fecha</th>
                    <th className="pb-2 font-medium w-16">Serie</th>
                    <th className="pb-2 font-medium">Nota</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  {exerciseNotes.map((note, idx) => (
                    <tr key={`${note.fecha}-${note.serie}-${idx}`} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-2.5 font-mono text-[11px] text-zinc-400">{note.fecha}</td>
                      <td className="py-2.5 font-mono text-[11px]">S{note.serie}</td>
                      <td className="py-2.5">{note.notas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- Gráfico de Tonelaje por Sesión --- */}
      <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-5">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">Volumen de Tonelaje Bruto</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Sumatoria total de peso × repeticiones por sesión</p>
        </div>
        {sessionVolume.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-zinc-500 text-sm">
            Sin datos de tonelaje todavía.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={sessionVolume}
              margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
            >
              <defs>
                <linearGradient id="colorTonelaje" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="fecha"
                tick={{ fill: "#71717a", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "#3f3f46" }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs shadow-xl">
                      <p className="text-zinc-400 font-semibold mb-1">{label}</p>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-primary" />
                        <span className="text-zinc-300">Tonelaje:</span>
                        <span className="font-bold text-zinc-100">
                          {payload[0].value?.toLocaleString("es-AR")} kg
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="tonelaje_total"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTonelaje)"
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* --- Gráficos Secundarios --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volumen por Grupo Muscular */}
        <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Volumen por Grupo Muscular</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Total de series acumuladas</p>
          </div>
          {muscleVolume.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-zinc-500 text-sm">
              Sin datos de volumen todavía.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(220, muscleVolume.length * 34)}>
              <BarChart
                data={muscleVolume.map((m) => ({
                  ...m,
                  label: abreviarGrupo(m.grupo_muscular),
                }))}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                barSize={18}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#3f3f46" }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={130}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0].payload as { grupo_muscular: string; series_totales: number };
                    return (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs shadow-xl">
                        <p className="text-zinc-300 font-semibold mb-1">{item.grupo_muscular}</p>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-primary" />
                          <span className="text-zinc-400">Series:</span>
                          <span className="font-bold text-zinc-100">{item.series_totales}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="series_totales"
                  name="Series totales"
                  fill="#3b82f6"
                  radius={[0, 6, 6, 0]}
                  opacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>


        {/* Sueño vs Energía por Sesión */}
        <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Recuperación por Sesión</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Sueño (hs) · Energía (1–5) · Últimas 8 sesiones</p>
          </div>
          {sessions.filter((s) => s.suenio_horas != null || s.energia != null).length === 0 ? (
            <div className="h-56 flex items-center justify-center text-zinc-500 text-sm">
              Sin datos de recuperación todavía.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart
                data={[...sessions].reverse().slice(-8)}
                margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
                barSize={28}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="fecha"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#3f3f46" }}
                  tickFormatter={(v) => v.slice(5)}
                />
                {/* Un solo eje Y — sueño (6-9 hs) ocupa la franja alta, energía (1-5) la franja baja */}
                <YAxis
                  domain={[0, 12]}
                  ticks={[0, 3, 6, 9, 12]}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs shadow-xl">
                        <p className="text-zinc-400 font-semibold mb-2">{label}</p>
                        {payload.map((entry: any) => (
                          <div key={entry.name} className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                            <span className="text-zinc-300">{entry.name}:</span>
                            <span className="font-bold text-zinc-100">{entry.value ?? "—"}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#a1a1aa", paddingTop: "12px" }} />
                <Bar
                  dataKey="suenio_horas"
                  name="Sueño (hs)"
                  fill="#60a5fa"
                  radius={[4, 4, 0, 0]}
                  opacity={0.75}
                />
                <Line
                  type="monotone"
                  dataKey="energia"
                  name="Energía (1–5)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#f59e0b" }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
