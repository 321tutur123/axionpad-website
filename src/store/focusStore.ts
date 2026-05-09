import { create } from "zustand";

export type ComponentFocus = "keys" | "pots" | "pcb" | "mcu" | null;
export type ViewMode = "solid" | "xray";

interface FocusState {
  focus: ComponentFocus;
  viewMode: ViewMode;
  setFocus: (f: ComponentFocus) => void;
  clearFocus: () => void;
  toggleViewMode: () => void;
}

export const useFocusStore = create<FocusState>((set) => ({
  focus: null,
  viewMode: "solid",
  setFocus: (focus) => set({ focus }),
  clearFocus: () => set({ focus: null }),
  toggleViewMode: () =>
    set((s) => ({ viewMode: s.viewMode === "solid" ? "xray" : "solid" })),
}));
