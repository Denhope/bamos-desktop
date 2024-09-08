// components/SubscriptionManager.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { List, Checkbox, message } from 'antd';
import { getSubscriptionTypes, SubscriptionType } from '@/services/utilites';
import { $authHost, $host, API_URL } from '@/utils/api/http';
import { io, Socket } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '../woAdministration/GlobalStateContext';

interface Subscription {
  _id: string;
  userId: string;
  eventType: SubscriptionType;
}

const SubscriptionManager: React.FC<{ userId: string }> = ({ userId }) => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const { notificationsEnabled, setNotificationsEnabled } = useGlobalState();

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const res = await $authHost.get<Subscription[]>(
          `/settings/subscrptions/${userId}`
        );
        setSubscriptions(res.data || []); // Убедитесь, что res.data всегда массив
      } catch (error) {
        console.error('Ошибка при загрузке подписок:', error);
      }
    }

    fetchSubscriptions();
  }, [userId]);

  const isSubscribed = (eventType: SubscriptionType) => {
    return subscriptions.some((sub) => sub.eventType === eventType);
  };

  const toggleSubscription = async (eventType: SubscriptionType) => {
    const socket = io(API_URL, {
      extraHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (isSubscribed(eventType)) {
      await $authHost
        .delete('/settings/subscrptions/unsubscribe', {
          data: { userId, eventType },
        })
        .then(() => {
          socket.emit('unsubscribe', userId, eventType);
          setSubscriptions(
            subscriptions.filter((sub) => sub.eventType !== eventType)
          );
          message.success(`Отписано от события: ${eventType}`);
        });
    } else {
      await $authHost
        .post<Subscription>('/settings/subscrptions/subscribe', {
          userId,
          eventType,
        })
        .then((res) => {
          socket.emit('subscribe', userId, eventType);
          setSubscriptions([...subscriptions, res.data]);
          message.success(`Подписано на событие: ${eventType}`);
        });
    }
  };

  const { t } = useTranslation();
  const subscriptionTypes = getSubscriptionTypes(t);

  // Получение состояния из localStorage при загрузке компонента
  useEffect(() => {
    const storedNotificationsEnabled = localStorage.getItem(
      'notificationsEnabled'
    );
    if (
      storedNotificationsEnabled !== null &&
      storedNotificationsEnabled == 'true'
    ) {
      setNotificationsEnabled(storedNotificationsEnabled === 'true');
    } else if (
      storedNotificationsEnabled !== null &&
      storedNotificationsEnabled == 'false'
    ) {
      setNotificationsEnabled(false);
    }
  }, [setNotificationsEnabled]);

  // Сохранение состояния в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(
      'notificationsEnabled',
      notificationsEnabled.toString()
    );
  }, [notificationsEnabled]);

  return (
    <div>
      <Checkbox
        checked={notificationsEnabled}
        onChange={(e) => setNotificationsEnabled(e.target.checked)}
      >
        {t('Enable Notifications')}
      </Checkbox>
      <List
        dataSource={subscriptionTypes}
        renderItem={({ value, label }) => (
          <List.Item key={value}>
            <Checkbox
              checked={isSubscribed(value)}
              onChange={() => toggleSubscription(value)}
              disabled={!notificationsEnabled}
            >
              {label}
            </Checkbox>
          </List.Item>
        )}
      />
    </div>
  );
};

export default SubscriptionManager;
