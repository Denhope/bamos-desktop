import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import RequirementForm from './RequirementForm';

import {
  useAddCompanyMutation,
  useDeleteCompanyMutation,
  useUpdateCompanyMutation,
  useGetCompaniesQuery,
} from '@/features/companyAdministration/companyApi';
import RequirementTree from './RequirementTree';
import {
  useGetRequirementsQuery,
  useGetFilteredRequirementsQuery,
} from '@/features/requirementAdministration/requirementApi';
import { Requirement } from '@/models/IRequirement';
import RequirementsDiscription from './RequirementsDiscription';

interface AdminPanelProps {
  requirementsSearchValues?: any;
}

const RequirementPanel: React.FC<AdminPanelProps> = ({
  requirementsSearchValues,
}) => {
  const [editingRequirement, setEditingRequirement] =
    useState<Requirement | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const { data: requirements, isLoading } = useGetFilteredRequirementsQuery({
    projectID: requirementsSearchValues?.projectID
      ? requirementsSearchValues?.projectID
      : '',
    startDate: requirementsSearchValues?.startDate,
    status: requirementsSearchValues?.status || 'open',
  });

  const [addCompany] = useAddCompanyMutation();
  const [updateCompany] = useUpdateCompanyMutation();
  const [deleteGCompany] = useDeleteCompanyMutation();

  const handleCreate = () => {
    setEditingRequirement(null);
    setIsCreating(true);
  };

  const handleEdit = (requierement: Requirement) => {
    setEditingRequirement(requierement);
  };

  const handleDelete = async (companyId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS REQUIREMENT?'),
      onOk: async () => {
        try {
          await deleteGCompany(companyId).unwrap();
          message.success(t('REQUIREMENT SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING REQUIREMENT'));
        }
      },
    });
  };

  const handleSubmit = async (requirement: Requirement) => {
    try {
      if (editingRequirement) {
        // await updateCompany(requirement).unwrap();
        message.success(t('REQUIREMENT SUCCESSFULLY UPDATED'));
      } else {
        // await addCompany(requirement).unwrap();
        message.success(t('REQUIREMENT SUCCESSFULLY ADDED'));
      }
      setEditingRequirement(null);
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
      <Space>
        <Col
          className=" bg-white px-4 py-3 w-[158vh]  rounded-md brequierement-gray-400 "
          sm={24}
        >
          <RequirementsDiscription
            // onRequirementSearch={setRequirement}
            requirement={editingRequirement}
          ></RequirementsDiscription>
        </Col>
      </Space>
      <Space className="">
        <Col>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD REQUIREMENT')}
          </Button>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingRequirement && (
            <Button
              size="small"
              icon={<MinusSquareOutlined />}
              // onClick={() => handleDelete(editingRequirement.id)}
            >
              {t('DELETE REQUIREMENT')}
            </Button>
          )}
        </Col>
      </Space>

      <div className="  flex gap-4 justify-between">
        <div
          // sm={4}
          className="w-3/12 h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3 "
        >
          <RequirementTree
            onCompanySelect={handleEdit}
            requirements={requirements || []}
          />
        </div>
        <div
          className="w-9/12  h-[75vh] bg-white px-4 rounded-md brequierement-gray-400 p-3  "
          // sm={19}
        >
          <RequirementForm
            requierement={editingRequirement || undefined}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            isCreatingV={isCreating}
          />
        </div>
      </div>
    </>
  );
};

export default RequirementPanel;
