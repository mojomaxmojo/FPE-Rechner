import { DEFAULT_DAILY_GOALS } from '@/config/goals.ts';
import { useLocalStorage } from './useLocalStorage.ts';
import type { DailyGoals } from '@/types/nutrition.ts';

const STORAGE_KEY = 'daily-goals';

export function useDailyGoals() {
  const [goals, setGoals] = useLocalStorage<DailyGoals>(STORAGE_KEY, DEFAULT_DAILY_GOALS);

  const updateGoals = (partial: Partial<DailyGoals>) => {
    setGoals((prev) => ({ ...prev, ...partial }));
  };

  return { goals, updateGoals };
}
