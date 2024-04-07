import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import {} from '@/features/vendorAdministration/vendorApi';
import { VendorFilteredFormValues } from './ACAdministrationFilterdForm';
import { useTypedSelector } from '@/hooks/useTypedSelector';

import { ITask } from '@/models/ITask';

import ACAdministrationlForm from './ACAdministrationlForm';

import ACAdministrationTree from './ACAdministrationTree';
import {
  useAddPlaneMutation,
  useDeletePlaneMutation,
  useGetPlanesQuery,
  useUpdatePlaneMutation,
} from '@/features/ACAdministration/acApi';
// import {
//   useAddPlaneMutation,
//   useDeletePlaneMutation,
//   useGetPlanesQuery,
//   useUpdatePlaneMutation,
// } from '@/features/acAdministration/acApi';

interface AdminPanelProps {
  values: VendorFilteredFormValues;
}

const ACAdministrationPanel: React.FC<AdminPanelProps> = ({ values }) => {
  const [editingvendor, setEditingvendor] = useState<ITask | null>(null);
  const { planes } = useTypedSelector((state) => state.planesAdministration);

  const { isLoading } = useGetPlanesQuery({});

  const [addPlane] = useAddPlaneMutation();
  const [updatePlane] = useUpdatePlaneMutation();
  const [deletePlane] = useDeletePlaneMutation();

  const handleCreate = () => {
    setEditingvendor(null);
  };

  const handleEdit = (vendor: any) => {
    setEditingvendor(vendor);
  };

  const handleDelete = async (vendorId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS A/C?'),
      onOk: async () => {
        try {
          await deletePlane(vendorId).unwrap();
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
        await updatePlane(task).unwrap();
        message.success(t('A/C SUCCESSFULLY UPDATED'));
      } else {
        await addPlane({ task }).unwrap();
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

      <div className="  flex gap-4 justify-between">
        <div
          // sm={4}
          className="w-2/12 h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3 "
        >
          <ACAdministrationTree
            onPlaneselect={handleEdit}
            planes={planes || []}
          />
        </div>
        <div
          className="w-10/12  h-[75vh] bg-white px-4 rounded-md brequierement-gray-400 p-3  "
          // sm={19}
        >
          <ACAdministrationlForm
            task={editingvendor || undefined}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </>
  );
};

export default ACAdministrationPanel;
