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
import { Button, Col, Divider, notification } from 'antd';
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
import dayjs from 'dayjs'; // Убедитесь, что dayjs импортирован

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

  const onCellValueChanged = useCallback(
    (params: any) => {
      const updatedRow = params.data;
      console.log(params);
      const updatedData = rowData.map((row) =>
        row._id === updatedRow._id ? updatedRow : row
      );
      setRowData(updatedData);
      onUpdateData(updatedData);
    },
    [rowData, onUpdateData]
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
      headerName: `${t('ДОСТУПНОЕ НА СКЛАДЕ')}`,
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
    console.log('issuedData:', issuedData);
    console.log('Form values:', values);

    const hasInvalidData = issuedData.some((item) => {
      if (item.requestQuantity === undefined || item.requestQuantity === null) {
        return true;
      }
      if (item.requestQuantity > item.amout - (item.bookedQuantity || 0)) {
        return true;
      }
      return false;
    });

    // if (hasInvalidData) {
    //   notification.error({
    //     message: t('ERROR'),
    //     description: t(
    //       'Invalid data in the table. Please check the issued quantities.'
    //     ),
    //   });
    //   // return false;
    // }

    try {
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
      return true;
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error creating pick slip or pick slip items.'),
      });
      return false;
    }
  };

  const handleAdditionalButtonClick = () => {
    // Действие при нажатии на дополнительную кнопку
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
      setOpenCreatePickSlip(true);
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
              isLoading={isLoading || isFetching || loading}
              isChekboxColumn={isChekboxColumn}
              isVisible={true}
              pagination={pagination}
              height={height}
              rowData={rowData}
              columnDefs={columnDefs}
              // onAddRow={onAddRow}
              // onDelete={onDelete}
              // onSave={handleSubmit}
              onCellValueChanged={onCellValueChanged}
              onRowSelect={handleRowSelect}
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
        onOpenChange={setOpenCreatePickSlip}
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
