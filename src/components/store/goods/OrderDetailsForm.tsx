import {
  ModalForm,
  ProDescriptions,
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTimePicker,
} from '@ant-design/pro-components';
import ContextMenuVendorsSearchSelect from '@/components/shared/form/ContextMenuVendorsSearchSelect';
import { current } from '@reduxjs/toolkit';
import { FormInstance, Modal, RadioChangeEvent, message } from 'antd';
import { Button, Form, Space } from 'antd';
import ReceivingTracking from '@/components/layout/APN/ReceivingTracking';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { IOrder, OrderType } from '@/models/IOrder';
import { IReceiving } from '@/models/IReceiving';
import moment from 'moment';

import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { USER_ID } from '@/utils/api/http';
import { getFilteredOrders, postNewReceiving } from '@/utils/api/thunks';
import VendorSearchForm from '../search/VendorSearchForm';
type OrderDetailsFormType = {
  order: IOrder | null;
  onReceivingType: (data: any) => void;
  onOrdersSearch?: (data: any) => void;
  onCurrentReceiving: (data: any) => void;
};
const OrderDetailsForm: FC<OrderDetailsFormType> = ({
  order,
  onOrdersSearch,
  onCurrentReceiving,
  onReceivingType,
}) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const [currentReceiving, setCurrentReceiving] = useState<any | null>(null);

  const [openPickViewer, setOpenPickViewer] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (order && !currentReceiving) {
      form.setFields([
        { name: 'order', value: order?.orderNumber },
        { name: 'SUPPLIES_CODE', value: order?.supplier },
        { name: 'WAREHOUSE_RECEIVED_AT', value: order?.shipTo || 'MSQ' },
      ]);
    }
    if (order && currentReceiving) {
      form.setFields([{ name: 'order', value: order?.orderNumber }]);
    }
  }, [order]);
  useEffect(() => {
    if (currentReceiving) {
      form.setFields([
        { name: 'receiving', value: currentReceiving?.receivingNumber },
        { name: 'receivingDate', value: currentReceiving?.receivingDate },
        {
          name: 'receivingTime',
          value: moment(currentReceiving?.receivingDate),
        },
        { name: 'awbNumber', value: currentReceiving?.awbNumber },
        { name: 'awbDate', value: currentReceiving?.awbDate },
        { name: 'awbType', value: currentReceiving?.awbType },
        { name: 'awbReference', value: currentReceiving?.awbReference },
        { name: 'SUPPLIES_CODE', value: currentReceiving?.SUPPLIES_CODE },
        {
          name: 'WAREHOUSE_RECEIVED_AT',
          value: currentReceiving?.WAREHOUSE_RECEIVED_AT || 'MSQ',
        },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [currentReceiving]);
  const dispatch = useAppDispatch();
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const [selectedSingleVendor, setSecectedSingleVendor] = useState<any>();
  const createNewReceiving = () => {
    setCurrentReceiving({
      createDate: new Date(),
      receivingDate: new Date(),
      state: 'OPEN', // Замените это на подходящее начальное состояние
      receivingParts: [],
      orderItems: [],
      docs: [],
      supplier: {},
      shipTo: {},
      companyID: localStorage.getItem('companyID') || '',
      createUserID: USER_ID,

      // Добавьте другие базовые поля здесь
    });
    setSecectedSingleVendor({});
  };
  const formRef = useRef<FormInstance>(null);
  const [selectedType, setSelectedType] = useState('ORDER');
  const handleTypeChange = (e: RadioChangeEvent) => {
    setSelectedType(e.target.value);
    onOrdersSearch?.(null);
    setCurrentReceiving(null);
    onReceivingType(form.getFieldValue('type'));
    onCurrentReceiving(null);
  };

  const handleLoadClick = async () => {
    const currentCompanyID = localStorage.getItem('companyID') || '';
    const result = await dispatch(
      getFilteredOrders({
        companyID: currentCompanyID,
        orderNumber: formRef.current?.getFieldValue('order'),
        vendorName: formRef.current?.getFieldValue('vendorName'),
        partNumber: formRef.current?.getFieldValue('partNumber'),
        orderType: formRef.current?.getFieldValue('orderType'),
      })
    );
    if (result.meta.requestStatus === 'fulfilled') {
      onOrdersSearch?.(result.payload[0] || null);
    } else {
      message.error('Error');
    }
  };
  const [initialForm, setinitialForm] = useState<any>('');
  const [canSave, setCanSave] = useState(false);
  const validateAndSetCanSave = async () => {
    try {
      // Validate all fields
      const values = await form.validateFields();
      // If validation is successful, set canSave to true
      setCanSave(true);
    } catch (error) {
      // If there's an error during validation, set canSave to false
      setCanSave(false);
    }
  };

  // Function to handle form field changes
  const handleFormFieldChange = () => {
    validateAndSetCanSave();
  };

  return (
    <div className="flex flex-col">
      <ProForm
        onFinish={async (values) => {
          const result = dispatch(
            postNewReceiving({
              ...currentReceiving,
              awbNumber: form.getFieldValue('awbNumber'),
              awbDate: form.getFieldValue('awbDate'),
              awbType: form.getFieldValue('awbType'),
              awbReference: form.getFieldValue('awbReference'),
              SUPPLIES_CODE: selectedSingleVendor?.CODE,
              SUPPLIER_SHORT_NAME: selectedSingleVendor?.SHORT_NAME,
              SUPPLIER_NAME: selectedSingleVendor?.NAME,
              SUPPLIER_UNP: selectedSingleVendor?.UNP,
              IS_RESIDENT: selectedSingleVendor?.IS_RESIDENT,
              SUPPLIER_ADRESS: selectedSingleVendor?.ADRESS,
              SUPPLIER_COUNTRY: selectedSingleVendor?.COUNTRY,
              SUPPLIES_ID: selectedSingleVendor._id || selectedSingleVendor.id,
              WAREHOUSE_RECEIVED_AT: form.getFieldValue(
                'WAREHOUSE_RECEIVED_AT'
              ),
            })
          );
          if ((await result).meta.requestStatus === 'fulfilled') {
            setCurrentReceiving((await result).payload || []);
            onCurrentReceiving((await result).payload || []);
            onReceivingType(form.getFieldValue('type'));
            setIsCreating(false);
          } else {
            message.error('Error');
          }
        }}
        // onValuesChange={handleFormFieldChange}
        initialValues={{ type: 'ORDER' }}
        formRef={formRef}
        submitter={{
          submitButtonProps: {
            disabled:
              !!(
                // !currentReceiving ||
                (currentReceiving && Object.keys(currentReceiving).length === 0)
              ) || !selectedSingleVendor?.CODE,
          },
          render: (_, dom) =>
            isCreating
              ? [
                  ...dom,
                  <Button
                    key="cancel"
                    onClick={() => {
                      isCreating && setIsCreating(false);
                      onCurrentReceiving(null);
                      // setSelectedProjectType(
                      //   form.getFieldValue('projectState')
                      // );
                    }}
                  >
                    {t('Cancel')}
                  </Button>,
                ]
              : [],
        }}
        onReset={() => {
          setinitialForm('');
          // setSecectedSinglePN(null);
          setSecectedSingleVendor({ CODE: '' });
          // setSecectedSingleStore({ shopShortName: '' });
          // setSecectedSingleLocation({ locationName: '' });
        }}
        form={form}
        size="small"
        layout="horizontal"
        className="bg-white px-4 py-3 rounded-md border-gray-400"
      >
        <ProFormGroup>
          <ProFormRadio.Group
            fieldProps={{
              // initialValue: 'ORDER',
              onChange: handleTypeChange,
            }}
            options={[
              {
                label: t('ORDER'),
                value: 'ORDER',
              },

              {
                label: t('SINGLE RECEIVING'),
                value: 'UN_ORDER',
              },
            ]}
            name="type"
            width="sm"
          />
          {selectedType === 'ORDER' && (
            <>
              <ProFormText name="order" width="sm" tooltip={t('ORDER')} />
              <Button type="primary" onClick={handleLoadClick}>
                {t('LOAD')}
              </Button>
            </>
          )}
        </ProFormGroup>
        <Space direction="vertical">
          <ProFormGroup>
            <ProFormGroup>
              <Space className="P-5">
                <Button
                  type="primary"
                  disabled={isCreating}
                  onClick={() => {
                    onCurrentReceiving(null);
                    form.resetFields();
                    createNewReceiving();
                    setIsCreating(true);
                  }}
                >
                  {t('NEW RECEIVING')}
                </Button>{' '}
                {/* <Button
                  type="primary"
                  onClick={async () => {
                    if (isCreating) {
                      const result = dispatch(
                        postNewReceiving({
                          ...currentReceiving,
                          awbNumber: form.getFieldValue('awbNumber'),
                          awbDate: form.getFieldValue('awbDate'),
                          awbType: form.getFieldValue('awbType'),
                          awbReference: form.getFieldValue('awbReference'),
                          SUPPLIES_CODE: selectedSingleVendor?.CODE,
                          SUPPLIER_SHORT_NAME: selectedSingleVendor?.SHORT_NAME,
                          SUPPLIER_NAME: selectedSingleVendor?.NAME,
                          SUPPLIER_UNP: selectedSingleVendor?.UNP,
                          IS_RESIDENT: selectedSingleVendor?.IS_RESIDENT,
                          SUPPLIER_ADRESS: selectedSingleVendor?.ADRESS,
                          SUPPLIER_COUNTRY: selectedSingleVendor?.COUNTRY,
                          SUPPLIES_ID:
                            selectedSingleVendor._id || selectedSingleVendor.id,
                          WAREHOUSE_RECEIVED_AT: form.getFieldValue(
                            'WAREHOUSE_RECEIVED_AT'
                          ),
                        })
                      );
                      if ((await result).meta.requestStatus === 'fulfilled') {
                        setCurrentReceiving((await result).payload || []);
                        onCurrentReceiving((await result).payload || []);
                        onReceivingType(form.getFieldValue('type'));
                      } else {
                        message.error('Error');
                      }
                    }
                  }}
                  // disabled={
                  //   !currentReceiving ||
                  //   currentReceiving?.receivingNumber ||
                  //   !selectedSingleVendor?.CODE ||
                  //   !form.getFieldValue('awbNumber')

                  //   // ||
                  //   // // ||
                  //   // // !currentReceiving?.awbDate ||
                  //   // // !currentReceiving?.awbNumber
                  //   // !form.getFieldValue('awbNumber')
                  // }
                  disabled={!canSave}
                >
                  {t('SAVE RECEIVING')}
                </Button> */}
              </Space>
            </ProFormGroup>
            <ProFormText
              disabled={isCreating}
              name="receiving"
              // rules={[{ required: true }]}
              label={t('RECEIVING No')}
              width="sm"
              tooltip={t('ORDER')}
              fieldProps={{
                onDoubleClick: () => setOpenPickViewer(true),

                autoFocus: true,
              }}
            ></ProFormText>
            <ProFormDatePicker
              disabled={!isCreating}
              rules={[{ required: true }]}
              name="receivingDate"
              label={t('RECEIVING DATE')}
              width="xs"
            ></ProFormDatePicker>
            <ProFormTimePicker
              disabled={!isCreating}
              rules={[{ required: true }]}
              name="receivingTime"
              label={t('RECEIVING TIME')}
              width="xs"
              fieldProps={{
                format: 'HH:mm',
              }}
            ></ProFormTimePicker>
          </ProFormGroup>
          <ProFormGroup>
            <ProFormSelect
              disabled={!isCreating}
              rules={[{ required: true }]}
              name="awbType"
              label={t('DOC TYPE')}
              valueEnum={{
                ТН: t('ТОВАРНАЯ НАКЛАДНАЯ'),
                ТТН: t('ТОВАРНО-ТРАНСПОРТНАЯ НАКЛАДНАЯ'),
                УПД: t('УНИВЕРСАЛЬНО-ПЕРЕДАТОЧНЫЙ ДОКУМЕНТ'),
                СФ: t('СЧЕТ ФАКТУРА'),
                ДТ: t('ДЕКЛАРАЦИЯ НА ТОВАРЫ'),
                Инв: t('ИНВОЙС'),
                АПП: t('АКТ ПРИЕМО-ПЕРЕДАЧИ'),
              }}
              width="sm"
              tooltip={t('DOC TYPE')}
            ></ProFormSelect>
            <ProFormText
              disabled={!isCreating}
              name="awbNumber"
              label={t(' DOC No')}
              rules={[{ required: true }]}
              width="sm"
              tooltip={t(' DOC NNUMBER')}
            ></ProFormText>
            <ProFormDatePicker
              disabled={!isCreating}
              name="awbDate"
              label={t('DOC DATE')}
              rules={[{ required: true }]}
              width="xs"
            ></ProFormDatePicker>
            <ProFormText
              disabled={!isCreating}
              name="awbReference"
              label={t(' REFERENCE')}
              width="sm"
              tooltip={t('REFERENCE')}
            ></ProFormText>
          </ProFormGroup>
        </Space>
        <ProFormGroup>
          <ContextMenuVendorsSearchSelect
            disabled={!isCreating}
            width="lg"
            rules={[{ required: true }]}
            name={'SUPPLIES_CODE'}
            onSelectedVendor={function (record: any, rowIndex?: any): void {
              setSecectedSingleVendor(record);
            }}
            initialForm={
              selectedSingleVendor?.CODE ||
              initialForm ||
              currentReceiving?.SUPPLIES_CODE
            }
            label={'SUPPLIES CODE'}
          />
          <ProFormText
            disabled={!isCreating}
            name="WAREHOUSE_RECEIVED_AT"
            rules={[{ required: true }]}
            label={`${t('SHIP TO')}`}
            initialValue={'MSQ'}
          ></ProFormText>
        </ProFormGroup>
      </ProForm>

      <Modal
        title=""
        open={openPickViewer}
        width={'90%'}
        onCancel={() => setOpenPickViewer(false)}
        footer={null}
      >
        <div className="h-[82vh]  overflow-hidden">
          <ReceivingTracking
            onDoubleClick={(data) => {
              onReceivingType(form.getFieldValue('type'));
              setCurrentReceiving({
                SUPPLIES_CODE: data?.SUPPLIES_CODE,
                awbReference: data?.AWB_REFERENCE,
                receivingNumber: data?.RECEIVING_NUMBER,
                receivingDate: data?.RECEIVED_DATE,
                receivingTime: data?.RECEIVED_DATE,
                awbNumber: data?.AWB_NUMBER,
                awbDate: data?.AWB_DATE,
                awbType: data?.AWB_TYPE,
                WAREHOUSE_RECEIVED_AT: data?.WAREHOUSE_RECEIVED_AT,
                SUPPLIER_SHORT_NAME: data?.SHORT_NAME,
                SUPPLIER_NAME: data?.NAME,
                SUPPLIER_UNP: data?.UNP,
                IS_RESIDENT: data?.IS_RESIDENT,
                SUPPLIER_ADRESS: data?.ADRESS,
                SUPPLIER_COUNTRY: data?.COUNTRY,
                SUPPLIES_ID: data._id || data.id,
              });
              onCurrentReceiving({
                SUPPLIES_CODE: data?.SUPPLIES_CODE,
                awbReference: data?.AWB_REFERENCE,
                receivingNumber: data?.RECEIVING_NUMBER,
                receivingDate: data?.RECEIVED_DATE,
                receivingTime: data?.RECEIVED_DATE,
                awbNumber: data?.AWB_NUMBER,
                awbDate: data?.AWB_DATE,
                awbType: data?.AWB_TYPE,
                WAREHOUSE_RECEIVED_AT: data?.WAREHOUSE_RECEIVED_AT,
                SUPPLIER_SHORT_NAME: data?.SHORT_NAME,
                SUPPLIER_NAME: data?.NAME,
                SUPPLIER_UNP: data?.UNP,
                IS_RESIDENT: data?.IS_RESIDENT,
                SUPPLIER_ADRESS: data?.ADRESS,
                SUPPLIER_COUNTRY: data?.COUNTRY,
                SUPPLIES_ID: data._id || data.id,
              });

              setOpenPickViewer(false);
            }}
          ></ReceivingTracking>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetailsForm;
