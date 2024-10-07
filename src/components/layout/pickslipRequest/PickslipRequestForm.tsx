//@ts-nocheck

import {
  FormInstance,
  ProForm,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormGroup,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Dayjs } from 'dayjs';
import { Button, DatePickerProps, Form, Modal, Space, message } from 'antd';
import PickSlipViwer from '@/components/layout/APN/PickSlipViwer';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getFilteredAditionalTasks,
  getFilteredPickSlip,
  getFilteredProjectTasks,
} from '@/utils/api/thunks';
import { FULL_NAME, USER_ID } from '@/utils/api/http';
import ContextMenuProjectSearchSelect from '@/components/shared/form/ContextMenuProjectSearchSelect';
import { IAdditionalTaskMTBCreate } from '@/models/IAdditionalTaskMTB';
import { IProjectTaskAll } from '@/models/IProjectTask';
import ContextMenuStoreSearchSelect from '@/components/shared/form/ContextMenuStoreSearchSelect';
import { RangePickerProps } from 'antd/es/date-picker';
type PickSlipFilterFormType = {
  onFilterPickSlip: (record: any) => void;
  pickSlipNumber?: string;
  updateValue?: any;
  onCurrentPickSlip: (data: any) => void;
  setCancel: boolean;
  onCreate: (data: boolean) => void;
  data?: any;
};
const PickslipRequestForm: FC<PickSlipFilterFormType> = ({
  onFilterPickSlip,
  data,
  setCancel,
  pickSlipNumber,
  updateValue,
  onCurrentPickSlip,
  onCreate,
}) => {
  const handleFormChange = () => {
    const formValues = form.getFieldsValue();
    // Добавьте поле projectId в объект значений полей формы
    const updatedFormValues = {
      ...formValues,
      projectId: selectedProjectId,
      getFrom: selectedSingleStore?.shopShortName,
      neededOn: selectedSingleStoreNeeded?.shopShortName,
      taskId: selectedTaskId,
      selectedTask: selectedTask,
      plannedDate: selectedStartDate,
      selectedProject: selectedSingleProject,
    };
    onCurrentPickSlip(updatedFormValues);
  };

  const { t } = useTranslation();
  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const onChange = (date: Dayjs | null, dateString: string | string[]) => {
    if (Array.isArray(dateString)) {
      // Handle range selection
      setSelectedStartDate(dateString[0]);
      setSelectedEndDate(dateString[1]);
    } else {
      // Handle single date selection
      setSelectedStartDate(dateString);
      setSelectedEndDate(dateString); // If you only want to handle single dates, you can set both to the same value
    }
  };
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [pickData, setPickData] = useState<any | null>(null);
  const [pickDataNumber, setPickNumber] = useState<any | null>(null);
  const [openPickViewer, setOpenPickViewer] = useState<boolean>(false);
  useEffect(() => {
    if (pickData) {
      form.setFields([
        { name: 'remarks', value: pickData?.remarks },
        { name: 'status', value: pickData?.status },
        { name: 'woNumber', value: pickData?.projectTaskWO },
        { name: 'project', value: pickData?.projectWO },
        { name: 'reciver', value: pickData?.registrationNumber },
        // { name: 'neededOn', value: pickData?.neededOn },
        // { name: 'getFrom', value: pickData?.getFrom },
        { name: 'mechSing', value: pickData?.createBy },
        { name: 'plannedDate', value: pickData?.plannedDate },
        {
          name: 'storeman',
          value: pickData?.storeMan || FULL_NAME,
        },
        { name: 'task', value: pickData.projectTaskWO },
        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [pickData, updateValue]);
  useEffect(() => {
    if (data && data?.materialAplicationNumber) {
      handleLoadClick(data?.materialAplicationNumber);
    }
  }, [data?.materialAplicationNumber]);
  useEffect(() => {
    if (pickSlipNumber) {
      form.setFields([]);
    }
    if (pickDataNumber) {
      form.setFields([
        {
          name: 'materialAplicationNumber',
          value: pickDataNumber.materialAplicationNumber,
        },
      ]);
    }
  }, [pickDataNumber]);
  useEffect(() => {
    if (setCancel) {
      isCreating && setIsCreating(false);
      onCurrentPickSlip(null);
      setCurrentPickSlip(null);
      setSelectedStartDate(null);
      form.resetFields();
      setIsResetForm(true);
      setSelectedTask(null);
      setTimeout(() => {
        setIsResetForm(false);
      }, 0);

      setinitialFormProject('');
    }
  }, [setCancel]);
  const [currentPickSlip, setCurrentPickSlip] = useState<any | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<any | null>(null);
  const createNewPickSlip = () => {
    setCurrentPickSlip({
      createDate: new Date(),
      state: 'draft',
      shipTo: {},
      companyID: localStorage.getItem('companyID') || '',
      createUserID: USER_ID,

      // Добавьте другие базовые поля здесь
    });
    setinitialFormNeed('');
    setinitialFormGet('');
    form.setFields([{ name: 'materialAplicationNumber', value: 'TEMP' }]);
    form.setFields([{ name: 'mechSing', value: FULL_NAME }]);
    form.setFields([{ name: 'status', value: 'draft' }]);
  };
  const handleLoadClick = async (materialAplicationNumber: any) => {
    const currentCompanyID = localStorage.getItem('companyID') || '';
    const result = dispatch(
      getFilteredPickSlip({
        companyID: currentCompanyID,
        materialAplicationNumber: materialAplicationNumber,
      })
    );
    if ((await result).meta.requestStatus === 'fulfilled') {
      form.setFields([
        { name: 'materialAplicationNumber', value: materialAplicationNumber },
      ]);

      onFilterPickSlip((await result).payload[0]);
      setPickData((await result).payload[0]);
      setSelectedProjectId((await result).payload[0]?.projectID?._id);
      setinitialFormProject((await result).payload[0]?.projectID?.projectWO);
      setinitialFormNeed((await result).payload[0]?.neededOn);
      setinitialFormGet((await result).payload[0]?.getFrom);
    } else if (!!(await result).payload.length[0]) {
      message.error('Error');
      setIsResetForm(true);

      setTimeout(() => {
        setIsResetForm(false);
      }, 0);

      setSecectedSingleProject(null);
      // setinitialFormProject('');
      // setSecectedSingleProject({ projectWO: '' });
    }
  };
  const [selectedSingleProject, setSecectedSingleProject] = useState<any>();
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const [initialFormProject, setinitialFormProject] = useState<any>('');
  interface Option {
    value: string;
    label: string;
    data: any;
  }
  const [selectedTaskId, setSelectedTaskId] = useState<any | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const [taskOptions, setTaskOptions] = useState<Option[]>([]);
  const [receiverType, setReceiverType] = useState<any>('MAIN_TASK');
  useEffect(() => {
    const currentCompanyID = localStorage.getItem('companyID');
    if (receiverType) {
      let action;
      let url;
      switch (receiverType) {
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
            switch (receiverType) {
              case 'MAIN_TASK':
                options = data.map((item: IProjectTaskAll) => ({
                  value: item._id || item.id, // замените на нужное поле для 'PROJECT'
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
                  label: item.defaultField2,
                  data: item, // замените на нужное поле для 'default'
                }));
            }
            setTaskOptions(options);
          })
          .catch((error) => {
            console.error('Ошибка при получении данных:', error);
          });
      }
    }
  }, [selectedProjectId, receiverType, dispatch]);
  const [initialFormNeed, setinitialFormNeed] = useState<any>('');
  const [initialFormGet, setinitialFormGet] = useState<any>('');
  const [selectedSingleStore, setSecectedSingleStore] = useState<any>(null);
  const [selectedSingleStoreNeeded, setSecectedSingleStoreNeeded] =
    useState<any>(null);
  useEffect(() => {
    if (selectedProjectId) {
      // onSelectSelectedStore && onSelectSelectedStore(selectedStore);
      form.setFields([
        { name: 'reciver', value: selectedSingleProject?.acRegistrationNumber },
      ]);
      handleFormChange();
    }
  }, [
    selectedProjectId,
    selectedSingleStoreNeeded,
    selectedSingleStore,
    selectedTaskId,
    receiverType,
    selectedStartDate,
    selectedEndDate,
  ]);
  return (
    <div>
      <ProForm
        onReset={() => {
          setIsResetForm(true);

          setTimeout(() => {
            setIsResetForm(false);
          }, 0);

          setSecectedSingleProject(null);
          setinitialFormProject('');
          setSecectedSingleProject({ projectWO: '' });
        }}
        layout="horizontal"
        formRef={formRef}
        size="small"
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        form={form}
        submitter={{
          submitButtonProps: {
            disabled: !!(
              currentPickSlip && Object.keys(currentPickSlip).length === 0
            ),
          },
          render: (_, dom) => [],
        }}
        onValuesChange={(changedValues, allValues) => {
          // Handle changes in the form
          if (changedValues.receiverType) {
            setReceiverType(changedValues.receiverType);
          }
        }}
        onChange={handleFormChange}
        title="PICKSLIP DATA"
      >
        <ProFormGroup size={'small'}>
          <ProFormText
            disabled={isCreating}
            name="materialAplicationNumber"
            label={`${t('PICKSLIP')}`}
            width="xs"
            tooltip="PICKSLIP No"
            //rules={[{ required: true }]}
            fieldProps={{
              onDoubleClick: () => setOpenPickViewer(true),
              // onKeyPress: handleKeyPress,
              autoFocus: true,
            }}
          />
          <Button
            // type="primary"
            onClick={() =>
              handleLoadClick(form.getFieldValue('materialAplicationNumber'))
            }
            disabled={isCreating}
          >
            {t('SEARCH')}
          </Button>
          <Space className="P-5">
            <Button
              type="primary"
              disabled={isCreating}
              onClick={() => {
                onCurrentPickSlip(null);
                form.resetFields();
                createNewPickSlip();
                setIsCreating(true);
                setIsResetForm(true);
                onCreate(true);

                setTimeout(() => {
                  setIsResetForm(false);
                }, 0);
                // setinitialFormNeed('');
                // setinitialFormGet('');

                setSecectedSingleProject(null);
                setinitialFormProject('');
                setSecectedSingleProject({ projectWO: '' });
              }}
            >
              {t('NEW ')}
            </Button>{' '}
          </Space>
          <ProFormSelect
            disabled
            name="status"
            label={`${t('STATUS')}`}
            width="sm"
            tooltip="SELECT STATUS "
            options={[
              { value: 'open', label: t('NEW') },
              { value: 'OPEN', label: t('NEW') },
              { value: 'closed', label: t('CLOSE') },
              { value: 'cancelled', label: t('CANCEL') },
              { value: 'partyCancelled', label: t('PARTY_CANCELLED') },
              { value: 'deleted', label: t('DELETED') },
              { value: 'issued', label: t('ISSUED') },
              { value: 'transfer', label: t('TRANSFER') },
              { value: 'draft', label: t('DRAFT') },
            ]}
          />
        </ProFormGroup>

        <ProFormGroup size={'small'}>
          <ProFormText
            disabled={!isCreating}
            name="mechSing"
            label={`${t('MECH.SING')}`}
            width="sm"
          />

          <ContextMenuStoreSearchSelect
            disabled={!isCreating}
            isResetForm={isResetForm}
            rules={[{ required: true }]}
            name={'getFrom'}
            label={`${t('GET FROM')}`}
            width={'xs'}
            onSelectedStore={function (record: any): void {
              setSecectedSingleStore(record);
              // setSecectedStore(record);
            }}
            initialFormStore={
              selectedSingleStore?.shopShortName || initialFormGet
            }
          />
          <ContextMenuStoreSearchSelect
            isResetForm={isResetForm}
            disabled={!isCreating}
            rules={[{ required: true }]}
            name={'neededOn'}
            label={`${t('NEEDED ON')}`}
            width={'xs'}
            onSelectedStore={function (record: any): void {
              setSecectedSingleStoreNeeded(record);
              // setSecectedStore(record);
              setSecectedSingleStoreNeeded(record);
            }}
            initialFormStore={
              selectedSingleStoreNeeded?.shopShortName || initialFormNeed
            }
          />
        </ProFormGroup>
        <ProFormGroup>
          <ContextMenuProjectSearchSelect
            disabled={!isCreating}
            isResetForm={isResetForm}
            rules={[{ required: true }]}
            onSelectedProject={function (project: any): void {
              setSelectedProjectId(project?._id || project?.id);
              setSecectedSingleProject(project);
            }}
            name={'projectNumber'}
            initialForm={selectedSingleProject?.projectWO || initialFormProject}
            width={'sm'}
            label={`${t(`PROJECT`)}`}
          ></ContextMenuProjectSearchSelect>{' '}
          <ProFormText
            disabled={!isCreating}
            name="reciver"
            label={`${t('RECIVER')}`}
            width="xs"
          />
          {
            <ProForm.Group>
              <ProFormRadio.Group
                name="receiverType"
                disabled={!isCreating || !selectedSingleProject}
                label={`${t('TASK TYPE')}`}
                options={[
                  { value: 'MAIN_TASK', label: `${t(`MAIN TASK`)}` },
                  { value: 'NRC', label: 'NRC' },
                ]}
                initialValue="MAIN_TASK"
              />
              {receiverType === 'MAIN_TASK' && (
                <ProFormSelect
                  showSearch
                  disabled={!isCreating || !selectedSingleProject}
                  mode="single"
                  name="task"
                  label={`${t(`TASK`)}`}
                  width="sm"
                  options={taskOptions}
                  onChange={(value: any, data: any) => {
                    setSelectedTask(data?.data);
                    setSelectedTaskId(value);
                    // console.log(data);
                  }}
                />
              )}
              {receiverType === 'NRC' && (
                <ProFormSelect
                  showSearch
                  disabled={!isCreating || !selectedSingleProject}
                  mode="single"
                  name="addTask"
                  label={`${t(`TASK`)}`}
                  width="sm"
                  options={taskOptions}
                  onChange={(value: any, data: any) => {
                    setSelectedTaskId(value);
                    setSelectedTask(data?.data);
                  }}
                />
              )}
            </ProForm.Group>
          }
        </ProFormGroup>
        <ProFormText
          disabled={!isCreating}
          fieldProps={{ style: { resize: 'none' } }}
          name="remarks"
          label={`${t('REMARKS')}`}
          width="lg"
        />
        <ProFormDatePicker
          disabled={!isCreating}
          name="plannedDate"
          label={`${t('PLANNED DATE')}`}
          width="lg"
          tooltip="PLANNED DATE"
          fieldProps={{
            onChange: onChange,
          }}
        />
      </ProForm>
      <Modal
        title=""
        open={openPickViewer}
        width={'90%'}
        onCancel={() => setOpenPickViewer(false)}
        footer={null}
      >
        <div className="h-[78vh]  overflow-hidden">
          <PickSlipViwer onSingleRowClick={setPickNumber}></PickSlipViwer>
        </div>
      </Modal>
    </div>
  );
};

export default PickslipRequestForm;
