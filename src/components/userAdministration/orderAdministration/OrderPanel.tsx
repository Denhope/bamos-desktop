//@ts-nocheck
import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import {
  PlusSquareOutlined,
  MinusSquareOutlined,
  MailOutlined,
  FilePdfOutlined,
  PrinterOutlined,
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
  useSendEmailToOtherVendorsMutation,
  useUpdateOrderMutation,
} from '@/features/orderNewAdministration/ordersNewApi';
import OrderAdministrationForm from './OrderAdministrationForm';
import {
  useAddOrderItemMutation,
  useUpdateOrderItemMutation,
} from '@/features/orderItemsAdministration/orderItemApi';
import GeneretedQuotationOrder from './GeneretedQuotationOrder';
import { ModalForm, ProForm, ProFormSelect } from '@ant-design/pro-components';
import { useGetVendorsQuery } from '@/features/vendorAdministration/vendorApi';

interface AdminPanelProps {
  orderSearchValues?: any;
}

const OrderPanel: React.FC<AdminPanelProps> = ({ orderSearchValues }) => {
  const [editingOrder, setEditingOrder] = useState<IOrder | null>(null);
  const [completeOpenPrint, setOpenCompletePrint] = useState<any>();
  const [completeOpenVendor, setOpenCompleteVendor] = useState<any>();
  const [completeOpenPrintPurshase, setOpenCompletePrintPurshase] =
    useState<any>();
  const [editingOrderItem, setEditingOrderItem] = useState<
    IOrderItem | null | {}
  >(null);

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
    vendorID: orderSearchValues?.vendorID,
  });

  const [addOrder] = useAddOrderMutation({});
  const [deleteOrder] = useDeleteOrderMutation();
  const [addOrderItem] = useAddOrderItemMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const [sentEmails] = useSendEmailMutation();

  const [sentToOtherVendor] = useSendEmailToOtherVendorsMutation();
  const { data: vendors } = useGetVendorsQuery({});
  const vendorValueEnum: Record<string, string> =
    vendors?.reduce((acc, vendor) => {
      acc[vendor.id] = String(vendor.CODE).toUpperCase();
      return acc;
    }, {}) || {};
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
        console.log(order);
        message.success(t('ORDER SUCCESSFULLY ADDED'));
      }
      setEditingOrder(null);
    } catch (error) {
      message.error(t('ERROR SAVING ORDER'));
    }
  };

  const handleSentEmail = async (order: IOrder) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO SENT EMAIL TO VENDORS?'),
      onOk: async () => {
        try {
          await sentEmails({ orderId: order.id }).unwrap();
          await refetchOrders();
          message.success(t('EMAIL SUCCESSFULLY SEND'));
        } catch (error) {
          await refetchOrders();
          message.error(t('EMAIL SEND ERROR'));
        }
      },
    });
  };

  const handleSentEmailOterVendors = async (
    order: IOrder,
    vendorIds: string
  ) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO SENT EMAIL TO THIS VENDORS?'),
      onOk: async () => {
        try {
          await sentToOtherVendor({ orderId: order.id, vendorIds }).unwrap();
          // await refetchOrders();
          // message.success(t('EMAIL SUCCESSFULLY SEND'));
        } catch (error) {
          await refetchOrders();
          message.error(t('EMAIL SEND ERROR'));
        }
      },
    });
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
          className=" bg-white px-4 py-3 w-[258vh]  rounded-md brequierement-gray-400 "
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
              disabled={
                (editingOrder && editingOrder.state === 'onQuatation') ||
                editingOrder.state === 'open'
              }
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingOrder._id || editingOrder.id)}
            >
              {t('DELETE ORDER')}
            </Button>
          )}
        </Col>
        {/* <Col style={{ textAlign: 'right' }}>
          {editingOrder && (
            <Button disabled size="small" icon={<MinusSquareOutlined />}>
              {t('COPY ORDER')}
            </Button>
          )}
        </Col> */}
        <Col className="ml-auto" style={{ textAlign: 'right' }}>
          {editingOrder &&
            editingOrder.orderType === 'QUOTATION_ORDER' &&
            editingOrder.parts &&
            editingOrder.parts?.length > 0 && (
              <Button
                disabled={
                  (editingOrder && editingOrder.state === 'onQuatation') ||
                  editingOrder.state === 'draft'
                }
                onClick={() => handleSentEmail(editingOrder)}
                type="primary"
                size="small"
                icon={<MailOutlined />}
              >
                {t(`SEND EMAIL TO VENDOR`)}
              </Button>
            )}
        </Col>
        <Col className="ml-auto" style={{ textAlign: 'right' }}>
          {editingOrder &&
            editingOrder.orderType === 'QUOTATION_ORDER' &&
            editingOrder.parts &&
            editingOrder.parts?.length > 0 && (
              <Button
                disabled={
                  // (editingOrder && editingOrder.state! == 'onQuatation') ||
                  editingOrder.state === 'draft' ||
                  editingOrder.state === 'open' ||
                  editingOrder.state === 'planned'
                }
                onClick={() => {
                  setOpenCompleteVendor(true);
                  // handleSentEmailOterVendors(editingOrder);
                }}
                type="primary"
                size="small"
                icon={<MailOutlined />}
              >
                {t(`SEND EMAIL TO OTHER VENDOR`)}
              </Button>
            )}
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingOrder && (
            <Button
              onClick={() => {
                editingOrder &&
                  editingOrder.state === 'onQuatation' &&
                  setOpenCompletePrint(true);
                editingOrder &&
                  editingOrder.orderType === 'PURCHASE_ORDER' &&
                  setOpenCompletePrintPurshase(true);
              }}
              disabled={
                !editingOrder || // If there is no editingOrder, the button should be disabled
                editingOrder.state == 'draft' // If the state is not 'onQuatation' and the orderType is not 'PURCHASE_ORDER', the button should be disabled
              }
              size="small"
              icon={<PrinterOutlined />}
            >
              {t('PRINT ORDER')}
            </Button>
          )}
        </Col>
      </Space>

      <ModalForm
        onFinish={async (values) => {
          editingOrder &&
            handleSentEmailOterVendors(editingOrder, values.vendorID);
        }}
        title="SELECT VENDORS"
        open={completeOpenVendor}
        onOpenChange={setOpenCompleteVendor}
        width={'60%'}
      >
        <ProFormSelect
          showSearch
          rules={[{ required: true }]}
          mode="multiple"
          name="vendorID"
          label={`${t(`VENDORS`)}`}
          width="lg"
          valueEnum={vendorValueEnum}
          onChange={async (value: any) => {
            // setSelectedProjectId(value);
          }}
        />
      </ModalForm>

      <Modal
        title="QUATATION ORDER"
        open={completeOpenPrint}
        width={'60%'}
        onCancel={() => setOpenCompletePrint(false)}
        footer={null}
      >
        {editingOrder && editingOrder.state === 'onQuatation' && (
          <GeneretedQuotationOrder
            orderID={editingOrder.id || editingOrder._id}
          />
        )}
      </Modal>
      <Modal
        title="PURSHASE ORDER"
        open={completeOpenPrintPurshase}
        width={'60%'}
        onCancel={() => setOpenCompletePrintPurshase(false)}
        footer={null}
      >
        {editingOrder && editingOrder.state === 'onQuatation' && (
          <GeneretedQuotationOrder
            orderID={editingOrder.id || editingOrder._id}
          />
        )}
        {editingOrder && editingOrder.orderType === 'PURCHASE_ORDER' && (
          <GeneretedQuotationOrder
            orderID={editingOrder.id || editingOrder._id}
          />
        )}
      </Modal>
      {/* <FilePdfOutlined
        onClick={() => {
          setOpenCompletePrint(true);
        }}
        className="text-3xl cursor-pointer hover:text-blue-500"
      /> */}

      <div className="  flex gap-4 justify-between">
        <div
          // sm={4}
          className="w-4/12 h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3 "
        >
          <OrderTree
            onCompanySelect={handleEdit}
            orders={requirements || []}
            onOrderItemSelect={function (orderItem: IOrderItem | {}): void {
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
