import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

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
import { Split } from '@geoffcox/react-splitter';

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
      <Space className="gap-6 pb-3">
        <Col>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD VENDOR')}
          </Button>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingvendor && (
            <Button
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingvendor.id)}
            >
              {t('DELETE VENDOR')}
            </Button>
          )}
        </Col>
      </Space>

      <div className="  flex gap-4 justify-between">
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div className=" h-[75vh] bg-white px-4 rounded-md border-gray-400 p-3 ">
            <VendorTree onVendorSelect={handleEdit} vendors={vendors || []} />
          </div>
          <div
            className=" h-[75vh] bg-white px-4 rounded-md brequierement-gray-400 p-3overflow-y-auto "
            // sm={19}
          >
            <VendorForm
              vendor={editingvendor || undefined}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default AdminvendorPanel;
