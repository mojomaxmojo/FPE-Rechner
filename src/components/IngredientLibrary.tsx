import { useState } from "react";
import { useManualIngredients } from "@/hooks/useManualIngredients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { Ingredient } from "@/types/nutrition";
import { Trash2, Plus } from "lucide-react";

interface IngredientLibraryProps {
  onSelect: (ingredient: Ingredient) => void;
}

export function IngredientLibrary({ onSelect }: IngredientLibraryProps) {
  const { ingredients, removeIngredient } = useManualIngredients();
  const [amountG, setAmountG] = useState<string>("100");

  const parseAmount = (value: string): number | null => {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const num = Number(trimmed);
    if (!Number.isFinite(num) || num <= 0) return null;
    return num;
  };

  const handleAdd = (base: Ingredient) => {
    const amount = parseAmount(amountG);
    if (amount === null) return;

    const ingredient: Ingredient = {
      ...base,
      id: `${base.id}-${Date.now()}`,
      amountG: amount,
    };

    onSelect(ingredient);
  };

  if (ingredients.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Noch keine gespeicherten Zutaten. Erstelle eine manuelle Zutat und speichere sie.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="library-amount">Menge für ausgewählte Zutat (g)</Label>
        <Input
          id="library-amount"
          type="number"
          min={1}
          value={amountG}
          onChange={(e) => setAmountG(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {ingredients.map((ingredient) => (
          <Card key={ingredient.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{ingredient.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ingredient.nutrientsPer100g.kcal} kcal ·{" "}
                    {ingredient.nutrientsPer100g.carbsG}g KH ·{" "}
                    {ingredient.nutrientsPer100g.proteinG}g Eiweiß ·{" "}
                    {ingredient.nutrientsPer100g.fatG}g Fett / 100g
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAdd(ingredient)}
                    aria-label="Zutat verwenden"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(ingredient.id)}
                    aria-label="Zutat löschen"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
