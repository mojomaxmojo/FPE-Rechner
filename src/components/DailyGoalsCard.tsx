import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useDailyGoals } from "@/hooks/useDailyGoals";
import { useMealDiary } from "@/hooks/useMealDiary";
import { scaleNutrients, calculateFpe, calculateNetCarbs, calculateCalories } from "@/lib/fpe";
import { Settings2 } from "lucide-react";

export function DailyGoalsCard() {
  const { goals, updateGoals } = useDailyGoals();
  const { getEntriesForDate, todayISO } = useMealDiary();
  const [showEdit, setShowEdit] = useState(false);

  const totals = useMemo(() => {
    const entries = getEntriesForDate(todayISO);
    return entries.reduce(
      (acc, entry) => {
        const scaled = scaleNutrients(entry.foodItem.nutrientsPer100g, entry.amountG);
        acc.kcal += calculateCalories(scaled.carbsG, scaled.proteinG, scaled.fatG);
        acc.carbsG += scaled.carbsG;
        acc.netCarbsG += calculateNetCarbs(scaled.carbsG, scaled.fiberG);
        acc.fpe += calculateFpe(scaled.fatG, scaled.proteinG);
        return acc;
      },
      { kcal: 0, carbsG: 0, netCarbsG: 0, fpe: 0 },
    );
  }, [getEntriesForDate, todayISO]);

  const carbsPct = Math.min(100, (totals.carbsG / goals.maxCarbsG) * 100);
  const netCarbsPct = Math.min(100, (totals.netCarbsG / goals.maxNetCarbsG) * 100);
  const fpePct = Math.min(100, (totals.fpe / goals.targetFpe) * 100);
  const kcalPct = Math.min(100, (totals.kcal / goals.targetKcal) * 100);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tagesziele</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setShowEdit((s) => !s)}>
          <Settings2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {showEdit && (
          <div className="grid grid-cols-2 gap-4 border rounded-xl p-4">
            <div className="space-y-1">
              <Label htmlFor="goal-carbs">max. KH (g)</Label>
              <Input
                id="goal-carbs"
                type="number"
                min={1}
                value={goals.maxCarbsG}
                onChange={(e) =>
                  updateGoals({ maxCarbsG: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="goal-net-carbs">max. Netto-KH (g)</Label>
              <Input
                id="goal-net-carbs"
                type="number"
                min={1}
                value={goals.maxNetCarbsG}
                onChange={(e) =>
                  updateGoals({ maxNetCarbsG: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="goal-fpe">Ziel FPE</Label>
              <Input
                id="goal-fpe"
                type="number"
                min={1}
                step={0.1}
                value={goals.targetFpe}
                onChange={(e) =>
                  updateGoals({ targetFpe: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="goal-kcal">Ziel kcal</Label>
              <Input
                id="goal-kcal"
                type="number"
                min={1}
                value={goals.targetKcal}
                onChange={(e) =>
                  updateGoals({ targetKcal: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>
        )}

        <GoalRow label="Kohlenhydrate" current={totals.carbsG} target={goals.maxCarbsG} unit="g" pct={carbsPct} />
        <GoalRow label="Netto-Kohlenhydrate" current={totals.netCarbsG} target={goals.maxNetCarbsG} unit="g" pct={netCarbsPct} />
        <GoalRow label="FPE" current={totals.fpe} target={goals.targetFpe} unit="" pct={fpePct} />
        <GoalRow label="kcal" current={totals.kcal} target={goals.targetKcal} unit="" pct={kcalPct} />
      </CardContent>
    </Card>
  );
}

function GoalRow({
  label,
  current,
  target,
  unit,
  pct,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  pct: number;
}) {
  const overLimit = current > target && target > 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className={overLimit ? "text-destructive font-medium" : "text-muted-foreground"}>
          {unit ? `${current.toFixed(1)}${unit}` : Math.round(current)} /{" "}
          {unit ? `${target}${unit}` : Math.round(target)}
        </span>
      </div>
      <Progress
        value={pct}
        className={overLimit ? "bg-destructive/20" : undefined}
      />
    </div>
  );
}
