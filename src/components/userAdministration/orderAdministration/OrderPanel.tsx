//@ts-nocheck
import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import {
  PlusSquareOutlined,
  MinusSquareOutlined,
  MailOutlined,
} from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import { IOrder, IOrderItem } from '@/models/IRequirement';

import OrderTree from './OrderTree';
import OrderDiscription from './OrderDiscription';
import {
  useAddOrderMutation,
  useDeleteOrderMutation,
  useGetFilteredOrdersQuery,
  useSendEmailMutation,
  useUpdateOrderMutation,
} from '@/features/orderNewAdministration/ordersNewApi';
import OrderAdministrationForm from './OrderAdministrationForm';
import {
  useAddOrderItemMutation,
  useUpdateOrderItemMutation,
} from '@/features/orderItemsAdministration/orderItemApi';

interface AdminPanelProps {
  orderSearchValues?: any;
}

const OrderPanel: React.FC<AdminPanelProps> = ({ orderSearchValues }) => {
  const [editingOrder, setEditingOrder] = useState<IOrder | null>(null);
  const [editingOrderItem, setEditingOrderItem] = useState<IOrderItem | null>(
    null
  );
  console.log(orderSearchValues);
  const {
    data: requirements,
    isLoading,
    refetch: refetchOrders,
  } = useGetFilteredOrdersQuery({
    startDate: orderSearchValues?.startDate ? orderSearchValues?.startDate : '',
    endDate: orderSearchValues?.endDate ? orderSearchValues?.endDate : '',
    state: orderSearchValues?.state || '',
    orderNumber: orderSearchValues?.orderNumber,
    orderType: orderSearchValues?.orderType,
    partNumberID: orderSearchValues?.partNumberID,
  });

  const [addOrder] = useAddOrderMutation({});
  const [deleteOrder] = useDeleteOrderMutation();
  const [addOrderItem] = useAddOrderItemMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const [sentEmails] = useSendEmailMutation();

  const handleCreate = () => {
    setEditingOrder(null);
  };

  const handleEdit = (requierement: IOrder) => {
    setEditingOrder(requierement);
  };

  const [updateOrderItem] = useUpdateOrderItemMutation();

  const handleDelete = async (orderID: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS ORDER?'),
      onOk: async () => {
        try {
          await deleteOrder(orderID).unwrap();
          message.success(t('ORDER SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING REQUIREMENT'));
        }
      },
    });
  };

  const handleUpdateOrderItem = async (orderItem: IOrderItem) => {
    try {
      if (editingOrderItem) {
        await updateOrderItem(orderItem).unwrap();

        await refetchOrders();
        message.success(t('ORDER SUCCESSFULLY UPDATED'));
      }
    } catch (error) {
      message.error(t('ERROR SAVING ORDER'));
    }
  };
  const handleSubmit = async (order: IOrder) => {
    try {
      if (editingOrder) {
        await updateOrder(order).unwrap();
        await refetchOrders();
        message.success(t('ORDER SUCCESSFULLY UPDATED'));
      } else {
        await addOrder(order).unwrap();
        message.success(t('ORDER SUCCESSFULLY ADDED'));
      }
      setEditingOrder(null);
    } catch (error) {
      message.error(t('ERROR SAVING ORDER'));
    }
  };

  const handleSentEmail = async (order: IOrder) => {
    try {
      if (editingOrder) {
        await sentEmails({ orderId: order.id }).unwrap();
        // await refetchOrders();
        message.success(t('EMAIL SUCCESSFULLY SEND'));
      }
    } catch (error) {
      message.error(t('EMAIL SEND ERROR'));
    }
  };
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div>
        <Spin />
      </div>
    );
  }

  return (
    <>
      <Space>
        <Col
          className=" bg-white px-4 py-3 w-[158vh]  rounded-md brequierement-gray-400 "
          sm={24}
        >
          <OrderDiscription order={editingOrder}></OrderDiscription>
        </Col>
      </Space>
      <Space className="">
        <Col>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD ORDER')}
          </Button>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingOrder && (
            <Button
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingOrder._id || editingOrder.id)}
            >
              {t('DELETE ORDER')}
            </Button>
          )}
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingOrder && (
            <Button disabled size="small" icon={<MinusSquareOutlined />}>
              {t('COPY ORDER')}
            </Button>
          )}
        </Col>
        <Col className="ml-auto" style={{ textAlign: 'right' }}>
          {editingOrder &&
            editingOrder.orderType === 'QUOTATION_ORDER' &&
            editingOrder.parts &&
            editingOrder.parts?.length > 0 && (
              <Button
                onClick={() => handleSentEmail(editingOrder)}
                type="primary"
                size="small"
                icon={<MailOutlined />}
              >
                {t(`SEND TO VENDOR`)}
              </Button>
            )}
        </Col>
      </Space>

      <div className="  flex gap-4 justify-between">
        <div
          // sm={4}
          className="w-4/12 h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3 "
        >
          <OrderTree
            onCompanySelect={handleEdit}
            orders={requirements || []}
            onOrderItemSelect={function (orderItem: IOrderItem): void {
              setEditingOrderItem(orderItem);
            }}
          />
        </div>
        <div
          className="w-8/12  h-[75vh] bg-white px-4 rounded-md brequierement-gray-400 p-3  "
          // sm={19}
        >
          <OrderAdministrationForm
            onOrderItemUpdate={handleUpdateOrderItem}
            order={editingOrder || undefined}
            orderItem={editingOrderItem || undefined}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </>
  );
};

export default OrderPanel;
