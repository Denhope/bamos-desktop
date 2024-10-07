import React, { useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useTypedSelector } from '@/hooks/useTypedSelector';

const ConnectionIndicator: React.FC = () => {
  const { isConnected, socket } = useTypedSelector((state) => state.socket);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkConnection = () => {
      if (socket && socket.connected) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    };

    // Начальная проверка
    checkConnection();

    // Регулярная проверка каждые 5 секунд
    intervalId = setInterval(checkConnection, 5000);

    // Обработчики событий сокета
    if (socket) {
      socket.on('connect', () => setConnectionStatus('connected'));
      socket.on('disconnect', () => setConnectionStatus('disconnected'));
      socket.on('error', () => setConnectionStatus('disconnected'));
    }

    return () => {
      clearInterval(intervalId);
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('error');
      }
    };
  }, [socket]);

  const getTooltipTitle = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Проверка соединения';
      case 'connected':
        return 'Подключено';
      case 'disconnected':
        return 'Отключено';
    }
  };

  const getIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <LoadingOutlined style={{ color: 'blue', fontSize: '20px' }} />;
      case 'connected':
        return <CheckCircleOutlined style={{ color: 'green', fontSize: '20px' }} />;
      case 'disconnected':
        return <CloseCircleOutlined style={{ color: 'red', fontSize: '20px' }} />;
    }
  };

  return (
    <Tooltip title={getTooltipTitle()}>
      {getIcon()}
    </Tooltip>
  );
};

export default ConnectionIndicator;