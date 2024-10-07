import FileUploader from '@/components/shared/Upload';
import { Space, Col, Button, Switch, Modal, message, notification } from 'antd';
import { t } from 'i18next';
import React, { FC, useEffect, useState } from 'react';
import {
  PlusSquareOutlined,
  MinusSquareOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { IAltPartNumber, IPartNumber } from '@/models/IUser';
import { useAddMultiPartNumberMutation } from '@/features/partAdministration/partApi';
import AltForm from './AltForm';
import {
  useAddPartNumberMutation,
  useDeletePartNumberMutation,
  useUpdatePartNumberMutation,
} from '@/features/partAdministration/altPartApi';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
type AlternatesCurrentPart = {
  onEditPart?: (part?: IAltPartNumber) => void;
  currentAltPart?: IAltPartNumber | null;
  currentPart: IPartNumber | null;
};
const AltFormPanel: FC<AlternatesCurrentPart> = ({
  currentAltPart,
  currentPart,
}) => {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [editingAltPart, setEditingAltPart] = useState<IAltPartNumber | null>(
    null
  );
  const [addPartNumber] = useAddPartNumberMutation({});
  const [updatePartNumber] = useUpdatePartNumberMutation();
  const [deletePartNumber] = useDeletePartNumberMutation();
  useEffect(() => {
    currentAltPart && setEditingAltPart(currentAltPart);
  }, [currentAltPart, currentPart]);
  const handleDelete = async (partID: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS PART NUMBER?'),
      onOk: async () => {
        try {
          await deletePartNumber(partID).unwrap();
          setSelectedKeys([]);
          setEditingAltPart(null);
          notification.success({
            message: t('ALT PART SUCCESSFULLY DELETED'),
            description: t(
              'The alternative part has been successfully delete.'
            ),
          });
        } catch (error) {
          notification.error({
            message: t('FAILED TO DELETE ALTERNATIVE'),
            description: 'There was an error delete the alternative.',
          });
        }
      },
    });
  };
  const handleSubmit = async (part: any) => {
    try {
      if (editingAltPart) {
        await updatePartNumber(part).unwrap();
        notification.success({
          message: t('ALT PART SUCCESSFULLY UPDATED'),
          description: t('The alternative part has been successfully updated.'),
        });
      } else {
        console.log(part);
        await addPartNumber({
          partNumber: part,
        }).unwrap();
        notification.success({
          message: t('ALT PART SUCCESSFULLY ADDED'),
          description: t('The alternative part has been successfully added.'),
        });
        setEditingAltPart(null);
      }
    } catch (error) {
      notification.error({
        message: t('FAILED TO ADD ALTERNATIVE'),
        description: 'There was an error adding the alternative.',
      });
    }
  };
  const handleCreate = () => {
    setEditingAltPart(null);
    setSelectedKeys([]);
  };

  return (
    <div className="flex flex-col gap-5 overflow-hidden">
      <Space className="">
        <Col>
          <PermissionGuard
            requiredPermissions={[
              Permission.PART_NUMBER_EDIT,
              Permission.ADD_ALTERNATIVE,
            ]}
          >
            <Button
              size="small"
              icon={<PlusSquareOutlined />}
              onClick={handleCreate}
            >
              {t('ADD ALTERNATIVE PART No')}
            </Button>
          </PermissionGuard>
        </Col>

        <Col style={{ textAlign: 'right' }}>
          <PermissionGuard
            requiredPermissions={[
              Permission.PART_NUMBER_EDIT,
              Permission.DELETE_ALTERNATIVE,
            ]}
          >
            <Button
              danger
              disabled={!currentAltPart}
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(String(currentAltPart?._id))}
            >
              {t('DELETE  ALTERNATIVE PART No')}
            </Button>
          </PermissionGuard>
        </Col>
      </Space>
      <div className="h-[62vh] px-4 rounded-md  p-3 overflow-y-auto">
        <AltForm
          altPart={editingAltPart}
          currentPart={currentPart || null}
          onSubmit={function (altPart: IAltPartNumber): void {
            handleSubmit(altPart);
          }}
        ></AltForm>
      </div>
    </div>
  );
};

export default AltFormPanel;
