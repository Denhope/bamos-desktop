import React, { useEffect } from 'react';
import { Tooltip, notification } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTypedSelector } from '@/hooks/useTypedSelector';

const ConnectionIndicator: React.FC = () => {
  const { isConnected } = useTypedSelector((state) => state.socket);

  useEffect(() => {
    if (isConnected) {
      notification.success({
        message: 'Connection Established',
        description: 'Connection to server has been successfully established.',
        duration: 3,
      });
    } else {
      notification.error({
        message: 'Connection Lost',
        description: 'Connection to server has been lost.',
        duration: 3,
      });
    }
  }, [isConnected]);

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