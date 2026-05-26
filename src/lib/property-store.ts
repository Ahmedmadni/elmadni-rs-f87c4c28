import { useEffect, useState, useCallback } from "react";

const FAV_KEY = "madni:favorites";
const CMP_KEY = "madni:compare";
export const COMPARE_LIMIT = 4;

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(key: string, ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(ids));
  emit();
}

function useStoreKey(key: string): [string[], (ids: string[]) => void] {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(read(key));
    const l: Listener = () => setIds(read(key));
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) l();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  }, [key]);

  const set = useCallback((next: string[]) => write(key, next), [key]);
  return [ids, set];
}

export function useFavorites() {
  const [ids, set] = useStoreKey(FAV_KEY);
  const has = (id: string) => ids.includes(id);
  const toggle = (id: string) =>
    set(has(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  return { ids, has, toggle };
}

export function useCompare() {
  const [ids, set] = useStoreKey(CMP_KEY);
  const has = (id: string) => ids.includes(id);
  const toggle = (id: string) => {
    if (has(id)) set(ids.filter((x) => x !== id));
    else if (ids.length < COMPARE_LIMIT) set([...ids, id]);
  };
  const clear = () => set([]);
  return { ids, has, toggle, clear, full: ids.length >= COMPARE_LIMIT };
}