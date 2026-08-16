import { useQuery } from "@tanstack/react-query";
import { useNostr } from "@nostrify/react";
import { nip19 } from "nostr-tools";
import { useCurrentUser } from "./useCurrentUser";
import { RECIPE_EVENT_KIND, RECIPE_RELAY_URL } from "@/config/recipes";
import { AUTHORIZED_NPUBS } from "@/config/app";
import { decryptRecipeForSelf } from "@/lib/recipeCrypto";
import type { Recipe } from "@/types/nutrition";

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

export function useRecipes() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery<Recipe[]>({
    queryKey: ["recipes", user?.pubkey],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      const relay = nostr.relay(RECIPE_RELAY_URL);
      const events = await relay.query(
        [
          {
            kinds: [RECIPE_EVENT_KIND],
            authors: getAuthorizedPubkeys(),
          },
        ],
        { signal: AbortSignal.timeout(10000) },
      );

      const recipes: Recipe[] = [];

      for (const event of events) {
        let encryptedMap: Record<string, string>;
        try {
          encryptedMap = JSON.parse(event.content) as Record<string, string>;
        } catch {
          continue;
        }

        const decrypted = await decryptRecipeForSelf(
          encryptedMap,
          user.pubkey,
          event.pubkey,
          user.signer,
        );

        if (decrypted) {
          recipes.push(decrypted as Recipe);
        }
      }

      // Sort by creation date, newest first
      return recipes.sort((a, b) => b.createdAtMs - a.createdAtMs);
    },
    enabled: Boolean(user),
    staleTime: 30 * 1000,
  });
}
