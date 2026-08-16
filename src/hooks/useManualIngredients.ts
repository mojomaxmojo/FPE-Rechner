import { useQuery } from "@tanstack/react-query";
import { useNostr } from "@nostrify/react";
import { nip19 } from "nostr-tools";
import { useCurrentUser } from "./useCurrentUser";
import { INGREDIENT_EVENT_KIND, INGREDIENT_RELAY_URL } from "@/config/ingredients";
import { AUTHORIZED_NPUBS } from "@/config/app";
import { decryptIngredientForSelf } from "@/lib/ingredientCrypto";
import type { Ingredient } from "@/types/nutrition";

function getAuthorizedPubkeys(): string[] {
  return AUTHORIZED_NPUBS
    .map((npub) => {
      try {
        const decoded = nip19.decode(npub);
        if (decoded.type === "npub") {
          return decoded.data;
        }
      } catch {
        // ignore
      }
      return null;
    })
    .filter((pubkey): pubkey is string => pubkey !== null);
}

export function useManualIngredients() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery<Ingredient[]>({
    queryKey: ["manualIngredients", user?.pubkey],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      const relay = nostr.relay(INGREDIENT_RELAY_URL);
      const events = await relay.query(
        [
          {
            kinds: [INGREDIENT_EVENT_KIND],
            authors: getAuthorizedPubkeys(),
          },
        ],
        { signal: AbortSignal.timeout(10000) },
      );

      const ingredients: Ingredient[] = [];

      for (const event of events) {
        let encryptedMap: Record<string, string>;
        try {
          encryptedMap = JSON.parse(event.content) as Record<string, string>;
        } catch {
          continue;
        }

        const decrypted = await decryptIngredientForSelf(
          encryptedMap,
          user.pubkey,
          event.pubkey,
          user.signer,
        );

        if (decrypted) {
          ingredients.push(decrypted as Ingredient);
        }
      }

      return ingredients.sort((a, b) => b.id.localeCompare(a.id));
    },
    enabled: Boolean(user),
    staleTime: 30 * 1000,
  });
}
