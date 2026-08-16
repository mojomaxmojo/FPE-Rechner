# FEATURE-PLAN: FPE-Rechner + Rezepte + Mahlzeiten-Tagebuch (fpe.mojobus.co)

Dieser Plan setzt die im Chat besprochene App schrittweise um:
- Zugriff nur für `mojo` und `susanne` (Nostr-Login)
- Lebensmittelsuche über Open Food Facts
- FPE-Rechner (Fett-Protein-Einheiten) für Typ-1-Diabetes / Keto bis 100g KH
- Mahlzeiten-Tagebuch (lokal gespeichert)
- Dashboard mit Tageszielen
- Eigene Rezepte, verschlüsselt auf `relay.mojobus.co` gespeichert (nur für die 2 Autoren lesbar)
- PWA-Grundlagen

**Grundprinzip:** Alle einstellbaren Werte (Autoren, Relay-URL, API-URLs, Ziel-Werte, Kind-Nummer) liegen in `src/config/*.ts` — nichts davon wird im Code fest verdrahtet. Jeder Schritt lässt das Projekt lauffähig zurück (`npm run build` / Vorschau funktioniert weiter).

---

## Schritt 1 — Fundament: Konfiguration, Typen, reine Rechenfunktionen

**Neue Dateien:**
- `src/config/app.ts`
  - `APP_NAME: string` — Anzeigename der App (z.B. "FPE Rechner")
  - `AUTHORIZED_NPUBS: string[]` — die beiden npubs aus dem Chat (mojo, susanne)
- `src/types/nutrition.ts`
  - `interface NutrientValues` — kcal, carbsG, fiberG, proteinG, fatG, sowie optionale Vitamine/Mineralstoffe (z.B. `vitaminCMg`, `vitaminDµg`, `potassiumMg`, …)
  - `interface FoodItem` — id, name, brand, nutrientsPer100g: NutrientValues, source ("off" | "custom")
  - `interface MealEntry` — id, foodItem, amountG, mealType ("breakfast"|"lunch"|"dinner"|"snack"), timestampMs
  - `interface DailyGoals` — maxCarbsG, maxNetCarbsG, targetFpe, targetKcal
- `src/lib/fpe.ts` (reine Funktionen, keine Seiteneffekte)
  - `calculateFpe(fatG: number, proteinG: number): number` — Fett÷12 + Protein÷25
  - `calculateNetCarbs(carbsG: number, fiberG: number): number`
  - `calculateCalories(carbsG: number, proteinG: number, fatG: number): number`
  - `calculateMacroPercentages(n: NutrientValues): { carbsPct: number; proteinPct: number; fatPct: number }`
  - `scaleNutrients(n: NutrientValues, amountG: number): NutrientValues` — skaliert Pro-100g-Werte auf tatsächliche Menge

**Bestehender Code:** keine Änderungen nötig.

**npm install:** keine (nur TypeScript, keine neuen Pakete).

**TESTHINWEIS:**
Es gibt noch keine sichtbare Änderung auf der Webseite. Prüfe im Terminal, dass der Build weiterhin fehlerfrei läuft:
```
npm run build
```
Es sollte am Ende `Project built successfully!` erscheinen, ohne rote Fehlermeldungen.

---

## Schritt 2 — Open Food Facts Anbindung (Backend-Logik, noch ohne UI)

**Neue Dateien:**
- `src/config/openFoodFacts.ts`
  - `OFF_API_BASE_URL: string` — `https://world.openfoodfacts.org`
  - `OFF_SEARCH_LANGUAGE: string` — `"de"`
  - `OFF_SEARCH_PAGE_SIZE: number` — z.B. `20`
- `src/lib/openFoodFacts.ts`
  - `searchOffProducts(query: string): Promise<unknown[]>` — ruft die OFF-Such-API auf
  - `mapOffProductToFoodItem(product: unknown): FoodItem | null` — wandelt OFF-Rohdaten in `FoodItem` (aus Schritt 1) um, inkl. verfügbarer Vitamine
- `src/hooks/useFoodSearch.ts`
  - `useFoodSearch(query: string)` — TanStack-Query-Hook, der `searchOffProducts` + `mapOffProductToFoodItem` kombiniert und `FoodItem[]` liefert

**Bestehender Code:** keine Änderungen nötig.

**npm install:** keine (verwendet `fetch`, vorhandenes `@tanstack/react-query` und `zod`).

**TESTHINWEIS:**
Noch keine sichtbare Änderung in der App. Zum Prüfen: Browser öffnen, F12 (Entwicklertools) → Tab „Konsole“, dort eingeben:
```js
fetch('https://world.openfoodfacts.org/api/v2/search?search_terms=butter&json=1').then(r => r.json()).then(console.log)
```
Es sollte ein JSON-Objekt mit Produkten in der Konsole erscheinen. Zusätzlich: `npm run build` muss weiterhin fehlerfrei durchlaufen.

---

## Schritt 3 — Zugriffssperre (nur mojo & susanne)

**Neue Dateien:**
- `src/hooks/useAuthorized.ts`
  - `useAuthorized()` — liest `useCurrentUser()`, dekodiert `AUTHORIZED_NPUBS` (aus `src/config/app.ts`) via `nip19.decode`, vergleicht Hex-Pubkeys, gibt `{ isAuthorized: boolean; isLoggedIn: boolean }` zurück
- `src/components/AccessGate.tsx`
  - `AccessGate({ children })` — zeigt bei `!isLoggedIn` einen Login-Hinweis mit `<LoginArea />`; bei `isLoggedIn && !isAuthorized` einen „Kein Zugriff“-Hinweis; sonst `children`

**Bestehender Code (minimaler Eingriff):**
- `src/AppRouter.tsx`
  - Zeile 4: zusätzlicher Import `import { AccessGate } from "./components/AccessGate";`
  - Zeile 13: `<Route path="/" element={<Index />} />` → `<Route path="/" element={<AccessGate><Index /></AccessGate>} />`

**npm install:** keine (nutzt vorhandenes `nostr-tools`, `LoginArea`, `useCurrentUser`).

**TESTHINWEIS (Klick-Anleitung):**
1. Seite im Browser neu laden, ohne eingeloggt zu sein → es sollte ein Login-Hinweis statt der Startseite erscheinen.
2. Mit einem **fremden** Nostr-Account einloggen (nicht mojo/susanne) → es sollte „Kein Zugriff“ angezeigt werden.
3. Mit dem Account von **mojo** oder **susanne** einloggen → die (noch einfache) Startseite sollte sichtbar werden.

---

## Schritt 4 — FPE-Rechner Oberfläche (erste sichtbare Frontend-Funktion)

**Angepasste Datei:**
- `src/pages/Index.tsx` — komplett ersetzt (bisher nur Platzhalter-Fallback laut `FIXME`-Kommentar in Zeile 3). Neuer Inhalt bindet die unten genannten Komponenten ein.

**Neue Dateien:**
- `src/components/FoodSearch.tsx`
  - `FoodSearch({ onSelect })` — Eingabefeld + Ergebnisliste, nutzt `useFoodSearch` (Schritt 2)
- `src/components/FpeCalculatorCard.tsx`
  - `FpeCalculatorCard({ items: MealEntry[] })` — zeigt je Eintrag und in Summe: kcal, Netto-KH, FPE, Makro-Prozente (nutzt `src/lib/fpe.ts` aus Schritt 1)

**Bestehender Code:** keine weiteren Änderungen außer der Neufassung von `Index.tsx`.

**npm install:** keine (nutzt vorhandene shadcn-Komponenten `Card`, `Input`, `Button`).

**TESTHINWEIS (Klick-Anleitung):**
1. Mit mojo/susanne einloggen.
2. Im Suchfeld „Butter“ eingeben → Ergebnisliste mit Produkten erscheint.
3. Ein Produkt anklicken/hinzufügen → in der Rechner-Karte erscheinen kcal, Netto-KH und FPE-Wert und aktualisieren sich live.

---

## Schritt 5 — Mahlzeiten-Tagebuch (lokale Speicherung)

**Neue Dateien:**
- `src/hooks/useMealDiary.ts`
  - `useMealDiary()` — verwendet vorhandenes `useLocalStorage` (kein neuer Speichermechanismus); Funktionen: `addEntry(entry: MealEntry)`, `removeEntry(id: string)`, `getEntriesForDate(dateISO: string): MealEntry[]`
- `src/components/MealDiary.tsx`
  - `MealDiary()` — listet Einträge des heutigen Tages gruppiert nach `mealType` (Frühstück/Mittag/Abend/Snack) mit Löschen-Button, zeigt Tagessumme (kcal, Netto-KH, FPE)

**Bestehender Code (minimaler Eingriff):**
- `src/pages/Index.tsx` (Fassung aus Schritt 4): eine Zeile ergänzen, um `<MealDiary />` unterhalb von `<FpeCalculatorCard />` einzubinden.

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
  - `DailyGoalsCard()` — zeigt Fortschrittsbalken (vorhandene `ui/progress.tsx`-Komponente) für KH, Netto-KH, FPE, kcal im Vergleich zu den Zielen; Eingabefelder zum Anpassen der Ziele

**Bestehender Code (minimaler Eingriff):**
- `src/pages/Index.tsx`: eine Zeile ergänzen, um `<DailyGoalsCard />` oberhalb von `<FpeCalculatorCard />` einzubinden.

**npm install:** keine (nutzt vorhandenes `src/components/ui/progress.tsx`).

**TESTHINWEIS (Klick-Anleitung):**
1. Auf der Startseite das Ziel „max. KH“ von 100 auf 80 ändern.
2. Der Fortschrittsbalken muss sich sofort anpassen (z.B. Farbe wechselt bei Überschreitung).
3. Seite neu laden (F5) → das geänderte Ziel muss erhalten bleiben.

---

## Schritt 7 — Rezepte, verschlüsselt auf relay.mojobus.co

**Neue Dateien:**
- `src/config/recipes.ts`
  - `RECIPE_RELAY_URL: string` — `"wss://relay.mojobus.co"`
  - `RECIPE_EVENT_KIND: number` — Platzhalter-Kommentar: *„Wird beim Umsetzen dieses Schritts per Kind-Generator-Tool erzeugt und hier eingetragen (addressable, 30000–39999)“*
- `src/lib/recipeCrypto.ts`
  - `encryptRecipeForRecipients(content: object, recipientPubkeys: string[], signer): Promise<Record<string, string>>` — verschlüsselt den Rezeptinhalt separat für jeden der beiden autorisierten Pubkeys (NIP-44), Ergebnis ist ein Objekt `{ [pubkey]: cipherText }`
  - `decryptRecipeForSelf(encryptedMap: Record<string, string>, ownPubkey: string, signer): Promise<object | null>` — entschlüsselt den für den eigenen Pubkey bestimmten Eintrag
- `src/hooks/useRecipes.ts`
  - `useRecipes()` — fragt `RECIPE_EVENT_KIND`-Events von `RECIPE_RELAY_URL` ab, gefiltert auf `authors: AUTHORIZED_PUBKEYS` (aus Schritt 3/1), entschlüsselt jedes Event für den eingeloggten Nutzer
- `src/hooks/usePublishRecipe.ts`
  - `usePublishRecipe()` — Mutation: verschlüsselt via `encryptRecipeForRecipients` und publiziert das Event gezielt an `RECIPE_RELAY_URL`
- `src/components/RecipeForm.tsx`, `src/components/RecipeList.tsx`
- `src/pages/RecipesPage.tsx` — bindet `AccessGate`, `RecipeForm`, `RecipeList` zusammen

**Bestehender Code (minimaler Eingriff):**
- `src/AppRouter.tsx`
  - Zeile 4-Bereich: zusätzlicher Import `import RecipesPage from "./pages/RecipesPage";`
  - Vor Zeile 17 (Catch-all-Route) eine neue Zeile einfügen: `<Route path="/recipes" element={<AccessGate><RecipesPage /></AccessGate>} />`

**Neue Doku-Datei:** `NIP.md` — dokumentiert den neuen `RECIPE_EVENT_KIND` und das Verschlüsselungsschema (Pflicht laut Projektregeln bei neuen Kinds).

**npm install:** keine (NIP-44-Verschlüsselung ist über den vorhandenen Nostr-Signer verfügbar; Relay-Zugriff über bestehendes `@nostrify/react`).

**TESTHINWEIS (Klick-Anleitung):**
1. Als **mojo** einloggen, unter „Rezepte“ ein neues Rezept anlegen und speichern.
2. Als **susanne** einloggen (anderer Nostr-Account) → das von mojo angelegte Rezept muss lesbar erscheinen.
3. Mit einem dritten, nicht autorisierten Account versuchen `/recipes` zu öffnen → `AccessGate` muss den Zugriff blockieren (siehe Schritt 3).

---

## Schritt 8 — PWA-Grundlagen & Deployment-Vorbereitung (fpe.mojobus.co)

**Neue Dateien:**
- `src/config/pwa.ts`
  - `PWA_SHORT_NAME: string`, `PWA_THEME_COLOR: string`, `PWA_BACKGROUND_COLOR: string` — Referenzwerte, die manuell in die unten genannte statische Manifest-Datei übertragen werden (ein `.webmanifest` ist eine statische JSON-Datei und kann kein JS-Konfig importieren; die Werte hier dienen als zentrale Referenz für Wartung)
- `public/manifest.webmanifest` — Name, Icons, `theme_color`, `background_color`, `display: "standalone"`, `start_url`
- Icon-Dateien in `public/` (z.B. `icon-192x192.png`, `icon-512x512.png`)

**Bestehender Code (minimaler Eingriff):**
- `index.html`
  - Zeile 5 (nach dem `viewport`-Meta-Tag): `<title>` und `<meta name="description">` ergänzen (App-Name aus `src/config/app.ts` als Referenzwert übernehmen)
  - Zeile 7 (`<link rel="manifest" ...>` existiert bereits, keine Änderung nötig)
  - Nach Zeile 7: `<meta name="theme-color" content="...">` ergänzen (Wert aus `src/config/pwa.ts` übernehmen)

**npm install (optional):** `vite-plugin-pwa` — nur nötig, falls automatische Service-Worker-Generierung mit Offline-Caching gewünscht ist. Ohne dieses Paket funktioniert die App weiterhin als installierbare PWA über das Manifest, aber ohne Offline-Cache.

**TESTHINWEIS (Klick-Anleitung):**
1. Browser öffnen, F12 (Entwicklertools) → Tab „Anwendung“/„Application“ → „Manifest“ prüfen: Name und Icons müssen korrekt geladen sein.
2. Auf einem Mobilgerät die Seite öffnen → Browser-Menü sollte „Zum Startbildschirm hinzufügen“ anbieten.
3. Nach dem Hinzufügen: App-Icon auf dem Homescreen antippen → App startet im Vollbildmodus ohne Browser-Adressleiste.

---

## Checkliste

- [x] Schritt 1 — Konfiguration, Typen, FPE-Rechenfunktionen (`src/config/app.ts`, `src/types/nutrition.ts`, `src/lib/fpe.ts`)
- [x] Schritt 2 — Open Food Facts Anbindung (`src/config/openFoodFacts.ts`, `src/lib/openFoodFacts.ts`, `src/hooks/useFoodSearch.ts`)
- [x] Schritt 3 — Zugriffssperre nur für mojo & susanne (`useAuthorized.ts`, `AccessGate.tsx`, Anpassung `AppRouter.tsx`)
- [ ] Schritt 4 — FPE-Rechner Oberfläche (`FoodSearch.tsx`, `FpeCalculatorCard.tsx`, Neufassung `Index.tsx`)
- [ ] Schritt 5 — Mahlzeiten-Tagebuch (`useMealDiary.ts`, `MealDiary.tsx`)
- [ ] Schritt 6 — Dashboard mit Tageszielen (`src/config/goals.ts`, `useDailyGoals.ts`, `DailyGoalsCard.tsx`)
- [ ] Schritt 7 — Verschlüsselte Rezepte auf relay.mojobus.co (`recipes.ts`, `recipeCrypto.ts`, `useRecipes.ts`, `usePublishRecipe.ts`, `RecipeForm.tsx`, `RecipeList.tsx`, `RecipesPage.tsx`, `NIP.md`)
- [ ] Schritt 8 — PWA-Grundlagen & Deployment-Vorbereitung (`manifest.webmanifest`, Icons, Anpassung `index.html`)
