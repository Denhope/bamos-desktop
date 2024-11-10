import React, { useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { checkApiConnection } from '@/utils/api/http';
import { apiChangeSubject } from '@/utils/api/config';

const ConnectionIndicator: React.FC = () => {
  const { isConnected, socket } = useTypedSelector((state) => state.socket);
  const [connectionStatus, setConnectionStatus] = useState<
    'checking' | 'connected' | 'disconnected'
  >('checking');

  const checkConnection = async () => {
    setConnectionStatus('checking');
    const apiConnected = await checkApiConnection(60000);
    if (apiConnected && socket && socket.connected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    checkConnection();
    const intervalId = setInterval(checkConnection, 60000);

    const subscription = apiChangeSubject.subscribe(() => {
      checkConnection();
    });

    if (socket) {
      socket.on('connect', checkConnection);
      socket.on('disconnect', checkConnection);
      socket.on('error', checkConnection);
    }
    return () => {
      clearInterval(intervalId);
      subscription.unsubscribe();
      if (socket) {
        socket.off('connect', checkConnection);
        socket.off('disconnect', checkConnection);
        socket.off('error', checkConnection);
      }
    };
  }, [socket, isConnected]);

  const getTooltipTitle = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Checking connection';
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
    }
  };

  const getIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <LoadingOutlined style={{ color: 'blue', fontSize: '20px' }} />;
      case 'connected':
        return (
          <CheckCircleOutlined style={{ color: 'green', fontSize: '20px' }} />
        );
      case 'disconnected':
        return (
          <CloseCircleOutlined style={{ color: 'red', fontSize: '20px' }} />
        );
    }
  };

  return <Tooltip title={getTooltipTitle()}>{getIcon()}</Tooltip>;
};

export default ConnectionIndicator;
