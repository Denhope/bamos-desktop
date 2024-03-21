import { Col, Layout, Menu, MenuProps, Row } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import BookingOrderPartsList from '@/components/store/goods/BookingOrderPartsList';
import BookingPartLeftSide from '@/components/store/goods/BookingPartLeftSide';
import BookingPartSide from '@/components/store/goods/BookingPartSide';
import GoodsReceivingSrarchForm from '@/components/store/goods/GoodsReceivingSrarchForm';
import OrderDetailsForm from '@/components/store/goods/OrderDetailsForm';
import OrderList from '@/components/store/goods/OrderList';
import React, { FC, useState } from 'react';
import { getItem } from '@/services/utilites';
import { ApartmentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const GoodsReciving: FC = () => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [order, setOrder] = useState<any | null>(null);
  type MenuItem = Required<MenuProps>['items'][number];
  const [onUpdateOrder, setUpdateOrder] = useState<any | null>(null);
  const items: MenuItem[] = [
    getItem(
      <>{t('GOODS RECEIVING')} (BAN:1201)</>,
      'sub1',
      <ApartmentOutlined />
    ),
  ];
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
        <Menu theme="light" mode="inline" items={items} />
        <div className="mx-auto px-5">
          <div
            style={{
              display: !collapsed ? 'block' : 'none',
            }}
          >
            <BookingPartLeftSide
              onUpdateOrder={onUpdateOrder}
              onSelectedOrder={setOrder}
            />
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-5">
          <BookingPartSide onUpdateOrder={setUpdateOrder} order={order} />
        </div>
      </Content>
    </Layout>
  );
};

export default GoodsReciving;
