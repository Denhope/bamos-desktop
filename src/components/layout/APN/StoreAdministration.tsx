import { getItem } from '@/services/utilites';
import { Layout, Menu, MenuProps } from 'antd';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApartmentOutlined } from '@ant-design/icons';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';

import StorePanel from '@/components/storeAdministration/StorePanel';
import StoreFilteredForm from '@/components/storeAdministration/StoreFilteredForm';

const StoreAdministration: FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const [requirementsSearch, setRequirementsSearch] = useState<any>();
  type MenuItem = Required<MenuProps>['items'][number];
  const { t } = useTranslation();
  const items: MenuItem[] = [
    getItem(
      <>{t('STORES ADMINISTRATION')} (BAN:06)</>,
      'sub1',
      <ApartmentOutlined />
    ),
  ];
  return (
    <Layout>
      <Sider
        className="h-[87vh] overflow-hidden"
        theme="light"
        width={350}
        collapsible
        // color="rgba(255, 255, 255, 0.2)"
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        <Menu theme="light" mode="inline" items={items} />
        <div className="mx-auto px-5 ">
          <div
            style={{
              display: !collapsed ? 'block' : 'none',
            }}
          >
            <StoreFilteredForm
              onProjectSearch={(values: any) => setRequirementsSearch(values)}
            />
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-5">
          <StorePanel storeSearchValues={requirementsSearch}></StorePanel>
        </div>
      </Content>
    </Layout>
  );
};

export default StoreAdministration;