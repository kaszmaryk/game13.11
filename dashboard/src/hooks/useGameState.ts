import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState } from "@/types/game";

/** Epoch-ms timestamp of the last successful context fetch. */
export type LastUpdatedMs = number | null;

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Epoch ms when context was last successfully fetched (or its embedded lastUpdated). */
  const [lastUpdatedMs, setLastUpdatedMs] = useState<LastUpdatedMs>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  /** Track the raw JSON string to detect actual content changes across polls. */
  const prevJsonRef = useRef<string | null>(null);

  const fetchGameState = useCallback(async () => {
    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Only show loading spinner on initial fetch, not on background polls
    const isInitialFetch = prevJsonRef.current === null;
    if (isInitialFetch) {
      setLoading(true);
    }

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}context.json`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Не удалось загрузить данные: ${response.status} ${response.statusText}`,
        );
      }

      const text = await response.text();

      // Only update state + timer when content actually changed
      if (text !== prevJsonRef.current) {
        prevJsonRef.current = text;
        const data: GameState = JSON.parse(text);

        // Prefer an embedded lastUpdated ISO string; fall back to now
        const anchor = data.lastUpdated
          ? new Date(data.lastUpdated).getTime()
          : Date.now();

        setGameState(data);
        setLastUpdatedMs(anchor);
        setError(null);
      }
    } catch (err) {
      // Ignore aborted requests
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      console.error("Error fetching game state:", err);
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить состояние игры",
      );
    } finally {
      if (isInitialFetch) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchGameState();

    // Set up polling for updates (every 30 seconds)
    const interval = setInterval(fetchGameState, 30000);

    return () => {
      clearInterval(interval);
      abortControllerRef.current?.abort();
    };
  }, [fetchGameState]);

  const retry = useCallback(() => {
    fetchGameState();
  }, [fetchGameState]);

  return { gameState, loading, error, retry, lastUpdatedMs };
}
