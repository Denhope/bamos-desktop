import {
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';
import { useGetCustomerCodesQuery } from '@/features/customerCodeAdministration/customerCodeApi';
import { Button } from 'antd';

export interface ACRegistrationFilterValues {
  _time: any;
  registrationNumber?: string;
  acTypeId?: string;
  customerId?: string;
  serialNumber?: string;
  status?: string[];
}

interface ACRegistrationFilterFormProps {
  onSubmit: (values: ACRegistrationFilterValues) => void;
}

const ACRegistrationFilterForm: FC<ACRegistrationFilterFormProps> = ({
  onSubmit,
}) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();

  const { data: acTypes } = useGetACTypesQuery({});
  const { data: customers } = useGetCustomerCodesQuery({});

  const handleReset = () => {
    form.resetFields();
  };

  return (
    <ProForm
      size="small"
      form={form}
      layout="horizontal"
      onFinish={async (values) => {
        onSubmit({ ...values, _time: Date.now() });
      }}
      submitter={{
        render: () => [
          <Button key="reset" onClick={handleReset}>
            {t('RESET')}
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            htmlType="submit"
          >
            {t('SEARCH')}
          </Button>,
        ],
      }}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          form.submit();
        }
      }}
      initialValues={
        {
          // status: ['ACTIVE'],
        }
      }
    >
      <ProFormText
        name="registrationNumber"
        label={t('REGISTRATION NUMBER')}
        placeholder={t('ENTER REGISTRATION NUMBER')}
      />

      <ProFormSelect
        name="acTypeId"
        label={t('AIRCRAFT TYPE')}
        placeholder={t('SELECT AIRCRAFT TYPE')}
        allowClear
        options={acTypes?.map((type) => ({
          label: type.code,
          value: type.id,
        }))}
      />

      <ProFormSelect
        name="customerId"
        label={t('CUSTOMER CODE')}
        placeholder={t('SELECT CUSTOMER CODE')}
        allowClear
        options={customers?.map((customer) => ({
          label: customer.prefix,
          value: customer.id,
        }))}
      />

      <ProFormText
        name="serialNumber"
        label={t('SERIAL NUMBER')}
        placeholder={t('ENTER SERIAL NUMBER')}
      />

      {/* <ProFormSelect
        name="status"
        label={t('STATUS')}
        placeholder={t('SELECT STATUS')}
        mode="multiple"
        allowClear
        options={[
          { label: t('ACTIVE'), value: 'ACTIVE' },
          { label: t('INACTIVE'), value: 'INACTIVE' },
        ]}
      /> */}
    </ProForm>
  );
};

export default ACRegistrationFilterForm;
