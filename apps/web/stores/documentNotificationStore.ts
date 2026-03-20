import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DocumentNotificationState {
  unreadCount: number;
  lastCheckedAt: string;
  isDropdownOpen: boolean;
  setUnreadCount: (count: number) => void;
  markAllSeen: () => void;
  toggleDropdown: () => void;
  closeDropdown: () => void;
}

const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

export const useDocumentNotificationStore = create<DocumentNotificationState>()(
  persist(
    (set) => ({
      unreadCount: 0,
      lastCheckedAt: SEVEN_DAYS_AGO,
      isDropdownOpen: false,
      setUnreadCount: (count) => set({ unreadCount: count }),
      markAllSeen: () =>
        set({ unreadCount: 0, lastCheckedAt: new Date().toISOString(), isDropdownOpen: false }),
      toggleDropdown: () => set((state) => ({ isDropdownOpen: !state.isDropdownOpen })),
      closeDropdown: () => set({ isDropdownOpen: false }),
    }),
    {
      name: 'document-notification-store',
      partialize: (state) => ({ lastCheckedAt: state.lastCheckedAt }),
    }
  )
);
