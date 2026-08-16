import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useNostr } from "@nostrify/react";
import { nip19 } from "nostr-tools";
import { useCurrentUser } from "./useCurrentUser";
import {
  INGREDIENT_EVENT_KIND,
  INGREDIENT_RELAY_URL,
  FPE_CLIENT_TAG,
} from "@/config/ingredients";
import { AUTHORIZED_NPUBS } from "@/config/app";
import { encryptIngredientForRecipients } from "@/lib/ingredientCrypto";
import type { Ingredient } from "@/types/nutrition";
import type { NostrEvent } from "@nostrify/nostrify";

export function usePublishIngredient(): UseMutationResult<
  NostrEvent,
  Error,
  Ingredient
> {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (ingredient: Ingredient) => {
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

      const encryptedMap = await encryptIngredientForRecipients(
        ingredient,
        recipientPubkeys,
        user.signer,
      );

      const event = await user.signer.signEvent({
        kind: INGREDIENT_EVENT_KIND,
        content: JSON.stringify(encryptedMap),
        tags: [
          ["d", ingredient.id],
          ["client", FPE_CLIENT_TAG],
        ],
        created_at: Math.floor(Date.now() / 1000),
      });

      const relay = nostr.relay(INGREDIENT_RELAY_URL);
      await relay.event(event);

      return event;
    },
    onError: (error) => {
      console.error("Failed to publish ingredient:", error);
    },
    onSuccess: (data) => {
      console.log("Ingredient published successfully:", data);
    },
  });
}
