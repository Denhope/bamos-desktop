//@ts-nocheck

import React, { FC, useEffect, useState, useMemo } from 'react';
import { ProForm, ProFormText, ProFormGroup } from '@ant-design/pro-form';
import {
  Button,
  Empty,
  Modal,
  Tabs,
  Upload,
  message,
  Col,
  Space,
  notification,
} from 'antd';
import {
  UploadOutlined,
  ProjectOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { deleteFile, uploadFileServer } from '@/utils/api/thunks';
import {
  useAddProjectItemWOMutation,
  useAddProjectPanelsMutation,
  useGetProjectItemsWOQuery,
  useGetProjectTaskForCardQuery,
} from '@/features/projectItemWO/projectItemWOApi';
import {
  ProFormDatePicker,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { IProject } from '@/models/IProject';
import { useGetProjectTypesQuery } from '../projectTypeAdministration/projectTypeApi';

import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import {
  ValueEnumType,
  ValueEnumTypeTask,
  getStatusColor,
  getTaskTypeColor,
  handleFileOpen,
  handleFileOpenTask,
  handleFileSelect,
  transformToIProjectTask,
} from '@/services/utilites';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { useAppDispatch } from '@/hooks/useTypedSelector';

import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
import { useGetPlanesQuery } from '@/features/ACAdministration/acApi';
// import { useGetPlanesQuery } from '@/features/acAdministration/acApi';
import { useGetCompaniesQuery } from '@/features/companyAdministration/companyApi';
import ActionsComponent from './ActionsComponent';
import { useGetProjectItemsQuery } from '@/features/projectItemAdministration/projectItemApi';
import PdfGeneratorWP from './PdfGeneratorWP';
import { useGetProjectTasksQuery } from '@/features/projectTaskAdministration/projectsTaskApi';
import TaskList from '../shared/Table/TaskList';
interface UserFormProps {
  project?: IProject;
  onSubmit: (project: IProject) => void;
  onDelete?: (projectId: string) => void;
}

interface ActionHistory {
  [key: string]: {
    user?: any;
    date: string;
  };
}

const WPForm: FC<UserFormProps> = ({ project, onSubmit }) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const [triggerQuery, setTriggerQuery] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const {
    data: projectItems,

    isFetching,
    refetch,
  } = useGetProjectItemsQuery(
    {
      WOReferenceID: project?._id,
    },
    {
      // skip: !triggerQuery,
      // refetchOnMountOrArgChange: true,
    }
  );

  const {
    data: projectTasks,

    isFetching: isFetch,
  } = useGetProjectItemsWOQuery(
    {
      WOReferenceID: project?._id,
    },
    {
      skip: !project,
    }
  );
  const ids = projectTasks?.map((item) => item?.id);
  const handleSubmit = async (projectType: any) => {
    const newUser: any = project
      ? { ...project, ...projectType }
      : {
          ...projectType,
          status: form.getFieldValue('status')[0],
          acTypeID: selectedAcTypeID,
        };
    onSubmit(newUser);
  };
  const valueEnum: ValueEnumType = {
    inspect: t('INSPECTED'),
    onQuatation: t('QUATATION'),
    open: t('OPEN'),
    closed: t('CLOSED'),
    canceled: t('CANCELLED'),
    inProgress: t('IN PROGRESS'),
    complete: t('COMPLETE'),
    RECEIVED: t('RECEIVED'),
    PARTLY_RECEIVED: t('PARTLY RECEIVED'),
    performed: t('PERFORMED'),
    onOrder: '',
    onShort: '',
    draft: '',
    issued: '',
    progress: '',
  };
  const valueEnumTask: ValueEnumTypeTask = {
    RC: t('RC'),
    RC_ADD: t('RC (CRIRICAL TASK/DI)'),
    NRC: t('NRC (DEFECT)'),
    NRC_ADD: t('ADHOC (ADHOC TASK)'),
    MJC: t('MJC)'),
    CMJC: t('CMJC)'),
    FC: t('FC'),
  };
  const columnDefs: any[] = [
    {
      field: 'status',
      headerName: `${t('Status')}`,
      cellDataType: 'text',
      width: 100,
      filter: true,
      valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
        params.data.status,
      valueFormatter: (params: { value: keyof ValueEnumType }) => {
        const status = params.value;
        return valueEnum[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumType }) => ({
        backgroundColor: getStatusColor(params.value),
        color: '#ffffff', // Text color
      }),
    },
    {
      field: 'taskCardNumber',
      headerName: `${t('CARD No')}`,
      filter: true,
      width: 100,
      // hide: true,
      valueGetter: (params: any) => {
        const reference = params.data.reference; // Предполагаем, что reference находится в params.data
        if (!reference || reference.length === 0) return ''; // Проверка на наличие reference

        const taskCardNumber =
          reference.find((ref) => ref.referenceType === 'TASK_CARD')
            ?.taskCardNumber ?? '';
        return taskCardNumber;
      },
    },

    {
      field: 'taskWO',
      headerName: `${t('TRACE No')}`,
      filter: true,
      width: 100,
    },
    {
      field: 'taskNumber',
      headerName: `${t('TASK NUMBER')}`,
      filter: true,
      width: 150,
    },
    {
      field: 'taskDescription',
      headerName: `${t('DESCRIPTION')}`,
      filter: true,
      // hide: true,
    },
    // {
    //   field: 'PART_NUMBER',
    //   headerName: `${t('PART No')}`,
    //   filter: true,
    //   // hide: true,
    // },
    // {
    //   field: 'qty',
    //   headerName: `${t('QUANTITY')}`,
    //   filter: true,
    //   // hide: true,
    // },
    {
      field: 'projectName',
      width: 100,
      headerName: `${t('WP TITLE')}`,
      filter: true,
      // hide: true,
    },

    {
      field: 'projectItemType',
      headerName: `${t('TASK TYPE')}`,
      filter: true,
      width: 100,
      valueGetter: (params: {
        data: { projectItemType: keyof ValueEnumTypeTask };
      }) => params.data.projectItemType,
      valueFormatter: (params: { value: keyof ValueEnumTypeTask }) => {
        const status = params.value;
        return valueEnumTask[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumTypeTask }) => ({
        backgroundColor: getTaskTypeColor(params.value),
        color: '#ffffff', // Text color
      }),
      // hide: true,
    },
    // {
    //   field: 'PART_NUMBER',
    //   headerName: `${t('PART No')}`,
    //   filter: true,
    // },
    // { field: 'qty', headerName: `${t('QUANTITY')}`, filter: true },
    // { field: 'MPD', headerName: `${t('MPD')}`, filter: true },
    // { field: 'amtoss', headerName: `${t('AMM')}`, filter: true },
    // { field: 'ZONE', headerName: `${t('ZONE')}`, filter: true },
    // { field: 'ACCESS', headerName: `${t('ACCESS')}`, filter: true },
    // { field: 'ACCESS_NOTE', headerName: `${t('ACCESS_NOTE')}`, filter: true },
    // { field: 'SKILL_CODE1', headerName: `${t('SKILL CODE')}`, filter: true },
    // { field: 'TASK_CODE', headerName: `${t('TASK CODE')}`, filter: true },
    // {
    //   field: 'SUB TASK_CODE',
    //   headerName: `${t('SUB TASK_CODE')}`,
    //   filter: true,
    // },

    // { field: 'PHASES', headerName: `${t('PHASES')}`, filter: true },
    // {
    //   field: 'RESTRICTION_1',
    //   headerName: `${t('RESTRICTION_1')}`,
    //   filter: true,
    // },
    // {
    //   field: 'PREPARATION_CODE',
    //   headerName: `${t('PREPARATION_CODE')}`,
    //   filter: true,
    // },
    // {
    //   field: 'REFERENCE_2',
    //   headerName: `${t('REFERENCE_2')}`,
    //   filter: true,
    // },
    // {
    //   field: 'mainWorkTime',
    //   headerName: `${t('MHS')}`,
    //   filter: true,
    // },
    // {
    //   field: 'IDENTIFICATOR',
    //   headerName: `${t('IDENTIFICATOR')}`,
    //   filter: true,
    // },

    // { field: 'closedByID', headerName: 'Closed By ID' },

    // {
    //   field: 'status',
    //   headerName: `${t('STATUS')}`,
    //   filter: true,
    //   valueFormatter: (params: any) => {
    //     if (!params.value) return '';
    //     return params.value.toUpperCase();
    //   },
    // },
    // { field: 'projectTaskWO', headerName: 'Project Task WO' },

    // { field: 'companyID', headerName: 'Company ID' },
    {
      field: 'createDate',
      headerName: `${t('CREATE DATE')}`,
      filter: true,
      width: 100,
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
    {
      field: 'reference',
      headerName: `${t('DOC')}`,
      width: 140,
      cellRenderer: (params: any) => {
        const files = params.value; // Предполагаем, что params.value содержит массив объектов файлов
        if (!files || files.length === 0) return null; // Проверка на наличие файлов

        // Предполагаем, что вы хотите взять первый файл из массива
        const file = files[0];

        return (
          <div
            className="cursor-pointer hover:text-blue-500"
            onClick={() => {
              handleFileOpenTask(file.fileId, 'uploads', file.filename);
            }}
          >
            <FileOutlined />
          </div>
        );
      },
    },

    // { field: 'updateDate', headerName: 'Update Date' },

    // Добавьте дополнительные поля по мере необходимости
  ];
  const [createWO] = useAddProjectItemWOMutation({});
  const [actionHistory, setActionHistory] = useState<ActionHistory>({
    generateWP: { user: '', date: '' },
    createRequirements: { user: '', date: '' },
    linkRequirements: { user: '', date: '' },
    cancelLink: { user: '', date: '' },
    generateAccess: { user: '', date: '' },
  });
  const generateWP = async (
    ids: any[],
    actionKey: string,
    user?: string,
    userName?: string,
    date?: string
  ) => {
    console.log('generateWP function called');
    setTriggerQuery(true);
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO CREATE TASKS?'),
      onOk: async () => {
        try {
          await createWO({
            isSingleWO: true,
            isMultiWO: false,
            projectItemID: ids,
          }).unwrap();
          // refetchProjectItems();
          notification.success({
            message: t('SUCCESSFULLY ADDED'),
            description: t('Items has been successfully added.'),
          });

          // Вызов handleSubmit с actionHistory
          handleSubmit({
            actionHistory: {
              ...actionHistory,
              [actionKey]: { user, userName, date },
            },
          });

          Modal.destroyAll();
        } catch (error) {
          notification.error({
            message: t('FAILED '),
            description: 'There was an error adding tasks.',
          });
        }
      },
    });
  };

  const createRequirements = () => {
    console.log('createRequirements function called');
    // Здесь вы можете добавить логику для create Requirements
  };

  const linkRequirements = () => {
    console.log('linkRequirements function called');
    // Здесь вы можете добавить логику для link Requirements
  };

  const cancelLink = () => {
    console.log('cancelLink function called');
    // Здесь вы можете добавить логику для cancel Link
  };

  const generateAccessWO = (
    ids: any[],
    actionKey: string,
    user?: string,
    userName?: string,
    date?: string
  ) => {
    console.log('generateAccess function called');
    // const handleGenerateWOPanels = async (ids?: any[]) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO ADD ACCESS'),
      onOk: async () => {
        try {
          await addPanels({
            // projectID: projectID,
            WOReferenceID: project?._id,
            isFromWO: true,
          }).unwrap();
          // Вызов handleSubmit с actionHistory
          handleSubmit({
            actionHistory: {
              ...actionHistory,
              [actionKey]: { user, userName, date },
            },
          });
          // refetchProjectItems();
          notification.success({
            message: t('ACCESS SUCCESSFULLY DELETED'),
            description: t('The step has been successfully deleted.'),
          });
          Modal.destroyAll();
        } catch (error) {
          notification.error({
            message: t('FAILED TO ADD ACCESS'),
            description: t('There was an error adding the access.'),
          });
        }
      },
    });
    //   handleGenerateWOPanels();
    // };
  };

  const generateTaskCardWo = (
    ids: any[],
    actionKey: string,
    user?: string,
    userName?: string,
    date?: string
  ) => {
    handleSubmit({
      actionHistory: {
        ...actionHistory,
        [actionKey]: { user, userName, date },
      },
    });
  };
  const handleActionClick = (actionKey: string) => {
    const ids = projectItems?.map((item) => item.id);
    const user = USER_ID; // Здесь вы можете использовать реальные данные пользователя
    const userName = localStorage.getItem('name'); // Здесь вы можете использовать реальные данные пользователя
    const date = new Date().toLocaleString();

    setActionHistory((prevHistory) => ({
      ...prevHistory,
      [actionKey]: { user, userName, date },
    }));

    console.log(
      `${actionKey} ${t('button clicked by')} ${userName} ${t('on')} ${date}`
    );

    // Вызов соответствующих функций в зависимости от actionKey
    switch (actionKey) {
      case 'generateWP':
        generateWP(ids, actionKey, user, userName, date);
        break;
      case 'createRequirements':
        createRequirements();
        break;
      case 'linkRequirements':
        linkRequirements();
        break;
      case 'cancelLink':
        cancelLink();
        break;
      case 'generateAccess':
        generateAccessWO(ids, actionKey, user, userName, date);
      case 'generateTaskCard':
        generateTaskCardWo(ids, actionKey, user, userName, date);
        break;
      default:
        console.log('Unknown action key:', actionKey);
    }
  };
  const { data: projectTypes, isLoading } = useGetProjectTypesQuery({});
  const { data: planes } = useGetPlanesQuery({});

  // Инициализация состояния для хранения выбранного acTypeID
  const [selectedAcTypeID, setSelectedAcTypeID] = useState<string | any>(null);
  const { data: stores } = useGetStoresQuery({});
  const { data: companies } = useGetCompaniesQuery({});
  const [addPanels] = useAddProjectPanelsMutation({});

  // Формирование объекта planesValueEnum
  const planesValueEnum: Record<string, { text: string; value: string }> =
    planes?.reduce((acc, reqType) => {
      // Check if reqType.acTypeID exists and has at least one element
      if (reqType.acTypeID && reqType.acTypeID.length > 0) {
        acc[reqType.id] = { text: reqType.regNbr, value: reqType.acTypeID[0] };
      } else {
        // If reqType.acTypeID is undefined or empty, set value to an empty string or handle it as appropriate for your use case
        acc[reqType.id] = { text: reqType.regNbr, value: '' };
      }
      return acc;
    }, {}) || {};
  const storeCodesValueEnum: Record<string, string> =
    stores?.reduce((acc, mpdCode) => {
      if (mpdCode.id && mpdCode.storeShortName) {
        acc[mpdCode.id] = `${String(mpdCode.storeShortName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};

  // const projectTypesValueEnum: Record<string, string> =
  //   projectTypes?.reduce((acc, reqType) => {
  //     acc[reqType.id] = reqType.code;
  //     return acc;
  //   }, {}) || {};

  const companiesCodesValueEnum: Record<string, string> =
    companies?.reduce<Record<string, string>>((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.companyName;
      return acc;
    }, {}) || {};
  useEffect(() => {
    if (project) {
      form.resetFields();
      form.setFieldsValue(project);
      form.setFieldsValue({ planeId: project?.planeId?._id });
    } else {
      form.resetFields();
    }
  }, [project, form]);

  const handleUpload = async (file: File) => {
    if (!project || !project?._id) {
      console.error(
        'Невозможно загрузить файл: компания не существует или не имеет id'
      );
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await uploadFileServer(formData);

      if (response) {
        const updatedproject: IProject = {
          ...project,
          FILES: response,
        };
        const updatedOrderItem = {
          ...project,
          FILES: [...(project?.FILES || []), response],
        };
        updatedOrderItem && project && onSubmit(updatedOrderItem);
      } else {
        notification.error({
          message: t('FAILED TO UPLOAD'),
          description: t('There was an error uploading the file.'),
        });
      }
    } catch (error) {
      notification.error({
        message: t('FAILED TO UPLOAD'),
        description: t('There was an error uploading the file.'),
      });
      throw error;
    }
  };
  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {project ? t('UPDATE') : t('CREATE')}
    </Button>
  );
  const [activeTabKey, setActiveTabKey] = useState('1'); // Default to the first tab
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const transformedTasks = useMemo(() => {
    return transformToIProjectTask(projectTasks || []);
  }, [projectTasks]);
  useEffect(() => {
    setShowSubmitButton(activeTabKey === '1');
  }, [activeTabKey]);
  const [reqTypeID, setReqTypeID] = useState<any>('');
  const handleDelete = (file: any) => {
    Modal.confirm({
      title: 'ARE YOU SURE, YOU WANT TO DELETE FILE?',
      onOk: async () => {
        try {
          const response = await dispatch(
            deleteFile({ id: file.id, companyID: COMPANY_ID })
          );
          if (response.meta.requestStatus === 'fulfilled') {
            // Удаляем файл из массива files
            const updatedFiles =
              project &&
              project?.FILES &&
              project?.FILES.filter((f) => f.id !== file.id);
            const updatedOrderItem = {
              ...project,
              FILES: updatedFiles,
            };
            // await updateProjectItem(updatedOrderItem).unwrap();
            project && onSubmit(updatedOrderItem);
          } else {
            throw new Error('Не удалось удалить файл');
          }
        } catch (error) {
          notification.error({
            message: t('FAILED TO DELETE'),
            description: t('There was an error deleting the file.'),
          });
        }
      },
    });
  };
  const handleDownload = (file: any) => {
    // Здесь должен быть код для скачивания файла

    handleFileOpen(file);
  };
  const dispatch = useAppDispatch();

  return (
    <ProForm
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => {
          if (showSubmitButton) {
            return [<SubmitButton key="submit" />, dom.reverse()[1]];
          }
          return null;
        },
      }}
      initialValues={project}
      layout="horizontal"
    >
      <Tabs
        onChange={(key) => {
          setActiveTabKey(key);
        }}
        defaultActiveKey="1"
        type="card"
      >
        <Tabs.TabPane tab={t('INFORMATION')} key="1">
          <div className=" h-[57vh] flex flex-col overflow-auto">
            <ProFormGroup>
              <ProFormSelect
                showSearch
                disabled={!project}
                rules={[{ required: true }]}
                name="status"
                label={t('WO STATUS')}
                width="sm"
                initialValue={['DRAFT']}
                valueEnum={{
                  DRAFT: { text: t('DRAFT'), status: 'DRAFT' },
                  OPEN: { text: t('OPEN'), status: 'Processing' },
                  inProgress: { text: t('PROGRESS'), status: 'PROGRESS' },
                  // PLANNED: { text: t('PLANNED'), status: 'Waiting' },
                  COMPLETED: { text: t('COMPLETED'), status: 'Default' },
                  CLOSED: { text: t('CLOSED'), status: 'SUCCESS' },
                  CANCELLED: { text: t('CANCELLED'), status: 'Error' },
                }}
              />
              <ProFormSelect
                showSearch
                // disabled={!project}
                rules={[{ required: true }]}
                name="WOType"
                label={t('WP TYPE')}
                width="lg"
                // initialValue={['baseMaintanance']}
                valueEnum={{
                  baseMaintanance: {
                    text: t('BASE MAINTENANCE'),
                  },
                  lineMaintanance: {
                    text: t('LINE MAINTENANCE'),
                  },

                  // PLANNED: { text: t('PLANNED'), status: 'Waiting' },
                  repairPart: { text: t('REPAIR COMPONENT') },
                  repairAC: { text: t('REPAIR AC') },
                  partCange: { text: t('COMPONENT CHANGE') },
                  addWork: { text: t('ADD WORK') },
                  enginiring: { text: t('ENGINEERING SERVICES') },
                  nonProduction: { text: t('NOT PRODUCTION SERVICES') },
                  production: { text: t('PRODUCTION PART') },
                }}
              />
            </ProFormGroup>

            {/* <ProFormSelect
            showSearch
            name="projectTypesID"
            label={t('PROJECT TYPE')}
            width="lg"
            valueEnum={projectTypesValueEnum}
            onChange={(value: any) => setReqTypeID(value)}
            // disabled={!acTypeID} // Disable the select if acTypeID is not set
          /> */}
            <ProFormGroup>
              <ProFormText
                width={'xl'}
                name="WOName"
                label={t('TITLE')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
              {/* <ProFormText
              width={'sm'}
              name="code"
              label={t('CODE')}
              rules={[
                {
                  required: true,
                },
              ]}
            /> */}

              <ProFormText
                width={'xl'}
                name="description"
                label={t('DESCRIPTION')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />

              <ProFormGroup>
                <ProFormDatePicker
                  label={t('PLANNED START DATE')}
                  name="planedStartDate"
                  width="sm"
                ></ProFormDatePicker>
                <ProFormDatePicker
                  // disabled
                  label={t('START DATE')}
                  name="startDate"
                  width="sm"
                ></ProFormDatePicker>
              </ProFormGroup>
              <ProFormGroup>
                <ProFormDatePicker
                  label={t('PLANNED FINISH DATE')}
                  name="planedFinishDate"
                  width="sm"
                ></ProFormDatePicker>
                <ProFormDatePicker
                  // disabled
                  label={t('FINISH DATE')}
                  name="finishDate"
                  width="sm"
                ></ProFormDatePicker>
              </ProFormGroup>
              <ProFormGroup>
                <ProFormSelect
                  showSearch
                  mode="multiple"
                  name="storesID"
                  label={t('STORE FOR PARTS')}
                  width="lg"
                  valueEnum={storeCodesValueEnum || []}
                  // onChange={handleStoreChange}
                />
              </ProFormGroup>
              <ProFormGroup>
                <ProFormText
                  width={'xl'}
                  name="customerWO"
                  label={t('CUSTOMER WO No')}
                />
                <ProFormSelect
                  showSearch
                  rules={[{ required: true }]}
                  name="customerID"
                  label={t('CUSTOMER')}
                  width="sm"
                  valueEnum={companiesCodesValueEnum || []}
                  // disabled={!projectId}
                />
                <ProFormSelect
                  showSearch
                  name="planeId"
                  label={t('PROJECT A/C')}
                  width="sm"
                  valueEnum={planesValueEnum}
                  onChange={(value: any) => setSelectedAcTypeID(value)}
                  // disabled={!acTypeID} // Disable the select if acTypeID is not set
                />
              </ProFormGroup>
              <ProFormTextArea
                width={'xl'}
                fieldProps={{ style: { resize: 'none' } }}
                name="remarks"
                label={t('REMARKS')}
              />
              <ProForm.Item label={t('UPLOAD')}>
                <div className="overflow-y-auto max-h-64">
                  <Upload
                    name="FILES"
                    fileList={project?.FILES || []}
                    // listType="picture"
                    className="upload-list-inline cursor-pointer"
                    beforeUpload={handleUpload}
                    accept="image/*"
                    onPreview={handleDownload}
                    onRemove={handleDelete}
                    multiple
                    onDownload={function (file: any): void {
                      handleFileSelect({
                        id: file?.id,
                        name: file?.name,
                      });
                    }}
                  >
                    <Button icon={<UploadOutlined />}>
                      {t('CLICK TO UPLOAD')}
                    </Button>
                  </Upload>
                </div>
              </ProForm.Item>
            </ProFormGroup>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane tab={t('ACTIONS')} key="3">
          <ActionsComponent
            selectedKeys={ids}
            wo={project}
            onActionClick={handleActionClick}
            actionHistory={(project && project?.actionHistory) || []}
            t={t}
            htmlTemplate={''}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('TASKS')} key="4">
          <div className="h-[60vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 flex flex-col">
            <TaskList
              isFilesVisiable={false}
              isLoading={isLoading || isFetching}
              pagination={true}
              isChekboxColumn={true}
              columnDefs={columnDefs}
              rowData={transformedTasks || []}
              onRowSelect={function (rowData: any | null): void {
                // handleEdit(rowData);
                console.log(rowData);
              }}
              height={'69vh'}
              onCheckItems={function (selectedKeys: React.Key[]): void {
                setSelectedKeys(selectedKeys);
              }}
            />
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('CHECK LIST')} key="5"></Tabs.TabPane>
        <Tabs.TabPane tab={t('REPORTS')} key="6"></Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};
export default WPForm;
