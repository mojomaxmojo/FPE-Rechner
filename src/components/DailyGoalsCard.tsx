import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Progress } from '@/components/ui/progress.tsx';
import { useDailyGoals } from '@/hooks/useDailyGoals.ts';
import { useMealDiary } from '@/hooks/useMealDiary.ts';
import {
  calculateFpe,
  calculateNetCarbs,
  scaleNutrients,
} from '@/lib/fpe.ts';

function formatNumber(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

export function DailyGoalsCard() {
  const { goals, updateGoals } = useDailyGoals();
  const { getEntriesForDate, todayISO } = useMealDiary();
  const todayEntries = getEntriesForDate(todayISO);

  const totals = todayEntries.reduce(
    (acc, entry) => {
      const scaled = scaleNutrients(entry.foodItem.nutrientsPer100g, entry.amountG);
      acc.carbsG += scaled.carbsG;
      acc.netCarbs += calculateNetCarbs(scaled.carbsG, scaled.fiberG);
      acc.fpe += calculateFpe(scaled.fatG, scaled.proteinG);
      acc.kcal += scaled.kcal;
      return acc;
    },
    { carbsG: 0, netCarbs: 0, fpe: 0, kcal: 0 }
  );

  const carbsPct = Math.min(100, (totals.carbsG / goals.maxCarbsG) * 100);
  const netCarbsPct = Math.min(100, (totals.netCarbs / goals.maxNetCarbsG) * 100);
  const fpePct = Math.min(100, (totals.fpe / goals.targetFpe) * 100);
  const kcalPct = Math.min(100, (totals.kcal / goals.targetKcal) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tagesziele</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <GoalRow
          label="Kohlenhydrate"
          current={totals.carbsG}
          target={goals.maxCarbsG}
          value={carbsPct}
          unit="g"
          onTargetChange={(value) => updateGoals({ maxCarbsG: value })}
        />
        <GoalRow
          label="Netto-Kohlenhydrate"
          current={totals.netCarbs}
          target={goals.maxNetCarbsG}
          value={netCarbsPct}
          unit="g"
          onTargetChange={(value) => updateGoals({ maxNetCarbsG: value })}
        />
        <GoalRow
          label="FPE"
          current={totals.fpe}
          target={goals.targetFpe}
          value={fpePct}
          unit=""
          onTargetChange={(value) => updateGoals({ targetFpe: value })}
        />
        <GoalRow
          label="Kalorien"
          current={totals.kcal}
          target={goals.targetKcal}
          value={kcalPct}
          unit="kcal"
          onTargetChange={(value) => updateGoals({ targetKcal: value })}
        />
      </CardContent>
    </Card>
  );
}

interface GoalRowProps {
  label: string;
  current: number;
  target: number;
  value: number;
  unit: string;
  onTargetChange: (value: number) => void;
}

function GoalRow({ label, current, target, value, unit, onTargetChange }: GoalRowProps) {
  const overLimit = current > target;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {formatNumber(current)} / {target} {unit}
        </span>
      </div>
      <Progress value={value} className={overLimit ? 'bg-destructive/20' : undefined} />
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Ziel:</Label>
        <Input
          type="number"
          min={1}
          value={target}
          onChange={(e) => onTargetChange(Number(e.target.value))}
          className="h-7 w-24 text-sm"
        />
      </div>
    </div>
  );
}
