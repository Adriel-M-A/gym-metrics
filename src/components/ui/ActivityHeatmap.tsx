import { SessionSummary } from "../../store/useMetricsStore";
import { ActivityCalendar, type ThemeInput } from "react-activity-calendar";

interface Props {
  sessions: SessionSummary[];
}

export default function ActivityHeatmap({ sessions }: Props) {
  // Configuración del tema (color sólido brand-primary o gris oscuro)
  const explicitTheme: ThemeInput = {
    light: ["#27272a", "#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6"],
    dark: ["#27272a", "#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6"],
  };

  const totalSesiones = sessions.length;
  const sesionesAnio = sessions.filter((s) => {
    const year = new Date().getFullYear();
    return s.fecha.startsWith(String(year));
  }).length;

  // Mapa rápido de sesiones (evita usar find en cada iteración)
  const sessionMap = new Set(sessions.map((s) => s.fecha));

  // Rellenar todos los días del último año
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(today);
  start.setDate(start.getDate() - 364);

  const calendarData = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const dateStr = cursor.toISOString().split("T")[0];
    const hasSession = sessionMap.has(dateStr);
    
    calendarData.push({
      date: dateStr,
      count: hasSession ? 1 : 0,
      level: hasSession ? 4 : 0,
    });
    
    cursor.setDate(cursor.getDate() + 1);
  }

  return (
    <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">Adherencia al Entrenamiento</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {sesionesAnio} sesión{sesionesAnio !== 1 ? "es" : ""} este año ·{" "}
            {totalSesiones} en total
          </p>
        </div>
      </div>

      <div className="overflow-x-auto text-zinc-400">
        <ActivityCalendar
          data={calendarData}
          theme={explicitTheme}
          colorScheme="dark"
          weekStart={1} // Inicia en Lunes
          hideColorLegend
          blockSize={12}
          blockRadius={2}
          blockMargin={3}
          labels={{
            totalCount: "{{count}} asistencias al gimnasio en el último año",
          }}
        />
      </div>
    </div>
  );
}
