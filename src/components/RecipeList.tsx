import { useRecipes } from "@/hooks/useRecipes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil } from "lucide-react";
import type { Recipe } from "@/types/nutrition";
import {
  sumIngredientNutrients,
  calculateFpe,
  calculateNetCarbs,
  calculateCalories,
  calculateCaloriesFromProtein,
  calculateCaloriesFromFat,
} from "@/lib/fpe";
import { getExtendedBolusDuration } from "@/config/fpeExtendedBolus";

interface RecipeListProps {
  onEdit: (recipe: Recipe) => void;
}

export function RecipeList({ onEdit }: RecipeListProps) {
  const { data: recipes, isLoading, error } = useRecipes();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Rezepte werden geladen…
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Fehler beim Laden der Rezepte.
      </p>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Noch keine Rezepte vorhanden.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {recipes.map((recipe) => {
        const totals = sumIngredientNutrients(recipe.ingredients);
        const fpe = calculateFpe(totals.fatG, totals.proteinG);
        const netCarbs = calculateNetCarbs(totals.carbsG, totals.fiberG);
        const kcal = calculateCalories(totals.carbsG, totals.proteinG, totals.fatG);
        const kcalFromProtein = calculateCaloriesFromProtein(totals.proteinG);
        const kcalFromFat = calculateCaloriesFromFat(totals.fatG);
        const bolusDuration = getExtendedBolusDuration(fpe);

        return (
          <Card key={recipe.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <CardTitle>{recipe.name}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(recipe)}
                aria-label="Rezept bearbeiten"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recipe.description && (
                <p className="text-muted-foreground">{recipe.description}</p>
              )}

              <div>
                <p className="text-sm font-medium mb-1">Zutaten</p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient.id}>
                      {ingredient.amountG}g {ingredient.name}
                    </li>
                  ))}
                </ul>
              </div>

              {recipe.instructions && (
                <div>
                  <p className="text-sm font-medium mb-1">Zubereitung</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {recipe.instructions}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground">kcal</p>
                  <p className="text-lg font-semibold">{Math.round(kcal)}</p>
                </div>
                <div className="rounded-xl bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground">Netto-KH</p>
                  <p className="text-lg font-semibold">{netCarbs.toFixed(1)}g</p>
                </div>
                <div className="rounded-xl bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground">FPE</p>
                  <p className="text-lg font-semibold">{fpe.toFixed(2)}</p>
                </div>
                <div className="rounded-xl bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground">Bolus-Dauer</p>
                  <p className="text-sm font-semibold leading-tight">{bolusDuration}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground">Eiweiß</p>
                  <p className="text-lg font-semibold">{totals.proteinG.toFixed(1)}g</p>
                </div>
                <div className="rounded-xl bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground">Fett</p>
                  <p className="text-lg font-semibold">{totals.fatG.toFixed(1)}g</p>
                </div>
                <div className="rounded-xl bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground">kcal aus Eiweiß</p>
                  <p className="text-lg font-semibold">{Math.round(kcalFromProtein)}</p>
                </div>
                <div className="rounded-xl bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground">kcal aus Fett</p>
                  <p className="text-lg font-semibold">{Math.round(kcalFromFat)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
