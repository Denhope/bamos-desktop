import React, { FC, useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, FormInstance, Button, message } from 'antd';
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
import { USER_ID } from '@/utils/api/http';
import dayjs from 'dayjs';

type PickslipRequestFilterFormType = {
  onpickSlipSearchValues: any;
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
  const { data: stores } = useGetStoresQuery({});

  // Преобразование данных для селектов
  const usersCodesValueEnum =
    users?.reduce((acc, user) => {
      acc[
        user.id
      ] = `${user.firstNameEnglish?.toUpperCase()} ${user.lastNameEnglish?.toUpperCase()}`;
      return acc;
    }, {} as Record<string, string>) || {};

  const storeCodesValueEnum =
    stores?.reduce((acc, store) => {
      if (store.id && store.storeShortName) {
        acc[store.id] = store.storeShortName.toUpperCase();
      }
      return acc;
    }, {} as Record<string, string>) || {};

  const neededCodesValueEnum =
    usersGroups?.reduce((acc, group) => {
      acc[group.id] = group.title;
      return acc;
    }, {} as Record<string, string>) || {};

  const projectTasksCodesValueEnum = (projectTasks ?? []).reduce(
    (acc, task) => {
      const taskCode = task.taskWO || task.taskWo || task.projectTaskWO || '';
      acc[task?.id] = taskCode;
      return acc;
    },
    {} as Record<string, string>
  );

  const projectsValueEnum: Record<string, string> = (projects ?? []).reduce(
    (acc, project) => {
      if (project._id) {
        acc[project._id] = `${project.projectWO} - ${project.projectName}`;
      }
      return acc;
    },
    {} as Record<string, string>
  );

  const debouncedSearch = useCallback(
    debounce(async (values: any) => {
      const storeManName = usersCodesValueEnum[values.storeManID] || '';
      const userName = usersCodesValueEnum[values.userID] || '';

      const searchValues = {
        pickSlipNumberNew: values.pickSlipNumberNew,
        storeManID: values.storeManID,
        userID: values.userID,
        storeManName: storeManName,
        userName: userName,
        bookingDate: values.bookingDate,
      };

      // Проверяем, есть ли хотя бы одно заполненное поле для поиска
      const hasSearchCriteria = Object.values(searchValues).some(
        (value) => value !== undefined && value !== ''
      );

      if (hasSearchCriteria) {
        const found = await onpickSlipSearchValues(searchValues);

        // Проверяем результат поиска
      }
    }, 300),
    [usersCodesValueEnum, onpickSlipSearchValues, t, pickSlip]
  );

  const handleValuesChange = (changedValues: any, allValues: any) => {
    debouncedSearch(allValues);
  };

  useEffect(() => {
    if (pickSlip) {
      form.resetFields();
      form.setFieldsValue({
        ...pickSlip,
        projectTaskID: pickSlip.projectTaskID?.taskWO,
        projectID: pickSlip.projectID?._id,
        neededOnID: pickSlip?.neededOnID?._id,
        getFromID: pickSlip?.getFromID?._id,
        type: pickSlip?.type,
        storeManID: pickSlip.storeManID || USER_ID,
        bookingDate: pickSlip.bookingDate
          ? dayjs(pickSlip.bookingDate)
          : dayjs(),
      });
      setSelectedProjectId(pickSlip.projectID?._id);
    } else {
      form.resetFields();
      form.setFieldsValue({
        storeManID: USER_ID,
        bookingDate: dayjs(),
      });
      message.info(t('No results found'));
      setSelectedProjectId(undefined);
    }
  }, [pickSlip, form, t]);

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
        submitter={false}
        onValuesChange={handleValuesChange}
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
            onChange={(value: any) => setSelectedProjectId(value)}
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
            initialValue={USER_ID}
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
          initialValue={dayjs()}
        />
        <Button
          type="primary"
          onClick={() => debouncedSearch(form.getFieldsValue())}
        >
          {t('Search')}
        </Button>
      </ProForm>
    </div>
  );
};

export default PickslipRequestFilterForm;
