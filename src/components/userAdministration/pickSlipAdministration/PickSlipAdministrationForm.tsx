//@ts-nocheck

import React, { FC, useEffect, useMemo, useState, useCallback } from 'react';
import { useGetGroupUsersQuery } from '@/features/userAdministration/userApi';
import {
  ProForm,
  ProFormText,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-form';

import {
  Button,
  Space,
  Tabs,
  Modal,
  Form,
  notification,
  Select,
  InputNumber,
  DatePicker,
  Popconfirm,
  Tooltip,
  List,
  Typography,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { IRequirement, Requirement } from '@/models/IRequirement';
import {
  ProFormDatePicker,
  ProFormDigit,
  ProFormTextArea,
} from '@ant-design/pro-components';
// import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
import { useGetREQTypesQuery } from '@/features/requirementsTypeAdministration/requirementsTypeApi';
import { useGetREQCodesQuery } from '@/features/requirementsCodeAdministration/requirementsCodesApi';
import { useGetProjectsQuery } from '@/features/projectAdministration/projectsApi';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
// import BookedPartContainer from '../../layout/APN/PickSlipConfirmationNew';
import { useGetProjectTasksQuery } from '@/features/projectTaskAdministration/projectsTaskApi';
import { useGetProjectItemsWOQuery } from '@/features/projectItemWO/projectItemWOApi';
import PartContainer from '@/components/woAdministration/PartContainer';
import { ColDef } from 'ag-grid-community';
import {
  useGetPickSlipItemsQuery,
  useUpdatePickSlipItemsMutation,
  useAddPickSlipItemMutation,
} from '@/features/pickSlipAdministration/pickSlipItemsApi';
import {
  transformToIAltPartNumber,
  transformToIRequirement,
  transformToPickSlipItemBooked,
  transformToPickSlipItemItem,
} from '@/services/utilites';
import { Split } from '@geoffcox/react-splitter';
import Title from 'antd/lib/typography/Title';
import BookedPartContainer from '@/components/layout/pickSlipConfirmationNew/BookedPartContainer';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import { useAddPickSlipMutation } from '@/features/pickSlipAdministration/pickSlipApi';
import { AgGridReact } from 'ag-grid-react';
import {
  DeleteOutlined,
  SaveOutlined,
  SwapOutlined,
  PlusOutlined,
  ClearOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {
  AvailableQuantity,
  useGetAvailableQuantityQuery,
} from '@/features/stockAdministration/stockApi';
import { useGetAltsPartNumbersQuery } from '@/features/partAdministration/altPartApi';
import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
import dayjs from 'dayjs';
import { useGetfilteredWOQuery } from '@/features/wpAdministration/wpApi';
import { IPartNumber } from '@/models/IUser';
import {
  useAddRequirementMutation,
  useUpdateRequirementMutation,
} from '@/features/requirementAdministration/requirementApi';

// Определите тип для usersGroup
interface UserGroup {
  id: string;
  title: string;
}

interface UserFormProps {
  requierement?: any;
  onSubmit: (company: any) => void;
  onDelete?: (companyId: string) => void;
  // partNumbers?: IPartNumber[];
}

const PickSlipAdministrationForm: FC<UserFormProps> = ({
  requierement,
  onSubmit,
}) => {
  const [updateRequirement] = useUpdateRequirementMutation();
  const [addRequirement] = useAddRequirementMutation();
  const [WOID, setWOID] = useState<any>(null);
  const [reqTypeID, setReqTypeID] = useState<any>('');
  const [form] = ProForm.useForm();
  const [projectId, setSelectedProjectId] = useState<any>();
  const [partNumberId, setPartNumberId] = useState<any>();
  // requierement?.projectID || ''

  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  useEffect(() => {
    if (requierement) {
      form.resetFields();
      form.setFieldsValue(requierement);
      // setinitialFormPN(requierement.PN);
      setReqTypeID(requierement.reqTypesID);
      setSelectedProjectId(requierement.projectID?._id);
      setPartNumberId(requierement.partNumberID?._id);
      form.setFieldsValue({
        partNumberID: requierement.partNumberID?._id,
        group: requierement.partNumberID?.GROUP,
        nameOfMaterial: requierement.partNumberID?.DESCRIPTION,
        unit: requierement.partNumberID?.UNIT_OF_MEASURE,
        projectTaskID: requierement.projectTaskID?._id,
        projectID: requierement.projectID?._id,
        neededOnID: requierement?.neededOnID?._id,
        type: requierement?.type,
        WOReferenceID: requierement.projectID?.WOReferenceID?._id,
      });
    } else {
      form.resetFields();
      setSelectedProjectId(undefined);
    }
  }, [requierement, form]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { t } = useTranslation();
  const [activeTabKey, setActiveTabKey] = useState('1'); // Default to the first tab
  const handleSubmit = async (values: any) => {
    const newUser: IRequirement = requierement
      ? { ...requierement, ...values }
      : { ...values };

    requierement?.id && onSubmit(newUser);
    !requierement?.id && setIsModalVisible(true);
  };

  const SubmitButton = () => (
    <PermissionGuard requiredPermissions={[Permission.PICKSLIP_ACTIONS]}>
      <Button type="primary" htmlType="submit">
        {requierement ? t('UPDATE') : t('CREATE')}
      </Button>
    </PermissionGuard>
  );

  const { data: usersGroups } = useGetGroupUsersQuery({});
  const { data: reqTypes } = useGetREQTypesQuery({});

  const { data: reqCodes } = useGetREQCodesQuery(
    {
      reqTypeID,
    },
    { skip: !reqTypeID }
  );
  const { data: projectTasks } = useGetProjectItemsWOQuery(
    { projectId },
    { skip: !projectId }
  );

  const { data: pickSlipItems } = useGetPickSlipItemsQuery(
    { pickSlipID: requierement?.id },
    { skip: !requierement }
  );
  const transformedBooked = useMemo(() => {
    return (
      requierement?.id && transformToPickSlipItemBooked(pickSlipItems || [])
    );
  }, [requierement?.id, pickSlipItems]);
  const { data: partNumbers, isLoading, isError } = useGetPartNumbersQuery({});
  const [rowDataForSecondContainer, setRowDataForSecondContainer] = useState<
    any[]
  >([]);

  useEffect(() => {
    if (transformedBooked && transformedBooked.length > 0) {
      setRowDataForSecondContainer(transformedBooked);
      // onUpdateData(fetchData);
    }
  }, [transformedBooked]);
  const { data: projects } = useGetProjectsQuery(
    {
      WOReferenceID: form.getFieldValue('WOReferenceID'),
    }
    // { skip: !requierement }
  );
  const {
    data: wp,
    isLoading: isLoadingWP,
    isFetching,
  } = useGetfilteredWOQuery({});

  const [showSubmitButton, setShowSubmitButton] = useState(true);
  useEffect(() => {
    setShowSubmitButton(activeTabKey === '1');
  }, [activeTabKey]);
  const neededCodesValueEnum: Record<string, string> =
    usersGroups?.reduce(
      (acc: Record<string, string>, usersGroup: UserGroup) => {
        acc[usersGroup.id] = usersGroup.title;
        return acc;
      },
      {}
    ) || {};

  // const partValueEnum: Record<string, any> =
  //   partNumbers?.reduce((acc, partNumber) => {
  //     acc[partNumber._id] = partNumber; // Store the entire partNumber object
  //     return acc;
  //   }, {}) || {};

  const projectTasksCodesValueEnum: Record<string, string> = (
    projectTasks ?? []
  ).reduce<Record<string, string>>((acc, projectTask) => {
    const taskCode =
      projectTask.taskWO ||
      projectTask.taskWo ||
      projectTask.projectTaskWO ||
      '';
    acc[projectTask.id] = taskCode;
    return acc;
  }, {});

  const projectsValueEnum: Record<string, string> = (projects ?? []).reduce<
    Record<string, string>
  >((acc, project) => {
    acc[project._id] = `${project.projectWO} - ${project.projectName}`;
    return acc;
  }, {});

  // const requirementTypesValueEnum: Record<string, string> =
  //   reqTypes?.reduce((acc, reqType) => {
  //     acc[reqType.id] = reqType.code;
  //     return acc;
  //   }, {}) || {};
  type CellDataType = 'text' | 'number' | 'date' | 'boolean'; // Определите возможные типы данных

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType; // Обязательное свойство
  }

  const wpValueEnum: Record<string, string> =
    wp?.reduce((acc, wp) => {
      if (wp._id && wp?.WOName) {
        acc[wp._id] = `№:${wp?.WONumber}/${String(wp?.WOName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};
  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: false,

      cellDataType: 'text',
    },
    {
      field: 'DESCRIPTION',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'GROUP',
      headerName: `${t('GROUP')}`,
      cellDataType: 'text',
    },
    {
      field: 'TYPE',
      headerName: `${t('TYPE')}`,
      cellDataType: 'text',
    },
    {
      field: 'requestedQty',
      headerName: `${t('REQUESTED QTY')}`,
      cellDataType: 'number',
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    // Добавьте другие колонки по необходимости
  ]);
  const [columnBookedDefs, setColumnBookedDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('LOCAL_ID')}`,
      field: 'LOCAL_ID',
      editable: false,
      cellDataType: 'text',
    },
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER_BOOKED',
      editable: false,

      cellDataType: 'text',
    },
    {
      field: 'DESCRIPTION',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'GROUP',
      headerName: `${t('GROUP')}`,
      cellDataType: 'text',
    },
    {
      field: 'TYPE',
      headerName: `${t('TYPE')}`,
      cellDataType: 'text',
    },
    {
      field: 'bookedQty',
      headerName: `${t('BOOKED QTY')}`,
      cellDataType: 'number',
    },
    {
      field: 'canceledQty',
      headerName: `${t('CANCELLED QTY')}`,
      cellDataType: 'number',
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    {
      field: 'PRODUCT_EXPIRATION_DATE',
      editable: false,
      filter: false,
      headerName: `${t('EXPIRY DATE')}`,
      cellDataType: 'date',
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
      field: 'STORE',
      editable: false,
      filter: false,
      headerName: `${t('STORE')}`,
      cellDataType: 'text',
    },
    {
      field: 'LOCATION',
      editable: false,
      filter: false,
      headerName: `${t('LOCATION')}`,
      cellDataType: 'text',
    },
    {
      field: 'SERIAL_NUMBER',
      editable: false,
      filter: false,
      headerName: `${t('BATCH/SERIAL')}`,
      cellDataType: 'text',
    },
    {
      field: 'CONDITION',
      editable: false,
      filter: false,
      headerName: `${t('CONDITION')}`,
      cellDataType: 'text',
    },
    {
      field: 'OWNER',
      editable: false,
      filter: false,
      headerName: `${t('OWNER')}`,
      cellDataType: 'text',
    },
    // {
    //   field: 'RECEIVING_NUMBER',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('RECEIVING')}`,
    //   cellDataType: 'text',
    // },
    // {
    //   field: 'RECEIVED_DATE',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('RECEIVED DATE')}`,
    //   cellDataType: 'date',
    //   valueFormatter: (params: any) => {
    //     if (!params.value) return ''; // Проверка отсутствия значения
    //     const date = new Date(params.value);
    //     return date.toLocaleDateString('ru-RU', {
    //       year: 'numeric',
    //       month: '2-digit',
    //       day: '2-digit',
    //     });
    //   },
    // },
    // {
    //   field: 'DOC_NUMBER',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('DOC_NUMBER')}`,
    //   cellDataType: 'text',
    // },
    // {
    //   field: 'DOC_TYPE',
    //   editable: false,
    //   filter: false,
    //   headerName: `${t('DOC_TYPE')}`,
    //   cellDataType: 'text',
    // },
    // Добавьте другие колонки по необходимости
  ]);
  const transformedRequirements = useMemo(() => {
    return requierement?.id && transformToPickSlipItemItem(pickSlipItems || []);
  }, [requierement?.id, pickSlipItems]);
  const transformedBookedItems = useMemo(() => {
    return requierement?.id && transformToPickSlipItemItem(pickSlipItems || []);
  }, [requierement?.id, pickSlipItems]);

  const [addPickSlip] = useAddPickSlipMutation();
  const [addPickSlipItem] = useAddPickSlipItemMutation();
  const [bulkRowData, setBulkRowData] = useState<any[]>([{ id: Date.now() }]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [alternativesModalVisible, setAlternativesModalVisible] =
    useState(false);
  const [selectedPartNumber, setSelectedPartNumber] = useState<
    string | undefined
  >(undefined);

  const [selectedProjectStores, setSelectedProjectStores] = useState<string[]>(
    []
  );

  useEffect(() => {
    const projectID = form.getFieldValue('projectID');
    if (projectID && projects) {
      const selectedProject = projects.find(
        (project) => project._id === projectID
      );
      if (selectedProject && selectedProject.storesID) {
        setSelectedProjectStores(selectedProject.storesID);
      }
    }
  }, [form, projects]);

  const { data: stores } = useGetStoresQuery(
    { ids: selectedProjectStores.join(',') },
    { skip: selectedProjectStores.length === 0 }
  );

  const storeOptions = useMemo(
    () =>
      stores?.map((store) => ({
        label: store.storeShortName,
        value: store.id,
      })) || [],
    [stores]
  );

  const { data: alternatives, isLoading: isLoadingAlternatives } =
    useGetAltsPartNumbersQuery(
      { partNumberID: selectedPartNumber },
      { skip: !selectedPartNumber }
    );

  const updateSingleRow = useCallback(
    (rowId: string, updates: Partial<any>) => {
      setBulkRowData((prevData) =>
        prevData.map((row) => (row.id === rowId ? { ...row, ...updates } : row))
      );
    },
    []
  );

  const PartNumberSelector = (props: any) => {
    const [localValue, setLocalValue] = useState(props.value);

    useEffect(() => {
      setLocalValue(props.value);
    }, [props.value]);

    const onValueChange = useCallback(
      (value: string) => {
        const selectedPart = partNumbers?.find((part) => part._id === value);
        if (selectedPart) {
          setLocalValue(value);
          props.setValue(value);
          updateSingleRow(props.data.id, {
            PART_NUMBER: selectedPart._id,
            DESCRIPTION: selectedPart.DESCRIPTION,
            UNIT_OF_MEASURE: selectedPart.UNIT_OF_MEASURE,
          });
          setSelectedRowId(props.data.id);
          setSelectedPartNumber(value);
          setAlternativesModalVisible(true);
        }
      },
      [partNumbers, props]
    );

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          padding: '0 5px',
        }}
      >
        <Select
          showSearch
          style={{ width: '100%' }}
          value={localValue}
          onChange={onValueChange}
          options={partNumbers?.map((part) => ({
            label: part.PART_NUMBER,
            value: part._id,
          }))}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          status={!localValue ? 'error' : undefined}
        />
        {alternatives && alternatives.length > 0 && (
          <Tooltip title={t('Show alternatives')}>
            <Button
              icon={<SwapOutlined />}
              onClick={() => setAlternativesModalVisible(true)}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '22px',
                width: '22px',
              }}
            />
          </Tooltip>
        )}
      </div>
    );
  };

  const QuantityEditor = (props: any) => {
    return (
      <InputNumber
        style={{ width: '100%' }}
        value={props.value}
        onChange={(value) => {
          updateSingleRow(props.data.id, { amout: value });
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
          updateSingleRow(props.data.id, {
            plannedDate: date ? date.toDate() : null,
          });
        }}
        status={!props.value ? 'error' : undefined}
      />
    );
  };

  const DeleteButton = (props: any) => {
    const onClick = () => {
      const updatedData = bulkRowData.filter((row) => row.id !== props.data.id);
      setBulkRowData(updatedData);
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

  // Обновите интерфейс ExtendedAvailableQuantity
  interface ExtendedAvailableQuantity
    extends Omit<AvailableQuantity, 'storeAvailableQTY' | 'unitOfMeasure'> {
    unitOfMeasure: string;
    storeAvailableQTY: Array<{ storeName: string; availableQTY: number }>;
  }

  const AvailabilityIndicator = (props: any) => {
    const { data: availableQuantity, isLoading } = useGetAvailableQuantityQuery(
      {
        companyID: requierement?.companyID,
        partNumberID: props?.data.PART_NUMBER,
        storeID: requierement?.projectID?.storesID?.join(','),
        isAlternative: false,
        isAllExpDate: false,
      },
      {
        skip: !props.data.PART_NUMBER,
      }
    ) as { data: ExtendedAvailableQuantity | undefined; isLoading: boolean };

    const { data: alternativesQuantity, isLoading: isLoadingAlternatives } =
      useGetAvailableQuantityQuery(
        {
          companyID: requierement?.companyID,
          partNumberID: props?.data?.PART_NUMBER,
          storeID: requierement?.projectID?.storesID?.join(','),
          isAlternative: true,
          isAllExpDate: false,
        },
        {
          skip: !props.data.PART_NUMBER,
        }
      ) as { data: ExtendedAvailableQuantity | undefined; isLoading: boolean };

    if (isLoading || isLoadingAlternatives) {
      return <span>{t('Loading...')}</span>;
    }

    const mainQty = availableQuantity?.totalQuantity || 0;
    const altQty = (alternativesQuantity?.totalQuantity || 0) - mainQty;
    const totalQty = mainQty + altQty;
    const requestedQty = props.data.amout || 0;

    let color = 'red';
    if (totalQty > 0) color = 'yellow';
    if (totalQty >= requestedQty) color = 'green';

    const tooltipContent = (
      <div>
        <div>
          {t('Main')}: {mainQty}
        </div>
        <div>
          {t('Alternatives')}: {altQty}
        </div>
        <div>
          {t('Total')}: {totalQty}
        </div>
        {availableQuantity?.storeAvailableQTY?.map((store, index) => (
          <div key={index}>{`${store.storeName}: ${store.availableQTY}`}</div>
        ))}
      </div>
    );

    return (
      <Tooltip title={tooltipContent}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: color,
            }}
          ></div>
          <span>{`${mainQty} + ${altQty} = ${totalQty} ${
            availableQuantity?.unitOfMeasure || ''
          }`}</span>
        </div>
      </Tooltip>
    );
  };

  const bulkColumnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: t('PART No'),
        field: 'PART_NUMBER',
        cellRenderer: PartNumberSelector,
        cellStyle: (params) => {
          if (!params.value) {
            return { backgroundColor: '#ffcccb' };
          }
        },
        width: 400,
        flex: 4,
      },
      {
        headerName: t('DESCRIPTION'),
        field: 'DESCRIPTION',
        editable: false,
        flex: 3,
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
        flex: 2,
      },
      {
        headerName: t('UNIT OF MEASURE'),
        field: 'UNIT_OF_MEASURE',
        editable: false,
        width: 150,
        flex: 2,
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
        width: 260,
        flex: 2,
      },
      {
        headerName: t('AVAILABILITY'),
        field: 'PART_NUMBER',
        cellRenderer: AvailabilityIndicator,
        width: 150,
        flex: 3,
      },
      {
        headerName: t('ACTIONS'),
        field: 'actions',
        cellRenderer: DeleteButton,
        width: 100,
      },
    ],
    [t, partNumbers]
  );

  const addRow = useCallback(() => {
    setBulkRowData((prev) => [...prev, { id: Date.now() }]);
  }, []);

  const resetAll = useCallback(() => {
    setBulkRowData([{ id: Date.now() }]);
    notification.info({
      message: t('RESET'),
      description: t('All data has been reset'),
    });
  }, [t]);

  const validateRows = useCallback((rows: any[]) => {
    return rows.every((row) => row.PART_NUMBER && row.amout && row.plannedDate);
  }, []);

  const handleCreatePickSlip = async () => {
    const validRows = bulkRowData.filter(
      (row) => row.PART_NUMBER && row.amout && row.plannedDate
    );
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
          neededOnID: form.getFieldValue('neededOnID'),
          getFromID: form.getFieldValue('getFromID'),
          plannedDate: form.getFieldValue('plannedDate'),
          state: form.getFieldValue('state'),
          type: form.getFieldValue('type'),
        },
        projectID: form.getFieldValue('projectID'),
        projectTaskID: form.getFieldValue('projectTaskID'),
      }).unwrap();

      const pickSlipID = pickSlipResponse.id;

      for (const row of validRows) {
        const selectedPart =
          partNumbers &&
          partNumbers.find((part) => part._id === row.PART_NUMBER);
        const requirement = await addRequirement({
          requirement: {
            plannedDate: row.plannedDate,
            projectID: form.getFieldValue('projectID'),
            projectTaskID: form.getFieldValue('projectTaskID'),
            group: selectedPart?.GROUP,
            status: form.getFieldValue('state'),
            type: form.getFieldValue('type'),
            partNumberID: row.PART_NUMBER,
            partNumber: selectedPart?.PART_NUMBER,
            description: selectedPart?.DESCRIPTION,
            amout: row.amout,
            unit: row.UNIT_OF_MEASURE,
            neededOnID: form.getFieldValue('neededOnID'),
          },
        }).unwrap();

        const requirementId = requirement.id || requirement._id;

        await addPickSlipItem({
          pickSlipID,
          pickSlipItem: {
            partNumberID: row.PART_NUMBER,
            requestedQty: row.amout,
            neededOnID: form.getFieldValue('neededOnID'),
            getFromID: form.getFieldValue('getFromID'),
            plannedDate: row.plannedDate,
            state: form.getFieldValue('state'),
            type: form.getFieldValue('type'),
          },
          projectID: form.getFieldValue('projectID'),
          projectTaskID: form.getFieldValue('projectTaskID'),
          requirementID: requirementId,
        }).unwrap();
        await updateRequirement({
          requestQuantity: row.amout,
          status: 'issued',
          _id: requirement.id,
          id: requirement.id,
          pickSlipID: pickSlipID,
        }).unwrap();
      }

      notification.success({
        message: t('SUCCESS'),
        description: t('Pick slip has been created successfully'),
      });
      setIsModalVisible(false);
      setBulkRowData([{ id: Date.now() }]);
      onSubmit(pickSlipResponse);
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Failed to create pick slip'),
      });
    }
  };

  const handleAlternativeSelect = (alternative: any) => {
    if (selectedRowId) {
      updateSingleRow(selectedRowId, {
        PART_NUMBER: alternative.altPartNumberID._id,
        DESCRIPTION: alternative.altPartNumberID.DESCRIPTION,
        UNIT_OF_MEASURE: alternative.altPartNumberID.UNIT_OF_MEASURE,
      });
      setSelectedPartNumber(alternative.altPartNumberID._id);
      setAlternativesModalVisible(false);
    }
  };

  const AlternativeItem = React.memo(
    ({
      item,
      order,
      onSelect,
    }: {
      item: any;
      order: any;
      onSelect: (item: any) => void;
    }) => {
      const { data: availableQuantity, isLoading: isLoadingQuantity } =
        useGetAvailableQuantityQuery(
          {
            companyID: order?.companyID,
            partNumberID: item?.altPartNumberID?._id,
            storeID: order?.projectID?.storesID?.join(','),
            isAlternative: false,
            isAllExpDate: false,
          },
          {
            skip: !item?.altPartNumberID?._id,
          }
        ) as {
          data: ExtendedAvailableQuantity | undefined;
          isLoading: boolean;
        };

      if (isLoadingQuantity) {
        return <List.Item>{t('Loading quantity data...')}</List.Item>;
      }

      return (
        <List.Item
          key={item.altPartNumberID?._id}
          onClick={() => onSelect(item)}
          className="cursor-pointer hover:bg-gray-100"
        >
          <List.Item.Meta
            title={item.altPartNumberID?.PART_NUMBER}
            description={item.altPartNumberID?.DESCRIPTION}
          />
          <div>
            <Typography.Text>{`${item.altPartNumberID?.UNIT_OF_MEASURE}`}</Typography.Text>
            <Typography.Text className="ml-2">
              {`${t('Available')}: ${availableQuantity?.totalQuantity || 0} ${
                availableQuantity?.unitOfMeasure || ''
              }`}
            </Typography.Text>
            {availableQuantity?.storeAvailableQTY &&
              availableQuantity.storeAvailableQTY.length > 0 && (
                <Typography.Text className="ml-2">
                  {`${t('Store')}: ${
                    availableQuantity.storeAvailableQTY[0].storeName
                  }`}
                </Typography.Text>
              )}
          </div>
        </List.Item>
      );
    }
  );

  return (
    <ProForm
      onReset={() => {
        form.resetFields();
        setSelectedProjectId(null);
      }}
      disabled={
        requierement?.state == 'closed' || requierement?.state == 'canceled'
      }
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => {
          if (showSubmitButton) {
            return [<SubmitButton key="submit" />, dom.reverse()[1]];
          }
          return null;
        },
      }}
      initialValues={requierement}
      layout="horizontal"
    >
      <Tabs
        activeKey={activeTabKey}
        defaultActiveKey="1"
        type="card"
        onChange={(key) => {
          setActiveTabKey(key);
          form.setFieldsValue({ activeTabKey: key });
        }}
      >
        <Tabs.TabPane tab={t('PICKSLIP INFORMATION')} key="1">
          <div className="h-[56vh] flex flex-col overflow-auto">
            <ProFormGroup>
              <ProFormSelect
                showSearch
                rules={[{ required: true }]}
                name="state"
                label={t('PICKSLIP STATUS')}
                width="sm"
                initialValue={'issued'}
                options={[
                  { value: 'draft', label: t('DRAFT'), disabled: true }, // Отключаем отдельные опции
                  { value: 'open', label: t('OPEN') },
                  { value: 'issued', label: t('ISSUED'), disabled: true },
                  { value: 'complete', label: t('COMPLETE'), disabled: true },
                  { value: 'onQuatation', label: t('QUATATION') },
                  { value: 'onShort', label: t('ON SHORT') },
                  { value: 'closed', label: t('CLOSE'), disabled: true },
                  {
                    value: 'partlyCanceled',
                    label: t('PARTLY CANCELLED'),
                    disabled: true,
                  },
                  { value: 'canceled', label: t('CANCELED') },
                  { value: 'tofix', label: t('ATTENTION') },
                ]}
                // Можно также добавить условие для отключения всего селекта
                disabled={!requierement?.id} // Отключает весь селект если нет requierement.id
              />
              <ProFormSelect
                showSearch
                name="type"
                label={t('PICKSLIP TYPE')}
                width="sm"
                options={[{ value: 'partRequest', label: t('PART REQUEST') }]}
                onChange={(value: any) => setReqTypeID(value)}
              />
              {/* Добавляем поле getFrom */}

              {/* Добавляем поле plannedDate */}
              <ProFormDatePicker
                rules={[{ required: true }]}
                name="plannedDate"
                label={t('PLANNED DATE')}
                width="sm"
              />
            </ProFormGroup>
            <ProFormGroup>
              <ProForm.Group direction="horizontal">
                <ProFormSelect
                  showSearch
                  rules={[{ required: true }]}
                  name="WOReferenceID"
                  label={t('WP No')}
                  width="lg"
                  valueEnum={wpValueEnum || []}
                  onChange={(value: any) => setWOID(value)}
                />
                <ProFormSelect
                  disabled={!WOID}
                  rules={[{ required: true }]}
                  name="projectID"
                  label={`${t(`WP`)}`}
                  width="lg"
                  valueEnum={projectsValueEnum}
                  onChange={async (value: any) => {
                    setSelectedProjectId(value);
                    if (projects) {
                      const selectedProject = projects.find(
                        (project) => project._id === value
                      );
                      if (selectedProject && selectedProject.storesID) {
                        setSelectedProjectStores(selectedProject.storesID);
                      }
                    }
                  }}
                />
                <ProFormSelect
                  disabled={selectedProjectStores?.length < 1}
                  showSearch
                  rules={[{ required: true }]}
                  name="getFromID"
                  label={t('GET FROM STORE')}
                  width="sm"
                  options={storeOptions}
                />
              </ProForm.Group>
              <ProForm.Group>
                <ProFormSelect
                  showSearch
                  rules={[{ required: true }]}
                  name="neededOnID"
                  label={t('NEEDED ON')}
                  width="sm"
                  valueEnum={neededCodesValueEnum || []}
                />
                <ProFormSelect
                  showSearch
                  mode="single"
                  name="projectTaskID"
                  label={`${t(`TRACE No`)}`}
                  width="sm"
                  valueEnum={projectTasksCodesValueEnum}
                  onChange={(value: any) => {
                    setSelectedTask(value);
                  }}
                />
              </ProForm.Group>
            </ProFormGroup>
            <ProFormTextArea
              fieldProps={{
                style: { resize: 'none' },
                rows: 2,
              }}
              name="notes"
              colSize={1}
              label={t('REMARKS')}
              width="xl"
            />

            {/* Добавляем функциональность массового создания пикслипа */}
            {!requierement?.id && (
              <>
                <Space style={{ marginBottom: 5 }}>
                  <Button icon={<PlusOutlined />} onClick={addRow}>
                    {t('ADD ROW')}
                  </Button>
                  <Button icon={<ClearOutlined />} onClick={resetAll}>
                    {t('RESET ALL')}
                  </Button>
                </Space>
                <div
                  className="ag-theme-alpine"
                  style={{ height: '30vh', width: '100%' }}
                >
                  <AgGridReact
                    columnDefs={bulkColumnDefs}
                    rowData={bulkRowData}
                    onCellValueChanged={(event: any) => {
                      updateSingleRow(event.data.id, {
                        [event.colDef.field]: event.newValue,
                      });
                    }}
                    onRowSelected={(event: any) => {
                      if (event.node.isSelected()) {
                        setSelectedRowId(event.data.id);
                      }
                    }}
                  />
                </div>
              </>
            )}

            {/* <Button 
              // onClick={() => setIsModalVisible(true)} 
              type="primary" 
              icon={<SendOutlined />}
              style={{ marginTop: 16 }}
            >
              {t('CREATE PICKSLIP')}
            </Button> */}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('PICKSLIP PARTS')} key="2">
          <div className=" h-[59vh] flex flex-col overflow-auto">
            <Split initialPrimarySize="50%" splitterSize="20px">
              <div className="flex flex-col">
                <Title className="my-0" level={4}>
                  {t('REQUESTED PARTS')}
                </Title>
                <PartContainer
                  isChekboxColumn={false}
                  isVisible={true}
                  pagination={false}
                  isAddVisiable={true}
                  isButtonVisiable={false}
                  isEditable={true}
                  height={'55vh'}
                  columnDefs={columnDefs}
                  partNumbers={[]}
                  onUpdateData={(data: any[]): void => {}}
                  rowData={transformedRequirements}
                  isLoading={isLoading}
                />
              </div>
              <div className="flex flex-col">
                <Title className="my-0" level={4}>
                  {t('BOOKED PARTS')}
                </Title>
                <BookedPartContainer
                  isFilesVisiable={true}
                  isChekboxColumn={false}
                  isVisible={true}
                  pagination={false}
                  isAddVisiable={true}
                  isButtonVisiable={false}
                  isEditable={true}
                  height={'55vh'}
                  columnDefs={columnBookedDefs}
                  partNumbers={[]}
                  onRowSelect={(data: any[]): void => {
                    console.log(data);
                  }}
                  onUpdateData={(data: any[]): void => {}}
                  fetchData={rowDataForSecondContainer}
                />
              </div>
            </Split>
          </div>
        </Tabs.TabPane>
      </Tabs>
      <Modal
        title={t('CREATE PICKSLIP')}
        visible={isModalVisible}
        onOk={handleCreatePickSlip}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>
          {t('Are you sure you want to create a pick slip with these items?')}
        </p>
      </Modal>
      <Modal
        title={t('Alternatives')}
        visible={alternativesModalVisible}
        onCancel={() => setAlternativesModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setAlternativesModalVisible(false)}
          >
            {t('Close')}
          </Button>,
        ]}
      >
        {isLoadingAlternatives ? (
          <div>{t('Loading...')}</div>
        ) : alternatives && alternatives.length > 0 ? (
          <List
            dataSource={alternatives}
            renderItem={(item: any) => (
              <AlternativeItem
                key={item.altPartNumberID?._id}
                item={item}
                order={requierement}
                onSelect={handleAlternativeSelect}
              />
            )}
          />
        ) : (
          <div>{t('No alternatives available')}</div>
        )}
      </Modal>
    </ProForm>
  );
};
export default PickSlipAdministrationForm;
