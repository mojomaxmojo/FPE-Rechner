import type { FoodItem, NutrientValues } from "@/types/nutrition";
import {
  OFF_API_BASE_URL,
  OFF_SEARCH_LANGUAGE,
  OFF_SEARCH_PAGE_SIZE,
} from "@/config/openFoodFacts";

const OffProductSchema = {
  code: "string",
  product_name: "string?",
  brands: "string?",
  nutriments: {
    "energy-kcal_100g": "number?",
    "carbohydrates_100g": "number?",
    "fiber_100g": "number?",
    "proteins_100g": "number?",
    "fat_100g": "number?",

    "vitamin-c_100g": "number?",
    "vitamin-d_100g": "number?",
    "potassium_100g": "number?",
    "calcium_100g": "number?",
    "iron_100g": "number?",
    "magnesium_100g": "number?",
    "vitamin-b12_100g": "number?",
    "folates_100g": "number?",
    "sodium_100g": "number?",
  },
} as const;

function getOptionalNumber(
  value: unknown,
): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return undefined;
}

function getRequiredNumber(
  value: unknown,
): number | undefined {
  const num = getOptionalNumber(value);
  return num !== undefined && num >= 0 ? num : undefined;
}

/**
 * Search Open Food Facts for products matching the query.
 */
export async function searchOffProducts(query: string): Promise<unknown[]> {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return [];
  }

  // Use the legacy search endpoint: the v2 endpoint currently ignores
  // search_terms and returns the same products for every query.
  const url = new URL("/cgi/search.pl", OFF_API_BASE_URL);
  url.searchParams.set("search_terms", trimmed);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", String(OFF_SEARCH_PAGE_SIZE));
  url.searchParams.set("lc", OFF_SEARCH_LANGUAGE);
  url.searchParams.set(
    "fields",
    "code,product_name,brands,nutriments",
  );

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts search failed: ${response.status}`);
  }

  const data = (await response.json()) as { products?: unknown[] };
  return data.products ?? [];
}

/**
 * Map an Open Food Facts raw product to a FoodItem.
 * Returns null if any of the five required nutrient values is missing.
 */
export function mapOffProductToFoodItem(product: unknown): FoodItem | null {
  if (!product || typeof product !== "object") {
    return null;
  }

  const p = product as Record<string, unknown>;
  const nutriments = (p.nutriments as Record<string, unknown>) ?? {};

  const nutrientsPer100g: NutrientValues = {
    kcal: getRequiredNumber(nutriments["energy-kcal_100g"]) ?? 0,
    carbsG: getRequiredNumber(nutriments["carbohydrates_100g"]) ?? 0,
    fiberG: getRequiredNumber(nutriments["fiber_100g"]) ?? 0,
    proteinG: getRequiredNumber(nutriments["proteins_100g"]) ?? 0,
    fatG: getRequiredNumber(nutriments["fat_100g"]) ?? 0,

    vitaminCMg: getOptionalNumber(nutriments["vitamin-c_100g"]),
    vitaminDµg: getOptionalNumber(nutriments["vitamin-d_100g"]),
    potassiumMg: getOptionalNumber(nutriments["potassium_100g"]),
    calciumMg: getOptionalNumber(nutriments["calcium_100g"]),
    ironMg: getOptionalNumber(nutriments["iron_100g"]),
    magnesiumMg: getOptionalNumber(nutriments["magnesium_100g"]),
    vitaminB12µg: getOptionalNumber(nutriments["vitamin-b12_100g"]),
    folateµg: getOptionalNumber(nutriments["folates_100g"]),
    sodiumMg: getOptionalNumber(nutriments["sodium_100g"]),
  };

  // All five required values must be present (>= 0) for FPE calculation.
  if (
    getRequiredNumber(nutriments["energy-kcal_100g"]) === undefined ||
    getRequiredNumber(nutriments["carbohydrates_100g"]) === undefined ||
    getRequiredNumber(nutriments["fiber_100g"]) === undefined ||
    getRequiredNumber(nutriments["proteins_100g"]) === undefined ||
    getRequiredNumber(nutriments["fat_100g"]) === undefined
  ) {
    return null;
  }

  const name =
    typeof p.product_name === "string" && p.product_name.trim().length > 0
      ? p.product_name.trim()
      : "Unbekanntes Produkt";

  const brand =
    typeof p.brands === "string" && p.brands.trim().length > 0
      ? p.brands.split(",")[0].trim()
      : undefined;

  const code =
    typeof p.code === "string" && p.code.trim().length > 0
      ? p.code.trim()
      : String(Math.random()).slice(2);

  return {
    id: `off:${code}`,
    name,
    brand,
    nutrientsPer100g,
    source: "off",
  };
}
