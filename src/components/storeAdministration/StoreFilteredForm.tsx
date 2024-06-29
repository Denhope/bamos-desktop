// @ts-nocheck

import {
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { DatePickerProps, Form, FormInstance, message } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';

import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetGroupUsersQuery } from '@/features/userAdministration/userApi';
import { useGetProjectTypesQuery } from '../projectTypeAdministration/projectTypeApi';
import { useGetProjectsQuery } from '@/features/projectAdministration/projectsApi';
import { useGetCompaniesQuery } from '@/features/companyAdministration/companyApi';

type RequirementsFilteredFormType = {
  onProjectSearch: (values: any) => void;
};
const StoreFilteredForm: FC<RequirementsFilteredFormType> = ({
  onProjectSearch,
}) => {
  const formRef = useRef<FormInstance>(null);
  const [form] = Form.useForm();

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };

  const { t } = useTranslation();

  const onFinish = async (values: any) => {
    try {
      const searchParams = {
        status: form.getFieldValue('status') || 'ACTIVE',
        storeShortName: form.getFieldValue('storeShortName'),
        ownerID: form.getFieldValue('ownerID'),
        stationID: form.getFieldValue('stationID'),
      };

      onProjectSearch(searchParams);
    } catch (error) {
      message.error('Failed to fetch requirements');
    }
  };
  const { data: companies, isLoading } = useGetCompaniesQuery({});
  const companiesCodesValueEnum: Record<string, string> =
    companies?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.companyName;
      return acc;
    }, {}) || {};
  return (
    <ProForm
      formRef={formRef}
      onValuesChange={(changedValues, allValues) => {
        // Handle changes in the form
      }}
      layout="horizontal"
      size="small"
      form={form}
      onFinish={onFinish}
    >
      <ProFormText
        name="storeShortName"
        label={`${t('STORE NAME')}`}
        width="lg"
        fieldProps={{
          onKeyPress: handleKeyPress,
        }}
      />

      <ProFormSelect
        showSearch
        mode={'multiple'}
        // rules={[{ required: true }]}
        name="stationID"
        label={t('STATION')}
        width="lg"
        // valueEnum={companiesCodesValueEnum || []}
        // disabled={!projectId}
      />
      <ProFormSelect
        showSearch
        mode={'multiple'}
        // rules={[{ required: true }]}
        name="ownerID"
        label={t('OWNER')}
        width="lg"
        valueEnum={companiesCodesValueEnum || []}
        // disabled={!projectId}
      />
      <ProFormSelect
        mode="multiple"
        name="status"
        label={`${t('STORE STATE')}`}
        width="lg"
        valueEnum={{
          ACTIVE: { text: t('ACTIVE') },
          INACTIVE: { text: t('INACTIVE') },
        }}
      />
    </ProForm>
  );
};

export default StoreFilteredForm;
