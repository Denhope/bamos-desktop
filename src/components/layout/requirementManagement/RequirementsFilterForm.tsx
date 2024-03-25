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

import axios from 'axios';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getFilteredAditionalTasks,
  getFilteredProjectTasks,
  getFilteredProjects,
  getFilteredRequirementsManager,
  getFilteredShops,
} from '@/utils/api/thunks';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
import { IProjectTaskAll } from '@/models/IProjectTask';
import { IAdditionalTaskMTBCreate } from '@/models/IAdditionalTaskMTB';
type RequirementsFilteredFormType = {
  onRequirementsSearch: (orders: any[] | []) => void;
  nonCalculate: boolean;
  foForecact: boolean;
};
const RequirementsFilteredForm: FC<RequirementsFilteredFormType> = ({
  onRequirementsSearch,
  nonCalculate,
  foForecact,
}) => {
  const [form] = Form.useForm();
  const formRef = useRef<FormInstance>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };
  interface Item {
    field1: string;
    field2: string;
  }
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
  const [receiverTaskType, setReceiverTaskType] = useState('MAIN_TASK');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [options, setOptions] = useState<Option[]>([]); // указываем тип состояния явно
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
                  label: item.projectWO, // замените на нужное поле для 'PROJECT'
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
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [initialForm, setinitialForm] = useState<any>('');
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const [taskOptions, setTaskOptions] = useState<Option[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<any | null>(null);
  useEffect(() => {
    const currentCompanyID = localStorage.getItem('companyID');
    if (receiverTaskType) {
      let action;
      let url;
      switch (receiverTaskType) {
        case 'MAIN_TASK':
          action = getFilteredProjectTasks({
            projectId: selectedProjectId,
          });

          break;
        case 'NRC':
          action = getFilteredAditionalTasks({
            projectId: selectedProjectId,
            companyID: currentCompanyID || '',
          });

          break;
      }

      if (action) {
        dispatch(action)
          .then((action) => {
            const data: any[] = action.payload; // предполагаем, что payload содержит массив данных
            let options;
            switch (receiverTaskType) {
              case 'MAIN_TASK':
                options = data.map((item: IProjectTaskAll) => ({
                  value: item.id || item._id, // замените на нужное поле для 'PROJECT'
                  label: `${item.projectTaskWO}`, // замените на нужное поле для 'PROJECT'
                }));
                break;
              case 'NRC':
                options = data.map((item: IAdditionalTaskMTBCreate) => ({
                  value: item._id || item.id, // замените на нужное поле для 'PROJECT'
                  label: `${item.additionalNumberId}`, // замените на нужное поле для 'PROJECT'
                }));
                break;

              default:
                options = data.map((item: any) => ({
                  value: item.defaultField1, // замените на нужное поле для 'default'
                  label: item.defaultField2, // замените на нужное поле для 'default'
                }));
            }
            setTaskOptions(options);
          })
          .catch((error) => {
            console.error('Ошибка при получении данных:', error);
          });
      }
    }
  }, [selectedProjectId, receiverTaskType, dispatch]);
  const [isAltertative, setIsAltertative] = useState<any>(true);
  return (
    <ProForm
      formRef={formRef}
      onValuesChange={(changedValues, allValues) => {
        // Handle changes in the form
        if (changedValues.receiverType) {
          setReceiverType(changedValues.receiverType);
        }
        if (changedValues.receiverTaskType) {
          setReceiverTaskType(changedValues.receiverTaskType);
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
      onFinish={async (values: any) => {
        if (null) {
          message.error('Some fields are empty');
        } else {
          const result = dispatch(
            getFilteredRequirementsManager({
              regNbr: form.getFieldValue('planeNumber'),
              startDate: selectedStartDate,
              group: form.getFieldValue('partGroup'),
              type: form.getFieldValue('partType'),
              status: form.getFieldValue('requestStatus'),
              projectTaskID: receiverTaskType === 'MAIN_TASK' && selectedTask,
              additionalTaskID: receiverTaskType === 'NRC' && selectedTask,
              partRequestNumber: form.getFieldValue('partRequestNumber'),
              foForecast: foForecact,
              partNumbers: [selectedSinglePN?.PART_NUMBER] || [],
              endDate: selectedEndDate,
              companyID: currentCompanyID || '',
              isAlternatine: isAltertative,
              nonColculate: nonCalculate,
              includeAlternative: isAltertative,

              // projectIds: [
              //   receiverType && receiverType === 'PROJECT'
              //     ? form.getFieldValue('additionalSelectProject')
              //     : '',
              // ],
              projectId:
                receiverType && receiverType === 'PROJECT'
                  ? form.getFieldValue('additionalSelectProject')
                  : '',
              needOnLocationShop:
                receiverType && receiverType === 'SHOP'
                  ? form.getFieldValue('additionalSelectShop')
                  : '',
            })
          );
          if ((await result).meta.requestStatus === 'fulfilled') {
            onRequirementsSearch((await result).payload || []);
          } else {
            message.error('Error');
          }
        }
      }}
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
            // mode="multiple"
            name="additionalSelectProject"
            label={`${t(`PROJECT`)}`}
            width="lg"
            options={options}
            onChange={async (value: any) => {
              setSelectedProjectId(value);
            }}
          />
        )}
        {receiverType === 'AC' && (
          <ProFormText
            name="planeNumber"
            label="A/C REGISTRATION"
            width="lg"
            // options={options}
          />
        )}
        {receiverType === 'SHOP' && (
          <ProFormSelect
            name="additionalSelectShop"
            label={`${t(`NEEDED ON`)}`}
            width="lg"
            options={options}
          />
        )}
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          name="partRequestNumber"
          label={`${t('REQUIREMENT No')}`}
          width="lg"
          fieldProps={{
            onKeyPress: handleKeyPress,
          }}

          //rules={[{ required: true }]}
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
            width={'sm'}
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
            options={[
              { label: `${t('Altern.')}`, value: 'true' },
              // { label: 'Load all Exp. Dates', value: 'allDate' },
            ].map((option) => ({
              ...option,
              style: { display: 'flex', flexWrap: 'wrap' }, // Добавьте эту строку
            }))}
          />
        </ProForm.Group>

        {receiverType === 'PROJECT' && (
          <ProForm.Group>
            <ProFormRadio.Group
              disabled={!selectedProjectId}
              name="receiverTaskType"
              label={`${t('TASK TYPE')}`}
              options={[
                { value: 'MAIN_TASK', label: `${t(`MAIN TASK`)}` },
                { value: 'NRC', label: 'NRC' },
              ]}
              initialValue="MAIN_TASK"
            />
            {receiverTaskType === 'MAIN_TASK' && (
              <ProFormSelect
                disabled={!selectedProjectId}
                showSearch
                mode="single"
                name="task"
                label={`${t(`TASK`)}`}
                width="sm"
                options={taskOptions}
                onChange={(value: any) => {
                  setSelectedTask(value);
                }}
              />
            )}
            {receiverTaskType === 'NRC' && (
              <ProFormSelect
                disabled={!selectedProjectId}
                showSearch
                mode="single"
                name="addTask"
                label={`${t(`TASK`)}`}
                width="sm"
                options={taskOptions}
                onChange={(value: any) => {
                  setSelectedTask(value);
                }}
              />
            )}
          </ProForm.Group>
        )}
      </ProForm.Group>
      <ProFormSelect
        initialValue={['open', 'planned']}
        mode="multiple"
        name="requestStatus"
        label={`${t('REQUIREMENT STATUS')}`}
        width="lg"
        options={[
          { value: 'planned', label: t('PLANNED') },
          { value: 'open', label: t('NEW') },
          { value: 'closed', label: t('CLOSED') },
          { value: 'canceled', label: t('CANCELED') },
          { value: 'onOrder', label: t('ISSUED') },
          { value: 'transfer', label: t('TRANSFER') },
        ]}
      />
      <ProFormSelect
        mode="multiple"
        name="partGroup"
        label={`${t('PART  GROUP')}`}
        width="lg"
        tooltip={`${t('SELECT SPESIAL GROUP')}`}
        options={[
          { value: 'CONS', label: t('CONS') },
          { value: 'TOOL', label: t('TOOL') },
          { value: 'CHEM', label: t('CHEM') },
          { value: 'ROT', label: t('ROT') },
          { value: 'GSE', label: t('GSE') },
        ]}
      />
      <ProFormSelect
        mode="multiple"
        name="partType"
        label={`${t('PART TYPE')}`}
        width="lg"
        tooltip={`${t('SELECT PART TYPE')}`}
        options={[
          { value: 'ROTABLE', label: t('ROTABLE') },
          { value: 'CONSUMABLE', label: t('CONSUMABLE') },
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

export default RequirementsFilteredForm;
