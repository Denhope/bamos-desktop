import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import ProjectTypeForm from './ProjectTypeForm';
import { IProjectType } from '@/models/AC';
import {
  useAddProjectTypeMutation,
  useDeleteProjectTypeMutation,
  useGetProjectTypesQuery,
  useUpdateProjectTypeMutation,
} from '@/features/projectTypeAdministration/projectTypeApi';
import ProjectTypeTree from './ProjectTypeTree';
import { Split } from '@geoffcox/react-splitter';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';

interface AdminPanelProps {}

const ProjectTypePanel: React.FC<AdminPanelProps> = () => {
  const [editingCompany, setEditingCompany] = useState<IProjectType | null>(
    null
  );

  const { data: companies, isLoading } = useGetProjectTypesQuery({});

  const [addProjectType] = useAddProjectTypeMutation();
  const [updateProjectType] = useUpdateProjectTypeMutation();
  const [deleteProjectType] = useDeleteProjectTypeMutation();

  const handleCreate = () => {
    setEditingCompany(null);
  };

  const handleEdit = (company: IProjectType) => {
    setEditingCompany(company);
  };

  const handleDelete = async (companyId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS COMPANY?'),
      onOk: async () => {
        try {
          await deleteProjectType(companyId).unwrap();
          message.success(t('COMPANY SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING USER GROUP'));
        }
      },
    });
  };

  const handleSubmit = async (company: IProjectType) => {
    try {
      if (editingCompany) {
        await updateProjectType(company).unwrap();
        message.success(t('PROJECT YTPE SUCCESSFULLY UPDATED'));
      } else {
        await addProjectType(company).unwrap();
        message.success(t('PROJECT TYPE SUCCESSFULLY ADDED'));
      }
      setEditingCompany(null);
    } catch (error) {
      message.error(t('ERROR SAVING PROJECT TYPE'));
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
              {t('ADD PROJECT TYPE')}
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
                {t('DELETE PROJECT TYPE')}
              </Button>
            </PermissionGuard>
          )}
        </Col>
      </Space>

      <div className="  flex gap-4 justify-between">
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div className=" h-[78vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 ">
            <ProjectTypeTree
              onCompanySelect={handleEdit}
              companies={companies || []}
            />
          </div>
          <div className="h-[75vh] bg-white px-4 py-3  rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            <ProjectTypeForm
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

export default ProjectTypePanel;
