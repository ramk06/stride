import { QueryClient } from "@tanstack/react-query";
import { useAppStore, type StoredSession } from "../state/app-store";

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001/v1";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function responseMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    return Array.isArray(body.message) ? body.message.join(", ") : body.message ?? response.statusText;
  } catch {
    return response.statusText || "Request failed";
  }
}

async function refreshSession() {
  const session = useAppStore.getState().session;
  if (!session?.refreshToken) return false;
  if (!refreshPromise) {
    refreshPromise = fetch(`${apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) return false;
        const nextSession = (await response.json()) as StoredSession & { expiresIn: number };
        await useAppStore.getState().setSession(nextSession);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const accessToken = useAppStore.getState().session?.accessToken;
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });

  if (response.status === 401 && retry && !path.endsWith("/auth/refresh")) {
    if (await refreshSession()) return apiRequest<T>(path, init, false);
    await useAppStore.getState().clearSession();
  }
  if (!response.ok) throw new ApiError(response.status, await responseMessage(response));
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function signIn(email: string, password: string) {
  const session = await apiRequest<StoredSession & { expiresIn: number }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await useAppStore.getState().setSession(session);
}

// Registration returns 202 with no body; the account must verify email before it can sign in.
export async function register(email: string, password: string) {
  const response = await fetch(`${apiBaseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new ApiError(response.status, await responseMessage(response));
}

export async function requestPasswordReset(email: string) {
  const response = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new ApiError(response.status, await responseMessage(response));
}

export async function signOut() {
  try {
    if (useAppStore.getState().session?.accessToken) await apiRequest<void>("/auth/logout", { method: "POST" }, false);
  } finally {
    await useAppStore.getState().clearSession();
    queryClient.clear();
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
    },
  },
});
