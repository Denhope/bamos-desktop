import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';

import { IVendor } from '@/models/IUser';
import { useTranslation } from 'react-i18next';

import VendorForm from './VendorForm';
import VendorTree from './VendorTree';
import {
  useAddVendorMutation,
  useDeleteVendorMutation,
  useGetVendorsQuery,
  useUpdateVendorMutation,
} from '@/features/vendorAdministration/vendorApi';
import { VendorFilteredFormValues } from './VendorFilteredForm';
import { useTypedSelector } from '@/hooks/useTypedSelector';

interface AdminPanelProps {
  values: VendorFilteredFormValues;
}

const AdminvendorPanel: React.FC<AdminPanelProps> = ({ values }) => {
  const [editingvendor, setEditingvendor] = useState<IVendor | null>(null);
  const { vendors } = useTypedSelector((state) => state.vendor);
  const {} = useTypedSelector((state) => state.vendorApi);
  const { isLoading } = useGetVendorsQuery({});

  const [addvendor] = useAddVendorMutation();
  const [updateVendor] = useUpdateVendorMutation();
  const [deleteVendor] = useDeleteVendorMutation();

  const handleCreate = () => {
    setEditingvendor(null);
  };

  const handleEdit = (vendor: IVendor) => {
    setEditingvendor(vendor);
  };

  const handleDelete = async (vendorId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS VENDOR?'),
      onOk: async () => {
        try {
          await deleteVendor(vendorId).unwrap();
          message.success(t('VENDOR SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING USER GROUP'));
        }
      },
    });
  };

  const handleSubmit = async (vendor: IVendor) => {
    try {
      if (editingvendor) {
        await updateVendor(vendor).unwrap();
        message.success(t('VENDOR SUCCESSFULLY UPDATED'));
      } else {
        await addvendor(vendor).unwrap();
        message.success(t('VENDOR SUCCESSFULLY ADDED'));
      }
      setEditingvendor(null);
    } catch (error) {
      message.error(t('ERROR SAVING VENDOR GROUP'));
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
            icon={<UserAddOutlined />}
            onClick={handleCreate}
          >
            {t('ADD VENDOR')}
          </Button>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingvendor && (
            <Button
              size="small"
              icon={<UserDeleteOutlined />}
              onClick={() => handleDelete(editingvendor.id)}
            >
              {t('DELETE VENDOR')}
            </Button>
          )}
        </Col>
      </Space>

      <Row className="gap-5">
        <Col
          sm={6}
          className="h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3 "
        >
          <VendorTree onVendorSelect={handleEdit} vendors={vendors || []} />
        </Col>
        <Col
          className="h-[75vh] bg-white px-4 rounded-md brequierement-gray-400  "
          sm={17}
        >
          <VendorForm
            vendor={editingvendor || undefined}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        </Col>
      </Row>
    </>
  );
};

export default AdminvendorPanel;
