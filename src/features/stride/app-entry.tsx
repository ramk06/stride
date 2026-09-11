"use client";

import { useState, useTransition } from "react";
import { fetchSession, signOutSession } from "./hooks";
import { AccessScreen } from "./screens/AccessScreen";
import { StrideApp } from "./stride-shell";
import type { SessionUser } from "./types";

export function StrideEntry({ initialUser }: { initialUser: SessionUser | null }) {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(initialUser);
  const [pending, startTransition] = useTransition();

  async function refreshSession() {
    const user = await fetchSession();
    setSessionUser(user);
  }

  async function handleSignOut() {
    await signOutSession();
    startTransition(() => {
      setSessionUser(null);
    });
  }

  if (!sessionUser) {
    return <AccessScreen pending={pending} onAuthenticated={refreshSession} />;
  }

  return <StrideApp sessionUser={sessionUser} onSignOut={handleSignOut} />;
}