import {
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTimePicker,
} from '@ant-design/pro-components';
import ContextMenuVendorsSearchSelect from '@/components/shared/form/ContextMenuVendorsSearchSelect';

import { FormInstance, RadioChangeEvent, message } from 'antd';
import { Button, Space, Upload } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

import { useAppDispatch } from '@/hooks/useTypedSelector';
import { IOrder } from '@/models/IOrder';
import { IReceiving } from '@/models/IReceiving';
import moment from 'moment';

import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { USER_ID } from '@/utils/api/http';
import { getFilteredOrders, postNewReceiving } from '@/utils/api/thunks';

import ContextMenuReceivingsSearchSelect from '@/components/shared/form/ContextMenuReceivingsSearchSelect';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import { useAddBulkMaterialStoreMutation } from '@/features/storeAdministration/PartsApi'; // Предполагается, что у вас есть такая утилита
import { parseExcelDate } from '@/utils/dateUtils';
type OrderDetailsFormType = {
  order: IOrder | null;
  onReceivingType: (data: any) => void;
  onOrdersSearch?: (data: any) => void;
  onCurrentReceiving: (data: IReceiving | null) => void;
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

  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (order && !currentReceiving) {
      form.setFields([
        { name: 'order', value: order?.orderNumberNew },
        { name: 'SUPPLIES_CODE', value: order?.supplier },
        { name: 'WAREHOUSE_RECEIVED_AT', value: order?.shipTo || 'MSQ' },
      ]);
    }
    if (order && currentReceiving) {
      form.setFields([{ name: 'order', value: order?.orderNumberNew }]);
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
  const [selectedSingleReceiving, setSecectedSingleReceiving] = useState<any>();
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
    setSecectedSingleReceiving({});
  };
  const formRef = useRef<FormInstance>(null);
  const [selectedType, setSelectedType] = useState('UN_ORDER');
  const handleTypeChange = (e: RadioChangeEvent) => {
    setSelectedType(e.target.value);
    onOrdersSearch?.(null);
    // setCurrentReceiving(null);
    onReceivingType(form.getFieldValue('type'));
    // onCurrentReceiving(null);
    // setSecectedSingleReceiving(null);
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

  const [addBulkMaterialStore] = useAddBulkMaterialStoreMutation();

  const [isUploading, setIsUploading] = useState(false);

  const handleExcelUpload = (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const convertedData = jsonData.map((item: any) => {
        const quantity = parseFloat(item.Qty);
        return {
          COMPANY_ID: localStorage.getItem('companyID') || '',
          ORDER_NUMBER: item['Works Order'],
          PART_NUMBER: item['Part Number'],
          NAME_OF_MATERIAL: item['Description'],
          GROUP: item['Stock Group'],
          QUANTITY: quantity > 0 ? quantity : undefined,
          LOCAL_ID: parseFloat(item['Batch Number']),
          SERIAL_NUMBER: item['Serial No'],
          CONDITION: item['Condition Release Type'],
          APPROVED_CERT: item['Approved Cert'],
          UNIT_OF_MEASURE: item['Unit Of Measure'],
          RECEIVED_DATE: parseExcelDate(item['Goods Received Date']),
          PRODUCT_EXPIRATION_DATE: parseExcelDate(item['Shelf Life Date']),
          WAREHOUSE_RECEIVED_AT: item['Warehouse Code'],
          Unit_Local_Value: parseFloat(item['Unit Price In Local']),
          Unit_Currency_Value: parseFloat(item['Unit Price In Currency']),
          Total_Local_Value: parseFloat(item['Total Cost In Local']),
          BATCH: item['Batch Notes']
            ? item['Batch Notes'].split(':')[1]
            : undefined,
          AWB_REFERENCE: item['AWB Reference'],
          CURRENCY: item['Currency Code'],
          TYPE:
            item['Part Type'] === 'C'
              ? 'CONSUMABLE'
              : item['Part Type'] === 'R'
              ? 'ROTABLE'
              : item['Part Type'],
          OWNER: item['Batch / Unit Owner'],
          SUPPLIER_BATCH_NUMBER: item['Suppliers Batch number'],
          STOCK: item['Warehouse Code'],
          SHELF_NUMBER: item['Bin Location'],
        };
      });

      addBulkMaterialStore(convertedData)
        .unwrap()
        .then(() => {
          message.success(t('EXCEL DATA SUCCESSFULLY UPLOADED'));
        })
        .catch((error) => {
          message.error(t('ERROR UPLOADING EXCEL DATA'));
          console.error('Error uploading Excel data:', error);
        })
        .finally(() => {
          setIsUploading(false);
        });
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent default upload behavior
  };

  return (
    <div className="flex flex-col">
      <ProForm
        size="small"
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
            setCurrentReceiving((await result).payload || null);
            onCurrentReceiving((await result).payload || null);
            onReceivingType(form.getFieldValue('type'));
            setIsCreating(false);
          } else {
            message.error('Error');
          }
        }}
        initialValues={{ type: 'UN_ORDER' }}
        formRef={formRef}
        submitter={{
          submitButtonProps: {
            disabled:
              !!(
                currentReceiving && Object.keys(currentReceiving).length === 0
              ) || !selectedSingleVendor?.CODE,
          },
          render: (_, dom) => (
            <PermissionGuard
              requiredPermissions={[Permission.PICKSLIP_CONFIRMATION_ACTIONS]}
            >
              <div className="flex gap-1">
                {isCreating
                  ? [
                      ...dom,
                      <Button
                        key="cancel"
                        onClick={() => {
                          isCreating && setIsCreating(false);
                          onCurrentReceiving(null);
                        }}
                      >
                        {t('Cancel')}
                      </Button>,
                    ]
                  : []}
              </div>
            </PermissionGuard>
          ),
        }}
        onReset={() => {
          setinitialForm('');
          setSecectedSingleVendor({ CODE: '' });
          selectedSingleReceiving({ receivingNumber: '' });
        }}
        form={form}
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
              <ProFormText
                label={t('ORDER No')}
                name="order"
                width="sm"
                tooltip={t('ORDER')}
                fieldProps={{
                  // onKeyPress: handleKeyPress,
                  autoFocus: true,
                }}
              />
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
              </Space>
            </ProFormGroup>
            <ContextMenuReceivingsSearchSelect
              rules={[{ required: false }]}
              disabled={isCreating}
              name={'receiving'}
              onSelectedReceiving={function (receiving: any): void {
                setSecectedSingleReceiving(receiving);
                onCurrentReceiving(receiving);
                setCurrentReceiving(receiving);
                onReceivingType(form.getFieldValue('type'));
              }}
              initialForm={
                selectedSingleReceiving?.receivingNumber ||
                initialForm ||
                currentReceiving?.receivingNumber
              }
              width={'sm'}
              label={t('RECEIVING No')}
            />

            <ProFormDatePicker
              disabled={!isCreating}
              rules={[{ required: true }]}
              name="receivingDate"
              label={t('RECEIVING DATE')}
              width="sm"
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
                АПП: t('АКТ ПРИ��МО-ПЕРЕДАЧИ'),
              }}
              width="sm"
              tooltip={t('DOC TYPE')}
            ></ProFormSelect>
            <ProFormText
              disabled={!isCreating}
              name="awbNumber"
              label={t('DOC No')}
              rules={[{ required: true }]}
              width="sm"
              tooltip={t(' DOC NNUMBER')}
            ></ProFormText>
            <ProFormDatePicker
              disabled={!isCreating}
              name="awbDate"
              label={t('DOC DATE')}
              rules={[{ required: true }]}
              width="sm"
            ></ProFormDatePicker>
          </ProFormGroup>
        </Space>
        <ProFormGroup>
          <ProFormText
            disabled={!isCreating}
            name="awbReference"
            label={t('CONTRACT')}
            width="sm"
            tooltip={t('CONTRACT')}
          ></ProFormText>
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
            label={t('SUPPLIES CODE')}
          />
          <ProFormText
            disabled={!isCreating}
            name="WAREHOUSE_RECEIVED_AT"
            rules={[{ required: true }]}
            label={`${t('SHIP TO')}`}
            initialValue={'MSQ'}
          ></ProFormText>
        </ProFormGroup>
        <ProFormGroup>
          <Upload
            accept=".xlsx,.xls"
            beforeUpload={handleExcelUpload}
            showUploadList={false}
          >
            <Button
              size="small"
              icon={isUploading ? <LoadingOutlined /> : <UploadOutlined />}
              disabled={isUploading}
            >
              {isUploading ? t('UPLOADING...') : t('UPLOAD EXCEL')}
            </Button>
          </Upload>
        </ProFormGroup>
      </ProForm>
    </div>
  );
};

export default OrderDetailsForm;
