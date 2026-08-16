import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { Ingredient } from "@/types/nutrition";

const STORAGE_KEY = "fpe:manual-ingredients";

export function useManualIngredients() {
  const [ingredients, setIngredients] = useLocalStorage<Ingredient[]>(STORAGE_KEY, []);

  const saveIngredient = useCallback(
    (ingredient: Ingredient) => {
      setIngredients((prev) => {
        const withoutExisting = prev.filter((i) => i.id !== ingredient.id);
        return [ingredient, ...withoutExisting];
      });
    },
    [setIngredients],
  );

  const removeIngredient = useCallback(
    (id: string) => {
      setIngredients((prev) => prev.filter((i) => i.id !== id));
    },
    [setIngredients],
  );

  return {
    ingredients,
    saveIngredient,
    removeIngredient,
  };
}
