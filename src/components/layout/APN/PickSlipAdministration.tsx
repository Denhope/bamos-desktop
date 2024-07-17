import { getItem } from '@/services/utilites';
import { Layout, Menu, MenuProps } from 'antd';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApartmentOutlined } from '@ant-design/icons';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';

import PickSlipAdministrationPanel from '@/components/userAdministration/pickSlipAdministration/PickSlipAdministrationPanel';

import PickSlipAdministrationFilterForm from '@/components/userAdministration/pickSlipAdministration/PickSlipAdministrationFilterForm';
interface RequirementManagementProps {}

const PickSlipAdministration: FC<RequirementManagementProps> = () => {
  const [collapsed, setCollapsed] = useState(false);

  const [pickSlipSearchValues, setpickSlipSearchValues] = useState<any>();
  type MenuItem = Required<MenuProps>['items'][number];
  const { t } = useTranslation();
  const items: MenuItem[] = [
    getItem(<>{t('PICKSLIP ADMINISTRATION')}</>, 'sub1', <ApartmentOutlined />),
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
            <PickSlipAdministrationFilterForm
              onpickSlipSearchValues={
                (values) => setpickSlipSearchValues(values)
                // console.log(values)
              }
            />
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <></>
        <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-5">
          <PickSlipAdministrationPanel
            pickSlipSearchValues={pickSlipSearchValues}
          ></PickSlipAdministrationPanel>
        </div>
      </Content>
    </Layout>
  );
};

export default PickSlipAdministration;
