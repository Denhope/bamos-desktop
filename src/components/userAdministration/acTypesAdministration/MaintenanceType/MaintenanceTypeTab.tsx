import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import { IACType, IMaintenanceType } from '@/models/AC';

import {
  useGetACTypesQuery,
  useUpdateACTypeMutation,
} from '@/features/acTypeAdministration/acTypeApi';
import MaintenanceTypeTree from './MaintenanceTypeTree';
import MaintenanceTypeForm from './MaintenanceTypeForm';

interface AdminPanelProps {
  values: any;
  acType: IACType | undefined;
}

const MaintenanceTypeTab: React.FC<AdminPanelProps> = ({ acType }) => {
  const [editingACType, setEditingACType] = useState<IACType | null>(null);
  const [editingMaintenanceType, setEditingMaintenanceType] =
    useState<IMaintenanceType | null>(null);

  const [types, setEditingTypes] = useState<IMaintenanceType[] | []>([]);

  const { isLoading } = useGetACTypesQuery({});
  const handleCreate = () => {
    setEditingMaintenanceType(null);
  };
  useEffect(() => {
    if (acType) {
      setEditingTypes(acType.maintenanceTypes || []);

      setEditingMaintenanceType(null);
      setEditingACType(acType);
    } else {
    }
  }, [acType && acType.id, editingACType]);

  const [updateACType] = useUpdateACTypeMutation();

  const handleEdit = (acMaintType: IMaintenanceType) => {
    setEditingMaintenanceType(acMaintType);
  };

  const handleDelete = async (maintenanceTypeId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS MAINTENANCE TYPE?'),
      onOk: async () => {
        try {
          if (acType?.maintenanceTypes) {
            const newMaintenanceTypes =
              acType?.maintenanceTypes.filter(
                (mt) => mt.id !== maintenanceTypeId
              ) || [];

            if (editingACType) {
              await updateACType({
                ...editingACType,
                maintenanceTypes: newMaintenanceTypes,
              })
                .unwrap()
                .then((payload) =>
                  setEditingTypes(payload.maintenanceTypes || [])
                );

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
        setEditingMaintenanceType(null);
        if (acType.maintenanceTypes) {
          setEditingTypes(acType.maintenanceTypes);
        }

        message.success(t('MAINTENANCE TYPE SUCCESSFULLY UPDATED'));
      }
    } catch (error) {
      message.error(t('ERROR SAVING MAINTENANCE TYPE'));
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
            onClick={() => {
              handleCreate();
            }}
          >
            {t('ADD MAINTENANCE TYPE')}
          </Button>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingMaintenanceType && (
            <Button
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingMaintenanceType.id)}
            >
              {t('DELETE MAINTENANCE TYPE')}
            </Button>
          )}
        </Col>
      </Space>

      <Row justify={'space-between'} className="  gap-5">
        <Col
          sm={8}
          className="h-[78vh] bg-white px-4 py-3 rounded-md border-gray-400 "
        >
          <MaintenanceTypeTree
            maintenanceTypes={types || []}
            onMaintananceTypeSelect={function (type: IMaintenanceType): void {
              handleEdit(type);
            }}
          />
        </Col>
        <Col className="h-[75vh] bg-white  rounded-md " sm={15}>
          <MaintenanceTypeForm
            acType={acType}
            onSubmit={function (maintenanceType: IMaintenanceType): void {
              if (acType && acType?.maintenanceTypes) {
                const updatedACType: IACType = {
                  ...acType,
                  maintenanceTypes:
                    acType?.maintenanceTypes?.map((mt) =>
                      mt.id === maintenanceType.id ? maintenanceType : mt
                    ) || [],
                };

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
                  setEditingMaintenanceType(null);
                } else {
                  updatedACType.maintenanceTypes = [
                    ...(acType.maintenanceTypes || []),
                    maintenanceType,
                  ];
                  handleSubmit(updatedACType);
                  setEditingMaintenanceType(null);
                }
              }
            }}
            maintenanceType={editingMaintenanceType || null}
          />
        </Col>
      </Row>
    </>
  );
};

export default MaintenanceTypeTab;
