import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8081/ws'; // backend endpoint from `WebSocketConfig`

export type LoyaltyPayload = {
  userId: number | string;
  from: string;
  to: string;
  visual: boolean;
};

class NotificationClient {
  private client: Client | null = null;
  private subId: string | null = null;

  connect(token: string, userId: number | string, onMessage: (p: LoyaltyPayload) => void) {
    if (this.client && this.client.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL /* add `?access_token=${token}` here if your server requires query tokens */),
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${token}`, // Spring setups often accept this via handshake interceptors
      },
      onConnect: () => {
        const topic = `/topic/loyalty/${userId}`;
        const sub = this.client!.subscribe(topic, (msg: IMessage) => {
          try {
            const body = JSON.parse(msg.body) as LoyaltyPayload;
            onMessage(body);
          } catch (e) {
            console.error('invalid loyalty payload', e);
          }
        });
        this.subId = sub.id ?? null;
      },
      onStompError: (frame) => console.error('STOMP error', frame),
      onWebSocketError: (ev) => console.error('WS error', ev),
    });

    this.client.activate();
  }

  disconnect() {
    if (!this.client) return;
    try {
      this.client.deactivate();
    } finally {
      this.client = null;
      this.subId = null;
    }
  }
}

export const notificationClient = new NotificationClient();
