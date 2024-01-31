import React, { FC, useEffect, useState } from 'react';

import { ApartmentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getItem } from '@/services/utilites';
import { Layout, Menu, MenuProps } from 'antd';
import Sider from 'antd/es/layout/Sider';

import { Content } from 'antd/es/layout/layout';

import OrderList from '@/components/store/goods/OrderList';
import GoodsReceivingSrarchForm from '@/components/store/goods/GoodsReceivingSrarchForm';
import OrderDescription from '../orderManagment/OrderDescription';
import OrderDetails from '../orderManagment/OrderDetails';

const OrderManagment: FC = () => {
  const [order, setOrder] = useState<any | null>(null);
  const [onUpdateOrder, setUpdateOrder] = useState<any | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [orders, setOrders] = useState<any[] | []>([]);
  const [data, setdata] = useState<any[] | []>(orders);
  const { t } = useTranslation();
  type MenuItem = Required<MenuProps>['items'][number];
  useEffect(() => {
    if (orders) {
      setdata(orders);
    }
  }, [orders]);
  const items: MenuItem[] = [
    getItem(
      <>{t('ORDER MANAGMENT')} (BAN:1201)</>,
      'sub1',
      <ApartmentOutlined />
    ),
  ];
  return (
    <Layout>
      <Sider
        className="h-[85vh] overflow-hidden"
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
        <div className="mx-auto px-5">
          <div
            style={{
              display: !collapsed ? 'block' : 'none',
            }}
          >
            <GoodsReceivingSrarchForm onOrdersSearch={setOrders} />
            <OrderList
              scroll={16}
              orders={data}
              onSelectedOrders={setOrder}
            ></OrderList>
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-5">
          <OrderDescription onOrderSearch={setOrder} order={order} />
          <OrderDetails order={order} onEditOrderDetailsEdit={setOrder} />
        </div>
      </Content>
    </Layout>
  );
};

export default OrderManagment;
