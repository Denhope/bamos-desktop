import React, { useState, useEffect, FC } from 'react';
import { Layout, Menu, MenuProps, TabPaneProps, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { v4 as originalUuidv4 } from 'uuid';

import MenuItem from 'antd/es/menu/MenuItem';
import { RouteNames } from '@/router';

import {
  AppstoreOutlined,
  ProjectOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

import Aplications from '@/components/mantainance/base/workPackage/packageAplications/Aplications';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import TabPane from 'antd/es/tabs/TabPane';
import { IAplicationInfo } from '@/types/TypesData';
import TaskList from '@/components/mantainance/mtx/wo/TaskList';
import AplicationContent from '@/components/mantainance/base/workPackage/packageAplications/AplicationContent';
import { getFilteredAplications } from '@/utils/api/thunks';
import Projects from '@/components/mantainance/base/workPackage/workProject/Projects';
import ProjectContent from '@/components/mantainance/base/workPackage/workProject/ProjectContent';
import { useTranslation } from 'react-i18next';
import { ProCard } from '@ant-design/pro-components';
const { Sider, Content } = Layout;

const WPGeneration: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  // useEffect(() => {
  //   const companyID = localStorage.getItem('companyID');

  //   if (companyID) {
  //     console.log(companyID);
  //     dispatch(
  //       getFilteredAplications({
  //         companyID: companyID,
  //       })
  //     );
  //   }
  // }, [dispatch]);
  const { filteredAplications, isLoading, filteredProjects } = useTypedSelector(
    (state) => state.planning
  );
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
    getItem(t('Work Package Generation'), 'sub1', <AppstoreOutlined />, [
      // getItem('Summary view', RouteNames.GRIDTABSVIEW, <DatabaseOutlined />),
      getItem(t('Aplications'), RouteNames.APLICATIONS, <DatabaseOutlined />),
      // ]),
      getItem(<>{t('Work Package')}</>, RouteNames.MTBWP, <ProjectOutlined />),
    ]),
  ];

  const onRowClick = (record: IAplicationInfo) => {
    const tab: TabData = {
      key: uuidv4(), // уникальный ключ для каждой вкладки
      title: `APLICATION: ${record.aplicationName}`,
      content: (
        <ProCard className="h-[82vh] overflow-hidden">
          <AplicationContent aplication={record} />
        </ProCard>
      ),
      closable: true,
    };
    if (!panes.find((pane) => pane.key === tab.key)) {
      setPanes((prevPanes) => [...prevPanes, tab]);
    }
    setActiveKey(tab.key);
  };
  const onProjectRowClick = (record: any) => {
    const tab: TabData = {
      key: uuidv4(), // уникальный ключ для каждой вкладки
      title: `PROJECT: ${record.projectName}`,
      content: (
        <ProCard className="h-[82vh] overflow-hidden">
          <ProjectContent project={record} />
        </ProCard>
      ),
      closable: true,
    };
    if (!panes.find((pane) => pane.key === tab.key)) {
      setPanes((prevPanes) => [...prevPanes, tab]);
    }
    setActiveKey(tab.key);
  };

  const uuidv4: () => string = originalUuidv4;
  interface TabData extends TabPaneProps {
    key: string;
    title: string;
    content: React.ReactNode;
  }

  const [activeKey, setActiveKey] = useState<string>(''); // Используйте строку вместо массива
  const [panes, setPanes] = useState<TabData[]>([]);

  const navigate = useNavigate();
  const rootSubmenuKeys = ['-'];
  const [openKeys, setOpenKeys] = useState(['sub1', 'sub2']);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['sub1']);
  useEffect(() => {
    const storedKeys = localStorage.getItem('selectedKeys');
    if (storedKeys) {
      setSelectedKeys(JSON.parse(storedKeys));

      // navigate(storedKey);
    }
  }, []);
  const handleClick = ({ selectedKeys }: { selectedKeys: string[] }) => {
    setSelectedKeys(selectedKeys);
    localStorage.setItem('selectedKeys', JSON.stringify(selectedKeys));
  };

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const [collapsed, setCollapsed] = useState(false);
  const onMenuClick = ({ key }: { key: string }) => {
    if (key === RouteNames.APLICATIONS) {
      const tab = {
        key,
        title: 'APLICATIONS',
        content: (
          <ProCard className="h-[82vh] overflow-hidden">
            <Aplications
              onRowClick={onRowClick}
              data={filteredAplications}
              height={'h-full'}
              scroll={'calc(57vh)'}
              isLoading={isLoading}
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
    if (key === RouteNames.MTBWP) {
      const tab = {
        key,
        title: 'WORKPACKAGE',
        content: (
          <ProCard className="h-[82vh] overflow-hidden">
            <Projects
              onRowClick={onProjectRowClick}
              data={filteredProjects}
              height={'h-full'}
              scroll={'calc(57vh)'}
              isLoading={isLoading}
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
  return (
    <Layout className="h-full">
      <Sider
        theme="light"
        style={{
          marginLeft: 'auto',
          //background: 'rgba(255, 255, 255, 0.2)',
        }}
        width={350}
        collapsible
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        <div>
          <Menu
            onClick={onMenuClick}
            theme="light"
            mode="inline"
            items={items}
            onOpenChange={onOpenChange}
            onSelect={handleClick}
            openKeys={openKeys}
            selectedKeys={selectedKeys}
          />
        </div>
      </Sider>
      <Content className="">
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

export default WPGeneration;
