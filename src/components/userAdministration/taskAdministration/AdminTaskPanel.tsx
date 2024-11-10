//ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Row,
  Col,
  Modal,
  message,
  Space,
  Spin,
  Empty,
  Switch,
  notification,
} from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { TaskFilteredFormValues } from './AdminTaskFilterdForm';
import { useTypedSelector } from '@/hooks/useTypedSelector';

import AdminTaskPanelTree from './AdminTaskPanelTree';
import AdminTaskPanelForm from './AdminTaskPanelForm';
import { ITask, ITaskResponce } from '@/models/ITask';
import { Split } from '@geoffcox/react-splitter';
import FileUploader from '@/components/shared/FileUploader';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';
import {
  getTaskTypeColor,
  transformToITask,
  ValueEnumTypeTask,
} from '@/services/utilites';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import { useGlobalState } from '@/components/woAdministration/GlobalStateContext';
import {
  useAddMultiTaskItemsMutation,
  useAddTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from '@/features/tasksAdministration/tasksApi';

interface AdminPanelProps {
  values: TaskFilteredFormValues;
  isLoadingF?: boolean;
}

const AdminTaskPanel: React.FC<AdminPanelProps> = ({ values, isLoadingF }) => {
  const [editingvendor, setEditingvendor] = useState<ITask | null>(null);
  const [selectedItems, setSelectedItems] = useState<React.Key[] | []>([]);
  const {
    data: tasksQuery,
    refetch: refetchTasks,
    isLoading,
    isFetching: isFetchungQuery,
  } = useGetTasksQuery(
    {
      acTypeID: values?.acTypeId,
      time: values?.time,
      amtoss: values?.AMM,
      taskNumber: values?.taskNumber,
      cardNumber: values?.cardNumber?.toString(),
      mpdDocumentationId: values?.mpdDocumentationId,
      taskType: values?.taskType?.toString(),
      isCriticalTask: values?.isCriticalTask,
    },
    { skip: !values }
  );

  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [addMultiTask] = useAddMultiTaskItemsMutation();
  const [isTreeView, setIsTreeView] = useState(false);
  const handleCreate = () => {
    setEditingvendor(null);
  };
  const { t } = useTranslation();
  const handleEdit = (vendor: ITask) => {
    setEditingvendor(vendor);
  };

  const handleDelete = async (items: React.Key[]) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS TASK?'),
      onOk: async () => {
        try {
          await deleteTask(items.toString()).unwrap();
          notification.success({
            message: t('SUCCESS'),
            description: t('TASK SUCCESSFULLY DELETED'),
          });
          setEditingvendor(null);
        } catch (error) {
          notification.error({
            message: t('ERROR'),
            description: t('ERROR DELETING TASK'),
          });
        }
      },
    });
  };
  const valueEnumTask: ValueEnumTypeTask = {
    RC: t('TC'),
    CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
    NRC: t('NRC (DEFECT)'),
    NRC_ADD: t('ADHOC (ADHOC TASK)'),
    MJC: t('MJC'),
    CMJC: t('CMJC'),
    FC: t('FC'),
    SMC: t('SMC'),
    SB: t('SB'),
    HARD_ACCESS: t('HARD_ACCESS'),
  };
  const handleSubmit = async (task: ITask) => {
    try {
      if (editingvendor) {
        await updateTask(task).unwrap();
        notification.success({
          message: t('SUCCESS'),
          description: t('TASK SUCCESSFULLY UPDATED'),
        });
      } else {
        await addTask({ task }).unwrap();
        notification.success({
          message: t('SUCCESS'),
          description: t('TASK SUCCESSFULLY ADDED'),
        });
      }
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('ERROR SAVING TASK'),
      });
    }
  };

  const columnDefs: any[] = [
    {
      field: 'cardNumber',
      headerName: `${t('CARD No')}`,
      filter: true,
      width: 100,
    },
    {
      field: 'taskNumber',
      headerName: `${t('TASK No')}`,
      filter: true,
    },
    {
      field: 'taskType',
      headerName: `${t('TASK TYPE')}`,
      filter: true,
      valueGetter: (params: { data: { taskType: keyof ValueEnumTypeTask } }) =>
        params.data.taskType,
      valueFormatter: (params: { value: keyof ValueEnumTypeTask }) => {
        const status = params.value;
        return valueEnumTask[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumTypeTask }) => ({
        backgroundColor: getTaskTypeColor(params.value),
      }),
    },
    { field: 'description', headerName: `${t('DESCRIPTION')}`, filter: true },
    {
      field: 'rev',
      headerName: `${t('REVISION')}`,
      filter: true,
    },
    { field: 'MPD', headerName: `${t('MPD')}`, filter: true },
    { field: 'amtoss', headerName: `${t('REFERENCE')}`, filter: true },
    { field: 'ZONE', headerName: `${t('ZONE')}`, filter: true },
    { field: 'ACCESS', headerName: `${t('ACCESS')}`, filter: true },
    { field: 'ACCESS_NOTE', headerName: `${t('ACCESS_NOTE')}`, filter: true },
    { field: 'SKILL_CODE1', headerName: `${t('SKILL_CODE')}`, filter: true },
    { field: 'TASK_CODE', headerName: `${t('TASK_CODE')}`, filter: true },
    {
      field: 'SUB TASK_CODE',
      headerName: `${t('SUB TASK_CODE')}`,
      filter: true,
    },
    { field: 'PHASES', headerName: `${t('PHASES')}`, filter: true },
    {
      field: 'RESTRICTION_1',
      headerName: `${t('RESTRICTION_1')}`,
      filter: true,
    },
    {
      field: 'PREPARATION_CODE',
      headerName: `${t('PREPARATION_CODE')}`,
      filter: true,
    },
    {
      field: 'REFERENCE_2',
      headerName: `${t('REFERENCE_2')}`,
      filter: true,
    },
    {
      field: 'mainWorkTime',
      headerName: `${t('MHS')}`,
      filter: true,
    },
    {
      field: 'createDate',
      headerName: `${t('CREATE DATE')}`,
      filter: true,
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
  ];

  const handleAddMultiItems = async (data: any) => {
    try {
      {
        await addMultiTask({
          taskNumberDTO: data,
        }).unwrap();
        message.success(t('УСПЕШНО ДОБАВЛЕНО'));
      }
    } catch (error) {
      message.error(t('ОШИБКА СОХРАНЕНИЯ'));
    }
  };

  const transformedTasks = useMemo(() => {
    return transformToITask(tasksQuery || []);
  }, [tasksQuery]);
  const { data: partNumbers } = useGetPartNumbersQuery({});

  useEffect(() => {
    if (values) {
      console.log('Refetching with values:', values);
      refetchTasks();
    }
  }, [values, refetchTasks]);

  return (
    <>
      <Space className="gap-6 pb-3">
        <Col>
          <PermissionGuard requiredPermissions={[Permission.TASK_ACTIONS]}>
            <Button
              size="small"
              icon={<PlusSquareOutlined />}
              onClick={handleCreate}
            >
              {t('ADD TASK')}
            </Button>
          </PermissionGuard>
        </Col>
        <PermissionGuard requiredPermissions={[Permission.TASK_ACTIONS]}>
          <FileUploader
            onFileProcessed={function (data: any[]): void {
              handleAddMultiItems(data);
            }}
            requiredFields={[
              'taskNumber',
              'taskDescription',
              'taskType',
              'amtoss',
            ]}
          ></FileUploader>
        </PermissionGuard>
        <Col style={{ textAlign: 'right' }}>
          {
            <PermissionGuard requiredPermissions={[Permission.TASK_ACTIONS]}>
              <Button
                disabled={!selectedItems?.length}
                size="small"
                icon={<MinusSquareOutlined />}
                onClick={() => handleDelete(selectedItems)}
              >
                {t('DELETE TASK')}
              </Button>
            </PermissionGuard>
          }
        </Col>
        <Col>
          <Switch
            checkedChildren="Table"
            unCheckedChildren="Tree"
            defaultChecked
            onChange={() => setIsTreeView(!isTreeView)}
          />
        </Col>
      </Space>

      <div className="flex justify-between">
        <Split initialPrimarySize="35%" splitterSize="20px">
          <div className="h-[72vh] bg-white px-4 rounded-md border-gray-400 p-3">
            {isTreeView ? (
              <>
                {tasksQuery && tasksQuery.length ? (
                  <AdminTaskPanelTree
                    onTaskSelect={handleEdit}
                    tasks={tasksQuery || []}
                    isLoading={isFetchungQuery || isLoading}
                    onCheckItems={function (items: any): void {
                      return setSelectedItems(items);
                    }}
                  />
                ) : (
                  <Empty />
                )}
              </>
            ) : (
              <UniversalAgGrid
                gridId="taskList"
                pagination={true}
                isChekboxColumn={true}
                columnDefs={columnDefs}
                rowData={transformedTasks || []}
                onRowSelect={function (rowData: any | null): void {
                  handleEdit(rowData[0]);
                }}
                height={'65vh'}
                onCheckItems={(items: React.Key[]): void => {
                  setSelectedItems(items);
                }}
                isLoading={isLoading || isFetchungQuery}
              />
            )}
          </div>
          <div className="h-[70vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            {
              <AdminTaskPanelForm
                task={editingvendor || undefined}
                onSubmit={handleSubmit}
              />
            }
          </div>
        </Split>
      </div>
    </>
  );
};

export default AdminTaskPanel;
