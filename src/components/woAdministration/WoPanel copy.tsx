// ts-nocheck

import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Col,
  Modal,
  Space,
  Spin,
  message,
  Switch,
  Divider,
  notification,
  FloatButton,
} from 'antd';
import {
  PlusSquareOutlined,
  MinusSquareOutlined,
  PrinterOutlined,
  AlertTwoTone,
  UsergroupAddOutlined,
  CheckCircleFilled,
  ShoppingCartOutlined,
  ShrinkOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Split } from '@geoffcox/react-splitter';
import WOTree from './WOTree';
import WOAdminForm from './WOAdminForm';
import MyTable from '../shared/Table/MyTable';
import { useGetProjectItemsWOQuery } from '@/features/projectItemWO/projectItemWOApi';
import { IProjectItemWO } from '@/models/AC';
import WODiscription from './WODiscription';
import RequarementsList from './requirements/RequarementsList';
import { IRequirement } from '@/models/IRequirement';
import {
  ModalForm,
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-components';
import {
  ValueEnumType,
  ValueEnumTypeTask,
  getStatusColor,
  getTaskTypeColor,
  handleOpenReport,
  transformToIProjectTask,
  transformToIRequirement,
  transformToITask,
} from '@/services/utilites';
import { ColDef } from 'ag-grid-community';
import AutoCompleteEditor from '../shared/Table/ag-grid/AutoCompleteEditor';
import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
import { useGetFilteredRequirementsQuery } from '@/features/requirementAdministration/requirementApi';
import {
  useGetStorePartStockQTYQuery,
  useGetStorePartsQuery,
} from '@/features/storeAdministration/PartsApi';
import TaskList from '../shared/Table/TaskList';
import { useAddMultiActionMutation } from '@/features/projectItemWO/actionsApi';
import { generateReport } from '@/utils/api/thunks';
import PdfGenerator from './PdfGenerator';
import { useGlobalState } from './GlobalStateContext';
import {
  useAddProjectTaskMutation,
  useUpdateProjectTaskMutation,
} from '@/features/projectTaskAdministration/projectsTaskApi';
import PermissionGuard, { Permission } from '../auth/PermissionGuard';
import TaskMultiCloseModal from './TaskMultiCloseModal';
import { IStep } from '@/models/IStep';
import { useGetUsersQuery } from '@/features/userAdministration/userApi';

interface AdminPanelProps {
  projectSearchValues: any;
}

const WoPanel: React.FC<AdminPanelProps> = ({ projectSearchValues }) => {
  const { t } = useTranslation();
  const [editingProject, setEditingProject] = useState<IProjectItemWO | null>(
    null
  );

  const editingProjectRef = useRef(editingProject);
  const [editingProjectNRC, setEditingProjectNRC] = useState<any | null>(null);
  const { currentTime, setProjectTasksFormValues, projectTasksFormValues } =
    useGlobalState();
  const [selectedStoreID, setSelectedStoreID] = useState<any | undefined>(
    undefined
  );

  useEffect(() => {
    setProjectTasksFormValues(projectSearchValues);
    setEditingProject(null);
    setSelectedKeys([]);
  }, [projectSearchValues]);

  const [createPickSlip, setOpenCreatePickSlip] = useState<boolean>(false);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [selectedKeysRequirements, setSelectedKeysRequirements] = useState<
    React.Key[]
  >([]);
  const [triggerQuery, setTriggerQuery] = useState(false);
  const { data: users } = useGetUsersQuery({});
  const {
    data: projectTasks,
    isLoading,
    isFetching,
    refetch,
  } = useGetProjectItemsWOQuery(
    {
      status: projectTasksFormValues?.status,
      startDate: projectTasksFormValues?.startDate,
      finishDate: projectTasksFormValues?.endDate,
      projectID: projectTasksFormValues?.projectID,
      vendorID: projectTasksFormValues?.vendorID,
      partNumberID: projectTasksFormValues?.partNumberID,
      taskWO: projectTasksFormValues?.projectTaskWO,
      planeId: projectTasksFormValues?.planeId,
      restrictionID: projectTasksFormValues?.restrictionID,
      phasesID: projectTasksFormValues?.phasesID,
      useID: projectTasksFormValues?.useID,
      skillCodeID: projectTasksFormValues?.skillCodeID,
      accessID: projectTasksFormValues?.accessID,
      zonesID: projectTasksFormValues?.zonesID,
      projectItemType: projectTasksFormValues?.projectItemType,
      WOReferenceID: projectTasksFormValues?.WOReferenceID,
      time: projectTasksFormValues?.time,
      defectCodeID: projectTasksFormValues?.defectCodeID,
      ata: projectTasksFormValues?.ata,
    },
    {
      skip: !triggerQuery,
      refetchOnMountOrArgChange: true,
    }
  );
  // const { data: quantity, refetch } = useGetStorePartStockQTYQuery(
  //   {
  //     partNumberID: '',
  //     storeID: selectedStoreID,
  //     includeAlternates: true,
  //   },
  //   {
  //     skip: !selectedStoreID,
  //   }
  // );

  let storesIDString = '';
  if (Array.isArray(editingProject?.projectID?.storesID)) {
    storesIDString = editingProject?.projectID?.storesID.join(',');
  }
  const [addMultiAction] = useAddMultiActionMutation({});
  const [addTask] = useAddProjectTaskMutation();
  const [updateTask] = useUpdateProjectTaskMutation();

  const { data: stores } = useGetStoresQuery(
    {
      ids: storesIDString,
    },
    {
      skip: !editingProject?.projectID?.storesID,
    }
  );
  const { data: requirements } = useGetFilteredRequirementsQuery(
    {
      projectTaskID: editingProject?.id,
      ifStockCulc: true,
      includeAlternates: true,
    },
    {
      skip: !editingProject?.id,
    }
  );

  const storeCodesValueEnum: Record<string, string> =
    stores?.reduce((acc, mpdCode) => {
      if (mpdCode.id && mpdCode?.storeShortName) {
        acc[mpdCode.id] = `${String(mpdCode?.storeShortName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};

  // const transformedRequirements = useMemo(() => {
  //   return transformToIRequirement(requirements || []);
  // }, [requirements]);
  const [isTreeView, setIsTreeView] = useState(false);
  const transformedTasks = useMemo(() => {
    return transformToIProjectTask(projectTasks || []);
  }, [projectTasks]);

  useEffect(() => {
    if (projectSearchValues) {
      const hasSearchParams = Object.values(projectSearchValues).some(
        (value) => value !== undefined && value !== ''
      );
      if (hasSearchParams) {
        setTriggerQuery(true);
      }
    }
  }, [projectSearchValues]);
  useEffect(() => {
    projectTasks && refetch();

    // console.log(editingProject);
    console.log('editingProjectRef.current');
    setEditingProject(editingProject);

    // console.log(currentTime);
  }, [editingProject]); //
  const handleEdit = (project: IProjectItemWO) => {
    setEditingProject(project);
    // setEditingProjectNRC(null);
  };
  // const handleStoreChange = (value: string) => {
  //   setSelectedStoreID(value);
  // };
  const handleSubmit = async (task: any) => {
    try {
      if (editingProject && editingProject?.id) {
        updateTask(task).unwrap();
        // refetch();
        setEditingProject(task);
        // await updateRequirement(task).unwrap();
        notification.success({
          message: t('TASK SUCCESSFULLY UPDATED'),
          description: t('The task has been successfully updated.'),
        });
      } else if (!editingProject?.id) {
        await addTask({ project: { ...task, isNRC: true } }).unwrap();
        console.log(task);
        // refetch();
        notification.success({
          message: t('TASK SUCCESSFULLY ADDED'),
          description: t('The task has been successfully added.'),
        });
      }
      setEditingProject(null);
      // setEditingProject(task);
    } catch (error) {
      notification.error({
        message: t('FAILED TO ADD TASK'),
        description: 'There was an error adding the task.',
      });
    }
  };
  const handleCreate = () => {
    setEditingProjectNRC(editingProject);
    setEditingProject(null);
    const {
      id,
      _id,
      projectItemID,
      taskId,
      taskWO,
      removeInslallItemsIds,
      ...projectWithoutIds
    } = editingProjectNRC;
    setEditingProject({
      ...projectWithoutIds,
      projectTaskReferenceID: editingProjectNRC?.id,
      restrictionID: [],
      skillCodeID: [],
      taskDescription: '',
      taskNumber: `${new Date()
        .toISOString()
        .replace(/[-:.Z]/g, '')
        .substring(2)
        .replace('T', '')}`,
      stepID: [],
      preparationID: [],
      createUserID: '',
      createDate: new Date(),
      status: 'open',
      projectID: editingProjectNRC?.projectID._id,
      projectItemType: 'NRC',
      partTaskID: null,
      projectItemReferenceID: editingProjectNRC?.projectItemID,
      taskDescriptionCustumer: editingProjectNRC?.taskDescriptionCustumer,
      taskId,
    });
  };

  const handleDelete = async (companyId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS WORKORDER?'),
      onOk: async () => {
        try {
          message.success(t('WORKORDER SUCCESSFULLY DELETED'));
        } catch (error) {
          notification.error({
            message: t('FAILED DELETE'),
            description: 'There was an error delete.',
          });
        }
      },
    });
  };

  interface ColumnDef {
    field: keyof IProjectItemWO;
    headerName: string;
    resizable?: boolean;
    filter?: boolean;
    hide?: boolean;
    valueGetter?: any;
    valueFormatter?: any;
  }
  const columnDefs: any[] = [
    {
      field: 'status',
      headerName: `${t('Status')}`,
      cellDataType: 'text',
      // width: 150,
      filter: true,
      valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
        params.data.status,
      valueFormatter: (params: { value: keyof ValueEnumType }) => {
        const status = params.value;
        return valueEnum[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumType }) => ({
        backgroundColor: getStatusColor(params.value),
        // color: '#ffffff', // Text color
      }),
    },
    {
      field: 'projectItemType',
      headerName: `${t('TASK TYPE')}`,
      filter: true,
      // width: 130,
      valueGetter: (params: {
        data: { projectItemType: keyof ValueEnumTypeTask };
      }) => params.data.projectItemType,
      valueFormatter: (params: { value: keyof ValueEnumTypeTask }) => {
        const status = params.value;
        return valueEnumTask[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumTypeTask }) => ({
        backgroundColor: getTaskTypeColor(params.value),
        // color: '#ffffff', // Text color
      }),
      // hide: true,
    },
    {
      field: 'taskWO',
      headerName: `${t('TRACE No')}`,
      filter: true,
      // width: 130,
      // hide: true,
    },
    {
      field: 'taskNumber',
      headerName: `${t('TASK NUMBER')}`,
      filter: true,
      // hide: true,
    },
    {
      field: 'taskDescription',
      headerName: `${t('DESCRIPTION')}`,
      filter: true,
      // width: 300,
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
      headerName: `${t('WP TITLE')}`,
      filter: true,
      // width: 300,
      // hide: true,
    },

    // {
    //   field: 'PART_NUMBER',
    //   headerName: `${t('PART No')}`,
    //   filter: true,
    // },
    // { field: 'qty', headerName: `${t('QUANTITY')}`, filter: true },
    { field: 'MPD', headerName: `${t('MPD')}`, filter: true },
    { field: 'amtoss', headerName: `${t('REFERENCE')}`, filter: true },
    // { field: 'ZONE', headerName: `${t('ZONE')}`, filter: true },
    // { field: 'ACCESS', headerName: `${t('ACCESS')}`, filter: true },
    { field: 'ACCESS_NOTE', headerName: `${t('ACCESS_NOTE')}`, filter: true },
    // { field: 'SKILL_CODE1', headerName: `${t('SKILL CODE')}`, filter: true },
    // { field: 'TASK_CODE', headerName: `${t('TASK CODE')}`, filter: true },
    // {
    //   field: 'SUB TASK_CODE',
    //   headerName: `${t('SUB TASK_CODE')}`,
    //   filter: true,
    // },

    { field: 'PHASES', headerName: `${t('PHASES')}`, filter: true },
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
      width: 150,
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

    // { field: 'updateDate', headerName: 'Update Date' },

    // Добавьте дополнительные поля по мере необходимости
  ];
  type CellDataType = 'text' | 'number' | 'date' | 'boolean'; // Определите возможные типы данных
  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType; // Обязательное свойство
  }

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
    test: t('TEST'),
    progress: t('IN PROGRESS'),

    nextAction: t('NEXT ACTION'),
    needInspection: t('NEED INSPECTION'),
  };
  const valueEnumTask: ValueEnumTypeTask = {
    RC: t('TC'),
    CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
    NRC: t('NRC (DEFECT)'),
    NRC_ADD: t('ADHOC (ADHOC TASK)'),
    MJC: t('MJC'),
    CMJC: t('CMJC'),
    FC: t('FC'),
    // RC_ADD: t('RC_ADD'),
  };

  const handleAddAction = async (
    actionType: string,
    ids: any,
    invalidStates: string[]
  ) => {
    const hasInvalidData = transformedTasks.some((item) => {
      if (selectedKeys.includes(item.id)) {
        if (invalidStates.includes(item.status)) {
          return true;
        }
      }
      return false;
    });

    if (hasInvalidData) {
      notification.error({
        message: t('ERROR'),
        description: t('Invalid status in the table. Please check the status.'),
      });
      return false;
    }

    Modal.confirm({
      title: t(
        `ARE YOU SURE YOU WANT TO REOPEN TASKS? ALL ACTIONS WILL BE DELETED!`
      ),
      onOk: async () => {
        try {
          await addMultiAction({ actionType, ids });
          refetch();
          notification.success({
            message: t('SUCCESS'),
            description: t('ACTIONS COMPLETED'),
          });
        } catch (error) {
          notification.error({
            message: t('ERROR'),
            description: t('ACTIONS ERROR'),
          });
        }
      },
    });
  };

  const handleAddActionALL = async (
    actions: any[],
    ids: any[],
    invalidStates: string[]
  ) => {
    const hasInvalidData = transformedTasks.some((item) => {
      if (selectedKeys.includes(item.id)) {
        if (invalidStates.includes(item.status)) {
          return true;
        }
      }
      return false;
    });

    if (hasInvalidData) {
      notification.error({
        message: t('ERROR'),
        description: t('Invalid status in the table. Please check the status.'),
      });
      return false;
    }

    try {
      for (const action of actions) {
        console.log(action);
        await addMultiAction({
          actionType: action.type,
          ids,
          userPerformDurations: action.userPerformDurations,
          userInspectDurations: action.userInspectDurations,
        });
      }
      refetch();
      notification.success({
        message: t('SUCCESS'),
        description: t('ACTIONS COMPLETED'),
      });
      // setEditingProject(null);
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('ACTIONS ERROR'),
      });
    }
  };

  const [reportData, setReportData] = useState<any>(false);
  const [reportDataLoading, setReportDataLoading] = useState<any>(false);
  const fetchAndHandleReport = async (reportTitle: string) => {
    setReportData(true);
  };

  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Table Example</title>
      <style>
          table {
              width: 720px;
              margin-right: 9pt;
              margin-left: 9pt;
              border-collapse: collapse;
              text-align: center; /* Исправлено */
          }
          td {
              border: 0.5pt solid #00b050;
              padding: 1.4pt 1.02pt;
              vertical-align: middle;
              height: 30px; /* Добавлено */
              overflow: hidden; /* Добавлено */
          }
      </style>
  </head>
  <body>
      <div>
          <table cellspacing="0" cellpadding="0">
              <tr style="page-break-inside: avoid">
                  <td colspan="2" style="width: 79.8pt;">
                      <h3 style="text-align: left; font-size: 9pt">
                          <span style="font-family: Roboto; font-weight: normal">WP Card Seq.</span>
                      </h3>
                      <p style="margin-right: 2.85pt; font-size: 6pt">
                          <span style="font-family: Roboto">Номер в пакете работ</span>
                      </p>
                  </td>
                  <td style="width: 37.9pt;">
                      <h3 style="text-align: left">
                          <span style="font-family: Roboto; font-weight: normal">&#xa0;</span>
                      </h3>
                  </td>
                  <!-- Другие ячейки -->
              </tr>
              <!-- Другие строки -->
          </table>
          <p style="font-size: 5pt">
              <span style="font-family: Roboto">&#xa0;</span>
          </p>
      </div>
  </body>
  </html>

`;

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (reportData && selectedKeys) {
  //       const companyID = localStorage.getItem('companyID');
  //       const queryParams = {
  //         title: 'TASK_COVER_REPORT',
  //         token: localStorage.getItem('token'),
  //         landscape: 'portrait',
  //       };

  //       try {
  //         // Вызываем функцию для генерации отчета
  //         setReportDataLoading(true);
  //         const reportDataQ = await generateReport(
  //           companyID,
  //           queryParams,
  //           localStorage.getItem('token')
  //         );

  //         handleOpenReport(reportDataQ);
  //         setReportDataLoading(false);

  //         // Устанавливаем состояние reportData в false
  //         setReportData(false);
  //         // return reportDataQ;
  //       } catch (error) {
  //         // Обрабатываем ошибку при загрузке отчета
  //         console.error('Ошибка при загрузке отчета:', error);
  //         setReportDataLoading(false);
  //         setReportData(false);
  //       }
  //     }
  //   };

  //   fetchData();
  // }, [selectedKeys, reportData]);
  const [visibleActionAdd, setVisibleActionAdd] = useState(false);
  return (
    <div className="flex flex-col gap-5 overflow-hidden">
      <Space>
        <Col
          className=" bg-white px-4 py-3  rounded-md brequierement-gray-400 "
          sm={24}
        >
          <WODiscription
            // onRequirementSearch={setRequirement}
            project={editingProject}
          ></WODiscription>
        </Col>
      </Space>
      <Space className="">
        <Col>
          <PermissionGuard requiredPermissions={[Permission.ADD_NRC]}>
            <Button
              disabled={
                !selectedKeys.length ||
                selectedKeys.length > 1 ||
                editingProject?.status == 'closed' ||
                editingProject?.status == 'cancelled'
              }
              size="small"
              icon={<PlusSquareOutlined />}
              onClick={handleCreate}
            >
              {t('ADD NRC')}
            </Button>
          </PermissionGuard>
        </Col>

        {/* <Col style={{ textAlign: 'right' }}>
          {editingProject && (
            <Button
              disabled={!selectedKeys.length}
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingProject.id)}
            >
              {t('DELETE WORKORDER')}
            </Button>
          )}
        </Col>
        <Col>
          <Button
            disabled={!selectedKeys.length}
            size="small"
            icon={<UsergroupAddOutlined />}
          >
            {t('ADD WORKER')}
          </Button>
        </Col> */}
        {/* <Col>
          <PermissionGuard
            requiredPermissions={[Permission.PROJECT_TASK_ACTIONS]}
          >
            <Button
              onClick={() => {
                handleAddAction('pfmd', selectedKeys, [
                  'inspect',
                  'performed',
                  'closed',
                ]);
              }}
              disabled={
                !selectedKeys.length ||
                selectedKeys.length > 1 ||
                editingProject?.status == 'closed' ||
                editingProject?.status == 'cancelled' ||
                editingProject?.status == 'performed' ||
                editingProject?.status == 'inspect'
              }
              size="small"
              icon={<AlertTwoTone />}
            >
              {t('COMPLETE WORKORDER')}
            </Button>
          </PermissionGuard>
        </Col> */}
        {/* <Col>
          <PermissionGuard
            requiredPermissions={[Permission.PROJECT_TASK_ACTIONS]}
          >
            <Button
              onClick={() => {
                handleAddAction('inspect', selectedKeys, [
                  'inspect',
                  'doubleInspect',
                  'closed',
                  'inProgress',
                  'open',
                ]);
              }}
              disabled={
                !selectedKeys.length ||
                selectedKeys.length > 1 ||
                editingProject?.status == 'closed' ||
                editingProject?.status == 'cancelled' ||
                editingProject?.status == 'inspect'
              }
              size="small"
              icon={<AlertTwoTone />}
            >
              {t('INSPECT WORKORDER')}
            </Button>
          </PermissionGuard>
        </Col> */}
        <Col>
          <PermissionGuard
            requiredPermissions={[Permission.PROJECT_TASK_ACTIONS]}
          >
            {/* <Button
              onClick={() => {
                handleAddAction('closed', selectedKeys, [
                  'closed',
                  'inProgress',
                  'performed',
                  'open',
                ]);
              }}
              disabled={!selectedKeys.length}
              size="small"
              icon={<CheckCircleFilled />}
            >
              {t('CLOSE WORKORDER')}
            </Button> */}
            <Button
              onClick={() => {
                setVisibleActionAdd(true);
                // handleAddActionALL('closed', selectedKeys, [
                //   'closed',
                //   'inProgress',
                //   'performed',
                //   'open',
                // ]);
              }}
              disabled={
                !selectedKeys.length ||
                selectedKeys.length > 1 ||
                editingProject?.status == 'closed' ||
                editingProject?.status == 'cancelled'
              }
              size="small"
              icon={<CheckCircleFilled />}
            >
              {t('CLOSE WORKORDER')}
            </Button>
          </PermissionGuard>
        </Col>

        <Col>
          <PermissionGuard requiredPermissions={[Permission.REOPEN_TASK]}>
            <Button
              onClick={() => {
                handleAddAction('open', selectedKeys, ['open']);
              }}
              disabled={
                !selectedKeys.length ||
                selectedKeys.length > 1 ||
                editingProject?.status !== 'closed'
              }
              size="small"
              icon={<ShrinkOutlined />}
            >
              {t('EDIT TASK')}
            </Button>
          </PermissionGuard>
        </Col>
        <Col>
          <PermissionGuard requiredPermissions={[Permission.REOPEN_TASK]}>
            <Button
              onClick={() => {
                handleAddAction('reOpen', selectedKeys, ['']);
              }}
              // disabled={
              //   !selectedKeys.length ||
              //   selectedKeys.length > 1 ||
              //   editingProject?.status !== 'closed'
              // }
              size="small"
              icon={<ShrinkOutlined />}
            >
              {t('REOPEN TASK')}
            </Button>
          </PermissionGuard>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {/* <Button
            loading={reportDataLoading}
            icon={<PrinterOutlined />}
            size="small"
            onClick={() => fetchAndHandleReport('TASK_COVER_REPORT')}
            disabled={!selectedKeys.length}
            // disabled
          >
            {`${t('PRINT WORKORDER')}`}
          </Button> */}
        </Col>
        <Col>
          <PermissionGuard requiredPermissions={[Permission.PRINT_TASK_CARD]}>
            <PdfGenerator
              wo={editingProject}
              disabled={!selectedKeys.length}
              ids={selectedKeys}
              htmlTemplate={htmlTemplate}
              data={[]}
            />
          </PermissionGuard>
        </Col>
        <Space>
          <Col>
            <Switch
              checkedChildren="Table"
              unCheckedChildren="Tree"
              defaultChecked
              onChange={() => setIsTreeView(!isTreeView)}
            />
          </Col>
          {/* <Col>
            <FloatButton.Group shape="circle" style={{ right: 24 }}>
              <FloatButton />
              <FloatButton icon="DOC" onClick={() => console.log('DOC')} />
            </FloatButton.Group>
          </Col> */}
        </Space>
      </Space>
      <div className="h-[78vh] flex flex-col">
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div className="h-[78vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 flex flex-col">
            {isTreeView ? (
              <WOTree
                isLoading={isLoading || isFetching}
                onProjectSelect={handleEdit}
                projects={transformedTasks || []}
                onCheckItems={(selectedKeys) => {
                  setSelectedKeys(selectedKeys);
                }}
              />
            ) : (
              <TaskList
                isFilesVisiable={true}
                isLoading={isLoading}
                pagination={true}
                isChekboxColumn={true}
                columnDefs={columnDefs}
                rowData={transformedTasks || []}
                onRowSelect={function (rowData: any | null): void {
                  handleEdit(rowData);
                  console.log(rowData);
                }}
                height={'64vh'}
                onCheckItems={function (selectedKeys: React.Key[]): void {
                  setSelectedKeys(selectedKeys);
                }}
                gridKey={'woTaskList'}
              />
            )}
          </div>
          <div className="  h-[78vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            <WOAdminForm
              order={editingProject}
              onCheckItems={function (selectedKeys: React.Key[]): void {
                setSelectedKeysRequirements(selectedKeys);
              }}
              onSubmit={function (task: any): void {
                handleSubmit(task);
              }}
            />
          </div>
        </Split>
        {editingProject && (
          <TaskMultiCloseModal
            key={editingProject._id}
            currentTask={editingProject}
            visible={visibleActionAdd}
            users={users || []}
            onCancel={function (): void {
              setVisibleActionAdd(false);
            }}
            onSave={(data) => {
              // console.log(data);
              handleAddActionALL(data, selectedKeys, ['closed']);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default WoPanel;
