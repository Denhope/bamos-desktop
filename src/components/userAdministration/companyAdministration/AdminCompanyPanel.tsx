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
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD COMPANY')}
          </Button>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingCompany && (
            <Button
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingCompany.id)}
            >
              {t('DELETE COMPANY')}
            </Button>
          )}
        </Col>
      </Space>

      <Row className="gap-6">
        <Col
          sm={5}
          className="h-[78vh] bg-white  rounded-md border-gray-400 p-3 "
        >
          <CompanyTree
            onCompanySelect={handleEdit}
            companies={companies || []}
          />
        </Col>
        <Col
          className="h-[75vh] bg-white  py-3 rounded-md brequierement-gray-400 p-3 "
          sm={18}
        >
          <CompanyForm
            company={editingCompany || undefined}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        </Col>
      </Row>
    </>
  );
};

export default AdminCompanyPanel;
