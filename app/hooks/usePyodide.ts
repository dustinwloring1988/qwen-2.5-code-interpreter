import { useState, useEffect, useCallback } from "react";

export interface PyodideResult {
  results: {
    stdout: string;
    result: unknown;
  } | null;
  error: string | null;
}

export function usePyodide() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const pyodideWorker = new Worker(
      new URL("../workers/pyodideWorker.ts", import.meta.url),
    );
    setWorker(pyodideWorker);

    return () => {
      pyodideWorker.terminate();
    };
  }, []);

  const runPython = useCallback(
    (code: string): Promise<PyodideResult> => {
      return new Promise((resolve, reject) => {
        if (!worker) {
          reject(new Error("Worker not initialized"));
          return;
        }

        setIsLoading(true);

        const messageId = Date.now().toString();

        const messageHandler = (event: MessageEvent) => {
          if (event.data.id === messageId) {
            setIsLoading(false);
            worker.removeEventListener("message", messageHandler);

            if (event.data.results) {
              resolve({ results: event.data.results, error: null });
            } else if (event.data.error) {
              resolve({ results: null, error: event.data.error });
            }
          }
        };

        worker.addEventListener("message", messageHandler);
        worker.postMessage({ id: messageId, python: code });
      });
    },
    [worker],
  );

  return { runPython, isLoading };
}
