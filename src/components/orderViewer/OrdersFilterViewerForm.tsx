//@ts-nocheck
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
import {
  ProForm,
  ProFormCheckbox,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import {
  Button,
  Col,
  DatePickerProps,
  Form,
  FormInstance,
  Row,
  message,
} from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';

import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetVendorsQuery } from '@/features/vendorAdministration/vendorApi';

type RequirementsFilteredFormType = {
  onOrderItemsFilterSearch: (values: any) => void;
  loding: boolean;
};
const OrdersFilterViewerForm: FC<RequirementsFilteredFormType> = ({
  onOrderItemsFilterSearch,
  loding,
}) => {
  const formRef = useRef<FormInstance>(null);
  const [form] = Form.useForm();

  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };

  interface Option {
    value: string;
    label: string;
  }
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };

  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [initialForm, setinitialForm] = useState<any>('');
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const { data: vendors } = useGetVendorsQuery({});
  const { t } = useTranslation();
  const currentCompanyID = localStorage.getItem('companyID');
  const vendorValueEnum: Record<string, string> =
    vendors?.reduce((acc, vendor) => {
      acc[vendor.id] = String(vendor.CODE).toUpperCase();
      return acc;
    }, {}) || {};
  const [isAltertative, setIsAltertative] = useState<any>(true);

  const onFinish = async (values: any) => {
    try {
      const searchParams = {
        startDate: selectedStartDate,
        state: form.getFieldValue('state'),
        partRequestNumber: form.getFieldValue('partRequestNumber'),
        orderType: form.getFieldValue('orderType'),
        partNumberID: selectedSinglePN?._id || selectedSinglePN?.id,
        endDate: selectedEndDate,
        companyID: currentCompanyID || '',
        orderNumberNew: form.getFieldValue('orderNumber'),
        includeAlternative: isAltertative,
        vendorID: form.getFieldValue('vendorID') || '',
        group: form.getFieldValue('partGroup'),
        type: form.getFieldValue('partType'),
      };

      onOrderItemsFilterSearch(searchParams);
    } catch (error) {
      message.error('Failed to fetch requirements');
    }
  };
  return (
    <ProForm
      loading={loding}
      formRef={formRef}
      layout="horizontal"
      size="small"
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
      form={form}
      onFinish={onFinish}
    >
      <ProForm.Group direction="horizontal">
        <ProFormText
          name="orderNumber"
          label={`${t('ORDER No')}`}
          width="sm"
          fieldProps={{
            onKeyPress: handleKeyPress,
          }}
        />

        <ContextMenuPNSearchSelect
          isResetForm={isResetForm}
          rules={[{ required: false }]}
          onSelectedPN={function (PN: any): void {
            setSecectedSinglePN(PN);
          }}
          name={'partNumber'}
          initialFormPN={selectedSinglePN?.PART_NUMBER || initialForm}
          width={'lg'}
          label={t('PART No')}
        ></ContextMenuPNSearchSelect>
        <ProFormCheckbox.Group
          className="my-0 py-0"
          disabled={!selectedSinglePN?.PART_NUMBER}
          initialValue={['true']}
          labelAlign="left"
          name="isAlternative"
          fieldProps={{
            onChange: (value) => setIsAltertative(value),
          }}
          options={[{ label: `${t('ALTERNATIVES')}`, value: 'true' }].map(
            (option) => ({
              ...option,
              style: { display: 'flex', flexWrap: 'wrap' }, // Добавьте эту строку
            })
          )}
        />

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
        <ProFormSelect
          showSearch
          mode="multiple"
          name="orderType"
          initialValue={['QUOTATION_ORDER']}
          label={t('ORDER TYPE')}
          width="sm"
          tooltip={t('ORDER TYPE')}
          valueEnum={{
            QUOTATION_ORDER: t('QUATATION ORDER'),
            PURCHASE_ORDER: t('PURCHASE ORDER'),
            REPAIR_ORDER: t('REPAIR ORDER'),
          }}
        />

        <ProFormSelect
          showSearch
          mode="multiple"
          name="vendorID"
          label={`${t(`VENDORS`)}`}
          width="sm"
          valueEnum={vendorValueEnum}
          onChange={async (value: any) => {
            // setSelectedProjectId(value);
          }}
        />

        <ProFormDateRangePicker
          name="plannedDate"
          label={`${t('PLANNED DATE')}`}
          width="sm"
          tooltip="PLANNED DATE"
          fieldProps={{
            onChange: onChange,
          }}
        />

        <ProFormSelect
          // initialValue={['open']}
          mode="multiple"
          name="state"
          label={`${t('ORDER STATUS')}`}
          width="sm"
          options={[
            { value: 'draft', label: t('DRAFT') },
            { value: 'onQuatation', label: t('QUATATION') },
            { value: 'planned', label: t('PLANNED') },
            { value: 'open', label: t('NEW') },
            { value: 'closed', label: t('CLOSED') },
            { value: 'canceled', label: t('CANCELED') },
            { value: 'transfer', label: t('TRANSFER') },
          ]}
        />
      </ProForm.Group>
    </ProForm>
  );
};

export default OrdersFilterViewerForm;
