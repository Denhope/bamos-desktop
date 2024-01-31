import { ProCard } from '@ant-design/pro-components';
import { Layout, Menu, MenuProps, Tabs } from 'antd';
import Sider from 'antd/es/layout/Sider';
import Title from 'antd/es/typography/Title';
import { Content } from 'antd/es/layout/layout';
import TabPane, { TabPaneProps } from 'antd/es/tabs/TabPane';
import WOTask from '@/components/mantainance/base/systemWO/woProcess/Task';
import MarerialOrderContent from '@/components/store/matOrders/MarerialOrderContent';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getItem } from '@/services/utilites';

import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import PickSlipFiltered from '@/components/store/pickSlip/PickSlipFiltered';
import MaterialOrdersList from '@/components/store/matOrders/MaterialOrders';
interface PickSlipViwer {
  onDoubleClick?: (record: any, rowIndex?: any) => void;
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
}
const PickSlipViwer: FC<PickSlipViwer> = ({
  onDoubleClick,
  onSingleRowClick,
}) => {
  interface TabData extends TabPaneProps {
    key: string;
    title: string;
    content: React.ReactNode;
  }
  const [collapsed, setCollapsed] = useState(false);

  const [activeKey, setActiveKey] = useState<string>('pickSlipsList');
  const onRowClick = (record: any) => {
    const tab: TabData = {
      key: String(record.materialAplicationNumber), // уникальный ключ для каждой вкладки
      title: `PICKSLIP: ${String(record.materialAplicationNumber)}`,
      content: (
        <ProCard className="">
          <MarerialOrderContent order={record} />
        </ProCard>
      ),
      closable: true,
    };

    if (tab) {
      setPanes((prevPanes) => {
        // Проверяем, существует ли уже вкладка с таким ключом
        const existingTab = prevPanes.some((pane) => pane.key === tab!.key);

        if (!existingTab) {
          // Если вкладки не существует, добавляем её
          return [
            ...prevPanes,
            tab as {
              key: string;
              title: any;
              content: JSX.Element;
              closable: boolean;
            },
          ];
        } else {
          // Если вкладка уже существует, не изменяем состояние
          return prevPanes;
        }
      });
      setActiveKey(tab.key);
    }
  };
  const { t } = useTranslation();
  const [panes, setPanes] = useState<TabData[]>([
    {
      key: `pickSlipsList`, // уникальный ключ для каждой вкладки
      title: t('PICKSLIPS'),
      content: (
        <ProCard className="h-[82vh] overflow-hidden">
          <MaterialOrdersList
            data={[]}
            scroll={55}
            isLoading={false}
            // onRowClick={}
            onDoubleRowClick={(record) => {
              onDoubleClick && onDoubleClick(record);
              onRowClick(record);
            }}
            onRowClick={function (record: any): void {
              onSingleRowClick && onSingleRowClick(record);
            }}
          ></MaterialOrdersList>
        </ProCard>
      ),
      closable: false,
    },
  ]);

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
      <>{t('PICKSLIP VIEWER (BAN:375)')}</>,
      'sub1',
      <ShoppingCartOutlined />
    ),
    // ]
    // ),
  ];
  const onFilterPickSlip = (record: any) => {
    const tab: TabData = {
      key: `pickSlipsList`, // уникальный ключ для каждой вкладки
      title: t('PICKSLIPS'),
      content: (
        <ProCard className="h-[82vh] overflow-hidden">
          <MaterialOrdersList
            canselVoidType={false}
            data={[]}
            scroll={45}
            isLoading={false}
            onRowClick={(record) => {
              onSingleRowClick && onSingleRowClick(record);
              onRowClick(record);
            }}
            onDoubleRowClick={onDoubleClick}
          ></MaterialOrdersList>
        </ProCard>
      ),
      //closable: true,
    };

    if (!panes.find((pane) => pane.key === tab.key)) {
      setPanes((prevPanes) => [...prevPanes, tab]);
    }

    setActiveKey(tab.key);
  };
  return (
    <Layout>
      <Sider
        className="h-[85vh] overflow-hidden"
        theme="light"
        style={{
          paddingBottom: 0,
          marginBottom: 0,
          // marginLeft: 'auto',
          // background: 'rgba(255, 255, 255, 0.2)',
        }}
        width={350}
        // trigger
        collapsible
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        {/* <Title className="px-5" level={5}>
          <>{t('VIEW WORKPACKAGE (BAN:58)')}</>
        </Title> */}
        <Menu
          theme="light"
          className="h-max"
          // defaultSelectedKeys={['/']}
          mode="inline"
          items={items}
        />
        <div className="mx-auto px-5">
          <div
            style={{
              display: !collapsed ? 'block' : 'none',
            }}
          >
            <PickSlipFiltered
              canselVoidType={false}
              onFilterPickSlip={onFilterPickSlip}
            ></PickSlipFiltered>
          </div>
        </div>
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

export default PickSlipViwer;
