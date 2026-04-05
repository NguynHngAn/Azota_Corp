import { useCallback, useEffect, useRef, useState } from "react";

function defaultSerialize<T>(data: T): string {
  return JSON.stringify(data);
}

export interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (payload: T) => void | Promise<void>;
  delay: number;
  enabled: boolean;
  serialize?: (data: T) => string;
  /** When this changes (e.g. exam finished loading), baseline is reset so the first snapshot is not persisted */
  resetToken?: string | number;
}

export interface UseAutoSaveResult {
  isSaving: boolean;
  lastError: Error | null;
}

/**
 * Debounced auto-save: schedules onSave after `delay` ms of stability.
 * Cancels the pending timer when `data` changes again. Skips when serialized payload matches last successful save.
 */
export function useAutoSave<T>({
  data,
  onSave,
  delay,
  enabled,
  serialize = defaultSerialize,
  resetToken = 0,
}: UseAutoSaveOptions<T>): UseAutoSaveResult {
  const [isSaving, setIsSaving] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const lastSavedStrRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTokenSeenRef = useRef(resetToken);
  const savingRef = useRef(false);
  const queuedPayloadRef = useRef<T | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const dataRef = useRef(data);
  dataRef.current = data;

  const runPersist = useCallback(
    async (payload: T) => {
      if (savingRef.current) {
        queuedPayloadRef.current = payload;
        return;
      }
      const snapshot = serialize(payload);
      if (snapshot === lastSavedStrRef.current) return;

      savingRef.current = true;
      setIsSaving(true);
      setLastError(null);
      try {
        await onSaveRef.current(payload);
        lastSavedStrRef.current = snapshot;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setLastError(err);
      } finally {
        savingRef.current = false;
        setIsSaving(false);
        const queued = queuedPayloadRef.current;
        queuedPayloadRef.current = null;
        if (queued !== null && serialize(queued) !== lastSavedStrRef.current) {
          void runPersist(queued);
        }
      }
    },
    [serialize],
  );

  useEffect(() => {
    if (resetTokenSeenRef.current !== resetToken) {
      resetTokenSeenRef.current = resetToken;
      lastSavedStrRef.current = serialize(dataRef.current);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      queuedPayloadRef.current = null;
    }
  }, [resetToken, serialize]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const current = serialize(data);
    if (lastSavedStrRef.current === null) {
      lastSavedStrRef.current = current;
      return;
    }
    if (current === lastSavedStrRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      void runPersist(dataRef.current);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [data, delay, enabled, runPersist, serialize]);

  return { isSaving, lastError };
}
