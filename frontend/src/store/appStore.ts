import { create } from "zustand";

type AppState = {
    isSidebarOpen: boolean;
};

interface AppActions {
    toggleSidebar: () => void;
}

interface AppStore extends AppState, AppActions {}

export const useAppStore = create<AppStore>((set) => ({
    isSidebarOpen: false,
    toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
