// ts-nocheck

import { getItem } from '@/services/utilites';
import { Layout, Menu, MenuProps } from 'antd';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApartmentOutlined } from '@ant-design/icons';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';

import ProjectFilterForm from '@/components/projectAdministaration/ProjectFilterForm';
import ProjectPanelAdmin from '@/components/projectAdministaration/ProjectPanel';

interface RequirementManagementProps {}

const ProjectAdministration: FC<RequirementManagementProps> = () => {
  const [collapsed, setCollapsed] = useState(false);

  const [requirementsSearch, setRequirementsSearch] = useState<any>();
  type MenuItem = Required<MenuProps>['items'][number];
  const { t } = useTranslation();
  const items: MenuItem[] = [
    getItem(<>{t('PROJECT ADMINISTRATION')}</>, 'sub1', <ApartmentOutlined />),
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
            <ProjectFilterForm
              onProjectSearch={(values: any) => setRequirementsSearch(values)}
            />
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <></>
        <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-5">
          <ProjectPanelAdmin
            projectSearchValues={requirementsSearch}
          ></ProjectPanelAdmin>
        </div>
      </Content>
    </Layout>
  );
};

export default ProjectAdministration;
