import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FoodItem } from "@/types/nutrition";
import {
  scaleNutrients,
  calculateFpe,
  calculateNetCarbs,
  calculateCalories,
  calculateMacroPercentages,
} from "@/lib/fpe";

interface FpeCalculatorCardProps {
  item: FoodItem;
  amountG: number;
}

export function FpeCalculatorCard({ item, amountG }: FpeCalculatorCardProps) {
  const scaled = scaleNutrients(item.nutrientsPer100g, amountG);
  const fpe = calculateFpe(scaled.fatG, scaled.proteinG);
  const netCarbs = calculateNetCarbs(scaled.carbsG, scaled.fiberG);
  const calories = calculateCalories(scaled.carbsG, scaled.proteinG, scaled.fatG);
  const macros = calculateMacroPercentages(scaled);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {amountG}g · {item.brand ? item.brand : "Open Food Facts"}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-muted p-3">
            <p className="text-xs text-muted-foreground">kcal</p>
            <p className="text-xl font-semibold">{Math.round(calories)}</p>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <p className="text-xs text-muted-foreground">Netto-KH</p>
            <p className="text-xl font-semibold">{netCarbs.toFixed(1)}g</p>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <p className="text-xs text-muted-foreground">FPE</p>
            <p className="text-xl font-semibold">{fpe.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <p className="text-xs text-muted-foreground">Fett</p>
            <p className="text-xl font-semibold">{scaled.fatG.toFixed(1)}g</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Makro-Verteilung</p>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="bg-primary"
              style={{ width: `${macros.carbsPct}%` }}
            />
            <div
              className="bg-accent"
              style={{ width: `${macros.proteinPct}%` }}
            />
            <div
              className="bg-secondary"
              style={{ width: `${macros.fatPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>KH {macros.carbsPct}%</span>
            <span>Eiweiß {macros.proteinPct}%</span>
            <span>Fett {macros.fatPct}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
