import { getItem } from '@/services/utilites';
import { Layout, Menu, MenuProps } from 'antd';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApartmentOutlined } from '@ant-design/icons';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import RequirementsFilterForm from '../requirementManagement/RequirementsFilterForm';
import RequirementsDiscription from '../requirementManagement/RequirementsDiscription';
import RequirementsDtails from '../requirementManagement/RequirementsDtails';
import RequirementList from '../requirementManagement/RequirementList';
interface RequirementManagementProps {}

const RequirementManagement: FC<RequirementManagementProps> = () => {
  const [requirement, setRequirement] = useState<any | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [requirements, setRequirements] = useState<any[] | []>([]);
  type MenuItem = Required<MenuProps>['items'][number];
  const { t } = useTranslation();
  const items: MenuItem[] = [
    getItem(
      <>{t('REQUIREMENT MANAGMENT')} (BAN:1202)</>,
      'sub1',
      <ApartmentOutlined />
    ),
  ];
  return (
    <Layout>
      <Sider
        className="h-[87vh] overflow-hidden"
        theme="light"
        width={450}
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
            <RequirementsFilterForm
              foForecact={false}
              nonCalculate={true}
              onRequirementsSearch={setRequirements}
            />
            <RequirementList
              scroll={12}
              onSelectedRequirements={setRequirement}
              requirements={requirements}
            ></RequirementList>
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-5">
          <RequirementsDiscription
            onRequirementSearch={setRequirement}
            requirement={requirement}
          ></RequirementsDiscription>
          <RequirementsDtails
            requierement={requirement}
            onEditRequirementsDtailsEdit={setRequirement}
          ></RequirementsDtails>
        </div>
      </Content>
    </Layout>
  );
};

export default RequirementManagement;
