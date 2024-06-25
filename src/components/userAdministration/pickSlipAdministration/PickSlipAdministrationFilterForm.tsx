// ts-nocheck

import {
  ProForm,
  ProFormCheckbox,
  ProFormDateRangePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { DatePickerProps, Form, FormInstance, message } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';

import { useAppDispatch } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFilteredProjects, getFilteredShops } from '@/utils/api/thunks';

import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';

import { useGetREQCodesQuery } from '@/features/requirementsCodeAdministration/requirementsCodesApi';
import { useGetGroupUsersQuery } from '@/features/userAdministration/userApi';
import { useGetProjectItemsWOQuery } from '@/features/projectItemWO/projectItemWOApi';
import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
type RequirementsFilteredFormType = {
  onpickSlipSearchValues: (values: any) => void;
  nonCalculate?: boolean;
  foForecact?: boolean;
};
const PickSlipAdministrationFilterForm: FC<RequirementsFilteredFormType> = ({
  onpickSlipSearchValues,
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
  const dispatch = useAppDispatch();
  const [receiverType, setReceiverType] = useState('PROJECT');

  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [options, setOptions] = useState<Option[]>([]); // указываем тип состояния явно

  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [initialForm, setinitialForm] = useState<any>('');
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const [taskOptions, setTaskOptions] = useState<Option[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<any | null>(null);
  const { t } = useTranslation();
  const currentCompanyID = localStorage.getItem('companyID');

  useEffect(() => {
    if (receiverType) {
      let action;
      let url;
      switch (receiverType) {
        case 'PROJECT':
          action = getFilteredProjects({ companyID: currentCompanyID || '' });
          break;
        case 'AC':
          url = '/api/ac';
          break;
        case 'SHOP':
          action = getFilteredShops({ companyID: currentCompanyID || '' });
          break;
        default:
          url = '/api/default';
      }

      if (action) {
        dispatch(action)
          .then((action) => {
            const data: any[] = action.payload; // предполагаем, что payload содержит массив данных
            let options;
            switch (receiverType) {
              case 'PROJECT':
                options = data.map((item: any) => ({
                  value: item._id, // замените на нужное поле для 'PROJECT'
                  label: `№:${item.projectWO}-${item.projectName}`, // замените на нужное поле для 'PROJECT'
                }));
                break;
              case 'AC':
                options = data.map((item: any) => ({
                  value: item.acField1, // замените на нужное поле для 'AC'
                  label: item.acField2, // замените на нужное поле для 'AC'
                }));
                break;
              case 'SHOP':
                options = data.map((item: any) => ({
                  value: item.shopShortName, // замените на нужное поле для 'SHOP'
                  label: item.shopShortName, // замените на нужное поле для 'SHOP'
                }));
                break;
              default:
                options = data.map((item: any) => ({
                  value: item.defaultField1, // замените на нужное поле для 'default'
                  label: item.defaultField2, // замените на нужное поле для 'default'
                }));
            }
            setOptions(options);
          })
          .catch((error) => {
            console.error('Ошибка при получении данных:', error);
          });
      }
    }
  }, [receiverType, dispatch]);

  const [isAltertative, setIsAltertative] = useState<any>(true);

  const { data: usersGroups } = useGetGroupUsersQuery({});

  const neededCodesValueEnum: Record<string, string> =
    usersGroups?.reduce<Record<string, string>>((acc, usersGroup) => {
      acc[usersGroup.id] = usersGroup.title;
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

  const onFinish = async (values: any) => {
    console.log(values);
    onpickSlipSearchValues({
      startDate: selectedStartDate,
      status: form.getFieldValue('pickSlipStatus'),
      projectTaskID: form.getFieldValue('projectTaskID'),
      pickSlipNumberNew: form.getFieldValue('pickSlipNumberNew'),
      partNumberID: selectedSinglePN?._id || selectedSinglePN?.id,
      endDate: selectedEndDate,
      companyID: currentCompanyID || '',
      isAlternatine: isAltertative,
      includeAlternative: isAltertative,
      projectID: selectedProjectId,
      neededOnID: form.getFieldValue('neededOnID'),
      storeFromID: form.getFieldValue('storeFromID'),
    });
  };
  const { data: projectTasks, isLoading } = useGetProjectItemsWOQuery(
    {
      projectID: selectedProjectId,
    },
    {
      skip: !selectedProjectId,
    }
  );
  const projectTasksCodesValueEnum: Record<string, string> =
    projectTasks?.reduce<Record<string, string>>((acc, projectTask) => {
      acc[projectTask.id] =
        projectTask.taskWO ||
        projectTask.taskWo ||
        projectTask.projectTaskWO ||
        '';
      return acc;
    }, {}) || {};
  return (
    <ProForm
      formRef={formRef}
      onValuesChange={(changedValues, allValues) => {
        // Handle changes in the form
        if (changedValues.receiverType) {
          setReceiverType(changedValues.receiverType);
        }
        if (changedValues.receiverTaskType) {
          // setReceiverTaskType(changedValues.receiverTaskType);
        }
      }}
      layout="horizontal"
      size="small"
      onReset={() => {
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
      }}
      form={form}
      onFinish={onFinish}
    >
      <ProForm.Group>
        <ProFormRadio.Group
          layout="horizontal"
          name="receiverType"
          label={`${t('RECEIVER TYPE')}`}
          tooltip="ENTER TYPE"
          options={[
            { value: 'PROJECT', label: `${t(`PROJECT`)}` },
            { value: 'AC', label: `${t(`AIRCRAFT`)}` },
            { value: 'SHOP', label: `${t(`SHOP/STORE`)}` },
          ]}
          initialValue="PROJECT"
        />
        {receiverType === 'PROJECT' && (
          <ProFormSelect
            name="additionalSelectProject"
            label={`${t(`PROJECT`)}`}
            width="lg"
            mode="multiple"
            options={options}
            onChange={async (value: any) => {
              setSelectedProjectId(value);
            }}
          />
        )}
        {receiverType === 'AC' && (
          <ProFormText
            name="planeNumber"
            label={`${t(`A/C REGISTRATION`)}`}
            width="lg"
            // options={options}
          />
        )}
        {receiverType === 'SHOP' && (
          <ProFormSelect
            showSearch
            name="neededOnID"
            label={t('NEEDED ON')}
            width="sm"
            valueEnum={neededCodesValueEnum || []}
            // disabled={!projectId}
          />
        )}
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          name="pickSlipNumberNew"
          label={`${t('PICKSLIP No')}`}
          width="lg"
          fieldProps={{
            onKeyPress: handleKeyPress,
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
          <ProFormCheckbox.Group
            className="my-0 py-0"
            disabled={!selectedSinglePN?.PART_NUMBER}
            initialValue={['true']}
            labelAlign="left"
            name="isAlternative"
            fieldProps={{
              onChange: (value) => setIsAltertative(value),
            }}
            options={[{ label: `${t('ALTERNATIVES')}`, value: 'true' }].map(
              (option) => ({
                ...option,
                style: { display: 'flex', flexWrap: 'wrap' }, // Добавьте эту строку
              })
            )}
          />
        </ProForm.Group>
        <ProFormSelect
          showSearch
          mode="multiple"
          name="storeFromID"
          label={t('FROM STORE')}
          width="lg"
          valueEnum={storeCodesValueEnum || []}
          // onChange={handleStoreChange}
        />
        <ProFormSelect
          showSearch
          // rules={[{ required: true }]}
          disabled={!selectedProjectId}
          mode="multiple"
          name="projectTaskID"
          label={`${t(`TASK`)}`}
          width="sm"
          valueEnum={projectTasksCodesValueEnum}
          onChange={(value: any) => {
            setSelectedTask(value);
          }}
        />
      </ProForm.Group>

      <ProFormSelect
        initialValue={['open']}
        mode="multiple"
        name="pickSlipStatus"
        label={`${t('PICKSLIP STATUS')}`}
        width="lg"
        options={[
          { value: 'draft', label: t('DRAFT') },
          // { value: 'planned', label: t('PLANNED') },
          { value: 'open', label: t('OPEN') },
          { value: 'progress', label: t('PROGRESS') },
          { value: 'complete', label: t('COMPLETE') },
          { value: 'onQuatation', label: t('QUATATION') },
          { value: 'onShort', label: t('ON SHORT') },
          { value: 'closed', label: t('CLOSED') },
          { value: 'canceled', label: t('CANCELED') },
          // { value: 'transfer', label: t('TRANSFER') },
        ]}
      />
      <ProFormSelect
        mode="multiple"
        name="pickSlipType"
        label={`${t('PICKSLIP TYPE')}`}
        width="lg"
        options={[
          { value: 'partRequest', label: t('PART REQUEST') },
          { value: 'partTransfer', label: t('PART TRANSFER') },

          // { value: 'transfer', label: t('TRANSFER') },
        ]}
      />

      <ProFormDateRangePicker
        name="plannedDate"
        label={`${t('PLANNED DATE')}`}
        width="lg"
        tooltip="PLANNED DATE"
        fieldProps={{
          onChange: onChange,
        }}
      />
    </ProForm>
  );
};

export default PickSlipAdministrationFilterForm;
