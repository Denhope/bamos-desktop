// @ts-nocheck

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormGroup,
  ProFormSelect,
  ProFormCheckbox,
  ProFormSwitch, // Импортируйте ProFormSwitch
} from '@ant-design/pro-form';

import { Button, Empty, Modal, Tabs, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { ITask } from '@/models/ITask';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';
import { useGetMPDCodesQuery } from '@/features/MPDAdministration/mpdCodesApi';
import {
  useGetFilteredZonesQuery,
  useGetZonesByGroupQuery,
} from '@/features/zoneAdministration/zonesApi';
import { useGetGroupTaskCodesQuery } from '@/features/tasksAdministration/taskCodesApi';
import { ProFormDigit, ProFormTextArea } from '@ant-design/pro-components';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import StepContainer from './StepContainer';
import { IStep } from '@/models/IStep';
import { useGetGroupsUserQuery } from '@/features/userAdministration/userGroupApi';
import { useGetSkillsQuery } from '@/features/userAdministration/skillApi';
import {
  useAddStepMutation,
  useDeleteStepMutation,
  useGetFilteredStepsQuery,
} from '@/features/tasksAdministration/stepApi';
import { useAddBookingMutation } from '@/features/bookings/bookingApi';
import PartsTable from '@/components/shared/Table/PartsTable';
import { IPartNumber } from '@/models/IUser';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

import { AgGridReact } from 'ag-grid-react';
import PartList from './PartList';
import AutoCompleteEditor from '@/components/shared/Table/ag-grid/AutoCompleteEditor';
import { useGetAccessCodesQuery } from '@/features/accessAdministration/accessApi';
import { useGetFilteredRestrictionsQuery } from '@/features/restrictionAdministration/restrictionApi';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import FileListE from './FileList.tsx';
import {
  deleteFileUploads,
  uploadFileServerReference,
} from '@/utils/api/thunks';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { useGlobalState } from '@/components/woAdministration/GlobalStateContext';
import { useGetActionsTemplatesQuery } from '@/features/templatesAdministration/actionsTemplatesApi';

interface UserFormProps {
  task?: ITask;
  onSubmit: (task: ITask) => void;
  onDelete?: (taskId: string) => void;
}
type CellDataType = 'text' | 'number' | 'date' | 'boolean'; // Определите возможные типы данных

interface ExtendedColDef extends ColDef {
  cellDataType: CellDataType; // Обязательное свойство
}
const AdminTaskPanelForm: FC<UserFormProps> = ({ task, onSubmit }) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const [acTypeID, setACTypeID] = useState<any>(task?.acTypeId || '');
  const [taskType, setTaskType] = useState<string>(task?.taskType || '');
  const { data: partNumbers } = useGetPartNumbersQuery({});
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const { tasksFormValues, setTasksFormValues } = useGlobalState();
  // const { data: tools } = useGetPartNumbersQuery({ group: 'TOOL,GSE' });
  const [addStep] = useAddStepMutation({});
  const [deleteStep] = useDeleteStepMutation();
  const [activeTabKey, setActiveTabKey] = useState('1');
  const partValueEnum: Record<string, any> = useMemo(() => {
    return (
      partNumbers?.reduce(
        (acc: Record<string, any>, partNumber: IPartNumber) => {
          acc[partNumber?._id || partNumber?.id] = partNumber;
          return acc;
        },
        {}
      ) || {}
    );
  }, [partNumbers]);

  // const toolValueEnum: Record<string, IPartNumber> =
  //   tools?.reduce(
  //     (acc: Record<string, IPartNumber>, partNumber: IPartNumber) => {
  //       acc[partNumber?._id || partNumber?.id] = partNumber; // Используйте id вместо _id
  //       return acc;
  //     },
  //     {}
  //   ) || {};
  const handleSubmit = async (values: ITask) => {
    const newUser: ITask = task ? { ...task, ...values } : { ...values };
    onSubmit(newUser);
  };

  useEffect(() => {
    if (task) {
      form.resetFields();
      form.setFieldsValue(task);
      setACTypeID(task.acTypeId || ''); // Используйте пустую строку в качестве значения по умолчанию, если task.acTypeId равно undefined
      task?.taskType && setTaskType(task?.taskType);
      form.setFieldsValue({
        partNumberID: task?.partNumberID?._id,
        nameOfMaterial: task?.partNumberID?.DESCRIPTION,
        WORKPIECE_DIMENSIONS: task?.partNumberID?.WORKPIECE_DIMENSIONS,
        COATING: task?.partNumberID?.COATING,
        MATERIAL: task?.partNumberID?.MATERIAL,
        WEIGHT: task?.partNumberID?.WEIGHT,
        SQUARE: task?.partNumberID?.SQUARE,
        WORKPIECE_WEIGHT: task.partNumberID?.WORKPIECE_WEIGHT,
        WORKPIECE_MATERIAL_TYPE: task.partNumberID?.WORKPIECE_MATERIAL_TYPE,
        instrumentID:
          task.instrumentID?.map(
            (instrument: { _id: string }) => instrument._id
          ) || [],
      });
    } else {
      form.resetFields();
      setACTypeID(''); // Установите пустую строку в качестве значения по умолчанию
      setTaskType('PART_PRODUCE');
    }
  }, [task, form]);

  const SubmitButton = () => (
    <PermissionGuard requiredPermissions={[Permission.TASK_ACTIONS]}>
      <Button type="primary" htmlType="submit">
        {task ? t('UPDATE') : t('CREATE')}
      </Button>
    </PermissionGuard>
  );
  const { data: usersSkill } = useGetSkillsQuery({});
  const groupSlills = usersSkill?.map((skill: any) => ({
    label: skill?.code,
    value: skill?.id, // Use the _id as the value
  }));
  const { data: zones, isLoading: loading } = useGetFilteredZonesQuery(
    { acTypeId: acTypeID },
    { skip: !acTypeID }
  );
  // const { data: zones, isLoading: loading } = useGetZonesByGroupQuery(
  //   { acTypeId: acTypeID },
  //   { skip: !acTypeID }
  // );
  const { data: restriction } = useGetFilteredRestrictionsQuery({});
  const restrictionValueEnum: Record<string, string> =
    restriction?.reduce((acc, reqType) => {
      acc[reqType.id || reqType?._id] = `${reqType.code}`;
      return acc;
    }, {}) || {};

  const { data: acTypes, isLoading: acTypesLoading } = useGetACTypesQuery({});
  const { data: accessesData } = useGetAccessCodesQuery(
    { acTypeID: acTypeID },
    { skip: acTypeID }
  );
  // const zonesValueEnum: Record<string, string> =
  //   zones?.reduce((acc1, majorZone) => {
  //     if (majorZone.subZonesCode) {
  //       return majorZone.subZonesCode.reduce((acc2, subZone) => {
  //         if (subZone.areasCode) {
  //           return subZone.areasCode.reduce((acc3, area) => {
  //             acc3[area.id] = String(area.areaNbr);
  //             return acc3;
  //           }, acc2);
  //         }
  //         return acc2;
  //       }, acc1);
  //     }
  //     return acc1;
  //   }, {} as Record<string, string>) || {};
  const { data: templates, isLoading: isTemplatesLoading } =
    useGetActionsTemplatesQuery({});
  const zonesValueEnum: Record<string, string> =
    zones?.reduce((acc: any, zone: any) => {
      acc[zone?.id || zone?._id] =
        zone?.areaNbr || zone?.subZoneNbr || zone?.majoreZoneNbr;
      return acc;
    }, {} as Record<string, string>) || {};

  const acTypeValueEnum: Record<string, string> =
    acTypes?.reduce((acc, acType) => {
      acc[acType.id] = acType.name;
      return acc;
    }, {} as Record<string, string>) || {};
  const { data: groups } = useGetGroupsUserQuery({});
  const [addBooking] = useAddBookingMutation({});
  const { data: skills } = useGetSkillsQuery({});
  const { data: mpdCodes, isLoading: mpdCodesLoading } = useGetMPDCodesQuery(
    { acTypeID },
    { skip: !acTypeID }
  );
  const { data: taskCodes } = useGetGroupTaskCodesQuery(
    { acTypeID },
    { skip: !acTypeID }
  );
  const accessCodesValueEnum: Record<string, string> =
    accessesData?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.accessNbr;
      return acc;
    }, {} as Record<string, string>) || {};
  const taskCodesValueEnum: Record<string, string> =
    taskCodes?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.code;
      return acc;
    }, {} as Record<string, string>) || {};
  const mpdCodesValueEnum: Record<string, string> =
    mpdCodes?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.code;
      return acc;
    }, {} as Record<string, string>) || {};
  const handleAddStep = async (newStep: IStep) => {
    try {
      const step = await addStep({
        step: newStep,
        taskId: task?.id,
      }).unwrap();
      // await refetch();
      await addBooking({
        booking: { voucherModel: 'ADD_STEP', data: step },
      }).unwrap(); // Передаем данные о новом шаге в addBooking
      notification.success({
        message: t('STEP SUCCESSFULLY ADDED'),
        description: t('The step has been successfully added.'),
      });
      // setIsModalVisible(false); // Если у вас есть функция для закрытия модального окна после добавления шага
    } catch (error) {
      notification.error({
        message: t('FAILED TO ADD STEP'),
        description: 'There was an error adding the step.',
      });
    }
  };
  const dispatch = useAppDispatch();
  const handleDeleteUpload = (key: any) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить этот файл?',
      onOk: async () => {
        try {
          const response = await dispatch(
            deleteFileUploads({
              id: key,
              companyID: COMPANY_ID,
              type: 'taskItem',
              itemID: task && task.id,
            })
          );

          setTasksFormValues({ tasksFormValues, time: new Date() });
        } catch (error) {
          notification.error({
            message: t('ERROR'),
            description: t('Error delete files.'),
          });
        }
      },
    });
  };
  const handleUploadReference = async (data: any) => {
    if (!task || !task.id) {
      console.error('Невозможно загрузить файл');
      return;
    }

    const formData = new FormData();

    formData.append('isDefaultFile', true);
    formData.append('file', data?.file);
    formData.append('referenceType', data?.referenceType);
    formData.append('taskNumber', data?.taskNumber);
    data?.customerCodeID &&
      formData.append('customerCodeID', data?.customerCodeID);
    formData.append('onSavedReference', 'true');
    formData.append('taskNumberID', task.id);
    formData.append('fileName', data.file.name);
    formData.append('companyID', COMPANY_ID);
    formData.append('createDate', new Date().toISOString());
    formData.append('createUserID', USER_ID || '');
    data?.efectivityACID &&
      formData.append('efectivityACID', data?.efectivityACID);

    try {
      const response = await uploadFileServerReference(formData);
      setTasksFormValues({ tasksFormValues, time: new Date() });
      notification.success({
        message: t('SUCCESS'),
        description: t('File uploaded successfully'),
      });
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error File uploaded.'),
      });
    }
  };
  const handleDeleteStep = async (stepIds: string[]) => {
    try {
      for (const stepId of stepIds) {
        const step = await deleteStep(stepId).unwrap();
        await addBooking({
          booking: { voucherModel: 'DELETE_STEP', data: step },
        }).unwrap();
      }
      await refetch();
      notification.success({
        message: t('STEP SUCCESSFULLY DELETED'),
        description: t('The step has been successfully deleted.'),
      });
    } catch (error) {
      notification.error({
        message: t('FAILED TO DELETE STEP'),
        description: t('There was an error deleting the step.'),
      });
    }
  };
  const { data: steps, refetch } = useGetFilteredStepsQuery(
    { taskId: task?.id },
    {
      skip: !task?.id,
    }
  );

  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: true,
      cellEditor: AutoCompleteEditor,
      cellEditorParams: {
        options: partNumbers,
      },
      cellDataType: 'text',
    },
    {
      field: 'DESCRIPTION',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'GROUP',
      headerName: `${t('GROUP')}`,
      cellDataType: 'text',
    },
    {
      field: 'TYPE',
      headerName: `${t('TYPE')}`,
      cellDataType: 'text',
    },
    {
      field: 'QUANTITY',
      editable: true,
      cellDataType: 'number',
      headerName: `${t('QUANTITY')}`,
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    // Добавьте другие колонки по необходимости
  ]);

  // const onGridReady = useCallback((params: any) => {
  //   // Загрузите данные для таблицы здесь
  // }, []);

  return (
    <ProForm
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => [
          activeTabKey !== '3' &&
            activeTabKey !== '4' &&
            activeTabKey !== '5' &&
            activeTabKey !== '2' && <SubmitButton key="submit" />,
          task &&
            activeTabKey !== '3' &&
            activeTabKey !== '4' &&
            activeTabKey !== '2' &&
            activeTabKey !== '5' &&
            dom.reverse()[1],
        ],
      }}
      layout="horizontal"
    >
      <Tabs
        activeKey={activeTabKey}
        defaultActiveKey="1"
        type="card"
        onChange={(key) => setActiveTabKey(key)}
      >
        <Tabs.TabPane tab={t('INFORMATION')} key="1">
          <div className=" h-[57vh] flex flex-col overflow-auto">
            <ProFormGroup>
              <ProFormGroup>
                <ProFormSelect
                  showSearch
                  name="acTypeId"
                  label={t('AC TYPE')}
                  width="sm"
                  valueEnum={acTypeValueEnum}
                  onChange={(value: any) => setACTypeID(value)}
                />
                {taskType !== 'PART_PRODUCE' && (
                  <>
                    <ProFormSelect
                      mode={'multiple'}
                      showSearch
                      name="mpdDocumentationId"
                      label={t('MPD CODE')}
                      width="lg"
                      valueEnum={mpdCodesValueEnum}
                      disabled={!acTypeID} // Disable the select if acTypeID is not set
                    />
                    <ProFormSelect
                      showSearch
                      // initialValue={['PART_PRODUCE']}
                      name="taskType"
                      label={t('TASK TYPE')}
                      width="xl"
                      valueEnum={{
                        SB: { text: t('SERVICE BULLETIN') },
                        SMC: { text: t('SHEDULED MAINTENENCE CHECK') },
                        AD: { text: t('AIRWORTHINESS DIRECTIVE') },
                        PN: { text: t('COMPONENT') },
                      }}
                      onChange={(value: any) => setTaskType(value)}
                    />
                  </>
                )}
                {taskType === 'PART_PRODUCE' && (
                  <>
                    <ProFormSelect
                      showSearch
                      name="taskType"
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                      label={t('TASK TYPE')}
                      width="xl"
                      valueEnum={{
                        SB: { text: t('SERVICE BULLETIN') },
                        SMC: { text: t('SHEDULED MAINTENENCE CHECK') },
                        // ADP: { text: t('ADP') },
                        AD: { text: t('AIRWORTHINESS DIRECTIVE') },
                        PN: { text: t('COMPONENT') },
                        // PART_PRODUCE: { text: t('PART PRODUCE') },
                        // NRC: { text: t('NRC') },
                        // ADD_HOC: { text: t('ADD HOC') },
                      }}
                      onChange={(value: any) => setTaskType(value)}
                    />
                    <ProFormText
                      width={'lg'}
                      name="taskNumber"
                      label={t('TASK NUMBER')}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    />
                    <ProFormTextArea
                      fieldProps={{
                        style: { resize: 'none' },
                        rows: 3,
                      }}
                      width="xl"
                      name="taskDescription"
                      label={t('DESCRIPTION')}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    />
                    <ProFormGroup>
                      <ProFormTextArea
                        fieldProps={{
                          style: { resize: 'none' },
                          rows: 5,
                        }}
                        width="xl"
                        name="notes"
                        label={t('NOTE')}
                      />
                      {/* <ProFormSelect
                        showSearch
                        mode="multiple"
                        rules={[{ required: true }]}
                        width={'md'}
                        name="instrumentID"
                        label={`${t(`TOOL`)}`}
                        // value={partNumber}
                        onChange={(value, data) => {
                          // console.log(data);
                        }}
                        options={Object.entries(toolValueEnum).map(
                          ([key, part]) => ({
                            label: part.PART_NUMBER,
                            value: key,
                            data: part,
                          })
                        )}
                      /> */}
                    </ProFormGroup>

                    {/* <ProFormGroup>
                      <ProFormSelect
                        showSearch
                        rules={[{ required: true }]}
                        width={'lg'}
                        name="partNumberID"
                        label={`${t(`PART No`)}`}
                        // valueEnum={partValueEnum}
                        // value={partNumber}
                        onChange={(value: string | undefined, data: any) => {
                          console.log(data);
                          form.setFields([
                            {
                              name: 'nameOfMaterial',
                              value: data.data.DESCRIPTION,
                            },
                            { name: 'unit', value: data.data.UNIT_OF_MEASURE },
                            { name: 'type', value: data.data.TYPE },
                            { name: 'group', value: data.data.GROUP },
                            {
                              name: 'WORKPIECE_DIMENSIONS',
                              value: data.data.WORKPIECE_DIMENSIONS,
                            },
                            {
                              name: 'MATERIAL',
                              value: data.data.MATERIAL,
                            },
                            {
                              name: 'WEIGHT',
                              value: data.data.WEIGHT,
                            },
                            {
                              name: 'SQUARE',
                              value: data.data.SQUARE,
                            },
                            {
                              name: 'COATING',
                              value: data.data.COATING,
                            },
                            {
                              name: 'WORKPIECE_WEIGHT',
                              value: data.data.WORKPIECE_WEIGHT,
                            },
                            {
                              name: 'WORKPIECE_MATERIAL_TYPE',
                              value: data.data.WORKPIECE_MATERIAL_TYPE,
                            },
                          ]);
                        }}
                        options={Object.entries(partValueEnum).map(
                          ([key, part]) => ({
                            label: part.PART_NUMBER,
                            value: key,
                            data: part,
                          })
                        )}
                      />

                      <ProFormText
                        disabled
                        rules={[{ required: true }]}
                        name="nameOfMaterial"
                        label={t('DESCRIPTION')}
                        width="md"
                        tooltip={t('DESCRIPTION')}
                      ></ProFormText>
                      <ProFormText
                        disabled
                        width="sm"
                        name="WORKPIECE_DIMENSIONS"
                        label={t('WORKPIECE DIMENSIONS')}
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      />
                      <ProFormText
                        disabled
                        rules={[{ required: true }]}
                        name="COATING"
                        label={t('COATING')}
                        width="md"
                        tooltip={t('COATING')}
                      ></ProFormText>
                      <ProFormText
                        disabled
                        rules={[{ required: true }]}
                        name="MATERIAL"
                        label={t('MATERIAL')}
                        width="md"
                        tooltip={t('MATERIAL')}
                      ></ProFormText>
                      <ProFormText
                        disabled
                        rules={[{ required: true }]}
                        name="WEIGHT"
                        label={t('WEIGHT')}
                        width="md"
                        tooltip={t('WEIGHT')}
                      ></ProFormText>
                      <ProFormText
                        disabled
                        rules={[{ required: true }]}
                        name="SQUARE"
                        label={t('SQUARE')}
                        width="md"
                        tooltip={t('SQUARE')}
                      ></ProFormText>
                      <ProFormText
                        disabled
                        rules={[{ required: true }]}
                        name="WORKPIECE_WEIGHT"
                        label={t('WORKPIECE_WEIGHT')}
                        width="md"
                        tooltip={t('WORKPIECE_WEIGHT')}
                      ></ProFormText>

                      <ProFormText
                        disabled
                        // rules={[{ required: true }]}
                        name="WORKPIECE_MATERIAL_TYPE"
                        label={t('WORKPIECE_MATERIAL_TYPE')}
                        width="md"
                        tooltip={t('WORKPIECE_MATERIAL_TYPE')}
                      ></ProFormText>
                    </ProFormGroup> */}
                    <ProFormText
                      width={'xs'}
                      name="rev"
                      label={t('REVISION')}
                    />

                    <ProFormGroup>
                      <ProFormDigit
                        width={'xs'}
                        name="mainWorkTime"
                        label={t('PART TIME')}
                      />
                      {/* <ProFormDigit
                      width={'sm'}
                      name="machineWorkTimeHours"
                      label={t('MACHINE TIME')}
                    /> */}
                    </ProFormGroup>
                  </>
                )}
                {taskType !== 'PART_PRODUCE' && (
                  <>
                    <ProFormGroup>
                      <ProFormText
                        width={'xl'}
                        name="taskNumber"
                        label={t('TASK NUMBER')}
                      />
                      <ProFormText
                        width={'xs'}
                        name="rev"
                        label={t('REVISION')}
                      />
                      <ProFormDigit
                        width={'xs'}
                        name="mainWorkTime"
                        label={t('MHS')}
                      />
                      <ProFormCheckbox
                        name="isCriticalTask"
                        label={t('CRITICAL TASK')}
                        initialValue={task?.isCriticalTask || false}
                      />
                      <ProFormTextArea
                        fieldProps={{
                          style: { resize: 'none' },
                          rows: 6,
                        }}
                        width="xl"
                        name="taskDescription"
                        label={t('DESCRIPTION')}
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      />
                    </ProFormGroup>
                    <ProFormTextArea
                      width={'sm'}
                      fieldProps={{ style: { resize: 'none' } }}
                      name="amtoss"
                      label={t('TASK REFERENCE')}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    />
                    <ProFormSelect
                      showSearch
                      name="zonesID"
                      mode={'multiple'}
                      label={t('ZONES')}
                      width="sm"
                      valueEnum={zonesValueEnum}
                      disabled={!acTypeID}
                    />
                    <ProFormSelect
                      showSearch
                      name="accessID"
                      mode={'multiple'}
                      label={t('ACCESS')}
                      width="sm"
                      valueEnum={accessCodesValueEnum}
                      disabled={!acTypeID}
                    />
                    <ProFormSelect
                      showSearch
                      name="code"
                      label={t('TASK CODE')}
                      width="sm"
                      valueEnum={taskCodesValueEnum}
                      disabled={!acTypeID}
                    />
                    <ProFormSelect
                      // disabled
                      showSearch
                      mode="multiple"
                      name="restrictionID"
                      label={t('RESTRICTION')}
                      width="sm"
                      valueEnum={restrictionValueEnum}
                      // disabled={!acTypeID}
                    />
                    <ProFormSelect
                      // disabled
                      mode="multiple"
                      showSearch
                      name="skillCodeID"
                      label={t('SKILL')}
                      width="sm"
                      options={groupSlills}
                      // valueEnum={taskCodesValueEnum}
                      // disabled={!acTypeID}
                    />
                    <ProFormTextArea
                      fieldProps={{
                        style: { resize: 'none' },
                        rows: 1,
                      }}
                      name="note"
                      label={t('REMARKS')}
                      width="lg"
                    />
                    <ProFormSelect
                      showSearch
                      name="status"
                      label={t('STATUS')}
                      width="sm"
                      valueEnum={{
                        ACTIVE: { text: t('ACTIVE'), status: 'SUCCESS' },
                        INACTIVE: { text: t('INACTIVE'), status: 'Error' },
                      }}
                    />
                  </>
                )}
              </ProFormGroup>
              {/* {taskType !== 'PART_PRODUCE' && (
                <ProFormGroup>
                  <ProFormDigit
                    width={'xs'}
                    name="intervalDAYS"
                    label={t('INTERVAL DAYS')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="toleranceDAY"
                    label={t('TOLERANCE DAY')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="intervalMOS"
                    label={t('INTERVAL MOS')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="toleranceMOS"
                    label={t('TOLERANCE MOS')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="intervalHRS"
                    label={t('INTERVAL HRS')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="toleranceMHS"
                    label={t('TOLERANCE MHS')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="intervalAFL"
                    label={t('INTERVAL AFL')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="intervalENC"
                    label={t('INTERVAL ENC')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="intervalAPUS"
                    label={t('INTERVAL APUS')}
                  />
                </ProFormGroup>
              )} */}
              {/* Добавьте ProFormSwitch для isCriticalTask */}
            </ProFormGroup>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('STEPS')} key="2">
          <div className=" h-[62vh] flex flex-col overflow-auto pb-3">
            {steps ? (
              <StepContainer
                templates={templates}
                steps={steps || []}
                onAddStep={function (newStep: IStep): void {
                  handleAddStep(newStep);
                }}
                onDeleteStep={handleDeleteStep}
                groups={groups || []}
                skills={skills || []}
              />
            ) : (
              <Empty />
            )}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('PARTS')} key="3">
          <div>
            {task ? (
              <div
                className="ag-theme-alpine flex"
                style={{ width: '100%', height: '60vh' }}
              >
                <PartList
                  isTool="TOOL,GSE"
                  fetchData={[]}
                  taskId={task.id}
                  columnDefs={columnDefs}
                  partNumbers={partNumbers || []}
                  onUpdateData={function (data: any[]): void {
                    console.log(data);
                  }}
                ></PartList>
              </div>
            ) : (
              <Empty />
            )}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('TOOL')} key="4">
          <div>
            {task ? (
              <div
                className="ag-theme-alpine flex"
                style={{ width: '100%', height: '60vh' }}
              >
                <PartList
                  isTool="ROT,CONS,CHEM"
                  fetchData={[]}
                  taskId={task.id}
                  columnDefs={columnDefs}
                  onUpdateData={function (data: any[]): void {}}
                ></PartList>
              </div>
            ) : (
              <Empty />
            )}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('DOCS')} key="5">
          <div>
            {task ? (
              <div
              // className="ag-theme-alpine flex"
              // style={{ width: '100%', height: '60vh' }}
              >
                <FileListE
                  isDefaultFileDisable={false}
                  isCuctomerCode={true}
                  isEfectivityField={true}
                  isTaskNumberField={false}
                  handleDelete={handleDeleteUpload}
                  initialFiles={task.reference || []}
                  onAddFile={function (file: any): void {
                    handleUploadReference(file);
                  }}
                  onSelectedKeys={setSelectedKeys}
                ></FileListE>
              </div>
            ) : (
              <Empty />
            )}
          </div>
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};

export default AdminTaskPanelForm;
