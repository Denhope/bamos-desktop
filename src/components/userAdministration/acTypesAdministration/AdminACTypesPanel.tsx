import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import { ACTypesFilteredFormValues } from './ASTypesFilteredForm';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { IACType } from '@/models/AC';
import ACTypesForm from './ACTypesForm';
import ACTypesTree from './ACTypesTree';
import {
  useAddACTypeMutation,
  useDeleteACTypeMutation,
  useGetACTypesQuery,
  useUpdateACTypeMutation,
} from '@/features/acTypeAdministration/acTypeApi';
import { Split } from '@geoffcox/react-splitter';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';

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
          <PermissionGuard requiredPermissions={[Permission.AC_ACTIONS]}>
            <Button
              size="small"
              icon={<PlusSquareOutlined />}
              onClick={handleCreate}
            >
              {t('ADD AC TYPE')}
            </Button>
          </PermissionGuard>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingACType && (
            <PermissionGuard requiredPermissions={[Permission.AC_ACTIONS]}>
              <Button
                size="small"
                icon={<MinusSquareOutlined />}
                onClick={() => handleDelete(editingACType.id)}
              >
                {t('DELETE AC TYPE')}
              </Button>
            </PermissionGuard>
          )}
        </Col>
      </Space>

      <div className="  flex gap-4 justify-between">
        <Split initialPrimarySize="20%" splitterSize="20px">
          <div
            // sm={4}
            className=" h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3 "
          >
            <ACTypesTree onACTypeSelect={handleEdit} acTypes={acTypes || []} />
          </div>
          <div
            className="h-[78vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto"
            // sm={19}
          >
            <ACTypesForm
              onSubmit={handleSubmit}
              onDelete={handleDelete}
              acType={editingACType || undefined}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default AdminACTypesPanel;
