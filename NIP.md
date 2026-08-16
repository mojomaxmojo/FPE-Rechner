# NIP: Verschlüsselte Rezepte und Zutaten für FPE-Rechner

## Event-Kinds

### Rezepte

- **Kind:** `39553` (addressable, 30000–39999)
- **d-Tag:** Eindeutige Rezept-ID (`recipe-{timestamp}-{random}`)
- **Speicherort:** `wss://relay.mojobus.co`

### Manuelle Zutaten

- **Kind:** `32911` (addressable, 30000–39999)
- **d-Tag:** Eindeutige Zutaten-ID (`manual-{timestamp}-lib`)
- **Speicherort:** `wss://relay.mojobus.co`

Zutaten werden mit einer Referenzmenge von `100g` gespeichert, damit sie in beliebigen Rezeptmengen wiederverwendet werden können.

## Autoren

Events werden ausschließlich von den folgenden autorisierten npubs akzeptiert:

- `npub1f4vym2mu3q9fsz08muz8d469hl568l5358qx90qlaspyuz67ru0sfxvupf`
- `npub1jn4arsy5pzqausut0u79x2mnur2dd34szcxnlc9c5407f828002qdls5wz`

## Markierung

Alle FPE-Rechner-Events tragen den Tag:

```
["client", "fpe-rechner"]
```

Dadurch können Rezepte und Zutaten auf dem Relay eindeutig dieser App zugeordnet werden.

## Verschlüsselungsschema

Der `content` eines Events enthält ein JSON-Objekt:

```json
{
  "<recipient-hex-pubkey>": "<nip44-ciphertext>",
  "<recipient-hex-pubkey-2>": "<nip44-ciphertext-2>"
}
```

- Der Klartext ist ein JSON-kodierter `Recipe`- bzw. `Ingredient`-Datensatz gemäß `src/types/nutrition.ts`.
- Der Klartext wird mit NIP-44 separat für jeden autorisierten Empfänger verschlüsselt.
- Zum Entschlüsseln sucht der Empfänger den Eintrag für seinen eigenen Hex-Pubkey und entschlüsselt mit NIP-44 unter Verwendung des Autor-Pubkeys als Peer.

## Verwendete NIPs

- NIP-01: Grundlegende Protokollstruktur
- NIP-33: Addressable Events
- NIP-44: Authentifizierte Verschlüsselung
