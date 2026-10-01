import { create } from "zustand";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { OverlayId, TabId } from "../types/stride";

const sessionStorageKey = "stride.session.v1";

// expo-secure-store is native-only; fall back to localStorage on web.
const secureStorage = {
  getItem: (key: string): Promise<string | null> =>
    Platform.OS === "web"
      ? Promise.resolve(globalThis.localStorage?.getItem(key) ?? null)
      : SecureStore.getItemAsync(key),
  setItem: (key: string, value: string): Promise<void> =>
    Platform.OS === "web"
      ? Promise.resolve(globalThis.localStorage?.setItem(key, value))
      : SecureStore.setItemAsync(key, value),
  removeItem: (key: string): Promise<void> =>
    Platform.OS === "web"
      ? Promise.resolve(globalThis.localStorage?.removeItem(key))
      : SecureStore.deleteItemAsync(key),
};

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  userId: string;
};

type AppState = {
  activeTab: TabId;
  overlay: OverlayId;
  session: StoredSession | null;
  sessionHydrated: boolean;
  setActiveTab: (tab: TabId) => void;
  openOverlay: (overlay: Exclude<OverlayId, null>) => void;
  closeOverlay: () => void;
  restoreSession: () => Promise<void>;
  setSession: (session: StoredSession) => Promise<void>;
  clearSession: () => Promise<void>;
};

export const useAppStore = create<AppState>((set) => ({
  activeTab: "dashboard",
  overlay: null,
  session: null,
  sessionHydrated: false,
  setActiveTab: (tab) => set({ activeTab: tab, overlay: null }),
  openOverlay: (overlay) => set({ overlay }),
  closeOverlay: () => set({ overlay: null }),
  restoreSession: async () => {
    const raw = await secureStorage.getItem(sessionStorageKey);
    if (raw) {
      try {
        const session = JSON.parse(raw) as StoredSession;
        if (session.accessToken && session.refreshToken && session.userId) set({ session });
      } catch {
        await secureStorage.removeItem(sessionStorageKey);
      }
    }
    set({ sessionHydrated: true });
  },
  setSession: async (session) => {
    await secureStorage.setItem(sessionStorageKey, JSON.stringify(session));
    set({ session });
  },
  clearSession: async () => {
    await secureStorage.removeItem(sessionStorageKey);
    set({ session: null, activeTab: "dashboard", overlay: null });
  },
}));
