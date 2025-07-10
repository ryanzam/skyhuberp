import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
        }),
        {
            name: 'erp-storage'
        }
    )
);