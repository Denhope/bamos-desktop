import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import { IZoneCode } from '@/models/ITask';

import {
  useAddZoneCodeMutation,
  useDeleteZoneCodeMutation,
  useGetZonesByGroupQuery,
  useUpdateZoneCodeMutation,
} from '@/features/zoneAdministration/zonesApi';
import ZoneCodeForm from './zoneCodeForm';
import ZoneCodeTree from './zoneCodeTree';
// import ZoneCodeForm from './ZoneCodeForm';
// import ZoneCodeTree from './ZoneCodeTree';

interface AdminPanelProps {
  acTypeId: string;
}

const ZoneCodeFormPanel: React.FC<AdminPanelProps> = ({ acTypeId }) => {
  const [editingZoneCode, setEditingZoneCode] = useState<IZoneCode | null>(
    null
  );
  let zoneCodesGroup = null;
  let isLoading = false;

  // if (acTypeId) {
  const { data, isLoading: loading } = useGetZonesByGroupQuery({
    acTypeId,
  });
  zoneCodesGroup = data;
  isLoading = loading;
  // }
  const [addZoneCode] = useAddZoneCodeMutation({});
  const [updateZoneCode] = useUpdateZoneCodeMutation();
  const [deleteZoneCode] = useDeleteZoneCodeMutation();

  const handleCreate = () => {
    setEditingZoneCode(null);
  };

  const handleEdit = (zoneCode: IZoneCode) => {
    setEditingZoneCode(zoneCode);
  };

  const handleDelete = async (zoneCodeId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS ZONE CODE?'),
      onOk: async () => {
        try {
          await deleteZoneCode(zoneCodeId).unwrap();
          message.success(t('ZONE CODE SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING ZONE CODE'));
        }
      },
    });
  };

  const handleSubmit = async (zoneCode: IZoneCode) => {
    try {
      if (editingZoneCode) {
        await updateZoneCode(zoneCode).unwrap();
        message.success(t('TASK ZONE SUCCESSFULLY UPDATED'));
        setEditingZoneCode(null);
      } else {
        await addZoneCode({ zoneCode, acTypeId }).unwrap();
        message.success(t('TASK ZONE SUCCESSFULLY ADDED'));
        setEditingZoneCode(null);
      }
    } catch (error) {
      message.error(t('ERROR SAVING TASK ZONE'));
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
            {t('ADD ZONE CODE')}
          </Button>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingZoneCode && (
            <Button
              size="small"
              icon={<UserDeleteOutlined />}
              onClick={() => handleDelete(editingZoneCode.id)}
            >
              {t('DELETE ZONE CODE')}
            </Button>
          )}
        </Col>
      </Space>

      <Row justify={'space-between'} className="gap-6">
        <Col
          sm={12}
          className="h-[78vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 "
        >
          <ZoneCodeTree
            zoneCodesGroup={zoneCodesGroup || []}
            onZoneCodeSelect={handleEdit}
          />
        </Col>
        <Col
          className="h-[75vh] bg-white px-4 py-3 rounded-md brequierement-gray-400 p-3 "
          sm={11}
        >
          <ZoneCodeForm
            zoneCode={editingZoneCode || undefined}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            zoneCodes={zoneCodesGroup || []}
          />
        </Col>
      </Row>
    </>
  );
};

export default ZoneCodeFormPanel;
