// @ts-nocheck

import {
  ProForm,
  ProFormDatePicker,
  ProFormSelect,
} from '@ant-design/pro-components';
import { OrderType } from '@/models/IOrder';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

type CreateStoreFormType = {
  onOrderDetailsChange: (orderType: OrderType, orderCreateDate: string) => void;
};

const OrderCreatorForm: FC<CreateStoreFormType> = ({
  onOrderDetailsChange,
}) => {
  const { t } = useTranslation();
  const [orderType, setOrderType] = useState<OrderType>('PURCHASE_ORDER');
  const [orderCreateDate, setOrderCreateDate] = useState('');

  const handleOrderTypeChange = (value: OrderType) => {
    setOrderType(value);
    onOrderDetailsChange(value, orderCreateDate);
  };

  const handleOrderCreateDateChange = (value: any, dateString: string) => {
    setOrderCreateDate(dateString);
    onOrderDetailsChange(orderType, dateString);
  };

  return (
    <ProForm
      size="small"
      submitter={false}
      className="bg-white px-4 py-3 rounded-md border-gray-400"
    >
      <ProFormSelect
        initialValue={orderType}
        showSearch
        name="orderType"
        label={t('ORDER TYPE')}
        width="sm"
        tooltip={t('ORDER TYPE')}
        valueEnum={{
          PURCHASE_ORDER: t('PURCHASE ORDER'),
          TRANSFER_ORDER: t('TRANSFER ORDER'),
          QUATATION_ORDER: t('QUATATION ORDER'),
        }}
        fieldProps={{ onChange: handleOrderTypeChange }}
      />
      <ProFormDatePicker
        name="orderCreateDate"
        label={t('ORDER DATE')}
        width="sm"
        fieldProps={{ onChange: handleOrderCreateDateChange }}
      ></ProFormDatePicker>
    </ProForm>
  );
};

export default OrderCreatorForm;
