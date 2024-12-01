// //ts-nocheck

// import React, { FC, useState, useEffect, useMemo } from 'react';
// import { ProForm, ProFormText, ProFormGroup } from '@ant-design/pro-form';
// import {
//   Button,
//   Empty,
//   Modal,
//   Tabs,
//   Upload,
//   message,
//   Col,
//   Space,
//   notification,
//   Tag,
// } from 'antd';
// import {
//   UploadOutlined,
//   ProjectOutlined,
//   FileOutlined,
//   MinusSquareOutlined,
// } from '@ant-design/icons';
// import { useTranslation } from 'react-i18next';
// import { deleteFile, uploadFileServer } from '@/utils/api/thunks';
// import {
//   useAddProjectItemWOMutation,
//   useAddProjectPanelsMutation,
//   useAppendProjectTaskMutation,
//   useGetProjectItemsWOQuery,
//   useGetProjectTaskForCardQuery,
//   useReloadProjectTaskMutation,
// } from '@/features/projectItemWO/projectItemWOApi';
// import {
//   ProFormDatePicker,
//   ProFormDigit,
//   ProFormSelect,
//   ProFormTextArea,
// } from '@ant-design/pro-components';
// import { IProject } from '@/models/IProject';
// import { useGetProjectTypesQuery } from '../projectTypeAdministration/projectTypeApi';

// import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
// import {
//   ValueEnumType,
//   ValueEnumTypeTask,
//   getStatusColor,
//   getTaskTypeColor,
//   handleFileOpen,
//   handleFileOpenTask,
//   handleFileSelect,
//   transformToIProjectTask,
// } from '@/services/utilites';
// import { COMPANY_ID, USER_ID } from '@/utils/api/http';
// import { useAppDispatch } from '@/hooks/useTypedSelector';

// import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
// // import { useGetPlanesQuery } from '@/features/ACAdministration/acApi';
// import { useGetPlanesQuery } from '@/features/acAdministration/acApi';
// import { useGetCompaniesQuery } from '@/features/companyAdministration/companyApi';
// import ActionsComponent from './ActionsComponent';
// import { useGetProjectItemsQuery } from '@/features/projectItemAdministration/projectItemApi';
// import PdfGeneratorWP from './PdfGeneratorWP';
// import {
//   useDeleteProjectTaskMutation,
//   useGetProjectTasksQuery,
//   useUpdateProjectTaskMutation,
// } from '@/features/projectTaskAdministration/projectsTaskApi';
// import { useGetCERTSTypeQuery } from '@/features/requirementsTypeAdministration/certificatesTypeApi';
// import { useAddMultiRequirementMutation } from '@/features/requirementAdministration/requirementApi';
// import Documents from './Documents';
// import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';
// import UniversalAgGrid from '@/components/shared/UniversalAgGrid';

// interface UserFormProps {
//   project?: IProject;
//   onSubmit: (project: IProject) => void;
//   onDelete?: (projectId: string) => void;
// }

// interface ActionHistory {
//   [key: string]: {
//     user?: any;
//     date: string;
//   };
// }

//@ts-nocheck

import React, { FC, useState, useEffect, useMemo } from 'react';
import { ProForm, ProFormText, ProFormGroup } from '@ant-design/pro-form';
import PDFExport from '../shared/PDFExport';
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
  Tag,
  Select,
} from 'antd';
import {
  UploadOutlined,
  ProjectOutlined,
  FileOutlined,
  MinusSquareOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { deleteFile, uploadFileServer } from '@/utils/api/thunks';
import {
  useAddProjectItemWOMutation,
  useAddProjectPanelsMutation,
  useAppendProjectTaskMutation,
  useGetProjectItemsWOQuery,
  useGetProjectTaskForCardQuery,
  useReloadProjectTaskMutation,
} from '@/features/projectItemWO/projectItemWOApi';
import {
  ProFormDatePicker,
  ProFormDigit,
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
import { useGetPlanesQuery } from '@/features/acAdministration/acApi';
import { useGetCompaniesQuery } from '@/features/companyAdministration/companyApi';
import ActionsComponent from './ActionsComponent';
import { useGetProjectItemsQuery } from '@/features/projectItemAdministration/projectItemApi';
import PdfGeneratorWP from './PdfGeneratorWP';
import {
  useDeleteProjectTaskMutation,
  useGetProjectTasksQuery,
  useUpdateProjectTaskMutation,
} from '@/features/projectTaskAdministration/projectsTaskApi';
import { useGetCERTSTypeQuery } from '@/features/requirementsTypeAdministration/certificatesTypeApi';
import { useAddMultiRequirementMutation } from '@/features/requirementAdministration/requirementApi';
import Documents from './Documents';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';

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
    refetch: refetchTasks,
    isLoading: isTasksLoading,
    isFetching: isTasksFetching,
  } = useGetProjectItemsWOQuery(
    {
      WOReferenceID: project?._id,
    },
    {
      skip: !project?._id,
    }
  );

  const ids = useMemo(
    () => projectTasks?.map((item) => item?.id) || [],
    [projectTasks]
  );

  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    if (project?._id && projectTasks && !isTasksLoading && !isTasksFetching) {
      setIsDataReady(true);
    } else {
      setIsDataReady(false);
    }
  }, [project?._id, projectTasks, isTasksLoading, isTasksFetching]);

  const handleSubmit = async (projectType: any) => {
    const newUser: any = project
      ? { ...project, ...projectType, documents: documents }
      : {
          ...projectType,
          status: form.getFieldValue('status')[0],
          acTypeID: selectedAcTypeID,
          documents: documents,
        };
    onSubmit(newUser);
  };
  const valueEnum: ValueEnumType = {
    inspect: t('INSPECTION'),
    onQuatation: t('QUATATION'),
    open: t('OPEN'),
    closed: t('CLOSE'),
    canceled: t('CANCEL'),
    cancelled: t('CANCEL'),
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
    RC: t('TC'),
    CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
    NRC: t('NRC (DEFECT)'),
    NRC_ADD: t('ADHOC (ADHOC TASK)'),
    MJC: t('MJC'),
    CMJC: t('CMJC'),
    FC: t('FC'),
    HARD_ACCESS: t('HARD ACCESS'),
  };
  const columnDefs = [
    { field: 'taskNumber', headerName: t('TASK NUMBER') },
    { field: 'taskDescription', headerName: t('DESCRIPTION') },
    {
      field: 'projectItemType',
      headerName: `${t('TASK TYPE')}`,
      filter: true,
      valueGetter: (params: {
        data: { projectItemType: keyof ValueEnumTypeTask };
      }) => params.data.projectItemType,
      valueFormatter: (params: { value: keyof ValueEnumTypeTask }) => {
        const status = params.value;
        return valueEnumTask[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumTypeTask }) => ({
        backgroundColor: getTaskTypeColor(params.value),
      }),
    },
    {
      field: 'projectName',
      headerName: `${t('WP TITLE')}`,
      filter: true,
    },
    {
      field: 'taskWO',
      headerName: `${t('TRACE No')}`,
      filter: true,
    },
    {
      field: 'taskWONumber',
      headerName: `${t('SEQ No')}`,
      filter: true,
    },
    {
      field: 'checkStatus',
      headerName: t('STATUS'),
      cellRenderer: (params) => {
        const statusColors = {
          draft: '#f0f0f0',
          checked: '#e6f7ff',
          onEdit: '#fff7e6',
          success: '#f6ffed',
        };
        return (
          <div
            style={{
              backgroundColor: statusColors[params.value] || statusColors.draft,
              padding: '5px',
              borderRadius: '4px',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Select
              value={params.value || 'draft'}
              style={{ width: '100%' }}
              onChange={(value) =>
                handleCheckListStatusChange(params.data.id, value)
              }
            >
              <Select.Option value="draft">{t('DRAFT')}</Select.Option>
              <Select.Option value="checked">{t('CHECKED')}</Select.Option>
              <Select.Option value="onEdit">{t('ON EDIT')}</Select.Option>
              <Select.Option value="success">{t('SUCCESS')}</Select.Option>
            </Select>
          </div>
        );
      },
      flex: 1,
      minWidth: 150,
    },
  ];
  const [createWO] = useAddProjectItemWOMutation({});
  const [createMultiReq] = useAddMultiRequirementMutation({});
  const [actionHistory, setActionHistory] = useState<ActionHistory>({
    generateWP: { user: '', date: '' },
    createRequirements: { user: '', date: '' },
    linkRequirements: { user: '', date: '' },
    cancelLink: { user: '', date: '' },
    generateAccess: { user: '', date: '' },
  });
  const generateWP = async (
    actionKey: string,
    user?: string,
    userName?: string,
    date?: string
  ) => {
    if (!isDataReady) {
      notification.warning({
        message: t('NOT READY'),
        description: t('Please wait for the data to load completely.'),
      });
      return;
    }

    console.log('generateWP function called');
    setTriggerQuery(true);
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO CREATE TASKS?'),
      onOk: async () => {
        try {
          if (ids.length > 0) {
            await createWO({
              isSingleWO: true,
              isMultiWO: false,
              projectItemID: ids,
            }).unwrap();
            notification.success({
              message: t('SUCCESSFULLY ADDED'),
              description: t('Items has been successfully added.'),
            });
          } else {
            notification.error({
              message: t('FAILED '),
              description: 'There are no tasks to add.',
            });
          }

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

  const createRequirements = (
    actionKey: string,
    user?: string,
    userName?: string,
    date?: string
  ) => {
    console.log('createRequirements function called');
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO CREATE REQUAREMENTS?'),
      onOk: async () => {
        try {
          await createMultiReq({
            requirement: { WOReferenceID: project?._id },
          }).unwrap();
          handleSubmit({
            actionHistory: {
              ...actionHistory,
              [actionKey]: { user, userName, date },
            },
          });
          notification.success({
            message: t('SUCCESSFULLY ADDED'),
            description: t('Items has been successfully added.'),
          });

          Modal.destroyAll();
        } catch (error) {
          notification.error({
            message: t('FAILED '),
            description: 'There was an error adding req.',
          });
        }
      },
    });

    // Здесь вы может добавить логику для create Requirements
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
    actionKey: string,
    user?: string,
    userName?: string,
    date?: string
  ) => {
    if (!isDataReady) {
      notification.warning({
        message: t('NOT READY'),
        description: t('Please wait for the data to load completely.'),
      });
      return;
    }

    console.log('generateAccess function called');
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO ADD ACCESS'),
      onOk: async () => {
        try {
          await addPanels({
            WOReferenceID: project?._id,
            isFromWO: true,
          }).unwrap();
          handleSubmit({
            actionHistory: {
              ...actionHistory,
              [actionKey]: { user, userName, date },
            },
          });
          notification.success({
            message: t('ACCESS SUCCESSFULLY ADDED'),
            description: t('The access has been successfully added.'),
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
  };

  const generateTaskCardWo = (
    actionKey: string,
    user?: string,
    userName?: string,
    date?: string
  ) => {
    if (!isDataReady) {
      notification.warning({
        message: t('NOT READY'),
        description: t('Please wait for the data to load completely.'),
      });
      return;
    }

    handleSubmit({
      actionHistory: {
        ...actionHistory,
        [actionKey]: { user, userName, date },
      },
    });
  };
  const [reload] = useReloadProjectTaskMutation({});
  const [appendNew] = useAppendProjectTaskMutation({});
  const regenerateTasks = (
    actionKey: string,
    user?: string,
    userName?: string,
    date?: string
  ) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO REBUILD'),
      onOk: async () => {
        try {
          // Вызываем функцию reload и ждем ее завершения
          const result = await reload({
            WOReferenceID: project?._id,
          });

          if (result) {
            // Обновляем actionHistory после успешного вызова reload
            handleSubmit({
              actionHistory: {
                ...actionHistory,
                [actionKey]: { user, userName, date },
              },
            });

            // Показываем уведомление об успехе
            notification.success({
              message: t('TASKS SUCCESSFULLY RELOAD'),
              description: t('The step has been successfully deleted.'),
            });
          }

          // Закрываем все модальные окна
          Modal.destroyAll();
        } catch (error) {
          // Показываем уведомление об ошибке
          notification.error({
            message: t('FAILED TO RELOAD TASKS'),
            description: t('There was an error adding the access.'),
          });
        }
      },
    });
  };
  const addTowo = (
    actionKey: string,
    user?: string,
    userName?: string,
    date?: string
  ) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO ADD TASKS'),
      onOk: async () => {
        try {
          // Вызываем функцию reload и ждем ее завершения
          const result = await appendNew({
            WOReferenceID: project?._id,
          });

          if (result) {
            // Обновляем actionHistory после успешного вызова reload
            handleSubmit({
              actionHistory: {
                ...actionHistory,
                [actionKey]: { user, userName, date },
              },
            });

            // Показываем уведомление об успехе
            notification.success({
              message: t('TASKS SUCCESSFULLY ADDED'),
              description: t('The tesks has been successfully added.'),
            });
          }

          // Закрываем все модальные окна
          Modal.destroyAll();
        } catch (error) {
          // Показываем уведомление об ошибке
          notification.error({
            message: t('FAILED TO ADD TASKS'),
            description: t('There was an error adding the tasks.'),
          });
        }
      },
    });
  };

  const handleActionClick = (actionKey: string) => {
    const user = USER_ID;
    const userName = localStorage.getItem('name');
    const date = new Date().toLocaleString();

    setActionHistory((prevHistory) => ({
      ...prevHistory,
      [actionKey]: { user, userName, date },
    }));

    console.log(
      `${actionKey} ${t('button clicked by')} ${userName} ${t('on')} ${date}`
    );

    switch (actionKey) {
      case 'generateWP':
        generateWP(actionKey, user, userName, date);
        break;
      case 'createRequirements':
        createRequirements(actionKey, user, userName, date);
        break;
      case 'linkRequirements':
        linkRequirements();
        break;
      case 'cancelLink':
        cancelLink();
        break;
      case 'generateAccess':
        generateAccessWO(actionKey, user, userName, date);
        break;
      case 'generateTaskCard':
        generateTaskCardWo(actionKey, user, userName, date);
        break;
      case 'rebuildWO':
        regenerateTasks(actionKey, user, userName, date);
        break;
      case 'appendTOWO':
        addTowo(actionKey, user, userName, date);
        break;
      default:
        console.log('Unknown action key:', actionKey);
    }
  };
  const { data: projectTypes, isLoading } = useGetProjectTypesQuery({});
  const { data: planes } = useGetPlanesQuery({});
  const { data: certificates } = useGetCERTSTypeQuery({});
  const [selectedAcTypeID, setSelectedAcTypeID] = useState<string | any>(null);
  const { data: stores } = useGetStoresQuery({});
  const { data: companies } = useGetCompaniesQuery({});
  const [addPanels] = useAddProjectPanelsMutation({});
  const [deleteTrace] = useDeleteProjectTaskMutation({});

  const planesValueEnum: Record<string, { text: string; value: string }> =
    planes?.reduce((acc, reqType) => {
      if (reqType.acTypeID && reqType.acTypeID.length > 0) {
        acc[reqType.id] = { text: reqType.regNbr, value: reqType.acTypeID[0] };
      } else {
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
  const certificatesValueEnum: Record<string, string> =
    certificates?.reduce((acc, mpdCode) => {
      if (mpdCode.id && mpdCode.code) {
        acc[mpdCode.id] = `${String(mpdCode.code).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};

  const companiesCodesValueEnum: Record<string, string> =
    companies?.reduce<Record<string, string>>((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.companyName;
      return acc;
    }, {}) || {};

  const [documents, setDocuments] = useState<any[]>([
    { id: 1, name: 'MPD', revision: '', revisionDate: '', description: '' },
    { id: 2, name: 'AMM', revision: '', revisionDate: '', description: '' },
    { id: 3, name: 'SRM', revision: '', revisionDate: '', description: '' },
    { id: 4, name: 'TC', revision: '', revisionDate: '', description: '' },
    { id: 5, name: 'IPC', revision: '', revisionDate: '', description: '' },
    { id: 6, name: 'NDTM', revision: '', revisionDate: '', description: '' },
  ]);

  // Функция для обновления документов
  const handleDocumentsChange = (updatedDocuments: Document[]) => {
    setDocuments(updatedDocuments);
  };
  useEffect(() => {
    setDocuments(
      project?.documents || [
        { id: 1, name: 'MPD', revision: '', revisionDate: '', description: '' },
        { id: 2, name: 'AMM', revision: '', revisionDate: '', description: '' },
        { id: 3, name: 'SRM', revision: '', revisionDate: '', description: '' },
        { id: 4, name: 'TC', revision: '', revisionDate: '', description: '' },
        { id: 5, name: 'IPC', revision: '', revisionDate: '', description: '' },
        {
          id: 6,
          name: 'NDTM',
          revision: '',
          revisionDate: '',
          description: '',
        },
      ]
    );
    if (project) {
      form.resetFields();
      form.setFieldsValue(project);
      form.setFieldsValue({
        planeId: project?.planeId?._id || project?.planeId,
        certificateId: project?.certificateId?._id || project?.certificateId,
      });
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
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const transformedTasks = useMemo(() => {
    return transformToIProjectTask(projectTasks || []);
  }, [projectTasks]);
  useEffect(() => {
    setShowSubmitButton(activeTabKey === '1' || activeTabKey === '7');
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
            const updatedFiles =
              project &&
              project?.FILES &&
              project?.FILES.filter((f) => f.id !== file.id);
            const updatedOrderItem = {
              ...project,
              FILES: updatedFiles,
            };
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
    handleFileOpen(file);
  };
  const dispatch = useAppDispatch();

  const handleDeleteTrace = async (selectedKeys: string[]) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS TASK?'),
      onOk: async () => {
        try {
          await deleteTrace(selectedKeys).unwrap();
          refetchTasks();
          notification.success({
            message: t('SUCCESSFULLY ADDED'),
            description: t('TASK SUCCESSFULLY DELETED'),
          });
        } catch (error) {
          notification.error({
            message: t('FAILED DELETE'),
            description: 'There was an error delete.',
          });
        }
      },
    });
  };

  const [updateProjectTask] = useUpdateProjectTaskMutation();

  const handleCheckListStatusChange = async (
    taskId: string,
    newStatus: 'draft' | 'checked' | 'onEdit' | 'success'
  ) => {
    try {
      await updateProjectTask({ id: taskId, checkStatus: newStatus }).unwrap();
      notification.success({
        message: t('STATUS UPDATED'),
        description: t('Task check status has been successfully updated.'),
      });

      refetchTasks();
    } catch (error) {
      notification.error({
        message: t('FAILED TO UPDATE STATUS'),
        description: t('There was an error updating the task check status.'),
      });
    }
  };

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
      key={project?._id}
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
                label={t('WP STATUS')}
                width="sm"
                initialValue={['DRAFT']}
                valueEnum={{
                  DRAFT: { text: t('DRAFT'), status: 'DRAFT' },
                  OPEN: { text: t('OPEN'), status: 'Processing' },
                  inProgress: { text: t('IN PROGRESS'), status: 'PROGRESS' },
                  COMPLETED: { text: t('COMPLETED'), status: 'Default' },
                  CLOSED: { text: t('CLOSE'), status: 'SUCCESS' },
                  CANCELLED: { text: t('CANCEL'), status: 'Error' },
                }}
              />
              <ProFormSelect
                showSearch
                rules={[{ required: true }]}
                name="WOType"
                label={t('WP TYPE')}
                width="lg"
                valueEnum={{
                  baseMaintanance: {
                    text: t('BASE MAINTENANCE'),
                  },
                  lineMaintanance: {
                    text: t('LINE MAINTENANCE'),
                  },
                  //repairPart: { text: t('REPAIR AC') },
                  partCange: { text: t('COMPONENT CHANGE') },
                  addWork: { text: t('ADD WORK') },
                  enginiring: { text: t('ENGINEERING SERVICES') },
                  nonProduction: { text: t('NOT PRODUCTION SERVICES') },
                  // production: { text: t('PRODUCTION PART') },
                }}
              />
            </ProFormGroup>

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
                />
              </ProFormGroup>
              <ProFormGroup>
                <ProFormText
                  width={'xl'}
                  name="customerWO"
                  label={t('CUSTOMER WO No')}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                />
                <ProFormSelect
                  showSearch
                  rules={[{ required: true }]}
                  name="customerID"
                  label={t('CUSTOMER')}
                  width="sm"
                  valueEnum={companiesCodesValueEnum || []}
                />
                <ProFormSelect
                  showSearch
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  name="planeId"
                  label={t('PROJECT A/C')}
                  width="sm"
                  valueEnum={planesValueEnum}
                  onChange={(value: any) => setSelectedAcTypeID(value)}
                />
              </ProFormGroup>
              <ProFormSelect
                showSearch
                name="certificateId"
                label={t('CERTIFICATES TYPE')}
                width="sm"
                valueEnum={certificatesValueEnum}
                // onChange={(value: any) => setSelectedAcTypeID(value)}
              />
              <ProFormDigit
                width={'xl'}
                name="currentMaxTaskWONumber"
                label={t('WO Card Seq')}
              />
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
                  />
                </div>
              </ProForm.Item>
            </ProFormGroup>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('DOCUMENTS')} key="7">
          <div className=" h-[57vh] flex flex-col overflow-auto">
            <Documents
              wo={project}
              onDocumentsChange={handleDocumentsChange}
              documents={project?.documents ? project?.documents : documents}
            />
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane tab={t('ACTIONS')} key="3">
          <ActionsComponent
            selectedKeys={ids}
            WOReferenceID={project?._id}
            wo={project}
            onActionClick={handleActionClick}
            actionHistory={(project && project?.actionHistory) || []}
            t={t}
            htmlTemplate={''}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('TASKS')} key="4">
          <div className="h-[60vh] bg-white px-4 rounded-md border-gray-400 gap-2 flex flex-col">
            <Col style={{ textAlign: 'right' }}>
              <Button
                disabled={
                  !selectedKeys.length ||
                  project.status == 'CLOSED' ||
                  project.status == 'COMPLETED'
                }
                size="small"
                icon={<MinusSquareOutlined />}
                onClick={() => handleDeleteTrace(selectedKeys)}
              >
                {t('DELETE TASK')}
              </Button>
            </Col>
            <UniversalAgGrid
              isLoading={isFetching || isLoading}
              gridId="taskList"
              isChekboxColumn
              rowData={transformedTasks || []}
              columnDefs={columnDefs}
              onRowSelect={(selectedRows) => {
                console.log(selectedRows[0]);
              }}
              onCheckItems={(selectedKeys) => {
                setSelectedKeys(selectedKeys);
              }}
              height="56vh"
              className="h-full"
            />
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('CHECK LIST')} key="5">
          <div className="h-[60vh] flex flex-col">
            <div className="mb-0">
              {/* <PDFExport
                title={t('CHECK LIST TASK REPORT')}
                filename={`check_list_task_report_wo_${
                  project?.WONumber || 'unknown'
                }_${new Date().toISOString().split('T')[0]}`}
                statistics={{
                  WO: project?.WONumber || '',
                  Description: project?.WOName || '',
                  'AC Registration': project?.planeId?.regNbr || '',
                  'Total Tasks': transformedTasks?.length || 0,
                  'Checked Tasks':
                    transformedTasks?.filter(
                      (item) => item.checkStatus === 'checked'
                    ).length || 0,
                }}
                columnDefs={columnDefs}
                data={transformedTasks || []}
                orientation="landscape"
              /> */}
            </div>
            <div className="flex-grow">
              <UniversalAgGrid
                isChekboxColumn
                isLoading={isFetching || isLoading}
                gridId="checkList"
                rowData={transformedTasks || []}
                columnDefs={columnDefs}
                height="calc(59vh)"
                className="h-full"
              />
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};

export default WPForm;
// export default WPForm;
