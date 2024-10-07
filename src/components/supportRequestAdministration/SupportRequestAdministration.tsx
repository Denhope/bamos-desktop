import React, { FC, useState } from 'react';
import { Layout, Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { getItem } from '@/services/utilites';
import SupportRequestFilterForm from './SupportRequestFilterForm';
import SupportRequestPanel from './SupportRequestPanel';


const { Sider, Content } = Layout;

const SupportRequestAdministration: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [supportRequestSearch, setSupportRequestSearch] = useState<any>();
  const { t } = useTranslation();

  const items = [
    getItem(
      <>{t('SUPPORT REQUEST ADMINISTRATION')}</>,
      'sub1',
      <QuestionCircleOutlined />
    ),
  ];

  return (
    <Layout>
      <Sider
        className="h-[87vh] overflow-hidden"
        theme="light"
        width={350}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <Menu theme="light" mode="inline" items={items} />
        <div className="mx-auto px-5 ">
          <div style={{ display: !collapsed ? 'block' : 'none' }}>
            <SupportRequestFilterForm
              onSupportRequestSearch={(values) => setSupportRequestSearch(values)}
            />
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-5">
          <SupportRequestPanel supportRequestSearchValues={supportRequestSearch} />
        </div>
      </Content>
    </Layout>
  );
};

export default SupportRequestAdministration;