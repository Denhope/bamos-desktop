import { Button, Col, Modal, Space, Spin, message } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import WODiscription from './StoreDiscription';
import {
  PlusSquareOutlined,
  MinusSquareOutlined,
  PrinterOutlined,
  AlertTwoTone,
  UsergroupAddOutlined,
  CheckCircleFilled,
  SwitcherFilled,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import StoreTree from './StoreTree';
import StoreAdminForm from './StoreAdminForm';

import { Split } from '@geoffcox/react-splitter';
import { IStore } from '@/models/IUser';
import {
  useGetStoresQuery,
  useDeleteStoreMutation,
  useAddStoreMutation,
  useUpdateStoreMutation,
} from '@/features/storeAdministration/StoreApi';
import PermissionGuard, { Permission } from '../auth/PermissionGuard';
interface AdminPanelProps {
  storeSearchValues: any;
}
const StorePanel: React.FC<AdminPanelProps> = ({ storeSearchValues }) => {
  const [editingStore, setEditingStore] = useState<IStore | null>(null);
  const { t } = useTranslation();
  const [triggerQuery, setTriggerQuery] = useState(false);

  const {
    data: stores,
    isLoading,
    isFetching: partsLoadingF,
  } = useGetStoresQuery(
    {
      status: storeSearchValues?.status,
      ownerID: storeSearchValues?.ownerID,
      stationID: storeSearchValues?.stationID,
      storeShortName: storeSearchValues?.storeShortName,
    },
    {
      skip: !triggerQuery,
    }
  );

  const [addStore] = useAddStoreMutation();
  const [updateStore] = useUpdateStoreMutation();
  const [deleteStore] = useDeleteStoreMutation();

  useEffect(() => {
    // Check if storeSearchValues is defined and not null
    if (storeSearchValues) {
      // Check if there are any search values
      const hasSearchParams = Object.values(storeSearchValues).some(
        (value) => value !== undefined && value !== ''
      );
      if (hasSearchParams) {
        setTriggerQuery(true);
      }
    }
  }, [storeSearchValues]);

  const handleEdit = (project: IStore) => {
    setEditingStore(project);
  };
  const handleCreate = () => {
    setEditingStore(null);
  };

  const handleDelete = async (companyId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS STORE?'),
      onOk: async () => {
        try {
          await deleteStore(companyId).unwrap();
          message.success(t('STORE SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('STORE DELETING ERROR'));
        }
      },
    });
  };
  const handleSubmit = async (store: IStore) => {
    try {
      if (editingStore) {
        await updateStore(store).unwrap();
        message.success(t('STORE SUCCESSFULLY UPDATED'));
      } else {
        await addStore({ store }).unwrap();
        message.success(t('STORE SUCCESSFULLY ADDED'));
      }
      setEditingStore(null);
    } catch (error) {
      message.error(t('ERROR SAVING STORE'));
    }
  };
  return (
    <div className="flex flex-col gap-5 overflow-hidden">
      <Space>
        <Col
          className=" bg-white px-4 py-3  rounded-md brequierement-gray-400 "
          sm={24}
        >
          <WODiscription
            // onstoreSearch={setstore}
            store={editingStore}
          ></WODiscription>
        </Col>
      </Space>
      <Space className="">
        <Col>
          <PermissionGuard requiredPermissions={[Permission.STORE_ACTIONS]}>
            <Button
              size="small"
              icon={<PlusSquareOutlined />}
              onClick={handleCreate}
            >
              {t('ADD STORE')}
            </Button>
          </PermissionGuard>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingStore && (
            <PermissionGuard
              requiredPermissions={[
                Permission.STORE_ACTIONS,
                Permission.STORE_DELETE_ACTIONS,
              ]}
            >
              <Button
                size="small"
                icon={<MinusSquareOutlined />}
                onClick={() => handleDelete(editingStore.id || '')}
              >
                {t('DELETE STORE')}
              </Button>
            </PermissionGuard>
          )}
        </Col>
      </Space>
      <div className="h-[77vh] flex flex-col">
        <Split initialPrimarySize="15%" splitterSize="20px">
          <div className="h-[77vh] bg-white px-4 pb-3 rounded-md border-gray-400 p-3 flex flex-col">
            <StoreTree
              isLoading={isLoading || partsLoadingF}
              onstoreSelect={handleEdit}
              stores={stores || []}
            />
          </div>
          <div className="  h-[77vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            <StoreAdminForm
              onSubmit={handleSubmit}
              store={editingStore || undefined}
            />
          </div>
        </Split>
      </div>
    </div>
  );
};

export default StorePanel;
