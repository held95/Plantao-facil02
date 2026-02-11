import { Notification } from '@/types/notification';
import { mockNotifications } from '@/lib/data/mockNotifications';

export async function getNotifications(): Promise<Notification[]> {
  // Mock com delay para simular API real
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockNotifications]), 300);
  });
}

export async function markNotificationAsRead(id: string): Promise<void> {
  // Mock com delay para simular API real
  return new Promise((resolve) => {
    setTimeout(() => {
      // Em produção: fazer PUT/PATCH para API
      resolve();
    }, 200);
  });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  // Mock com delay para simular API real
  return new Promise((resolve) => {
    setTimeout(() => {
      // Em produção: fazer PUT/PATCH para API
      resolve();
    }, 300);
  });
}
