import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { MealEntry } from "@/types/nutrition";

const STORAGE_KEY = "fpe:meal-diary";

function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function useMealDiary() {
  const [entries, setEntries] = useLocalStorage<MealEntry[]>(STORAGE_KEY, []);

  const addEntry = useCallback(
    (entry: MealEntry) => {
      setEntries((prev) => [...prev, entry]);
    },
    [setEntries],
  );

  const removeEntry = useCallback(
    (id: string) => {
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    },
    [setEntries],
  );

  const getEntriesForDate = useCallback(
    (dateISO: string): MealEntry[] => {
      return entries.filter((entry) => {
        const entryDate = new Date(entry.timestampMs).toISOString().split("T")[0];
        return entryDate === dateISO;
      });
    },
    [entries],
  );

  const todayISO = useMemo(() => getTodayISO(), []);

  return {
    entries,
    addEntry,
    removeEntry,
    getEntriesForDate,
    todayISO,
  };
}
