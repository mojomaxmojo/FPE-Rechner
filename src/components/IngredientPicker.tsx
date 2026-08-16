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
import type { FoodItem, Ingredient } from "@/types/nutrition";

interface IngredientPickerProps {
  onAdd: (ingredient: Ingredient) => void;
}

type ManualNutrientFields = {
  kcal: string;
  carbsG: string;
  fiberG: string;
  proteinG: string;
  fatG: string;
};

const emptyManualNutrients: ManualNutrientFields = {
  kcal: "",
  carbsG: "",
  fiberG: "",
  proteinG: "",
  fatG: "",
};

function parsePositiveInt(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0 || !Number.isInteger(num)) return null;
  return num;
}

function parseNonNegativeNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
}

export function IngredientPicker({ onAdd }: IngredientPickerProps) {
  const [activeTab, setActiveTab] = useState("search");

  // Weg A
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [searchAmountG, setSearchAmountG] = useState<string>("100");

  // Weg B
  const [manualName, setManualName] = useState("");
  const [manualAmountG, setManualAmountG] = useState<string>("100");
  const [manualNutrients, setManualNutrients] = useState<ManualNutrientFields>(emptyManualNutrients);

  const handleAddFromSearch = () => {
    const amount = parsePositiveInt(searchAmountG);
    if (!selectedItem || amount === null) return;

    const ingredient: Ingredient = {
      id: `${selectedItem.id}-${Date.now()}`,
      name: selectedItem.name,
      amountG: amount,
      nutrientsPer100g: selectedItem.nutrientsPer100g,
      source: "search",
    };

    onAdd(ingredient);
    setSelectedItem(null);
    setSearchAmountG("100");
  };

  const parsedManual = {
    amountG: parsePositiveInt(manualAmountG),
    kcal: parseNonNegativeNumber(manualNutrients.kcal),
    carbsG: parseNonNegativeNumber(manualNutrients.carbsG),
    fiberG: parseNonNegativeNumber(manualNutrients.fiberG),
    proteinG: parseNonNegativeNumber(manualNutrients.proteinG),
    fatG: parseNonNegativeNumber(manualNutrients.fatG),
  };

  const manualValid =
    manualName.trim().length > 0 &&
    parsedManual.amountG !== null &&
    parsedManual.kcal !== null &&
    parsedManual.carbsG !== null &&
    parsedManual.fiberG !== null &&
    parsedManual.proteinG !== null &&
    parsedManual.fatG !== null;

  const handleAddManual = () => {
    if (!manualValid) return;

    const ingredient: Ingredient = {
      id: `manual-${Date.now()}`,
      name: manualName.trim(),
      amountG: parsedManual.amountG!,
      nutrientsPer100g: {
        kcal: parsedManual.kcal!,
        carbsG: parsedManual.carbsG!,
        fiberG: parsedManual.fiberG!,
        proteinG: parsedManual.proteinG!,
        fatG: parsedManual.fatG!,
      },
      source: "manual",
    };

    onAdd(ingredient);
    setManualName("");
    setManualAmountG("100");
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
                onChange={(e) => setSearchAmountG(e.target.value)}
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
            onChange={(e) => setManualAmountG(e.target.value)}
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
                  kcal: e.target.value,
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
                  carbsG: e.target.value,
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
                  fiberG: e.target.value,
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
                  proteinG: e.target.value,
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
                  fatG: e.target.value,
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
