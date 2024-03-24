import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import RequirementForm from './RequirementForm';

import RequirementTree from './RequirementTree';
import {
  useGetFilteredRequirementsQuery,
  useDeleteRequirementMutation,
  useUpdateRequirementMutation,
  useAddRequirementMutation,
} from '@/features/requirementAdministration/requirementApi';
import { IRequirement } from '@/models/IRequirement';
import RequirementsDiscription from './RequirementsDiscription';

interface AdminPanelProps {
  requirementsSearchValues?: any;
}

const RequirementPanel: React.FC<AdminPanelProps> = ({
  requirementsSearchValues,
}) => {
  const [editingRequirement, setEditingRequirement] =
    useState<IRequirement | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const { data: requirements, isLoading } = useGetFilteredRequirementsQuery({
    projectID: requirementsSearchValues?.projectID
      ? requirementsSearchValues?.projectID
      : '',
    projectTaskID: requirementsSearchValues?.projectTaskID
      ? requirementsSearchValues?.projectTaskID
      : '',
    partNumberID: requirementsSearchValues?.partNumberID
      ? requirementsSearchValues?.partNumberID
      : '',
    reqTypesID: requirementsSearchValues?.reqTypesID
      ? requirementsSearchValues?.reqTypesID
      : '',
    reqCodesID: requirementsSearchValues?.reqCodesID
      ? requirementsSearchValues?.reqCodesID
      : '',

    startDate: requirementsSearchValues?.startDate
      ? requirementsSearchValues?.startDate
      : '',

    endDate: requirementsSearchValues?.endDate
      ? requirementsSearchValues?.endDate
      : '',

    status: requirementsSearchValues?.status || 'open',
    partRequestNumberNew: requirementsSearchValues?.partRequestNumber,

    neededOnID: requirementsSearchValues?.neededOnID
      ? requirementsSearchValues?.neededOnID
      : '',
  });

  const [addRequirement] = useAddRequirementMutation();
  const [updateRequirement] = useUpdateRequirementMutation();
  const [deleteRequirement] = useDeleteRequirementMutation();

  const handleCreate = () => {
    setEditingRequirement(null);
    setIsCreating(true);
  };

  const handleEdit = (requierement: IRequirement) => {
    setEditingRequirement(requierement);
  };

  const handleDelete = async (companyId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS REQUIREMENT?'),
      onOk: async () => {
        try {
          await deleteRequirement(companyId).unwrap();
          message.success(t('REQUIREMENT SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING REQUIREMENT'));
        }
      },
    });
  };

  const handleSubmit = async (requirement: IRequirement) => {
    try {
      if (editingRequirement) {
        await updateRequirement(requirement).unwrap();
        message.success(t('REQUIREMENT SUCCESSFULLY UPDATED'));
      } else {
        await addRequirement({ requirement }).unwrap();
        message.success(t('REQUIREMENT SUCCESSFULLY ADDED'));
      }
      setEditingRequirement(null);
    } catch (error) {
      message.error(t('ERROR SAVING REQUIREMENT'));
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
              onClick={() => handleDelete(editingRequirement._id)}
            >
              {t('DELETE REQUIREMENT')}
            </Button>
          )}
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingRequirement && (
            <Button
              disabled
              size="small"
              icon={<MinusSquareOutlined />}
              // onClick={() => handleDelete(editingRequirement.id)}
            >
              {t('COPY REQUIREMENT')}
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
          />
        </div>
      </div>
    </>
  );
};

export default RequirementPanel;
