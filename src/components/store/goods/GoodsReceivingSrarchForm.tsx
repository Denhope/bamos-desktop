import {
  ModalForm,
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, FormInstance, message } from 'antd';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { IOrder } from '@/models/IOrder';
import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFilteredOrders } from '@/utils/api/thunks';

import ContextMenuVendorsSearchSelect from '@/components/shared/form/ContextMenuVendorsSearchSelect';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
type GoodsReceivingSrarchFormType = {
  onOrdersSearch: (orders: IOrder[] | []) => void;
};

const GoodsReceivingSrarchForm: FC<GoodsReceivingSrarchFormType> = ({
  onOrdersSearch,
}) => {
  const [subZone, setZone] = useState('');

  const [subUnit, setUnit] = useState('');
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [selectedSingleVendor, setSecectedSingleVendor] = useState<any>();
  const [selectedSingleCustomer, setSecectedSingleCustomer] = useState<any>();
  const handleAreaChange = (value: string) => {
    setZone(value);
    setUnit(value);
  };
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const formRef = useRef<FormInstance>(null);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const [initialForm, setinitialForm] = useState<any>('');
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  return (
    <div>
      <ProForm
        onReset={() => {
          setIsResetForm(true);
          setTimeout(() => {
            setIsResetForm(false);
          }, 0);
          setinitialForm('');
          setSecectedSinglePN(null);
          setSecectedSingleVendor({ vendorName: '' });
          // setSecectedSingleLocation({ locationName: '' });
        }}
        formRef={formRef}
        form={form}
        onFinish={async (values: any) => {
          if (null) {
            message.error('Some fields are empty');
          } else {
            const currentCompanyID = localStorage.getItem('companyID') || '';
            const result = dispatch(
              getFilteredOrders({
                companyID: currentCompanyID,
                orderNumber: form.getFieldValue('order'),
                vendorName: selectedSingleVendor?.CODE,
                partNumber: selectedSinglePN?.PART_NUMBER,
                orderType: form.getFieldValue('orderType'),
                state: form.getFieldValue('orderState'),
                customer: selectedSingleCustomer?.CODE,
              })
            );
            if ((await result).meta.requestStatus === 'fulfilled') {
              onOrdersSearch((await result).payload || []);
            } else {
              message.error('Error');
            }
            // onSelectLocation(selectedLocation);
            // onFilterTransferParts(selectedFeatchStore);
          }
        }}
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        size="small"
        layout="horizontal"
        // labelCol={{ span: 8 }}
      >
        <ProFormText
          name="order"
          label={t('ORDER No')}
          width="sm"
          tooltip={t('ORDER No')}
          fieldProps={{
            // onDoubleClick: () => setOpenPickViewer(true),
            onKeyPress: handleKeyPress,
            autoFocus: true,
          }}
        ></ProFormText>
        <ContextMenuPNSearchSelect
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
            // onDoubleClick: () => setOpenPickViewer(true),
            onKeyPress: handleKeyPress,
            autoFocus: true,
          }}
        ></ProFormText>
        <ProFormSelect
          showSearch
          name="orderType"
          label={t('ORDER TYPE')}
          width="sm"
          initialValue={['PURCHASE_ORDER']}
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
            QUOTATION_ORDER: t('QUATATION ORDER'),
            PURCHASE_ORDER: t('PURCHASE ORDER'),
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

        <ContextMenuVendorsSearchSelect
          width="sm"
          rules={[{ required: false }]}
          name={'vendorName'}
          onSelectedVendor={function (record: any, rowIndex?: any): void {
            setSecectedSingleVendor(record);
          }}
          initialForm={selectedSingleVendor?.CODE || initialForm}
          label={t('VENDOR')}
        />
        {/* <ContextMenuVendorsSearchSelect
          width="sm"
          rules={[{ required: false }]}
          name={'customer'}
          onSelectedVendor={function (record: any, rowIndex?: any): void {
            setOpenVendorFind(false);
            setSecectedSingleCustomer(record);
          }}
          initialForm={selectedSingleCustomer?.CODE || initialForm}
          label={t('CUSTOMER')}
        /> */}

        <ProFormSelect
          showSearch
          mode="multiple"
          name="orderState"
          label={t('ORDER STATE')}
          width="sm"
          tooltip={t('ORDER STATE')}
          // initialValue={['PARTLY_RECEIVED', 'OPEN']}
          valueEnum={{
            PARTLY_RECEIVED: {
              text: t('PARTLY_RECEIVED'),
              status: 'Processing',
            },
            RECEIVED: {
              text: t('RECEIVED'),
              status: 'Success',
            },
            // ARRIVED: { text: t('ARRIVED'), status: 'Default' },
            CLOSED: { text: t('CLOSED'), status: 'Success' },
            // MISSING: { text: t('MISSING'), status: 'Error' },
            OPEN: { text: t('OPEN'), status: 'Processing' },
            // OPEN_AND_TRANSFER: {
            //   text: t('OPEN AND TRANSFER'),
            //   status: 'Processing',
            // },
            // PARTLY_ARRIVED: { text: t('PARTLY ARRIVED'), status: 'Processing' },
            // PARTLY_MISSING: { text: t('PARTLY MISSING'), status: 'Error' },
            // PARTLY_SENT: { text: t('PARTLY SENT'), status: 'Processing' },
            // READY: { text: t('READY'), status: 'Success' },
            // PARTLY_READY: { text: t('PARTLY READY'), status: 'Processing' },
            // SENT: { text: t('SENT'), status: 'Processing' },
            TRANSFER: { text: t('TRANSFER'), status: 'Processing' },
            DRAFT: { text: t('DRAFT'), status: 'Error' },
            // UNKNOWN: { text: t('UNKNOWN'), status: 'Error' },
          }}
        />
      </ProForm>
    </div>
  );
};

export default GoodsReceivingSrarchForm;
