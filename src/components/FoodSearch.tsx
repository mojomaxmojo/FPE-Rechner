import { useState } from 'react';

import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useFoodSearch } from '@/hooks/useFoodSearch.ts';
import type { FoodItem } from '@/types/nutrition.ts';

interface FoodSearchProps {
  onSelect: (foodItem: FoodItem) => void;
}

export function FoodSearch({ onSelect }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const { data: results = [], isLoading, error } = useFoodSearch(submittedQuery);

  const handleSearch = () => {
    setSubmittedQuery(query);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Lebensmittel suchen (z.B. Butter)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={!query.trim()}>
          Suchen
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Suche läuft…</p>}
      {error && <p className="text-sm text-destructive">Fehler bei der Suche.</p>}

      {results.length > 0 && (
        <ul className="divide-y rounded-xl border">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
              >
                <div className="font-medium">{item.name}</div>
                {item.brand && (
                  <div className="text-sm text-muted-foreground">{item.brand}</div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {submittedQuery && !isLoading && results.length === 0 && (
        <p className="text-sm text-muted-foreground">Keine Ergebnisse gefunden.</p>
      )}
    </div>
  );
}
