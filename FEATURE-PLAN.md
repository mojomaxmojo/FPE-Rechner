# FEATURE-PLAN: FPE-Rechner + Rezepte (Weg A/B) + Tagebuch + Ziele + Nostr-Verschlüsselung + Design (fpe.mojobus.co)

Dieser Plan setzt die im Chat besprochene App vollständig um:
- Zugriff nur für `mojo` und `susanne` (Nostr-Login, echte npubs)
- Lebensmittelsuche über Open Food Facts, Anzeige im FPE-Rechner
- FPE-Rechner (Fett-Protein-Einheiten) für Typ-1-Diabetes / Keto
- Mahlzeiten-Tagebuch (lokal gespeichert)
- Dashboard mit Tageszielen
- Eigene Rezepte: Zutaten **entweder** aus der Lebensmittelsuche geklickt (**Weg A**) **oder** manuell mit Standard-Nährwerten pro 100g eingetragen (**Weg B**) — ohne diese Werte ist keine FPE-Berechnung möglich
- Rezepte verschlüsselt auf `relay.mojobus.co` gespeichert (nur für mojo & susanne lesbar)
- Navigation zwischen Startseite (FPE-Rechner) und Unterseite „Rezepte“
- Design im mojobusco-Look (Ocean-Teal/Coral, Playfair Display + Inter, abgerundete Ecken)

**Ausgangslage:** Das Projekt ist aktuell im Grundzustand (Blank-Template). Es existiert noch kein FPE-Code, keine Konfiguration, keine Typen.

**Grundprinzip:** Alle einstellbaren Werte (Autoren, Relay-URL, API-URLs, Ziel-Werte, Kind-Nummer) liegen in `src/config/*.ts` — nichts wird im Code fest verdrahtet. Jeder Schritt hinterlässt das Projekt lauffähig (`npm run build` funktioniert).

---

## Schritt 1 — Fundament: Konfiguration, Typen, reine Rechenfunktionen

**Neue Dateien:**
- `src/config/app.ts`
  - `APP_NAME: string` — Anzeigename, z.B. `"FPE Rechner"`
  - `AUTHORIZED_NPUBS: string[]` — die beiden echten npubs:
    - `"npub1f4vym2mu3q9fsz08muz8d469hl568l5358qx90qlaspyuz67ru0sfxvupf"` (mojo)
    - `"npub1jn4arsy5pzqausut0u79x2mnur2dd34szcxnlc9c5407f828002qdls5wz"` (susanne)
- `src/types/nutrition.ts`
  - `interface NutrientValues` — Pflichtfelder `kcal`, `carbsG`, `fiberG`, `proteinG`, `fatG` (alle Zahlen, alle Pflicht — ohne diese fünf Werte ist keine FPE-Berechnung möglich); optionale Vitamine/Mineralstoffe: `vitaminCMg?`, `vitaminDµg?`, `potassiumMg?`, `calciumMg?`, `ironMg?`, `magnesiumMg?`, `vitaminB12µg?`, `folateµg?`, `sodiumMg?`
  - `interface FoodItem` — `id`, `name`, `brand?`, `nutrientsPer100g: NutrientValues`, `source: "off"`
  - `interface Ingredient` — `id`, `name`, `amountG`, `nutrientsPer100g: NutrientValues`, `source: "search" | "manual"` (eine Zutat in einem Rezept — unabhängig von Weg A/B gleiche Datenstruktur)
  - `interface Recipe` — `id`, `name`, `description?`, `instructions?`, `ingredients: Ingredient[]`, `createdAtMs`
  - `type MealType = "breakfast" | "lunch" | "dinner" | "snack"`
  - `interface MealEntry` — `id`, `foodItem: FoodItem`, `amountG`, `mealType: MealType`, `timestampMs`
  - `interface DailyGoals` — `maxCarbsG`, `maxNetCarbsG`, `targetFpe`, `targetKcal`
- `src/lib/fpe.ts` (reine Funktionen, keine Seiteneffekte)
  - `calculateFpe(fatG: number, proteinG: number): number` — Fett÷12 + Protein÷25
  - `calculateNetCarbs(carbsG: number, fiberG: number): number`
  - `calculateCalories(carbsG: number, proteinG: number, fatG: number): number`
  - `calculateMacroPercentages(n: NutrientValues): { carbsPct: number; proteinPct: number; fatPct: number }`
  - `scaleNutrients(n: NutrientValues, amountG: number): NutrientValues` — skaliert Pro-100g-Werte auf tatsächliche Menge (inkl. optionaler Vitamine/Mineralstoffe)
  - `sumIngredientNutrients(ingredients: Ingredient[]): NutrientValues` — skaliert jede Zutat auf ihre eigene Menge und summiert alle Zutaten zu einem Gesamt-Nährwert für das ganze Rezept (Grundlage für die Rezept-FPE-Anzeige in Schritt 7)

**Bestehender Code:** keine Änderungen.

**npm install:** keine (nur TypeScript).

**TESTHINWEIS:**
Es gibt noch keine sichtbare Änderung auf der Webseite. Im Terminal prüfen:
```
npm run build
```
Am Ende muss `Project built successfully!` ohne rote Fehlermeldungen erscheinen.

---

## Schritt 2 — Open Food Facts Anbindung (Backend-Logik, noch ohne UI)

**Neue Dateien:**
- `src/config/openFoodFacts.ts`
  - `OFF_API_BASE_URL: string` — `https://world.openfoodfacts.org`
  - `OFF_SEARCH_LANGUAGE: string` — `"de"`
  - `OFF_SEARCH_PAGE_SIZE: number` — z.B. `20`
- `src/lib/openFoodFacts.ts`
  - `searchOffProducts(query: string): Promise<unknown[]>` — ruft die OFF-Such-API auf
  - `mapOffProductToFoodItem(product: unknown): FoodItem | null` — wandelt OFF-Rohdaten in `FoodItem` (Schritt 1) um, inkl. verfügbarer Vitamine; liefert `null`, wenn die 5 Pflichtwerte fehlen
- `src/hooks/useFoodSearch.ts`
  - `useFoodSearch(query: string)` — TanStack-Query-Hook, kombiniert `searchOffProducts` + `mapOffProductToFoodItem`, liefert `FoodItem[]`

**Bestehender Code:** keine Änderungen.

**npm install:** keine (nutzt vorhandenes `fetch`, `@tanstack/react-query`, `zod`).

**TESTHINWEIS:**
Noch keine sichtbare Änderung in der App. Browser öffnen, F12 → Tab „Konsole“, eingeben:
```js
fetch('https://world.openfoodfacts.org/api/v2/search?search_terms=butter&json=1').then(r => r.json()).then(console.log)
```
Es sollte ein JSON-Objekt mit Produkten erscheinen. Zusätzlich muss `npm run build` weiterhin fehlerfrei laufen.

---

## Schritt 3 — Zugriffssperre (nur mojo & susanne)

**Neue Dateien:**
- `src/hooks/useAuthorized.ts`
  - `useAuthorized()` — liest `useCurrentUser()`, dekodiert `AUTHORIZED_NPUBS` (Schritt 1) via `nip19.decode`, vergleicht Hex-Pubkeys, gibt `{ isAuthorized: boolean; isLoggedIn: boolean }` zurück
- `src/components/AccessGate.tsx`
  - `AccessGate({ children })` — zeigt bei `!isLoggedIn` einen Login-Hinweis mit `<LoginArea />`; bei `isLoggedIn && !isAuthorized` einen „Kein Zugriff“-Hinweis; sonst `children`

**Bestehender Code (minimaler Eingriff):**
- `src/AppRouter.tsx` (aktueller Stand, 22 Zeilen)
  - Nach Zeile 2 (`import { ScrollToTop } from "./components/ScrollToTop";`): neue Zeile einfügen: `import { AccessGate } from "./components/AccessGate";`
  - Zeile 13 (`<Route path="/" element={<Index />} />`) ersetzen durch: `<Route path="/" element={<AccessGate><Index /></AccessGate>} />`

**npm install:** keine (nutzt vorhandenes `nostr-tools`, `LoginArea`, `useCurrentUser`).

**TESTHINWEIS (Klick-Anleitung):**
1. Seite neu laden, ohne eingeloggt zu sein → Login-Hinweis statt Startseite.
2. Mit einem **fremden**, nicht autorisierten Account einloggen → „Kein Zugriff“-Hinweis.
3. Mit dem Account von **mojo** oder **susanne** einloggen → die (noch einfache) Startseite wird sichtbar.

---

## Schritt 4 — FPE-Rechner Oberfläche: Lebensmittel suchen und anzeigen

**Angepasste Datei:**
- `src/pages/Index.tsx` — komplett ersetzt (bisher nur Platzhalter-Fallback laut `FIXME`-Kommentar in Zeile 3)

**Neue Dateien:**
- `src/components/FoodSearch.tsx`
  - `FoodSearch({ onSelect }: { onSelect: (item: FoodItem) => void })` — Eingabefeld + Ergebnisliste, nutzt `useFoodSearch` (Schritt 2)
- `src/components/FpeCalculatorCard.tsx`
  - `FpeCalculatorCard({ item, amountG }: { item: FoodItem; amountG: number })` — zeigt kcal, Netto-KH, FPE und Makro-Prozente für die gewählte Menge (nutzt `scaleNutrients`, `calculateFpe`, `calculateNetCarbs`, `calculateMacroPercentages` aus Schritt 1)

**Neuer Inhalt von `Index.tsx`:**
- Titel/Beschreibung mit `APP_NAME` (Schritt 1)
- `<FoodSearch onSelect={...}>` zum Suchen
- Eingabefeld „Menge (g)“, sobald ein Lebensmittel gewählt wurde
- `<FpeCalculatorCard>` zeigt die berechneten Werte live an

**Bestehender Code:** keine weiteren Änderungen außer der Neufassung von `Index.tsx`.

**npm install:** keine (nutzt vorhandene shadcn-Komponenten `Card`, `Input`, `Label`).

**TESTHINWEIS (Klick-Anleitung):**
1. Mit mojo/susanne einloggen.
2. Im Suchfeld „Butter“ eingeben → Ergebnisliste erscheint.
3. Ein Produkt anklicken → Mengenfeld und Rechner-Karte erscheinen mit kcal, Netto-KH und FPE.
4. Menge ändern (z.B. von 100 auf 50) → Werte aktualisieren sich sofort.

---

## Schritt 5 — Mahlzeiten-Tagebuch (lokale Speicherung)

**Neue Dateien:**
- `src/hooks/useMealDiary.ts`
  - `useMealDiary()` — verwendet vorhandenes `useLocalStorage`; Funktionen: `addEntry(entry: MealEntry)`, `removeEntry(id: string)`, `getEntriesForDate(dateISO: string): MealEntry[]`, `todayISO: string`
- `src/components/MealDiary.tsx`
  - `MealDiary()` — listet Einträge des heutigen Tages gruppiert nach `mealType` (Frühstück/Mittag/Abend/Snack) mit Löschen-Button, zeigt Tagessumme (kcal, Netto-KH, FPE)

**Bestehender Code (minimaler Eingriff):**
- `src/pages/Index.tsx` (Fassung aus Schritt 4): eine Zeile ergänzen, um `<MealDiary />` unterhalb von `<FpeCalculatorCard />` einzubinden, plus Import-Zeile am Dateianfang.

**npm install:** keine.

**TESTHINWEIS (Klick-Anleitung):**
1. Ein Lebensmittel zur Kategorie „Frühstück“ hinzufügen.
2. Seite mit F5 neu laden → der Eintrag muss weiterhin sichtbar sein (lokal gespeichert).
3. Tagessumme oben in der Übersicht muss den hinzugefügten Wert enthalten.

---

## Schritt 6 — Dashboard mit Tageszielen

**Neue Dateien:**
- `src/config/goals.ts`
  - `DEFAULT_DAILY_GOALS: DailyGoals` — z.B. `{ maxCarbsG: 100, maxNetCarbsG: 80, targetFpe: 20, targetKcal: 2000 }`
- `src/hooks/useDailyGoals.ts`
  - `useDailyGoals()` — liest/schreibt Ziele über `useLocalStorage`, mit `DEFAULT_DAILY_GOALS` als Ausgangswert; Funktion `updateGoals(partial: Partial<DailyGoals>)`
- `src/components/DailyGoalsCard.tsx`
  - `DailyGoalsCard()` — zeigt Fortschrittsbalken (vorhandene `ui/progress.tsx`) für KH, Netto-KH, FPE, kcal im Vergleich zu den Zielen; Eingabefelder zum Anpassen der Ziele

**Bestehender Code (minimaler Eingriff):**
- `src/pages/Index.tsx` (Fassung aus Schritt 5): eine Zeile ergänzen, um `<DailyGoalsCard />` oberhalb von `<FpeCalculatorCard />` einzubinden, plus Import-Zeile am Dateianfang.

**npm install:** keine (nutzt vorhandenes `src/components/ui/progress.tsx`).

**TESTHINWEIS (Klick-Anleitung):**
1. Auf der Startseite das Ziel „max. KH“ von 100 auf 80 ändern.
2. Der Fortschrittsbalken muss sich sofort anpassen (z.B. Farbe wechselt bei Überschreitung).
3. Seite neu laden (F5) → das geänderte Ziel muss erhalten bleiben.

---

## Schritt 7 — Rezepte: Weg A (Suche) + Weg B (manuell), verschlüsselt auf relay.mojobus.co, Navigation

**Neue Dateien:**
- `src/config/recipes.ts`
  - `RECIPE_RELAY_URL: string` — `"wss://relay.mojobus.co"`
  - `RECIPE_EVENT_KIND: number` — wird beim Umsetzen dieses Schritts per Kind-Generator-Tool erzeugt und hier eingetragen (addressable, 30000–39999)
- `src/lib/recipeCrypto.ts`
  - `encryptRecipeForRecipients(content: object, recipientPubkeys: string[], signer): Promise<Record<string, string>>` — verschlüsselt den Rezeptinhalt separat für jeden der beiden autorisierten Pubkeys (NIP-44), Ergebnis `{ [pubkey]: cipherText }`
  - `decryptRecipeForSelf(encryptedMap: Record<string, string>, ownPubkey: string, authorPubkey: string, signer): Promise<object | null>` — entschlüsselt den für den eigenen Pubkey bestimmten Eintrag
- `src/components/IngredientPicker.tsx`
  - `IngredientPicker({ onAdd }: { onAdd: (ingredient: Ingredient) => void })` — nutzt die vorhandene `ui/tabs.tsx`-Komponente mit zwei Reitern:
    - **„Aus Suche“ (Weg A):** bindet `<FoodSearch onSelect={...}>` (Schritt 4) ein + Mengenfeld (g). Button „Zutat hinzufügen“ erzeugt `Ingredient` mit `source: "search"` und ruft `onAdd` auf.
    - **„Manuell“ (Weg B):** Formular mit Pflichtfeldern Name, Menge (g), kcal/100g, Kohlenhydrate/100g, Ballaststoffe/100g, Eiweiß/100g, Fett/100g. Button ist erst aktiv, wenn alle Pflichtfelder gefüllt sind; erzeugt `Ingredient` mit `source: "manual"` und ruft `onAdd` auf.
- `src/hooks/useRecipes.ts`
  - `useRecipes()` — fragt `RECIPE_EVENT_KIND`-Events von `RECIPE_RELAY_URL` ab, gefiltert auf `authors: <Pubkeys aus AUTHORIZED_NPUBS>`, entschlüsselt jedes Event für den eingeloggten Nutzer über `decryptRecipeForSelf`
- `src/hooks/usePublishRecipe.ts`
  - `usePublishRecipe()` — Mutation: verschlüsselt via `encryptRecipeForRecipients` und publiziert das Event gezielt an `RECIPE_RELAY_URL`
- `src/components/RecipeForm.tsx`
  - `RecipeForm({ onSaved }: { onSaved?: () => void })` — Felder Name/Beschreibung/Zubereitung, Liste bereits hinzugefügter Zutaten (mit Entfernen-Button), bindet `<IngredientPicker>` ein, zeigt live berechnete Rezept-Summe (kcal, Netto-KH, FPE) über `sumIngredientNutrients` + `calculateFpe`/`calculateNetCarbs`. Speichern-Button ruft `usePublishRecipe().mutate`.
- `src/components/RecipeList.tsx`
  - `RecipeList()` — listet entschlüsselte Rezepte aus `useRecipes()`, zeigt je Rezept Name, Zutatenliste und berechnete Gesamt-FPE
- `src/components/AppNav.tsx`
  - `AppNav()` — Navigationsleiste mit `NavLink` (react-router-dom): „Start“ (`/`) und „Rezepte“ (`/rezepte`), aktiver Link optisch hervorgehoben
- `src/pages/RecipesPage.tsx`
  - Standard-Export `RecipesPage()` — bindet `AccessGate`, `AppNav`, `RecipeForm`, `RecipeList` zusammen

**Neue Doku-Datei:** `NIP.md` — dokumentiert `RECIPE_EVENT_KIND` und das NIP-44-Verschlüsselungsschema (Pflicht laut Projektregeln bei neuen Kinds).

**Bestehender Code (minimaler Eingriff):**
- `src/AppRouter.tsx` (Stand nach Schritt 3)
  - Nach der `AccessGate`-Importzeile: neue Zeile einfügen: `import RecipesPage from "./pages/RecipesPage";`
  - Vor der Catch-all-Zeile (`<Route path="*" element={<NotFound />} />`): neue Zeile einfügen: `<Route path="/rezepte" element={<AccessGate><RecipesPage /></AccessGate>} />`
- `src/pages/Index.tsx` (Stand nach Schritt 6)
  - Direkt nach der öffnenden `<div className="min-h-screen ...">`-Zeile: neue Zeile einfügen: `<AppNav />`, plus Import-Zeile am Dateianfang.

**npm install:** keine (NIP-44 über vorhandenen Nostr-Signer verfügbar; Relay-Zugriff über bestehendes `@nostrify/react`; `Tabs`-Komponente bereits vorhanden).

**TESTHINWEIS (Klick-Anleitung):**
1. Mit einem autorisierten Account eingeloggt auf der Startseite → oben erscheint jetzt eine Navigationsleiste mit „Start“ und „Rezepte“.
2. Auf „Rezepte“ klicken → Unterseite `/rezepte` öffnet sich.
3. Neues Rezept: Namen eingeben, im Reiter „Aus Suche“ z.B. „Butter“ suchen und als Zutat hinzufügen.
4. Im Reiter „Manuell“ eine zweite Zutat mit allen Pflichtfeldern eintragen und hinzufügen.
5. Die Rezept-Summe (kcal, Netto-KH, FPE) muss beide Zutaten berücksichtigen und sich sofort aktualisieren.
6. Rezept speichern (als **mojo**) → erscheint in der Rezeptliste.
7. Als **susanne** einloggen (anderer Account) → das von mojo angelegte Rezept muss lesbar erscheinen (Entschlüsselung funktioniert).
8. Mit einem dritten, nicht autorisierten Account versuchen `/rezepte` zu öffnen → `AccessGate` blockiert den Zugriff.
9. Über die Navigationsleiste zurück auf „Start“ klicken → der FPE-Rechner funktioniert weiterhin normal.

---

## Schritt 8 — PWA-Grundlagen & Deployment-Vorbereitung (fpe.mojobus.co)

**Neue Dateien:**
- `src/config/pwa.ts`
  - `PWA_SHORT_NAME: string`, `PWA_THEME_COLOR: string`, `PWA_BACKGROUND_COLOR: string` — Referenzwerte für die statische Manifest-Datei (ein `.webmanifest` kann kein JS-Konfig importieren; diese Datei dient als zentrale Referenz für Wartung)
- `public/manifest.webmanifest` — Name, Icons, `theme_color`, `background_color`, `display: "standalone"`, `start_url`
- Icon-Dateien in `public/` (z.B. `icon-192x192.png`, `icon-512x512.png`)

**Bestehender Code (minimaler Eingriff):**
- `index.html` (aktueller Stand, 14 Zeilen)
  - Nach Zeile 5 (`<meta name="viewport" ...>`): `<title>` und `<meta name="description">` ergänzen (Wert aus `src/config/app.ts` als Referenz übernehmen)
  - Zeile 7 (`<link rel="manifest" ...>` existiert bereits, keine Änderung nötig)
  - Nach Zeile 7: `<meta name="theme-color" content="...">` ergänzen (Wert aus `src/config/pwa.ts`)

**npm install (optional):** `vite-plugin-pwa` — nur nötig für automatische Service-Worker-Generierung mit Offline-Caching. Ohne dieses Paket funktioniert die App weiterhin als installierbare PWA über das Manifest, aber ohne Offline-Cache.

**TESTHINWEIS (Klick-Anleitung):**
1. Browser öffnen, F12 → Tab „Anwendung“/„Application“ → „Manifest“ prüfen: Name und Icons korrekt geladen.
2. Auf einem Mobilgerät die Seite öffnen → Browser-Menü sollte „Zum Startbildschirm hinzufügen“ anbieten.
3. Nach dem Hinzufügen: App-Icon auf dem Homescreen antippen → App startet im Vollbildmodus ohne Browser-Adressleiste.

---

## Schritt 9 — Design im mojobusco-Look (Farben, Schrift, Formen)

**npm install:**
- `@fontsource-variable/inter`
- `@fontsource-variable/playfair-display`

**Bestehender Code (minimaler Eingriff, rein visuell — keine Funktionsänderung):**
- `src/main.tsx` (aktueller Stand, 18 Zeilen)
  - Zeilen 10–11 (`// FIXME: a custom font ...` Kommentar) ersetzen durch:
    ```ts
    import '@fontsource-variable/inter';
    import '@fontsource-variable/playfair-display';
    ```
- `src/index.css`
  - Im Block `@theme inline { ... }`: zwei neue Zeilen ergänzen:
    ```css
    --font-sans: 'Inter Variable', 'Inter', system-ui, -apple-system, sans-serif;
    --font-serif: 'Playfair Display Variable', 'Playfair Display', serif;
    ```
  - Im `:root { ... }`-Block: `--radius` von `0.75rem` auf `1.5rem` ändern; die Farbwerte (`--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--border`, `--input`, `--ring`, `--chart-1..5`, `--sidebar*`) durch die mojobusco-Ocean-Teal/Coral-Werte ersetzen (Primary: Teal `hsl(188 88% 42%)`, Accent: Coral `hsl(349 83% 51%)`)
  - Im `.dark { ... }`-Block: gleiche Farbfamilie in der dunkleren mojobusco-Variante ersetzen
  - Am Ende der Datei (nach dem bestehenden `@layer base { ... }`-Block): neue Utility-Klasse `.gradient-text` (Verlauf Primary → Accent für Überschriften) sowie `::selection`- und Scrollbar-Styling ergänzen

**Bestehender Code:** keine Komponenten-Logik wird verändert — nur Farb-/Schrift-/Radius-Werte.

**TESTHINWEIS (Klick-Anleitung):**
1. Seite neu laden → Überschriften erscheinen in der Serifenschrift (Playfair Display), Fließtext in Inter.
2. Buttons, Karten und Eingabefelder zeigen jetzt Teal als Hauptfarbe statt des bisherigen Blau/Grau; abgerundete Ecken sind deutlich stärker (großzügiger Radius).
3. Auf dunkles Design umschalten (falls vorhanden) → Teal/Coral-Farbtöne bleiben in dunklerer, gut lesbarer Variante erhalten.
4. `npm run build` läuft weiterhin fehlerfrei durch.

---

## Checkliste

- [x] Schritt 1 — Konfiguration (mit echten npubs), Typen, FPE-Rechenfunktionen (`src/config/app.ts`, `src/types/nutrition.ts`, `src/lib/fpe.ts`)
- [ ] Schritt 2 — Open Food Facts Anbindung (`src/config/openFoodFacts.ts`, `src/lib/openFoodFacts.ts`, `src/hooks/useFoodSearch.ts`)
- [ ] Schritt 3 — Zugriffssperre nur für mojo & susanne (`useAuthorized.ts`, `AccessGate.tsx`, Anpassung `AppRouter.tsx`)
- [ ] Schritt 4 — FPE-Rechner Oberfläche (`FoodSearch.tsx`, `FpeCalculatorCard.tsx`, Neufassung `Index.tsx`)
- [ ] Schritt 5 — Mahlzeiten-Tagebuch (`useMealDiary.ts`, `MealDiary.tsx`)
- [ ] Schritt 6 — Dashboard mit Tageszielen (`src/config/goals.ts`, `useDailyGoals.ts`, `DailyGoalsCard.tsx`)
- [ ] Schritt 7 — Rezepte Weg A + Weg B, verschlüsselt auf relay.mojobus.co, Navigation (`recipes.ts`, `recipeCrypto.ts`, `IngredientPicker.tsx`, `useRecipes.ts`, `usePublishRecipe.ts`, `RecipeForm.tsx`, `RecipeList.tsx`, `AppNav.tsx`, `RecipesPage.tsx`, `NIP.md`, Anpassung `AppRouter.tsx` + `Index.tsx`)
- [ ] Schritt 8 — PWA-Grundlagen & Deployment-Vorbereitung (`manifest.webmanifest`, Icons, Anpassung `index.html`)
- [ ] Schritt 9 — Design im mojobusco-Look (Fonts, Farben, Radius in `src/main.tsx` + `src/index.css`)
