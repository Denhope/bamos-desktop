
// ts-nocheck

import {
  ProForm,
  ProFormCheckbox,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { DatePickerProps, Form, FormInstance, message } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getFilteredProjects,
  getFilteredShops,
} from '@/utils/api/thunks';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
import { useGetREQTypesQuery } from '@/features/requirementsTypeAdministration/requirementsTypeApi';
import { useGetREQCodesQuery } from '@/features/requirementsCodeAdministration/requirementsCodesApi';
import { useGetGroupUsersQuery } from '@/features/userAdministration/userApi';
import { useGetProjectItemsWOQuery } from '@/features/projectItemWO/projectItemWOApi';
import { useGetProjectsQuery } from '@/features/projectAdministration/projectsApi';
import { useGetfilteredWOQuery } from '@/features/wpAdministration/wpApi';
import { resetFormValues, setFormValues } from '@/store/reducers/formSlice';

type RequirementsFilteredFormType = {
  onRequirementsSearch: (values: any) => void;
  nonCalculate?: boolean;
  foForecact?: boolean;
  formKey: string; // Уникальный ключ формы
};

const RequirementsFilteredForm: FC<RequirementsFilteredFormType> = ({
  onRequirementsSearch,
  nonCalculate,
  foForecact,
  formKey,
}) => {
  const formRef = useRef<FormInstance>(null);
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const formValues = useTypedSelector((state: any) => state.form[formKey] || {});
  const [WOID, setWOID] = useState<any>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const [selectedProjectId, setSelectedProjectId] = useState<any | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [initialForm, setinitialForm] = useState<any>('');
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const [isAltertative, setIsAltertative] = useState<any>(true);
  const [reqTypeID, setReqTypeID] = useState<any>('');
  const { t } = useTranslation();
  const currentCompanyID = localStorage.getItem('companyID');

  const { data: projects } = useGetProjectsQuery(
    {
      WOReferenceID: form.getFieldValue('WOReferenceID'),
    },
    { skip: !WOID }
  );

  const { data: reqTypes } = useGetREQTypesQuery({});
  const { data: reqCodes } = useGetREQCodesQuery({ reqTypeID });
  const { data: usersGroups } = useGetGroupUsersQuery({});
  const { data: projectTasks } = useGetProjectItemsWOQuery(
    { projectID: selectedProjectId },
    { skip: !selectedProjectId }
  );
  const { data: wp } = useGetfilteredWOQuery({});

  const neededCodesValueEnum: Record<string, string> =
    usersGroups?.reduce<Record<string, string>>((acc, usersGroup) => {
      acc[usersGroup.id] = usersGroup.title;
      return acc;
    }, {}) || {};

  const requirementCodesValueEnum: Record<string, string> =
    reqCodes?.reduce<Record<string, string>>((acc, reqCode) => {
      acc[reqCode.id] = reqCode.code;
      return acc;
    }, {}) || {};

  const requirementTypesValueEnum: Record<string, string> =
    reqTypes?.reduce<Record<string, string>>((acc, reqType) => {
      acc[reqType.id] = reqType.code;
      return acc;
    }, {}) || {};

  const projectTasksCodesValueEnum: Record<string, string> =
    projectTasks?.reduce<Record<string, string>>((acc, projectTask) => {
      acc[projectTask.id] =
        projectTask.taskWO ||
        projectTask.taskWo ||
        projectTask.projectTaskWO ||
        '';
      return acc;
    }, {}) || {};

  const wpValueEnum: Record<string, string> =
    wp?.reduce((acc, wp) => {
      if (wp._id && wp?.WOName) {
        acc[wp._id] = `№:${wp?.WONumber}/${String(wp?.WOName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};

  const projectsValueEnum: Record<string, string> =
    projects?.reduce((acc, reqType: any) => {
      acc[reqType?._id] = `№:${reqType?.projectWO} / ${reqType.projectName}`;
      return acc;
    }, {}) || {};

  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };

  const handleReset = () => {
    form.resetFields();
    dispatch(resetFormValues({ formKey }));
    setWOID(null);
    setSelectedProjectId(null);
    setIsResetForm(true);
    setTimeout(() => {
      setIsResetForm(false);
    }, 0);
    setinitialForm('');
    setSecectedSinglePN(null);
    setSelectedEndDate(null);
    setSelectedStartDate(null);
    setSelectedTask(null);
  };

  const handlePartialReset = (fieldNames: string[]) => {
    const resetFields = fieldNames.reduce((acc, fieldName) => {
      acc[fieldName] = undefined;
      return acc;
    }, {} as Record<string, any>);
    form.setFieldsValue(resetFields);
    
    // Обновляем только сброшенные поля в хранилище
    const currentValues = useTypedSelector((state: any) => state.form[formKey] || {});
    const updatedValues = { ...currentValues, ...resetFields };
    dispatch(setFormValues({ formKey, values: updatedValues }));

    // Сбрасываем связанные состояния
    if (fieldNames.includes('WOReferenceID')) {
      setWOID(null);
    }
    if (fieldNames.includes('projectID')) {
      setSelectedProjectId(null);
    }
    if (fieldNames.includes('partNumber')) {
      setSecectedSinglePN(null);
    }
    if (fieldNames.includes('projectTaskID')) {
      setSelectedTask(null);
    }
    if (fieldNames.includes('plannedDate')) {
      setSelectedStartDate(null);
      setSelectedEndDate(null);
    }
    if (fieldNames.includes('reqTypesID')) {
      setReqTypeID(null);
    }
  };

  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };

  const onFinish = async (values: any) => {
    try {
      const searchParams = {
        regNbr: form.getFieldValue('planeNumber'),
        startDate: selectedStartDate,
        group: form.getFieldValue('partGroup'),
        type: form.getFieldValue('partType'),
        status: form.getFieldValue('requestStatus'),
        projectTaskID: form.getFieldValue('projectTaskID'),
        additionalTaskID: selectedTask,
        partRequestNumber: form.getFieldValue('partRequestNumber'),
        foForecast: foForecact,
        partNumberID: selectedSinglePN?._id || selectedSinglePN?.id,
        endDate: selectedEndDate,
        companyID: currentCompanyID || '',
        isAlternatine: isAltertative,
        nonColculate: nonCalculate,
        includeAlternative: isAltertative,
        projectID: selectedProjectId,
        reqCodesID: form.getFieldValue('reqCodesID'),
        reqTypesID: form.getFieldValue('reqTypesID'),
        neededOnID: form.getFieldValue('neededOnID'),
        WOReferenceID: form.getFieldValue('WOReferenceID'),
        time: new Date(),
      };

      onRequirementsSearch(searchParams);
    } catch (error) {
      message.error('Failed to fetch requirements');
    }
  };

  return (
    <ProForm
      formRef={formRef}
      onValuesChange={(changedValues, allValues) => {
        // if (changedValues.receiverType) {
        //   setReceiverType(changedValues.receiverType);
        // }
        // if (changedValues.receiverTaskType) {
        //   setReceiverTaskType(changedValues.receiverTaskType);
        // }
        dispatch(setFormValues({ formKey, values: allValues }));
      }}
      layout="horizontal"
      size="small"
      onReset={handleReset}
      form={form}
      onFinish={onFinish}
    >
      <ProFormSelect
        showSearch
        name="WOReferenceID"
        label={t('WP No')}
        width="lg"
        valueEnum={wpValueEnum || []}
        value={WOID}
        onChange={(value: any) => setWOID(value)}
        fieldProps={{
          onClear: () => {handlePartialReset(['WOReferenceID']);},
        }}
      />
      <ProFormSelect
        mode={'multiple'}
        showSearch
        name="projectID"
        label={t('WP')}
        width="lg"
        valueEnum={projectsValueEnum}
        onChange={(value: any) => setSelectedProjectId(value)}
        disabled={!WOID}
        fieldProps={{
          onClear: () => handlePartialReset(['projectID']),
        }}
      />
      <ProFormSelect
        showSearch
        name="neededOnID"
        label={t('NEEDED ON')}
        width="lg"
        valueEnum={neededCodesValueEnum || []}
        fieldProps={{
          onClear: () => handlePartialReset(['neededOnID']),
        }}
      />
      <ProFormText
        name="partRequestNumber"
        label={`${t('REQUIREMENT No')}`}
        width="lg"
        fieldProps={{
          onKeyPress: handleKeyPress,
          onClear: () => handlePartialReset(['partRequestNumber']),
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
      </ProForm.Group>
      <ProFormSelect
        showSearch
        disabled={!selectedProjectId}
        mode="single"
        name="projectTaskID"
        label={`${t(`TASK`)}`}
        width="lg"
        valueEnum={projectTasksCodesValueEnum}
        onChange={(value: any) => {
          setSelectedTask(value);
        }}
        fieldProps={{
          onClear: () => handlePartialReset(['projectTaskID']),
        }}
      />
      <ProFormSelect
        showSearch
        name="reqTypesID"
        label={t('REQUIREMENT TYPE')}
        width="lg"
        valueEnum={requirementTypesValueEnum}
        onChange={(value: any) => setReqTypeID(value)}
        fieldProps={{
          onClear: () => handlePartialReset(['reqTypesID']),
        }}
      />
      <ProFormSelect
        showSearch
        name="reqCodesID"
        label={t('REQUIREMENT CODE')}
        width="sm"
        valueEnum={requirementCodesValueEnum || []}
        disabled={!reqTypeID}
        fieldProps={{
          onClear: () => handlePartialReset(['reqCodesID']),
        }}
      />
      <ProFormSelect
        mode="multiple"
        name="requestStatus"
        label={`${t('REQUIREMENT STATUS')}`}
        width="lg"
        options={[
          { value: 'draft', label: t('DRAFT') },
          { value: 'open', label: t('OPEN') },
          { value: 'issued', label: t('ISSUED') },
          { value: 'onQuatation', label: t('QUATATION') },
          { value: 'onShort', label: t('ON SHORT') },
          { value: 'closed', label: t('CLOSE') },
          { value: 'canceled', label: t('CANCELED') },
        ]}
        fieldProps={{
          onClear: () => handlePartialReset(['requestStatus']),
        }}
      />
      <ProFormDateRangePicker
        name="plannedDate"
        label={`${t('PLANNED DATE')}`}
        width="lg"
        tooltip="PLANNED DATE"
        fieldProps={{
          onChange: onChange,
          onClear: () => handlePartialReset(['plannedDate']),
        }}
      />
    </ProForm>
  );
};

export default RequirementsFilteredForm;


