import { useEffect, useState, useCallback, useRef } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { UploadCloud, FileJson, AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";
import { SessionSchema } from "../../types/session";
import { useSessionStore } from "../../store/useSessionStore";

type UploadState = "idle" | "error";

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const setSession = useSessionStore((state) => state.setSession);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Valida el JSON con Zod y actualiza el Zustand store si es correcto */
  const validateAndSetJson = (jsonString: string) => {
    try {
      const rawJson = JSON.parse(jsonString);
      const result = SessionSchema.safeParse(rawJson);

      if (!result.success) {
        // Formatear los errores de Zod de forma amigable en español
        const errors = result.error.issues.map((issue) => {
          const field = issue.path.join(" -> ");
          return `Campo "${field}": ${issue.message}`;
        });
        setUploadState("error");
        setErrorMessage(`El archivo JSON no cumple con la estructura requerida:\n${errors.slice(0, 3).join("\n")}`);
        return;
      }

      setUploadState("idle");
      setErrorMessage(null);
      setSession(result.data);
    } catch {
      setUploadState("error");
      setErrorMessage("El contenido del archivo no es un JSON válido. Verificá que esté bien formado.");
    }
  };

  /** Listener de drag-drop nativo de Tauri 2 */
  useEffect(() => {
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
          setErrorMessage("Por favor, subí únicamente archivos con extensión .json");
          return;
        }

        try {
          const content = await readTextFile(filePath);
          validateAndSetJson(content);
        } catch {
          setUploadState("error");
          setErrorMessage("No se pudo leer el archivo. Verificá que la aplicación tenga permisos.");
        }
      } else {
        setIsDragging(false);
      }
    });

    return () => {
      unlistenPromise.then((fn) => fn());
    };
  }, []);

  /** Fallback: selector de archivos manual */
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    e.target.value = "";

    if (!file.name.endsWith(".json")) {
      setUploadState("error");
      setErrorMessage("Por favor, subí únicamente archivos con extensión .json");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        validateAndSetJson(ev.target.result);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleClick = () => inputRef.current?.click();

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        onChange={handleFileInput}
        className="hidden"
      />

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

      {uploadState === "error" && errorMessage && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div className="flex-1 text-sm whitespace-pre-line leading-relaxed">
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
}
