import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import { ACTypesFilteredFormValues } from './ASTypesFilteredForm';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { IACType } from '@/models/AC';
import ACTypesForm from './ACTypesForm';
import ACTypesTree from './RequirementsTree';
import {
  useAddACTypeMutation,
  useDeleteACTypeMutation,
  useGetACTypesQuery,
  useUpdateACTypeMutation,
} from '@/features/acTypeAdministration/acTypeApi';

interface AdminPanelProps {
  values: ACTypesFilteredFormValues;
}

const AdminACTypesPanel: React.FC<AdminPanelProps> = ({ values }) => {
  const [editingACType, setEditingACType] = useState<IACType | null>(null);
  const { acTypes } = useTypedSelector((state) => state.acTypes);

  const { isLoading } = useGetACTypesQuery({});

  const [addACType] = useAddACTypeMutation();
  const [updateACType] = useUpdateACTypeMutation();
  const [deleteACType] = useDeleteACTypeMutation();

  const handleCreate = () => {
    setEditingACType(null);
  };

  const handleEdit = (acType: IACType) => {
    setEditingACType(acType);
  };

  const handleDelete = async (acTypeId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS AC TYPE?'),
      onOk: async () => {
        try {
          await deleteACType(acTypeId).unwrap();
          message.success(t('AC TYPE SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING AC TYPE'));
        }
      },
    });
  };

  const handleSubmit = async (acType: IACType) => {
    try {
      if (editingACType) {
        await updateACType(acType).unwrap();
        message.success(t('VENDOR SUCCESSFULLY UPDATED'));
      } else {
        await addACType(acType).unwrap();
        message.success(t('VENDOR SUCCESSFULLY ADDED'));
      }
    } catch (error) {
      message.error(t('ERROR SAVING VENDOR GROUP'));
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
      <Space className="gap-4 pb-3">
        <Col span={20}>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD AC TYPE')}
          </Button>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingACType && (
            <Button
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingACType.id)}
            >
              {t('DELETE AC TYPE')}
            </Button>
          )}
        </Col>
      </Space>

      <div className="  flex gap-4 justify-between">
        <div
          // sm={4}
          className="w-3/12 h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3 "
        >
          <ACTypesTree onACTypeSelect={handleEdit} acTypes={acTypes || []} />
        </div>
        <div
          className="w-9/12  h-[75vh] bg-white px-4 rounded-md brequierement-gray-400 p-3  "
          // sm={19}
        >
          <ACTypesForm
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            acType={editingACType || undefined}
          />
        </div>
      </div>
    </>
  );
};

export default AdminACTypesPanel;
