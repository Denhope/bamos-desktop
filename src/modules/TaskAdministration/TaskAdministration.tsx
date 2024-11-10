import { getItem } from '@/services/utilites';
import { Layout, Menu, MenuProps, Typography } from 'antd';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApartmentOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import AdminTaskFilterdForm from '@/components/userAdministration/taskAdministration/AdminTaskFilterdForm';
import AdminTaskPanel from '@/components/userAdministration/taskAdministration/AdminTaskPanel';

const { Title, Text } = Typography;

const TaskAdministration: FC<{ isFilterCollapsed: boolean }> = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [tasksSearch, setTasksSearch] = useState<any>();

  type MenuItem = Required<MenuProps>['items'][number];
  const { t } = useTranslation();

  const items: MenuItem[] = [
    getItem(<>{t('TASK ADMINISTRATION')}</>, 'sub1', <ApartmentOutlined />),
  ];

  return (
    <Layout>
      <Sider
        className="h-[87vh] overflow-hidden"
        theme="light"
        width={400}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <Menu theme="light" mode="inline" items={items} />
        <div className="px-5">
          <div
            style={{
              display: !collapsed ? 'block' : 'none',
            }}
          >
            <div className="h-[75vh] overflow-y-auto flex flex-col gap-5">
              <AdminTaskFilterdForm
                onSubmit={(values: any) => {
                  setTasksSearch(values);
                  console.log('Filter values:', values);
                }}
                formKey={'adminTaskForm'}
              />
            </div>
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="bg-white p-4 mb-4 rounded-md shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <InfoCircleOutlined className="text-blue-500" />
            <Title level={5} style={{ margin: 0 }}>
              {t('TASK ADMINISTRATION')}
            </Title>
          </div>
          <Text type="secondary">
            {t(
              'HERE YOU CAN MANAGE AIRCRAFT TASKS, INCLUDING ROUTINE AND NON-ROUTINE MAINTENANCE TASKS, SERVICE BULLETINS, AND ENGINEERING ORDERS.'
            )}
          </Text>
        </div>
        <div className="h-[72vh] overflow-hidden flex flex-col justify-between">
          <AdminTaskPanel values={tasksSearch} />
        </div>
      </Content>
    </Layout>
  );
};

export default TaskAdministration;
