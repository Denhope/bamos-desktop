import {
  FormInstance,
  ProForm,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { DatePickerProps, Form } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import { useAppDispatch } from '@/hooks/useTypedSelector';

import React, { FC, useRef, useState } from 'react';
import { getFilteredProjects } from '@/utils/api/thunks';
import ContextMenuVendorsSearchSelect from '@/components/shared/form/ContextMenuVendorsSearchSelect';
import ContextMenuProjectSearchSelect from '@/components/shared/form/ContextMenuProjectSearchSelect';
import { useTranslation } from 'react-i18next';
type ProjectViewerFilterFormType = {
  onProjectSearch: (orders: any[] | []) => void;
};
const ProjectViewerFilterForm: FC<ProjectViewerFilterFormType> = ({
  onProjectSearch,
}) => {
  const formRef = useRef<FormInstance>(null);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [selectedCreateDate, setSelectedCreateDate] = useState<any>();
  const [selectedCreateEndDate, setSelectedCreateEndDate] = useState<any>();
  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const [selectedPlanedStartDate, setSelectedPlanedStartDate] = useState<any>();
  const [selectedPlanedFinishDate, setSelectedPlanedFinishDate] =
    useState<any>();
  const [selectedSingleProject, setSecectedSingleProject] = useState<any>();
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const dispatch = useAppDispatch();
  const onChangeCreate = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedCreateEndDate(dateString[1]);
    setSelectedCreateDate(dateString[0]);
  };
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };
  const onChangePlan = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedPlanedFinishDate(dateString[1]);
    setSelectedPlanedStartDate(dateString[0]);
  };
  const [selectedSingleCustomer, setSecectedSingleCustomer] = useState<any>();
  const [initialForm, setinitialForm] = useState<any>('');
  return (
    <div>
      <ProForm
        onReset={() => {
          setinitialForm('');
          setSecectedSingleCustomer(null);
          setSecectedSingleProject(null);
          setIsResetForm(true);
          setTimeout(() => {
            setIsResetForm(false);
          }, 0);
          // setSecectedSingleLocation({ locationName: '' });
        }}
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        form={form}
        layout="horizontal"
        formRef={formRef}
        size="small"
        onFinish={async (values) => {
          const currentCompanyID = localStorage.getItem('companyID') || '';
          const result = await dispatch(
            getFilteredProjects({
              companyID: currentCompanyID,
              planeNumber: values.planeNumber,
              status: values.projectState,
              projectType: values.projectType,
              projectWO: selectedSingleProject?.projectWO,
              customer: selectedSingleCustomer?.CODE,
              startDate: selectedStartDate,
              endDate: selectedEndDate,
              planedEndDate: selectedPlanedFinishDate,
              planedStartDate: selectedPlanedStartDate,
              createStartDate: selectedCreateDate,
              createFinishDate: selectedCreateEndDate,
            })
          );
          if (result.meta.requestStatus === 'fulfilled') {
            onProjectSearch(result.payload || []);
          }
        }}
      >
        <ProFormGroup>
          <ProFormGroup direction="vertical" size={'small'}>
            <ContextMenuProjectSearchSelect
              isResetForm={isResetForm}
              rules={[{ required: false }]}
              onSelectedProject={function (project: any): void {
                setSecectedSingleProject(project);
              }}
              name={'projectNumber'}
              initialForm={selectedSingleProject?.projectWO || initialForm}
              width={'sm'}
              label={`${t(`PROJECT`)}`}
            ></ContextMenuProjectSearchSelect>
            <ProFormSelect
              showSearch
              mode="multiple"
              name="projectState"
              label={t('PROJECT STATUS')}
              width="sm"
              initialValue={['inProgress']}
              valueEnum={{
                DRAFT: { text: t('DRAFT'), status: 'DRAFT' },
                OPEN: { text: t('OPEN'), status: 'Processing' },
                inProgress: { text: t('PROGRESS'), status: 'PROGRESS' },
                PLANNED: { text: t('PLANNED'), status: 'Waiting' },
                COMPLETED: { text: t('COMPLETED'), status: 'Default' },
                CLOSED: { text: t('CLOSED'), status: 'SUCCESS' },
                CANCELLED: { text: t('CANCELLED'), status: 'Error' },
              }}
            />
            <ProFormSelect
              showSearch
              mode="multiple"
              name="projectType"
              label={t('PROJECT TYPE')}
              width="sm"
              tooltip={t('PROJECT TYPE')}
              valueEnum={{
                MAINTENANCE_AC_PROJECT: t('MAINTENANCE A/C '),
                REPAIR_AC_PROJECT: t('REPAIR A/C '),
                REPAIR_COMPONENT_PROJECT: t('REPAIR COMPONENT '),
                SERVICE_COMPONENT_PROJECT: t('COMPONENT SERVICE '),
                COMPONENT_REPAIR_PROJECT: t('COMPONENT REPAIR '),
                PRODUCTION_PROJECT: t('PRODUCTION '),
                PURCHASE_PROJECT: t('PURCHASE '),
                MINIMUM_SUPPLY_LIST: t('MINIMUM SUPPLY LIST'),
              }}
            />
          </ProFormGroup>{' '}
          <ProFormGroup direction="vertical" size={'small'}>
            <ProFormText
              name="planeNumber"
              label={t('A/C REGISTRATION')}
              width="sm"
              fieldProps={{
                // onDoubleClick: () => setOpenPickViewer(true),
                onKeyPress: handleKeyPress,
              }}
            />
            <ProFormSelect
              showSearch
              name="acType"
              label={t('A/C TYPE')}
              width="sm"
              valueEnum={{
                RRJ_95: { text: t('RRJ-95'), status: 'RRJ-95' },
                a320: { text: t('A 320'), status: 'RRJ-95' },
              }}
            />
            <ProFormSelect
              showSearch
              name="acModel"
              label={t('A/C MODEL')}
              width="sm"
              valueEnum={{}}
            />
          </ProFormGroup>
          <ProFormGroup direction="vertical" size={'small'}>
            <ContextMenuVendorsSearchSelect
              isResetForm={isResetForm}
              width="sm"
              rules={[{ required: false }]}
              name={'customer'}
              onSelectedVendor={function (record: any, rowIndex?: any): void {
                setSecectedSingleCustomer(record);
              }}
              initialForm={selectedSingleCustomer?.CODE || initialForm}
              label={t('CUSTOMER')}
            />
            <ProFormText
              name="partNumber"
              label={`${t('PART No')}`}
              width="sm"
              tooltip={`${t('PART No')}`}
              //rules={[{ required: true }]}
              fieldProps={{
                onKeyPress: handleKeyPress,
              }}
            />
            <ProFormText
              name="serialNumber"
              label={t('SERIAL No')}
              width="sm"
              tooltip={t('SERIAL No')}
              fieldProps={{
                // onDoubleClick: () => setOpenPickViewer(true),
                onKeyPress: handleKeyPress,
              }}
            ></ProFormText>
          </ProFormGroup>
          <ProFormGroup direction="vertical" size={'small'}>
            <ProFormDateRangePicker
              label={t('CREATE DATE')}
              name="createDate"
              width="sm"
              fieldProps={{
                onChange: onChangeCreate,
              }}
            ></ProFormDateRangePicker>
            <ProFormDateRangePicker
              label={t('PLANNED DATE')}
              name="planedStartDate"
              width="sm"
              fieldProps={{
                onChange: onChangePlan,
              }}
            ></ProFormDateRangePicker>
            <ProFormDateRangePicker
              label={t('DATE IN')}
              name="startDate"
              width="sm"
              fieldProps={{
                onChange: onChange,
              }}
            ></ProFormDateRangePicker>
          </ProFormGroup>
        </ProFormGroup>
      </ProForm>
    </div>
  );
};

export default ProjectViewerFilterForm;
