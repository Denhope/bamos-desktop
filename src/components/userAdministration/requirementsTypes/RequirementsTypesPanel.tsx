import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import { IRequirementType } from '@/models/AC';

import RequirementsTypesTree from './RequirementsTypesTree';

import {
  useAddREQTypeMutation,
  useDeleteREQTypeMutation,
  useGetREQTypesQuery,
  useUpdateREQTypeMutation,
} from '@/features/requirementsTypeAdministration/requirementsTypeApi';
import RequirementsTypesForm from './RequirementsTypesForm';
import { Split } from '@geoffcox/react-splitter';

interface AdminPanelProps {
  values?: any;
}

const RequirementsTypesPanel: React.FC<AdminPanelProps> = ({ values }) => {
  const [editingACType, setEditingACType] = useState<IRequirementType | null>(
    null
  );
  // const { acTypes } = useTypedSelector((state) => state.acTypes);

  const { data: reqTypes, isLoading } = useGetREQTypesQuery({});

  const [addREQType] = useAddREQTypeMutation();
  const [updateREQType] = useUpdateREQTypeMutation();
  const [deleteREQType] = useDeleteREQTypeMutation();

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
          message.success(t('REQUIREMENT TYPE SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING REQUIREMENT TYPE'));
        }
      },
    });
  };

  const handleSubmit = async (acType: IRequirementType) => {
    try {
      if (editingACType) {
        await updateREQType(acType).unwrap();
        message.success(t('REQUIREMENT TYPE SUCCESSFULLY UPDATED'));
      } else {
        await addREQType(acType).unwrap();
        message.success(t('REQUIREMENT TYPE SUCCESSFULLY ADDED'));
      }
    } catch (error) {
      message.error(t('ERROR SAVING REQUIREMENT TYPE'));
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
            {t('ADD REQUIREMENT TYPE')}
          </Button>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingACType && (
            <Button
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingACType.id)}
            >
              {t('DELETE REQUIREMENT TYPE')}
            </Button>
          )}
        </Col>
      </Space>

      <div className="  flex gap-4 justify-between">
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div
            // sm={4}
            className=" h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3 "
          >
            <RequirementsTypesTree
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

export default RequirementsTypesPanel;
