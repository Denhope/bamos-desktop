//@ts-check

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, notification, Select, InputNumber, DatePicker, Popconfirm, Space, Modal, Form, Tooltip } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useAddRequirementMutation, useUpdateRequirementMutation } from '@/features/requirementAdministration/requirementApi';
import { useAddPickSlipMutation } from '@/features/pickSlipAdministration/pickSlipApi';
import { useAddPickSlipItemMutation } from '@/features/pickSlipAdministration/pickSlipItemsApi';
import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
import { useGetGroupUsersQuery } from '@/features/userAdministration/userApi';
import { useGetFilteredRequirementsQuery } from '@/features/requirementAdministration/requirementApi';
import { IPartNumber } from '@/models/IUser';
import dayjs from 'dayjs';
import { DeleteOutlined, SaveOutlined, PlusOutlined, ClearOutlined, SendOutlined } from '@ant-design/icons';
import { useGetAvailableQuantityQuery } from '@/features/stockAdministration/stockApi';

interface BulkRequirementCreatorProps {
  partNumbers: IPartNumber[];
  order: any;
  onRequirementsCreated: () => void;
}

interface AvailableQuantity {
  totalQuantity: number;
  storeAvailableQTY: Array<{ storeName: string; availableQTY: number }>;
  unitOfMeasure: string;
}

const BulkRequirementCreator: React.FC<BulkRequirementCreatorProps> = ({
  partNumbers,
  order,
  onRequirementsCreated,
}) => {
  const { t } = useTranslation();
  const [updateRequirement] = useUpdateRequirementMutation();
  const [addRequirement] = useAddRequirementMutation();
  const [addPickSlip] = useAddPickSlipMutation();
  const [addPickSlipItem] = useAddPickSlipItemMutation();
  const [rowData, setRowData] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { data: stores } = useGetStoresQuery(
    { ids: order?.projectID?.storesID?.join(',') },
    { skip: !order?.projectID?.storesID }
  );

  const { data: usersGroups } = useGetGroupUsersQuery({});

  const { data: requirements } = useGetFilteredRequirementsQuery(
    {
      projectTaskID: order?.id,
      ifStockCulc: true,
      includeAlternates: true,
    },
    {
      skip: !order?.id,
    }
  );

  const storeOptions = useMemo(() => 
    stores?.map(store => ({ label: store.storeShortName, value: store.id })) || [],
    [stores]
  );

  const userOptions = useMemo(() => 
    usersGroups?.map(group => ({ label: group.title, value: group.id })) || [],
    [usersGroups]
  );

  useEffect(() => {
    const savedData = localStorage.getItem(`bulkRequirements_${order.id}`);
    if (savedData) {
      setRowData(JSON.parse(savedData));
    } else {
      setRowData([{ id: Date.now() }]);
    }
  }, [order.id]);

  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem(`bulkRequirements_${order.id}`, JSON.stringify(rowData));
    notification.success({
      message: t('SAVED'),
      description: t('Data has been saved to local storage'),
    });
  }, [rowData, order.id, t]);

  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem(`bulkRequirements_${order.id}`);
  }, [order.id]);

  const PartNumberSelector = (props: any) => {
    const onValueChange = (value: string) => {
      const selectedPart = partNumbers.find(part => part._id === value);
      if (selectedPart) {
        const updatedData = rowData.map(row => 
          row.id === props.data.id ? { 
            ...row, 
            PART_NUMBER: value,
            DESCRIPTION: selectedPart.DESCRIPTION,
            UNIT_OF_MEASURE: selectedPart.UNIT_OF_MEASURE
          } : row
        );
        setRowData(updatedData);
      }
    };

    return (
      <Select
        showSearch
        style={{ width: '100%' }}
        value={props.value}
        onChange={onValueChange}
        options={partNumbers.map(part => ({ label: part.PART_NUMBER, value: part._id }))}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        status={!props.value ? 'error' : undefined}
      />
    );
  };

  const QuantityEditor = (props: any) => {
    return (
      <InputNumber
        style={{ width: '100%' }}
        value={props.value}
        onChange={(value) => {
          const updatedData = rowData.map(row => 
            row.id === props.data.id ? { ...row, amout: value } : row
          );
          setRowData(updatedData);
        }}
        status={!props.value ? 'error' : undefined}
      />
    );
  };

  const DateEditor = (props: any) => {
    return (
      <DatePicker
        style={{ width: '100%' }}
        value={props.value ? dayjs(props.value) : null}
        onChange={(date) => {
          const updatedData = rowData.map(row => 
            row.id === props.data.id ? { ...row, plannedDate: date ? date.toDate() : null } : row
          );
          setRowData(updatedData);
        }}
        status={!props.value ? 'error' : undefined}
      />
    );
  };

  const DeleteButton = (props: any) => {
    const onClick = () => {
      const updatedData = rowData.filter(row => row.id !== props.data.id);
      setRowData(updatedData);
    };

    return (
      <Popconfirm
        title={t('Are you sure you want to delete this row?')}
        onConfirm={onClick}
        okText={t('Yes')}
        cancelText={t('No')}
      >
        <Button icon={<DeleteOutlined />} danger />
      </Popconfirm>
    );
  };

  const AvailabilityIndicator = (props: any) => {
    const { data: availableQuantity, isLoading } = useGetAvailableQuantityQuery({
      companyID: order.companyID,
      partNumberID: props.value,
      storeID: order.projectID?.storesID?.join(','),
      isAlternative: true,
      isAllExpDate: false,
    }, {
      skip: !props.value,
    }) as { data: AvailableQuantity | undefined, isLoading: boolean };

    if (isLoading) {
      return <span>Loading...</span>;
    }

    const totalQty = availableQuantity?.totalQuantity || 0;
    const requestedQty = props.data.amout || 0;

    let color = 'red';
    if (totalQty > 0) color = 'yellow';
    if (totalQty >= requestedQty) color = 'green';

    const tooltipContent = (
      <div>
        <div>Total: {totalQty}</div>
        {availableQuantity?.storeAvailableQTY.map((store, index) => (
          <div key={index}>{`${store.storeName}: ${store.availableQTY}`}</div>
        ))}
      </div>
    );

    return (
      <Tooltip title={tooltipContent}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: color,
          }}></div>
          <span>{`${totalQty} ${availableQuantity?.unitOfMeasure || ''}`}</span>
        </div>
      </Tooltip>
    );
  };

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      headerName: t('PART No'),
      field: 'PART_NUMBER',
      cellRenderer: PartNumberSelector,
      cellStyle: (params) => {
        if (!params.value) {
          return { backgroundColor: '#ffcccb' };
        }
      },
      width: 300, // Увеличиваем ширину колонки до 300
      flex: 3, // Увеличиваем flex-коэффициент до 3
    },
    {
      headerName: t('DESCRIPTION'),
      field: 'DESCRIPTION',
      editable: false,
      flex: 3, // Увеличиваем flex-коэффициент для описания
    },
    {
      headerName: t('QUANTITY'),
      field: 'amout',
      cellRenderer: QuantityEditor,
      cellStyle: (params) => {
        if (!params.value) {
          return { backgroundColor: '#ffcccb' };
        }
      },
      width: 120,
    },
    {
      headerName: t('UNIT OF MEASURE'),
      field: 'UNIT_OF_MEASURE',
      editable: false,
      width: 150,
    },
    {
      headerName: t('PLANNED DATE'),
      field: 'plannedDate',
      cellRenderer: DateEditor,
      valueFormatter: (params: any) => {
        return params.value ? dayjs(params.value).format('YYYY-MM-DD') : '';
      },
      cellStyle: (params) => {
        if (!params.value) {
          return { backgroundColor: '#ffcccb' };
        }
      },
      width: 260, // Увеличиваем ширину колонки с датой
      flex: 2, // Увеличиваем flex-коэффициент до 3
    },
    {
      headerName: t('AVAILABILITY'),
      field: 'PART_NUMBER',
      cellRenderer: AvailabilityIndicator,
      width: 150,
    },
    {
      headerName: t('ACTIONS'),
      field: 'actions',
      cellRenderer: DeleteButton,
      width: 100,
    },
  ], [t, partNumbers, rowData]);

  const addRow = useCallback(() => {
    setRowData(prev => [...prev, { id: Date.now() }]);
  }, []);

  const resetAll = useCallback(() => {
    setRowData([{ id: Date.now() }]);
    clearLocalStorage();
    notification.info({
      message: t('RESET'),
      description: t('All data has been reset and cleared from local storage'),
    });
  }, [clearLocalStorage, t]);

  const validateRows = useCallback((rows: any[]) => {
    return rows.every(row => row.PART_NUMBER && row.amout && row.plannedDate);
  }, []);

  const createRequirements = useCallback(async () => {
    const validRows = rowData.filter(row => row.PART_NUMBER && row.amout && row.plannedDate);
    if (validRows.length === 0 || !validateRows(validRows)) {
      notification.warning({
        message: t('WARNING'),
        description: t('Please fill in all required fields for each row'),
      });
      return;
    }

    try {
      for (const row of validRows) {
        const selectedPart = partNumbers.find(part => part._id === row.PART_NUMBER);
        await addRequirement({
          requirement: {
            status: 'open',
            plannedDate: row.plannedDate,
            projectID: order.projectID,
            projectTaskID: order.id,
            group: selectedPart?.GROUP,
            type: selectedPart?.TYPE,
            partNumberID: row.PART_NUMBER,
            partNumber: selectedPart?.PART_NUMBER,
            description: selectedPart?.DESCRIPTION,
            amout: row.amout,
            unit: row.UNIT_OF_MEASURE,
          },
        }).unwrap();
      }
      notification.success({
        message: t('SUCCESS'),
        description: t('Requirements have been successfully created'),
      });
      setRowData([{ id: Date.now() }]);
      clearLocalStorage();
      onRequirementsCreated();
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Failed to create requirements'),
      });
    }
  }, [rowData, partNumbers, order, addRequirement, t, onRequirementsCreated, clearLocalStorage, validateRows]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      await createRequirementsAndPickSlip(values);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const createRequirementsAndPickSlip = useCallback(async (modalValues: any) => {
    const validRows = rowData.filter(row => row.PART_NUMBER && row.amout && row.plannedDate);
    if (validRows.length === 0 || !validateRows(validRows)) {
      notification.warning({
        message: t('WARNING'),
        description: t('Please fill in all required fields for each row'),
      });
      return;
    }

    try {
      const pickSlipResponse = await addPickSlip({
        pickSlipItem: {
          neededOnID: modalValues.neededOnID,
          getFromID: modalValues.getFromID,
          plannedDate: modalValues.plannedDate.toDate(),
          state: 'open',
          type: 'partRequest',
        },
        projectID: order.projectID,
        projectTaskID: order.id,
      }).unwrap();

      const pickSlipID = pickSlipResponse.id;

      for (const row of validRows) {
        const selectedPart = partNumbers.find(part => part._id === row.PART_NUMBER);
        const requirement = await addRequirement({
          requirement: {
            status: 'open',
            plannedDate: row.plannedDate,
            projectID: order.projectID,
            projectTaskID: order.id,
            group: selectedPart?.GROUP,
            type: selectedPart?.TYPE,
            partNumberID: row.PART_NUMBER,
            partNumber: selectedPart?.PART_NUMBER,
            description: selectedPart?.DESCRIPTION,
            amout: row.amout,
            unit: row.UNIT_OF_MEASURE,
            neededOnID: modalValues.neededOnID,
          },
        }).unwrap();

        await addPickSlipItem({
          pickSlipID,
          pickSlipItem: {
            partNumberID: row.PART_NUMBER,
            requestedQty: row.amout,
            neededOnID: modalValues.neededOnID,
            getFromID: modalValues.getFromID,
            plannedDate: modalValues.plannedDate.toDate(),
            requirementID: requirement.id,
            state: 'open',
            type: 'partRequest',
          },
          projectID: order.projectID,
          projectTaskID: order.id,
        }).unwrap();

        // Обновляем поребность после создания пикслипа
        await updateRequirement({
          requestQuantity: row.amout,
          status: 'issued',
          _id: requirement.id,
          id: requirement.id,
          pickSlipID: pickSlipID,
          neededOnID: modalValues.neededOnID,
        }).unwrap();
      }

      notification.success({
        message: t('SUCCESS'),
        description: t('Requirements have been created and sent to the warehouse'),
      });
      setRowData([{ id: Date.now() }]);
      clearLocalStorage();
      onRequirementsCreated();
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Failed to create requirements and pick slip'),
      });
    }
  }, [rowData, partNumbers, order, addRequirement, addPickSlip, addPickSlipItem, t, onRequirementsCreated, clearLocalStorage, validateRows]);

  return (
    <div className="flex flex-col gap-4">
      <div className="ag-theme-alpine" style={{ height: '50vh', width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={{
            flex: 1,
            resizable: true,
          }}
        />
      </div>
      <div className="flex justify-between">
        <Space>
          <Button icon={<PlusOutlined />} onClick={addRow}>{t('ADD ROW')}</Button>
          <Button icon={<ClearOutlined />} onClick={resetAll}>{t('RESET ALL')}</Button>
          <Button icon={<SaveOutlined />} onClick={saveToLocalStorage}>{t('SAVE')}</Button>
        </Space>
        <Space>
          <Button type="primary" onClick={createRequirements}>{t('CREATE REQUIREMENTS')}</Button>
          <Button type="primary" icon={<SendOutlined />} onClick={showModal}>
            {t('CREATE AND SEND TO WAREHOUSE')}
          </Button>
        </Space>
      </div>
      <Modal
        title={t('Create and Send to Warehouse')}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="plannedDate"
            label={t('Planned Date')}
            rules={[{ required: true, message: t('Please select a planned date') }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="neededOnID"
            label={t('Needed On')}
            rules={[{ required: true, message: t('Please select who needs the requirement') }]}
          >
            <Select options={userOptions} />
          </Form.Item>
          <Form.Item
            name="getFromID"
            label={t('Get From Store')}
            rules={[{ required: true, message: t('Please select a store') }]}
          >
            <Select options={storeOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BulkRequirementCreator;