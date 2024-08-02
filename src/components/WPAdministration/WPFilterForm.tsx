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
import { useGetCompaniesQuery } from '@/features/companyAdministration/companyApi';
type RequirementsFilteredFormType = {
  onProjectSearch: (values: any) => void;
};
const WPFilterForm: FC<RequirementsFilteredFormType> = ({
  onProjectSearch,
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

  const [reqTypeID, setReqTypeID] = useState<any>('');

  const { t } = useTranslation();
  const { data: companies } = useGetCompaniesQuery({});
  const { data: projectTypes, isLoading } = useGetProjectTypesQuery({});
  const { data: usersGroups } = useGetGroupUsersQuery({});
  const companiesCodesValueEnum: Record<string, string> =
    companies?.reduce<Record<string, string>>((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.companyName;
      return acc;
    }, {}) || {};
  const projectTypesValueEnum: Record<string, string> =
    projectTypes?.reduce((acc, reqType) => {
      acc[reqType.id] = reqType.code;
      return acc;
    }, {}) || {};

  const onFinish = async (values: any) => {
    try {
      const searchParams = {
        startDate: selectedStartDate || '',
        status: form.getFieldValue('status'),
        projectNumber: form.getFieldValue('projectNumber'),
        endDate: selectedEndDate,
        projectTypesID: form.getFieldValue('projectTypesID'),
        projectType: form.getFieldValue('projectType'),
        customerID: form.getFieldValue('customerID'),
        time: new Date(),
      };

      onProjectSearch(searchParams);
    } catch (error) {
      message.error('Failed to fetch requirements');
    }
  };
  return (
    <ProForm
      formRef={formRef}
      onValuesChange={(changedValues, allValues) => {
        // Handle changes in the form
      }}
      layout="horizontal"
      size="small"
      onReset={() => {
        setSelectedEndDate(null);
        setSelectedStartDate(null);
      }}
      form={form}
      onFinish={onFinish}
    >
      <ProForm.Group>
        <ProFormText
          name="projectNumber"
          label={`${t('WP No')}`}
          width="lg"
          fieldProps={{
            onKeyPress: handleKeyPress,
          }}
        />
        <ProForm.Group></ProForm.Group>
      </ProForm.Group>
      {/* <ProFormSelect
        mode={'multiple'}
        showSearch
        name="projectTypesID"
        label={t('PROJECT TYPE')}
        width="lg"
        valueEnum={projectTypesValueEnum}
        onChange={(value: any) => setReqTypeID(value)}
        // disabled={!acTypeID} // Disable the select if acTypeID is not set
      /> */}
      <ProFormSelect
        showSearch
        // disabled={!project}

        name="projectType"
        label={t('WP TYPE')}
        width="lg"
        // initialValue={['baseMaintanance']}
        valueEnum={{
          baseMaintanance: {
            text: t('BASE MAINTENANCE'),
          },
          lineMaintanance: {
            text: t('LINE MAINTENANCE'),
          },

          // PLANNED: { text: t('PLANNED'), status: 'Waiting' },
          repairPart: { text: t('REPAIR COMPONENT') },
          repairAC: { text: t('REPAIR AC') },
          partCange: { text: t('COMPONENT CHANGE') },
          addWork: { text: t('ADD WORK') },
          enginiring: { text: t('ENGINEERING SERVICES') },
          nonProduction: { text: t('NOT PRODUCTION SERVICES') },
          production: { text: t('PRODUCTION PART') },
        }}
      />

      <ProFormSelect
        // initialValue={['OPEN']}
        mode="multiple"
        name="status"
        label={`${t('WP STATUS')}`}
        width="lg"
        valueEnum={{
          DRAFT: { text: t('DRAFT'), status: 'DRAFT' },
          OPEN: { text: t('OPEN'), status: 'Processing' },
          inProgress: { text: t('PROGRESS'), status: 'PROGRESS' },
          // PLANNED: { text: t('PLANNED'), status: 'Waiting' },
          COMPLETED: { text: t('COMPLETED'), status: 'Default' },
          CLOSED: { text: t('CLOSED'), status: 'SUCCESS' },
          CANCELLED: { text: t('CANCELLED'), status: 'Error' },
        }}
      />
      <ProFormSelect
        showSearch
        name="customerID"
        label={t('CUSTOMER')}
        width="lg"
        valueEnum={companiesCodesValueEnum || []}
        // disabled={!projectId}
      />

      <ProFormDateRangePicker
        name="plannedDate"
        label={`${t('DATE')}`}
        width="lg"
        tooltip="DATE"
        fieldProps={{
          onChange: onChange,
        }}
      />
    </ProForm>
  );
};

export default WPFilterForm;
