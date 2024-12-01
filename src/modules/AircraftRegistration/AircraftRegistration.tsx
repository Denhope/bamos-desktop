//@ts-nocheck
import { getItem } from '@/services/utilites';
import { Layout, Menu, MenuProps, Typography } from 'antd';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApartmentOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import ACAdministrationPanel from '@/components/userAdministration/ACAdministration/ACAdministrationPanel';
import ACRegistrationFilterForm, {
  ACRegistrationFilterValues,
} from '@/components/userAdministration/ACAdministration/ACRegistrationFilterForm';

const { Title, Text } = Typography;

const AircraftRegistration: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [acRegSearch, setACRegSearch] = useState<ACRegistrationFilterValues>({
    status: ['ACTIVE'],
  });

  const { t } = useTranslation();

  type MenuItem = Required<MenuProps>['items'][number];
  const items: MenuItem[] = [
    getItem(<>{t('AIRCRAFT ADMINISTRATION')}</>, 'sub1', <ApartmentOutlined />),
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
              <ACRegistrationFilterForm
                onSubmit={(values: ACRegistrationFilterValues) => {
                  setACRegSearch(values);
                  console.log('Filter values:', values);
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
              {t('AIRCRAFT ADMINISTRATION')}
            </Title>
          </div>
          <Text type="secondary">
            {t(
              'MANAGE AIRCRAFT REGISTRATIONS, TYPES, CUSTOMERS AND RELATED INFORMATION'
            )}
          </Text>
        </div>
        <div className="h-[72vh] overflow-hidden flex flex-col justify-between">
          <ACAdministrationPanel
            values={{
              registrationNumber: acRegSearch.registrationNumber,
              acTypeId: acRegSearch.acTypeId,
              customerId: acRegSearch.customerId,
              serialNumber: acRegSearch.serialNumber,
              status: acRegSearch.status || ['ACTIVE'],
              _time: acRegSearch?._time,
            }}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default AircraftRegistration;
