//@ts-nocheck
import PermissionGuard, { Permission } from '../auth/PermissionGuard';
import { Split } from '@geoffcox/react-splitter';
import {
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
} from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';
// import data from '../../data/reports/label.xml';

// Читаем содержимое файла label.xml
import {
  ValueEnumType,
  getStatusColor,
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
        },
        { skip: !triggerQuery }
      );

  // useEffect(() => {
  //   if (accesses) {
  //     refetch();
  //   }
  // }, [accesses, refetch, projectSearchValues]);
  const { data: accessesData } = useGetAccessCodesQuery(
    { acTypeID: accesses && accesses?.length && accesses[0]?.acTypeID },
    { skip: accesses && !accesses[0]?.acTypeID }
  );
  const transformedAccess = useMemo(() => {
    return transformedAccessToIAssess(bookings || []);
  }, [bookings]);
  const transformedTaleAccess = useMemo(() => {
    return transformedAccessToTable(accesses || []);
  }, [accesses]);
  // const [xmlTemplate, setXmlTemplate] = useState<string>('');

  // useEffect(() => {
  //   const fetchXmlTemplate = async () => {
  //     try {
  //       const response = await fetch('../data/reports/label.xml'); // Путь к вашему файлу label.xml
  //       const xmlTemplate = await response.text();
  //       setXmlTemplate(xmlTemplate);
  //     } catch (error) {
  //       console.error('Ошибка загрузки файла label.xml:', error);
  //     }
  //   };

  //   fetchXmlTemplate();
  // }, []);

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
  // if (isLoading) {
  //   return (
  //     <div>
  //       <Spin />
  //     </div>
  //   );
  // }
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
  const handleUpdateOpen = async (selectedKeys: any[]) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO OPEN SELECTED ACCESS?'),
      onOk: async () => {
        try {
          const updateResponse = await updateAccess({
            accessIds: selectedKeys,
            status: 'open',
            removeUserId: USER_ID,
          });

          console.log('Update Access Response:', updateResponse);

          const addBookingResponse = await addAccessBooking({
            booking: {
              voucherModel: 'OPEN_ACCESS',
              accessProjectID: selectedKeys,
              accessProjectStatus: 'OPEN',
              projectID: projectSearchValues.projectID,
            },
            acTypeId: projectSearchValues.acTypeId,
          }).unwrap();

          console.log('Add Booking Response:', addBookingResponse);
          notification.success({
            message: t('SUCCESS OPEN'),
            description: t('ACCESS SUCCESSFULLY OPEN'),
          });

          // refetch();
        } catch (error) {
          console.error('Error updating access or adding booking:', error);
          notification.success({
            message: t('ERROR OPEN'),
            description: t('ACCESS OPEN ERROR'),
          });
        }
      },
    });
  };
  const handleUpdateClosed = async (selectedKeys: any[]) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO CLOSED SELECTED ACCESS?'),
      onOk: async () => {
        try {
          await updateAccess({
            accessIds: selectedKeys,
            status: 'closed',
            installUserId: USER_ID,
          });
          const addBookingResponse = await addAccessBooking({
            booking: {
              voucherModel: 'CLOSE_ACCESS',
              accessProjectID: selectedKeys,
              accessProjectStatus: 'CLOSED',
              projectID: projectSearchValues.projectID,
            },
            acTypeId: projectSearchValues.acTypeId,
          }).unwrap();
          console.log('Add Booking Response:', addBookingResponse);
          notification.success({
            message: t('SUCCESS CLOSE'),
            description: t('ACCESS SUCCESSFULLY CLOSED'),
          });
          // refetch();
        } catch (error) {
          notification.success({
            message: t('ERROR CLOSED'),
            description: t('ACCESS CLOSED ERROR'),
          });
        }
      },
    });
  };
  const handleUpdateInspected = async (selectedKeys: any[]) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO INSPECT SELECTED ACCESS?'),
      onOk: async () => {
        try {
          await updateAccess({
            accessIds: selectedKeys,
            status: 'inspected',
            inspectedUserID: USER_ID,
          }).unwrap();
          const addBookingResponse = await addAccessBooking({
            booking: {
              voucherModel: 'INSPECT_ACCESS',
              accessProjectID: selectedKeys,
              accessProjectStatus: 'INSPECTION',
              projectID: projectSearchValues.projectID,
            },
            acTypeId: projectSearchValues.acTypeId,
          }).unwrap();
          console.log('Add Booking Response:', addBookingResponse);
          notification.success({
            message: t('SUCCESS INSPECT'),
            description: t('ACCESS SUCCESSFULLY INSPECT'),
          });
          // refetch();
        } catch (error) {
          notification.success({
            message: t('ERROR INSPECT'),
            description: t('ACCESS INSPECT ERROR'),
          });
        }
      },
    });
  };

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
      width: 250,
      filter: true,
    },
    {
      field: 'majoreZoneNbr',
      headerName: `${t('ZONE')}`,
      cellDataType: 'text',
      filter: true,
      width: 100,
    },
    {
      field: 'subZoneNbr',
      filter: true,
      headerName: `${t('SUB ZONE')}`,
      cellDataType: 'text',
      width: 100,
    },
    {
      field: 'areaNbr',
      filter: true,
      headerName: `${t('AREA')}`,
      cellDataType: 'text',
      width: 100,
    },
    {
      field: 'areaDescription',
      filter: true,
      headerName: `${t('AREA DESCRIPTION')}`,
      cellDataType: 'text',
      width: 250,
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
            onClick={() => handleDelete(editingproject.id || '')}
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
              onClick={() => handleUpdateClosed(selectedKeys)}
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
              onClick={() => handleUpdateInspected(selectedKeys)}
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
                <PartContainer
                  isFilesVisiable={false}
                  isVisible={true}
                  pagination={true}
                  isAddVisiable={true}
                  isButtonVisiable={false}
                  isEditable={false}
                  height={'65vh'}
                  columnDefs={columnDefsAccets}
                  partNumbers={[]}
                  isChekboxColumn={true}
                  onUpdateData={(data: any[]): void => {}}
                  rowData={transformedTaleAccess}
                  isLoading={isLoading}
                  onCheckItems={(selectedKeys) => {
                    setSelectedKeys(selectedKeys);
                  }}
                  onRowSelect={handleEdit}
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
                          title: t(' ARE YOU SURE, YOU WANT TO ADD ACCESS'),
                          onOk: async () => {
                            try {
                              await addPanels({
                                accessIds: [accessCode.accessID],
                                WOReferenceID: accessCode.WOReferenceID,
                                projectTaskIds: accessCode.projectTaskID,
                              }).unwrap();
                              // refetchProjectItems();
                              message.success(t('ДОСТУПЫ УСПЕШНО СОЗДАНЫ'));
                              Modal.destroyAll();
                            } catch (error) {
                              message.error(t('ОШИБКА '));
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
                      <PartContainer
                        isFilesVisiable={false}
                        isVisible={false}
                        pagination={false}
                        isAddVisiable={true}
                        isButtonVisiable={false}
                        isEditable={false}
                        height={'56vh'}
                        columnDefs={columnDefs}
                        partNumbers={[]}
                        isChekboxColumn={false}
                        onUpdateData={(data: any[]): void => {}}
                        rowData={transformedAccess}
                        isLoading={false}
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
    </div>
  );
};

export default AccessAdminPanel;
