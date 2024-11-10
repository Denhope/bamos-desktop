import { getItem } from '@/services/utilites';
import { Layout, Menu, MenuProps, Typography } from 'antd';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApartmentOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import AdminACTypesPanel from '@/components/userAdministration/acTypesAdministration/AdminACTypesPanel';
import ASTypesFilteredForm from '@/components/userAdministration/acTypesAdministration/ASTypesFilteredForm';

const { Title, Text } = Typography;

const AircraftTypes: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [acTypesSearch, setACTypesSearch] = useState<any>();

  const { t } = useTranslation();
  type MenuItem = Required<MenuProps>['items'][number];
  const items: MenuItem[] = [
    getItem(<>{t('AIRCRAFT TYPES')}</>, 'sub1', <ApartmentOutlined />),
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
              <ASTypesFilteredForm
                onSubmit={(values: any) => {
                  setACTypesSearch(values);
                }}
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
              {t('AIRCRAFT TYPES')}
            </Title>
          </div>
          <Text type="secondary">
            {t('MANAGE AIRCRAFT TYPES AND THEIR SPECIFICATIONS')}
          </Text>
        </div>
        <div className="h-[72vh] overflow-hidden flex flex-col justify-between">
          <AdminACTypesPanel values={acTypesSearch} />
        </div>
      </Content>
    </Layout>
  );
};

export default AircraftTypes;
