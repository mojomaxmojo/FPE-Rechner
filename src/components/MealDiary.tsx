import { useState } from "react";
import { useMealDiary } from "@/hooks/useMealDiary";
import { FoodSearch } from "./FoodSearch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FoodItem, MealEntry, MealType } from "@/types/nutrition";
import { scaleNutrients, calculateFpe, calculateNetCarbs, calculateCalories } from "@/lib/fpe";
import { Trash2 } from "lucide-react";

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Frühstück",
  lunch: "Mittag",
  dinner: "Abend",
  snack: "Snack",
};

export function MealDiary() {
  const { entries, addEntry, removeEntry, getEntriesForDate, todayISO } = useMealDiary();
  const todaysEntries = getEntriesForDate(todayISO);

  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [amountG, setAmountG] = useState<number>(100);
  const [mealType, setMealType] = useState<MealType>("breakfast");

  const totals = todaysEntries.reduce(
    (acc, entry) => {
      const scaled = scaleNutrients(entry.foodItem.nutrientsPer100g, entry.amountG);
      acc.kcal += calculateCalories(scaled.carbsG, scaled.proteinG, scaled.fatG);
      acc.netCarbs += calculateNetCarbs(scaled.carbsG, scaled.fiberG);
      acc.fpe += calculateFpe(scaled.fatG, scaled.proteinG);
      return acc;
    },
    { kcal: 0, netCarbs: 0, fpe: 0 },
  );

  const groupedEntries: Record<MealType, MealEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  for (const entry of todaysEntries) {
    groupedEntries[entry.mealType].push(entry);
  }

  const handleAdd = () => {
    if (!selectedItem || amountG <= 0) return;

    const newEntry: MealEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      foodItem: selectedItem,
      amountG,
      mealType,
      timestampMs: Date.now(),
    };

    addEntry(newEntry);
    setSelectedItem(null);
    setAmountG(100);
    setMealType("breakfast");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mahlzeiten-Tagebuch</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">kcal</p>
            <p className="text-lg font-semibold">{Math.round(totals.kcal)}</p>
          </div>
          <div className="rounded-xl bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">Netto-KH</p>
            <p className="text-lg font-semibold">{totals.netCarbs.toFixed(1)}g</p>
          </div>
          <div className="rounded-xl bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">FPE</p>
            <p className="text-lg font-semibold">{totals.fpe.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-3 border rounded-xl p-4">
          <h3 className="font-medium">Neuer Eintrag</h3>
          <FoodSearch onSelect={setSelectedItem} />

          {selectedItem && (
            <>
              <div className="space-y-1">
                <Label htmlFor="meal-amount">Menge (g)</Label>
                <Input
                  id="meal-amount"
                  type="number"
                  min={1}
                  value={amountG}
                  onChange={(e) => setAmountG(Number(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1">
                <Label>Mahlzeit</Label>
                <Select value={mealType} onValueChange={(value) => setMealType(value as MealType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Frühstück</SelectItem>
                    <SelectItem value="lunch">Mittag</SelectItem>
                    <SelectItem value="dinner">Abend</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAdd} className="w-full">
                Zur {MEAL_TYPE_LABELS[mealType]} hinzufügen
              </Button>
            </>
          )}
        </div>

        <div className="space-y-4">
          {(Object.keys(groupedEntries) as MealType[]).map((type) => {
            const group = groupedEntries[type];
            if (group.length === 0) return null;

            return (
              <div key={type} className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                  {MEAL_TYPE_LABELS[type]}
                </h3>
                <div className="space-y-2">
                  {group.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-xl border p-3"
                    >
                      <div>
                        <p className="font-medium">{entry.foodItem.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.amountG}g ·{" "}
                          {calculateFpe(
                            scaleNutrients(entry.foodItem.nutrientsPer100g, entry.amountG).fatG,
                            scaleNutrients(entry.foodItem.nutrientsPer100g, entry.amountG).proteinG,
                          ).toFixed(2)}{" "}
                          FPE
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEntry(entry.id)}
                        aria-label="Eintrag löschen"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {todaysEntries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Heute noch keine Einträge.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
