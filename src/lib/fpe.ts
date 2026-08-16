import type { NutrientValues } from '@/types/nutrition.ts';

/** Fett-Protein-Einheiten (FPE) nach Typ-1-Diabetes/Keto-Formel. */
export function calculateFpe(fatG: number, proteinG: number): number {
  return fatG / 12 + proteinG / 25;
}

export function calculateNetCarbs(carbsG: number, fiberG: number): number {
  return Math.max(0, carbsG - fiberG);
}

export function calculateCalories(carbsG: number, proteinG: number, fatG: number): number {
  return carbsG * 4 + proteinG * 4 + fatG * 9;
}

export function calculateMacroPercentages(n: NutrientValues): {
  carbsPct: number;
  proteinPct: number;
  fatPct: number;
} {
  const total = n.carbsG * 4 + n.proteinG * 4 + n.fatG * 9;
  if (total === 0) {
    return { carbsPct: 0, proteinPct: 0, fatPct: 0 };
  }
  return {
    carbsPct: (n.carbsG * 4 / total) * 100,
    proteinPct: (n.proteinG * 4 / total) * 100,
    fatPct: (n.fatG * 9 / total) * 100,
  };
}

/** Skaliert Nährwerte pro 100 g auf die tatsächliche Menge. */
export function scaleNutrients(n: NutrientValues, amountG: number): NutrientValues {
  const factor = amountG / 100;
  const scale = (value: number | undefined) =>
    value === undefined ? undefined : value * factor;

  return {
    kcal: n.kcal * factor,
    carbsG: n.carbsG * factor,
    fiberG: n.fiberG * factor,
    proteinG: n.proteinG * factor,
    fatG: n.fatG * factor,
    vitaminCMg: scale(n.vitaminCMg),
    vitaminDµg: scale(n.vitaminDµg),
    potassiumMg: scale(n.potassiumMg),
    calciumMg: scale(n.calciumMg),
    ironMg: scale(n.ironMg),
    magnesiumMg: scale(n.magnesiumMg),
    vitaminB12µg: scale(n.vitaminB12µg),
    folateµg: scale(n.folateµg),
    sodiumMg: scale(n.sodiumMg),
  };
}
