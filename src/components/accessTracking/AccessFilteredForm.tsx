// @ts-nocheck

import {
  ProForm,
  ProFormCheckbox,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { DatePickerProps, Form, FormInstance, message } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';

import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useGetGroupUsersQuery,
  useGetUsersQuery,
} from '@/features/userAdministration/userApi';
import { useGetProjectTypesQuery } from '../projectTypeAdministration/projectTypeApi';
import { useGetProjectsQuery } from '@/features/projectAdministration/projectsApi';
import { useGetZonesByGroupQuery } from '@/features/zoneAdministration/zonesApi';
import { useGetfilteredWOQuery } from '@/features/wpAdministration/wpApi';
import { resetFormValues, setFormValues } from '@/store/reducers/formSlice';
import { useDispatch, useSelector } from 'react-redux';
type RequirementsFilteredFormType = {
  onProjectSearch: (values: any) => void;
  formKey: string; // Уникальный ключ формы
};
const WoFilteredForm: FC<RequirementsFilteredFormType> = ({
  onProjectSearch,
  formKey,
}) => {
  const dispatch = useDispatch();
  const formValues = useSelector((state: any) => state.form[formKey] || {});
  const formRef = useRef<FormInstance>(null);
  const [form] = Form.useForm();

  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const [WOID, setWOID] = useState<any>(null);
  const {
    data: wp,
    isLoading: isLoadingWP,
    isFetching,
  } = useGetfilteredWOQuery({});
  const { data: projects } = useGetProjectsQuery(
    {
      WOReferenceID: form.getFieldValue('WOReferenceID'),
    },
    { skip: !WOID }
  );
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };
  const wpValueEnum: Record<string, string> =
    wp?.reduce((acc, wp) => {
      if (wp._id && wp?.WOName) {
        acc[wp._id] = `№:${wp?.WONumber}/${String(wp?.WOName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};

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

  const { data: usersGroups } = useGetGroupUsersQuery({});
  const { data: users } = useGetUsersQuery({});
  const [isOnlyWithPanels, setIsOnlyWithPanels] = useState<boolean>(false);
  const [isOnlyPanels, setIsOnlyPanels] = useState<boolean>(true);
  const projectsValueEnum: Record<string, string> =
    projects?.reduce((acc, reqType) => {
      acc[reqType._id] = `№:${reqType.projectWO}-${reqType.projectName}`;
      return acc;
    }, {}) || {};
  const usersValueEnum: Record<string, string> =
    users?.reduce((acc, user) => {
      acc[user?._id || user?.id] = `(${user.singNumber})-${String(
        user.name
      ).toUpperCase()}`;
      return acc;
    }, {}) || {};
  // const { data: zones, isLoading: loading } = useGetZonesByGroupQuery(
  //   { acTypeId: 'acTypeID' }
  //   // { skip: !acTypeID }
  // );
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
        accessProjectNumber: form.getFieldValue('accessProjectNumber'),
        endDate: selectedEndDate,
        projectTypesID: form.getFieldValue('projectTypesID'),
        projectTaskWO: form.getFieldValue('projectTaskWO'),
        projectID: form.getFieldValue('projectID'),
        isOnlyWithPanels: form.getFieldValue('isOnlyWithPanels'),
        isOnlyPanels: form.getFieldValue('isOnlyPanels'),
        removeUserId: form.getFieldValue('removeUserId'),
        installUserId: form.getFieldValue('installUserId'),
        inspectedUserID: form.getFieldValue('inspectedUserID'),
        WOReferenceID: form.getFieldValue('WOReferenceID'),
      };

      onProjectSearch(searchParams);
    } catch (error) {
      message.error('Failed to fetch requirements');
    }
  };

  const handleReset = () => {
    form.resetFields();
    dispatch(resetFormValues({ formKey }));
    setSelectedEndDate(null);
    setSelectedStartDate(null);
  };
  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);
  return (
    <ProForm
      formRef={formRef}
      onValuesChange={(changedValues, allValues) => {
        dispatch(setFormValues({ formKey, values: allValues }));
        // Handle changes in the form
      }}
      layout="horizontal"
      size="small"
      onReset={handleReset}
      form={form}
      onFinish={onFinish}
    >
      <ProFormText
        name="accessProjectNumber"
        label={`${t('ACCESS LABEL')}`}
        width="lg"
        fieldProps={{
          onKeyPress: handleKeyPress,
        }}
      />
      {/* <ProFormSelect
        showSearch
        name="zonesID"
        mode={'multiple'}
        label={t('ZONES')}
        width="sm"
        // valueEnum={zonesValueEnum}
        // disabled={!acTypeID}
      /> */}

      <ProForm.Group>
        <ProFormSelect
          showSearch
          name="WOReferenceID"
          label={t('WP No')}
          width="lg"
          valueEnum={wpValueEnum || []}
          onChange={(value: any) => setWOID(value)}
        />
        <ProFormSelect
          mode={'multiple'}
          showSearch
          name="projectID"
          label={t('PROJECT No')}
          width="lg"
          valueEnum={projectsValueEnum}
          onChange={(value: any) => setReqTypeID(value)}
          disabled={!WOID} // Disable the select if acTypeID is not set
        />
      </ProForm.Group>
      {/* <ProFormSelect
        mode={'multiple'}
        showSearch
        name="ACID"
        label={t('AC Reg')}
        width="lg"
        // valueEnum={projectTypesValueEnum}
        // onChange={(value: any) => setReqTypeID(value)}
        // disabled={!acTypeID} // Disable the select if acTypeID is not set
      /> */}

      <ProFormSelect
        // mode={'multiple'}
        showSearch
        name="removeUserId"
        label={t('USER OPEN')}
        width="lg"
        valueEnum={usersValueEnum}
        // onChange={(value: any) => setReqTypeID(value)}
      />
      <ProFormSelect
        // mode={'multiple'}
        showSearch
        name="installUserId"
        label={t('USER CLOSE')}
        width="lg"
        valueEnum={usersValueEnum}
        // onChange={(value: any) => setReqTypeID(value)}
      />
      <ProFormSelect
        // mode={'multiple'}
        showSearch
        name="inspectedUserID"
        label={t('USER INSPECT')}
        width="lg"
        valueEnum={usersValueEnum}
        // onChange={(value: any) => setReqTypeID(value)}
      />

      <ProFormSelect
        // initialValue={['open', 'draft']}
        mode="multiple"
        name="status"
        label={`${t('ACCESS STATUS')}`}
        width="lg"
        valueEnum={{
          open: { text: t('OPEN'), status: 'Processing' },
          // PLANNED: { text: t('PLANNED'), status: 'Waiting' },
          closed: { text: t('CLOSE'), status: 'SUCCESS' },
          inspected: { text: t('INSPECTION'), status: 'Waiting' },
          draft: { text: t('DRAFT'), status: 'Waiting' },
        }}
      />
      <ProFormDateRangePicker
        name="openDate"
        label={`${t('DATE')}`}
        width="lg"
        tooltip="DATE"
        fieldProps={{
          onChange: onChange,
        }}
      />
      {/* <ProFormDateRangePicker
        name="closedDate"
        label={`${t('CLOSED DATE')}`}
        width="lg"
        tooltip="DATE"
        fieldProps={{
          onChange: onChange,
        }}
      /> */}

      {/* <ProFormDateRangePicker
        name="inspectedDate"
        label={`${t('INSPECTION DATE')}`}
        width="lg"
        tooltip="DATE"
        fieldProps={{
          onChange: onChange,
        }}
      /> */}
      <ProFormCheckbox
        name="isOnlyWithPanels"
        label={t('SHOW ONLY ZONES WITH ACCESS')}
        initialValue={isOnlyWithPanels}
        onChange={(checked: boolean | ((prevState: boolean) => boolean)) =>
          setIsOnlyWithPanels(checked)
        }
      />
      <ProFormCheckbox
        name="isOnlyPanels"
        label={t('SHOW ONLY ACCESS')}
        initialValue={isOnlyPanels}
        onChange={(checked: boolean | ((prevState: boolean) => boolean)) =>
          setIsOnlyPanels(checked)
        }
      />
    </ProForm>
  );
};

export default WoFilteredForm;
