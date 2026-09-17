import { create } from "zustand";
import type { OverlayId, TabId } from "../types/stride";

type AppState = {
  activeTab: TabId;
  overlay: OverlayId;
  setActiveTab: (tab: TabId) => void;
  openOverlay: (overlay: Exclude<OverlayId, null>) => void;
  closeOverlay: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeTab: "dashboard",
  overlay: null,
  setActiveTab: (tab) => set({ activeTab: tab, overlay: null }),
  openOverlay: (overlay) => set({ overlay }),
  closeOverlay: () => set({ overlay: null }),
}));
