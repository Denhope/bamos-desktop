import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import { IRequirementCode } from '@/models/AC';

import {
  useGetREQCodesQuery,
  useUpdateREQCodeMutation,
  useDeleteREQCodeMutation,
  useAddREQCodeMutation,
} from '@/features/requirementsCodeAdministration/requirementsCodesApi';
import ReqCodesAdministrationForm from './ReqCodesAdministrationForm';
import ReqCodesAdministrationTree from './ReqCodesAdministrationTree';

interface AdminPanelRProps {
  reqTypeID: string;
}

const ReqCodesAdmin: React.FC<AdminPanelRProps> = ({ reqTypeID }) => {
  const [editingReqCode, setEditingReqCode] = useState<IRequirementCode | null>(
    null
  );
  let reqCodes = null;
  let isLoading = false;

  if (reqTypeID) {
    const { data, isLoading: loading } = useGetREQCodesQuery({
      reqTypeID,
    });
    reqCodes = data;
    isLoading = loading;
  }
  const [addReqCode] = useAddREQCodeMutation({});
  const [updateReqCode] = useUpdateREQCodeMutation();
  const [deleteReqCode] = useDeleteREQCodeMutation();

  const handleCreate = () => {
    setEditingReqCode(null);
  };

  const handleEdit = (reqCode: IRequirementCode) => {
    setEditingReqCode(reqCode);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS REQUIREMENT CODE?'),
      onOk: async () => {
        try {
          await deleteReqCode(id).unwrap();
          message.success(t('REQUIREMENT CODE SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING REQUIREMENT CODE'));
        }
      },
    });
  };

  const handleSubmit = async (reqCode: any) => {
    try {
      if (editingReqCode) {
        await updateReqCode(reqCode).unwrap();
        message.success(t('REQUIREMENT CODE SUCCESSFULLY UPDATED'));
        setEditingReqCode(null);
      } else {
        await addReqCode({ reqCode, reqTypesID: reqTypeID }).unwrap();
        message.success(t('REQUIREMENT CODE SUCCESSFULLY ADDED'));
        setEditingReqCode(null);
      }
    } catch (error) {
      message.error(t('ERROR SAVING REQUIREMENT CODE'));
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
      <Space className="gap-6 pb-3">
        <Col span={20}>
          <Button
            size="small"
            icon={<UserAddOutlined />}
            onClick={handleCreate}
          >
            {t('ADD REQUIREMENT CODE')}
          </Button>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingReqCode && (
            <Button
              size="small"
              icon={<UserDeleteOutlined />}
              onClick={() => handleDelete(editingReqCode.id)}
            >
              {t('DELETE REQUIREMENT CODE')}
            </Button>
          )}
        </Col>
      </Space>

      <Row justify={'space-between'} className="gap-4">
        <Col
          sm={12}
          className="h-[78vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 "
        >
          <ReqCodesAdministrationTree
            reqCodes={reqCodes || []}
            onReqCodeselect={handleEdit}
          />
        </Col>
        <Col
          className="h-[75vh] bg-white px-4 py-3 rounded-md brequierement-gray-400 p-3 "
          sm={11}
        >
          <ReqCodesAdministrationForm
            reqCode={editingReqCode || undefined}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        </Col>
      </Row>
    </>
  );
};

export default ReqCodesAdmin;
