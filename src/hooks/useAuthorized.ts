import { useMemo } from "react";
import { nip19 } from "nostr-tools";
import { useCurrentUser } from "./useCurrentUser";
import { AUTHORIZED_NPUBS } from "@/config/app";

export function useAuthorized() {
  const { user } = useCurrentUser();

  const authorizedPubkeys = useMemo(() => {
    const pubkeys: string[] = [];

    for (const npub of AUTHORIZED_NPUBS) {
      try {
        const decoded = nip19.decode(npub);
        if (decoded.type === "npub") {
          pubkeys.push(decoded.data);
        }
      } catch {
        // Ignore invalid npubs
      }
    }

    return pubkeys;
  }, []);

  const userPubkey = user?.pubkey;
  const isLoggedIn = Boolean(userPubkey);
  const isAuthorized = Boolean(
    userPubkey && authorizedPubkeys.includes(userPubkey),
  );

  return { isAuthorized, isLoggedIn };
}
