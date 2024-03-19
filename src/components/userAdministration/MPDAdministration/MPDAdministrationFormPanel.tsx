import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import { IMPD } from '@/models/ITask';

import mpdCodeForm from './MPDAdministrationForm';
import MPDAdministrationTree from './MPDAdministrationTree';
import MPDAdministrationForm from './MPDAdministrationForm';
import {
  useAddMPDCodeMutation,
  useGetMPDCodesQuery,
  useUpdateMPDCodeMutation,
  useDeleteMPDCodeMutation,
} from '@/features/MPDAdministration/mpdCodesApi';

interface AdminPanelProps {
  acTypeID: string;
}

const MPDAdministrationFormPanel: React.FC<AdminPanelProps> = ({
  acTypeID,
}) => {
  const [editingmpdCode, setEditingmpdCode] = useState<IMPD | null>(null);
  let mpdCodes = null;
  let isLoading = false;

  if (acTypeID) {
    const { data, isLoading: loading } = useGetMPDCodesQuery({
      acTypeID,
    });
    mpdCodes = data;
    isLoading = loading;
  }
  const [addmpdCode] = useAddMPDCodeMutation({});
  const [updatempdCode] = useUpdateMPDCodeMutation();
  const [deletempdCode] = useDeleteMPDCodeMutation();

  const handleCreate = () => {
    setEditingmpdCode(null);
  };

  const handleEdit = (mpdCode: IMPD) => {
    setEditingmpdCode(mpdCode);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS MPD?'),
      onOk: async () => {
        try {
          await deletempdCode(id).unwrap();
          message.success(t('MPD SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING MPD'));
        }
      },
    });
  };

  const handleSubmit = async (mpdCode: any) => {
    try {
      if (editingmpdCode) {
        await updatempdCode(mpdCode).unwrap();
        message.success(t('MPD SUCCESSFULLY UPDATED'));
        setEditingmpdCode(null);
      } else {
        await addmpdCode({ mpdCode, acTypeId: acTypeID }).unwrap();
        message.success(t('MPD SUCCESSFULLY ADDED'));
        setEditingmpdCode(null);
      }
    } catch (error) {
      message.error(t('ERROR SAVING MPD'));
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
            {t('ADD MPD')}
          </Button>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingmpdCode && (
            <Button
              size="small"
              icon={<UserDeleteOutlined />}
              onClick={() => handleDelete(editingmpdCode.id)}
            >
              {t('DELETE MPD')}
            </Button>
          )}
        </Col>
      </Space>

      <Row justify={'space-between'} className="gap-6">
        <Col
          sm={12}
          className="h-[78vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 "
        >
          <MPDAdministrationTree
            MPDCodes={mpdCodes || []}
            onMPDCodeSelect={handleEdit}
          />
        </Col>
        <Col
          className="h-[75vh] bg-white px-4 py-3 rounded-md brequierement-gray-400 p-3 "
          sm={11}
        >
          <MPDAdministrationForm
            taskCode={editingmpdCode || undefined}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        </Col>
      </Row>
    </>
  );
};

export default MPDAdministrationFormPanel;
