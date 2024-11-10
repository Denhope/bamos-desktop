//@ts-nocheck
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
  ColDef,
  IRowNode,
  ColumnResizedEvent,
  ColumnMovedEvent,
  GridReadyEvent,
} from 'ag-grid-community';
import { IPartNumber } from '@/models/IUser';
import { useTranslation } from 'react-i18next';
import { Button, Col, Divider, notification, Select, DatePicker } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import {
  useAddRequirementMutation,
  useDeleteRequirementMutation,
  useGetFilteredRequirementsQuery,
  useUpdateRequirementMutation,
} from '@/features/requirementAdministration/requirementApi';
import { IRequirement } from '@/models/IRequirement';
import {
  ModalForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-components';
import { transformToIRequirement } from '@/services/utilites';
import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
import { useGetGroupUsersQuery } from '@/features/userAdministration/userApi';
import IssuedList from './IssuedList';
import { useAddPickSlipMutation } from '@/features/pickSlipAdministration/pickSlipApi';
import { useAddPickSlipItemMutation } from '@/features/pickSlipAdministration/pickSlipItemsApi';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';
import dayjs from 'dayjs';
import { ICellEditorParams } from 'ag-grid-community';

type ExampleComponentProps = {
  columnDefs: ColDef[];
  partNumbers: IPartNumber[] | [];
  taskId?: string;
  fetchData?: any[] | [];
  onUpdateData: (data: any[]) => void;
  isTool?: string;
  isAddVisiable?: boolean;
  isButtonVisiable?: boolean;
  isVisible?: boolean;
  isButtonColumn?: boolean;
  isChekboxColumn?: boolean;
  height: string;
  isEditable?: boolean;
  pagination?: boolean;
  onRowSelect?: (rowData: IRequirement) => void;
  onCheckItems: (selectedKeys: React.Key[]) => void;
  onCheakIds?: (selectedKeys: React.Key[]) => void;
  onDelete: (reqID: string) => void;
  onSave: (rowData: IRequirement) => void;
  order?: any;
  isIssueVisibale?: boolean;
  loading?: boolean;
  onColumnResized: (event: ColumnResizedEvent) => void;
  onColumnMoved: (event: ColumnMovedEvent) => void;
  onGridReady: (event: GridReadyEvent) => void;
  columnState: { [key: string]: { width: number; order: number } };
};

const PartNumberEditor = (props: ICellEditorParams) => {
  const [value, setValue] = useState(props.value);
  const refContainer = useRef(null);

  useEffect(() => {
    if (refContainer.current) {
      refContainer.current.focus();
    }
  }, []);

  const onChangeHandler = (newValue: string) => {
    setValue(newValue);
    if (props.onValueChange) {
      props.onValueChange({
        ...props.data,
        PART_NUMBER: newValue,
      });
    }
  };

  return (
    <Select
      ref={refContainer}
      style={{ width: '100%' }}
      value={value}
      onChange={onChangeHandler}
      options={props.partNumbers.map((part) => ({
        value: part.PART_NUMBER,
        label: `${part.PART_NUMBER} - ${part.DESCRIPTION}`,
      }))}
      showSearch
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
    />
  );
};

const DateEditor = (props: ICellEditorParams) => {
  const [value, setValue] = useState(props.value ? dayjs(props.value) : null);
  const refContainer = useRef(null);

  useEffect(() => {
    if (refContainer.current) {
      refContainer.current.focus();
    }
  }, []);

  const onChangeHandler = (date: dayjs.Dayjs | null) => {
    setValue(date);
    if (props.onValueChange) {
      props.onValueChange({
        ...props.data,
        plannedDate: date ? date.toISOString() : null,
      });
    }
  };

  return (
    <DatePicker
      ref={refContainer}
      style={{ width: '100%' }}
      value={value}
      onChange={onChangeHandler}
    />
  );
};

const RequarementsList: React.FC<ExampleComponentProps> = ({
  columnDefs,

  fetchData,
  onUpdateData,

  isChekboxColumn,

  height,

  onRowSelect,
  onCheckItems,
  loading,
  pagination,
  onDelete,
  onSave,
  order,
  partNumbers,
  onCheakIds,
}) => {
  const { t } = useTranslation();

  const [rowData, setRowData] = useState<any[]>([]);
  const [issuedData, setIssuedRowData] = useState<any[]>([]);
  const [addRequirement] = useAddRequirementMutation();
  const [updateRequirement] = useUpdateRequirementMutation();
  const [deleteRequirement] = useDeleteRequirementMutation();
  const [addPickSlip] = useAddPickSlipMutation({});
  const [addPickSlipItem] = useAddPickSlipItemMutation({});
  const [isAdditionalButtonDisabled, setIsAdditionalButtonDisabled] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (fetchData && fetchData.length > 0) {
      setRowData(fetchData);
      onUpdateData(fetchData);
      setSelectedKeysRequirements([]);
      setStepsSelected([]);
    } else {
      setRowData([]);
    }
  }, [fetchData, onUpdateData]);

  const handleSubmit = useCallback(
    async (taskPart: any) => {
      try {
        if (!taskPart.partId || !taskPart.amout) {
          notification.error({
            message: t('ERROR'),
            description: t(
              'All fields must be filled and quantity must be greater than zero.'
            ),
          });
          return;
        }

        const reqData = {
          status: taskPart.createUserID ? 'open' : 'open', // Проверить логику, какой статус у новой записи
          plannedDate: taskPart?.plannedDate,
          projectID: order.projectID,
          projectTaskID: order.id,
          group: taskPart.GROUP,
          type: taskPart.TYPE,
          partNumberID: taskPart.partId,
          partNumber: taskPart.PART_NUMBER,
          description: taskPart.DESCRIPTION,
          amout: taskPart.amout,
        };

        if (taskPart.createUserID) {
          await updateRequirement({
            ...reqData,
            _id: taskPart._id,
            id: taskPart._id,
          }).unwrap();
          notification.success({
            message: t('PART SUCCESSFULLY UPDATED'),
            description: t('The step has been successfully updated.'),
          });
        } else {
          await addRequirement({
            requirement: reqData,
          }).unwrap();
          notification.success({
            message: t('PART SUCCESSFULLY ADDED'),
            description: t('The part has been successfully added.'),
          });
        }
      } catch (error) {
        notification.error({
          message: t('ERROR'),
          description: t('Error saving part.'),
        });
      }
    },
    [t, addRequirement, updateRequirement, order]
  );

  const onAddRow = useCallback(() => {
    const newRow = {
      _id: Date.now().toString(),
      PART_NUMBER: '',
      DESCRIPTION: '',
      GROUP: '',
      TYPE: '',
      amout: 0,
      projectID: order.projectID,
      projectTaskID: order.id,
      status: 'open',
    };
    const updatedData = [...rowData, newRow];
    setRowData(updatedData);
    onUpdateData(updatedData);
  }, [rowData, order, onUpdateData]);

  const handleUpdateRequirement = useCallback(
    async (data: any) => {
      console.log('Updating requirement:', data);
      try {
        const response = await updateRequirement({
          _id: data._id,
          id: data._id,
          plannedDate: data.plannedDate,
          amout: data.amout,
          partNumberID: data.partNumberID,
          PART_NUMBER: data.PART_NUMBER,
          DESCRIPTION: data.DESCRIPTION,
          GROUP: data.GROUP,
          TYPE: data.TYPE,
          UNIT_OF_MEASURE: data.UNIT_OF_MEASURE,
        }).unwrap();
        console.log('Update response:', response);
        notification.success({
          message: t('REQUIREMENT UPDATED'),
          description: t('The requirement has been successfully updated.'),
        });
      } catch (error) {
        console.error('Update error:', error);
        notification.error({
          message: t('ERROR'),
          description: t('Failed to update the requirement.'),
        });
        // Откат изменений в случае ошибки
        const originalData = rowData.find((row) => row._id === data._id);
        if (originalData) {
          const revertedData = rowData.map((row) =>
            row._id === data._id ? originalData : row
          );
          setRowData(revertedData);
          onUpdateData(revertedData);
        }
      }
    },
    [updateRequirement, t, rowData, setRowData, onUpdateData]
  );

  const handlePartNumberChange = useCallback(
    (updatedRow: any) => {
      console.log('Part number changed:', updatedRow);

      const selectedPart = partNumbers.find(
        (part) => part.PART_NUMBER === updatedRow.PART_NUMBER
      );

      if (selectedPart) {
        const newUpdatedRow = {
          ...updatedRow,
          partNumberID: selectedPart._id,
          DESCRIPTION: selectedPart.DESCRIPTION,
          GROUP: selectedPart.GROUP,
          TYPE: selectedPart.TYPE,
          UNIT_OF_MEASURE: selectedPart.UNIT_OF_MEASURE,
          partId: selectedPart._id,
          QUANTITY: selectedPart?.QUANTITY || selectedPart?.quantity || 0,
        };

        // Обновляем локальное состояние
        const updatedData = rowData.map((row) =>
          row._id === newUpdatedRow._id ? newUpdatedRow : row
        );
        setRowData(updatedData);
        onUpdateData(updatedData);

        // Отправляем обновление на сервер
        if (newUpdatedRow.status === 'open') {
          console.log(
            'Calling handleUpdateRequirement from handlePartNumberChange'
          );
          handleUpdateRequirement(newUpdatedRow);
        }
      }
    },
    [partNumbers, rowData, setRowData, onUpdateData, handleUpdateRequirement]
  );

  const onCellValueChanged = useCallback(
    (params: any) => {
      const { data: updatedRow, colDef } = params;
      console.log('Global onCellValueChanged:', params);

      // Обновляем локальное состояние
      const updatedData = rowData.map((row) =>
        row._id === updatedRow._id ? updatedRow : row
      );
      setRowData(updatedData);
      onUpdateData(updatedData);

      // Отправляем обновление на сервер для открытых требований
      if (
        updatedRow.status === 'open' &&
        (colDef.field === 'plannedDate' ||
          colDef.field === 'amout' ||
          colDef.field === 'PART_NUMBER')
      ) {
        console.log('Calling handleUpdateRequirement from onCellValueChanged');
        handleUpdateRequirement(updatedRow);
      }
    },
    [rowData, onUpdateData, handleUpdateRequirement]
  );

  const [selectedKeysRequirements, setSelectedKeysRequirements] = useState<
    React.Key[]
  >([]);
  const [stepsSelected, setStepsSelected] = useState<React.Key[]>([]);
  const handleRowSheck = (keys: any) => {
    console.log(keys);
    setStepsSelected(keys);
    onCheakIds && onCheakIds(keys);
  };
  const handleRowSelect = (data: any) => {
    onRowSelect && onRowSelect(data);
    console.log(data);
  };
  const [selectedStoreID, setSelectedStoreID] = useState<any | undefined>(
    undefined
  );

  const { data: usersGroups } = useGetGroupUsersQuery({});
  const neededCodesValueEnum: Record<string, string> =
    usersGroups?.reduce((acc, usersGroup) => {
      acc[usersGroup.id] = usersGroup.title;
      return acc;
    }, {}) || {};
  const columnRequirements = [
    {
      field: 'partRequestNumberNew',
      headerName: `${t('REQUIREMENT No')}`,
      cellDataType: 'number',
    },

    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: false,
    },
    {
      field: 'DESCRIPTION',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'amout',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('QTY')}`,
    },
    {
      field: 'requestQuantity',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('REQUESTED QTY')}`,
    },
    {
      field: 'canceledQuantity',
      // width: columnWidths['PART No'],
      editable: false,
      cellDataType: 'number',
      headerName: `${t('CANCELED QTY')}`,
    },
    {
      field: 'bookedQuantity',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('ALREADY BOOKED QTY')}`,
    },
    {
      field: 'toBookedQuantity',
      editable: true,
      cellDataType: 'number',
      headerName: `${t('TO BOOK QTY')}`,
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
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
      field: 'availableQTY',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('AVAILABLE QTY')}`,
    },
    // {
    //   field: 'WONumber',
    //   headerName: `${t('WO')}`,
    //   cellDataType: 'text',
    // },
    // {
    //   field: 'projectWO',
    //   headerName: `${t('WP')}`,
    //   cellDataType: 'text',
    // },
    // {
    //   field: 'projectTaskWO',
    //   headerName: `${t('TRACE No')}`,
    //   cellDataType: 'text',
    // },
  ];
  const [createPickSlip, setOpenCreatePickSlip] = useState<boolean>(false);
  let storesIDString = '';
  if (Array.isArray(order?.projectID?.storesID)) {
    storesIDString = order?.projectID.storesID.join(',');
  }
  const {
    data: requirements,
    isLoading,
    isFetching,
    refetch,
  } = useGetFilteredRequirementsQuery(
    {
      projectTaskID: order?.id,
      ifStockCulc: true,
      includeAlternates: true,
    },
    {
      skip: !order?.id,
    }
  );
  const { data: stores } = useGetStoresQuery(
    {
      ids: storesIDString,
    },
    {
      skip: !order?.projectID?.storesID,
    }
  );
  const storeCodesValueEnum: Record<string, string> =
    stores?.reduce((acc, mpdCode) => {
      if (mpdCode.id && mpdCode.storeShortName) {
        acc[mpdCode.id] = `${String(mpdCode.storeShortName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};

  const transformedRequirements = useMemo(() => {
    return transformToIRequirement(requirements || []);
  }, [requirements]);
  const [isTreeView, setIsTreeView] = useState(false);
  const handleStoreChange = (value: string) => {
    setSelectedStoreID(value);
  };

  const filteredRequirements = useMemo(() => {
    return transformedRequirements.filter((req) =>
      stepsSelected.includes(req._id)
    );
  }, [transformedRequirements, stepsSelected]);

  const handleSubmitModal = async (values: any) => {
    if (isSubmitting) return false; // Предотвращаем повторную отправку
    
    setIsSubmitting(true); // Устанавливаем флаг отправки
    
    try {
      console.log('issuedData:', issuedData);
      console.log('Form values:', values);

      const hasInvalidData = issuedData.some((item) => {
        if (!item.toBookedQuantity || item.toBookedQuantity <= 0) {
          return true;
        }

        const remainingQuantity =
          item.amout - (item.bookedQuantity || 0) + (item.canceledQuantity || 0);

        if (item.toBookedQuantity > remainingQuantity) {
          return true;
        }

        return false;
      });

      if (hasInvalidData) {
        notification.error({
          message: t('ERROR'),
          description: t(
            'Invalid data in the table. Please check the quantities. The requested quantity cannot exceed available amount (including canceled quantities) minus already booked quantities.'
          ),
        });
        return false;
      }

      const pickSlipResponse = await addPickSlip({
        pickSlipItem: {
          neededOnID: values.neededOnID,
          getFromID: values.getFromID,
          plannedDate: values.plannedDate,
          state: 'issued',
          type: 'partRequest',
        },
        projectID: order?.projectID?._id,
        projectTaskID: order?.id,
      }).unwrap();

      const pickSlipID = pickSlipResponse?.id || pickSlipResponse?._id;

      for (const item of issuedData) {
        await addPickSlipItem({
          pickSlipID,
          pickSlipItem: {
            partNumberID: item.partNumberID,
            requestedQty: item.toBookedQuantity,
            neededOnID: values.neededOnID,
            getFromID: values.getFromID,
            plannedDate: values.plannedDate,

            state: 'issued',
            type: 'partRequest',
          },
          requirementID: item?._id,
          projectID: order?.projectID?._id,
          projectTaskID: order?.id,
        }).unwrap();
        if (item) {
          console.log(item);
          await updateRequirement({
            requestQuantity: item.toBookedQuantity,
            status: 'issued',
            _id: item._id,
            id: item._id,
            pickSlipID: pickSlipID,
            neededOnID: values.neededOnID,
          }).unwrap();
        }
      }
      refetch();
      notification.success({
        message: t('PICKSLIP SUCCESSFULLY CREATED'),
        description: t('The step has been successfully updated.'),
      });

      setIssuedRowData([]);
      setOpenCreatePickSlip(false); // Закрываем модальное окно после успешного создания
      return true;
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error creating pick slip or pick slip items.'),
      });
      return false;
    } finally {
      setIsSubmitting(false); // Сбрасываем флаг отправки независимо от результата
    }
  };

  const handleAdditionalButtonClick = () => {
    // Действие при нажатии на дополнительну кноку
    const hasClosedOrCanceled = filteredRequirements.some(
      (req) => req.status === 'closed' || req.status === 'canceled'
    );

    if (hasClosedOrCanceled) {
      notification.warning({
        message: t('WARNING'),
        description: t(
          'Some requirements have a status of closed or canceled.'
        ),
      });
      // setOpenCreatePickSlip(true);
    } else {
      setOpenCreatePickSlip(true);
    }
  };

  // Пример использования: деактивировать кнопку, если нет выбранных строк
  useEffect(() => {
    setIsAdditionalButtonDisabled(
      stepsSelected.length === 0 ||
        order.status == 'closed' ||
        order.status == 'cancelled' ||
        order.status == 'deleted'
    );
  }, [stepsSelected]);

  const handleCellDoubleClicked = useCallback((params: any) => {
    const { colDef, data } = params;
    if (
      data.status === 'open' &&
      (colDef.field === 'plannedDate' || colDef.field === 'amout')
    ) {
      params.api.startEditingCell({
        rowIndex: params.rowIndex,
        colKey: colDef.field,
      });
    }
  }, []);

  const handleCellKeyDown = useCallback((params: any) => {
    if (params.event.key === 'Enter') {
      params.api.stopEditing();
      handleUpdateRequirement(params.data);
    }
  }, []);

  const handleDateChange = useCallback(
    (updatedRow: any) => {
      console.log('Date changed:', updatedRow);

      // Обновляем локальное состояние
      const updatedData = rowData.map((row) =>
        row._id === updatedRow._id ? updatedRow : row
      );
      setRowData(updatedData);
      onUpdateData(updatedData);

      // Отправляем обновление на сервер
      if (updatedRow.status === 'open') {
        console.log('Calling handleUpdateRequirement from handleDateChange');
        handleUpdateRequirement(updatedRow);
      }
    },
    [rowData, setRowData, onUpdateData, handleUpdateRequirement]
  );

  const updatedColumnDefs = useMemo(
    () =>
      columnDefs.map((col) => {
        if (col.field === 'PART_NUMBER') {
          return {
            ...col,
            editable: (params) => params.data.status === 'open',
            cellEditor: PartNumberEditor,
            cellEditorParams: {
              partNumbers: partNumbers,
              onValueChange: handlePartNumberChange,
            },
          };
        }
        if (col.field === 'plannedDate') {
          return {
            ...col,
            editable: (params) => params.data.status === 'open',
            cellEditor: DateEditor,
            cellEditorParams: {
              onValueChange: handleDateChange,
            },
            valueFormatter: (params: any) => {
              if (!params.value) return '';
              return dayjs(params.value).format('DD.MM.YYYY');
            },
          };
        }
        if (col.field === 'amout') {
          return {
            ...col,
            editable: (params) => params.data.status === 'open',
            cellEditor: 'numberCellEditor',
          };
        }
        return col;
      }),
    [columnDefs, partNumbers, handlePartNumberChange, handleDateChange]
  );

  return (
    <div style={{ width: '100%', height }} className="flex flex-col gap-5">
      {/* {isIssueVisibale && (
        <Col style={{ textAlign: 'right' }}>
          <PermissionGuard requiredPermissions={[Permission.ADD_REQUIREMENT]}>
            <Button
              onClick={() => {
                const hasClosedOrCanceled = filteredRequirements.some(
                  (req) => req.status === 'closed' || req.status === 'canceled'
                );

                if (hasClosedOrCanceled) {
                  notification.warning({
                    message: t('WARNING'),
                    description: t(
                      'Some requirements have a status of closed or canceled.'
                    ),
                  });
                } else {
                  setOpenCreatePickSlip(true);
                }
              }}
              disabled={
                !stepsSelected?.length ||
                order.status == 'closed' ||
                order.status == 'cancelled' ||
                order.status == 'deleted'
              }
              size="small"
              icon={<ShoppingCartOutlined />}
            >
              {t('ISSUE PARTS')}
            </Button>
          </PermissionGuard>
        </Col>
      )} */}
      <div style={{ width: '100%', height }}>
        <div style={{ height, width: '100%' }} className="ag-theme-alpine">
          <PermissionGuard requiredPermissions={[Permission.ADD_REQUIREMENT]}>
            <UniversalAgGrid
              gridId="requirementsList"
              isLoading={isLoading}
              isChekboxColumn={isChekboxColumn}
              isVisible={true}
              pagination={pagination}
              height={height}
              rowData={rowData}
              columnDefs={updatedColumnDefs}
              onCellValueChanged={onCellValueChanged}
              onRowSelect={handleRowSelect}
              onCellDoubleClicked={handleCellDoubleClicked}
              onCellKeyDown={handleCellKeyDown}
              additionalButton={{
                text: t('ISSUE PARTS'),
                onClick: handleAdditionalButtonClick,
                disabled: isAdditionalButtonDisabled,
              }}
              onCheckItems={(selectedKeys) => {
                onCheakIds && onCheakIds(selectedKeys);
                setStepsSelected(selectedKeys);
                console.log(selectedKeys);
              }}
            />
          </PermissionGuard>
        </div>
      </div>

      <ModalForm
        onFinish={async (values) => {
          const result = await handleSubmitModal(values);
          return result;
        }}
        title={`${t('CREATE PICKSLIP')}`}
        open={createPickSlip}
        width={'80vw'}
        onOpenChange={(visible) => {
          if (!visible) {
            setIsSubmitting(false); // Сбрасываем флаг при закрытии модального окна
          }
          setOpenCreatePickSlip(visible);
        }}
        submitter={{
          submitButtonProps: {
            disabled: isSubmitting, // Деактивируем кнопку отправки во время обработки
            loading: isSubmitting, // Добавляем индикатор загрузки
          },
        }}
      >
        <ProFormGroup>
          <ProFormSelect
            showSearch
            rules={[{ required: true }]}
            name="getFromID"
            label={t('FROM STORE')}
            width="lg"
            valueEnum={storeCodesValueEnum || []}
            onChange={handleStoreChange}
          />
          <ProFormSelect
            showSearch
            rules={[{ required: true }]}
            name="neededOnID"
            label={t('NEEDED ON')}
            width="sm"
            valueEnum={neededCodesValueEnum || []}
          />
          <ProFormDatePicker
            name="plannedDate"
            label={t('PLANNED DATE')}
            width="md"
            rules={[
              { required: true, message: t('Please select a planned date') },
            ]}
            initialValue={dayjs()} // Устанавливаем начальное значение как сегодняшнюю дату
          />
        </ProFormGroup>

        <Divider />
        <IssuedList
          isAddVisible={true}
          fetchData={filteredRequirements}
          columnDefs={columnRequirements}
          onUpdateData={function (data: any[]): void {
            setIssuedRowData(data);
          }}
          height={'38Vh'}
          partNumbers={[]}
        />
      </ModalForm>
    </div>
  );
};

export default RequarementsList;
