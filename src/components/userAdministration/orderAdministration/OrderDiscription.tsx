import {
  ModalForm,
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Divider, Form, FormInstance, message } from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ordersDiscriptionType = {
  order: any | null;
  onorderSearch?: (orders: any | null) => void;
};

const OrderDiscription: FC<ordersDiscriptionType> = ({
  order,
  onorderSearch,
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const formRef = useRef<FormInstance>(null);
  useEffect(() => {
    if (order) {
      // onSelectSelectedStore && onSelectSelectedStore(selectedStore);
      form.setFields([
        { name: 'orderNumber', value: order?.orderNumberNew },
        { name: 'lastModificateBy', value: order?.updateUserID?.name },
        { name: 'modificationDate', value: order?.updateDate },
        { name: 'createBy', value: order?.createUserID?.name },
        { name: 'createDate', value: order.createDate },
      ]);

      // onFilterTransferprojects(form.getFieldsValue());
    }
  }, [order]);

  return (
    <div className="flex flex-col ">
      <ProForm
        formRef={formRef}
        submitter={false}
        form={form}
        size="small"
        layout="horizontal"
        className="bg-white px-4 py-3 rounded-md border-gray-400"
      >
        <ProFormGroup>
          <ProFormText
            disabled
            label={t('ORDER No')}
            name="orderNumber"
            width="sm"
          ></ProFormText>
          <ProFormText
            disabled
            name="createBy"
            width="sm"
            label={t('CREATE BY')}
          ></ProFormText>
          <ProFormDatePicker
            disabled
            label={t('CREATE DATE')}
            name="createDate"
            width="sm"
          ></ProFormDatePicker>
        </ProFormGroup>
        <ProFormGroup>
          <ProFormText
            disabled
            label={t('LAST MODIFIED BY')}
            name="lastModificateBy"
            width="sm"
          ></ProFormText>

          <ProFormDatePicker
            disabled
            label={t('MODIFICATION DATE')}
            name="modificationDate"
            width="sm"
          ></ProFormDatePicker>
        </ProFormGroup>
      </ProForm>
    </div>
  );
};

export default OrderDiscription;
