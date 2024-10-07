import React, { useState, useEffect, FC } from 'react';
import { Layout, Menu, MenuProps, TabPaneProps, Tabs } from 'antd';

import { RouteNames } from '@/router';

import { ApartmentOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import { ProCard } from '@ant-design/pro-components';

import { getItem } from '@/services/utilites';
import RequirementsFilteredForm from '@/components/requirementViewerNew/RequirementsFilterForm';
import RequirementsList from '@/components/requirementViewerNew/RequirementsList';
import {
  useGetFilteredFullRequirementsQuery,
  useGetFilteredRequirementsQuery,
} from '@/features/requirementAdministration/requirementApi';

const { Sider, Content } = Layout;
interface RequirementViewerProps {
  onDoubleClick?: (record: any, rowIndex?: any) => void;
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
}
const RequirementViewer: FC<RequirementViewerProps> = ({
  onDoubleClick,
  onSingleRowClick,
}) => {
  const { t } = useTranslation();

  const rootSubmenuKeys = [''];

  const [openKeys, setOpenKeys] = useState(['sub1', 'sub2']);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    RouteNames.BASETASKLIST,
  ]);
  useEffect(() => {
    const storedKeys = localStorage.getItem('selectedKeys');
    if (storedKeys) {
      setSelectedKeys(JSON.parse(storedKeys));

      // navigate(storedKey);
    }
  }, []);

  interface TabData extends TabPaneProps {
    key: string;
    title: string;
    content: React.ReactNode;
  }
  const [activeKey, setActiveKey] = useState<string>(''); // Используйте строку вместо массива
  const [panes, setPanes] = useState<TabData[]>([]);
  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const [collapsed, setCollapsed] = useState(false);
  const onEdit = (
    targetKey:
      | string
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>,
    action: 'add' | 'remove'
  ) => {
    if (typeof targetKey === 'string') {
      if (action === 'remove') {
        const newPanes = panes.filter((pane) => pane.key !== targetKey);
        setPanes(newPanes);
        if (newPanes.length > 0) {
          setActiveKey(newPanes[newPanes.length - 1].key);
        }
      }
    } else {
      // Обработка события мыши или клавиатуры
    }
  };
  type MenuItem = Required<MenuProps>['items'][number];

  const items: MenuItem[] = [
    getItem(
      <>{t('REQUIREMENT VIEWER')} (BAN:205)</>,
      'sub1',
      <ApartmentOutlined />
    ),
  ];
  const [requirementsSearchValues, setRequirementsSearch] = useState<any>();

  const { data: requirements, isLoading } = useGetFilteredFullRequirementsQuery(
    {
      projectID: requirementsSearchValues?.projectID
        ? requirementsSearchValues?.projectID
        : '',
      projectTaskID: requirementsSearchValues?.projectTaskID
        ? requirementsSearchValues?.projectTaskID
        : '',
      partNumberID: requirementsSearchValues?.partNumberID
        ? requirementsSearchValues?.partNumberID
        : '',
      reqTypesID: requirementsSearchValues?.reqTypesID
        ? requirementsSearchValues?.reqTypesID
        : '',
      reqCodesID: requirementsSearchValues?.reqCodesID
        ? requirementsSearchValues?.reqCodesID
        : '',

      startDate: requirementsSearchValues?.startDate
        ? requirementsSearchValues?.startDate
        : '',

      endDate: requirementsSearchValues?.endDate
        ? requirementsSearchValues?.endDate
        : '',

      status: requirementsSearchValues?.status || 'open',
      partRequestNumberNew: requirementsSearchValues?.partRequestNumber,

      neededOnID: requirementsSearchValues?.neededOnID
        ? requirementsSearchValues?.neededOnID
        : '',
    }
  );
  return (
    <Layout>
      <Sider
        className="h-[85vh] overflow-hidden"
        theme="light"
        width={350}
        collapsible
        // color="rgba(255, 255, 255, 0.2)"
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        <Menu
          theme="light"
          mode="inline"
          items={items}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          selectedKeys={selectedKeys}
        />
        <div className="mx-auto px-5">
          <div
            style={{
              display: !collapsed ? 'block' : 'none',
            }}
          >
            <RequirementsFilteredForm
              foForecact={true}
              nonCalculate={false}
              onRequirementsSearch={(values) => setRequirementsSearch(values)}
            ></RequirementsFilteredForm>
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <ProCard className="h-[82vh] overflow-hidden">
          <RequirementsList
            onDoubleRowClick={(record) => {}}
            data={requirements || []}
            isLoading={isLoading}
            scroll={60}
            scrollX={2500}
          />
        </ProCard>
      </Content>
    </Layout>
  );
};

export default RequirementViewer;
