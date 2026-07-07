import { Upload, LineChart, Settings } from "lucide-react";
import { useAppStore, ViewState } from "../../store/useAppStore";
import { cn } from "../../lib/cn";

export default function Sidebar() {
  const { currentView, setCurrentView } = useAppStore();

  const navItems: { id: ViewState; icon: React.ElementType; title: string }[] = [
    { id: "home", icon: Upload, title: "Cargar Sesión" },
    { id: "dashboard", icon: LineChart, title: "Dashboard" },
    { id: "settings", icon: Settings, title: "Ajustes" },
  ];

  return (
    <aside className="w-16 h-full flex flex-col items-center py-6 bg-zinc-950 border-r border-zinc-900 shrink-0">
      <div className="mb-10 text-brand-primary font-bold text-xl">GM</div>
      <nav className="flex flex-col gap-6 flex-1 w-full items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              title={item.title}
              className={cn(
                "p-3 rounded-xl transition-all duration-200 group flex items-center justify-center",
                isActive
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
