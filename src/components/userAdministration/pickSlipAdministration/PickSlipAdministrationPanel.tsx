import React, { useMemo, useState } from 'react';
import { Button, Col, Modal, message, Space, Spin, Switch } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import {
  useDeleteRequirementMutation,
  useUpdateRequirementMutation,
  useAddRequirementMutation,
} from '@/features/requirementAdministration/requirementApi';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { IRequirement } from '@/models/IRequirement';

import { Split } from '@geoffcox/react-splitter';
import { ColDef } from 'ag-grid-community';
import {
  ValueEnumType,
  getStatusColor,
  transformToIPickSlip,
  transformToIRequirement,
} from '@/services/utilites';

import PickSlipAdministrationDiscription from './PickSlipAdministrationDiscription';
import PickSlipAdministrationTree from './PickSlipAdministrationTree';
import PickSlipContainer from './PickSlipContainer';
import { useGetPickSlipsQuery } from '@/features/pickSlipAdministration/pickSlipApi';
import PickSlipAdministrationForm from './PickSlipAdministrationForm';

interface AdminPanelProps {
  pickSlipSearchValues?: any;
}

const RequirementPanel: React.FC<AdminPanelProps> = ({
  pickSlipSearchValues,
}) => {
  const [editingRequirement, setEditingRequirement] =
    useState<IRequirement | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const {
    data: pickSlips,
    isLoading,
    isFetching,
  } = useGetPickSlipsQuery(
    {
      projectID: pickSlipSearchValues?.projectID || '',
      projectTaskID: pickSlipSearchValues?.projectTaskID || '',
      partNumberID: pickSlipSearchValues?.partNumberID || '',
      startDate: pickSlipSearchValues?.startDate || '',
      endDate: pickSlipSearchValues?.endDate || '',
      status: pickSlipSearchValues?.status || '',
      pickSlipNumberNew: pickSlipSearchValues?.pickSlipNumberNew || '',
      neededOnID: pickSlipSearchValues?.neededOnID || '',
      includeAlternates: true,
      storeFromID: pickSlipSearchValues?.storeFromID || '',
    },
    {
      skip: !pickSlipSearchValues,
    }
  );

  const [addRequirement] = useAddRequirementMutation();
  const [updateRequirement] = useUpdateRequirementMutation();
  const [deleteRequirement] = useDeleteRequirementMutation();
  const [isTreeView, setIsTreeView] = useState(true);
  const { data: partNumbers } = useGetPartNumbersQuery({});
  const { t } = useTranslation();

  const handleCreate = () => {
    setEditingRequirement(null);
    setIsCreating(true);
  };

  const handleEdit = (requirement: IRequirement) => {
    setEditingRequirement(requirement);
  };

  const handleDelete = async (companyId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS PICKSLIP?'),
      onOk: async () => {
        // try {
        //   await deleteRequirement(companyId).unwrap();
        //   message.success(t('REQUIREMENT SUCCESSFULLY DELETED'));
        // } catch (error) {
        //   message.error(t('ERROR DELETING REQUIREMENT'));
        // }
      },
    });
  };

  const handleSubmit = async (requirement: IRequirement) => {
    try {
      if (editingRequirement) {
        await updateRequirement(requirement).unwrap();
        message.success(t('PICKSLIP SUCCESSFULLY UPDATED'));
      } else {
        await addRequirement({ requirement }).unwrap();
        message.success(t('PICKSLIP SUCCESSFULLY ADDED'));
      }
      setEditingRequirement(null);
    } catch (error) {
      message.error(t('ERROR SAVING PICKSLIP'));
    }
  };
  type CellDataType = 'text' | 'number' | 'date' | 'boolean'; // Определите возможные типы данных

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType; // Обязательное свойство
  }
  const valueEnum: ValueEnumType = {
    onShort: t('ON SHORT'),
    onQuatation: t('QUATATION'),
    open: t('OPEN'),
    closed: t('CLOSED'),
    canceled: t('CANCELLED'),
    onOrder: t('ON ORDER'),
    draft: t('DRAFT'),
    issued: t('ISSUED'),
    complete: t('COMPLETE'),
    progress: t('IN PROGRESS'),
  };

  const columnpickSlips = [
    {
      field: 'pickSlipNumberNew',
      headerName: `${t('PICKSLIP No')}`,
      cellDataType: 'number',
    },
    {
      field: 'status',
      headerName: `${t('Status')}`,
      cellDataType: 'text',
      width: 150,
      filter: true,
      valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
        params.data.status,
      valueFormatter: (params: { value: keyof ValueEnumType }) => {
        const status = params.value;
        return valueEnum[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumType }) => ({
        backgroundColor: getStatusColor(params.value),
        color: '#ffffff', // Text color
      }),
    },
    {
      field: 'projectTaskWO',
      headerName: `${t('WO No')}`,
      cellDataType: 'number',
    },
    {
      field: 'projectWO',
      headerName: `${t('PROJECT')}`,
      cellDataType: 'number',
    },

    {
      field: 'plannedDate',
      editable: false,
      cellDataType: 'date',
      headerName: `${t('PLANNED DATE')}`,
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
    {
      field: 'store',
      editable: false,
      cellDataType: 'text',
      headerName: `${t('GET FROM STORE')}`,
    },

    {
      field: 'neededOnIDTitle',
      editable: false,
      cellDataType: 'text',
      headerName: `${t('NEEDED ON')}`,
    },
    // Добавьте другие колонки по необходимости
  ];

  const transformedPickSlips = useMemo(() => {
    return pickSlipSearchValues && transformToIPickSlip(pickSlips || []);
  }, [pickSlipSearchValues, pickSlips]);

  // if (isLoading) {
  //   return (
  //     <div>
  //       <Spin />
  //     </div>
  //   );
  // }

  return (
    <>
      <Space>
        <Col
          className="bg-white px-4 py-3 w-full rounded-md brequierement-gray-400"
          sm={24}
        >
          <PickSlipAdministrationDiscription
            requirement={editingRequirement}
          ></PickSlipAdministrationDiscription>
        </Col>
      </Space>
      <Space className="">
        <Col>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD PICKSLIP')}
          </Button>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingRequirement && (
            <Button
              danger
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingRequirement.id)}
            >
              {t('DELETE PICKSLIP')}
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
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div className="h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3">
            {isTreeView ? (
              <PickSlipAdministrationTree
                isLoading={isLoading || isFetching}
                onCompanySelect={(rowData: any) => handleEdit(rowData)}
                pickSlips={pickSlips || []}
              />
            ) : (
              <PickSlipContainer
                isLoading={isLoading || isFetching}
                rowData={transformedPickSlips}
                isFilesVisiable={true}
                isVisible={true}
                pagination={true}
                isEditable={false}
                height={'64vh'}
                isAddVisiable={true}
                isButtonVisiable={false}
                columnDefs={columnpickSlips}
                partNumbers={partNumbers || []}
                onRowSelect={(rowData: any) => handleEdit(rowData)}
                onUpdateData={function (data: any[]): void {}}
                // onCheckItems={function (selectedKeys: React.Key[]): void {}}
              />
            )}
          </div>
          <div className="h-[67vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            <PickSlipAdministrationForm
              requierement={editingRequirement || undefined}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default RequirementPanel;