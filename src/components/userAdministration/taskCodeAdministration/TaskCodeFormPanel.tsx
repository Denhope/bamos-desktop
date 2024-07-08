import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import { ITaskCode } from '@/models/ITask';

import TaskCodeTree from './TaskCodeTree';
import {
  useGetGroupTaskCodesQuery,
  useDeleteTaskCodeMutation,
  useAddTaskCodeMutation,
  useUpdateTaskCodeMutation,
} from '@/features/tasksAdministration/taskCodesApi';
import TaskCodeForm from './TaskCodeForm';
import { Split } from '@geoffcox/react-splitter';

interface AdminPanelProps {
  acTypeID: string;
}

const TaskCodeFormPanel: React.FC<AdminPanelProps> = ({ acTypeID }) => {
  const [editingTaskCode, setEditingTaskCode] = useState<ITaskCode | null>(
    null
  );
  let taskCodes = null;
  let isLoading = false;

  if (acTypeID) {
    const { data, isLoading: loading } = useGetGroupTaskCodesQuery({
      acTypeID,
    });
    taskCodes = data;
    isLoading = loading;
  }
  const [addTaskCode] = useAddTaskCodeMutation({});
  const [updateTaskCode] = useUpdateTaskCodeMutation();
  const [deleteTaskCode] = useDeleteTaskCodeMutation();

  const handleCreate = () => {
    setEditingTaskCode(null);
  };

  const handleEdit = (taskCode: ITaskCode) => {
    setEditingTaskCode(taskCode);
  };

  const handleDelete = async (taskCodeId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS TASK CODE?'),
      onOk: async () => {
        try {
          await deleteTaskCode(taskCodeId).unwrap();
          message.success(t('TASK CODE SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING TASK CODE'));
        }
      },
    });
  };

  const handleSubmit = async (taskCode: ITaskCode) => {
    try {
      if (editingTaskCode) {
        await updateTaskCode(taskCode).unwrap();
        message.success(t('TASK CODE SUCCESSFULLY UPDATED'));
        setEditingTaskCode(null);
      } else {
        await addTaskCode({ taskCode, acTypeId: acTypeID }).unwrap();
        message.success(t('TASK CODE SUCCESSFULLY ADDED'));
        setEditingTaskCode(null);
      }
    } catch (error) {
      message.error(t('ERROR SAVING TASK CODE'));
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
  return (
    <>
      <Space className="gap-6 pb-3">
        <Col span={20}>
          <Button
            size="small"
            icon={<UserAddOutlined />}
            onClick={handleCreate}
          >
            {t('ADD TASK CODE')}
          </Button>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingTaskCode && (
            <Button
              size="small"
              icon={<UserDeleteOutlined />}
              onClick={() => handleDelete(editingTaskCode.id)}
            >
              {t('DELETE TASK CODE')}
            </Button>
          )}
        </Col>
      </Space>

      <div className=" flex gap-4 justify-between py-4 bg-gray-100 rounded-sm">
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div className="h-[62vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 ">
            <TaskCodeTree
              taskCodes={taskCodes || []}
              onTaskCodeSelect={handleEdit}
            />
          </div>
          <div className="h-[62vh] bg-white px-4 py-3 rounded-md brequierement-gray-400 p-3 ">
            <TaskCodeForm
              taskCode={editingTaskCode || undefined}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default TaskCodeFormPanel;
