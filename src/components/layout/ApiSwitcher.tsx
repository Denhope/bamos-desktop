import React, { useState } from 'react';
import { Button, message } from 'antd';
import config, { setApiUrl } from '@/utils/api/config';
import { updateApiUrl } from '@/utils/api/http';

const ApiSwitcher: React.FC = () => {
  const [currentApi, setCurrentApi] = useState(config.apiUrls.indexOf(config.currentApiUrl) + 1);

  const switchApi = async () => {
    const newIndex = currentApi % config.apiUrls.length + 1;
    const newUrl = config.apiUrls[newIndex - 1];
    updateApiUrl(newUrl);
    setApiUrl(newUrl);
    setCurrentApi(newIndex);
    message.loading('Switching API...', 1);
    
    // Задержка перед перезагрузкой, чтобы пользователь увидел сообщение
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <Button 
      type="text" 
      onClick={switchApi}
      style={{ color: 'inherit', padding: '0 8px' }}
    >
      API {currentApi}
    </Button>
  );
};

export default ApiSwitcher;