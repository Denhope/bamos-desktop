import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import ProjectTypeForm from './OrderTextForm';
import { IProjectType } from '@/models/AC';
import {
  useAddProjectTypeMutation,
  useDeleteProjectTypeMutation,
  useGetProjectTypesQuery,
  useUpdateProjectTypeMutation,
} from '@/features/projectTypeAdministration/projectTypeApi';
import ProjectTypeTree from './OrderTextTree';
import { Split } from '@geoffcox/react-splitter';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import OrderTextForm from './OrderTextForm';
import OrderTextTree from './OrderTextTree';
import {
  useAddOrderTextMutation,
  useUpdateOrderTextMutation,
  useDeleteOrderTextMutation,
  useGetOrderTextTypesQuery,
} from '@/features/orderTextTypeAdministration/orderTextTypeApi';

interface AdminPanelProps {}

const OrderTextPanel: React.FC<AdminPanelProps> = () => {
  const [editingCompany, setEditingCompany] = useState<IProjectType | null>(
    null
  );

  const { data: companies, isLoading } = useGetOrderTextTypesQuery({});

  const [addProjectType] = useAddOrderTextMutation();
  const [updateProjectType] = useUpdateOrderTextMutation();
  const [deleteProjectType] = useDeleteOrderTextMutation();

  const handleCreate = () => {
    setEditingCompany(null);
  };

  const handleEdit = (company: IProjectType) => {
    setEditingCompany(company);
  };

  const handleDelete = async (companyId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS ITEM?'),
      onOk: async () => {
        try {
          await deleteProjectType(companyId).unwrap();
          message.success(t('ITEM SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING ITEM'));
        }
      },
    });
  };

  const handleSubmit = async (company: IProjectType) => {
    try {
      if (editingCompany) {
        await updateProjectType(company).unwrap();
        message.success(t('TEXT TYPE SUCCESSFULLY UPDATED'));
      } else {
        await addProjectType(company).unwrap();
        message.success(t('TEXT TYPE SUCCESSFULLY ADDED'));
      }
      setEditingCompany(null);
    } catch (error) {
      message.error(t('ERROR SAVING TEXT TYPE'));
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
        <Col>
          <PermissionGuard requiredPermissions={[Permission.WP_ACTIONS]}>
            <Button
              size="small"
              icon={<PlusSquareOutlined />}
              onClick={handleCreate}
            >
              {t('ADD ITEM')}
            </Button>
          </PermissionGuard>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingCompany && (
            <PermissionGuard requiredPermissions={[Permission.WP_ACTIONS]}>
              <Button
                size="small"
                icon={<MinusSquareOutlined />}
                onClick={() => handleDelete(editingCompany.id)}
              >
                {t('DELETE ITEM')}
              </Button>
            </PermissionGuard>
          )}
        </Col>
      </Space>

      <div className="  flex gap-4 justify-between">
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div className=" h-[78vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 ">
            <OrderTextTree
              onCompanySelect={handleEdit}
              companies={companies || []}
            />
          </div>
          <div className="h-[75vh] bg-white px-4 py-3  rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            <OrderTextForm
              project={editingCompany || undefined}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default OrderTextPanel;
