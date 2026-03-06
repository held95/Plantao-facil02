import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { apiClient } from '../lib/api/client';

interface PushTokenRegistrarProps {
  userId: string;
}

export function PushTokenRegistrar({ userId }: PushTokenRegistrarProps) {
  useEffect(() => {
    registerToken();
  }, [userId]);

  async function registerToken() {
    if (!Device.isDevice) {
      console.log('[PushTokenRegistrar] Not a physical device, skipping push token registration.');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[PushTokenRegistrar] Push notification permission denied.');
      return;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const platform = Platform.OS as 'ios' | 'android';

      await apiClient.post('/push-tokens', { token: tokenData.data, platform });
      console.log('[PushTokenRegistrar] Push token registered:', tokenData.data);
    } catch (error) {
      console.error('[PushTokenRegistrar] Failed to register push token:', error);
    }
  }

  return null;
}
