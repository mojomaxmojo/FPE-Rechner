import { useState } from "react";
import { FoodSearch } from "./FoodSearch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { FoodItem, Ingredient, NutrientValues } from "@/types/nutrition";

interface IngredientPickerProps {
  onAdd: (ingredient: Ingredient) => void;
}

const emptyManualNutrients: NutrientValues = {
  kcal: 0,
  carbsG: 0,
  fiberG: 0,
  proteinG: 0,
  fatG: 0,
};

export function IngredientPicker({ onAdd }: IngredientPickerProps) {
  const [activeTab, setActiveTab] = useState("search");

  // Weg A
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [searchAmountG, setSearchAmountG] = useState<number>(100);

  // Weg B
  const [manualName, setManualName] = useState("");
  const [manualAmountG, setManualAmountG] = useState<number>(100);
  const [manualNutrients, setManualNutrients] = useState<NutrientValues>(emptyManualNutrients);

  const handleAddFromSearch = () => {
    if (!selectedItem || searchAmountG <= 0) return;

    const ingredient: Ingredient = {
      id: `${selectedItem.id}-${Date.now()}`,
      name: selectedItem.name,
      amountG: searchAmountG,
      nutrientsPer100g: selectedItem.nutrientsPer100g,
      source: "search",
    };

    onAdd(ingredient);
    setSelectedItem(null);
    setSearchAmountG(100);
  };

  const manualValid =
    manualName.trim().length > 0 &&
    manualAmountG > 0 &&
    manualNutrients.kcal >= 0 &&
    manualNutrients.carbsG >= 0 &&
    manualNutrients.fiberG >= 0 &&
    manualNutrients.proteinG >= 0 &&
    manualNutrients.fatG >= 0;

  const handleAddManual = () => {
    if (!manualValid) return;

    const ingredient: Ingredient = {
      id: `manual-${Date.now()}`,
      name: manualName.trim(),
      amountG: manualAmountG,
      nutrientsPer100g: {
        kcal: manualNutrients.kcal,
        carbsG: manualNutrients.carbsG,
        fiberG: manualNutrients.fiberG,
        proteinG: manualNutrients.proteinG,
        fatG: manualNutrients.fatG,
      },
      source: "manual",
    };

    onAdd(ingredient);
    setManualName("");
    setManualAmountG(100);
    setManualNutrients(emptyManualNutrients);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search">Aus Suche</TabsTrigger>
        <TabsTrigger value="manual">Manuell</TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="space-y-3">
        <FoodSearch onSelect={setSelectedItem} />

        {selectedItem && (
          <>
            <div className="space-y-1">
              <Label htmlFor="search-amount">Menge (g)</Label>
              <Input
                id="search-amount"
                type="number"
                min={1}
                value={searchAmountG}
                onChange={(e) => setSearchAmountG(Number(e.target.value) || 0)}
              />
            </div>
            <Button onClick={handleAddFromSearch} className="w-full">
              Zutat hinzufügen
            </Button>
          </>
        )}
      </TabsContent>

      <TabsContent value="manual" className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="manual-name">Name</Label>
          <Input
            id="manual-name"
            type="text"
            placeholder="z.B. Hausgemachte Nussmischung"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="manual-amount">Menge (g)</Label>
          <Input
            id="manual-amount"
            type="number"
            min={1}
            value={manualAmountG}
            onChange={(e) => setManualAmountG(Number(e.target.value) || 0)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="manual-kcal">kcal / 100g</Label>
            <Input
              id="manual-kcal"
              type="number"
              min={0}
              value={manualNutrients.kcal}
              onChange={(e) =>
                setManualNutrients((prev) => ({
                  ...prev,
                  kcal: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="manual-carbs">KH / 100g</Label>
            <Input
              id="manual-carbs"
              type="number"
              min={0}
              value={manualNutrients.carbsG}
              onChange={(e) =>
                setManualNutrients((prev) => ({
                  ...prev,
                  carbsG: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="manual-fiber">Ballaststoffe / 100g</Label>
            <Input
              id="manual-fiber"
              type="number"
              min={0}
              value={manualNutrients.fiberG}
              onChange={(e) =>
                setManualNutrients((prev) => ({
                  ...prev,
                  fiberG: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="manual-protein">Eiweiß / 100g</Label>
            <Input
              id="manual-protein"
              type="number"
              min={0}
              value={manualNutrients.proteinG}
              onChange={(e) =>
                setManualNutrients((prev) => ({
                  ...prev,
                  proteinG: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-1 col-span-2">
            <Label htmlFor="manual-fat">Fett / 100g</Label>
            <Input
              id="manual-fat"
              type="number"
              min={0}
              value={manualNutrients.fatG}
              onChange={(e) =>
                setManualNutrients((prev) => ({
                  ...prev,
                  fatG: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
        </div>

        <Button onClick={handleAddManual} disabled={!manualValid} className="w-full">
          Zutat hinzufügen
        </Button>
      </TabsContent>
    </Tabs>
  );
}
