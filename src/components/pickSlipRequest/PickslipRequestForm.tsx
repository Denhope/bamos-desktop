// @ts-nocheck

import {
  FormInstance,
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Dayjs } from 'dayjs';
import { Button, DatePickerProps, Form, Modal, Space, message } from 'antd';
import PickSlipViwer from '@/components/layout/APN/PickSlipViwer';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFilteredPickSlip } from '@/utils/api/thunks';
import { FULL_NAME, USER_ID } from '@/utils/api/http';

import ContextMenuStoreSearchSelect from '@/components/shared/form/ContextMenuStoreSearchSelect';

import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { useGetProjectsQuery } from '@/features/projectAdministration/projectsApi';
import { useGetProjectTasksQuery } from '@/features/projectTaskAdministration/projectsTaskApi';
import { useGetREQCodesQuery } from '@/features/requirementsCodeAdministration/requirementsCodesApi';
import { useGetREQTypesQuery } from '@/features/requirementsTypeAdministration/requirementsTypeApi';
import { useGetGroupUsersQuery } from '@/features/userAdministration/userApi';
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
      // projectId: selectedProjectId,
      // getFrom: selectedSingleStore?.shopShortName,
      // neededOn: selectedSingleStoreNeeded?.shopShortName,
      // taskId: selectedTaskId,
      // selectedTask: selectedTask,
      plannedDate: selectedStartDate,
      // selectedProject: selectedSingleProject,
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
      form.resetFields();
      form.setFieldsValue(pickData);
      setReqTypeID(pickData?.reqTypesID);
      setSelectedProjectId(pickData?.projectID?._id);
      form.setFields([
        { name: 'remarks', value: pickData?.remarks },
        { name: 'status', value: pickData?.status },
        { name: 'reqTypesID', value: pickData?.reqTypesID },
        { name: 'reqCodesID', value: pickData?.reqCodesID },

        { name: 'projectID', value: pickData?.projectID?._id },
        { name: 'reciver', value: pickData?.registrationNumber },
        // { name: 'neededOn', value: pickData?.neededOn },
        { name: 'getFrom', value: pickData?.getFrom },
        { name: 'mechSing', value: pickData?.createBy },
        { name: 'plannedDate', value: pickData?.plannedDate },
        {
          name: 'storeman',
          value: pickData?.storeMan || FULL_NAME,
        },
        { name: 'projectTaskID', value: pickData?.projectTaskId },
        { name: 'neededOnID', value: pickData?.neededOnID?._id },
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
      // setSelectedTask(null);
      setTimeout(() => {
        setIsResetForm(false);
      }, 0);

      // setinitialFormProject('');
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
    // setinitialFormNeed('');
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
      // setinitialFormProject((await result).payload[0]?.projectID?.projectWO);
      // setinitialFormNeed((await result).payload[0]?.neededOn);
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

  const [selectedTaskId, setSelectedTaskId] = useState<any | null>(null);
  // const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const [receiverType, setReceiverType] = useState<any>('MAIN_TASK');

  // const [initialFormNeed, setinitialFormNeed] = useState<any>('');
  const [initialFormGet, setinitialFormGet] = useState<any>('');
  const [selectedSingleStore, setSecectedSingleStore] = useState<any>(null);
  const [selectedSingleStoreNeeded, setSecectedSingleStoreNeeded] =
    useState<any>(null);
  const [reqTypeID, setReqTypeID] = useState<any>('');
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
    reqTypeID,
  ]);

  const { data: usersGroups } = useGetGroupUsersQuery({});
  const { data: reqTypes } = useGetREQTypesQuery({});

  const { data: reqCodes } = useGetREQCodesQuery(
    {
      reqTypeID,
    },
    { skip: !reqTypeID }
  );
  const { data: projectTasks } = useGetProjectTasksQuery(
    { projectId: selectedProjectId },
    { skip: !selectedProjectId }
  );

  const { data: partNumbers, isLoading, isError } = useGetPartNumbersQuery({});

  const { data: projects } = useGetProjectsQuery({});
  const projectTasksCodesValueEnum: Record<string, string> =
    projectTasks?.reduce((acc, projectTask) => {
      acc[projectTask.id] = projectTask?.taskWo || projectTask?.projectTaskWO;
      return acc;
    }, {}) || {};

  const projectsValueEnum: Record<string, string> =
    projects?.reduce((acc, project) => {
      acc[project._id] = `${project.projectWO}- ${project.projectName}`;
      return acc;
    }, {}) || {};
  const requirementTypesValueEnum: Record<string, string> =
    reqTypes?.reduce((acc, reqType) => {
      acc[reqType.id] = reqType.code;
      return acc;
    }, {}) || {};

  const requirementCodesValueEnum: Record<string, string> =
    reqCodes?.reduce((acc, reqCode) => {
      acc[reqCode.id] = reqCode.code;
      return acc;
    }, {}) || {};

  const neededCodesValueEnum: Record<string, string> =
    usersGroups?.reduce((acc, usersGroup) => {
      acc[usersGroup.id] = usersGroup.title;
      return acc;
    }, {}) || {};

  // const [projectId, setSelectedProjectId] = useState<any>();
  return (
    <div>
      <ProForm
        onReset={() => {
          setIsResetForm(true);

          setTimeout(() => {
            setIsResetForm(false);
          }, 0);

          setSecectedSingleProject(null);
          // setinitialFormProject('');
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
                // setinitialFormProject('');
                setSecectedSingleProject({ projectWO: '' });
              }}
            >
              {t('NEW')}
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
              { value: 'closed', label: t('CLOSED') },
              { value: 'cancelled', label: t('CANCELLED') },
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
          <ProFormSelect
            showSearch
            rules={[{ required: true }]}
            name="neededOnID"
            label={t('NEEDED')}
            width="sm"
            valueEnum={neededCodesValueEnum || []}
            disabled={!isCreating}
            onChange={(value: any) => {
              setSecectedSingleStoreNeeded(value);
            }}
          />
        </ProFormGroup>

        <ProFormGroup>
          <ProForm.Group direction="horizontal">
            <ProFormSelect
              disabled={!isCreating}
              rules={[{ required: true }]}
              // mode="multiple"
              name="projectID"
              label={`${t(`PROJECT`)}`}
              width="lg"
              valueEnum={projectsValueEnum}
              onChange={async (value: any) => {
                setSelectedProjectId(value);
              }}
            />
            <ProFormSelect
              showSearch
              disabled={!isCreating}
              name="reqTypesID"
              label={t('REQUIREMENT TYPE')}
              width="sm"
              valueEnum={requirementTypesValueEnum}
              onChange={(value: any) => setReqTypeID(value)}
            />
            <ProFormSelect
              showSearch
              name="reqCodesID"
              label={t('REQUIREMENT CODE')}
              width="sm"
              valueEnum={requirementCodesValueEnum || []}
              disabled={!reqTypeID || !isCreating}
            />
          </ProForm.Group>

          {
            <ProForm.Group>
              {
                <ProFormSelect
                  showSearch
                  // rules={[{ required: true }]}
                  disabled={!selectedProjectId || !isCreating}
                  mode="single"
                  name="projectTaskID"
                  label={`${t(`TASK`)}`}
                  width="sm"
                  valueEnum={projectTasksCodesValueEnum}
                  onChange={(value: any) => {
                    setSelectedTaskId(value);
                  }}
                />
              }
              {
                <ProFormSelect
                  showSearch
                  disabled
                  mode="single"
                  name="taskCassificationID"
                  label={`${t(`TASK CLASSIFICATION`)}`}
                  width="sm"
                  // valueEnum={[]}
                  onChange={(value: any) => {
                    // setSelectedTask(value);
                  }}
                />
              }
            </ProForm.Group>
          }
        </ProFormGroup>
        <ProFormGroup>
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
        </ProFormGroup>
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
