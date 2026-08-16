import { AccessGate } from '@/components/AccessGate.tsx';
import { RecipeForm } from '@/components/RecipeForm.tsx';
import { RecipeList } from '@/components/RecipeList.tsx';
import { APP_NAME } from '@/config/app.ts';

export default function RecipesPage() {
  return (
    <AccessGate>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Rezepte</h1>
            <p className="text-muted-foreground mt-2">
              Verschlüsselte Rezepte für {APP_NAME}.
            </p>
          </div>

          <RecipeForm />
          <RecipeList />
        </div>
      </div>
    </AccessGate>
  );
}
