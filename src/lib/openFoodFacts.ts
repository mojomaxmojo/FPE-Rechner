import {
  OFF_API_BASE_URL,
  OFF_SEARCH_LANGUAGE,
  OFF_SEARCH_PAGE_SIZE,
} from '@/config/openFoodFacts.ts';
import type { FoodItem, NutrientValues } from '@/types/nutrition.ts';

interface OffSearchResponse {
  products: unknown[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getNumber(product: Record<string, unknown>, key: string): number | undefined {
  const value = product[key];
  return typeof value === 'number' ? value : undefined;
}

function getString(product: Record<string, unknown>, key: string): string | undefined {
  const value = product[key];
  return typeof value === 'string' ? value : undefined;
}

export async function searchOffProducts(query: string): Promise<unknown[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = new URL('/api/v2/search', OFF_API_BASE_URL);
  url.searchParams.set('search_terms', trimmed);
  url.searchParams.set('search_lang', OFF_SEARCH_LANGUAGE);
  url.searchParams.set('page_size', String(OFF_SEARCH_PAGE_SIZE));
  url.searchParams.set('json', '1');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Open Food Facts search failed: ${response.status}`);
  }

  const data = (await response.json()) as OffSearchResponse;
  return data.products ?? [];
}

export function mapOffProductToFoodItem(product: unknown): FoodItem | null {
  if (!isRecord(product)) return null;

  const nutriments = isRecord(product.nutriments) ? product.nutriments : {};

  const nutrientsPer100g: NutrientValues = {
    kcal: getNumber(nutriments, 'energy-kcal_100g') ?? 0,
    carbsG: getNumber(nutriments, 'carbohydrates_100g') ?? 0,
    fiberG: getNumber(nutriments, 'fiber_100g') ?? 0,
    proteinG: getNumber(nutriments, 'proteins_100g') ?? 0,
    fatG: getNumber(nutriments, 'fat_100g') ?? 0,
    vitaminCMg: getNumber(nutriments, 'vitamin-c_100g'),
    vitaminDµg: getNumber(nutriments, 'vitamin-d_100g'),
    potassiumMg: getNumber(nutriments, 'potassium_100g'),
    calciumMg: getNumber(nutriments, 'calcium_100g'),
    ironMg: getNumber(nutriments, 'iron_100g'),
    magnesiumMg: getNumber(nutriments, 'magnesium_100g'),
    vitaminB12µg: getNumber(nutriments, 'vitamin-b12_100g'),
    folateµg: getNumber(nutriments, 'folates_100g'),
    sodiumMg: getNumber(nutriments, 'sodium_100g'),
  };

  const code = getString(product, 'code');
  const name = getString(product, 'product_name') ?? getString(product, 'product_name_en');
  if (!code || !name) return null;

  return {
    id: code,
    name,
    brand: getString(product, 'brands'),
    nutrientsPer100g,
    source: 'off',
  };
}
