import { create } from "zustand";

type SprintlyState = {
  collapsed: boolean;
  mobileOpen: boolean;
  sessionRunning: boolean;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
  toggleSession: () => void;
};

export const useSprintlyStore = create<SprintlyState>((set) => ({
  collapsed: false,
  mobileOpen: false,
  sessionRunning: false,
  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
  toggleSession: () => set((s) => ({ sessionRunning: !s.sessionRunning })),
}));
