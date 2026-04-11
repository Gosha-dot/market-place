'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { safeJsonParse } from '@/utils/storage';

export function useSyncedLocalStorageState<T>({
  key,
  initialValue,
  writeDebounceMs = 200
}: {
  key: string;
  initialValue: T;
  writeDebounceMs?: number;
}) {
  const [value, setValue] = useState<T>(initialValue);
  const writeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fromStorage = safeJsonParse<T>(window.localStorage.getItem(key));
    if (fromStorage !== null) setValue(fromStorage);
  }, [key]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      const next = safeJsonParse<T>(e.newValue);
      if (next !== null) setValue(next);
      if (next === null && e.newValue === null) setValue(initialValue);
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [initialValue, key]);

  const scheduleWrite = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return (next: T) => {
      if (writeTimeoutRef.current) clearTimeout(writeTimeoutRef.current);
      writeTimeoutRef.current = setTimeout(() => {
        window.localStorage.setItem(key, JSON.stringify(next));
      }, writeDebounceMs);
    };
  }, [key, writeDebounceMs]);

  const setAndPersist = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        scheduleWrite?.(resolved);
        return resolved;
      });
    },
    [scheduleWrite]
  );

  return [value, setAndPersist] as const;
}

