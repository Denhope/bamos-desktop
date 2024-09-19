// services/WebSocketService.ts
import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/utils/api/http';

class WebSocketService {
  private socket: Socket | null = null;

  connect(userId: string, token: string) {
    this.socket = io(API_URL, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.socket.on('connect', () => {
      console.log('Подключение к серверу WebSocket установлено');
      this.socket?.emit('userConnected', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Потеряно соединение с сервером WebSocket');
    });

    this.socket.on('reconnect', () => {
      console.log('Соединение с сервером WebSocket восстановлено');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(eventType: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(eventType, callback);
    }
  }

  unsubscribe(eventType: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off(eventType, callback);
    }
  }

  emit(eventType: string, data: any) {
    if (this.socket) {
      this.socket.emit(eventType, data);
      console.log('test1')
      
    }
  }

  // Метод для подписки на уведомления
  subscribeToNotifications(
    callback: (data: { message: string; timestamp: string }) => void
  ) {
    if (this.socket) {
      this.socket.on('notification', callback);
      console.log(this.socket)
    }
  }

  // Метод для отписки от уведомлений
  unsubscribeFromNotifications() {
    if (this.socket) {
      this.socket.off('notification');
    }
  }

  // Метод для проверки текущего состояния соединения
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default new WebSocketService();
