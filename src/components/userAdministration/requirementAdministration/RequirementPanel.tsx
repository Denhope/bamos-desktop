// @ts-nocheck

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Modal, Space, Switch, notification } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Split } from '@geoffcox/react-splitter';
import { ColDef, ColumnResizedEvent, GridReadyEvent } from 'ag-grid-community';
import { useDispatch, useSelector } from 'react-redux';

import RequirementForm from './RequirementForm';
import RequirementTree from './RequirementTree';
import AutoCompleteEditor from '@/components/shared/Table/ag-grid/AutoCompleteEditor';
import {
  useGetFilteredRequirementsQuery,
  useDeleteRequirementMutation,
  useUpdateRequirementMutation,
  useAddRequirementMutation,
} from '@/features/requirementAdministration/requirementApi';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { IRequirement } from '@/models/IRequirement';
import RequirementsDiscription from './RequirementsDiscription';
import {
  ValueEnumType,
  ValueEnumTypeTask,
  getStatusColor,
  getTaskTypeColor,
  transformToIRequirement,
} from '@/services/utilites';
import CircleRenderer from './CircleRenderer';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import { RootState } from '@/store';
import { setColumnWidthReq } from '@/store/reducers/columnWidthrReqlice';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';

interface AdminPanelProps {
  requirementsSearchValues?: any;
}

const RequirementPanel: React.FC<AdminPanelProps> = ({
  requirementsSearchValues,
}) => {
  const [editingRequirement, setEditingRequirement] =
    useState<IRequirement | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isTreeView, setIsTreeView] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const {
    data: requirements,
    isLoading,
    isFetching,
  } = useGetFilteredRequirementsQuery(
    {
      projectID: requirementsSearchValues?.projectID || '',
      projectTaskID: requirementsSearchValues?.projectTaskID || '',
      partNumberID: requirementsSearchValues?.partNumberID || '',
      reqTypesID: requirementsSearchValues?.reqTypesID || '',
      reqCodesID: requirementsSearchValues?.reqCodesID || '',
      startDate: requirementsSearchValues?.startDate || '',
      endDate: requirementsSearchValues?.endDate || '',
      status: requirementsSearchValues?.status || 'open',
      partRequestNumberNew: requirementsSearchValues?.partRequestNumber || '',
      neededOnID: requirementsSearchValues?.neededOnID || '',
      ifStockCulc: true,
      includeAlternates: true,
      WOReferenceID: requirementsSearchValues?.WOReferenceID || '',
      time: requirementsSearchValues?.time,
    },
    {
      skip: !requirementsSearchValues,
      refetchOnMountOrArgChange: true,
    }
  );

  const [addRequirement] = useAddRequirementMutation();
  const [updateRequirement] = useUpdateRequirementMutation();
  const [deleteRequirement] = useDeleteRequirementMutation({});
  const { data: partNumbers } = useGetPartNumbersQuery({});
  const columnWidths = useSelector((state: RootState) => state.columnWidthrReq);

  useEffect(() => {
    setEditingRequirement(null);
    setSelectedKeys([]);
  }, [requirementsSearchValues]);

  const handleCreate = () => {
    setEditingRequirement(null);
    setIsCreating(true);
  };

  const handleEdit = (requirement: IRequirement) => {
    setEditingRequirement(requirement);
  };

  const handleDelete = async (selectedKeys: string[]) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS REQUIREMENT?'),
      onOk: async () => {
        try {
          await deleteRequirement(selectedKeys).unwrap();
          notification.success({
            message: t('SUCCESSFULLY DELETED'),
            description: t('REQUIREMENT SUCCESSFULLY DELETED'),
          });
        } catch (error) {
          notification.error({
            message: t('FAILED '),
            description: 'ERROR DELETING REQUIREMENT',
          });
        }
      },
    });
  };

  const handleSubmit = async (requirement: IRequirement) => {
    try {
      if (editingRequirement) {
        await updateRequirement(requirement).unwrap();
        notification.success({
          message: t('SUCCESSFULLY UPDATED'),
          description: t('REQUIREMENT SUCCESSFULLY UPDATED'),
        });
      } else {
        await addRequirement({ requirement }).unwrap();
        notification.success({
          message: t('SUCCESSFULLY ADDED'),
          description: t('REQUIREMENT SUCCESSFULLY ADDED'),
        });
      }
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('ERROR SAVING REQUIREMENT'),
      });
    }
  };

  const valueEnumTask: ValueEnumTypeTask = {
    RC: t('TC'),
    CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
    NRC: t('NRC (DEFECT)'),
    NRC_ADD: t('ADHOC (ADHOC TASK)'),
    MJC: t('MJC'),
    CMJC: t('CMJC'),
    FC: t('FC'),
    HARD_ACCESS: t('HARD_ACCESS'),
  };

  const valueEnum: ValueEnumType = {
    onShort: t('ON SHORT'),
    onQuatation: t('QUATATION'),
    open: t('OPEN'),
    closed: t('CLOSE'),
    canceled: t('CANCEL'),
    onOrder: t('ON ORDER'),
    draft: t('DRAFT'),
    issued: t('ISSUED'),
    progress: t('IN PROGRESS'),
    complete: t('COMPLETE'),
    partlyClosed: t('PARTLY CLOSED'),
  };

  const columnRequirements = useMemo(
    () => [
      {
        field: 'readyStatus',
        headerName: ``,
        cellRenderer: CircleRenderer, // Использование кастомного рендерера
        width: 60,
        filter: false,
        cellRendererParams: {
          color: '', // Параметры, если необходимы
        },
        sortable: true, // Включение сортировки для этой колонки
        cellDataType: 'text',
        valueGetter: (params: any) => {
          // Определяет значение для фильтрации и сортировки
          const { data } = params;
          const availableQTY = data.availableQTY || 0;
          const amout = data.amout || 0;
          const bookedQuantity = data.bookedQuantity || 0;
          const reservationQTY = data.reservationQTY || 0;
          const availableAllStoreQTY = data.availableAllStoreQTY || 0;

          const requiredQty = amout - bookedQuantity;
          let color = '';

          if (availableQTY >= requiredQty || reservationQTY === amout) {
            color = 'green';
          } else if (
            availableQTY < requiredQty &&
            availableAllStoreQTY >= requiredQty
          ) {
            color = 'orange';
          } else if (availableQTY < requiredQty) {
            color = 'red';
          }

          return color;
        },
        comparator: (valueA: any, valueB: any) => {
          const colorOrder = { green: 1, orange: 2, red: 3 };
          const colorA = colorOrder[valueA] || 0;
          const colorB = colorOrder[valueB] || 0;

          if (colorA === colorB) return 0;
          return colorA < colorB ? -1 : 1;
        },
      },
      {
        field: 'partRequestNumberNew',
        headerName: `${t('REQUIREMENT No')}`,
        cellDataType: 'number',
        width: columnWidths['REQUIREMENT No'],
      },
      {
        field: 'status',
        headerName: `${t('Status')}`,
        cellDataType: 'text',
        width: columnWidths['Status'],
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
        headerName: `${t('TRACE No')}`,
        cellDataType: 'number',
        width: columnWidths['TRACE No'],
      },
      {
        field: 'taskNumber',
        headerName: `${t('TASK No')}`,
        cellDataType: 'text',
        width: columnWidths['TASK No'],
      },
      {
        field: 'taskType',
        headerName: `${t('TASK TYPE')}`,
        cellDataType: 'text',
        valueGetter: (params: {
          data: { taskType: keyof ValueEnumTypeTask };
        }) => params.data.taskType,
        valueFormatter: (params: { value: keyof ValueEnumTypeTask }) => {
          const status = params.value;
          return valueEnumTask[status] || '';
        },
        cellStyle: (params: { value: keyof ValueEnumTypeTask }) => ({
          backgroundColor: getTaskTypeColor(params.value),
          //// color: '#ffffff', // Text color
        }),
        width: columnWidths['TASK TYPE'],
      },

      {
        field: 'taskDescription',
        headerName: `${t('TASK DESCRIPTION')}`,
        cellDataType: 'text',
        width: columnWidths['TASK No'],
      },
      {
        field: 'WONumber',
        headerName: `${t('WO')}`,
        cellDataType: 'number',
        width: columnWidths['WO'],
      },
      {
        field: 'projectWO',
        headerName: `${t('WP')}`,
        cellDataType: 'number',
        width: columnWidths['WP'],
      },

      {
        headerName: `${t('PART No')}`,
        field: 'PART_NUMBER',
        editable: true,
        cellEditor: AutoCompleteEditor,
        cellEditorParams: {
          options: partNumbers,
        },
        width: columnWidths['PART No'],
      },
      {
        field: 'DESCRIPTION',
        headerName: `${t('DESCRIPTION')}`,
        cellDataType: 'text',
        width: columnWidths['PART No'],
      },
      {
        field: 'GROUP',
        headerName: `${t('GROUP')}`,
        cellDataType: 'text',
        width: columnWidths['PART No'],
      },
      {
        field: 'TYPE',
        headerName: `${t('TYPE')}`,
        cellDataType: 'text',
        editable: false,
        width: columnWidths['PART No'],
      },
      {
        field: 'amout',
        editable: false,
        cellDataType: 'number',
        headerName: `${t('QUANTITY')}`,
        width: columnWidths['PART No'],
      },
      {
        field: 'UNIT_OF_MEASURE',
        editable: false,
        filter: false,
        headerName: `${t('UNIT OF MEASURE')}`,
        cellDataType: 'text',
        width: columnWidths['PART No'],
      },
      {
        field: 'plannedDate',
        editable: false,
        cellDataType: 'date',
        headerName: `${t('PLANNED DATE')}`,
        width: columnWidths['PART No'],
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
        field: 'requestQuantity',
        width: columnWidths['PART No'],
        editable: false,
        cellDataType: 'number',
        headerName: `${t('REQUESTED QTY')}`,
      },
      {
        field: 'bookedQuantity',
        width: columnWidths['PART No'],
        editable: false,
        cellDataType: 'number',
        headerName: `${t('BOOKED QTY')}`,
      },
      {
        field: 'canceledQuantity',
        // width: columnWidths['PART No'],
        editable: false,
        cellDataType: 'number',
        headerName: `${t('CANCELED QTY')}`,
      },

      {
        field: 'reservationQTY',
        width: columnWidths['PART No'],
        editable: false,
        cellDataType: 'number',
        headerName: `${t('LINK QTY')}`,
      },
      {
        field: 'availableQTY',
        width: columnWidths['STOCK QTYo'],

        cellDataType: 'number',
        headerName: `${t('STOCK QTY')}`,
      },
      {
        field: 'availableAllStoreQTY',
        width: columnWidths['AVAIL ALL STORES QTY'],

        cellDataType: 'number',
        headerName: `${t('AVAIL ALL STORES QTY')}`,
      },
      {
        field: 'restrictedAllStoreQTY',
        width: columnWidths['RESRICTED ALL STORES QTY'],
        cellDataType: 'number',
        headerName: `${t('RESRICTED ALL STORES QTY')}`,
      },
      {
        field: 'pickSlipNumber',
        editable: false,
        cellDataType: 'number',
        headerName: `${t('PICKSLIP No')}`,
        width: columnWidths['PICKSLIP No'],
      },
      {
        field: 'neededOnIDTitle',
        editable: false,
        cellDataType: 'text',
        headerName: `${t('NEEDED ON')}`,
        width: columnWidths['NEEDED ON'],
      },
      // Добавьте другие колонки по необходимости
    ],
    [t, columnWidths]
  );

  const transformedRequirements = useMemo(() => {
    return (
      requirementsSearchValues && transformToIRequirement(requirements || [])
    );
  }, [requirementsSearchValues, requirements]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const saveColumnState = useCallback(
    (event: ColumnResizedEvent) => {
      if (event.columns) {
        event.columns.forEach((column) => {
          dispatch(
            setColumnWidthReq({
              field: column.getColId(),
              width: column.getActualWidth(),
            })
          );
        });
      }
    },
    [dispatch]
  );

  const restoreColumnState = useCallback(
    (event: GridReadyEvent) => {
      Object.keys(columnWidths).forEach((field) => {
        const column = event.columnApi.getColumn(field);
        if (column) {
          column.setActualWidth(columnWidths[field]);
        }
      });
    },
    [columnWidths]
  );

  return (
    <>
      <Space>
        <Col
          className="bg-white px-4 py-3 w-full rounded-md brequierement-gray-400"
          sm={24}
        >
          <RequirementsDiscription requirement={editingRequirement} />
        </Col>
      </Space>
      <Space className="">
        <Col>
          <PermissionGuard requiredPermissions={[Permission.ADD_REQUIREMENT]}>
            <Button
              size="small"
              icon={<PlusSquareOutlined />}
              onClick={handleCreate}
            >
              {t('ADD REQUIREMENT')}
            </Button>
          </PermissionGuard>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          <PermissionGuard
            requiredPermissions={[Permission.DELETE_REQUIREMENT]}
          >
            <Button
              disabled={!selectedKeys.length}
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(selectedKeys)}
            >
              {t('DELETE REQUIREMENT')}
            </Button>
          </PermissionGuard>
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
              <RequirementTree
                loading={isLoading || isFetching}
                onCompanySelect={(rowData: any) => handleEdit(rowData)}
                requirements={requirements || []}
              />
            ) : (
              <UniversalAgGrid
                // selectedRowId={
                //   editingRequirement?._id || editingRequirement?.id
                // }
                selectedRowId={selectedRowId}
                // rowSelection="single"
                gridId="requirementPanel"
                rowData={transformedRequirements}
                columnDefs={columnRequirements}
                onRowSelect={(selectedRows) => {
                  if (selectedRows.length > 0) {
                    handleEdit(selectedRows[0]);
                    setSelectedRowId(selectedRows[0]._id || selectedRows[0].id);
                  }
                }}
                onCellValueChanged={(params) => {
                  console.log('Cell value changed:', params);
                  // Здесь можно добавить логику обновления данных
                }}
                height="64vh"
                pagination={true}
                isLoading={isLoading}
                isChekboxColumn={true}
                onCheckItems={(selectedIds) => setSelectedKeys(selectedIds)}
                onGridReady={restoreColumnState}
              />
            )}
          </div>
          <div className="h-[78vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            <RequirementForm
              requierement={editingRequirement || undefined}
              onSubmit={handleSubmit}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default RequirementPanel;
