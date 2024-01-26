import React, { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ProForm,
  ProFormGroup,
  ProFormText,
  ProFormDatePicker,
} from '@ant-design/pro-components';

type CreateStoreFormType = {
  onPushachceOrderForm?: (data: any) => void;
};

const PushachceOrderForm: FC<CreateStoreFormType> = ({
  onPushachceOrderForm,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<any>({
    contract: '',
    contractDate: '',
    contractLink: '',
    vendor: '',
    adress: '',
    planedDate: '',
    supplier: '',
  });

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prevState: any) => ({ ...prevState, [name]: value }));
  };

  // Использование useEffect для передачи formData в родительский компонент при любом изменении
  useEffect(() => {
    if (onPushachceOrderForm) {
      onPushachceOrderForm(formData);
    }
  }, [formData, onPushachceOrderForm]);

  return (
    <ProForm
      size="small"
      submitter={false}
      className="bg-white px-4 py-3 rounded-md border-gray-400"
      layout="horizontal"
    >
      <ProFormGroup>
        <ProFormText
          name="contract"
          label={t('CONTRACT No')}
          width="sm"
          tooltip={t('CONTRACT')}
          rules={[
            { required: true, message: 'Please input the contract number!' },
          ]}
          fieldProps={{
            onChange: (e) => handleFieldChange('contract', e.target.value),
          }}
        ></ProFormText>
        <ProFormDatePicker
          name="contractDate"
          label={t('CONTRACT DATE')}
          width="sm"
          rules={[
            { required: true, message: 'Please select the contract date!' },
          ]}
          fieldProps={{
            onChange: (date, dateString) =>
              handleFieldChange('contractDate', dateString),
          }}
        ></ProFormDatePicker>
        <ProFormText
          name="contractLink"
          label={t('CONTRACT LINK')}
          width="sm"
          tooltip={t('CONTRACT')}
          rules={[
            { required: true, message: 'Please input the contract link!' },
          ]}
          fieldProps={{
            onChange: (e) => handleFieldChange('contractLink', e.target.value),
          }}
        ></ProFormText>
      </ProFormGroup>
      <ProFormGroup>
        <ProFormText
          name="vendor"
          label={t('VENDOR')}
          width="sm"
          tooltip={t('VENDOR')}
          rules={[{ required: true, message: 'Please input the vendor!' }]}
          fieldProps={{
            onChange: (e) => handleFieldChange('vendor', e.target.value),
          }}
        ></ProFormText>
        <ProFormText
          name="adress"
          label={t('ADRESS')}
          width="sm"
          tooltip={t('ADRESS')}
          rules={[{ required: true, message: 'Please input the address!' }]}
          fieldProps={{
            onChange: (e) => handleFieldChange('adress', e.target.value),
          }}
        ></ProFormText>
        <ProFormText
          name="supplier"
          label={t('SUPPLIER')}
          width="sm"
          tooltip={t('SUPPLIER')}
          rules={[{ required: true, message: 'Please input the SUPPLIER!' }]}
          fieldProps={{
            onChange: (e) => handleFieldChange('supplier', e.target.value),
          }}
        ></ProFormText>
        <ProFormText
          name="shipTo"
          label={t('SHIPTO')}
          width="sm"
          tooltip={t('SHIPTO')}
          rules={[{ required: true, message: 'Please input the SHIPTO!' }]}
          fieldProps={{
            onChange: (e) => handleFieldChange('shipTo', e.target.value),
          }}
        ></ProFormText>
      </ProFormGroup>

      <ProFormDatePicker
        name="planedDate"
        label={t('PLANNED DATE')}
        width="sm"
        rules={[{ required: true, message: 'Please select the planned date!' }]}
        fieldProps={{
          onChange: (date, dateString) =>
            handleFieldChange('planedDate', dateString),
        }}
      ></ProFormDatePicker>
    </ProForm>
  );
};

export default PushachceOrderForm;
