export interface PushToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: string;
  lastSeen: string;
}
