import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';

import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { FoodSearch } from '@/components/FoodSearch.tsx';
import { DailyGoalsCard } from '@/components/DailyGoalsCard.tsx';
import { FpeCalculatorCard } from '@/components/FpeCalculatorCard.tsx';
import { MealDiary } from '@/components/MealDiary.tsx';
import { APP_NAME } from '@/config/app.ts';
import { useMealDiary } from '@/hooks/useMealDiary.ts';
import type { FoodItem, MealEntry, MealType } from '@/types/nutrition.ts';

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittag',
  dinner: 'Abend',
  snack: 'Snack',
};

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const Index = () => {
  useSeoMeta({
    title: APP_NAME,
    description: 'FPE-Rechner und Mahlzeiten-Tagebuch für Typ-1-Diabetes und Keto.',
  });

  const { entries, addEntry, getEntriesForDate, todayISO } = useMealDiary();
  const [pendingFoodItem, setPendingFoodItem] = useState<FoodItem | null>(null);
  const [mealType, setMealType] = useState<MealType>('snack');
  const [amountG, setAmountG] = useState(100);

  const todayEntries = getEntriesForDate(todayISO);

  const handleSelectFood = (foodItem: FoodItem) => {
    setPendingFoodItem(foodItem);
    setMealType('snack');
    setAmountG(100);
  };

  const handleAddEntry = () => {
    if (!pendingFoodItem) return;
    const entry: MealEntry = {
      id: createId(),
      foodItem: pendingFoodItem,
      amountG,
      mealType,
      timestampMs: Date.now(),
    };
    addEntry(entry);
    setPendingFoodItem(null);
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

        {pendingFoodItem && (
          <div className="rounded-xl border p-4 space-y-4">
            <h2 className="font-semibold">{pendingFoodItem.name} hinzufügen</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="meal-type">Mahlzeit</Label>
                <Select value={mealType} onValueChange={(value) => setMealType(value as MealType)}>
                  <SelectTrigger id="meal-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(mealTypeLabels) as MealType[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {mealTypeLabels[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Menge (g)</Label>
                <Input
                  id="amount"
                  type="number"
                  min={1}
                  value={amountG}
                  onChange={(e) => setAmountG(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddEntry}>Hinzufügen</Button>
              <Button variant="outline" onClick={() => setPendingFoodItem(null)}>
                Abbrechen
              </Button>
            </div>
          </div>
        )}

        <DailyGoalsCard />
        <FpeCalculatorCard items={todayEntries} />
        <MealDiary />
      </div>
    </div>
  );
};

export default Index;
