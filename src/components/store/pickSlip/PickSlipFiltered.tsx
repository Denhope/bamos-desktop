import {
  FormInstance,
  ProForm,
  ProFormDateRangePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { DatePickerProps, Form } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import SearchSelect from '@/components/shared/form/SearchSelect';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import moment from 'moment';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getFilteredAditionalTasks,
  getFilteredCancelMaterialOrders,
  getFilteredMaterialOrders,
  getFilteredPartNumber,
  getFilteredProjectTasks,
  getFilteredProjects,
  getFilteredShops,
} from '@/utils/api/thunks';
import { IProjectTaskAll } from '@/models/IProjectTask';
import { IAdditionalTaskMTBCreate } from '@/models/IAdditionalTaskMTB';
type PickSlipFilterFormType = {
  onFilterPickSlip?: (record: any) => void;
  canselVoidType?: boolean;
};
const PickSlipFiltered: FC<PickSlipFilterFormType> = ({
  onFilterPickSlip,
  canselVoidType,
}) => {
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const [initialPN, setInitialPN] = useState('');
  const [initialWO, setInitialWO] = useState('');
  const [isReset, setIsReset] = useState(false);
  const companyID = localStorage.getItem('companyID') || '';
  const dispatch = useAppDispatch();
  const [selectedPN, setSelectedPN] = useState<any>(null);
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [receiverTaskType, setReceiverTaskType] = useState('MAIN_TASK');
  const handleSelect = (selectedOption: any) => {
    setSelectedPN(selectedOption);
    setIsReset(true); // затем обратно в true
    setIsReset(false); // сначала установите в false
    //console.log(selectedOption);
  };
  const handleSelectWO = (selectedOption: any) => {
    setSelectedWO(selectedOption);
    setIsReset(true); // затем обратно в true
    setIsReset(false); // сначала установите в false
  };
  //co
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };

  const handleSearch = async (value: any) => {
    if (value) {
      const result = await dispatch(
        getFilteredPartNumber({
          companyID: companyID,
          partNumber: value,
        })
      );

      // Удаление дубликатов
      const uniqueResults = result.payload.reduce(
        (acc: any[], current: any) => {
          const x = acc.find(
            (item) => item.PART_NUMBER === current.PART_NUMBER
          );
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        },
        []
      );

      return uniqueResults;
    }
  };
  interface Option {
    value: string;
    label: string;
  }
  const currentCompanyID = localStorage.getItem('companyID');
  const [taskOptions, setTaskOptions] = useState<Option[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<any | null>(null);
  const [receiverType, setReceiverType] = useState('PROJECT');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [options, setOptions] = useState<Option[]>([]); // указываем тип состояния явно
  const handleSearchWO = async (value: any) => {
    const result = await dispatch(
      getFilteredProjects({
        companyID: companyID,
      })
    );
    return result;
  };
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
  useEffect(() => {
    // console.log(selectedTask);
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
                  label: `${item.projectTaskWO}`,
                  data: item, // замените на нужное поле для 'PROJECT'
                }));
                break;
              case 'NRC':
                options = data.map((item: IAdditionalTaskMTBCreate) => ({
                  value: item._id || item.id, // замените на нужное поле для 'PROJECT'
                  label: `${item.additionalNumberId}`,
                  data: item, // замените на нужное поле для 'PROJECT'
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
  const [selectedTaskId, setSelectedTaskId] = useState<any | null>(null);
  return (
    <ProForm
      size="small"
      onValuesChange={(changedValues, allValues) => {
        // Handle changes in the form
        if (changedValues.receiverType) {
          setReceiverType(changedValues.receiverType);
        }
        if (changedValues.receiverTaskType) {
          setReceiverTaskType(changedValues.receiverTaskType);
        }
      }}
      formRef={formRef}
      initialValues={{
        createDate: [moment().subtract(1, 'months'), moment()],
      }}
      onReset={() => {
        setSelectedPN(null);
        setInitialPN('');
        setSelectedWO(null);
        setInitialWO('');
        setIsReset(true);
        setTimeout(() => {
          setIsReset(false);
        }, 0);
        setTaskOptions([]);

        setSelectedEndDate(null);
        setSelectedStartDate(null);
        setSelectedTask(null);
      }}
      form={form}
      layout="horizontal"
      onFinish={async (values) => {
        const currentCompanyID = localStorage.getItem('companyID') || '';

        if (canselVoidType) {
          const result = dispatch(
            getFilteredCancelMaterialOrders({
              companyID: currentCompanyID,
              projectId: selectedProjectId,
              status: form.getFieldValue('status'),

              projectTaskWO:
                receiverTaskType === 'MAIN_TASK'
                  ? selectedTask?.projectTaskWO
                  : receiverTaskType === 'NRC'
                  ? selectedTask?.additionalNumberId
                  : null,
              regNbr: form.getFieldValue('receiver'),
              startDate: selectedStartDate,
              endDate: selectedEndDate,
              materialAplicationNumber: form.getFieldValue(
                'materialAplicationNumber'
              ),
              partNumber: selectedPN?.PART_NUMBER,
            })
          );
        } else {
          const result = dispatch(
            getFilteredMaterialOrders({
              companyID: currentCompanyID,
              projectId: selectedProjectId,
              status: form.getFieldValue('status'),
              getFrom: form.getFieldValue('getFrom'),
              neededOn: form.getFieldValue('neededOn'),

              projectTaskWO:
                receiverTaskType === 'MAIN_TASK'
                  ? selectedTask?.projectTaskWO
                  : receiverTaskType === 'NRC'
                  ? selectedTask?.additionalNumberId
                  : null,
              regNbr: form.getFieldValue('receiver'),
              startDate: selectedStartDate,
              endDate: selectedEndDate,
              materialAplicationNumber: form.getFieldValue(
                'materialAplicationNumber'
              ),
              partNumber: selectedPN?.PART_NUMBER,
            })
          );
        }
      }}
    >
      <ProFormText
        name="materialAplicationNumber"
        label={`${t('PICKSLIP No')}`}
        width="lg"
        tooltip="PICKSLIP No"
        //rules={[{ required: true }]}
        fieldProps={{
          onKeyPress: handleKeyPress,
          autoFocus: true,
        }}
      />
      <ProForm.Group>
        {/* <ProFormSelect
          name="sendFrom"
          label={`${t('SEND FROM')}`}
          width="lg"
          disabled
          tooltip="ENTER STORE "
          //rules={[{ required: true }]}
        />
        <ProFormSelect
          name="sendTO"
          disabled
          label={`${t('SEND TO')}`}
          width="lg"
          tooltip="ENTER STORE "
          //rules={[{ required: true }]}
        /> */}
      </ProForm.Group>
      <ProForm.Group>
        <ProFormRadio.Group
          layout="horizontal"
          name="receiverType"
          label={`${t('RECEIVER TYPE')}`}
          tooltip="ENTER TYPE"
          options={[
            { value: 'PROJECT', label: `${t(`PROJECT`)}` },
            { value: 'AC', label: 'AIRCRAFT' },
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
          <>
            <ProFormSelect
              name="getFrom"
              label={`${t(`GET FROM`)}`}
              width="sm"
              options={options}
            />
            <ProFormSelect
              name="neededOn"
              label={`${t(`SEND TO`)}`}
              width="sm"
              options={options}
            />
          </>
        )}
      </ProForm.Group>
      <ProForm.Group>
        {/* <ProFormText
          name="receiver"
          label={`${t('RECEIVER')}`}
          width="lg"
          tooltip="ENTER A/C NUMBER "
          //rules={[{ required: true }]}
        />
        <SearchSelect
          initialValue={initialWO}
          isReset={isReset}
          onSearch={handleSearchWO}
          optionLabel1="projectWO"
          optionLabel2="projectName"
          onSelect={handleSelectWO}
          label={`${t('PROJECT')}`}
          tooltip={`${t('PROJECT')}`}
          rules={[]}
          name={'projectWO'}
          width="lg"
        /> */}
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
                label={`${t(`WO No`)}`}
                width="sm"
                options={taskOptions}
                onChange={(value: any, data: any) => {
                  setSelectedTask(data?.data);
                  setSelectedTaskId(value);
                  // console.log(data);
                  // console.log(data);
                }}
              />
            )}
            {receiverTaskType === 'NRC' && (
              <ProFormSelect
                disabled={!selectedProjectId}
                showSearch
                mode="single"
                name="addTask"
                label={`${t(`WO No`)}`}
                width="sm"
                options={taskOptions}
                onChange={(value: any, data: any) => {
                  setSelectedTask(data?.data);
                  setSelectedTaskId(value);
                  // console.log(data);
                }}
              />
            )}
          </ProForm.Group>
        )}
      </ProForm.Group>

      <SearchSelect
        width="lg"
        initialValue={initialPN}
        onDoubleClick={() => {
          setOpenStoreFind(true);
        }}
        isReset={isReset}
        onSearch={handleSearch}
        optionLabel1="PART_NUMBER"
        onSelect={handleSelect}
        label={`${t('PART No')}`}
        tooltip={`${t('DOUBE CLICK OPEN PART No BOOK')}`}
        rules={[]}
        name={'PART_NUMBER'}
      />
      {/* <ProFormText
        name="BATCH_ID"
        label={`${t('SN or BN')}`}
        width="lg"
        tooltip="SERIAL OR BATCH NUMBER"
        //rules={[{ required: true }]}
      /> */}
      <ProFormDateRangePicker
        name="createDate"
        label={`${t(' DATE')}`}
        width="lg"
        tooltip="CREATE DATE"
        fieldProps={{
          onChange: onChange,
        }}
      />

      <ProForm.Group>
        <ProFormSelect
          // initialValue={['issued']}
          mode="multiple"
          name="status"
          label={`${t('STATUS')}`}
          width="lg"
          tooltip="SELECT STATUS "
          options={[
            { value: 'open', label: t('NEW') },
            { value: 'closed', label: t('CLOSED') },
            { value: 'cancelled', label: t('CANCELLED') },
            { value: 'partyCancelled', label: t('PARTY_CANCELLED') },
            { value: 'deleted', label: t('DELETED') },
            { value: 'issued', label: t('ISSUED') },
            { value: 'transfer', label: t('TRANSFER') },
          ]}

          //rules={[{ required: true }]}
        />
      </ProForm.Group>
    </ProForm>
  );
};

export default PickSlipFiltered;
