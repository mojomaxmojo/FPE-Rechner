# NIP: Verschlüsselte Rezepte (Kind 30717)

## Überblick

Dieses Projekt verwendet einen eigenen addressierbaren Event-Typ (Kind **30717**) zum Speichern von Rezepten. Die Rezepte werden mit NIP-44 verschlüsselt, sodass sie nur für die autorisierten Nutzer lesbar sind.

## Event-Spezifikation

| Feld | Wert |
|------|------|
| `kind` | `30717` |
| `content` | JSON-Objekt der Form `{ [pubkey]: ciphertext }`, wobei jeder Eintrag den Rezeptinhalt mit NIP-44 für einen autorisierten Pubkey verschlüsselt enthält |
| `d`-Tag | UUID oder eindeutiger Bezeichner des Rezepts |
| `alt`-Tag | `Encrypted recipe for FPE app` (menschlich lesbare Beschreibung gemäß NIP-31) |

## Autorisierung

Rezepte werden ausschließlich von den in `src/config/app.ts` hinterlegten autorisierten Pubkeys akzeptiert. Beim Lesen wird der Filter auf diese `authors` eingeschränkt.

## Verschlüsselungsschema

1. Der Rezeptinhalt (JSON-Objekt) wird in einen String serialisiert.
2. Für jeden autorisierten Empfänger wird der String mit NIP-44 (`signer.nip44.encrypt`) verschlüsselt.
3. Das Ergebnis wird als `{ [empfaengerPubkey]: ciphertext }` im `content` des Events gespeichert.
4. Beim Entschlüsseln sucht der eingeloggte Nutzer seinen eigenen Pubkey im `content`-Objekt und entschlüsselt den zugehörigen Wert mit NIP-44 (`signer.nip44.decrypt`).

## Rezept-Schema (entschlüsselter Inhalt)

```ts
interface Recipe {
  name: string;
  description?: string;
  ingredients: { name: string; amountG?: number }[];
  instructions: string;
}
```

## Relay

Rezepte werden gezielt auf `wss://relay.mojobus.co` publiziert und von dort abgefragt.
