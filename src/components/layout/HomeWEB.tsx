import { Result, Skeleton } from 'antd';

import { useTypedSelector } from '@/hooks/useTypedSelector';
import React, { FC } from 'react';
import { SmileOutlined } from '@ant-design/icons';
import logoImage from '../../assets/img/logo.jpg';
const Home: FC = () => {
  const { isLoading } = useTypedSelector((state) => state.auth);
  return (
    <div>
      {' '}
      {isLoading ? (
        <>
          <Skeleton active={true} paragraph={{ rows: 5 }} />
        </>
      ) : (
        <>
          <Result
            style={{ height: '70vh' }}
            className="flex  flex-col uppercase items-center justify-center"
            icon={<SmileOutlined />}
            title={`Welcome to НАЗВАНИЕ,  ${localStorage
              .getItem('firstName')
              ?.toUpperCase()}`}
          />
        </>
      )}
    </div>
  );
};

export default Home;
