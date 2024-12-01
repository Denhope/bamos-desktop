//@ts-nocheck
import PermissionGuard, { Permission } from '../auth/PermissionGuard';
import { Split } from '@geoffcox/react-splitter';
import {
  useDeleteProjectPanelsMutation,
  useGetProjectGroupPanelsQuery,
  useGetProjectItemsWOQuery,
  useGetProjectPanelsQuery,
  useUpdateProjectPanelsMutation,
} from '@/features/projectItemWO/projectItemWOApi';
import { IProjectItemWO } from '@/models/AC';
import {
  Button,
  Col,
  Modal,
  Space,
  Spin,
  Empty,
  Switch,
  message,
  Tabs,
  notification,
  Tag,
} from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';
// import data from '../../data/reports/label.xml';

// Читаем содержимое файла label.xml
import {
  ValueEnumType,
  ValueEnumTypeTask,
  getStatusColor,
  getTaskTypeColor,
  transformedAccessToTable,
} from '@/services/utilites';
import AccessDiscription from './AccessDiscription';
import {
  PlusSquareOutlined,
  MinusSquareOutlined,
  PrinterOutlined,
  AlertTwoTone,
  UsergroupAddOutlined,
  CheckCircleFilled,
  SwitcherFilled,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import AccessCodeTree from './AccessCodeTree';
import AccessCodeForm from './AccessCodeForm';
import { IAccessCode } from '@/models/ITask';
// import ReportGenerator from '../shared/ReportPrintLabel';
// import ReportEXEL from '../shared/ReportEXEL';
// import ReportPrintTag from '../shared/ReportPrintTag';

import { useAddProjectPanelsMutation } from '@/features/projectItemWO/projectItemWOApi';
import {
  useAddBookingMutation,
  useGetFilteredBookingsQuery,
} from '@/features/bookings/bookingApi';
import TableComponent from '../shared/TableComponent';
import { useGetProjectTasksQuery } from '@/features/projectTaskAdministration/projectsTaskApi';
import { useGetGroupTaskCodesQuery } from '@/features/tasksAdministration/taskCodesApi';
import { useGetAccessCodesQuery } from '@/features/accessAdministration/accessApi';
import { USER_ID } from '@/utils/api/http';
import AccessCodeOnlyPanelTree from './AccessCodeOnlyPanelTree';
import { ColDef } from 'ag-grid-community';
import { transformedAccessToIAssess } from '@/services/utilites';
import PartContainer from '../woAdministration/PartContainer';
import ReportPrintTag from '../shared/ReportPrintTag';
import PdfGeneratorPanel from '../woAdministration/PdfGeneratorPanel';
import { useGetfilteredWOQuery } from '@/features/wpAdministration/wpApi';
import UniversalAgGrid from '../shared/UniversalAgGrid';
import TaskMultiCloseModal from '../woAdministration/TaskMultiCloseModal';
import { useGetUsersQuery } from '@/features/userAdministration/userApi';
import PdfGeneratorAdditionalHatches from '../woAdministration/PdfGeneratorAdditionalHatches';
interface AdminPanelProps {
  projectSearchValues: any;
}
const AccessAdminPanel: React.FC<AdminPanelProps> = ({
  projectSearchValues,
}) => {
  const [editingproject, setEditingproject] = useState<any | null>(null);
  const { t } = useTranslation();
  const [triggerQuery, setTriggerQuery] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [updateAccess] = useUpdateProjectPanelsMutation({});
  const [addAccessBooking] = useAddBookingMutation({});
  const [isTreeView, setIsTreeView] = useState(false);
  const [triggerQueryBook, setTriggerQueryBook] = useState(false);
  const [isTaskMultiCloseModalVisible, setIsTaskMultiCloseModalVisible] =
    useState(false);
  const [selectedAccessKeys, setSelectedAccessKeys] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState<
    'open' | 'close' | 'inspect'
  >('open');

  // Проверяем, есть ли accessProjectID и устанавливаем триггер для запроса
  useEffect(() => {
    if (
      (editingproject?.id || editingproject?._id) &&
      editingproject?.accessNbr
    ) {
      setTriggerQueryBook(true);
    }
  }, [editingproject?.id, editingproject?._id]);
  useEffect(() => {
    setEditingproject(null);
  }, [projectSearchValues]);

  // Запускаем запрос, если triggerQuery true
  const [addPanels] = useAddProjectPanelsMutation({});
  const { data: bookings } = useGetFilteredBookingsQuery(
    {
      accessProjectID: editingproject?.id || editingproject?._id,
    },
    {
      skip: !triggerQueryBook, // Пропускаем запрос, если триггер false
    }
  );

  const { data: projectTasks } = useGetProjectTasksQuery(
    { projectId: projectSearchValues?.projectID || '' },
    { skip: !projectSearchValues?.projectID }
  );

  const [pdfData, setPdfData] = useState<string | null>(null);

  const { data: projects } = useGetfilteredWOQuery(
    { WOReferenceID: projectSearchValues?.WOReferenceID },
    { skip: !projectSearchValues?.WOReferenceID }
  );

  const {
    data: accesses,
    isLoading,
    isFetching,
    refetch,
  } = projectSearchValues?.isOnlyPanels
    ? useGetProjectPanelsQuery(
        {
          accessProjectNumber: projectSearchValues?.accessProjectNumber,
          status: projectSearchValues?.status,
          createStartDate: projectSearchValues?.startDate,
          createFinishDate: projectSearchValues?.endDate,
          projectID: projectSearchValues?.projectID,
          // accessType: projectSearchValues?.projectID,
          removeUserId: projectSearchValues?.removeUserId,
          createUserID: projectSearchValues?.removeUserId,
          installUserId: projectSearchValues?.installUserId,
          inspectedUserID: projectSearchValues?.inspectedUserID,
          acTypeID: projectSearchValues?.acTypeID,
          isOnlyWithPanels: projectSearchValues?.isOnlyWithPanels,
          userID: projectSearchValues?.userID,
          WOReferenceID: projectSearchValues?.WOReferenceID || '',
          ...(projectSearchValues?.isAddAccess && {
            isAddAccess: projectSearchValues.isAddAccess,
          }),
        },
        { skip: !triggerQuery }
      )
    : useGetProjectGroupPanelsQuery(
        {
          accessProjectNumber: projectSearchValues?.accessProjectNumber,
          status: projectSearchValues?.status,
          createStartDate: projectSearchValues?.startDate,
          createFinishDate: projectSearchValues?.endDate,
          projectID: projectSearchValues?.projectID,
          // accessType: projectSearchValues?.projectID,
          removeUserId: projectSearchValues?.removeUserId,
          createUserID: projectSearchValues?.removeUserId,
          installUserId: projectSearchValues?.installUserId,
          inspectedUserID: projectSearchValues?.inspectedUserID,
          acTypeID: projectSearchValues?.acTypeID,
          isOnlyWithPanels: projectSearchValues?.isOnlyWithPanels,
          userID: projectSearchValues?.userID,
          WOReferenceID: projectSearchValues?.WOReferenceID || '',
          ...(projectSearchValues?.isAddAccess && {
            isAddAccess: projectSearchValues.isAddAccess,
          }),
        },
        { skip: !triggerQuery }
      );

  const { data: accessesData } = useGetAccessCodesQuery(
    { acTypeID: accesses && accesses?.length && accesses[0]?.acTypeID },
    { skip: accesses && !accesses[0]?.acTypeID }
  );
  const [deleteProjectPanels] = useDeleteProjectPanelsMutation({});
  const transformedAccess = useMemo(() => {
    return transformedAccessToIAssess(bookings || []);
  }, [bookings]);
  const transformedTaleAccess = useMemo(() => {
    return transformedAccessToTable(accesses || []);
  }, [accesses]);

  useEffect(() => {
    // Check if projectSearchValues is defined and not null
    if (projectSearchValues) {
      // Check if there are any search values
      const hasSearchParams = Object.values(projectSearchValues).some(
        (value) => value !== undefined && value !== ''
      );
      if (hasSearchParams) {
        setTriggerQuery(true);
      }
    }
  }, [projectSearchValues]);

  const handleEdit = (project: any) => {
    setEditingproject(project);
  };
  const handleCreate = () => {
    setEditingproject(null);
  };

  const handleDelete = async (companyId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS ACCESS?'),
      onOk: async () => {
        try {
          // await deleteRequirement(companyId).unwrap();
          await deleteProjectPanels({ accessIds: selectedKeys }).unwrap();

          notification.success({
            message: t('SUCCESS DELETING'),
            description: t('ACCESS SUCCESSFULLY DELETED'),
          });
        } catch (error) {
          notification.error({
            message: t('ERROR DELETING'),
            description: t('ERROR DELETING ACCESS'),
          });
        }
      },
    });
  };
  const handleUpdateOpen = (selectedKeys: string[]) => {
    setSelectedAccessKeys(selectedKeys);
    setCurrentAction('open');
    setIsTaskMultiCloseModalVisible(true);
  };

  const handleUpdateClosed = (selectedKeys: string[]) => {
    setSelectedAccessKeys(selectedKeys);
    setCurrentAction('close');
    setIsTaskMultiCloseModalVisible(true);
  };

  const handleUpdateInspected = (selectedKeys: string[]) => {
    setSelectedAccessKeys(selectedKeys);
    setCurrentAction('inspect');
    setIsTaskMultiCloseModalVisible(true);
  };

  const handleTaskMultiCloseModalSave = async (data: any) => {
    console.log('Данные, поученные от TaskMultiCloseModal:', data);

    try {
      const actionData = data[0];
      const userPerformDuration = actionData.userPerformDurations[0];
      const userId = userPerformDuration.userID;
      const date = actionData.createDate;

      let updateResponse;
      let bookingStatus;
      let bookingModel;

      switch (currentAction) {
        case 'open':
          updateResponse = await updateAccess({
            accessIds: selectedAccessKeys,
            status: 'open',
            removeUserId: userId,
            date: date,
          });
          bookingStatus = 'OPEN';
          bookingModel = 'OPEN_ACCESS';
          break;
        case 'close':
          updateResponse = await updateAccess({
            accessIds: selectedAccessKeys,
            status: 'closed',
            installUserId: userId,
            date: date,
          });
          bookingStatus = 'CLOSED';
          bookingModel = 'CLOSE_ACCESS';
          break;
        case 'inspect':
          updateResponse = await updateAccess({
            accessIds: selectedAccessKeys,
            status: 'inspected',
            inspectedUserID: userId,
            date: date,
          });
          bookingStatus = 'INSPECTION';
          bookingModel = 'INSPECT_ACCESS';
          break;
      }

      console.log('Ответ на обновление доступа:', updateResponse);

      const addBookingResponse = await addAccessBooking({
        booking: {
          voucherModel: bookingModel,
          accessProjectID: selectedAccessKeys,
          accessProjectStatus: bookingStatus,
          projectID: projectSearchValues.projectID,
        },
        acTypeId: projectSearchValues.acTypeId,
        userID: userId,
      }).unwrap();

      console.log('Ответ на добавление бронирования:', addBookingResponse);

      notification.success({
        message: t(`SUCCESS ${currentAction.toUpperCase()}`),
        description: t(`ACCESS SUCCESSFULLY ${currentAction.toUpperCase()}ED`),
      });

      // refetch();
    } catch (error) {
      console.error(
        `Ошибка при ${currentAction} доступа или добавлении бронирования:`,
        error
      );
      notification.error({
        message: t(`ERROR ${currentAction.toUpperCase()}`),
        description: t(`ACCESS ${currentAction.toUpperCase()} ERROR`),
      });
    } finally {
      setIsTaskMultiCloseModalVisible(false);
    }
  };

  const valueEnumTask: ValueEnumTypeTask = {
    RC: t('TC'),
    CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
    NRC: t('NRC (DEFECT)'),
    NRC_ADD: t('ADHOC (ADHOC TASK)'),
    MJC: t('MJC'),
    CMJC: t('CMJC'),
    FC: t('FC'),
    HARD_ACCESS: t('HARD_ACCESS'),
  };

  const renderTaskTypeTags = (taskTypes: string[]) => {
    return (
      <div>
        {taskTypes.map((type) => {
          const taskName =
            valueEnumTask[type as keyof ValueEnumTypeTask] || type;
          return (
            <Tag
              key={type}
              color={getTaskTypeColor(type as keyof ValueEnumTypeTask)}
              style={{ margin: '2px' }}
            >
              {taskName}
            </Tag>
          );
        })}
      </div>
    );
  };
  const { data: users } = useGetUsersQuery({});

  type CellDataType = 'text' | 'number' | 'date' | 'boolean';

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType;
  }
  const valueEnum: ValueEnumType = {
    inspect: t('INSPECTION'),
    inspected: t('INSPECTION'),
    onQuatation: t('QUATATION'),
    open: t('OPEN'),
    closed: t('CLOSE'),
    canceled: t('CANCEL'),
    inProgress: t('IN PROGRESS'),
    complete: t('COMPLETE'),
    RECEIVED: t('RECEIVED'),
    PARTLY_RECEIVED: t('PARTLY RECEIVED'),
    performed: t('PERFORMED'),
    onOrder: '',
    onShort: '',
    draft: t('DRAFT'),
    issued: '',
    progress: '',
  };
  const columnDefs = [
    {
      headerName: `${t('ACCESS No')}`,
      field: 'accessNbr',
      editable: false,
      cellDataType: 'text',
    },
    {
      headerName: `${t('BOOKING TYPE')}`,
      field: 'voucherModel',
      editable: false,
      cellDataType: 'text',
    },
    {
      field: 'accessProjectStatus',
      headerName: `${t('STATUS')}`,
      cellDataType: 'text',
    },

    {
      field: 'createDate',
      editable: false,
      filter: false,
      headerName: `${t('DATE')}`,
      cellDataType: 'date',
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
      field: 'userName',
      headerName: `${t('CREATE BY')}`,
      cellDataType: 'text',
    },
  ];
  const columnDefsAccets = [
    {
      headerName: `${t('ACCESS No')}`,
      field: 'accessNbr',
      editable: false,
      cellDataType: 'text',
      filter: true,
      width: 150,
    },
    {
      field: 'status',
      headerName: `${t('Status')}`,
      cellDataType: 'text',
      width: 150,
      filter: true,
      valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
        params.data.status,
      cellRenderer: (params: { value: keyof ValueEnumType }) => {
        const status = params.value;
        return (
          <Tag color={getStatusColor(status)}>
            {valueEnum[status] || status}
          </Tag>
        );
      },
      cellStyle: {
        border: '1px solid #f0f0f0',
      },
    },
    {
      headerName: `${t('ADD ACCESS')}`,
      field: 'isAddAccess',
      editable: false,
      cellDataType: 'boolean',
      valueGetter: (params: any) => params.data.isAddAccess,
      cellRenderer: (params: any) =>
        params.value ? <Tag color="red">Yes</Tag> : <Tag color="blue">No</Tag>,
    },
    {
      headerName: `${t('LABEL')}`,
      field: 'accessProjectNumber',
      editable: false,
      cellDataType: 'text',
      filter: true,
      width: 100,
    },

    {
      field: 'accessDescription',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
      filter: true,
      valueGetter: (params: any) =>
        params.data.accessDescription || t('NO DESCRIPTION'),
    },
    {
      field: 'taskTypes',
      headerName: `${t('TASK TYPE')}`,
      cellDataType: 'text',
      filter: true,
      cellRenderer: (params: any) => renderTaskTypeTags(params.value || []),
      filterParams: {
        valueGetter: (params: any) => {
          return params.data.taskTypes
            .map(
              (type: string) =>
                valueEnumTask[type as keyof ValueEnumTypeTask] || type
            )
            .join(', ');
        },
      },
    },
    {
      field: 'taskNumbers',
      headerName: `${t('TASK NUMBER')}`,
      cellDataType: 'text',
      filter: true,
    },
    {
      field: 'majoreZoneNbr',
      headerName: `${t('ZONE')}`,
      cellDataType: 'text',
      filter: true,
    },
    {
      field: 'subZoneNbr',
      filter: true,
      headerName: `${t('SUB ZONE')}`,
      cellDataType: 'text',
    },
    {
      field: 'areaNbr',
      filter: true,
      headerName: `${t('AREA')}`,
      cellDataType: 'text',
    },
    {
      field: 'areaDescription',
      filter: true,
      headerName: `${t('AREA DESCRIPTION')}`,
      cellDataType: 'text',
    },
  ];

  return (
    <div className="flex flex-col gap-5 overflow-hidden">
      <Space>
        <Col
          className=" bg-white px-4 py-3  rounded-md brequierement-gray-400 "
          sm={24}
        >
          <AccessDiscription
            // onRequirementSearch={setRequirement}
            project={editingproject}
          ></AccessDiscription>
        </Col>
      </Space>
      <Space className="">
        <Col>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD ACCESS')}
          </Button>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {/* {selectedKeys && ( */}
          <Button
            disabled={!selectedKeys.length}
            size="small"
            icon={<MinusSquareOutlined />}
            onClick={() => handleDelete(selectedKeys.join(',') || '')}
          >
            {t('DELETE ACCESS')}
          </Button>
          {/* )} */}
        </Col>

        <Col>
          <PermissionGuard requiredPermissions={[Permission.OPEN_ACCESS]}>
            <Button
              disabled={!selectedKeys.length}
              size="small"
              icon={<AlertTwoTone />}
              onClick={() => handleUpdateOpen(selectedKeys)}
            >
              {t('OPEN ACCESS')}
            </Button>
          </PermissionGuard>

          {/* )} */}
        </Col>
        <Col>
          <PermissionGuard requiredPermissions={[Permission.CLOSE_ACCESS]}>
            <Button
              disabled={!selectedKeys.length}
              size="small"
              icon={<CheckCircleFilled />}
              onClick={() => handleUpdateInspected(selectedKeys)}
            >
              {t('CLOSE ACCESS')}
            </Button>
          </PermissionGuard>

          {/* )} */}
        </Col>
        <Col>
          <PermissionGuard requiredPermissions={[Permission.CLOSE_ACCESS]}>
            <Button
              disabled={!selectedKeys.length}
              size="small"
              icon={<CheckCircleFilled />}
              onClick={() => handleUpdateClosed(selectedKeys)}
            >
              {t('INSPECT CLOSE ACCESS')}
            </Button>
          </PermissionGuard>

          {/* )} */}
        </Col>
        <Col>
          <Switch
            checkedChildren="Table"
            unCheckedChildren="Tree"
            defaultChecked
            onChange={() => setIsTreeView(!isTreeView)}
          />
        </Col>
        {/* <Col>
          {editingproject && (
            <Button
              size="small"
              icon={<SwitcherFilled />}
              // onClick={() => handleDelete(editingproject.id)}
            >
              {t('CLOSE MANY WORKORDER')}
            </Button>
          )}
        </Col> */}
        <Col style={{ textAlign: 'right' }}>
          <PermissionGuard
            requiredPermissions={[Permission.PART_TRANSFER_ACTIONS]}
          >
            <ReportPrintTag
              isDisabled={!selectedKeys.length > 0}
              xmlTemplate={''}
              data={[]}
              ids={selectedKeys}
            ></ReportPrintTag>
          </PermissionGuard>
        </Col>

        <Col style={{ textAlign: 'right' }}>
          <PdfGeneratorPanel
            // disabled={!projects && !projects.length > 0}ннннннн
            wo={projects && projects[0]}
            htmlTemplate={''}
            data={[]}
          ></PdfGeneratorPanel>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          <PdfGeneratorAdditionalHatches
            wo={projects && projects[0]}
            htmlTemplate={''}
            data={[]}
          ></PdfGeneratorAdditionalHatches>
        </Col>
      </Space>

      <div className="h-[77vh] flex flex-col">
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div className="h-[69vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 flex flex-col">
            {!projectSearchValues?.isOnlyPanels && (
              <AccessCodeTree
                onZoneCodeSelect={handleEdit}
                zoneCodesGroup={accesses || []}
                onCheckItems={(selectedKeys) => {
                  setSelectedKeys(selectedKeys);
                }}
              />
            )}
            {projectSearchValues?.isOnlyPanels && isTreeView ? (
              <AccessCodeOnlyPanelTree
                isLoading={isLoading || isFetching}
                onZoneCodeSelect={handleEdit}
                accessCode={transformedTaleAccess || []}
                onCheckItems={(selectedKeys) => {
                  setSelectedKeys(selectedKeys);
                }}
              />
            ) : (
              projectSearchValues?.isOnlyPanels && (
                <UniversalAgGrid
                  gridId="acceses"
                  isVisible={true}
                  pagination={true}
                  height={'65vh'}
                  columnDefs={columnDefsAccets}
                  isChekboxColumn={true}
                  rowData={transformedTaleAccess}
                  isLoading={isLoading || isFetching}
                  onCheckItems={(selectedKeys) => {
                    setSelectedKeys(selectedKeys);
                  }}
                  onRowSelect={(rowData) => handleEdit(rowData[0])}
                  defaultColDef={{
                    sortable: true,
                    filter: true,
                    resizable: true,
                    cellStyle: {
                      border: '1px solid #f0f0f0',
                    },
                  }}
                  className="w-full"
                />
              )
            )}
          </div>
          <div className="h-[69vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 flex flex-col overflow-y-auto">
            {/* <WOAdminForm /> */}
            {/* <Split horizontal initialPrimarySize="45%"> */}
            <div className="overflow-auto h-[70vh]">
              <Tabs
                onChange={(key) => {
                  setActiveTabKey(key);
                }}
                defaultActiveKey="1"
                type="card"
              >
                <Tabs.TabPane tab={t('INFORMATION')} key="1">
                  <div className="h-[60vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 flex flex-col overflow-y-auto">
                    <AccessCodeForm
                      accessesData={accessesData || []}
                      // projectTasks={projectTasks || []}
                      accessCode={editingproject}
                      onSubmit={function (accessCode: any): void {
                        console.log(accessCode);
                        Modal.confirm({
                          title: t('ARE YOU SURE, YOU WANT TO ADD ACCESS'),
                          onOk: async () => {
                            try {
                              await addPanels({
                                accessIds: accessCode.accesses,
                                isAddAccess: accessCode.isAddAccess,
                                WOReferenceID: accessCode.WOReferenceID,
                                projectTaskIds: accessCode.projectTaskID,
                              }).unwrap();
                              notification.success({
                                message: t('ACCESSES SUCCESSFULLY ADDED'),
                              });
                              Modal.destroyAll();
                            } catch (error) {
                              // Обработка ошибок
                            }
                          },
                        });
                      }}
                    ></AccessCodeForm>
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane tab={t('BOOKING')} key="5">
                  <div className="py-5">
                    {editingproject ? (
                      <UniversalAgGrid
                        height={'56vh'}
                        columnDefs={columnDefs}
                        isChekboxColumn={false}
                        rowData={transformedAccess}
                        isLoading={false}
                        gridId={'accessBooking'}
                      />
                    ) : (
                      <Empty></Empty>
                    )}

                    {/* <TableComponent
                  columns={columns}
                  data={editingproject?.accessNbr ? bookings : []}
                ></TableComponent> */}
                  </div>
                </Tabs.TabPane>
              </Tabs>
            </div>

            {/* </Split> */}
          </div>
        </Split>
      </div>
      {isTaskMultiCloseModalVisible && (
        <TaskMultiCloseModal
          onlyWithOrganizationAuthorization={true}
          currentAction={{ projectItemType: 'ACCESS' }}
          currentTask={{ projectItemType: 'ACCESS' }}
          visible={isTaskMultiCloseModalVisible}
          users={users || []}
          onCancel={() => setIsTaskMultiCloseModalVisible(false)}
          onSave={handleTaskMultiCloseModalSave}
        />
      )}
    </div>
  );
};

export default AccessAdminPanel;
