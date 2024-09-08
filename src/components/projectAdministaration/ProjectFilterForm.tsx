// @ts-nocheck

import {
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { DatePickerProps, Form, FormInstance, message } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import { useGetProjectsQuery } from '@/features/projectAdministration/projectsApi';

import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetGroupUsersQuery } from '@/features/userAdministration/userApi';
import { useGetProjectTypesQuery } from '../projectTypeAdministration/projectTypeApi';
import { useGetCompaniesQuery } from '@/features/companyAdministration/companyApi';
import { useGetfilteredWOQuery } from '@/features/wpAdministration/wpApi';
type RequirementsFilteredFormType = {
  onProjectSearch: (values: any) => void;
};
const ProjectFilterForm: FC<RequirementsFilteredFormType> = ({
  onProjectSearch,
}) => {
  const [WOID, setWOID] = useState<any>(null);
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
  const { data: projects } = useGetProjectsQuery(
    {
      WOReferenceID: form.getFieldValue('WOReferenceID'),
    },
    { skip: !WOID }
  );
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
        WOReferenceID: form.getFieldValue('WOReferenceID'),
        time: new Date(),
      };

      onProjectSearch(searchParams);
    } catch (error) {
      message.error('Failed to fetch requirements');
    }
  };
  const {
    data: wp,
    isLoading: isLoadingWP,
    isFetching,
  } = useGetfilteredWOQuery({});
  const wpValueEnum: Record<string, string> =
    wp?.reduce((acc, wp) => {
      if (wp._id && wp?.WOName) {
        acc[wp._id] = `№:${wp?.WONumber}/${String(wp?.WOName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};
  const projectsValueEnum: Record<string, string> =
    projects?.reduce((acc, reqType: any) => {
      acc[reqType._id] = `${reqType.projectName}`;
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
      onReset={() => {
        setSelectedEndDate(null);
        setSelectedStartDate(null);
      }}
      form={form}
      onFinish={onFinish}
    >
      <ProForm.Group>
        <ProFormSelect
          showSearch
          name="WOReferenceID"
          label={t('WP No')}
          width="lg"
          onChange={(value: any) => setWOID(value)}
          valueEnum={wpValueEnum || []}
          // disabled={!projectId}
        />
        <ProFormSelect
          mode={'multiple'}
          showSearch
          name="projectID"
          label={t('WP TITLE')}
          width="lg"
          valueEnum={projectsValueEnum}
          onChange={(value: any) => setReqTypeID(value)}
          disabled={!WOID} // Disable the select if acTypeID is not set
        />
        {/* <ProFormText
          name="projectNumber"
          label={`${t('PROJECT No')}`}
          width="lg"
          fieldProps={{
            onKeyPress: handleKeyPress,
          }}
        /> */}
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
        // rules={[{ required: true }]}
        mode="multiple"
        name="projectType"
        label={t('WO TYPE')}
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
          // repairPart: { text: t('REPAIR COMPONENT') },
          // repairAC: { text: t('REPAIR AC') },
          partCange: { text: t('COMPONENT CHANGE') },
          addWork: { text: t('ADD WORK') },
          enginiring: { text: t('ENGINEERING SERVICES') },
          nonProduction: { text: t('NOT PRODUCTION SERVICES') },
          // production: { text: t('PRODUCTION PART') },
        }}
      />

      <ProFormSelect
        // initialValue={['OPEN']}
        mode="multiple"
        name="status"
        label={`${t('PROJECT STATUS')}`}
        width="lg"
        valueEnum={{
          DRAFT: { text: t('DRAFT'), status: 'DRAFT' },
          OPEN: { text: t('OPEN'), status: 'Processing' },
          inProgress: { text: t('IN PROGRESS'), status: 'PROGRESS' },
          // PLANNED: { text: t('PLANNED'), status: 'Waiting' },
          COMPLETED: { text: t('COMPLETED'), status: 'Default' },
          CLOSED: { text: t('CLOSE'), status: 'SUCCESS' },
          CANCELLED: { text: t('CANCEL'), status: 'Error' },
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

export default ProjectFilterForm;
