import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';

import { AUTHORIZED_NPUBS } from '@/config/app.ts';
import { RECIPE_EVENT_KIND, RECIPE_RELAY_URL } from '@/config/recipes.ts';
import { decryptRecipeForSelf } from '@/lib/recipeCrypto.ts';
import { useCurrentUser } from './useCurrentUser.ts';

function getAuthorizedPubkeys(): string[] {
  const pubkeys: string[] = [];
  for (const npub of AUTHORIZED_NPUBS) {
    try {
      const decoded = nip19.decode(npub);
      if (decoded.type === 'npub') {
        pubkeys.push(decoded.data);
      }
    } catch {
      // Ungültige npub-Einträge ignorieren.
    }
  }
  return pubkeys;
}

export interface DecryptedRecipe {
  event: NostrEvent;
  content: object;
}

export function useRecipes() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery<DecryptedRecipe[]>({
    queryKey: ['recipes', RECIPE_EVENT_KIND, user?.pubkey],
    queryFn: async ({ signal }) => {
      if (!user?.pubkey || !user.signer) return [];

      const authors = getAuthorizedPubkeys();
      if (authors.length === 0) return [];

      const relay = nostr.relay(RECIPE_RELAY_URL);
      const events = await relay.query(
        [{ kinds: [RECIPE_EVENT_KIND], authors }],
        { signal }
      );

      const recipes: DecryptedRecipe[] = [];
      for (const event of events) {
        try {
          const encryptedMap = JSON.parse(event.content) as Record<string, string>;
          const content = await decryptRecipeForSelf(
            encryptedMap,
            user.pubkey,
            event.pubkey,
            user.signer
          );
          if (content) {
            recipes.push({ event, content });
          }
        } catch {
          // Ungültige oder nicht entschlüsselbare Events überspringen.
        }
      }
      return recipes;
    },
    enabled: Boolean(user?.pubkey),
  });
}
