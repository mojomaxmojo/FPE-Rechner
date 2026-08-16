import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useMealDiary } from '@/hooks/useMealDiary.ts';
import {
  calculateCalories,
  calculateFpe,
  calculateNetCarbs,
  scaleNutrients,
} from '@/lib/fpe.ts';
import type { MealEntry, MealType } from '@/types/nutrition.ts';

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittag',
  dinner: 'Abend',
  snack: 'Snack',
};

function formatNumber(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

export function MealDiary() {
  const { entries, removeEntry, getEntriesForDate, todayISO } = useMealDiary();
  const todayEntries = getEntriesForDate(todayISO);

  const totals = todayEntries.reduce(
    (acc, entry) => {
      const scaled = scaleNutrients(entry.foodItem.nutrientsPer100g, entry.amountG);
      acc.kcal += scaled.kcal;
      acc.netCarbs += calculateNetCarbs(scaled.carbsG, scaled.fiberG);
      acc.fpe += calculateFpe(scaled.fatG, scaled.proteinG);
      return acc;
    },
    { kcal: 0, netCarbs: 0, fpe: 0 }
  );

  const grouped: Record<MealType, MealEntry[]> = {
    breakfast: todayEntries.filter((e) => e.mealType === 'breakfast'),
    lunch: todayEntries.filter((e) => e.mealType === 'lunch'),
    dinner: todayEntries.filter((e) => e.mealType === 'dinner'),
    snack: todayEntries.filter((e) => e.mealType === 'snack'),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mahlzeiten-Tagebuch</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Heute wurden noch keine Mahlzeiten eingetragen.
          </p>
        ) : (
          (Object.keys(grouped) as MealType[]).map((mealType) => {
            const groupEntries = grouped[mealType];
            if (groupEntries.length === 0) return null;
            return (
              <div key={mealType}>
                <h3 className="font-semibold mb-2">{mealTypeLabels[mealType]}</h3>
                <ul className="space-y-2">
                  {groupEntries.map((entry) => {
                    const scaled = scaleNutrients(
                      entry.foodItem.nutrientsPer100g,
                      entry.amountG
                    );
                    return (
                      <li
                        key={entry.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <div className="font-medium">
                            {entry.amountG} g {entry.foodItem.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatNumber(scaled.kcal)} kcal ·{' '}
                            {formatNumber(calculateNetCarbs(scaled.carbsG, scaled.fiberG))} g
                            Netto-KH · {formatNumber(calculateFpe(scaled.fatG, scaled.proteinG))}{' '}
                            FPE
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeEntry(entry.id)}
                        >
                          Löschen
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}

        {todayEntries.length > 0 && (
          <div className="rounded-lg bg-muted p-4">
            <div className="font-semibold">Tagessumme</div>
            <div className="text-sm">
              {formatNumber(totals.kcal)} kcal · {formatNumber(totals.netCarbs)} g Netto-KH ·{' '}
              {formatNumber(totals.fpe)} FPE
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
