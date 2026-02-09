import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification } from '@/types/notification';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isDropdownOpen: boolean;

  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  toggleDropdown: () => void;
  closeDropdown: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isDropdownOpen: false,

      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.lida).length,
        }),

      markAsRead: (id) =>
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, lida: true } : n
          );
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.lida).length,
          };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, lida: true })),
          unreadCount: 0,
        })),

      toggleDropdown: () =>
        set((state) => ({
          isDropdownOpen: !state.isDropdownOpen,
        })),

      closeDropdown: () =>
        set({
          isDropdownOpen: false,
        }),
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);
