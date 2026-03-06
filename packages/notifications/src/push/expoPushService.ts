import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import type { PushProvider, SendResult } from '../providers/types';

const expo = new Expo();

export const expoPushService: PushProvider = {
  async send(tokens, title, body, data) {
    const validTokens = tokens.filter(t => Expo.isExpoPushToken(t));

    if (validTokens.length === 0) {
      return [];
    }

    const messages: ExpoPushMessage[] = validTokens.map(token => ({
      to: token,
      sound: 'default' as const,
      title,
      body,
      data: data ?? {},
    }));

    const chunks = expo.chunkPushNotifications(messages);
    const results: SendResult[] = [];

    for (const chunk of chunks) {
      try {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        tickets.forEach(ticket => {
          if (ticket.status === 'ok') {
            results.push({ messageId: ticket.id });
          } else {
            results.push({ error: ticket.message });
          }
        });
      } catch (err: any) {
        results.push({ error: err.message });
      }
    }

    return results;
  },
};
