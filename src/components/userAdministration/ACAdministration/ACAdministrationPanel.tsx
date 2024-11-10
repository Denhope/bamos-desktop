import React, { useEffect, useState } from 'react';
import { Button, Col, Modal, Space, Spin, Switch, notification } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
import { Split } from '@geoffcox/react-splitter';
import { useTranslation } from 'react-i18next';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { ITask } from '@/models/ITask';
import ACAdministrationlForm from './ACAdministrationlForm';
import ACAdministrationTree from './ACAdministrationTree';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';
import {
  useAddPlaneMutation,
  useDeletePlaneMutation,
  useGetPlanesQuery,
  useUpdatePlaneMutation,
} from '@/features/acAdministration/acApi';

interface AdminPanelProps {
  values: any;
}

const ACAdministrationPanel: React.FC<AdminPanelProps> = ({ values }) => {
  const [editingvendor, setEditingvendor] = useState<ITask | null>(null);
  const [selectedItems, setSelectedItems] = useState<React.Key[] | []>([]);
  const [isTreeView, setIsTreeView] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const shouldSkipQuery =
    !values.acTypeId &&
    !values.registrationNumber &&
    !values.customerId &&
    !values.serialNumber &&
    !values._time;

  const {
    isLoading,
    data: planes,
    isFetching,
  } = useGetPlanesQuery(
    {
      ...(values.acTypeId && { acTypeID: values.acTypeId }),
      ...(values.registrationNumber && {
        planeNumber: values.registrationNumber,
      }),
      ...(values._time && { model: values._time }),
      ...(values.customerId && { costumerCodeID: values.customerId }),
      ...(values.serialNumber && { serialNumber: values.serialNumber }),
    },
    {
      skip: shouldSkipQuery,
    }
  );

  const [addPlane] = useAddPlaneMutation();
  const [updatePlane] = useUpdatePlaneMutation();
  const [deletePlane] = useDeletePlaneMutation();

  const handleCreate = () => {
    setEditingvendor(null);
    setSelectedRowId(null);
  };

  const handleEdit = (vendor: any) => {
    setEditingvendor(vendor);
    setSelectedRowId(vendor._id || vendor.id);
  };

  const handleDelete = async (vendorId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS A/C?'),
      onOk: async () => {
        try {
          await deletePlane(vendorId).unwrap();
          notification.success({
            message: t('SUCCESS'),
            description: t('A/C SUCCESSFULLY DELETED'),
          });
          setEditingvendor(null);
          setSelectedRowId(null);
        } catch (error) {
          notification.error({
            message: t('ERROR'),
            description: t('ERROR DELETING A/C'),
          });
        }
      },
    });
  };

  const handleSubmit = async (task: ITask) => {
    try {
      if (editingvendor) {
        await updatePlane(task).unwrap();
        notification.success({
          message: t('SUCCESS'),
          description: t('A/C SUCCESSFULLY UPDATED'),
        });
      } else {
        await addPlane({ task }).unwrap();
        notification.success({
          message: t('SUCCESS'),
          description: t('A/C SUCCESSFULLY ADDED'),
        });
      }
      setEditingvendor(null);
      setSelectedRowId(null);
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('ERROR SAVING A/C'),
      });
    }
  };

  const { t } = useTranslation();

  const columnDefs = [
    {
      field: 'regNbr',
      headerName: t('REGISTRATION NUMBER'),
      filter: true,
    },
    {
      field: 'serialNbr',
      headerName: t('SERIAL NUMBER'),
      filter: true,
    },
    {
      field: 'acType',
      headerName: t('AIRCRAFT TYPE'),
      filter: true,
      valueGetter: (params: any) => params.data?.acTypeId[0]?.code,
    },
    {
      field: 'model',
      headerName: t('MODEL'),
      filter: true,
      valueGetter: (params: any) => params.data?.model,
    },

    {
      field: 'company',
      headerName: t('COMPANY'),
      filter: true,
      flex: 1,
      valueGetter: (params: any) => params.data?.companyID?.companyName,
    },
    {
      field: 'customerCode',
      headerName: t('CUSTOMER CODE'),
      filter: true,
      valueGetter: (params: any) => params.data.cuctumerCodeID?.prefix,
    },
  ];

  return (
    <>
      <Space className="gap-6 pb-3">
        <Col>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD A/C')}
          </Button>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingvendor && (
            <Button
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingvendor.id)}
            >
              {t('DELETE A/C')}
            </Button>
          )}
        </Col>
        <Col>
          <Switch
            checkedChildren="Table"
            unCheckedChildren="Tree"
            defaultChecked
            onChange={() => setIsTreeView(!isTreeView)}
          />
        </Col>
      </Space>

      <div className="flex gap-4 justify-between">
        <Split initialPrimarySize="35%" splitterSize="20px">
          <div className="h-[72vh] bg-white px-4 rounded-md border-gray-400 p-3">
            {isTreeView ? (
              <ACAdministrationTree
                onPlaneselect={handleEdit}
                planes={planes || []}
              />
            ) : (
              <UniversalAgGrid
                gridId="acList"
                pagination={true}
                isChekboxColumn={true}
                columnDefs={columnDefs}
                rowData={planes || []}
                selectedRowId={selectedRowId}
                onRowSelect={(selectedRows) => {
                  if (selectedRows.length > 0) {
                    handleEdit(selectedRows[0]);
                  } else {
                    setEditingvendor(null);
                    setSelectedRowId(null);
                  }
                }}
                onCheckItems={(items: React.Key[]): void => {
                  setSelectedItems(items);
                  if (items.length === 0) {
                    setEditingvendor(null);
                    setSelectedRowId(null);
                  }
                }}
                height={'65vh'}
                isLoading={isLoading || isFetching}
              />
            )}
          </div>
          <div className="h-[70vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            <ACAdministrationlForm
              task={editingvendor || undefined}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default ACAdministrationPanel;
