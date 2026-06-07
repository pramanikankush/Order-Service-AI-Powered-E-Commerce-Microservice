import { create } from "zustand";

interface UiState {
  backendReady: boolean | null;   // null = unknown
  ownerKey: string;
  setBackendReady: (v: boolean) => void;
  setOwnerKey: (v: string) => void;
}

export const useUi = create<UiState>((set) => ({
  backendReady: null,
  ownerKey: "demo-user",
  setBackendReady: (v) => set({ backendReady: v }),
  setOwnerKey: (v) => set({ ownerKey: v }),
}));
