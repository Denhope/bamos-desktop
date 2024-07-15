// @ts-nocheck

import React, { FC, useEffect, useMemo, useState } from 'react';
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

interface AdminPanelProps {
  projectSearchValues: any;
}

const WoPanel: React.FC<AdminPanelProps> = ({ projectSearchValues }) => {
  const { t } = useTranslation();
  const [editingProject, setEditingProject] = useState<IProjectItemWO | null>(
    null
  );
  const [editingProjectNRC, setEditingProjectNRC] = useState<any | null>(null);
  const { currentTime } = useGlobalState();
  const [selectedStoreID, setSelectedStoreID] = useState<any | undefined>(
    undefined
  );
  const [createPickSlip, setOpenCreatePickSlip] = useState<boolean>(false);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [selectedKeysRequirements, setSelectedKeysRequirements] = useState<
    React.Key[]
  >([]);
  const [triggerQuery, setTriggerQuery] = useState(false);
  const {
    data: projectTasks,
    isLoading,
    isFetching,
    refetch,
  } = useGetProjectItemsWOQuery(
    {
      status: projectSearchValues?.status,
      startDate: projectSearchValues?.startDate,
      finishDate: projectSearchValues?.endDate,
      projectID: projectSearchValues?.projectID,
      vendorID: projectSearchValues?.vendorID,
      partNumberID: projectSearchValues?.partNumberID,
      taskWO: projectSearchValues?.projectTaskWO,
      planeId: projectSearchValues?.planeId,
      restrictionID: projectSearchValues?.restrictionID,
      phasesID: projectSearchValues?.phasesID,
      useID: projectSearchValues?.useID,
      skillCodeID: projectSearchValues?.skillCodeID,
      accessID: projectSearchValues?.accessID,
      zonesID: projectSearchValues?.zonesID,
      projectItemType: projectSearchValues?.projectItemType,
      WOReferenceID: projectSearchValues?.WOReferenceID,
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

  const transformedRequirements = useMemo(() => {
    return transformToIRequirement(requirements || []);
  }, [requirements]);
  const [isTreeView, setIsTreeView] = useState(true);
  const transformedTasks = useMemo(() => {
    return transformToIProjectTask(projectTasks || []);
  }, [projectTasks]);
  console.log(transformedTasks);
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
    setEditingProject(editingProject);

    // console.log(currentTime);
  }, [currentTime]); //
  const handleEdit = (project: IProjectItemWO) => {
    setEditingProject(project);
    setEditingProjectNRC(null);
  };
  const handleStoreChange = (value: string) => {
    setSelectedStoreID(value);
  };
  const handleSubmit = async (task: any) => {
    try {
      if (editingProject && editingProject?.id) {
        updateTask(task).unwrap();
        refetch();
        // await updateRequirement(task).unwrap();
        message.success(t('TASK SUCCESSFULLY UPDATED'));
      } else if (!editingProject?.id) {
        await addTask({ project: { ...task, isNRC: true } }).unwrap();
        refetch();
        message.success(t('TASK SUCCESSFULLY ADDED'));
      }
      // setEditingProject(null);
    } catch (error) {
      message.error(t('ERROR SAVING TASK'));
    }
  };
  const handleCreate = () => {
    setEditingProjectNRC(editingProject);
    setEditingProject(null);
    const { id, _id, projectItemID, taskId, taskWO, ...projectWithoutIds } =
      editingProjectNRC;
    setEditingProject({
      ...projectWithoutIds,
      projectTaskReferenceID: editingProjectNRC?.id,
      restrictionID: [],
      skillCodeID: [],
      taskDescription: '',
      taskNumber: `NRC/${editingProjectNRC.taskNumber.replace(
        /^24-/,
        ''
      )}/${new Date()
        .toISOString()
        .replace(/[-:.Z]/g, '')
        .slice(2)}`,
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
    });
  };

  const handleDelete = async (companyId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS WORKORDER?'),
      onOk: async () => {
        try {
          message.success(t('WORKORDER SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('WORKORDER DELETING REQUIREMENT'));
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
      width: 150,
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
      field: 'taskWO',
      headerName: `${t('TRACE No')}`,
      filter: true,
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
      // hide: true,
    },
    {
      field: 'projectName',
      headerName: `${t('WP TITLE')}`,
      filter: true,
      // hide: true,
    },

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
      cellStyle: (params: { value: keyof ValueEnumType }) => ({
        backgroundColor: getTaskTypeColor(params.value),
        color: '#ffffff', // Text color
      }),
      // hide: true,
    },
    { field: 'MPD', headerName: `${t('MPD')}`, filter: true },
    { field: 'amtoss', headerName: `${t('AMM')}`, filter: true },
    // { field: 'ZONE', headerName: `${t('ZONE')}`, filter: true },
    // { field: 'ACCESS', headerName: `${t('ACCESS')}`, filter: true },
    // { field: 'ACCESS_NOTE', headerName: `${t('ACCESS_NOTE')}`, filter: true },
    { field: 'SKILL_CODE1', headerName: `${t('SKILL CODE')}`, filter: true },
    { field: 'TASK_CODE', headerName: `${t('TASK CODE')}`, filter: true },
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
    //   field: 'PART_NUMBER',
    //   headerName: `${t('PART No')}`,
    //   filter: true,
    // },

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

  const columnRequirements = [
    {
      field: 'partRequestNumberNew',
      headerName: `${t('REQUIREMENT No')}`,
      cellDataType: 'number',
    },

    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: false,
    },
    {
      field: 'DESCRIPTION',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'amout',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('ВОЗМОЖНОЕ КОЛ-ВО К ЗАКАЗУ')}`,
    },
    {
      field: 'issuedQuantity',
      editable: true,
      cellDataType: 'number',
      headerName: `${t('REQUESTED QTY')}`,
      // valueSetter: (params: any) => {
      //   // Получаем текущее значение поля и значение amout
      //   const newValue = Number(params.newValue);
      //   const amout = params.data.amout || 0;
      //   const bookedQuantity = params.data.bookedQuantity || 0;

      //   // Проверка: значение issuedQuantity не должно превышать (amout - bookedQuantity)
      //   if (newValue <= amout - bookedQuantity) {
      //     // Устанавливаем новое значение
      //     params.data.issuedQuantity = newValue;
      //     return true; // Указываем, что значение было изменено
      //   } else {
      //     // Отображаем предупреждение, если значение некорректно
      //     alert(
      //       `${t('Значение не может превышать')} ${amout - bookedQuantity}`
      //     );
      //     return false; // Указываем, что значение не было изменено
      //   }
      // },
    },
    {
      field: 'bookedQuantity',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('BOOKED QTY')}`,
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    {
      field: 'plannedDate',
      editable: false,
      cellDataType: 'date',
      headerName: `${t('PLANNED DATE')}`,
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
      field: 'availableQTY',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('ДОСТУПНОЕ НА СКЛАДЕ')}`,
    },
    // {
    //   field: 'materialAplicationNumber',
    //   editable: false,
    //   cellDataType: 'number',
    //   headerName: `${t('PICKSLIP No')}`,
    // },
    // Добавьте другие колонки по необходимости
  ];

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
    NRC_ADHOC: t('ADHOC (ADHOC TASK)'),
    MJC: t('MJC)'),
    CMJC: t('CMJC)'),
    FC: t('FC)'),
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
      title: t('ARE YOU SURE, YOU WANT TO MAKE THIS TRACE PRFMD?'),
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

  useEffect(() => {
    const fetchData = async () => {
      if (reportData && selectedKeys) {
        const companyID = localStorage.getItem('companyID');
        const queryParams = {
          title: 'TASK_COVER_REPORT',
          token: localStorage.getItem('token'),
          landscape: 'portrait',
        };

        try {
          // Вызываем функцию для генерации отчета
          setReportDataLoading(true);
          const reportDataQ = await generateReport(
            companyID,
            queryParams,
            localStorage.getItem('token')
          );

          handleOpenReport(reportDataQ);
          setReportDataLoading(false);

          // Устанавливаем состояние reportData в false
          setReportData(false);
          // return reportDataQ;
        } catch (error) {
          // Обрабатываем ошибку при загрузке отчета
          console.error('Ошибка при загрузке отчета:', error);
          setReportDataLoading(false);
          setReportData(false);
        }
      }
    };

    fetchData();
  }, [selectedKeys, reportData]);
  const [data, setData] = useState({
    toolsItems: [
      {
        TOOL_CODE: '123',
        PART_NUMBER: '456',
        NAME_OF_MATERIAL: 'Hammer',
        PICKSLIP_NO: '789',
        TOOLS_QUANTITY: '10',
      },
      // Добавьте другие элементы по мере необходимости
    ],
  });

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
          <Button
            disabled={
              !selectedKeys.length ||
              selectedKeys.length > 1 ||
              editingProject?.status == 'closed'
            }
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD NRC')}
          </Button>
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
        <Col>
          <Button
            onClick={() => {
              handleAddAction('pfmd', selectedKeys, [
                'inspect',
                'performed',
                'closed',
              ]);
            }}
            disabled={!selectedKeys.length}
            size="small"
            icon={<AlertTwoTone />}
          >
            {t('COMPLETE WORKORDER')}
          </Button>
        </Col>
        <Col>
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
            disabled={!selectedKeys.length}
            size="small"
            icon={<AlertTwoTone />}
          >
            {t('INSPECT WORKORDER')}
          </Button>
        </Col>
        <Col>
          <Button
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
          </Button>
        </Col>
        <Col>
          <Button
            onClick={() => {
              handleAddAction('open', selectedKeys, ['open']);
            }}
            disabled={!selectedKeys.length}
            size="small"
            icon={<ShrinkOutlined />}
          >
            {t('REOPEN TASK')}
          </Button>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          <Button
            loading={reportDataLoading}
            icon={<PrinterOutlined />}
            size="small"
            onClick={() => fetchAndHandleReport('TASK_COVER_REPORT')}
            // disabled={!selectedKeys.length}
            disabled
          >
            {`${t('PRINT WORKORDER')}`}
          </Button>
        </Col>
        {/* <Col>
          <PdfGenerator htmlTemplate={htmlTemplate} data={data} />
        </Col> */}
        <Col>
          <Switch
            checkedChildren="Table"
            unCheckedChildren="Tree"
            defaultChecked
            onChange={() => setIsTreeView(!isTreeView)}
          />
        </Col>
      </Space>
      <div className="h-[78vh] flex flex-col">
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div className="h-[67vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 flex flex-col">
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
                isLoading={isLoading || isFetching}
                pagination={true}
                isChekboxColumn={true}
                columnDefs={columnDefs}
                rowData={transformedTasks || []}
                onRowSelect={function (rowData: any | null): void {
                  handleEdit(rowData);
                }}
                height={'69vh'}
                onCheckItems={function (selectedKeys: React.Key[]): void {
                  setSelectedKeys(selectedKeys);
                }}
              />
              // <MyTable
              //   columnDefs={columnDefs}
              //   rowData={projectTasks || []}
              //   onRowSelect={function (rowData: any | null): void {
              //     handleEdit(rowData);
              //   }}
              //   onCheckItems={function (selectedKeys: React.Key[]): void {
              //     setSelectedKeys(selectedKeys);
              //   }}
              //   height={'64vh'}
              // />
            )}
          </div>
          <div className="  h-[67vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 ">
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
      </div>
    </div>
  );
};

export default WoPanel;
