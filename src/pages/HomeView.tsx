import UploadZone from "../components/ui/UploadZone";

export default function HomeView() {
  return (
    <div className="p-10 w-full h-full flex flex-col items-center justify-center">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-zinc-100 mb-3">Cargar Sesión</h2>
        <p className="text-zinc-500">Procesá y visualizá los datos de tu último entrenamiento.</p>
      </div>
      <UploadZone />
    </div>
  );
}
