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

type RequirementsFilteredFormType = {
  onProjectSearch: (values: any) => void;
};
const WoFilteredForm: FC<RequirementsFilteredFormType> = ({
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

  const { data: projectTypes, isLoading } = useGetProjectTypesQuery({});
  const { data: projects } = useGetProjectsQuery({});
  const { data: usersGroups } = useGetGroupUsersQuery({});

  const projectsValueEnum: Record<string, string> =
    projects?.reduce((acc, reqType) => {
      acc[reqType._id] = `№:${reqType.projectWO}-${reqType.projectName}`;
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
        status: form.getFieldValue('woStatus'),
        projectNumber: form.getFieldValue('projectNumber'),
        endDate: selectedEndDate,
        projectTypesID: form.getFieldValue('projectTypesID'),
        projectTaskWO: form.getFieldValue('projectTaskWO'),
        projectID: form.getFieldValue('projectID'),
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
      <ProFormText
        name="projectTaskWO"
        label={`${t('WO No')}`}
        width="lg"
        fieldProps={{
          onKeyPress: handleKeyPress,
        }}
      />
      <ProFormSelect
        initialValue={['open']}
        mode="multiple"
        name="woStatus"
        label={`${t('Wo STATUS')}`}
        width="lg"
        valueEnum={{
          draft: { text: t('DRAFT'), status: 'DRAFT' },
          open: { text: t('OPEN'), status: 'Processing' },
          inProgress: { text: t('PROGRESS'), status: 'PROGRESS' },
          // PLANNED: { text: t('PLANNED'), status: 'Waiting' },
          completed: { text: t('COMPLETED'), status: 'Default' },
          closed: { text: t('CLOSED'), status: 'SUCCESS' },
          cancelled: { text: t('CANCELLED'), status: 'Error' },
        }}
      />
      <ProForm.Group>
        <ProFormSelect
          mode={'multiple'}
          showSearch
          name="projectID"
          label={t('PROJECT No')}
          width="lg"
          valueEnum={projectsValueEnum}
          onChange={(value: any) => setReqTypeID(value)}
          // disabled={!acTypeID} // Disable the select if acTypeID is not set
        />
      </ProForm.Group>
      <ProFormSelect
        mode={'multiple'}
        showSearch
        name="ACID"
        label={t('A/C No')}
        width="lg"
        // valueEnum={projectTypesValueEnum}
        // onChange={(value: any) => setReqTypeID(value)}
        // disabled={!acTypeID} // Disable the select if acTypeID is not set
      />
      {/* <ProFormSelect
        mode={'multiple'}
        showSearch
        // name="projectTypesID"
        label={t('PROJECT TYPE')}
        width="lg"
        valueEnum={projectTypesValueEnum}
        onChange={(value: any) => setReqTypeID(value)}
        // disabled={!acTypeID} // Disable the select if acTypeID is not set
      /> */}

      {/* <ProFormSelect
        // initialValue={['OPEN']}
        mode="multiple"
        name="projectStatus"
        label={`${t('PROJECT STATE')}`}
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
      /> */}

      <ProFormSelect
        mode={'multiple'}
        showSearch
        name="userGroupID"
        label={t('SHOP No')}
        width="lg"
        // valueEnum={projectsValueEnum}
        // onChange={(value: any) => setReqTypeID(value)}
      />

      <ProFormSelect
        mode={'multiple'}
        showSearch
        name="useID"
        label={t('USER')}
        width="lg"
        // valueEnum={projectsValueEnum}
        // onChange={(value: any) => setReqTypeID(value)}
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

export default WoFilteredForm;
