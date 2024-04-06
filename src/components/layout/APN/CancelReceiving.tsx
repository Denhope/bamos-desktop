import { ProForm, ProFormTextArea } from '@ant-design/pro-components';
import { Button, Form, Modal, Space, message } from 'antd';
import CancelReceivingForm from '@/components/store/cancelReceiving/CancelReceivingForm';
import ReceivingItemList from '@/components/store/receivingItems/ReceivingItemList';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { USER_ID } from '@/utils/api/http';
import {
  deleteMaterialStoreItemByID,
  getFilteredOrders,
  updateOrderByID,
  updateReceivingByID,
  createBookingItem,
} from '@/utils/api/thunks';
import { useUpdateOrderItemMutation } from '@/features/orderItemsAdministration/orderItemApi';
import { useUpdateOrderMutation } from '@/features/orderNewAdministration/ordersNewApi';

const CancelReceiving: FC = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [receivings, setReceiving] = useState<any[] | []>([]);
  const [data, setdata] = useState<any[] | []>(receivings);
  const [partsToPrint, setPartsToPrint] = useState<any>(null);
  const [updateOrderItem] = useUpdateOrderItemMutation();

  const [updateOrder] = useUpdateOrderMutation();
  useEffect(() => {
    if (receivings) {
      setdata(receivings);
    }
  }, [receivings]);
  const dispatch = useAppDispatch();
  return (
    <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-1">
      <div className="flex flex-col gap-5">
        <CancelReceivingForm
          onFilterReceiving={setReceiving}
        ></CancelReceivingForm>
        <ReceivingItemList
          onSelectedParts={setPartsToPrint}
          // onDoubleClick={onDoubleClick}
          scroll={40}
          data={data}
        />
      </div>
      <div className="flex justify-between">
        <ProForm form={form} submitter={false}>
          <ProFormTextArea
            width={'xl'}
            fieldProps={{ style: { resize: 'none' } }}
            rules={[{ required: true }]}
            name="reasonCancel"
            label={t('REASON FOR CANCEL')}
          ></ProFormTextArea>
        </ProForm>

        <Space align="center">
          <Button
            disabled={
              !(partsToPrint && partsToPrint.length === 1) ||
              !form.getFieldValue('reasonCancel') ||
              partsToPrint[0].IS_CANCELLED
            }
            onClick={async (values: any) => {
              Modal.confirm({
                title: t('CONFIRM CANCEL'),
                onOk: async () => {
                  const currentCompanyID = localStorage.getItem('companyID');
                  const result = await dispatch(
                    updateReceivingByID({
                      companyID: currentCompanyID,
                      id: partsToPrint[0]._id,
                      state: 'CANCELLED',
                      IS_CANCELLED: true,
                      reason: form.getFieldValue('reasonCancel'),
                      cancelledQTY: partsToPrint[0].QUANTITY,
                    })
                  );
                  if (result.meta.requestStatus === 'fulfilled') {
                    form.setFields([
                      {
                        name: 'reasonCancel',
                        value: '',
                      },
                    ]);
                    setReceiving((prevReceivings) =>
                      prevReceivings.filter(
                        (item) => item?._id !== partsToPrint[0]?._id
                      )
                    );
                    const resultDelete = await dispatch(
                      deleteMaterialStoreItemByID({
                        companyID: currentCompanyID,
                        id: partsToPrint[0].MATERIAL_STORE_ID,
                      })
                    );
                    if (resultDelete.meta.requestStatus === 'fulfilled') {
                      dispatch(
                        createBookingItem({
                          companyID: resultDelete.payload.COMPANY_ID,
                          data: {
                            companyID: resultDelete.payload.COMPANY_ID,
                            userSing: localStorage.getItem('singNumber') || '',
                            userID: USER_ID || '',
                            createDate: new Date(),
                            PART_NUMBER: resultDelete.payload.PART_NUMBER,
                            station:
                              resultDelete.payload?.WAREHOUSE_RECEIVED_AT ||
                              'N/A',
                            WAREHOUSE_RECEIVED_AT:
                              resultDelete.payload?.WAREHOUSE_RECEIVED_AT ||
                              'N/A',
                            voucherModel: 'RECEIVING_CANCELLED',
                            SHELF_NUMBER: resultDelete.payload?.SHELF_NUMBER,
                            ORDER_NUMBER: resultDelete.payload?.ORDER_NUMBER,
                            PRICE: resultDelete.payload?.PRICE,
                            CURRENCY: resultDelete.payload?.CURRENCY,
                            QUANTITY: -resultDelete.payload?.QUANTITY,
                            SUPPLIER_BATCH_NUMBER:
                              resultDelete.payload?.SUPPLIER_BATCH_NUMBER,
                            OWNER: resultDelete.payload?.OWNER_SHORT_NAME,
                            batchNumber:
                              resultDelete.payload?.SUPPLIER_BATCH_NUMBER,
                            serialNumber: resultDelete.payload?.SERIAL_NUMBER,
                            GROUP: resultDelete.payload?.GROUP,
                            TYPE: resultDelete.payload?.TYPE,
                            CONDITION: resultDelete.payload?.CONDITION,
                            NAME_OF_MATERIAL:
                              resultDelete.payload?.NAME_OF_MATERIAL,

                            STOCK: resultDelete.payload?.STOCK,

                            RECEIVED_DATE: resultDelete.payload?.RECEIVED_DATE,

                            UNIT_OF_MEASURE:
                              resultDelete.payload.UNIT_OF_MEASURE,

                            SUPPLIES_CODE:
                              resultDelete.payload?.SUPPLIES_CODE || '',
                            SUPPLIES_LOCATION:
                              resultDelete.payload?.SUPPLIES_LOCATION || '',
                            SUPPLIER_NAME: resultDelete.payload?.SUPPLIER_NAME,
                            SUPPLIER_SHORT_NAME:
                              resultDelete.payload?.SUPPLIER_SHORT_NAME,
                            SUPPLIER_UNP: resultDelete.payload?.SUPPLIER_UNP,
                            SUPPLIES_ID: resultDelete.payload?.SUPPLIES_ID,
                            IS_RESIDENT: resultDelete.payload?.IS_RESIDENT,
                            ADD_UNIT_OF_MEASURE:
                              resultDelete.payload?.ADD_UNIT_OF_MEASURE,
                            ADD_NAME_OF_MATERIAL:
                              resultDelete.payload?.ADD_NAME_OF_MATERIAL,
                            ADD_PART_NUMBER:
                              resultDelete.payload?.ADD_PART_NUMBER,
                            ADD_QUANTITY: resultDelete.payload?.ADD_QUANTITY,
                            OWNER_SHORT_NAME:
                              resultDelete.payload?.OWNER_SHORT_NAME,
                            OWNER_LONG_NAME:
                              resultDelete.payload?.OWNER_LONG_NAME,
                            PRODUCT_EXPIRATION_DATE:
                              resultDelete.payload?.PRODUCT_EXPIRATION_DATE,

                            SERIAL_NUMBER: resultDelete.payload.SERIAL_NUMBER,
                            APPROVED_CERT: resultDelete.payload?.APPROVED_CERT,
                            AWB_REFERENCE:
                              resultDelete.payload?.AWB_REFERENCE || '',
                            AWB_TYPE: resultDelete.payload?.AWB_TYPE || '',
                            AWB_NUMBER: resultDelete.payload?.AWB_NUMBER || '',
                            AWB_DATE: resultDelete.payload?.AWB_DATE || '',
                            RECEIVING_NUMBER:
                              resultDelete.payload?.RECEIVING_NUMBER,
                            RECEIVING_ITEM_NUMBER:
                              resultDelete.payload.RECEIVING_ITEM_NUMBER,
                            CERTIFICATE_NUMBER:
                              resultDelete.payload?.CERTIFICATE_NUMBER,
                            CERTIFICATE_TYPE:
                              resultDelete.payload?.CERTIFICATE_TYPE,
                            REVISION: resultDelete.payload?.REVISION,
                            IS_CUSTOMER_GOODS:
                              resultDelete.payload?.IS_CUSTOMER_GOODS,
                            LOCAL_ID: resultDelete.payload?.LOCAL_ID,
                            ORDER_ITEM_ID:
                              result && result?.payload?.ORDER_ITEM_ID,
                          },
                        })
                      );
                    }
                    try {
                      if (partsToPrint[0].ORDER_NUMBER) {
                        await updateOrderItem({
                          cancelledQTY: partsToPrint[0].QUANTITY,
                          state: 'PARTLY_RECEIVED',
                          _id: result?.payload?.ORDER_ITEM_ID,
                          id: result?.payload?.ORDER_ITEM_ID,
                        }).unwrap();

                        await updateOrder({
                          id: result?.payload?.ORDER_ID,
                          state: 'PARTLY_RECEIVED',
                          _id: result?.payload?.ORDER_ID,
                        }).unwrap();
                        message.success(t('CANCEL RECEIVIN SUCCESSFULLY DONE'));
                      }
                    } catch (error) {
                      message.error(t('ERROR CANCEL RECEIVING'));
                    }
                  }
                },
              });
            }}
            size="small"
          >
            {t('CANCEL RECEIVING')}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default CancelReceiving;
