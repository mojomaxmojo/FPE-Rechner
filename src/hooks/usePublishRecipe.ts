import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useNostr } from "@nostrify/react";
import { nip19 } from "nostr-tools";
import { useCurrentUser } from "./useCurrentUser";
import { RECIPE_EVENT_KIND, RECIPE_RELAY_URL } from "@/config/recipes";
import { AUTHORIZED_NPUBS } from "@/config/app";
import { encryptRecipeForRecipients } from "@/lib/recipeCrypto";
import type { Recipe } from "@/types/nutrition";
import type { NostrEvent } from "@nostrify/nostrify";

export function usePublishRecipe(): UseMutationResult<
  NostrEvent,
  Error,
  Recipe
> {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (recipe: Recipe) => {
      if (!user) {
        throw new Error("Nicht eingeloggt");
      }

      const recipientPubkeys = AUTHORIZED_NPUBS.map((npub) => {
        const decoded = nip19.decode(npub);
        if (decoded.type === "npub") {
          return decoded.data;
        }
        return null;
      }).filter((pubkey): pubkey is string => pubkey !== null);

      const encryptedMap = await encryptRecipeForRecipients(
        recipe,
        recipientPubkeys,
        user.signer,
      );

      const event = await user.signer.signEvent({
        kind: RECIPE_EVENT_KIND,
        content: JSON.stringify(encryptedMap),
        tags: [
          ["d", recipe.id],
        ],
        created_at: Math.floor(Date.now() / 1000),
      });

      const relay = nostr.relay(RECIPE_RELAY_URL);
      await relay.event(event);

      return event;
    },
    onError: (error) => {
      console.error("Failed to publish recipe:", error);
    },
    onSuccess: (data) => {
      console.log("Recipe published successfully:", data);
    },
  });
}
