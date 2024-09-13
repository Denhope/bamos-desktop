import React, { useEffect, useState } from 'react';
import { Tooltip, notification } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import WebSocketService from '@/services/WebSocketService';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { USER_ID } from '@/utils/api/http';

const ConnectionIndicator: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const token = localStorage.getItem('token');
  const { isAuth } = useTypedSelector((state) => state.auth);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      notification.success({
        message: 'Connection Established',
        description: 'Connection to server has been successfully established.',
        duration: 3,
      });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      notification.error({
        message: 'Connection Lost',
        description: 'Connection to server has been lost.',
        duration: 3,
      });
    };

    if (isAuth && USER_ID) {
      // Connect to WebSocket when authenticated
      token && WebSocketService.connect(USER_ID, token);

      // Subscribe to events only if the user is authenticated
      WebSocketService.subscribe('connect', handleConnect);
      WebSocketService.subscribe('disconnect', handleDisconnect);

      // Check the current WebSocket connection state when authenticated
      setIsConnected(WebSocketService.isConnected());
    } else {
      // Disconnect from WebSocket when logged out
      WebSocketService.disconnect();

      // Reset the connection state if the user is logged out
      setIsConnected(false);
    }

    return () => {
      // Unsubscribe from events when the component is unmounted or when logged out
      WebSocketService.unsubscribe('connect', handleConnect);
      WebSocketService.unsubscribe('disconnect', handleDisconnect);
    };
  }, [isAuth, USER_ID, token]);

  return (
    <Tooltip title={isConnected ? 'Connected' : 'Disconnected'}>
      {isConnected ? (
        <CheckCircleOutlined style={{ color: 'green', fontSize: '20px' }} />
      ) : (
        <CloseCircleOutlined style={{ color: 'red', fontSize: '20px' }} />
      )}
    </Tooltip>
  );
};

export default ConnectionIndicator;
