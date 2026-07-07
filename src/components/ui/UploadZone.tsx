import { useEffect, useState, useCallback, useRef } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { UploadCloud, FileJson, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/cn";

type UploadState = "idle" | "success" | "error";

/** Parsea el texto JSON y actualiza el estado del componente según el resultado */
function processContent(
  content: string,
  name: string,
  setters: {
    setUploadState: (s: UploadState) => void;
    setFileName: (s: string | null) => void;
    setMessage: (s: string | null) => void;
    setPreview: (s: string | null) => void;
  }
) {
  try {
    const parsed = JSON.parse(content);
    const keys = Object.keys(parsed);
    setters.setUploadState("success");
    setters.setFileName(name);
    setters.setMessage("Archivo leído correctamente.");
    setters.setPreview(`Claves detectadas: ${keys.join(", ")}`);
  } catch {
    setters.setUploadState("error");
    setters.setMessage("El contenido del archivo no es un JSON válido. Verificá que esté bien formado.");
    setters.setFileName(null);
    setters.setPreview(null);
  }
}

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setters = { setUploadState, setFileName, setMessage, setPreview };

  /** Listener de drag-drop nativo de Tauri 2 — recibe rutas del OS */
  useEffect(() => {
    // Guardamos la Promise directamente para el cleanup, evitando race condition
    const unlistenPromise = getCurrentWebview().onDragDropEvent(async (event) => {
      if (event.payload.type === "over") {
        setIsDragging(true);
      } else if (event.payload.type === "drop") {
        setIsDragging(false);
        const paths = event.payload.paths;
        if (paths.length === 0) return;

        const filePath = paths[0];
        const name = filePath.split(/[\\/]/).pop() ?? filePath;

        if (!name.endsWith(".json")) {
          setUploadState("error");
          setMessage("El archivo tiene que tener extensión .json");
          setFileName(null);
          setPreview(null);
          return;
        }

        try {
          const content = await readTextFile(filePath);
          processContent(content, name, setters);
        } catch {
          setUploadState("error");
          setMessage("No se pudo leer el archivo. Verificá que tengas acceso a esa ruta.");
          setFileName(null);
          setPreview(null);
        }
      } else {
        setIsDragging(false);
      }
    });

    return () => {
      unlistenPromise.then((fn) => fn());
    };
  }, []);

  /** Fallback: selección manual con input file nativo del browser */
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    e.target.value = "";

    if (!file.name.endsWith(".json")) {
      setUploadState("error");
      setMessage("El archivo tiene que tener extensión .json");
      setFileName(null);
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      processContent(ev.target?.result as string, file.name, setters);
    };
    reader.readAsText(file);
  }, []);

  const handleClick = () => inputRef.current?.click();

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">
      <input ref={inputRef} type="file" accept=".json" onChange={handleFileInput} className="hidden" />

      <div
        onClick={handleClick}
        className={cn(
          "w-full rounded-2xl border-2 border-dashed p-16 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer select-none",
          isDragging
            ? "border-brand-primary bg-brand-primary/5"
            : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50"
        )}
      >
        <div
          className={cn(
            "p-4 rounded-full mb-6 transition-colors duration-200",
            isDragging ? "bg-brand-primary/20 text-brand-primary" : "bg-zinc-900 text-zinc-500"
          )}
        >
          {isDragging ? <FileJson size={40} /> : <UploadCloud size={40} />}
        </div>

        <h3 className="text-xl font-semibold text-zinc-200 mb-2">
          Subí tu sesión de entrenamiento
        </h3>
        <p className="text-zinc-500 text-center max-w-md">
          Arrastrá tu archivo{" "}
          <span className="font-mono text-zinc-400">serie_X.json</span> acá o hacé clic para buscarlo.
        </p>
      </div>

      {uploadState === "success" && fileName && (
        <div className="flex flex-col gap-2 p-4 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-emerald-400">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="shrink-0" />
            <p className="text-sm font-medium">{message}</p>
          </div>
          <p className="text-xs text-emerald-600 font-mono pl-8">{fileName}</p>
          {preview && <p className="text-xs text-emerald-700 font-mono pl-8 mt-1">{preview}</p>}
        </div>
      )}

      {uploadState === "error" && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{message}</p>
        </div>
      )}
    </div>
  );
}
