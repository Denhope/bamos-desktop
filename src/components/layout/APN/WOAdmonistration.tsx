import { getItem } from '@/services/utilites';
import { Layout, Menu, MenuProps } from 'antd';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApartmentOutlined } from '@ant-design/icons';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import WoFilteredForm from '@/components/woAdministration/WoFilteredForm';
import WoPanel from '@/components/woAdministration/WoPanel';
import { GlobalStateProvider } from '@/components/woAdministration/GlobalStateContext';

const WOAdministration: FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const [requirementsSearch, setRequirementsSearch] = useState<any>();
  type MenuItem = Required<MenuProps>['items'][number];
  const { t } = useTranslation();
  const items: MenuItem[] = [
    getItem(<>{t('WO ADMINISTRATION')}</>, 'sub1', <ApartmentOutlined />),
  ];
  return (
    <Layout>
      <Sider
        className="h-[87vh] overflow-hidden"
        theme="light"
        width={400}
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
            <div className="h-[75vh] overflow-y-auto flex flex-col justify-between gap-5">
              <WoFilteredForm
                onProjectSearch={(values: any) => setRequirementsSearch(values)}
                formKey={'woFiltered'}
              />
            </div>
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-5">
          <GlobalStateProvider>
            <WoPanel projectSearchValues={requirementsSearch}></WoPanel>
          </GlobalStateProvider>
        </div>
      </Content>
    </Layout>
  );
};

export default WOAdministration;
