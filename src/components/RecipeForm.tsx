import { useState } from 'react';

import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { usePublishRecipe } from '@/hooks/usePublishRecipe.ts';

export interface RecipeFormData {
  name: string;
  description?: string;
  ingredients: { name: string; amountG?: number }[];
  instructions: string;
}

export function RecipeForm({ onSaved }: { onSaved?: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [instructions, setInstructions] = useState('');
  const { mutate: publishRecipe, isPending, error, isSuccess } = usePublishRecipe();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const ingredients = ingredientsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*g$/i);
        return match
          ? { name: match[1].trim(), amountG: Number(match[2]) }
          : { name: line };
      });

    const recipe: RecipeFormData = {
      name: name.trim(),
      description: description.trim() || undefined,
      ingredients,
      instructions: instructions.trim(),
    };

    publishRecipe(recipe, {
      onSuccess: () => {
        setName('');
        setDescription('');
        setIngredientsText('');
        setInstructions('');
        onSaved?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-4">
      <h2 className="font-semibold">Neues Rezept</h2>

      <div className="space-y-2">
        <Label htmlFor="recipe-name">Name</Label>
        <Input
          id="recipe-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Z.B. Keto-Pfannkuchen"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipe-description">Beschreibung (optional)</Label>
        <Input
          id="recipe-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Kurze Beschreibung"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipe-ingredients">Zutaten (eine pro Zeile, optional mit Menge in g)</Label>
        <Textarea
          id="recipe-ingredients"
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          placeholder="Mandelmehl 100g\nEier 2\nButter 20g"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipe-instructions">Zubereitung</Label>
        <Textarea
          id="recipe-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Zubereitungsschritte"
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Speichern…' : 'Rezept speichern'}
      </Button>

      {isSuccess && <p className="text-sm text-green-600">Rezept gespeichert.</p>}
      {error && <p className="text-sm text-destructive">Fehler: {error.message}</p>}
    </form>
  );
}
