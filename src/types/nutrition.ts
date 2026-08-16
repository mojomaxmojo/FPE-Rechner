export interface NutrientValues {
  kcal: number;
  carbsG: number;
  fiberG: number;
  proteinG: number;
  fatG: number;
  vitaminCMg?: number;
  vitaminDµg?: number;
  potassiumMg?: number;
  calciumMg?: number;
  ironMg?: number;
  magnesiumMg?: number;
  vitaminB12µg?: number;
  folateµg?: number;
  sodiumMg?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  nutrientsPer100g: NutrientValues;
  source: 'off' | 'custom';
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: string;
  foodItem: FoodItem;
  amountG: number;
  mealType: MealType;
  timestampMs: number;
}

export interface DailyGoals {
  maxCarbsG: number;
  maxNetCarbsG: number;
  targetFpe: number;
  targetKcal: number;
}
