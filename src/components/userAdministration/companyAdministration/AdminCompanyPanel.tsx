import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { ICompany } from '@/models/IUser';
import { useTranslation } from 'react-i18next';

import CompanyForm from './CompanyForm';
import CompanyTree from './CompanyTree';
import {
  useAddCompanyMutation,
  useDeleteCompanyMutation,
  useUpdateCompanyMutation,
  useGetCompaniesQuery,
} from '@/features/companyAdministration/companyApi';
import { Split } from '@geoffcox/react-splitter';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';

interface AdminPanelProps {}

const AdminCompanyPanel: React.FC<AdminPanelProps> = () => {
  const [editingCompany, setEditingCompany] = useState<ICompany | null>(null);

  const { data: companies, isLoading } = useGetCompaniesQuery({});

  const [addCompany] = useAddCompanyMutation();
  const [updateCompany] = useUpdateCompanyMutation();
  const [deleteGCompany] = useDeleteCompanyMutation();

  const handleCreate = () => {
    setEditingCompany(null);
  };

  const handleEdit = (company: ICompany) => {
    setEditingCompany(company);
  };

  const handleDelete = async (companyId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS COMPANY?'),
      onOk: async () => {
        try {
          await deleteGCompany(companyId).unwrap();
          message.success(t('COMPANY SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING USER GROUP'));
        }
      },
    });
  };

  const handleSubmit = async (company: ICompany) => {
    try {
      if (editingCompany) {
        await updateCompany(company).unwrap();
        message.success(t('COMPANY SUCCESSFULLY UPDATED'));
      } else {
        await addCompany(company).unwrap();
        message.success(t('COMPANY SUCCESSFULLY ADDED'));
      }
      setEditingCompany(null);
    } catch (error) {
      message.error(t('ERROR SAVING COMPANY GROUP'));
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
          <PermissionGuard requiredPermissions={[Permission.COMPANY_ACTIONS]}>
            <Button
              size="small"
              icon={<PlusSquareOutlined />}
              onClick={handleCreate}
            >
              {t('ADD COMPANY')}
            </Button>
          </PermissionGuard>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingCompany && (
            <PermissionGuard requiredPermissions={[Permission.COMPANY_ACTIONS]}>
              <Button
                size="small"
                icon={<MinusSquareOutlined />}
                onClick={() => handleDelete(editingCompany.id)}
              >
                {t('DELETE COMPANY')}
              </Button>
            </PermissionGuard>
          )}
        </Col>
      </Space>

      <div className="  flex gap-4 justify-between">
        <Split initialPrimarySize="25%" splitterSize="20px">
          <div className=" h-[78vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 ">
            <CompanyTree
              onCompanySelect={handleEdit}
              companies={companies || []}
            />
          </div>
          <div className="h-[75vh] bg-white px-4 py-3  rounded-md brequierement-gray-400 p-3 overflow-y-auto  ">
            <CompanyForm
              company={editingCompany || undefined}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default AdminCompanyPanel;
