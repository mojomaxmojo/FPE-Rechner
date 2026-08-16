import { useMutation } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { nip19 } from 'nostr-tools';

import { AUTHORIZED_NPUBS } from '@/config/app.ts';
import { RECIPE_EVENT_KIND, RECIPE_RELAY_URL } from '@/config/recipes.ts';
import { encryptRecipeForRecipients } from '@/lib/recipeCrypto.ts';
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

export function usePublishRecipe() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (content: object) => {
      if (!user?.pubkey || !user.signer) {
        throw new Error('User is not logged in');
      }

      const recipients = getAuthorizedPubkeys();
      if (recipients.length === 0) {
        throw new Error('No authorized recipients configured');
      }

      const encryptedMap = await encryptRecipeForRecipients(content, recipients, user.signer);

      const event = await user.signer.signEvent({
        kind: RECIPE_EVENT_KIND,
        content: JSON.stringify(encryptedMap),
        tags: [
          ['d', crypto.randomUUID()],
          ['alt', 'Encrypted recipe for FPE app'],
        ],
        created_at: Math.floor(Date.now() / 1000),
      });

      const relay = nostr.relay(RECIPE_RELAY_URL);
      await relay.event(event, { signal: AbortSignal.timeout(15000) });
      return event;
    },
  });
}
