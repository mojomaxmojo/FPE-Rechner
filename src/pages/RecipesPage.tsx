import { useState } from "react";
import { useSeoMeta } from "@unhead/react";
import { APP_NAME } from "@/config/app";
import { AccessGate } from "@/components/AccessGate";
import { AppNav } from "@/components/AppNav";
import { RecipeForm } from "@/components/RecipeForm";
import { RecipeList } from "@/components/RecipeList";
import { Button } from "@/components/ui/button";

export default function RecipesPage() {
  useSeoMeta({
    title: `Rezepte · ${APP_NAME}`,
    description: "Verschlüsselte Rezepte für den FPE-Rechner.",
  });

  const [showForm, setShowForm] = useState(false);

  return (
    <AccessGate>
      <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
        <AppNav />
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Rezepte</h1>
            <p className="text-muted-foreground">
              Erstelle und speichere verschlüsselte Rezepte für dich und deinen Partner.
            </p>
          </div>

          <Button onClick={() => setShowForm((s) => !s)} className="w-full">
            {showForm ? "Formular ausblenden" : "Neues Rezept erstellen"}
          </Button>

          {showForm && <RecipeForm onSaved={() => setShowForm(false)} />}

          <RecipeList />
        </div>
      </div>
    </AccessGate>
  );
}
