import {
  FormInstance,
  ProForm,
  ProFormDateRangePicker,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormCheckbox,
} from '@ant-design/pro-components';
import { DatePickerProps, Form, message } from 'antd';
import { useAppDispatch } from '@/hooks/useTypedSelector';

import React, { FC, useEffect, useRef, useState } from 'react';

import {
  getFilteredOrders,
  getFilteredOrdersParts,
  getFilteredReceivingItems,
} from '@/utils/api/thunks';

import { RangePickerProps } from 'antd/es/date-picker';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
import ContextMenuStoreSearchSelect from '@/components/shared/form/ContextMenuStoreSearchSelect';
import ContextMenuLocationSearchSelect from '@/components/shared/form/ContextMenuLocationSearchSelect';
import ContextMenuReceivingsSearchSelect from '@/components/shared/form/ContextMenuReceivingsSearchSelect';
import ContextMenuVendorsSearchSelect from '@/components/shared/form/ContextMenuVendorsSearchSelect';
type ReceivingItemsFilterFormType = {
  onReceivingSearch: (orders: any[] | []) => void;
};
const OrdersItemsFilterorm: FC<ReceivingItemsFilterFormType> = ({
  onReceivingSearch,
}) => {
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const [isOnlyReturn, setIsOnlyReturn] = useState<any>(false);
  const [isOnlyCancelled, setIsOnlyCancelled] = useState<any>(false);
  const dispatch = useAppDispatch();

  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();

  const [selectedSingleLocation, setSecectedSingleLocation] =
    useState<any>(null);
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const [selectedSingleStore, setSecectedSingleStore] = useState<any>(null);

  const [selectedSingleVendor, setSecectedSingleVendor] = useState<any>();
  const [LOCATION, setLOCATION] = useState([]); //

  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const [initialForm, setinitialForm] = useState<any>('');
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };

  useEffect(() => {
    if (selectedSingleStore) {
      const transformedData = selectedSingleStore?.locations.map(
        (item: any) => ({
          ...item,
          APNNBR: item.locationName,
        })
      );

      setLOCATION(transformedData);
    }
  }, [selectedSingleStore]);

  return (
    <>
      <ProForm
        initialValues={{
          receivingDate: [moment().subtract(1, 'months'), moment()],
        }}
        onReset={() => {
          setIsResetForm(true);

          setTimeout(() => {
            setIsResetForm(false);
          }, 0);
          setinitialForm('');
          setSecectedSinglePN(null);
          setSelectedEndDate(null);
          setSelectedStartDate(null);
        }}
        onFinish={async (values: any) => {
          if (null) {
            message.error('Some fields are empty');
          } else {
            const currentCompanyID = localStorage.getItem('companyID') || '';
            const result = dispatch(
              getFilteredOrdersParts({
                companyID: currentCompanyID,
                orderNumber: form.getFieldValue('orderNumber'),
                vendorName: selectedSingleVendor?.CODE,
                partNumber: selectedSinglePN?.PART_NUMBER,
                orderType: form.getFieldValue('orderType'),
                serialNumber: form.getFieldValue('serialNumber'),
                batchNumber: form.getFieldValue('batchNumber'),
                receiningNumber: selectedSinglePN?.receivingNumber,
                receiningItemNumber: form.getFieldValue('receiningItemNumber'),
                store: selectedSingleStore?.shopShortName,
                station: form.getFieldValue('station'),
                partGroup: form.getFieldValue('partGroup'),
                partType: form.getFieldValue('partType'),
                location: selectedSingleLocation?.locationName,
                createBySing: form.getFieldValue('createBySing'),
                label: form.getFieldValue('label'),
                startDate: selectedStartDate,
                endDate: selectedEndDate,
                state: form.getFieldValue('orderState'),
              })
            );
            if ((await result).meta.requestStatus === 'fulfilled') {
              onReceivingSearch((await result).payload || []);
            } else {
              message.error('Error');
            }
          }
        }}
        layout="horizontal"
        formRef={formRef}
        size="small"
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        form={form}
      >
        <ProFormGroup>
          <ProFormGroup direction="vertical" size={'small'}>
            <ProFormText
              name="orderNumber"
              label={`${t('ORDER No')}`}
              width="sm"
              tooltip="ORDER NUMBER"
              fieldProps={{
                onKeyPress: handleKeyPress,
                autoFocus: true,
              }}
            />
            <ContextMenuPNSearchSelect
              label={t('PART No')}
              isResetForm={isResetForm}
              rules={[{ required: false }]}
              onSelectedPN={function (PN: any): void {
                setSecectedSinglePN(PN);
              }}
              name={'partNumber'}
              initialFormPN={selectedSinglePN?.PART_NUMBER || initialForm}
              width={'sm'}
            ></ContextMenuPNSearchSelect>
            <ProFormText
              name="serialNumber"
              label={t('SERIAL No')}
              width="sm"
              tooltip={t('SERIAL No')}
              fieldProps={{
                onKeyPress: handleKeyPress,
                autoFocus: true,
              }}
            ></ProFormText>
          </ProFormGroup>
          <ProFormGroup direction="vertical" size={'small'}>
            {/* <ContextMenuReceivingsSearchSelect
              rules={[{ required: false }]}
              isResetForm={isResetForm}
              name={'receiving'}
              onSelectedReceiving={function (receiving: any): void {
                setSecectedSinglePN(receiving);
              }}
              initialForm={selectedSinglePN?.receivingNumber || initialForm}
              width={'sm'}
              label={t('RECEIVING No')}
            /> */}

            {/* <ProFormText
              name="receiningItemNumber"
              label={`${t('RECEIVING ITEM No')}`}
              width="sm"
              tooltip="RECEIVING ITEM NUMBER"
              fieldProps={{
                onKeyPress: handleKeyPress,
                autoFocus: true,
              }}
            /> */}
            <ProFormSelect
              showSearch
              mode="multiple"
              name="orderType"
              label={t('ORDER TYPE')}
              width="sm"
              tooltip={t('ORDER TYPE')}
              valueEnum={{
                // SB_ORDER: t('SB ORDER'),
                // CUSTOMER_LOAN_ORDER: t('CUSTOMER LOAN ORDER'),
                // CUSTOMER_PROVISION_ORDER: t('CUSTOMER PROVISION ORDER'),
                // CONTRACT_RE_ORDER: t('CONTRACT RE ORDER'),
                // INCOMING_REQUEST_ORDER: t('INCOMING REQUEST ORDER'),
                // INCOMING_REQUEST_IN_ADVANCE_ORDER: t(
                //   'INCOMING REQUEST IN ADVANCE ORDER'
                // ),
                // LOAN_ORDER: t('LOAN ORDER'),
                // MATERIAL_PRODUCTION_ORDER: t('MATERIAL PRODUCTION ORDER'),
                // OUTGOING_REQUEST_ORDER: t('OUTGOING REQUEST ORDER'),
                // OUTGOING_REQUEST_IN_ADVANCE_ORDER: t(
                //   'OUTGOING REQUEST IN ADVANCE ORDER'
                // ),
                PURCHASE_ORDER: t('PURCHASE ORDER'),
                QUOTATION_ORDER: t('QUATATION ORDER'),
                // POOL_REQUEST_ORDER: t('POOL REQUEST ORDER'),
                // POOL_REQUEST_EXCHANGE_ORDER: t('POOL REQUEST EXCHANGE ORDER'),
                REPAIR_ORDER: t('REPAIR ORDER'),
                CUSTOMER_REPAIR_ORDER: t('CUSTOMER REPAIR ORDER'),
                // CONSIGNMENT_STOCK_INCOMING_ORDER: t(
                //   'CONSIGNMENT STOCK INCOMING ORDER'
                // ),
                // CONSIGNMENT_STOCK_PURCHASE_ORDER: t(
                //   'CONSIGNMENT STOCK PURCHASE ORDER'
                // ),
                WARRANTY_ORDER: t('WARRANTY ORDER'),
                EXCHANGE_ORDER: t('EXCHANGE ORDER'),
                // EXCHANGE_IN_ADVANCE_ORDER: t('EXCHANGE IN ADVANCE ORDER'),
                TRANSFER_ORDER: t('TRANSFER ORDER'),
              }}
            />
            <ProFormDateRangePicker
              name="receivingDate"
              label={`${t('CREATE DATE')}`}
              width="sm"
              tooltip="CREATE DATE"
              fieldProps={{
                onChange: onChange,
              }}
            />
            <ProFormText
              name="batchNumber"
              label={t('BATCH No')}
              width="sm"
              tooltip={t('BATCH No')}
              fieldProps={{
                onKeyPress: handleKeyPress,
                autoFocus: true,
              }}
            ></ProFormText>
          </ProFormGroup>
          <ProFormGroup direction="vertical" size={'small'}>
            <ContextMenuVendorsSearchSelect
              isResetForm={isResetForm}
              width="sm"
              rules={[{ required: false }]}
              name={'vendorName'}
              onSelectedVendor={function (record: any, rowIndex?: any): void {
                setSecectedSingleVendor(record);
              }}
              initialForm={selectedSingleVendor?.CODE || initialForm}
              label={t('VENDOR')}
            />

            <ProFormSelect
              showSearch
              mode="multiple"
              name="orderState"
              label={t('ORDER STATUS')}
              width="sm"
              tooltip={t('ORDER STATUS')}
              // initialValue={['PARTLY_RECEIVED', 'OPEN']}
              valueEnum={{
                PARTLY_RECEIVED: {
                  text: t('PARTLY_RECEIVED'),
                  status: 'Processing',
                },
                RECEIVED: {
                  text: t('RECEIVED'),
                  status: 'SUCCESS',
                },
                // ARRIVED: { text: t('ARRIVED'), status: 'Default' },
                CLOSED: { text: t('CLOSED'), status: 'SUCCESS' },
                // MISSING: { text: t('MISSING'), status: 'Error' },
                OPEN: { text: t('OPEN'), status: 'Processing' },
                // OPEN_AND_TRANSFER: {
                //   text: t('OPEN AND TRANSFER'),
                //   status: 'Processing',
                // },
                // PARTLY_ARRIVED: { text: t('PARTLY ARRIVED'), status: 'Processing' },
                // PARTLY_MISSING: { text: t('PARTLY MISSING'), status: 'Error' },
                // PARTLY_SENT: { text: t('PARTLY SENT'), status: 'Processing' },
                // READY: { text: t('READY'), status: 'SUCCESS' },
                // PARTLY_READY: { text: t('PARTLY READY'), status: 'Processing' },
                // SENT: { text: t('SENT'), status: 'Processing' },
                TRANSFER: { text: t('TRANSFER'), status: 'Processing' },
                DRAFT: { text: t('DRAFT'), status: 'Error' },
                // UNKNOWN: { text: t('UNKNOWN'), status: 'Error' },
              }}
            />
            {/* <ContextMenuStoreSearchSelect
              rules={[{ required: false }]}
              isResetForm={isResetForm}
              name={'store'}
              width={'sm'}
              onSelectedStore={function (record: any): void {
                setSecectedSingleStore(record);
                // setSecectedStore(record);
              }}
              initialFormStore={
                selectedSingleStore?.shopShortName || initialForm
              }
            /> */}
            {/* <ProFormText
              name="label"
              label={`${t('LABEL')}`}
              width="sm"
              tooltip={`${t('LABEL CODE')}`}
              fieldProps={{
                autoFocus: true,
                onKeyPress: handleKeyPress,
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase().trim();
                },
              }}
            /> */}
          </ProFormGroup>
          <ProFormGroup direction="vertical" size={'small'}>
            <ProFormSelect
              mode="multiple"
              name="partGroup"
              label={`${t('PART GROUP')}`}
              width="sm"
              tooltip={`${t('SELECT SPECIAL GROUP')}`}
              options={[
                { value: 'CONS', label: t('CONS') },
                { value: 'TOOL', label: t('TOOL') },
                { value: 'CHEM', label: t('CHEM') },
                { value: 'ROT', label: t('ROT') },
                { value: 'GSE', label: t('GSE') },
              ]}
            />
            <ProFormSelect
              mode="multiple"
              name="partType"
              label={`${t('PART TYPE')}`}
              width="sm"
              tooltip={`${t('SELECT PART TYPE')}`}
              options={[
                { value: 'ROTABLE', label: t('ROTABLE') },
                { value: 'CONSUMABLE', label: t('CONSUMABLE') },
              ]}
            />
            {/* <ContextMenuLocationSearchSelect
              rules={[{ required: false }]}
              isResetForm={isResetForm}
              width={'sm'}
              name={'location'}
              onSelectedLocation={function (record: any): void {
                setSecectedSingleLocation(record);
              }}
              initialFormStore={
                selectedSingleLocation?.locationName || initialForm
              }
              locations={LOCATION}
            /> */}
            <ProFormText
              name="createBySing"
              label={`${t('CREATED BY')}`}
              width="sm"
              tooltip={`${t('CREATED BY')}`}
              fieldProps={{
                onKeyPress: handleKeyPress,
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase().trim();
                },
              }}
            />
          </ProFormGroup>
          <ProFormGroup direction="vertical" size={'small'}>
            {/* <ProFormCheckbox.Group
              className="my-0 py-0"
              //initialValue={['false']}
              labelAlign="left"
              name="isAllDAte"
              fieldProps={{
                onChange: (value: any) => setIsOnlyReturn(value),
              }}
              options={[{ label: `${t('ONLY RETURNED')}`, value: 'true' }].map(
                (option) => ({
                  ...option,
                  style: { display: 'flex', flexWrap: 'wrap' }, // Добавьте эту строку
                })
              )}
            /> */}
            {/* <ProFormCheckbox.Group
              className="my-0 py-0"
              labelAlign="left"
              name="isAllCANCELLED"
              fieldProps={{
                onChange: (value: any) => setIsOnlyCancelled(value),
              }}
              options={[{ label: `${t('ONLY CANCELLED')}`, value: 'true' }].map(
                (option) => ({
                  ...option,
                  style: { display: 'flex', flexWrap: 'wrap' },
                })
              )}
            /> */}
          </ProFormGroup>
        </ProFormGroup>
      </ProForm>
    </>
  );
};

export default OrdersItemsFilterorm;
