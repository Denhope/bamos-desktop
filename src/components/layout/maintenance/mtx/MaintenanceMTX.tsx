import React, { useState, useEffect, FC } from 'react';
import { Empty, Layout, Menu, MenuProps, Tabs } from 'antd';
import { RouteNames } from '@/router';
import { v4 as originalUuidv4 } from 'uuid'; // Импортируйте библиотеку uuid
import {
  AppstoreOutlined,
  ProjectOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import MTXTask from '@/components/layout/maintenance/mtx/MTXTask';
import MTXStatus from './MTXStatus';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import FIlteredTaskForm from '@/components/mantainance/mtx/planeTask/FIlteredTaskForm';
import FilterSiderForm from '@/components/shared/form/FilterSiderForm';
import MTXWO from './MTXWO';
import WOFilrersForm from '@/components/mantainance/mtx/wo/WOFilrersForm';
import {
  getFilteredPlanesWO,
  getPlaneByID,
  updatePlaneTasksForTimes,
} from '@/utils/api/thunks';
import MTXDUE from './MTXDUE';
import DUEFiltersForm from '@/components/mantainance/mtx/due/DUEFiltersForm';
import { TabPaneProps } from 'antd/lib/tabs';
import WOList from '@/components/mantainance/mtx/wo/WOList';
import { IPlaneWO } from '@/models/IPlaneWO';
import TaskList from '@/components/mantainance/mtx/wo/TaskList';
import { IPlaneTaskResponce } from '@/models/ITask';
import { useTranslation } from 'react-i18next';
import { ProCard } from '@ant-design/pro-components';
const { SubMenu } = Menu;
const { TabPane } = Tabs;

const { Sider, Content } = Layout;
const MaintenanceMTX: FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const rootSubmenuKeys = ['-'];
  const [openKeys, setOpenKeys] = useState([RouteNames.MTXT, 'sub2']);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['sub1']);
  const { currentPlane } = useTypedSelector((state) => state.planes);
  type MenuItem = Required<MenuProps>['items'][number];
  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group'
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  }
  const items: MenuItem[] = [
    getItem(
      `${t('Maintenance Management (MTX)')}`,

      RouteNames.MTXT,
      <AppstoreOutlined />,
      [
        getItem(
          `${t('A/C Status List')}`,
          RouteNames.MTXSTATUS,
          <DatabaseOutlined />
        ),
        currentPlane?.regNbr
          ? getItem(
              `${currentPlane?.regNbr || 'A/C'}`,
              'sub2',
              <ProjectOutlined />,
              [
                getItem(
                  `${t('Information')}`,
                  RouteNames.MTXINFO,
                  <DatabaseOutlined />
                ),
                getItem(
                  `${t('Task/Status')}`,
                  RouteNames.MTXTask,
                  <DatabaseOutlined />
                ),
                getItem(
                  `${t('Due List')}`,
                  RouteNames.MTXDUE,
                  <DatabaseOutlined />
                ),
                getItem('AD/SB', RouteNames.MTXSB, <DatabaseOutlined />),

                getItem(
                  `${t('Work Orders')}`,
                  RouteNames.MTXWO,
                  <AppstoreOutlined />
                ),
              ]
            )
          : null,
      ]
    ),
  ];

  useEffect(() => {
    const storedKeys = localStorage.getItem('selectedKeys');
    if (storedKeys) {
      setSelectedKeys(JSON.parse(storedKeys));
    }
  }, []);
  useEffect(() => {
    const currentPlaneID = localStorage.getItem('currentPlaneID');
    const storedKeys = localStorage.getItem('selectedKeys');
    if (currentPlaneID) {
      dispatch(
        updatePlaneTasksForTimes({
          planeID: JSON.parse(currentPlaneID),
          timeMOS: new Date(),
        })
      );
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
  const uuidv4: () => string = originalUuidv4;
  interface TabData extends TabPaneProps {
    key: string;
    title: string;
    content: React.ReactNode;
  }

  const [activeKey, setActiveKey] = useState<string>(''); // Используйте строку вместо массива
  const [panes, setPanes] = useState<TabData[]>([]);
  const { isLoading, planesWO } = useTypedSelector((state) => state.planes);

  useEffect(() => {
    const currentPlaneID = localStorage.getItem('currentPlaneID');
    if (currentPlaneID) {
      dispatch(getPlaneByID(JSON.parse(currentPlaneID)));
      dispatch(getFilteredPlanesWO({ planeID: JSON.parse(currentPlaneID) }));
    }
  }, [dispatch, localStorage.getItem('currentPlaneID')]);
  const onRowClick = (record: any) => {
    const tab: TabData = {
      key: uuidv4(), // уникальный ключ для каждой вкладки
      title: `WO: ${record.WONbr || record?.workOrderNbr || ''}`,
      content: (
        <div className="">
          <TaskList
            woNbr={record.WONbr || record?.workOrderNbr}
            woID={(record.workOrderID && record?.workOrderID) || record._id}
            data={[]}
            isLoading={isLoading}
          ></TaskList>
        </div>
      ),
      closable: true,
    };
    if (!panes.find((pane) => pane.key === tab.key)) {
      setPanes((prevPanes) => [...prevPanes, tab]);
    }
    setActiveKey(tab.key);
  };
  const onMenuClick = ({ key }: { key: string }) => {
    if (key === RouteNames.MTXTask) {
      const tab = {
        key,
        title: 'TASKS',
        content: (
          <ProCard className="h-[82vh] overflow-hidden">
            <MTXTask onRowClick={onRowClick} />
          </ProCard>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.MTXDUE) {
      const tab = {
        key,

        title: `${currentPlane?.regNbr.toUpperCase()} DUE LIST`,

        content: (
          <ProCard className="h-[82vh] overflow-hidden">
            <MTXDUE onRowClick={onRowClick} />
          </ProCard>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.MTXWO) {
      const tab = {
        key,
        title: `${currentPlane?.regNbr.toUpperCase()} WORK ORDERS`,
        content: (
          <ProCard className="h-[82vh] overflow-hidden">
            <MTXWO onRowClick={onRowClick} />
          </ProCard>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.MTXSTATUS) {
      const tab = {
        key,
        title: 'STATUS LIST',
        content: (
          <ProCard className="h-[82vh] overflow-hidden">
            <MTXStatus />
          </ProCard>
        ),

        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.MTXINFO) {
      const tab = {
        key,
        title: `${currentPlane?.regNbr.toUpperCase()} INFO`,
        content: (
          <ProCard className="h-[82vh] overflow-hidden">
            <Empty />
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
    <Layout>
      <Sider
        className="h-[85vh] overflow-hidden"
        theme="light"
        style={{
          paddingBottom: 0,
          marginBottom: 0,
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

        <div>
          {activeKey == RouteNames.MTXTask &&
            currentPlane?.regNbr &&
            !collapsed && (
              <FilterSiderForm
                title={t('Task/Status Filter')}
                children={
                  <FIlteredTaskForm
                    isMenuCollapse={openKeys.includes('sub2')}
                  />
                }
              />
            )}
          {activeKey == RouteNames.MTXWO &&
            currentPlane?.regNbr &&
            !collapsed && (
              <FilterSiderForm
                title={t('Work Odrers Filter')}
                children={
                  <WOFilrersForm
                    isMenuCollapse={openKeys.includes('sub2')}
                  ></WOFilrersForm>
                }
              />
            )}
          {activeKey == RouteNames.MTXDUE &&
            currentPlane?.regNbr &&
            !collapsed && (
              <FilterSiderForm
                title={t('Due List Filters')}
                children={
                  <DUEFiltersForm
                    currentPlane={currentPlane}
                    isMenuCollapse={openKeys.includes('sub2')}
                  ></DUEFiltersForm>
                }
              />
            )}
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
        {/* {selectedKeys[0] == RouteNames.MTXSTATUS && <MTXStatus />} */}
        {/* {selectedKeys[0] == RouteNames.MTXTask && <MTXTask />}{' '} */}
        {/* {selectedKeys[0] == RouteNames.MTXWO && <MTXWO />}{' '} */}
        {/* {selectedKeys[0] == RouteNames.MTXDUE && <MTXDUE />}{' '} */}
      </Content>
    </Layout>
  );
};

export default MaintenanceMTX;
