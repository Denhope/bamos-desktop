//@ts-nocheck
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Button, Col, Modal, message, Space, Spin, Switch, Upload } from 'antd';
import {
  PlusSquareOutlined,
  MinusSquareOutlined,
  UploadOutlined,
} from '@ant-design/icons';

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
  ValueEnumTypeTask,
  getStatusColor,
  getTaskTypeColor,
  transformToIPickSlip,
  transformToIRequirement,
} from '@/services/utilites';

import PickSlipAdministrationDiscription from './PickSlipAdministrationDiscription';
import PickSlipAdministrationTree from './PickSlipAdministrationTree';
import PickSlipContainer from './PickSlipContainer';
import {
  useDeletePickSlipMutation,
  useGetPickSlipsQuery,
  useUpdatePickSlipMutation,
} from '@/features/pickSlipAdministration/pickSlipApi';
import PickSlipAdministrationForm from './PickSlipAdministrationForm';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import { updatePickSlip } from '@/utils/api/thunks';
import { useUpdatePickSlipItemsMutation } from '@/features/pickSlipAdministration/pickSlipItemsApi';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';
import { AgGridReact } from 'ag-grid-react';
import * as XLSX from 'xlsx';
import { useAddBulkMaterialStoreMutation } from '@/features/storeAdministration/PartsApi';

interface AdminPanelProps {
  pickSlipSearchValues?: any;
}

const RequirementPanel: React.FC<AdminPanelProps> = ({
  pickSlipSearchValues,
}) => {
  const [editingRequirement, setEditingRequirement] =
    useState<IRequirement | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [gridApi, setGridApi] = useState(null);
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
      WOReferenceID: pickSlipSearchValues?.WOReferenceID || '',
    },
    {
      skip: !pickSlipSearchValues,
    }
  );

  const [addRequirement] = useAddRequirementMutation();
  const [updateRequirement] = useUpdateRequirementMutation();
  const [deletePick] = useDeletePickSlipMutation();
  const [isTreeView, setIsTreeView] = useState(false);
  const { data: partNumbers } = useGetPartNumbersQuery({});
  const { t } = useTranslation();
  const [addBulkMaterialStore] = useAddBulkMaterialStoreMutation();

  const handleCreate = () => {
    setEditingRequirement(null);
    setIsCreating(true);
  };

  const handleEdit = useCallback((requirement: IRequirement) => {
    setEditingRequirement(requirement);
    setSelectedRowId(requirement.id);
  }, []);

  const handleDelete = async (companyId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS PICKSLIP?'),
      onOk: async () => {
        try {
          await deletePick(companyId).unwrap();
          message.success(t('REQUIREMENT SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING REQUIREMENT'));
        }
      },
    });
  };
  const [updatePick] = useUpdatePickSlipMutation({});
  const handleSubmit = async (requirement: any) => {
    try {
      if (editingRequirement) {
        console.log(requirement);

        await updatePick({
          pickSlip: {
            id: requirement.id,
            state: requirement.state,
            getFromID: requirement.getFromID,
            neededOnID: requirement.neededOnID,
            WOReferenceID: requirement.WOReferenceID,
            projectTaskID: requirement.projectTaskID,
            projectID: requirement.projectID,
            plannedDate: requirement.plannedDate,
            type: requirement?.type,
            notes: requirement?.notes,
          },
        }).unwrap();
        message.success(t('PICKSLIP SUCCESSFULLY UPDATED'));
        setSelectedRowId(requirement.id);
      } else {
        // await addRequirement({ requirement }).unwrap();
        // message.success(t('PICKSLIP SUCCESSFULLY ADDED'));
      }
      // Не сбрасываем editingRequirement здесь
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
    closed: t('CLOSE'),
    canceled: t('CANCEL'),
    partlyCanceled: t('PARTLY CANCELLED'),
    onOrder: t('ON ORDER'),
    draft: t('DRAFT'),
    issued: t('ISSUED'),
    complete: t('COMPLETE'),
    progress: t('IN PROGRESS'),
    tofix: t('ATTENTION'),
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
      width: 200,
      filter: true,
      valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
        params.data.status,
      valueFormatter: (params: { value: keyof ValueEnumType }) => {
        const status = params.value;
        return valueEnum[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumType }) => ({
        backgroundColor: getStatusColor(params.value),
        // color: '#ffffff', // Text color
      }),
    },
    {
      field: 'projectTaskWO',
      headerName: `${t('WO No')}`,
      cellDataType: 'number',
    },
    {
      field: 'projectTaskType',
      width: 120,
      headerName: `${t('TASK TYPE')}`,
      filter: true,
      valueGetter: (params: {
        data: { projectTaskType: keyof ValueEnumTypeTask };
      }) => params.data.projectTaskType,
      valueFormatter: (params: { value: keyof ValueEnumTypeTask }) => {
        const status = params.value;
        return valueEnumTask[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumTypeTask }) => ({
        backgroundColor: getTaskTypeColor(params.value),
        // color: '#ffffff', // Text color
      }),
      // hide: true,
    },
    {
      field: 'taskNumber',
      headerName: `${t('TASK NUMBER')}`,
      cellDataType: 'text',
    },
    {
      field: 'projectWO',
      headerName: `${t('WP')}`,
      cellDataType: 'number',
    },
    {
      field: 'WONumber',
      headerName: `${t('WO')}`,
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
      field: 'bookingDate',
      editable: false,
      cellDataType: 'date',
      headerName: `${t('BOOKING DATE')}`,
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
    {
      field: 'createDate',
      editable: false,
      cellDataType: 'date',
      headerName: `${t('CREATE DATE')}`,
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
      field: 'createUserName',
      editable: false,
      cellDataType: 'text',
      headerName: `${t('CREATED BY')}`,
    },
    // Добавьте другие колонки по необходимости
  ];
  const valueEnumTask: ValueEnumTypeTask = {
    RC: t('TC'),
    CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
    NRC: t('NRC (DEFECT)'),
    MJC: t('MJC'),
    CMJC: t('CMJC'),
    FC: t('FC)'),
    NRC_ADD: t('ADHOC'),
    HARD_ACCESS: t('HARD ACCESS'),
  };

  const transformedPickSlips = useMemo(() => {
    return pickSlipSearchValues && transformToIPickSlip(pickSlips || []);
  }, [pickSlipSearchValues, pickSlips]);

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  useEffect(() => {
    if (gridApi && selectedRowId) {
      gridApi.forEachNode((node) => {
        if (node.data && node.data.id === selectedRowId) {
          node.setSelected(true);
          gridApi.ensureNodeVisible(node);
        }
      });
    }
  }, [gridApi, selectedRowId, transformedPickSlips]);

  const getRowId = useCallback((params) => {
    return params.data.id;
  }, []);

  const handleExcelUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const convertedData = jsonData.map((item: any) => ({
        COMPANY_ID: '63b5ccc5b7fd6da202520ecf', // Замените на актуальный ID компании
        ORDER_NUMBER: item['Order Number'],
        PART_NUMBER: item['Part Number'],
        NAME_OF_MATERIAL: item['Description'],
        GROUP: item['Stock Group'],
        QUANTITY: parseFloat(item.Qty),
        LOCAL_ID: parseFloat(item['Batch Number']),
        SERIAL_NUMBER: item['Serial No'],
        CONDITION: item['Condition Release Type'],
        APPROVED_CERT: item['Approved Cert'],
        UNIT_OF_MEASURE: item['Unit Of Measure'],
        RECEIVED_DATE: item['Goods Received Date'],
        PRODUCT_EXPIRATION_DATE: item['Shelf Life Date'],
        WAREHOUSE_RECEIVED_AT: item['Warehouse Code'],
        Unit_Local_Value: parseFloat(item['Unit Price In Local']),
        Unit_Currency_Value: parseFloat(item['Unit Price In Currency']),
        Total_Local_Value: parseFloat(item['Total Cost In Local']),
        BATCH: item['Batch Notes']
          ? item['Batch Notes'].split(':')[1]
          : undefined,
        AWB_REFERENCE: item['AWB Reference'],
        CURRENCY: item['Currency Code'],
        TYPE: item['Part Type'],
        OWNER: item['Batch / Unit Owner'],
        SUPPLIER_BATCH_NUMBER: item['Suppliers Batch number'],
        STOCK: item['Warehouse Code'],
        SHELF_NUMBER: item['Bin Location'],
      }));

      addBulkMaterialStore(convertedData)
        .unwrap()
        .then(() => {
          message.success(t('EXCEL DATA SUCCESSFULLY UPLOADED'));
        })
        .catch((error) => {
          message.error(t('ERROR UPLOADING EXCEL DATA'));
          console.error('Error uploading Excel data:', error);
        });
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent default upload behavior
  };

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
          <PermissionGuard requiredPermissions={[Permission.PICKSLIP_ACTIONS]}>
            <Button
              size="small"
              icon={<PlusSquareOutlined />}
              onClick={handleCreate}
            >
              {t('ADD PICKSLIP')}
            </Button>
          </PermissionGuard>
        </Col>
        <Col>
          <PermissionGuard requiredPermissions={[Permission.PICKSLIP_ACTIONS]}>
            <Upload
              accept=".xlsx,.xls"
              beforeUpload={handleExcelUpload}
              showUploadList={false}
            >
              <Button size="small" icon={<UploadOutlined />}>
                {t('UPLOAD EXCEL')}
              </Button>
            </Upload>
          </PermissionGuard>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingRequirement && (
            <PermissionGuard
              requiredPermissions={[
                Permission.PICKSLIP_ACTIONS,
                Permission.DELETE_PICKSLIP,
              ]}
            >
              <Button
                danger
                size="small"
                icon={<MinusSquareOutlined />}
                onClick={() => handleDelete(editingRequirement.id)}
              >
                {t('DELETE PICKSLIP')}
              </Button>
            </PermissionGuard>
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
          <div className="h-full bg-white px-4 rounded-md border-gray-400 p-3">
            {isTreeView ? (
              <PickSlipAdministrationTree
                isLoading={isLoading || isFetching}
                onCompanySelect={(rowData: any) => handleEdit(rowData)}
                pickSlips={pickSlips || []}
              />
            ) : (
              <UniversalAgGrid
                selectedRowId={selectedRowId}
                gridId="pickSlipAdministration"
                rowData={transformedPickSlips}
                columnDefs={columnpickSlips}
                onRowSelect={(selectedRows) => {
                  if (selectedRows.length > 0) {
                    handleEdit(selectedRows[0]);
                  }
                }}
                height="100%"
                className="h-full"
                pagination={true}
                isLoading={isLoading || isFetching}
                isChekboxColumn={true}
                isFilesVisiable={true}
                onGridReady={onGridReady}
                getRowId={getRowId}
                rowSelection="single"
              />
            )}
          </div>
          <div className="h-full bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
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
