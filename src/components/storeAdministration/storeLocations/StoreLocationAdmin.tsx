// ts-nocheck

import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import {
  ProjectOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined,
} from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import { IProjectItem } from '@/models/AC';

// import projectItemsAdministrationForm from './projectItemsAdministrationForm';
// import projectItemsAdministrationTree from './projectItemsAdministrationTree';
import { Split } from '@geoffcox/react-splitter';
import StoreLocationAdministrationTree from './StoreLocationAdministrationTree';
import StoreLocationAdministrationForm from './StoreLocationAdministrationForm';
import {
  useAddLocationMutation,
  useDeletelocationTaskMutation,
  useGetLocationsQuery,
  useUpdateLocationMutation,
} from '@/features/storeAdministration/LocationApi';
import { ILocation } from '@/models/IUser';
interface AdminPanelRProps {
  storeID: string;
}

const StoreLocationAdmin: React.FC<AdminPanelRProps> = ({ storeID }) => {
  const [editingReqCode, setEditingReqCode] = useState<ILocation | null>(null);

  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  let projectItems = null;
  let isLoading = false;

  if (storeID) {
    const {
      data,
      isLoading: loading,
      refetch: refetchProjectItems,
    } = useGetLocationsQuery({
      storeID,
    });
    projectItems = data;
    isLoading = loading;
    console.log(data);
  }

  useEffect(() => {
    setEditingReqCode(null);
  }, [storeID]);
  const [addLocation] = useAddLocationMutation({});

  const [updateLocation] = useUpdateLocationMutation();
  const [deleteLocation] = useDeletelocationTaskMutation();

  const handleCreate = () => {
    setEditingReqCode(null);
  };

  const handleEdit = (reqCode: ILocation) => {
    setEditingReqCode(reqCode);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS LOCATION ITEM?'),
      onOk: async () => {
        try {
          await deleteLocation(id).unwrap();
          message.success(t('LOCATION ITEM SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING LOCATION ITEM'));
        }
      },
    });
  };

  const handleSubmit = async (reqCode: any) => {
    try {
      if (editingReqCode) {
        await updateLocation(reqCode).unwrap();
        message.success(t('УСПЕШНО ОБНОВЛЕНО'));
        setEditingReqCode(null);
      } else {
        await addLocation({
          location: reqCode,
          // storeID: storeID,
        }).unwrap();
        message.success(t('УСПЕШНО ДОБАВЛЕНО'));
        setEditingReqCode(null);
      }
    } catch (error) {
      message.error(t('ОШИБКА СОХРАНЕНИЯ'));
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
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD LOCATION')}
          </Button>
        </Col>

        <Col span={4} style={{ textAlign: 'right' }}>
          {editingReqCode && (
            <Button
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => {
                // Проверяем, есть ли в элементах editingReqCode.projectItemsWOID заказы со статусом отличным от CANCELED или DELETED
                // const hasActiveOrders = editingReqCode?.ID?.some(
                //   (item) =>
                //     item.status !== 'CANCELED' && item.status !== 'DELETED'
                // );

                // if (hasActiveOrders) {
                //   // Если есть активные заказы, выводим предупреждение
                //   Modal.warning({
                //     title: t('УДАЛЕНИЕ НЕВОЗМОЖНО'),
                //     content: t(
                //       'Удаление невозможно из-за того, что уже созданы заказы. Если вы хотите удалить записи, установите статус ЗАКАЗА на ОТМЕНЕН.'
                //     ),
                //   });
                // } else {
                // Если все заказы отменены или удалены, вызываем handleDelete
                handleDelete(editingReqCode?.id || '');
                // }
              }}
            >
              {t('DELETE LOCATION')}
            </Button>
          )}
        </Col>
        {/* <Col span={4} style={{ textAlign: 'right' }}>
          <Button
            disabled={!selectedKeys.length && selectedKeys.length < 1}
            size="small"
            icon={<ProjectOutlined />}
            onClick={() => handleGenerateWOTasks(selectedKeys)}
          >
            {t('СФОРМИРОВАТЬ ЗАКАЗЫ')}
          </Button>
        </Col> */}
      </Space>

      <div className="  flex gap-4 justify-between">
        <Split initialPrimarySize="25%">
          <div
            // sm={12}
            className="h-[48vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 "
          >
            <StoreLocationAdministrationTree
              projectItems={projectItems || []}
              onProjectItemSelect={handleEdit}
              onCheckItems={(selectedKeys) => {
                setSelectedKeys(selectedKeys);
              }}
            />
          </div>
          <div
            className="h-[53vh] bg-white px-4 py-3 rounded-md brequierement-gray-400 p-3 overflow-y-auto "
            // sm={11}
          >
            <StoreLocationAdministrationForm
              reqCode={editingReqCode || undefined}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default StoreLocationAdmin;
