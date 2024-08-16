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

import RequirementsTypesTree from './CertificatesTypesTree';

import {
  useAddREQTypeMutation,
  useDeleteREQTypeMutation,
  useGetREQTypesQuery,
  useUpdateREQTypeMutation,
} from '@/features/requirementsTypeAdministration/requirementsTypeApi';
import RequirementsTypesForm from './CertificatesForm';
import { Split } from '@geoffcox/react-splitter';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import CertificatesTypesTree from './CertificatesTypesTree';
import {
  useAddCERTTypeMutation,
  useDeleteCERTTypeMutation,
  useGetCERTSTypeQuery,
  useUpdateCERTTypeMutation,
} from '@/features/requirementsTypeAdministration/certificatesTypeApi';

interface AdminPanelProps {
  values?: any;
}

const CertificatesTypesPanel: React.FC<AdminPanelProps> = ({ values }) => {
  const [editingACType, setEditingACType] = useState<IRequirementType | null>(
    null
  );
  // const { acTypes } = useTypedSelector((state) => state.acTypes);

  const { data: reqTypes, isLoading } = useGetCERTSTypeQuery({});

  const [addREQType] = useAddCERTTypeMutation();
  const [updateREQType] = useUpdateCERTTypeMutation();
  const [deleteREQType] = useDeleteCERTTypeMutation();

  const handleCreate = () => {
    setEditingACType(null);
  };

  const handleEdit = (acType: IRequirementType) => {
    setEditingACType(acType);
  };

  const handleDelete = async (acTypeId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS ?'),
      onOk: async () => {
        try {
          await deleteREQType(acTypeId).unwrap();
          notification.success({
            message: t('SUCCESS'),
            description: t('CERTIFICATE TYPE SUCCESSFULLY DELETED'),
          });
        } catch (error) {
          notification.error({
            message: t('ERROR'),
            description: t('CERTIFICATE TYPE ERROR'),
          });
        }
      },
    });
  };

  const handleSubmit = async (acType: IRequirementType) => {
    try {
      if (editingACType) {
        await updateREQType(acType).unwrap();
        notification.success({
          message: t('SUCCESS'),
          description: t('CERTIFICATE TYPE SUCCESSFULLY UPDATED'),
        });
      } else {
        await addREQType(acType).unwrap();
        notification.success({
          message: t('SUCCESS'),
          description: t('CERTIFICATE TYPE SUCCESSFULLY ADDED'),
        });
      }
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('CERTIFICATE TYPE ERROR'),
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
              {t('ADD CERTIFICATE TYPE')}
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
                {t('DELETE CERTIFICATE TYPE')}
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
            <CertificatesTypesTree
              onreqTypeselect={handleEdit}
              reqTypes={reqTypes || []}
            />
          </div>
          <div
            className="  h-[75vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto "
            // sm={19}
          >
            <RequirementsTypesForm
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

export default CertificatesTypesPanel;
