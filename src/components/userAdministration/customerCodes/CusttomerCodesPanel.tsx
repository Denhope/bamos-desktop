//@ts-nocheck

import React, { useState } from 'react';
import {
  Button,
  Row,
  Col,
  Modal,
  message,
  Space,
  Spin,
  notification,
} from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import { IRequirementType } from '@/models/AC';

import RequirementsTypesTree from './CustomerCodesTypesTree';

import {
  useAddREQTypeMutation,
  useDeleteREQTypeMutation,
  useGetREQTypesQuery,
  useUpdateREQTypeMutation,
} from '@/features/requirementsTypeAdministration/requirementsTypeApi';
import RequirementsTypesForm from './CustomerCodesForm';
import { Split } from '@geoffcox/react-splitter';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import CertificatesTypesTree from './CustomerCodesTypesTree';
import {
  useAddCERTTypeMutation,
  useDeleteCERTTypeMutation,
  useGetCERTSTypeQuery,
  useUpdateCERTTypeMutation,
} from '@/features/requirementsTypeAdministration/certificatesTypeApi';
import {
  useAddCustomerCodeMutation,
  useDeleteCustomerCodeMutation,
  useGetCustomerCodeQuery,
  useGetCustomerCodesQuery,
  useUpdateCustomerCodeMutation,
} from '@/features/customerCodeAdministration/customerCodeApi';
import CustomerCodesTypesTree from './CustomerCodesTypesTree';
import CustomerCodesForm from './CustomerCodesForm';

interface AdminPanelProps {
  values?: any;
}

const CustomerCodesPanel: React.FC<AdminPanelProps> = ({ values }) => {
  const [editingACType, setEditingACType] = useState<IRequirementType | null>(
    null
  );
  // const { acTypes } = useTypedSelector((state) => state.acTypes);

  const { data: customerCodes, isLoading } = useGetCustomerCodesQuery({});

  const [addCustomerCode] = useAddCustomerCodeMutation();
  const [updateCustomerCode] = useUpdateCustomerCodeMutation();
  const [deleteCustomerCode] = useDeleteCustomerCodeMutation();

  const handleCreate = () => {
    setEditingACType(null);
  };

  const handleEdit = (acType: IRequirementType) => {
    setEditingACType(acType);
  };

  const handleDelete = async (acTypeId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS CUSTOMER CODE TYPE ?'),
      onOk: async () => {
        try {
          await deleteCustomerCode(acTypeId).unwrap();
          notification.success({
            message: t('SUCCESS'),
            description: t('CUSTOMER CODE TYPE SUCCESSFULLY DELETED'),
          });
        } catch (error) {
          notification.error({
            message: t('ERROR'),
            description: t('CUSTOMER CODE TYPE ERROR'),
          });
        }
      },
    });
  };

  const handleSubmit = async (acType: IRequirementType) => {
    try {
      if (editingACType) {
        await updateCustomerCode(acType).unwrap();
        notification.success({
          message: t('SUCCESS'),
          description: t('CUSTOMER CODE TYPE SUCCESSFULLY UPDATED'),
        });
      } else {
        await addCustomerCode(acType).unwrap();
        notification.success({
          message: t('SUCCESS'),
          description: t('CUSTOMER CODE TYPE SUCCESSFULLY ADDED'),
        });
      }
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('CUSTOMER CODE TYPE ERROR'),
      });
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
          <PermissionGuard
            requiredPermissions={[Permission.REQUIREMENT_ACTIONS]}
          >
            <Button
              size="small"
              icon={<PlusSquareOutlined />}
              onClick={handleCreate}
            >
              {t('ADD CUSTOMER CODE TYPE')}
            </Button>
          </PermissionGuard>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingACType && (
            <PermissionGuard
              requiredPermissions={[Permission.REQUIREMENT_ACTIONS]}
            >
              <Button
                size="small"
                icon={<MinusSquareOutlined />}
                onClick={() => handleDelete(editingACType.id)}
              >
                {t('DELETE CUSTOMER CODE TYPE')}
              </Button>
            </PermissionGuard>
          )}
        </Col>
      </Space>

      <div className="  flex gap-4 justify-between">
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div
            // sm={4}
            className=" h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3 "
          >
            <CustomerCodesTypesTree
              onreqTypeselect={handleEdit}
              customerCodes={customerCodes || []}
            />
          </div>
          <div
            className="  h-[75vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto "
            // sm={19}
          >
            <CustomerCodesForm
              onSubmit={handleSubmit}
              onDelete={handleDelete}
              reqType={editingACType || undefined}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default CustomerCodesPanel;
