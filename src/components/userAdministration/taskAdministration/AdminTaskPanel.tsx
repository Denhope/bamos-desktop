import React, { useEffect, useState } from 'react';
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

interface AdminPanelProps {
  values: TaskFilteredFormValues;
  isLoading: any;
}

const AdminTaskPanel: React.FC<AdminPanelProps> = ({ values, isLoading }) => {
  const [editingvendor, setEditingvendor] = useState<ITask | null>(null);
  const { tasks } = useTypedSelector((state) => state.tasksAdministration);

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
      setEditingvendor(null);
    } catch (error) {
      message.error(t('ERROR SAVING TASK GROUP'));
    }
  };

  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div>
        <Spin />
      </div>
    );
  }
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
    { field: 'description', headerName: `${t('DESCRIPTION')}`, filter: true },
    // { field: 'closedByID', headerName: 'Closed By ID' },
    {
      field: 'PART_NUMBER',
      headerName: `${t('PART No')}`,
      filter: true,
    },
    {
      field: 'status',
      headerName: `${t('STATUS')}`,
      filter: true,
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        return params.value.toUpperCase();
      },
    },
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
        setEditingvendor(null);
      }
    } catch (error) {
      message.error(t('ОШИБКА СОХРАНЕНИЯ'));
    }
  };

  return (
    <>
      <Space className="gap-6 pb-3">
        <Col>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD TASK')}
          </Button>
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
            <Button
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingvendor.id)}
            >
              {t('DELETE TASK')}
            </Button>
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
                {tasks && tasks.length ? (
                  <AdminTaskPanelTree
                    onTaskSelect={handleEdit}
                    tasks={tasks || []}
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
                rowData={transformToITask(tasks) || []}
                onRowSelect={function (rowData: any | null): void {
                  handleEdit(rowData);
                }}
                height={'69vh'}
                onCheckItems={function (selectedKeys: React.Key[]): void {
                  throw new Error('Function not implemented.');
                }}
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
