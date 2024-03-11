import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import { useTypedSelector } from '@/hooks/useTypedSelector';
import { IACType, IMaintenanceType } from '@/models/AC';

import {
  useAddACTypeMutation,
  useDeleteACTypeMutation,
  useGetACTypesQuery,
  useUpdateACTypeMutation,
} from '@/features/acTypeAdministration/acTypeApi';
import MaintenanceTypeTree from './MaintenanceTypeTree';
import MaintenanceTypeForm from './MaintenanceTypeForm';

interface AdminPanelProps {
  values: any;
  acType: IACType | undefined;
}

const MaintenanceTypeTab: React.FC<AdminPanelProps> = ({ values, acType }) => {
  const [editingACType, setEditingACType] = useState<IACType | null>(null);
  const [editingMaintenanceType, setEditingMaintenanceType] =
    useState<IMaintenanceType | null>(null);
  // const { acTypes } = useTypedSelector((state) => state.acTypes);
  const [types, setEditingTypes] = useState<IMaintenanceType[] | []>([]);

  const { isLoading } = useGetACTypesQuery({});
  useEffect(() => {
    if (acType) {
      setEditingTypes(acType.maintenanceTypes || []);

      setEditingMaintenanceType(null);
      setEditingACType(acType);
    } else {
    }
  }, [acType]);

  const [updateACType] = useUpdateACTypeMutation();

  const handleCreate = () => {
    setEditingMaintenanceType(null);
  };

  const handleEdit = (acMaintType: IMaintenanceType) => {
    setEditingMaintenanceType(acMaintType);
  };

  const handleDelete = async (maintenanceTypeId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS MAINTENANCE TYPE?'),
      onOk: async () => {
        try {
          // Обновление состояния после успешного удаления
          if (acType?.maintenanceTypes) {
            const newMaintenanceTypes =
              acType?.maintenanceTypes.filter(
                (mt) => mt.id !== maintenanceTypeId
              ) || [];

            if (editingACType) {
              await updateACType({
                ...acType,
                maintenanceTypes: newMaintenanceTypes,
              }).unwrap();
              message.success(t('MAINTENANCE TYPE SUCCESSFULLY DELETED'));
            }
          }
        } catch (error) {
          message.error(t('ERROR DELETING MAINTENANCE TYPE'));
        }
      },
    });
  };

  const handleSubmit = async (acType: IACType) => {
    try {
      if (editingACType) {
        await updateACType(acType).unwrap();
        // setEditingMaintenanceType(acType);

        message.success(t('VENDOR SUCCESSFULLY UPDATED'));
      }

      setEditingMaintenanceType(null);
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
            onClick={() => {
              setEditingMaintenanceType(null);
              handleCreate;
            }}
          >
            {t('ADD MAINTENANCE TYPE')}
          </Button>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingMaintenanceType && (
            <Button
              size="small"
              icon={<UserDeleteOutlined />}
              onClick={() => handleDelete(editingMaintenanceType.id)}
            >
              {t('DELETE AC TYPE')}
            </Button>
          )}
        </Col>
      </Space>

      <Row className="gap-5">
        <Col
          sm={8}
          className="h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3 "
        >
          <MaintenanceTypeTree
            maintenanceTypes={types || []}
            onMaintananceTypeSelect={function (type: IMaintenanceType): void {
              handleEdit(type);
            }}
          />
        </Col>
        <Col
          className="h-[75vh] bg-white px-4 rounded-md brequierement-gray-400  "
          sm={15}
        >
          <MaintenanceTypeForm
            acType={acType}
            onSubmit={function (maintenanceType: IMaintenanceType): void {
              // console.log(maintenanceType);
              if (acType && acType?.maintenanceTypes) {
                const updatedACType: IACType = {
                  ...acType,
                  maintenanceTypes:
                    acType?.maintenanceTypes?.map((mt) =>
                      mt.id === maintenanceType.id ? maintenanceType : mt
                    ) || [],
                };

                // Проверяем, существует ли maintenanceType с таким id
                const existingMaintenanceType = acType?.maintenanceTypes?.find(
                  (mt) => mt.id === maintenanceType.id
                );

                if (existingMaintenanceType) {
                  // Если существует, обновляем его
                  updatedACType.maintenanceTypes = acType.maintenanceTypes?.map(
                    (mt) =>
                      mt.id === maintenanceType.id ? maintenanceType : mt
                  );
                  handleSubmit(updatedACType);
                } else {
                  // Если не существует, добавляем новый
                  updatedACType.maintenanceTypes = [
                    ...(acType.maintenanceTypes || []),
                    maintenanceType,
                  ];
                  handleSubmit(updatedACType);
                  setEditingTypes({ ...types, ...maintenanceType });
                }
              }
            }}
            // onDelete={handleDelete}
            maintenanceType={editingMaintenanceType || null}
          />
        </Col>
      </Row>
    </>
  );
};

export default MaintenanceTypeTab;
