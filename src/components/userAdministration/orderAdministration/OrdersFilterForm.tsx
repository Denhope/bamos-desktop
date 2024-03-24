//ts-nocheck

import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
import {
  ProForm,
  ProFormCheckbox,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { DatePickerProps, Form, FormInstance, message } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';

import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type RequirementsFilteredFormType = {
  onRequirementsSearch: (values: any) => void;
  nonCalculate?: boolean;
  foForecact?: boolean;
};
const OrdersFilteredForm: FC<RequirementsFilteredFormType> = ({
  onRequirementsSearch,
  nonCalculate,
  foForecact,
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

  const { t } = useTranslation();
  const currentCompanyID = localStorage.getItem('companyID');

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
        isAlternatine: isAltertative,
        orderNumber: form.getFieldValue('orderNumber'),

        includeAlternative: isAltertative,
      };

      onRequirementsSearch(searchParams);
    } catch (error) {
      message.error('Failed to fetch requirements');
    }
  };
  return (
    <ProForm
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
      <ProForm.Group>
        <ProFormText
          name="orderNumber"
          label={`${t('ORDER No')}`}
          width="lg"
          fieldProps={{
            onKeyPress: handleKeyPress,
          }}
        />
        <ProForm.Group>
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
        </ProForm.Group>
        <ProFormText
          name="serialNumber"
          label={t('SERIAL No')}
          width="lg"
          tooltip={t('SERIAL No')}
          fieldProps={{
            // onDoubleClick: () => setOpenPickViewer(true),
            onKeyPress: handleKeyPress,
            autoFocus: true,
          }}
        ></ProFormText>
      </ProForm.Group>

      <ProFormSelect
        showSearch
        mode="multiple"
        name="orderType"
        label={t('ORDER TYPE')}
        width="lg"
        // initialValue={['PURCHASE_ORDER']}
        tooltip={t('ORDER TYPE')}
        valueEnum={{
          QUOTATION_ORDER: t('QUATATION ORDER'),
          PURCHASE_ORDER: t('PURCHASE ORDER'),
          REPAIR_ORDER: t('REPAIR ORDER'),
          // CUSTOMER_REPAIR_ORDER: t('CUSTOMER REPAIR ORDER'),
          // WARRANTY_ORDER: t('WARRANTY ORDER'),
          // EXCHANGE_ORDER: t('EXCHANGE ORDER'),
          // TRANSFER_ORDER: t('TRANSFER ORDER'),
        }}
      />

      <ProFormSelect
        initialValue={['open']}
        mode="multiple"
        name="state"
        label={`${t('ORDER STATUS')}`}
        width="lg"
        options={[
          { value: 'planned', label: t('PLANNED') },
          { value: 'open', label: t('NEW') },
          { value: 'closed', label: t('CLOSED') },
          { value: 'canceled', label: t('CANCELED') },
          { value: 'onOrder', label: t('ISSUED') },
          { value: 'transfer', label: t('TRANSFER') },
        ]}
      />

      <ProFormDateRangePicker
        name="plannedDate"
        label={`${t('PLANNED DATE')}`}
        width="lg"
        tooltip="PLANNED DATE"
        fieldProps={{
          onChange: onChange,
        }}
      />
    </ProForm>
  );
};

export default OrdersFilteredForm;
