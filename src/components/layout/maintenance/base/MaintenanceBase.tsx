import React, { useState, useEffect, FC } from 'react';
import { Layout, Menu, MenuProps, TabPaneProps, Tabs } from 'antd';

import { DatabaseOutlined } from '@ant-design/icons';

import { RouteNames } from '@/router';
import { v4 as originalUuidv4 } from 'uuid'; // Импортируйте библиотеку uuid
import {
  UnorderedListOutlined,
  SelectOutlined,
  WarningOutlined,
  AppstoreOutlined,
  ProjectOutlined,
  SearchOutlined,
  FormatPainterOutlined,
  ExpandAltOutlined,
  FundProjectionScreenOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';

import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import MTBWP from './MTBWP';
import TabPane from 'antd/es/tabs/TabPane';
import { IProjectInfo } from '@/types/TypesData';

import NRCTaskList from '@/components/mantainance/base/wp/NRCTaskList';
import GroupsList from '@/components/mantainance/base/wp/GroupsList';
import ProjectTaskList from '@/components/mantainance/base/wp/ProjectTaskList';
import GroupTaskList from '@/components/mantainance/base/wp/GroupTaskList';
import RequirementItems from '@/components/mantainance/base/wp/RequirementItems';
import RemoverdItems from '@/components/mantainance/removeInstallComponents/RemoverdItems';
import { useTranslation } from 'react-i18next';
import WOFilterForm from '@/components/mantainance/base/systemWO/woProcess/WOProcessForm';

import WOTask from '@/components/mantainance/base/systemWO/woProcess/Task';
import { ProCard } from '@ant-design/pro-components';
import Title from 'antd/es/typography/Title';

const { Sider, Content } = Layout;

const MaintenanceBase: FC = () => {
  const { t } = useTranslation();
  const [issuedRecord, setIssuedRecord] = useState(false);
  const [issuedtDrawer, setOpenIssuedDrawer] = useState(false);
  const [selectedObject, setSelectedObject] = useState({
    PART_NUMBER: '',
    QUANTITY: 0,
    NAME_OF_MATERIAL: '',
  });
  const onIssuedClick = (record: any) => {
    setIssuedRecord(record);
    setOpenIssuedDrawer(true);
  };
  const dispatch = useAppDispatch();
  const { projects } = useTypedSelector((state) => state.mtbase);
  const {
    projectTasks,
    isLoading,
    currentProject,
    projectGroups,
    isLoadingWO,
  } = useTypedSelector((state) => state.mtbase);

  const rootSubmenuKeys = [''];

  const [openKeys, setOpenKeys] = useState(['sub1', 'sub2']);
  const [selectedKey, setSelectedKey] = useState<string>(
    RouteNames.BASETASKLIST
  );
  const uuidv4: () => string = originalUuidv4;
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
  const onFilterWO = (record: any) => {
    const tab: TabData = {
      key: uuidv4(), // уникальный ключ для каждой вкладки
      title: `WO: ${record.projectTaskWO}`,
      content: (
        <ProCard className="h-[82vh] overflow-hidden">
          <WOTask currentTask={record}></WOTask>
        </ProCard>
      ),
      closable: true,
    };
    if (!panes.find((pane) => pane.key === tab.key)) {
      setPanes((prevPanes) => [...prevPanes, tab]);
    }
    setActiveKey(tab.key);
  };
  const onRowClick = (record: IProjectInfo) => {
    const tab: TabData = {
      key: uuidv4(), // уникальный ключ для каждой вкладки
      title: `WP: ${record.projectName}`,
      content: <div className="">{/* <ProjectTasksView /> */}</div>,
      closable: true,
    };
    if (!panes.find((pane) => pane.key === tab.key)) {
      setPanes((prevPanes) => [...prevPanes, tab]);
    }
    setActiveKey(tab.key);
  };
  const onRowGroupClick = (record: any) => {
    const tab: TabData = {
      key: uuidv4(), // уникальный ключ для каждой вкладки
      title: `GROUP: ${String(record.groupName).toUpperCase()}`,
      content: (
        <ProCard className="h-[82vh] overflow-hidden">
          {<GroupTaskList projectGroprojectGroupID={record._id} filter={''} />}
        </ProCard>
      ),
      closable: true,
    };
    if (!panes.find((pane) => pane.key === tab.key)) {
      setPanes((prevPanes) => [...prevPanes, tab]);
    }
    setActiveKey(tab.key);
  };
  const handleClick = ({ selectedKeys }: { selectedKeys: string[] }) => {
    setSelectedKeys(selectedKeys);
    localStorage.setItem('selectedKeys', JSON.stringify(selectedKeys));
  };
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

  const onMenuClick = ({ key }: { key: string }) => {
    if (key === RouteNames.WOPROCESS) {
      const tab = {
        key,
        title: 'WO:------',
        content: (
          <div>
            <></>
          </div>
        ),
        closable: true,
      };
      // if (!panes.find((pane) => pane.key === tab.key)) {
      //   setPanes((prevPanes) => [...prevPanes, tab]);
      // }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.MTBWP) {
      const tab = {
        key,
        title: `${t('WP LIST')}`,
        content: (
          <ProCard className="h-[82vh] overflow-hidden">
            <MTBWP onRowClick={onRowClick} />
          </ProCard>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.MTBTASKLIST) {
      const tab = {
        key,
        title: `${t('TASKS')}:${currentProject?.projectName}`,
        content: (
          // <>ddd</>
          <ProCard className="h-[82vh] overflow-y-auto">
            {<ProjectTaskList filter={''} />}
          </ProCard>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.MTBFINDING) {
      const tab = {
        key,
        title: `${t('NRC')}:${currentProject?.projectName}`,
        content: (
          <ProCard className="h-[82vh] overflow-hidden">
            <NRCTaskList filter={''} />
          </ProCard>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.MTBREQUESTS) {
      const tab = {
        key,

        title: `${t('REQUIREMENTS')}:${currentProject?.projectName}`,

        content: (
          <ProCard className="h-[82vh] overflow-hidden">
            <RequirementItems
              scrollX={1700}
              data
              isLoading={isLoading}
              projectData={currentProject}
              scroll={52}
              selectedObjectParent={selectedObject}
              onIssuedClick={function (record: any): void {
                throw new Error('Function not implemented.');
              }}
            />
          </ProCard>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.MTBGROUPs) {
      const tab = {
        key,

        title: `${t('GROUPS')}:${currentProject?.projectName}`,
        content: (
          <ProCard className="h-[82vh] overflow-hidden">
            <GroupsList onRowClick={onRowGroupClick} />
          </ProCard>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.REMOVEDITEMS) {
      const tab = {
        key,

        title: `${t('ACCESS')}:${currentProject?.projectName}`,
        content: (
          <ProCard className="h-[82vh] overflow-hidden">
            <RemoverdItems
              scrollX={1700}
              data
              isLoading={isLoading}
              projectData={currentProject}
              scroll={52}
              onIssuedClick={function (record: any): void {
                throw new Error('Function not implemented.');
              }}
            />
          </ProCard>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
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
  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    // path?: any,
    type?: 'group'
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      // path,
      type,
    } as MenuItem;
  }
  const items: MenuItem[] = [
    // getItem(<>{t('Base Maintenance')}</>, 'sub1', <ProjectOutlined />,
    //[
    getItem(
      <>{t('VIEW WORKPACKAGE (BAN:58)')}</>,
      'sub2',
      <ProjectOutlined />,
      [
        getItem(
          <>{t('Work Package List')}</>,
          RouteNames.MTBWP,
          <SelectOutlined />
        ),
        currentProject
          ? getItem(
              `${currentProject?.projectName || 'Project'}`,
              'sub2',
              <ProjectOutlined />,
              [
                getItem(
                  <>{t('Tasks')}</>,
                  RouteNames.MTBTASKLIST,
                  <DatabaseOutlined />
                ),
                getItem(
                  <>{t('NRC')}</>,
                  RouteNames.MTBFINDING,
                  <WarningOutlined />
                ),
                getItem(
                  <>{t('Groups')}</>,
                  RouteNames.MTBGROUPs,
                  <DatabaseOutlined />
                ),
                getItem(
                  <>{t('Requirements')}</>,
                  RouteNames.MTBREQUESTS,
                  <ShoppingCartOutlined />
                ),
                getItem(
                  <>{t('REMOVE/INSTALL ACCESS')}</>,
                  RouteNames.REMOVEDITEMS,
                  <ExpandAltOutlined />
                ),
              ]
            )
          : null,
      ]
    ),
  ];
  return (
    <Layout>
      <Sider
        className="h-[85vh] overflow-hidden"
        theme="light"
        width={350}
        collapsible
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
          onSelect={handleClick}
          selectedKeys={selectedKeys}
          onClick={onMenuClick}
        />
      </Sider>
      <Content>
        <Tabs
          style={{
            width: '98%',
          }}
          className="mx-auto"
          size="small"
          hideAdd
          onChange={setActiveKey}
          activeKey={activeKey}
          type="editable-card"
          onEdit={onEdit}
        >
          {panes.map((pane) => (
            <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
              {pane.content}
            </TabPane>
          ))}
        </Tabs>
      </Content>
    </Layout>
  );
};

export default MaintenanceBase;
