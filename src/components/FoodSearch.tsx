import { useState } from "react";
import { useFoodSearch } from "@/hooks/useFoodSearch";
import type { FoodItem } from "@/types/nutrition";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface FoodSearchProps {
  onSelect: (item: FoodItem) => void;
}

export function FoodSearch({ onSelect }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const { data: items, isLoading, error } = useFoodSearch(query);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="food-search">Lebensmittel suchen</Label>
        <Input
          id="food-search"
          type="text"
          placeholder="z.B. Butter, Avocado, Lachs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Suche läuft…
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">
          Fehler bei der Suche. Bitte später erneut versuchen.
        </p>
      )}

      {items && items.length > 0 && (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {items.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onSelect(item)}
            >
              <CardContent className="p-3">
                <p className="font-medium">{item.name}</p>
                {item.brand && (
                  <p className="text-sm text-muted-foreground">{item.brand}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {item.nutrientsPer100g.kcal} kcal / 100g ·{" "}
                  {item.nutrientsPer100g.carbsG}g KH ·{" "}
                  {item.nutrientsPer100g.proteinG}g Eiweiß ·{" "}
                  {item.nutrientsPer100g.fatG}g Fett
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {items && items.length === 0 && query.trim().length > 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">Keine Ergebnisse gefunden.</p>
      )}
    </div>
  );
}
