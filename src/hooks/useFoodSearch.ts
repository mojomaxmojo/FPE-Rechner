import { useQuery } from "@tanstack/react-query";
import type { FoodItem } from "@/types/nutrition";
import { searchOffProducts, mapOffProductToFoodItem } from "@/lib/openFoodFacts";

export function useFoodSearch(query: string) {
  return useQuery<FoodItem[]>({
    queryKey: ["foodSearch", query.trim().toLowerCase()],
    queryFn: async () => {
      const products = await searchOffProducts(query);
      return products
        .map(mapOffProductToFoodItem)
        .filter((item): item is FoodItem => item !== null);
    },
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
