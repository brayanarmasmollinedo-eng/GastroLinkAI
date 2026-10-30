"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { DemoState } from "@/domain/types";
import {
  BrowserDemoRepository,
  STORAGE_KEY,
} from "@/repositories/demo-repository";
import { createSeed } from "@/data/seed";
interface DemoContextValue {
  state: DemoState;
  ready: boolean;
  error: string;
  mutate: <T>(command: (state: DemoState) => T) => T;
  reset: () => void;
}
const DemoContext = createContext<DemoContextValue | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => createSeed());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const refresh = () => {
      try {
        setState(new BrowserDemoRepository().load());
        setError("");
      } catch {
        setError(
          "No pudimos leer los datos de este navegador. Puedes restablecer la demo desde el pie de página.",
        );
      }
      setReady(true);
    };
    refresh();
    const listen = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", listen);
    return () => window.removeEventListener("storage", listen);
  }, []);
  const mutate = useCallback(<T,>(command: (draft: DemoState) => T): T => {
    const repository = new BrowserDemoRepository();
    const draft = repository.load();
    const result = command(draft);
    try {
      repository.save(draft);
    } catch {
      throw new Error(
        "No hay espacio o permiso para guardar. Habilita el almacenamiento del navegador.",
      );
    }
    setState(draft);
    return result;
  }, []);
  const reset = () => {
    const fresh = createSeed();
    try {
      new BrowserDemoRepository().save(fresh);
      setState(fresh);
      setError("");
    } catch {
      setError("El navegador no permite guardar datos locales.");
    }
  };
  return (
    <DemoContext.Provider value={{ state, ready, error, mutate, reset }}>
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}
      {children}
    </DemoContext.Provider>
  );
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("Falta DemoProvider");
  return context;
}
