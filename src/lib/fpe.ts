import type { NutrientValues, Ingredient } from "@/types/nutrition";

/**
 * Calculate Fat-Protein-Units (FPE) for Type-1 diabetes / keto.
 * FPE = fatG / 12 + proteinG / 25
 */
export function calculateFpe(fatG: number, proteinG: number): number {
  return fatG / 12 + proteinG / 25;
}

/**
 * Calculate net carbs: total carbs minus fiber.
 */
export function calculateNetCarbs(carbsG: number, fiberG: number): number {
  return Math.max(0, carbsG - fiberG);
}

/**
 * Calculate calories from macros.
 */
export function calculateCalories(
  carbsG: number,
  proteinG: number,
  fatG: number,
): number {
  return carbsG * 4 + proteinG * 4 + fatG * 9;
}

/**
 * Calculate calories from protein only.
 */
export function calculateCaloriesFromProtein(proteinG: number): number {
  return proteinG * 4;
}

/**
 * Calculate calories from fat only.
 */
export function calculateCaloriesFromFat(fatG: number): number {
  return fatG * 9;
}

/**
 * Calculate macro percentages from a NutrientValues object.
 */
export function calculateMacroPercentages(n: NutrientValues): {
  carbsPct: number;
  proteinPct: number;
  fatPct: number;
} {
  const caloriesFromCarbs = n.carbsG * 4;
  const caloriesFromProtein = n.proteinG * 4;
  const caloriesFromFat = n.fatG * 9;
  const total = caloriesFromCarbs + caloriesFromProtein + caloriesFromFat;

  if (total === 0) {
    return { carbsPct: 0, proteinPct: 0, fatPct: 0 };
  }

  return {
    carbsPct: Math.round((caloriesFromCarbs / total) * 100),
    proteinPct: Math.round((caloriesFromProtein / total) * 100),
    fatPct: Math.round((caloriesFromFat / total) * 100),
  };
}

/**
 * Scale nutrients from per-100g values to the actual amount (in grams).
 */
export function scaleNutrients(
  n: NutrientValues,
  amountG: number,
): NutrientValues {
  const factor = amountG / 100;

  return {
    kcal: n.kcal * factor,
    carbsG: n.carbsG * factor,
    fiberG: n.fiberG * factor,
    proteinG: n.proteinG * factor,
    fatG: n.fatG * factor,

    vitaminCMg: n.vitaminCMg !== undefined ? n.vitaminCMg * factor : undefined,
    vitaminDµg: n.vitaminDµg !== undefined ? n.vitaminDµg * factor : undefined,
    potassiumMg: n.potassiumMg !== undefined ? n.potassiumMg * factor : undefined,
    calciumMg: n.calciumMg !== undefined ? n.calciumMg * factor : undefined,
    ironMg: n.ironMg !== undefined ? n.ironMg * factor : undefined,
    magnesiumMg: n.magnesiumMg !== undefined ? n.magnesiumMg * factor : undefined,
    vitaminB12µg: n.vitaminB12µg !== undefined ? n.vitaminB12µg * factor : undefined,
    folateµg: n.folateµg !== undefined ? n.folateµg * factor : undefined,
    sodiumMg: n.sodiumMg !== undefined ? n.sodiumMg * factor : undefined,
  };
}

/**
 * Sum scaled nutrients of all ingredients in a recipe.
 */
export function sumIngredientNutrients(ingredients: Ingredient[]): NutrientValues {
  const sum: NutrientValues = {
    kcal: 0,
    carbsG: 0,
    fiberG: 0,
    proteinG: 0,
    fatG: 0,
  };

  for (const ingredient of ingredients) {
    const scaled = scaleNutrients(ingredient.nutrientsPer100g, ingredient.amountG);
    sum.kcal += scaled.kcal;
    sum.carbsG += scaled.carbsG;
    sum.fiberG += scaled.fiberG;
    sum.proteinG += scaled.proteinG;
    sum.fatG += scaled.fatG;

    if (scaled.vitaminCMg !== undefined) {
      sum.vitaminCMg = (sum.vitaminCMg ?? 0) + scaled.vitaminCMg;
    }
    if (scaled.vitaminDµg !== undefined) {
      sum.vitaminDµg = (sum.vitaminDµg ?? 0) + scaled.vitaminDµg;
    }
    if (scaled.potassiumMg !== undefined) {
      sum.potassiumMg = (sum.potassiumMg ?? 0) + scaled.potassiumMg;
    }
    if (scaled.calciumMg !== undefined) {
      sum.calciumMg = (sum.calciumMg ?? 0) + scaled.calciumMg;
    }
    if (scaled.ironMg !== undefined) {
      sum.ironMg = (sum.ironMg ?? 0) + scaled.ironMg;
    }
    if (scaled.magnesiumMg !== undefined) {
      sum.magnesiumMg = (sum.magnesiumMg ?? 0) + scaled.magnesiumMg;
    }
    if (scaled.vitaminB12µg !== undefined) {
      sum.vitaminB12µg = (sum.vitaminB12µg ?? 0) + scaled.vitaminB12µg;
    }
    if (scaled.folateµg !== undefined) {
      sum.folateµg = (sum.folateµg ?? 0) + scaled.folateµg;
    }
    if (scaled.sodiumMg !== undefined) {
      sum.sodiumMg = (sum.sodiumMg ?? 0) + scaled.sodiumMg;
    }
  }

  return sum;
}
