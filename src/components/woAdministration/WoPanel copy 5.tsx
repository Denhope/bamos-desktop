// @ts-nocheck
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
  Tag,
} from 'antd';
import {
  PlusSquareOutlined,
  CheckCircleFilled,
  ShrinkOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Split } from '@geoffcox/react-splitter';
import WOTree from './WOTree';
import WOAdminForm from './WOAdminForm';

import { useGetProjectItemsWOQuery } from '@/features/projectItemWO/projectItemWOApi';
import { IProjectItemWO } from '@/models/AC';
import WODiscription from './WODiscription';

import {
  ValueEnumType,
  ValueEnumTypeTask,
  getStatusColor,
  getTaskTypeColor,
  transformToIProjectTask,
} from '@/services/utilites';

import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
import { useGetFilteredRequirementsQuery } from '@/features/requirementAdministration/requirementApi';

import UniversalAgGrid from '@/components/shared/UniversalAgGrid';
import { useAddMultiActionMutation } from '@/features/projectItemWO/actionsApi';

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
import { useGetSkillsQuery } from '@/features/userAdministration/skillApi';
import { useGetFilteredZonesQuery } from '@/features/zoneAdministration/zonesApi';

// Путь может отличаться

interface AdminPanelProps {
  projectSearchValues: any;
}

const colors = [
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
];

const useColorMap = () => {
  return useMemo(() => {
    const colorMap: Record<string, string> = {};
    let colorIndex = 0;

    return (code: string) => {
      if (!colorMap[code]) {
        colorMap[code] = colors[colorIndex % colors.length];
        colorIndex++;
      }
      return colorMap[code];
    };
  }, []);
};

const WoPanel: React.FC<AdminPanelProps> = ({ projectSearchValues }) => {
  const { t } = useTranslation();
  const [editingProject, setEditingProject] = useState<IProjectItemWO | null>(
    null
  );
  const [editingProjectNRC, setEditingProjectNRC] = useState<any | null>(null);
  const {
    currentTime,
    setProjectTasksFormValues,
    projectTasksFormValues,
    setCurrentTime,
  } = useGlobalState();

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
      ...projectSearchValues,
      time: projectSearchValues?.time,
    },
    {
      skip: !triggerQuery,
      refetchOnMountOrArgChange: false,
    }
  );

  let storesIDString = '';
  if (Array.isArray(editingProject?.projectID?.storesID)) {
    storesIDString = editingProject?.projectID?.storesID.join(',');
  }
  const [addMultiAction] = useAddMultiActionMutation({});
  const [addTask] = useAddProjectTaskMutation();
  const [updateTask] = useUpdateProjectTaskMutation();
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
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

  const [isTreeView, setIsTreeView] = useState(false);
  const transformedTasks = useMemo(() => {
    return transformToIProjectTask(projectTasks || []);
  }, [projectTasks]);

  useEffect(() => {
    if (projectSearchValues) {
      const hasSearchParams = Object.values(projectSearchValues).some(
        (value) => value !== undefined && value !== ''
      );
      setTriggerQuery(hasSearchParams);
    }
  }, [projectSearchValues]);

  const handleRefetch = async () => {
    if (triggerQuery) {
      try {
        await refetch();
      } catch (error) {
        console.error('Refetch error:', error);
      }
    }
  };

  useEffect(() => {
    if (currentTime) {
      handleRefetch();
    }
  }, [currentTime]);

  const handleEdit = (project: IProjectItemWO) => {
    if (project.id !== editingProject?.id) {
      setEditingProject(project);
    }
  };

  const handleSubmit = async (task: any) => {
    try {
      if (editingProject && editingProject?.id) {
        const updatedTask = await updateTask(task).unwrap();
        // setEditingProject(null);
        setEditingProject(updatedTask);
        setSelectedRowId(updatedTask?._id || updatedTask?.id);
        notification.success({
          message: t('TASK SUCCESSFULLY UPDATED'),
          description: t('The task has been successfully updated.'),
        });
      } else if (!editingProject?.id) {
        const newTask = await addTask({
          project: { ...task, isNRC: true },
        }).unwrap();
        setEditingProject(newTask);
        // setSelectedRowId(newTask?._id || newTask?.id);
        refetch();
        notification.success({
          message: t('TASK SUCCESSFULLY ADDED'),
          description: t('The task has been successfully added.'),
        });
      }
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
      acTypeId,
      zonesID,
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
      acTypeId,
      zonesID: null,
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

  const getDefectCodeColor = useColorMap();
  const getTaskCodeColor = useColorMap();

  const renderTags = (value: string, getColor: (code: string) => string) => {
    const codes = value ? value.split(',') : [];
    return (
      <div>
        {codes.map((code: string, index: number) => {
          const trimmedCode = code.trim();
          return (
            <Tag
              key={index}
              color={getColor(trimmedCode)}
              style={{ margin: '2px' }}
            >
              {trimmedCode}
            </Tag>
          );
        })}
      </div>
    );
  };

  const { data: skills } = useGetSkillsQuery({});

  const skillMap = useMemo(() => {
    return (skills || []).reduce((acc, skill) => {
      acc[skill.id] = skill.code;
      return acc;
    }, {} as Record<string, string>);
  }, [skills]);

  const getSkillColor = useColorMap();

  const renderSkillTags = (skillIds: string[]) => {
    return (
      <div>
        {skillIds.map((id) => {
          const skillName = skillMap[id] || 'Unknown Skill';
          return (
            <Tag
              key={id}
              color={getSkillColor(skillName)}
              style={{ margin: '2px' }}
            >
              {skillName}
            </Tag>
          );
        })}
      </div>
    );
  };

  const { data: zones } = useGetFilteredZonesQuery({});

  const zoneMap = useMemo(() => {
    return (
      zones?.reduce((acc: Record<string, string>, zone: any) => {
        const id = zone?.id || zone?._id;
        const label = zone?.areaNbr || zone?.subZoneNbr || zone?.majoreZoneNbr;
        if (id && label) {
          acc[id] = label;
        }
        return acc;
      }, {}) || {}
    );
  }, [zones]);

  const getZoneColor = useColorMap();

  const renderZoneTags = (zoneIds: string[]) => {
    return (
      <div>
        {zoneIds.map((id) => {
          const zoneName = zoneMap[id] || 'Unknown Zone';
          return (
            <Tag
              key={id}
              // color={getZoneColor(zoneName)}
              style={{ margin: '2px' }}
            >
              {zoneName}
            </Tag>
          );
        })}
      </div>
    );
  };

  const columnDefs: any[] = [
    {
      field: 'status',
      headerName: `${t('TASK STATUS')}`,
      cellDataType: 'text',
      filter: true,
      valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
        params.data.status,
      valueFormatter: (params: { value: keyof ValueEnumType }) => {
        const status = params.value;
        return valueEnum[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumType }) => ({
        backgroundColor: getStatusColor(params.value),
      }),
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
      cellStyle: (params: { value: keyof ValueEnumTypeTask }) => ({
        backgroundColor: getTaskTypeColor(params.value),
      }),
    },
    {
      field: 'isCriticalTask',
      headerName: t('CRITICAL TASK'),
      cellDataType: 'boolean',
      cellRenderer: (params: { value: boolean }) => {
        return (
          <Tag color={params.value ? 'red' : 'green'}>
            {params.value ? t('YES') : t('NO')}
          </Tag>
        );
      },
      valueGetter: (params: any) => {
        return params.data.isCriticalTask;
      },
      filter: 'agЁSetColumnFilter',
      filterParams: {
        values: [true, false],
        valueFormatter: (params: any) => (params.value ? t('YES') : t('NO')),
      },
    },
    {
      field: 'taskWO',
      headerName: `${t('TRACE No')}`,
      filter: true,
    },
    {
      field: 'taskWONumber',
      headerName: `${t('SEQUENCE')}`,
      filter: true,
      // minWidth: 120,
      // flex: 1,
    },
    {
      field: 'defectCodeID',
      headerName: `${t('DEFECT CODE')}`,
      filter: true,
      cellRenderer: (params: any) =>
        renderTags(params.value, getDefectCodeColor),
    },
    {
      field: 'taskNumber',
      headerName: `${t('TASK NUMBER')}`,
      filter: true,
    },
    {
      field: 'taskDescription',
      headerName: `${t('DESCRIPTION')}`,
      filter: true,
    },
    {
      field: 'projectName',
      headerName: `${t('WP TITLE')}`,
      filter: true,
    },
    { field: 'MPD', headerName: `${t('MPD')}`, filter: true },
    { field: 'amtoss', headerName: `${t('REFERENCE')}`, filter: true },
    { field: 'ACCESS_NOTE', headerName: `${t('ACCESS NOTE')}`, filter: true },
    { field: 'PHASES', headerName: `${t('PHASES')}`, filter: true },
    {
      field: 'skillCodeID',
      headerName: `${t('SKILLS')}`,
      filter: true,
      cellRenderer: (params: any) => renderSkillTags(params.value || []),
    },
    {
      field: 'TASK_CODE',
      headerName: `${t('TASK CODE')}`,
      filter: true,
      cellRenderer: (params: any) => renderTags(params.value, getTaskCodeColor),
    },
    { field: 'ata', headerName: `${t('ATA')}`, filter: true },
    { field: 'mainWorkTime', headerName: `${t('PLANED TIME')}`, filter: true },
    {
      field: 'SUB TASK_CODE',
      headerName: `${t('SUB TASK CODE')}`,
      filter: true,
    },
    { field: 'createBy', headerName: `${t('CREATED BY')}`, filter: true },

    {
      field: 'createDate',
      headerName: `${t('CREATED DATE')}`,
      filter: true,
      width: 150,
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
    {
      field: 'zonesID',
      headerName: t('ZONES'),
      filter: true,
      cellRenderer: (params: any) => renderZoneTags(params.value || []),
      filterParams: {
        valueGetter: (params: any) => {
          return params.data.zonesID
            .map((id: string) => zoneMap[id])
            .join(', ');
        },
      },
    },
  ];

  const valueEnum: ValueEnumType = {
    inspect: t('INSPECTION'),
    diRequired: t('DI REQUIRED'),
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
    HARD_ACCESS: t('HARD_ACCESS'),
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

    if (actionType === 'reOpen') {
      Modal.confirm({
        title: t(
          `ARE YOU SURE YOU WANT TO REOPEN TASKS? ALL ACTIONS WILL BE DELETED!`
        ),
        onOk: async () => {
          try {
            const currentEditingProject = { ...editingProject };
            await addMultiAction({ actionType, ids });
            const refreshedData = await refetch().unwrap();

            setEditingProject(null);
            setSelectedRowId(null);

            const updatedProject = refreshedData.find(
              (task: any) => task.id === currentEditingProject.id
            );

            if (updatedProject) {
              setTimeout(() => {
                setEditingProject(updatedProject);
                setSelectedRowId(updatedProject.id);
              }, 100);
            }

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
    }

    if (actionType === 'open') {
      Modal.confirm({
        title: t(`ARE YOU SURE YOU WANT TO EDIT TASK?`),
        onOk: async () => {
          try {
            const currentEditingProject = { ...editingProject };
            await addMultiAction({ actionType, ids });
            const refreshedData = await refetch().unwrap();

            setEditingProject(null);
            setSelectedRowId(null);

            const updatedProject = refreshedData.find(
              (task: any) => task.id === currentEditingProject.id
            );

            if (updatedProject) {
              setTimeout(() => {
                setEditingProject(updatedProject);
                setSelectedRowId(updatedProject.id);
              }, 100);
            }

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
    }
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
      const currentEditingProject = { ...editingProject };

      for (const action of actions) {
        await addMultiAction({
          actionType: action?.type,
          ids,
          createDate: action?.createDate,
          userPerformDurations: action.userPerformDurations,
          userInspectDurations: action.userInspectDurations,
        });
      }

      const refreshedData = await refetch().unwrap();

      setEditingProject(null);
      setSelectedRowId(null);

      const updatedProject = refreshedData.find(
        (task: any) => task.id === currentEditingProject.id
      );

      if (updatedProject) {
        setTimeout(() => {
          setEditingProject(updatedProject);
          setSelectedRowId(updatedProject.id);
        }, 100);
      }

      notification.success({
        message: t('SUCCESS'),
        description: t('ACTIONS COMPLETED'),
      });
      setCurrentTime(Date.now());
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

  const [visibleActionAdd, setVisibleActionAdd] = useState(false);

  return (
    <div className="flex flex-col gap-5 overflow-hidden">
      <Space>
        <Col
          className="bg-white px-4 py-3 w-full rounded-md brequierement-gray-400"
          sm={24}
        >
          <WODiscription project={editingProject} />
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
        <Col>
          <PermissionGuard
            requiredPermissions={[Permission.PROJECT_TASK_ACTIONS]}
          >
            <Button
              onClick={() => {
                setVisibleActionAdd(true);
              }}
              disabled={
                !selectedKeys.length ||
                selectedKeys.length > 1 ||
                editingProject?.status == 'closed' ||
                editingProject?.status == 'diRequired' ||
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
          <PermissionGuard
            requiredPermissions={[Permission.CLOSE_CRITICAL_TASK]}
          >
            <Button
              danger
              onClick={() => {
                setVisibleActionAdd(true);
              }}
              disabled={
                !selectedKeys.length ||
                !editingProject?.isCriticalTask ||
                editingProject?.status !== 'diRequired' ||
                editingProject?.status == 'closed' ||
                editingProject?.status == 'cancelled'
              }
              size="small"
              icon={<CheckCircleFilled />}
            >
              {t('CLOSE CR TASK')}
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
              danger
              onClick={() => {
                handleAddAction('reOpen', selectedKeys, ['']);
              }}
              size="small"
              icon={<ShrinkOutlined />}
            >
              {t('REOPEN TASK')}
            </Button>
          </PermissionGuard>
        </Col>
        <Col>
          <PermissionGuard requiredPermissions={[Permission.PRINT_TASK_CARD]}>
            <PdfGenerator
              key={`pdf-${selectedKeys.join('-')}-${
                editingProject?.id
              }-${Date.now()}`}
              wo={editingProject}
              disabled={!selectedKeys.length}
              ids={selectedKeys}
              htmlTemplate={''}
              data={[]}
              buttonText="PRINT"
              isAddTextVisible={false}
            />
          </PermissionGuard>
        </Col>
        <Col>
          <PermissionGuard requiredPermissions={[Permission.PRINT_AS_ORIGINAL]}>
            <PdfGenerator
              key={`pdf-${selectedKeys.join('-')}-${
                editingProject?.id
              }-${Date.now()}`}
              wo={editingProject}
              disabled={!selectedKeys.length}
              ids={selectedKeys}
              htmlTemplate={''}
              data={[]}
              isOriginal={true}
              isAddTextVisible={false}
              buttonText="PRINT AS ORIGINAL"
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
              <UniversalAgGrid
                isLoading={isLoading || isFetching}
                selectedRowId={selectedRowId}
                isChekboxColumn
                gridId="woTaskList"
                rowData={transformedTasks || []}
                columnDefs={columnDefs}
                onRowSelect={(selectedRows) => {
                  if (selectedRows.length > 0) {
                    handleEdit(selectedRows[0]);
                    setSelectedRowId(selectedRows[0]._id || selectedRows[0].id);
                  } else {
                    // Если о��менили выделение
                    setEditingProject(null);
                    setSelectedRowId(null);
                  }
                }}
                onCheckItems={(selectedKeys) => {
                  setSelectedKeys(selectedKeys);
                  // Если сняли все выделения
                  if (selectedKeys.length === 0) {
                    setEditingProject(null);
                    setSelectedRowId(null);
                  }
                }}
                height="64vh"
                className="h-full"
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
            onlyWithOrganizationAuthorization={true}
            key={editingProject._id}
            currentTask={editingProject}
            visible={visibleActionAdd}
            users={users || []}
            onCancel={function (): void {
              setVisibleActionAdd(false);
            }}
            onSave={(data) => {
              console.log(data);
              if (editingProject?.isCriticalTask) {
                handleAddActionALL(data, selectedKeys, ['closed']);
              } else {
                handleAddActionALL(data, selectedKeys, ['closed']);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default WoPanel;
