import { useCallback, useMemo } from 'react';

import { useLocalStorage } from './useLocalStorage.ts';
import type { MealEntry } from '@/types/nutrition.ts';

const STORAGE_KEY = 'meal-diary';

export function useMealDiary() {
  const [entries, setEntries] = useLocalStorage<MealEntry[]>(STORAGE_KEY, []);

  const addEntry = useCallback(
    (entry: MealEntry) => {
      setEntries((prev) => [...prev, entry]);
    },
    [setEntries]
  );

  const removeEntry = useCallback(
    (id: string) => {
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    },
    [setEntries]
  );

  const getEntriesForDate = useCallback(
    (dateISO: string): MealEntry[] => {
      return entries.filter((entry) => {
        const entryDate = new Date(entry.timestampMs).toISOString().slice(0, 10);
        return entryDate === dateISO;
      });
    },
    [entries]
  );

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  return { entries, addEntry, removeEntry, getEntriesForDate, todayISO };
}
