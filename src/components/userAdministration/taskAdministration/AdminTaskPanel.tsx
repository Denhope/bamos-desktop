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
} from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import {} from '@/features/vendorAdministration/vendorApi';
import { TaskFilteredFormValues } from './AdminTaskFilterdForm';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import {
  useAddTaskMutation,
  useGetTasksQuery,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
  useAddMultiTaskItemsMutation,
} from '@/features/tasksAdministration/tasksApi';
import AdminTaskPanelTree from './AdminTaskPanelTree';
import AdminTaskPanelForm from './AdminTaskPanelForm';
import { ITask, ITaskResponce } from '@/models/ITask';
import { Split } from '@geoffcox/react-splitter';
import FileUploader from '@/components/shared/FileUploader';
import MyTable from '@/components/shared/Table/MyTable';
import TaskList from '@/components/shared/Table/TaskList';
import { transformToITask } from '@/services/utilites';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import { useGlobalState } from '@/components/woAdministration/GlobalStateContext';

interface AdminPanelProps {
  values: TaskFilteredFormValues;
  isLoadingF?: boolean;
}

const AdminTaskPanel: React.FC<AdminPanelProps> = ({ values, isLoadingF }) => {
  const { setTasksFormValues, tasksFormValues } = useGlobalState();
  // const { tasks, isLoading } = useTypedSelector(
  //   (state) => state.tasksAdministration
  // );

  const [editingvendor, setEditingvendor] = useState<ITask | null>(null);

  const {
    data: tasksQuery,
    refetch: refetchTasks,
    isLoading,
    isFetching: isFetchungQuery,
  } = useGetTasksQuery(
    {
      acTypeID: tasksFormValues?.acTypeId,
      time: tasksFormValues?.time,
      amtoss: tasksFormValues?.AMM,
      taskNumber: tasksFormValues?.taskNumber,
      cardNumber: tasksFormValues?.cardNumber,
      mpdDocumentationId: tasksFormValues?.mpdDocumentationId,
    },
    { skip: !tasksFormValues }
  );

  useEffect(() => {
    setEditingvendor(null);
  }, [tasksFormValues, tasksQuery]);

  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [addMultiTask] = useAddMultiTaskItemsMutation();
  const [isTreeView, setIsTreeView] = useState(true);
  const handleCreate = () => {
    setEditingvendor(null);
  };

  const handleEdit = (vendor: ITask) => {
    setEditingvendor(vendor);
  };

  const handleDelete = async (vendorId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS TASK?'),
      onOk: async () => {
        try {
          await deleteTask(vendorId).unwrap();
          message.success(t('TASK SUCCESSFULLY DELETED'));
          setEditingvendor(null);
        } catch (error) {
          message.error(t('ERROR DELETING TASK'));
        }
      },
    });
  };

  const handleSubmit = async (task: ITask) => {
    try {
      if (editingvendor) {
        await updateTask(task).unwrap();
        message.success(t('TASK SUCCESSFULLY UPDATED'));
      } else {
        await addTask({ task }).unwrap();
        console.log(task);
        message.success(t('TASK SUCCESSFULLY ADDED'));
      }
      // setEditingvendor(null);
    } catch (error) {
      message.error(t('ERROR SAVING TASK GROUP'));
    }
  };
  //
  const { t } = useTranslation();

  // if (isLoading) {
  //   return (
  //     <div>
  //       <Spin />
  //     </div>
  //   );
  // }
  interface ColumnDef {
    field: keyof ITask;
    headerName: string;
    resizable?: boolean;
    filter?: boolean;
    hide?: boolean;
    valueGetter?: any;
    valueFormatter?: any;
  }
  const columnDefs: any[] = [
    {
      field: 'taskNumber',
      headerName: `${t('TASK WO')}`,
      filter: true,
      // hide: true,
    },
    {
      field: 'taskType',
      headerName: `${t('TASK TYPE')}`,
      filter: true,
      // hide: true,
    },
    { field: 'description', headerName: `${t('DESCRIPTION')}`, filter: true },
    {
      field: 'PART_NUMBER',
      headerName: `${t('PART No')}`,
      filter: true,
    },
    {
      field: 'rev',
      headerName: `${t('REVISION')}`,
      filter: true,
    },
    { field: 'MPD', headerName: `${t('MPD')}`, filter: true },
    { field: 'amtoss', headerName: `${t('AMM')}`, filter: true },
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
  const handleAddMultiItems = async (data: any) => {
    try {
      {
        await addMultiTask({
          taskNumberDTO: data,
        }).unwrap();
        message.success(t('УСПЕШНО ДОБАВЛЕНО'));
        // setEditingvendor(null);
      }
    } catch (error) {
      message.error(t('ОШИБКА СОХРАНЕНИЯ'));
    }
  };

  const transformedTasks = useMemo(() => {
    return transformToITask(tasksQuery || []);
  }, [tasksQuery]);
  const { data: partNumbers } = useGetPartNumbersQuery({});

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
        <FileUploader
          isDisabled
          onFileProcessed={function (data: any[]): void {
            handleAddMultiItems(data);
          }}
          requiredFields={[
            'taskNumber',
            'taskDescription',
            'taskType',
            'mainWorkTime',
            'amtoss',
            'qtyOneMachine',
            'qtyTenMachine',
            'machineWorkTimeHours',
            'machineWorkTimeDays',
          ]}
        ></FileUploader>
        <Col style={{ textAlign: 'right' }}>
          {editingvendor && (
            <PermissionGuard requiredPermissions={[Permission.TASK_ACTIONS]}>
              <Button
                size="small"
                icon={<MinusSquareOutlined />}
                onClick={() => handleDelete(editingvendor.id)}
              >
                {t('DELETE TASK')}
              </Button>
            </PermissionGuard>
          )}
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

      <div className="  flex gap-4 justify-between">
        <Split initialPrimarySize="20%" splitterSize="20px">
          <div className=" h-[74vh] bg-white px-4 rounded-md border-gray-400 p-3 ">
            {isTreeView ? (
              <>
                {tasksQuery && tasksQuery.length ? (
                  <AdminTaskPanelTree
                    onTaskSelect={handleEdit}
                    tasks={tasksQuery || []}
                    isLoading={isFetchungQuery || isLoading}
                  />
                ) : (
                  <Empty />
                )}
              </>
            ) : (
              <TaskList
                pagination={true}
                isChekboxColumn={false}
                columnDefs={columnDefs}
                rowData={transformedTasks || []}
                onRowSelect={function (rowData: any | null): void {
                  handleEdit(rowData);
                }}
                height={'69vh'}
                onCheckItems={function (selectedKeys: React.Key[]): void {
                  throw new Error('Function not implemented.');
                }}
                isLoading={isFetchungQuery || isLoading}
              />
            )}
          </div>
          <div className=" h-[73vh] bg-white px-4 rounded-md brequierement-gray-400 p-3   overflow-y-auto ">
            {
              <AdminTaskPanelForm
                task={editingvendor || undefined}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
              />
            }
          </div>
        </Split>
      </div>
    </>
  );
};

export default AdminTaskPanel;
