import { useQuery } from '@tanstack/react-query';

import { mapOffProductToFoodItem, searchOffProducts } from '@/lib/openFoodFacts.ts';
import type { FoodItem } from '@/types/nutrition.ts';

export function useFoodSearch(query: string) {
  const trimmed = query.trim();

  return useQuery<FoodItem[]>({
    queryKey: ['foodSearch', trimmed],
    queryFn: async () => {
      const products = await searchOffProducts(trimmed);
      return products
        .map(mapOffProductToFoodItem)
        .filter((item): item is FoodItem => item !== null);
    },
    enabled: trimmed.length > 0,
  });
}
