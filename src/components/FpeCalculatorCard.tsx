import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import {
  calculateCalories,
  calculateFpe,
  calculateMacroPercentages,
  calculateNetCarbs,
  scaleNutrients,
} from '@/lib/fpe.ts';
import type { MealEntry } from '@/types/nutrition.ts';

interface FpeCalculatorCardProps {
  items: MealEntry[];
}

function formatNumber(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

export function FpeCalculatorCard({ items }: FpeCalculatorCardProps) {
  const totals = items.reduce(
    (acc, entry) => {
      const scaled = scaleNutrients(entry.foodItem.nutrientsPer100g, entry.amountG);
      acc.kcal += scaled.kcal;
      acc.netCarbs += calculateNetCarbs(scaled.carbsG, scaled.fiberG);
      acc.fpe += calculateFpe(scaled.fatG, scaled.proteinG);
      acc.carbsG += scaled.carbsG;
      acc.proteinG += scaled.proteinG;
      acc.fatG += scaled.fatG;
      return acc;
    },
    { kcal: 0, netCarbs: 0, fpe: 0, carbsG: 0, proteinG: 0, fatG: 0 }
  );

  const totalMacros = calculateMacroPercentages({
    kcal: totals.kcal,
    carbsG: totals.carbsG,
    fiberG: 0,
    proteinG: totals.proteinG,
    fatG: totals.fatG,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>FPE-Rechner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Füge Lebensmittel hinzu, um FPE und Makros zu berechnen.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((entry) => {
              const scaled = scaleNutrients(entry.foodItem.nutrientsPer100g, entry.amountG);
              const macros = calculateMacroPercentages(scaled);
              return (
                <li key={entry.id} className="rounded-lg border p-3">
                  <div className="font-medium">
                    {entry.amountG} g {entry.foodItem.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatNumber(scaled.kcal)} kcal ·{' '}
                    {formatNumber(calculateNetCarbs(scaled.carbsG, scaled.fiberG))} g Netto-KH ·{' '}
                    {formatNumber(calculateFpe(scaled.fatG, scaled.proteinG))} FPE
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    KH {formatNumber(macros.carbsPct)}% · Protein{' '}
                    {formatNumber(macros.proteinPct)}% · Fett {formatNumber(macros.fatPct)}%
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {items.length > 0 && (
          <div className="rounded-lg bg-muted p-4 space-y-1">
            <div className="font-semibold">Gesamtsumme</div>
            <div className="text-sm">
              {formatNumber(totals.kcal)} kcal · {formatNumber(totals.netCarbs)} g Netto-KH ·{' '}
              {formatNumber(totals.fpe)} FPE
            </div>
            <div className="text-xs text-muted-foreground">
              KH {formatNumber(totalMacros.carbsPct)}% · Protein{' '}
              {formatNumber(totalMacros.proteinPct)}% · Fett {formatNumber(totalMacros.fatPct)}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
