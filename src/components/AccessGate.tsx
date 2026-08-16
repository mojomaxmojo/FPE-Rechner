import type { ReactNode } from 'react';

import { LoginArea } from '@/components/auth/LoginArea.tsx';
import { useAuthorized } from '@/hooks/useAuthorized.ts';

interface AccessGateProps {
  children: ReactNode;
}

export function AccessGate({ children }: AccessGateProps) {
  const { isAuthorized, isLoggedIn } = useAuthorized();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold">Anmeldung erforderlich</h1>
        <p className="text-muted-foreground">
          Bitte melde dich mit deinem Nostr-Account an, um die App zu nutzen.
        </p>
        <LoginArea />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold text-destructive">Kein Zugriff</h1>
        <p className="text-muted-foreground">
          Dieser Account ist nicht für den Zugriff auf diese App freigeschaltet.
        </p>
      </div>
    );
  }

  return children;
}
