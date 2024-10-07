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
import { Split } from '@geoffcox/react-splitter';
import {
  useAddAccessCodeMutation,
  useDeleteAccessCodeMutation,
  useUpdateAccessCodeMutation,
} from '@/features/accessAdministration/accessApi';

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
  const {
    data,
    isLoading: loading,
    refetch,
  } = useGetZonesByGroupQuery({
    acTypeId,
  });
  zoneCodesGroup = data;
  isLoading = loading;
  // }
  const [addZoneCode] = useAddZoneCodeMutation({});
  const [addAccessCode] = useAddAccessCodeMutation({});
  const [updateAccessCode] = useUpdateAccessCodeMutation({});
  const [updateZoneCode] = useUpdateZoneCodeMutation();
  const [deleteZoneCode] = useDeleteZoneCodeMutation();
  const [deleteAccessCode] = useDeleteAccessCodeMutation();

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
          setEditingZoneCode(null);
        } catch (error) {
          message.error(t('ERROR DELETING ZONE CODE'));
        }
      },
    });
  };
  const handleDeleteAccess = async (zoneCodeId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS ACCESS CODE?'),
      onOk: async () => {
        try {
          await deleteAccessCode(zoneCodeId).unwrap();
          message.success(t('ACCESS CODE SUCCESSFULLY DELETED'));
          refetch();
          setEditingZoneCode(null);
        } catch (error) {
          message.error(t('ERROR DELETING ACCESS CODE'));
        }
      },
    });
  };

  const handleSubmit = async (zoneCode: any) => {
    try {
      if (editingZoneCode) {
        if (zoneCode.areaCodeID) {
          await updateAccessCode(zoneCode).unwrap();
          message.success(t('ACCESS SUCCESSFULLY UPDATED'));
          refetch();
          setEditingZoneCode(null);
        } else {
          await updateZoneCode(zoneCode).unwrap();
          message.success(t('ZONE SUCCESSFULLY UPDATED'));
          setEditingZoneCode(null);
        }
      } else {
        if (zoneCode.areaCodeID) {
          await addAccessCode({ accessCode: zoneCode, acTypeId }).unwrap();
          message.success(t('ACCESS SUCCESSFULLY ADDED'));
          refetch();
          setEditingZoneCode(null);
        } else {
          await addZoneCode({ zoneCode, acTypeId }).unwrap();
          message.success(t(' ZONE SUCCESSFULLY ADDED'));
          setEditingZoneCode(null);
        }
      }
    } catch (error) {
      message.error(t('ERROR SAVING  ZONE/ACCESS'));
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
            {t('ADD ZONE/ACCESS CODE')}
          </Button>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingZoneCode && (
            <Button
              size="small"
              icon={<UserDeleteOutlined />}
              onClick={() => {
                if (editingZoneCode.areaCodeID) {
                  handleDeleteAccess(
                    editingZoneCode.id || editingZoneCode._id || ''
                  );
                } else handleDelete(editingZoneCode.id);
              }}
            >
              {t('DELETE ZONE/ACCESS CODE')}
            </Button>
          )}
        </Col>
      </Space>

      <div className="py-4 flex gap-4 justify-between bg-gray-100 rounded-lg">
        <Split initialPrimarySize="25%" splitterSize="20px">
          <div className="h-[62vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 ">
            <ZoneCodeTree
              zoneCodesGroup={zoneCodesGroup || []}
              onZoneCodeSelect={handleEdit}
            />
          </div>
          <div className="h-[62vh] bg-white px-4 py-3 rounded-md brequierement-gray-400 p-3  overflow-y-auto ">
            <ZoneCodeForm
              zoneCode={editingZoneCode || undefined}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
              zoneCodes={zoneCodesGroup || []}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default ZoneCodeFormPanel;
