import { useState } from "react";
import { usePublishRecipe } from "@/hooks/usePublishRecipe";
import { IngredientPicker } from "./IngredientPicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Ingredient, Recipe } from "@/types/nutrition";
import {
  sumIngredientNutrients,
  calculateFpe,
  calculateNetCarbs,
  calculateCalories,
} from "@/lib/fpe";
import { Trash2 } from "lucide-react";

interface RecipeFormProps {
  onSaved?: () => void;
}

export function RecipeForm({ onSaved }: RecipeFormProps) {
  const publishRecipe = usePublishRecipe();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const totals = sumIngredientNutrients(ingredients);
  const totalFpe = calculateFpe(totals.fatG, totals.proteinG);
  const totalNetCarbs = calculateNetCarbs(totals.carbsG, totals.fiberG);
  const totalKcal = calculateCalories(totals.carbsG, totals.proteinG, totals.fatG);

  const handleAddIngredient = (ingredient: Ingredient) => {
    setIngredients((prev) => [...prev, ingredient]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = () => {
    if (name.trim().length === 0 || ingredients.length === 0) return;

    const recipe: Recipe = {
      id: `recipe-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      description: description.trim() || undefined,
      instructions: instructions.trim() || undefined,
      ingredients,
      createdAtMs: Date.now(),
    };

    publishRecipe.mutate(recipe, {
      onSuccess: () => {
        setName("");
        setDescription("");
        setInstructions("");
        setIngredients([]);
        onSaved?.();
      },
    });
  };

  const canSave = name.trim().length > 0 && ingredients.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neues Rezept</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1">
          <Label htmlFor="recipe-name">Name</Label>
          <Input
            id="recipe-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="recipe-description">Beschreibung</Label>
          <Textarea
            id="recipe-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="recipe-instructions">Zubereitung</Label>
          <Textarea
            id="recipe-instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Zutaten</h3>

          {ingredients.length > 0 && (
            <div className="space-y-2">
              {ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div>
                    <p className="font-medium">{ingredient.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ingredient.amountG}g ·{" "}
                      {ingredient.source === "search" ? "aus Suche" : "manuell"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveIngredient(ingredient.id)}
                    aria-label="Zutat entfernen"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <IngredientPicker onAdd={handleAddIngredient} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">kcal</p>
            <p className="text-lg font-semibold">{Math.round(totalKcal)}</p>
          </div>
          <div className="rounded-xl bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">Netto-KH</p>
            <p className="text-lg font-semibold">{totalNetCarbs.toFixed(1)}g</p>
          </div>
          <div className="rounded-xl bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">FPE</p>
            <p className="text-lg font-semibold">{totalFpe.toFixed(2)}</p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={!canSave || publishRecipe.isPending} className="w-full">
          {publishRecipe.isPending ? "Wird gespeichert…" : "Rezept speichern"}
        </Button>
      </CardContent>
    </Card>
  );
}
