import { useState } from "react";
import { useSeoMeta } from "@unhead/react";
import { APP_NAME } from "@/config/app";
import type { FoodItem } from "@/types/nutrition";
import { FoodSearch } from "@/components/FoodSearch";
import { FpeCalculatorCard } from "@/components/FpeCalculatorCard";
import { MealDiary } from "@/components/MealDiary";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Index = () => {
  useSeoMeta({
    title: APP_NAME,
    description: "Fett-Protein-Einheiten-Rechner für Typ-1-Diabetes und Keto.",
  });

  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [amountG, setAmountG] = useState<number>(100);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">{APP_NAME}</h1>
          <p className="text-muted-foreground">
            Suche ein Lebensmittel und berechne Fett-Protein-Einheiten (FPE) für deine Mahlzeit.
          </p>
        </div>

        <FoodSearch onSelect={setSelectedItem} />

        {selectedItem && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="amount">Menge (g)</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                value={amountG}
                onChange={(e) => setAmountG(Number(e.target.value) || 0)}
              />
            </div>

            <FpeCalculatorCard item={selectedItem} amountG={amountG} />
          </div>
        )}

        <MealDiary />
      </div>
    </div>
  );
};

export default Index;
