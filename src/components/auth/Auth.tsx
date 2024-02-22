import { Layout, Row } from 'antd';
import AuthForm from '@/components/auth/AuthForm';
import { FC } from 'react';

const Auth: FC = () => {
  return (
    <Layout>
      <div
        style={{ height: '90vh' }}
        className="flex items-center justify-center my-auto"
      >
        <AuthForm />
      </div>
    </Layout>
  );
};

export default Auth;
