import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { DEFAULT_DAILY_GOALS } from "@/config/goals";
import type { DailyGoals } from "@/types/nutrition";

const STORAGE_KEY = "fpe:daily-goals";

export function useDailyGoals() {
  const [goals, setGoals] = useLocalStorage<DailyGoals>(
    STORAGE_KEY,
    DEFAULT_DAILY_GOALS,
  );

  const updateGoals = useCallback(
    (partial: Partial<DailyGoals>) => {
      setGoals((prev) => ({ ...prev, ...partial }));
    },
    [setGoals],
  );

  return {
    goals,
    updateGoals,
  };
}
