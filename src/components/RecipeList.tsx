import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { useRecipes } from '@/hooks/useRecipes.ts';
import type { RecipeFormData } from './RecipeForm.tsx';

function isRecipeFormData(value: object): value is RecipeFormData {
  return 'name' in value && typeof (value as RecipeFormData).name === 'string';
}

export function RecipeList() {
  const { data: recipes = [], isLoading, error } = useRecipes();

  if (isLoading) return <p className="text-sm text-muted-foreground">Rezepte werden geladen…</p>;
  if (error) return <p className="text-sm text-destructive">Fehler beim Laden der Rezepte.</p>;
  if (recipes.length === 0) {
    return <p className="text-sm text-muted-foreground">Noch keine Rezepte vorhanden.</p>;
  }

  return (
    <div className="space-y-4">
      {recipes.map(({ event, content }) => {
        if (!isRecipeFormData(content)) return null;
        return (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{content.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {content.description && (
                <p className="text-sm text-muted-foreground">{content.description}</p>
              )}
              {content.ingredients.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold">Zutaten</h4>
                  <ul className="list-disc list-inside text-sm">
                    {content.ingredients.map((ingredient, index) => (
                      <li key={index}>
                        {ingredient.name}
                        {ingredient.amountG !== undefined && ` (${ingredient.amountG} g)`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {content.instructions && (
                <div>
                  <h4 className="text-sm font-semibold">Zubereitung</h4>
                  <p className="text-sm whitespace-pre-line">{content.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
