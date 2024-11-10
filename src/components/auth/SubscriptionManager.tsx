import React, { useState, useEffect } from 'react';
import { List, Checkbox, message } from 'antd';
import { getSubscriptionTypes, SubscriptionType } from '@/services/utilites';
import { $authHost } from '@/utils/api/http';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '../woAdministration/GlobalStateContext';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import {
  subscribeToEventType,
  unsubscribeFromEventType,
} from '@/store/reducers/WebSocketSlice';

interface Subscription {
  _id: string;
  userId: string;
  eventType: SubscriptionType;
}

const SubscriptionManager: React.FC<{ userId: string }> = ({ userId }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const { notificationsEnabled, setNotificationsEnabled } = useGlobalState();
  const dispatch = useAppDispatch();
  const { socket } = useTypedSelector((state) => state.socket);

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const res = await $authHost.get<Subscription[]>(
          `/settings/subscrptions/${userId}`
        );
        setSubscriptions(res.data || []);
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
    try {
      if (isSubscribed(eventType)) {
        await $authHost
          .delete('/settings/subscrptions/unsubscribe', {
            data: { userId, eventType },
          })
          .then(() => {
            dispatch(unsubscribeFromEventType({ userId, eventType }));
            setSubscriptions((prev) =>
              prev.filter((sub) => sub.eventType !== eventType)
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
            dispatch(subscribeToEventType({ userId, eventType }));
            setSubscriptions((prev) => [...prev, res.data]);
            message.success(`Подписано на событие: ${eventType}`);
          });
      }
    } catch (error) {
      console.error('Ошибка при изменении подписки:', error);
    }
  };

  const { t } = useTranslation();
  const subscriptionTypes = getSubscriptionTypes(t);

  useEffect(() => {
    const storedNotificationsEnabled = localStorage.getItem(
      'notificationsEnabled'
    );
    setNotificationsEnabled(storedNotificationsEnabled === 'true');
  }, [setNotificationsEnabled]);

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
