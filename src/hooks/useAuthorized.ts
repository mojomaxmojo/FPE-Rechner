import { useMemo } from 'react';
import { nip19 } from 'nostr-tools';

import { AUTHORIZED_NPUBS } from '@/config/app.ts';
import { useCurrentUser } from './useCurrentUser.ts';

export function useAuthorized() {
  const { user } = useCurrentUser();

  const authorizedHexes = useMemo(() => {
    const hexes: string[] = [];
    for (const npub of AUTHORIZED_NPUBS) {
      try {
        const decoded = nip19.decode(npub);
        if (decoded.type === 'npub') {
          hexes.push(decoded.data);
        }
      } catch {
        // Ungültige npub-Einträge ignorieren.
      }
    }
    return hexes;
  }, []);

  const isLoggedIn = Boolean(user);
  const isAuthorized = Boolean(user?.pubkey && authorizedHexes.includes(user.pubkey));

  return { isAuthorized, isLoggedIn };
}
