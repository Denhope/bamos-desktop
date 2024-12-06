import React, { FC, useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, FormInstance } from 'antd';
import {
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useGetProjectsQuery } from '@/features/projectAdministration/projectsApi';
import { useGetProjectItemsWOQuery } from '@/features/projectItemWO/projectItemWOApi';
import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
import {
  useGetGroupUsersQuery,
  useGetUsersQuery,
} from '@/features/userAdministration/userApi';
import { debounce } from 'lodash';

type PickslipRequestFilterFormType = {
  onpickSlipSearchValues: (values: any) => void;
  pickSlip?: any;
};

const PickslipRequestFilterForm: FC<PickslipRequestFilterFormType> = ({
  pickSlip,
  onpickSlipSearchValues,
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [projectId, setSelectedProjectId] = useState<any>();
  const [partNumberId, setPartNumberId] = useState<any>();
  const { data: projects } = useGetProjectsQuery({});
  const { data: users } = useGetUsersQuery({});
  const { data: usersGroups } = useGetGroupUsersQuery({});
  const formRef = useRef<FormInstance>(null);
  const { data: projectTasks } = useGetProjectItemsWOQuery(
    { projectId },
    { skip: !projectId }
  );
  const usersCodesValueEnum: Record<string, string> =
    users?.reduce<Record<string, string>>((acc, user) => {
      acc[user.id] = `${user.firstNameEnglish?.toUpperCase()} ${user.lastNameEnglish?.toUpperCase()}`;
      return acc;
    }, {}) || {};

  const { data: stores } = useGetStoresQuery({});
  const storeCodesValueEnum: Record<string, string> =
    stores?.reduce((acc, mpdCode) => {
      if (mpdCode.id && mpdCode.storeShortName) {
        acc[mpdCode.id] = `${String(mpdCode.storeShortName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};
  const neededCodesValueEnum: Record<string, string> =
    usersGroups?.reduce<Record<string, string>>((acc, usersGroup) => {
      acc[usersGroup.id] = usersGroup.title;
      return acc;
    }, {}) || {};
  const projectTasksCodesValueEnum: Record<string, string> = (
    projectTasks ?? []
  ).reduce<Record<string, string>>((acc, projectTask) => {
    const taskCode =
      projectTask.taskWO ||
      projectTask.taskWo ||
      projectTask.projectTaskWO ||
      '';
    acc[projectTask?.id] = taskCode;
    return acc;
  }, {});
  const projectsValueEnum: Record<string, string> = (projects ?? []).reduce<
    Record<string, string>
  >((acc, project) => {
    acc[project._id] = `${project.projectWO} - ${project.projectName}`;
    return acc;
  }, {});

  const debouncedSearch = useCallback(
    debounce((values: any) => {
      const storeManName = usersCodesValueEnum[values.storeManID] || '';
      const userName = usersCodesValueEnum[values.userID] || '';

      onpickSlipSearchValues({
        pickSlipNumberNew: values.pickSlipNumberNew,
        storeManID: values.storeManID,
        userID: values.userID,
        storeManName: storeManName,
        userName: userName,
        bookingDate: values.bookingDate,
      });
    }, 300),
    [usersCodesValueEnum, onpickSlipSearchValues]
  );

  const handleValuesChange = (changedValues: any, allValues: any) => {
    debouncedSearch(allValues);
  };

  useEffect(() => {
    if (pickSlip) {
      form.setFieldsValue({
        ...pickSlip,
        projectTaskID: pickSlip.projectTaskID?.taskWO,
        projectID: pickSlip.projectID?._id,
        neededOnID: pickSlip?.neededOnID?._id,
        getFromID: pickSlip?.getFromID?._id,
        type: pickSlip?.type,
      });
    } else {
      form.resetFields();
      setSelectedProjectId(undefined);
    }
  }, [pickSlip, form]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      debouncedSearch(form.getFieldsValue());
    }
  };

  return (
    <div>
      <ProForm
        layout="horizontal"
        formRef={formRef}
        size="small"
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        form={form}
        onValuesChange={handleValuesChange}
        submitter={false}
      >
        <ProFormGroup size={'small'}>
          <ProFormText
            name="pickSlipNumberNew"
            label={`${t('PICKSLIP No')}`}
            width="sm"
            tooltip="PICKSLIP No"
            fieldProps={{
              onKeyPress: handleKeyPress,
              autoFocus: true,
            }}
          />
          <ProFormSelect
            showSearch
            disabled
            name="state"
            label={t('STATUS')}
            width="sm"
            initialValue={'draft'}
            options={[
              { value: 'draft', label: t('DRAFT') },
              { value: 'open', label: t('OPEN') },
              { value: 'progress', label: t('IN PROGRESS') },
              { value: 'complete', label: t('COMPLETE') },
              { value: 'issued', label: t('ISSUED') },
              { value: 'onQuatation', label: t('QUATATION') },
              { value: 'onShort', label: t('ON SHORT') },
              { value: 'closed', label: t('CLOSE') },
              { value: 'canceled', label: t('CANCELED') },
              { value: 'partlyCanceled', label: t('PARTLY CANCELED') },
            ]}
          />
        </ProFormGroup>
        <ProForm.Group direction="horizontal">
          <ProFormSelect
            name="projectID"
            disabled
            label={`${t(`PROJECT`)}`}
            width="sm"
            valueEnum={projectsValueEnum}
            onChange={async (value: any) => {
              setSelectedProjectId(value);
            }}
          />
          <ProFormSelect
            showSearch
            disabled
            mode="single"
            name="projectTaskID"
            label={`${t(`TASK`)}`}
            width="sm"
            valueEnum={projectTasksCodesValueEnum}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormSelect
            showSearch
            name="neededOnID"
            label={t('NEEDED ON')}
            width="xs"
            valueEnum={neededCodesValueEnum || []}
            disabled
          />
          <ProFormSelect
            showSearch
            name="getFromID"
            label={t('GET FROM')}
            width="xs"
            mode="multiple"
            valueEnum={storeCodesValueEnum || []}
            disabled
          />
        </ProForm.Group>
        <ProFormGroup>
          <ProFormSelect
            showSearch
            disabled={pickSlip && pickSlip.state !== 'complete'}
            name="storeManID"
            label={t('STOREMAN')}
            width="sm"
            valueEnum={usersCodesValueEnum || []}
          />
          <ProFormSelect
            showSearch
            name="userID"
            label={t('MECH')}
            width="sm"
            valueEnum={usersCodesValueEnum || []}
            disabled={pickSlip && pickSlip.state !== 'complete'}
          />
        </ProFormGroup>
        <ProFormDatePicker
          width={'md'}
          disabled={pickSlip && pickSlip.state !== 'complete'}
          name="bookingDate"
          label={`${t('BOOKING DATE')}`}
        />
      </ProForm>
    </div>
  );
};

export default PickslipRequestFilterForm;