// ts-nocheck

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { List, notification, Button, Select } from 'antd';
import axios from 'axios';
import { $authHost, API_URL } from '@/utils/api/http';
import { useGlobalState } from '../woAdministration/GlobalStateContext';

interface Notification {
  notificationId?: any;
  _id: string;
  userId: string;
  message: string;
  timestamp: string; // Убедитесь, что timestamp - это строка
  isRead: boolean;
}

interface Subscription {
  eventType: string;
  subscribed: boolean;
}

interface NotificationListenerProps {
  userId: string;
}

const NotificationListener: React.FC<NotificationListenerProps> = ({
  userId,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { notificationsEnabled } = useGlobalState();
  const [displayMode, setDisplayMode] = useState<'all' | 'unread'>('unread');

  useEffect(() => {
    // Загрузка истории уведомлений с сервера
    $authHost
      .get<Notification[]>(`/settings/notifications/${userId}`)
      .then((res) => {
        const formattedNotifications = res.data.map((notification) => ({
          ...notification.notificationId,
          _id: notification._id,
          isRead: notification.isRead,
          timestamp: new Date(
            notification.notificationId.timestamp
          ).toISOString(), // Преобразуем дату в ISO строку
        }));
        setNotifications(formattedNotifications); // Убедитесь, что res.data всегда массив
      });

    // Загрузка подписок пользователя
    $authHost
      .get<Subscription[]>(`/settings/subscrptions/${userId}`)
      .then((res) => {
        const formattedSubscriptions = res.data.map((sub) => ({
          eventType: sub.eventType,
          subscribed: true,
        }));
        setSubscriptions(formattedSubscriptions);
      });

    const token = localStorage.getItem('token');
    const socket: Socket = io(API_URL, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    socket.on('connect', () => {
      console.log('Подключение к серверу WebSocket установлено');
      setIsConnected(true);
      socket.emit('userConnected', userId);
    });

    socket.on('disconnect', () => {
      console.log('Потеряно соединение с сервером WebSocket');
      setIsConnected(false);
    });

    socket.on('reconnect', () => {
      console.log('Соединение с сервером WebSocket восстановлено');
      setIsConnected(true);
    });

    socket.on(
      'notification',
      (data: { message: string; timestamp: string }) => {
        const newNotification: Notification = {
          _id: '', // ID будет установлен на сервере
          userId,
          message: data.message,
          timestamp: new Date(data.timestamp).toISOString(), // Преобразуем дату в ISO строку
          isRead: false,
        };
        setNotifications((prev) => [newNotification, ...prev]);

        // Отображение уведомления на экране, если уведомления включены
        if (notificationsEnabled) {
          notification.info({
            message: 'INFORMATION!!!',
            description: data.message,
            placement: 'bottomRight', // Позиция уведомления
            duration: 0,
          });
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [userId, notificationsEnabled]);

  const markAsRead = (notificationId: string) => {
    $authHost.put(`/settings/notifications/${notificationId}/read`).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    });
  };

  // Получение состояния отображения из localStorage при загрузке компонента
  useEffect(() => {
    const storedDisplayMode = localStorage.getItem('displayMode');
    if (storedDisplayMode === 'all' || storedDisplayMode === 'unread') {
      setDisplayMode(storedDisplayMode);
    }
  }, []);

  // Сохранение состояния отображения в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('displayMode', displayMode);
  }, [displayMode]);

  const filteredNotifications = notifications.filter((notification) => {
    if (displayMode === 'all') return true;
    return !notification.isRead;
  });

  const markAllAsRead = () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    unreadNotifications.forEach((notification) => {
      markAsRead(notification._id);
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <div
        style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}
      >
        <Select
          size="small"
          value={displayMode}
          onChange={(value) => setDisplayMode(value)}
          style={{ width: 120, marginRight: '10px' }}
        >
          <Select.Option value="all">All</Select.Option>
          <Select.Option value="unread">Unread</Select.Option>
        </Select>
        <Button size="small" type="primary" onClick={markAllAsRead}>
          Mark All as Read
        </Button>
      </div>
      <List
        dataSource={filteredNotifications}
        renderItem={(notification) => (
          <List.Item
            key={notification._id}
            style={{
              backgroundColor: notification.isRead ? '#f0f0f0' : '#ffffff',
              cursor: !notification.isRead ? 'pointer' : 'default',
              marginBottom: '10px',
              borderRadius: '5px',
              padding: '10px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
            onClick={() => {
              markAsRead(notification._id);
              console.log(notification);
            }}
          >
            <List.Item.Meta
              title={notification.message}
              description={new Date(notification.timestamp).toLocaleString()} // Преобразуем дату в локальный формат
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default NotificationListener;
