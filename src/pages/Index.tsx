import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';

import { FoodSearch } from '@/components/FoodSearch.tsx';
import { FpeCalculatorCard } from '@/components/FpeCalculatorCard.tsx';
import { APP_NAME } from '@/config/app.ts';
import type { FoodItem, MealEntry, MealType } from '@/types/nutrition.ts';

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const Index = () => {
  useSeoMeta({
    title: APP_NAME,
    description: 'FPE-Rechner und Mahlzeiten-Tagebuch für Typ-1-Diabetes und Keto.',
  });

  const [entries, setEntries] = useState<MealEntry[]>([]);

  const handleSelectFood = (foodItem: FoodItem) => {
    const entry: MealEntry = {
      id: createId(),
      foodItem,
      amountG: 100,
      mealType: 'snack' as MealType,
      timestampMs: Date.now(),
    };
    setEntries((prev) => [...prev, entry]);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">{APP_NAME}</h1>
          <p className="text-muted-foreground mt-2">
            Lebensmittel suchen und FPE berechnen.
          </p>
        </div>

        <FoodSearch onSelect={handleSelectFood} />
        <FpeCalculatorCard items={entries} />
      </div>
    </div>
  );
};

export default Index;
