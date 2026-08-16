import { useQuery } from "@tanstack/react-query";
import type { FoodItem } from "@/types/nutrition";
import { searchOffProducts, mapOffProductToFoodItem } from "@/lib/openFoodFacts";

export function useFoodSearch(query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return useQuery<FoodItem[]>({
    queryKey: ["foodSearch", normalizedQuery],
    queryFn: async () => {
      const products = await searchOffProducts(query);
      const items = products
        .map(mapOffProductToFoodItem)
        .filter((item): item is FoodItem => item !== null);

      // Sort by relevance: products whose name contains the query come first.
      return items.sort((a, b) => {
        const aContains = a.name.toLowerCase().includes(normalizedQuery);
        const bContains = b.name.toLowerCase().includes(normalizedQuery);
        if (aContains && !bContains) return -1;
        if (!aContains && bContains) return 1;
        return 0;
      });
    },
    enabled: normalizedQuery.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
