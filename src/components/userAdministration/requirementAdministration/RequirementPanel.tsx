// @ts-nocheck

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Col,
  Modal,
  message,
  Space,
  Spin,
  Switch,
  notification,
} from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';
import RequirementForm from './RequirementForm';
import RequirementTree from './RequirementTree';
import RequarementsList from '@/components/woAdministration/requirements/RequarementsList';
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
import { Split } from '@geoffcox/react-splitter';
import { ColDef, ColumnResizedEvent, GridReadyEvent } from 'ag-grid-community';
import {
  ValueEnumType,
  getStatusColor,
  transformToIRequirement,
} from '@/services/utilites';
import CircleRenderer from './CircleRenderer';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setColumnWidthReq } from '@/store/reducers/columnWidthrReqlice';
//@ts-nocheck
interface AdminPanelProps {
  requirementsSearchValues?: any;
}

const RequirementPanel: React.FC<AdminPanelProps> = ({
  requirementsSearchValues,
}) => {
  const [editingRequirement, setEditingRequirement] =
    useState<IRequirement | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
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
  const [isTreeView, setIsTreeView] = useState(false);
  const { data: partNumbers } = useGetPartNumbersQuery({});
  const { t } = useTranslation();
  useEffect(() => {
    setEditingRequirement(null);
    setSelectedKeys([]);
  }, [requirementsSearchValues]);
  const handleCreate = () => {
    setEditingRequirement(null);
    setIsCreating(true);
  };
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const columnWidths = useSelector((state: RootState) => state.columnWidthrReq);
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
      // setEditingRequirement(null);
    } catch (error) {
      message.error(t('ERROR SAVING REQUIREMENT'));
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
    onOrder: t('ON ORDER'),
    draft: t('DRAFT'),
    issued: t('ISSUED'),
    progress: t('IN PROGRESS'),
    complete: t('COMPLETE'),
    partlyClosed: t('PARTLY CLOSED'),
  };
  const dispatch = useDispatch();
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
          color: '#ffffff', // Text color
        }),
      },
      {
        field: 'projectTaskWO',
        headerName: `${t('TRACE No')}`,
        cellDataType: 'number',
        width: columnWidths['TRACE No'],
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
        const column = event.columnApi.getColumn(field, 'clientSide');
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
          <RequirementsDiscription
            requirement={editingRequirement}
          ></RequirementsDiscription>
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
              onClick={() => {
                // console.log(selectedKeys);
                handleDelete(selectedKeys);
              }}
            >
              {t('DELETE REQUIREMENT')}
            </Button>
          </PermissionGuard>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingRequirement && (
            <Button disabled size="small" icon={<MinusSquareOutlined />}>
              {t('COPY REQUIREMENT')}
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
              <RequirementTree
                loading={isLoading || isFetching}
                onCompanySelect={(rowData: any) => handleEdit(rowData)}
                requirements={requirements || []}
              />
            ) : (
              <RequarementsList
                isVisible={true}
                loading={isLoading || isFetching}
                pagination={true}
                isEditable={false}
                height={'64vh'}
                isAddVisiable={true}
                isChekboxColumn={true}
                isButtonVisiable={false}
                fetchData={transformedRequirements}
                columnDefs={columnRequirements}
                partNumbers={partNumbers || []}
                onRowSelect={(rowData: any) => handleEdit(rowData)}
                onDelete={function (reqID: string): void {}}
                onSave={function (rowData: IRequirement): void {}}
                onUpdateData={function (data: any[]): void {}}
                onCheckItems={function (selectedKeys: React.Key[]): void {
                  setSelectedKeys(selectedKeys);
                }}
                onColumnResized={saveColumnState}
                onGridReady={restoreColumnState}
              />
            )}
          </div>
          <div className="h-[78vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            <RequirementForm
              requierement={editingRequirement || undefined}
              onSubmit={handleSubmit}
              // onDelete={handleDelete}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default RequirementPanel;
