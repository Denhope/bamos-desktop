import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import {} from '@/features/vendorAdministration/vendorApi';
import { VendorFilteredFormValues } from './ACAdministrationFilterdForm';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import {
  useAddTaskMutation,
  useGetTasksQuery,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from '@/features/tasksAdministration/tasksApi';
import AdminTaskPanelTree from './ACAdministrationTree';
import AdminTaskPanelForm from './ACAdministrationlForm';
import { ITask, ITaskResponce } from '@/models/ITask';
import ACAdministrationTree from './ACAdministrationTree';
import ACAdministrationlForm from './ACAdministrationlForm';

interface AdminPanelProps {
  values: VendorFilteredFormValues;
}

const ACAdministrationPanel: React.FC<AdminPanelProps> = ({ values }) => {
  const [editingvendor, setEditingvendor] = useState<ITask | null>(null);
  const { tasks } = useTypedSelector((state) => state.tasksAdministration);

  const { isLoading } = useGetTasksQuery({});

  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const handleCreate = () => {
    setEditingvendor(null);
  };

  const handleEdit = (vendor: ITask) => {
    setEditingvendor(vendor);
  };

  const handleDelete = async (vendorId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS A/C?'),
      onOk: async () => {
        try {
          await deleteTask(vendorId).unwrap();
          message.success(t('A/C SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING A/C'));
        }
      },
    });
  };

  const handleSubmit = async (task: ITask) => {
    try {
      if (editingvendor) {
        await updateTask(task).unwrap();
        message.success(t('A/C SUCCESSFULLY UPDATED'));
      } else {
        await addTask({ task }).unwrap();
        console.log(task);
        message.success(t('A/C SUCCESSFULLY ADDED'));
      }
      setEditingvendor(null);
    } catch (error) {
      message.error(t('ERROR SAVING A/C GROUP'));
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
        <Col>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD A/C')}
          </Button>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingvendor && (
            <Button
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingvendor.id)}
            >
              {t('DELETE A/C')}
            </Button>
          )}
        </Col>
      </Space>

      <Row className="gap-6">
        <Col
          sm={6}
          className="h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3 "
        >
          <AdminTaskPanelTree onTaskSelect={handleEdit} tasks={tasks || []} />
        </Col>
        <Col
          className="h-[75vh] bg-white px-4 rounded-md brequierement-gray-400 p-3  "
          sm={17}
        >
          <ACAdministrationlForm
            task={editingvendor || undefined}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        </Col>
      </Row>
    </>
  );
};

export default ACAdministrationPanel;
