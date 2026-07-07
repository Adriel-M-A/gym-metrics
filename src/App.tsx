import "./App.css";
import AppLayout from "./components/layout/AppLayout";
import HomeView from "./pages/HomeView";
import DashboardView from "./pages/DashboardView";
import SettingsView from "./pages/SettingsView";
import { useAppStore } from "./store/useAppStore";

function App() {
  const currentView = useAppStore((state) => state.currentView);

  return (
    <AppLayout>
      {currentView === "home" && <HomeView />}
      {currentView === "dashboard" && <DashboardView />}
      {currentView === "settings" && <SettingsView />}
    </AppLayout>
  );
}

export default App;
