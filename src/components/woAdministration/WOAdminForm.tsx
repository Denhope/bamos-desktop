//@ts-nocheck
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { handleFileOpen, handleFileSelect } from '@/services/utilites';
import { UploadOutlined, ProjectOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormDigit,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import {
  Tabs,
  Form,
  message,
  notification,
  Empty,
  Button,
  Upload,
  Modal,
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
  useAddStepMutation,
  useDeleteStepMutation,
  useGetFilteredStepsQuery,
} from '@/features/projectItemWO/stepApi';
import { useGetSkillsQuery } from '@/features/userAdministration/skillApi';
import { useAddBookingMutation } from '@/features/bookings/bookingApi';
import StepContainer from './StepContainer';
import { useGetFilteredRestrictionsQuery } from '@/features/restrictionAdministration/restrictionApi';
import InstrumentContainer from './InstrumentContainer';
import WODescriptionSummary from './WODescriptionSummary';
import { IStep } from '@/models/IStep';
import { ITask } from '@/models/ITask';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';
import { useGetGroupTaskCodesQuery } from '@/features/tasksAdministration/taskCodesApi';
import { useGetMPDCodesQuery } from '@/features/MPDAdministration/mpdCodesApi';
import {
  useGetFilteredZonesQuery,
  useGetZonesByGroupQuery,
} from '@/features/zoneAdministration/zonesApi';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { ColDef, ColumnResizedEvent, GridReadyEvent } from 'ag-grid-community';
import {
  ValueEnumType,
  getStatusColor,
  transformToIPartNumber,
  transformToIRequirement,
} from '@/services/utilites';
import PartContainer from './PartContainer';
import { IPartNumber } from '@/models/IUser';
import RequarementsList from './requirements/RequarementsList';
import { IRequirement } from '@/models/IRequirement';
import AutoCompleteEditor from '../shared/Table/ag-grid/AutoCompleteEditor';
import { useGetFilteredRequirementsQuery } from '@/features/requirementAdministration/requirementApi';
import CircleRenderer from '../userAdministration/requirementAdministration/CircleRenderer';
import { useGetAccessCodesQuery } from '@/features/accessAdministration/accessApi';
import { useGetPartTaskNumbersQuery } from '@/features/tasksAdministration/partApi';
import { useGlobalState } from './GlobalStateContext';
import {
  deleteFile,
  deleteFileUploads,
  uploadFileServer,
  uploadFileServerReference,
} from '@/utils/api/thunks';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import PermissionGuard, { Permission } from '../auth/PermissionGuard';
import { setColumnWidthReq } from '@/store/reducers/columnWidthrReqlice';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import FileListE from '../userAdministration/taskAdministration/FileList.tsx';
import { useGetActionsTemplatesQuery } from '@/features/templatesAdministration/actionsTemplatesApi';

interface UserFormProps {
  order?: any;
  orderItem?: any | {};
  onCheckItems: (selectedKeys: React.Key[]) => void;
  onSubmit: (task: any) => void;
}

const WOAdminForm: FC<UserFormProps> = ({
  order,
  orderItem,
  onCheckItems,
  onSubmit,
}) => {
  const dispatch = useAppDispatch();
  type CellDataType = 'text' | 'number' | 'date' | 'boolean'; // Определите возможные типы данных
  const { t } = useTranslation();
  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType; // Обязательное свойство
  }

  const columnWidths = useSelector((state: RootState) => state.columnWidthrReq);
  const { data: partNumbers } = useGetPartNumbersQuery({});
  const columnDefs = useMemo(
    () => [
      {
        headerName: `${t('PART No')}`,
        field: 'PART_NUMBER',
        editable: true,
        // cellEditor: AutoCompleteEditor,
        // cellEditorParams: {
        //   options: partNumbers,
        // },
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
        field: 'QUANTITY',
        editable: true,
        cellDataType: 'number',
        headerName: `${t('QUANTITY')}`,
      },
      {
        field: 'UNIT_OF_MEASURE',
        editable: false,
        filter: false,
        headerName: `${t('UNIT OF MEASURE')}`,
        cellDataType: 'text',
      },
      {
        field: 'notes',
        editable: false,
        filter: false,
        headerName: `${t('IF REQURTED')}`,
        cellDataType: 'text',
      },
      // Добавьте другие колонки по необходимости
    ],
    []
  );

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
        cellDataType: 'number',
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
        editable: true,
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

  const [form] = ProForm.useForm();

  const [addBooking] = useAddBookingMutation({});

  const [stepsSelected, setStepsSelected] = useState<React.Key[]>([]);
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [tabTitles, setTabTitles] = useState({
    '1': `${t('WORKORDER INFO')}`,
    '2': `${t('PARTS')}`,
    '3': `${t('STEPS')}`,
    '4': `${t('TOOL')}`,
    '5': `${t('REQUIREMENTS')}`,
  });

  const projectId = order?.projectId;
  const projectItemID = order?.projectItemID;
  const projectTaskID = order?.id;
  const { currentTime, setProjectTasksFormValues, projectTasksFormValues } =
    useGlobalState();
  const { data: steps, refetch } = useGetFilteredStepsQuery(
    { projectItemID: projectItemID, projectTaskID: projectTaskID },
    {
      skip: !projectTaskID,
      refetchOnMountOrArgChange: true,
    }
  );
  const { data: usersSkill } = useGetSkillsQuery({});
  const groupSlills = usersSkill?.map((skill: any) => ({
    label: skill?.code,
    value: skill?.id, // Use the _id as the value
  }));
  useEffect(() => {
    steps && order && order?.id && !order?.projectItemReferenceID && refetch();
    // setEditingProject(editingProject);

    // console.log(currentTime);
  }, [currentTime]); //
  const [addStep] = useAddStepMutation();
  const [deleteStep] = useDeleteStepMutation();

  useEffect(() => {
    updateTabTitle(orderItem, order);
  }, [orderItem, order]);

  const updateTabTitle = (selectedItem: any, order: any) => {
    if (order) {
      setTabTitles((prevTitles) => ({
        ...prevTitles,
        '1': `${t('WORKORDER')} №: ${order?.taskWO || 'DRAFT'}`,
      }));
    }
    if (selectedItem) {
      setTabTitles((prevTitles) => ({
        ...prevTitles,
        '3': `${t('WORKORDER №:')} ${order?.orderNumberNew} POS:${
          selectedItem?.index + 1
        } - PART_NUMBER: ${selectedItem?.partID?.PART_NUMBER}`,
      }));
    }
  };

  const handleAddStep = async (newStep: IStep) => {
    try {
      const step = await addStep({
        step: newStep,
        projectId,
        projectItemID,
        projectTaskID,
      }).unwrap();
      await refetch();
      await addBooking({
        booking: { voucherModel: 'ADD_STEP', data: step },
      }).unwrap(); // Передаем данные о новом шаге в addBooking
      notification.success({
        message: t('STEP SUCCESSFULLY ADDED'),
        description: t('The step has been successfully added.'),
      });
      // setIsModalVisible(false); // Если у вас есть функция для закрытия модального окна после добавления шага
    } catch (error) {
      notification.error({
        message: t('FAILED TO ADD STEP'),
        description: 'There was an error adding the step.',
      });
    }
  };

  const handleDeleteStep = async (stepIds: string[]) => {
    try {
      for (const stepId of stepIds) {
        const step = await deleteStep(stepId).unwrap();
        await addBooking({
          booking: { voucherModel: 'DELETE_STEP', data: step },
        }).unwrap();
      }
      await refetch();
      notification.success({
        message: t('STEP SUCCESSFULLY DELETED'),
        description: t('The step has been successfully deleted.'),
      });
    } catch (error) {
      notification.error({
        message: t('FAILED TO DELETE STEP'),
        description: t('There was an error deleting the step.'),
      });
    }
  };
  const { data: partsTask } = useGetPartTaskNumbersQuery(
    { taskId: order?.taskId?._id },
    {
      skip: !order?.taskId?._id,
    }
  );
  const [acTypeID, setACTypeID] = useState<any>(order?.acTypeId || '');
  const [taskType, setTaskType] = useState<string>(order?.taskType || '');
  // const { data: zones, isLoading: loading } = useGetZonesByGroupQuery(
  //   { acTypeId: acTypeID },
  //   { skip: !acTypeID }
  // );
  const { data: zones, isLoading: loading } = useGetFilteredZonesQuery(
    { acTypeId: acTypeID },
    { skip: !acTypeID }
  );
  const stepsToRender = projectItemID || projectTaskID ? steps : [];

  const { data: acTypes, isLoading: acTypesLoading } = useGetACTypesQuery({});
  const { data: mpdCodes, isLoading: mpdCodesLoading } = useGetMPDCodesQuery(
    { acTypeID },
    { skip: !acTypeID }
  );
  const { data: taskCodes } = useGetGroupTaskCodesQuery(
    { acTypeID },
    { skip: !acTypeID }
  );
  const acTypeValueEnum: Record<string, string> =
    acTypes?.reduce((acc, acType) => {
      acc[acType.id] = acType.name;
      return acc;
    }, {} as Record<string, string>) || {};

  const taskCodesValueEnum: Record<string, string> =
    taskCodes?.reduce((acc, mpdCode) => {
      acc[mpdCode.id || mpdCode?._id] = mpdCode.code;
      return acc;
    }, {} as Record<string, string>) || {};
  const mpdCodesValueEnum: Record<string, string> =
    mpdCodes?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.code;
      return acc;
    }, {} as Record<string, string>) || {};

  const zonesValueEnum: Record<string, string> =
    zones?.reduce((acc: any, zone: any) => {
      acc[zone?._id] = zone?.areaNbr || zone?.subZoneNbr || zone?.majoreZoneNbr;
      return acc;
    }, {} as Record<string, string>) || {};

  // const zonesValueEnum: Record<string, string> =
  //   zones?.reduce((acc1, majorZone) => {
  //     if (majorZone.subZonesCode) {
  //       return majorZone.subZonesCode.reduce((acc2, subZone) => {
  //         if (subZone.areasCode) {
  //           return subZone.areasCode.reduce((acc3, area) => {
  //             acc3[area.id] = String(area.areaNbr);
  //             return acc3;
  //           }, acc2);
  //         }
  //         return acc2;
  //       }, acc1);
  //     }
  //     return acc1;
  //   }, {} as Record<string, string>) || {};
  const { data: accessesData } = useGetAccessCodesQuery(
    { acTypeID: acTypeID },
    { skip: acTypeID }
  );
  const accessCodesValueEnum: Record<string, string> =
    accessesData?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.accessNbr;
      return acc;
    }, {} as Record<string, string>) || {};
  const partValueEnum: Record<string, any> = useMemo(() => {
    return (
      partNumbers?.reduce(
        (acc: Record<string, any>, partNumber: IPartNumber) => {
          acc[partNumber._id] = partNumber;
          return acc;
        },
        {}
      ) || {}
    );
  }, [partNumbers]);
  const { data: restriction } = useGetFilteredRestrictionsQuery({});
  const restrictionValueEnum: Record<string, string> =
    restriction?.reduce((acc, reqType) => {
      acc[reqType.id || reqType?._id] = `${reqType.code}`;
      return acc;
    }, {}) || {};
  useEffect(() => {
    if (order) {
      form.resetFields();
      form.setFieldsValue(order);
      setACTypeID(order.acTypeId);
      setTaskType(order.taskType);
      form.setFieldsValue({
        partNumberID: order?.PART_NUMBER,
        nameOfMaterial: order?.DESCRIPTION || order.NAME_OF_MATERIAL,
        WORKPIECE_DIMENSIONS: order?.WORKPIECE_DIMENSIONS,
        COATING: order?.COATING,
        MATERIAL: order?.MATERIAL,
        WEIGHT: order?.WEIGHT,
        SQUARE: order?.SQUARE,
        WORKPIECE_WEIGHT: order?.WORKPIECE_WEIGHT,
        WORKPIECE_MATERIAL_TYPE: order?.WORKPIECE_MATERIAL_TYPE,
      });
      if (!order.id) {
      }
    } else {
      form.resetFields();
      setACTypeID(undefined);
      setTaskType('PART_PRODUCE');
      console.log(order);
    }
  }, [order, form]);

  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {order && order?.id ? t('UPDATE') : t('CREATE')}
    </Button>
  );

  const { data: requirements, isLoading } = useGetFilteredRequirementsQuery(
    {
      projectTaskID: order?.id,
      ifStockCulc: true,
      includeAlternates: true,
    },
    {
      skip: !order?.id,
      refetchOnMountOrArgChange: true,
    }
  );
  const transformedRequirements = useMemo(() => {
    return transformToIRequirement(requirements || []);
  }, [requirements]);

  const handleCheckItems = useCallback(
    (selectedKeys: React.Key[]) => {
      // Управляем локальным состоянием, чтобы минимизировать вызовы onCheckItems
      setStepsSelected(selectedKeys);
      // onCheckItems(selectedKeys);
    },
    [onCheckItems]
  );

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
  const fakeTemplates = [
    {
      id: '1',
      name: 'PERFORMED',
      content: `TASK CARD 72-180-01-01 
      WAS PFMD. BSI REPORT 291-23 AMM REV 77, 
      FEB 15/22 SEE MATERIAL LIST.
      WO: 000129`,
      type: 'ACTIONS',
      planeType: 'BOEING737',
    },
    {
      id: '2',
      name: 'INSPECTION',
      content: `INSP PFMD IAW TASK CARD 72-180-01-01.
      AMM REV 77, FEB 15/22.
      WO: 000129
      INSP 407T1`,
      type: 'ACTIONS',
      planeType: 'BOEING737',
    },
    {
      id: '3',
      name: 'Template 3',
      content: 'Content of Template 3',
      type: 'ACTIONS',
      planeType: 'BOEING NG',
    },
    {
      id: '4',
      name: 'Template 4',
      content: 'Content of Template 4',
      type: 'STEPS',
      planeType: 'A320',
    },
    {
      id: '5',
      name: 'Template 5',
      content: 'Content of Template 5',
      type: 'ACTIONS',
      planeType: 'BOEING737',
    },
    {
      id: '6',
      name: 'Template 6',
      content: 'Content of Template 6',
      type: 'STEPS',
      planeType: 'A320',
    },
    {
      id: '7',
      name: 'Template 7',
      content: 'Content of Template 7',
      type: 'ACTIONS',
      planeType: 'BOEING NG',
    },
    // Добавьте другие фейковые шаблоны здесь
  ];
  const handleDelete = (file: any) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить этот файл?',
      onOk: async () => {
        try {
          const response = await dispatch(
            deleteFile({ id: file.id, companyID: COMPANY_ID })
          );
          if (response.meta.requestStatus === 'fulfilled') {
            // Удаляем файл из массива files
            const updatedFiles =
              order &&
              order?.FILES &&
              order?.FILES.filter((f: any) => f.id !== file?.id);
            const updatedOrderItem = {
              ...order,
              FILES: updatedFiles,
            };
            // await updateProjectItem(updatedOrderItem).unwrap();
            order && onSubmit(updatedOrderItem);
          } else {
            throw new Error('Не удалось удалить файл');
          }
        } catch (error) {
          message.error('ERROR');
        }
      },
    });
  };
  const handleUpload = async (file: File) => {
    if (!order || !order?._id) {
      console.error(
        'Невозможно загрузить файл: компания не существует или не имеет id'
      );
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await uploadFileServer(formData);

      if (response) {
        const updatedproject: any = {
          ...order,
          FILES: response,
        };
        const updatedOrderItem = {
          ...order,
          FILES: [...(order?.FILES || []), response],
        };
        updatedOrderItem && order && onSubmit(updatedOrderItem);
      } else {
        notification.error({
          message: t('FAILED TO UPLOAD'),
          description: t('There was an error uploading the file.'),
        });
      }
    } catch (error) {
      notification.error({
        message: t('FAILED TO UPLOAD'),
        description: t('There was an error uploading the file.'),
      });
      throw error;
    }
  };

  const handleDownload = (file: any) => {
    // Здесь должен быть код для скачивания файла

    handleFileOpen(file);
  };

  const handleDeleteUpload = (key: any) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить этот файл?',
      onOk: async () => {
        try {
          const response = await dispatch(
            deleteFileUploads({
              id: key,
              companyID: COMPANY_ID,
              type: 'projectTaskItem',
              itemID: order && order.id,
            })
          );
          notification.success({
            message: t('SUCCESS DELETE'),
            description: t('File delete successfully'),
          });
          setProjectTasksFormValues({
            ...projectTasksFormValues,
            time: new Date(),
          });
        } catch (error) {
          notification.error({
            message: t('ERROR'),
            description: t('Error delete files.'),
          });
        }
      },
    });
  };
  const { data: templates, isLoading: isTemplatesLoading } =
    useGetActionsTemplatesQuery({});

  const handleUploadReference = async (data: any) => {
    if (!order || !order.id) {
      console.error('Невозможно загрузить файл');
      return;
    }

    const formData = new FormData();
    formData.append('file', data?.file);
    formData.append('referenceType', data?.referenceType);
    // formData.append('taskNumber', data?.taskNumber);
    data?.customerCodeID &&
      formData.append('customerCodeID', data?.customerCodeID);
    formData.append('onSavedReference', 'true');
    order.id && formData.append('projectTaskID', order.id);
    formData.append('fileName', data.file.name);
    formData.append('companyID', COMPANY_ID);
    formData.append('createDate', new Date().toISOString());
    formData.append('createUserID', USER_ID || '');
    data?.efectivityACID &&
      formData.append('efectivityACID', data?.efectivityACID);

    try {
      const response = await uploadFileServerReference(formData);
      setProjectTasksFormValues({
        ...projectTasksFormValues,
        time: new Date(),
      });
      notification.success({
        message: t('SUCCESS UPLOAD'),
        description: t('File uploaded successfully'),
      });
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error File uploaded.'),
      });
    }
  };
  return (
    <PermissionGuard requiredPermissions={[Permission.EDIT_PROJECT_TASK]}>
      <ProForm
        onFinish={(values) => {
          onSubmit({
            ...values,
            projectTaskReferenceID: order?.projectTaskReferenceID,
            projectID: order?.projectID,
            projectId: order?.projectId,
            projectItemReferenceID: order?.projectItemReferenceID,
            removeInslallItemsIds: order?.removeInslallItemsIds,
            status: values?.status,
            PHASES: order?.PHASES,
            MPD_REFERENCE: order?.MPD,
            id: order.id,
            // taskId: order.taskId._id,
            _id: order.id,
          });
          // console.log({
          //   ...values,
          //   projectTaskReferenceID: order?.projectTaskReferenceID,
          //   projectID: order?.projectID,
          //   projectId: order?.projectId,
          //   projectItemReferenceID: order?.projectItemReferenceID,
          //   removeInslallItemsIds: order?.removeInslallItemsIds,
          //   status: order?.status,
          //   projectWO: order?.projectWO,
          //   PHASES: order?.PHASES,
          //   MPD_REFERENCE: order?.MPD,
          // });
        }}
        disabled={order && order?.status === 'closed'}
        size="small"
        form={form}
        submitter={{
          render: (_, dom) => [
            order &&
              activeTabKey !== '3' &&
              activeTabKey !== '4' &&
              activeTabKey !== '5' &&
              activeTabKey !== '2' && <SubmitButton key="submit" />,
            order &&
              activeTabKey !== '3' &&
              activeTabKey !== '4' &&
              activeTabKey !== '5' &&
              activeTabKey !== '2' &&
              dom.reverse()[1],
          ],
        }}
        layout="horizontal"
      >
        {/* <div className="h-[69vh] "> */}
        <Tabs
          activeKey={activeTabKey}
          onChange={(key) => setActiveTabKey(key)}
          defaultActiveKey="3"
          type="card"
        >
          <Tabs.TabPane tab={tabTitles['1']} key="1">
            {order ? (
              <div className=" h-[57vh] flex flex-col overflow-auto">
                <ProFormGroup>
                  <ProFormGroup>
                    <ProFormGroup direction="horizontal">
                      <ProFormSelect
                        disabled
                        showSearch
                        name="acTypeId"
                        label={t('AC TYPE')}
                        width="sm"
                        valueEnum={acTypeValueEnum}
                        onChange={(value: any) => setACTypeID(value)}
                      />
                      <ProFormSelect
                        showSearch
                        rules={[{ required: true }]}
                        name="status"
                        label={t('STATUS')}
                        width="sm"
                        // initialValue={'draft'}
                        options={[
                          // { value: 'planned', label: t('PLANNED') },
                          { value: 'open', label: t('OPEN') },
                          { value: 'inProgress', label: t('IN PROGRESS') },
                          { value: 'performed', label: t('PERFORMED') },
                          { value: 'inspect', label: t('INSPECTED') },
                          { value: 'closed', label: t('CLOSED') },
                          { value: 'canceled', label: t('CANCELED') },
                          // { value: 'transfer', label: t('TRANSFER') },
                        ]}
                      />
                    </ProFormGroup>

                    {taskType !== 'PART_PRODUCE' && (
                      <>
                        <ProFormSelect
                          disabled
                          mode={'multiple'}
                          showSearch
                          name="mpdDocumentationId"
                          label={t('MPD CODE')}
                          width="lg"
                          valueEnum={mpdCodesValueEnum}
                          // disabled={!acTypeID} // Disable the select if acTypeID is not set
                        />
                        <ProFormSelect
                          // disabled
                          showSearch
                          // initialValue={['PART_PRODUCE']}
                          name="projectItemType"
                          label={t('TASK TYPE')}
                          width="xl"
                          valueEnum={{
                            RC: {
                              text: t(
                                'RC (MPD, Customer MP, Access, CDCCL, ALI, STR inspection)'
                              ),
                            },
                            RC_ADD: {
                              text: t('RC (Critical Task, Double Inspection)'),
                            },

                            NRC: { text: t('NRC (Defect)') },
                            NRC_ADD: { text: t('ADHOC(Adhoc Task)') },
                            MJC: { text: t('MJC (Extended MPD)') },

                            CMJC: { text: t('CMJC (Component maintenance) ') },
                            FC: { text: t('FC (Fabrication card)') },
                          }}
                          onChange={(value: string) => setTaskType(value)}
                        />
                      </>
                    )}
                    {taskType === 'PART_PRODUCE' && (
                      <>
                        <ProFormSelect
                          // disabled
                          showSearch
                          name="projectItemType"
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                          label={t('TASK TYPE')}
                          width="xl"
                          valueEnum={{
                            RC: {
                              text: t(
                                'RC (MPD, Customer MP, Access, CDCCL, ALI, STR inspection)'
                              ),
                            },
                            RC_ADD: {
                              text: t('RC (Critical Task, Double Inspection)'),
                            },

                            NRC: { text: t('NRC (Defect)') },
                            NRC_ADD: { text: t('ADHOC(Adhoc Task)') },
                            MJC: { text: t('MJC (Extended MPD)') },

                            CMJC: { text: t('CMJC (Component maintenance) ') },
                            FC: { text: t('FC (Fabrication card)') },
                          }}
                          onChange={(value: string) => setTaskType(value)}
                        />
                        <ProFormText
                          disabled
                          width={'lg'}
                          name="taskNumber"
                          label={t('TASK NUMBER')}
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        />
                        <ProFormTextArea
                          // disabled
                          fieldProps={{
                            rows: 3,
                          }}
                          width="lg"
                          name="taskDescription"
                          label={t('DESCRIPTION')}
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        />
                        <ProFormTextArea
                          fieldProps={{
                            rows: 2,
                          }}
                          width="xl"
                          name="notes"
                          label={t('NOTE')}
                        />

                        <ProFormGroup>
                          <ProFormSelect
                            disabled
                            showSearch
                            rules={[{ required: true }]}
                            width={'sm'}
                            name="partNumberID"
                            label={`${t(`PART No`)}`}
                            // value={partNumber}
                            // onChange={(value, data: any) => {
                            //   // console.log(data);
                            //   form.setFields([
                            //     {
                            //       name: 'nameOfMaterial',
                            //       value: data.data.DESCRIPTION,
                            //     },
                            //     {
                            //       name: 'unit',
                            //       value: data.data.UNIT_OF_MEASURE,
                            //     },
                            //     { name: 'type', value: data.data.TYPE },
                            //     { name: 'group', value: data.data.GROUP },
                            //     {
                            //       name: 'WORKPIECE_DIMENSIONS',
                            //       value: data.data.WORKPIECE_DIMENSIONS,
                            //     },
                            //     {
                            //       name: 'MATERIAL',
                            //       value: data.data.MATERIAL,
                            //     },
                            //     {
                            //       name: 'WEIGHT',
                            //       value: data.data.WEIGHT,
                            //     },
                            //     {
                            //       name: 'SQUARE',
                            //       value: data.data.SQUARE,
                            //     },
                            //     {
                            //       name: 'COATING',
                            //       value: data.data.COATING,
                            //     },
                            //     {
                            //       name: 'WORKPIECE_WEIGHT',
                            //       value: data.data.WORKPIECE_WEIGHT,
                            //     },
                            //     {
                            //       name: 'WORKPIECE_MATERIAL_TYPE',
                            //       value: data.data.WORKPIECE_MATERIAL_TYPE,
                            //     },
                            //   ]);
                            // }}
                            options={Object.entries(partValueEnum).map(
                              ([key, part]) => ({
                                label: part.PART_NUMBER,
                                value: key,
                                data: part,
                              })
                            )}
                          />

                          <ProFormText
                            // disabled
                            name="nameOfMaterial"
                            label={t('DESCRIPTION')}
                            width="md"
                            tooltip={t('DESCRIPTION')}
                          ></ProFormText>
                          <ProFormText
                            // disabled
                            width="sm"
                            name="WORKPIECE_DIMENSIONS"
                            label={t('WORKPIECE DIMENSIONS')}
                          />
                          <ProFormText
                            // disabled
                            name="COATING"
                            label={t('COATING')}
                            width="sm"
                            tooltip={t('COATING')}
                          ></ProFormText>
                          <ProFormText
                            // disabled
                            name="MATERIAL"
                            label={t('MATERIAL')}
                            width="sm"
                            tooltip={t('MATERIAL')}
                          ></ProFormText>
                          <ProFormText
                            // disabled
                            name="WEIGHT"
                            label={t('WEIGHT')}
                            width="md"
                            tooltip={t('WEIGHT')}
                          ></ProFormText>
                          <ProFormText
                            // disabled
                            name="SQUARE"
                            label={t('SQUARE')}
                            width="sm"
                            tooltip={t('SQUARE')}
                          ></ProFormText>
                          <ProFormText
                            // disabled
                            name="WORKPIECE_WEIGHT"
                            label={t('WORKPIECE_WEIGHT')}
                            width="sm"
                            tooltip={t('WORKPIECE_WEIGHT')}
                          ></ProFormText>

                          <ProFormText
                            // disabled
                            name="WORKPIECE_MATERIAL_TYPE"
                            label={t('WORKPIECE_MATERIAL_TYPE')}
                            width="sm"
                            tooltip={t('WORKPIECE_MATERIAL_TYPE')}
                          ></ProFormText>
                        </ProFormGroup>
                        <ProFormText
                          width={'xs'}
                          name="rev"
                          label={t('REVISION')}
                        />

                        <ProFormGroup>
                          <ProFormDigit
                            width={'xs'}
                            name="mainWorkTime"
                            label={t('PART TIME')}
                          />
                          {/* <ProFormDigit
                      width={'sm'}
                      name="machineWorkTimeHours"
                      label={t('MACHINE TIME')}
                    /> */}
                        </ProFormGroup>
                      </>
                    )}
                    {taskType !== 'PART_PRODUCE' && (
                      <>
                        <ProFormGroup>
                          <ProFormText
                            // disabled={!order?.projectTaskReferenceID}
                            width={'xl'}
                            name="taskNumber"
                            label={t('TASK NUMBER')}
                          />
                          <ProFormText
                            disabled
                            width={'xs'}
                            name="rev"
                            label={t('REVISION')}
                          />
                          <ProFormDigit
                            // disabled={!order?.projectTaskReferenceID}
                            width={'xs'}
                            name="mainWorkTime"
                            label={t('MHS')}
                          />
                          <ProFormTextArea
                            fieldProps={{
                              // style: { resize: 'none' },
                              rows: 5,
                            }}
                            width="xl"
                            name="taskDescription"
                            label={t('DESCRIPTION')}
                            rules={[
                              {
                                required: true,
                              },
                            ]}
                          />
                        </ProFormGroup>
                        <ProFormTextArea
                          // disabled={!order?.projectTaskReferenceID}
                          width={'md'}
                          // fieldProps={{ style: { resize: 'none' } }}
                          name="amtoss"
                          label={t('TASK REFERENCE')}
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        />
                        <ProFormSelect
                          // disabled={!order?.projectTaskReferenceID}
                          showSearch
                          name="zonesID"
                          mode={'multiple'}
                          label={t('ZONES')}
                          width="sm"
                          valueEnum={zonesValueEnum}
                          // disabled={!acTypeID}
                        />
                        <ProFormSelect
                          // disabled={!order?.projectTaskReferenceID}
                          showSearch
                          name="accessID"
                          mode={'multiple'}
                          label={t('ACCESS')}
                          width="sm"
                          valueEnum={accessCodesValueEnum}
                          // disabled={!acTypeID}
                        />
                        <ProFormSelect
                          // disabled={!order?.projectTaskReferenceID}
                          showSearch
                          name="code"
                          label={t('TASK CODE')}
                          width="sm"
                          valueEnum={taskCodesValueEnum}
                          // disabled={!acTypeID}
                        />
                        <ProFormSelect
                          // disabled={!order?.projectTaskReferenceID}
                          showSearch
                          mode="multiple"
                          name="restrictionID"
                          label={t('RESTRICTION')}
                          width="sm"
                          valueEnum={restrictionValueEnum}
                          // disabled={!acTypeID}
                        />
                        <ProFormSelect
                          // disabled={!order?.projectTaskReferenceID}
                          mode="multiple"
                          showSearch
                          name="skillCodeID"
                          label={t('SKILL')}
                          width="sm"
                          options={groupSlills}
                          // valueEnum={taskCodesValueEnum}
                          // disabled={!acTypeID}
                        />
                        <ProFormTextArea
                          fieldProps={{
                            style: { resize: 'none' },
                            rows: 1,
                          }}
                          name="notes"
                          label={t('REMARKS')}
                          width="lg"
                        />
                        {/* <ProFormSelect
                    showSearch
                    name="status"
                    label={t('STATUS')}
                    width="sm"
                    valueEnum={{
                      ACTIVE: { text: t('ACTIVE'), status: 'SUCCESS' },
                      INACTIVE: { text: t('INACTIVE'), status: 'Error' },
                    }}
                  /> */}
                      </>
                    )}
                  </ProFormGroup>
                  <ProForm.Item label={t('UPLOAD')}>
                    <div className="overflow-y-auto max-h-64">
                      <Upload
                        name="FILES"
                        fileList={order?.FILES || []}
                        // listType="picture"
                        className="upload-list-inline cursor-pointer"
                        beforeUpload={handleUpload}
                        accept="image/*"
                        onPreview={handleDownload}
                        onRemove={handleDelete}
                        multiple
                        onDownload={function (file: any): void {
                          handleFileSelect({
                            id: file?.id,
                            name: file?.name,
                          });
                        }}
                      >
                        <Button icon={<UploadOutlined />}>
                          {t('CLICK TO UPLOAD')}
                        </Button>
                      </Upload>
                    </div>
                  </ProForm.Item>
                </ProFormGroup>
              </div>
            ) : (
              <Empty />
            )}
          </Tabs.TabPane>
          <Tabs.TabPane tab={tabTitles['3']} key="3">
            {(order?.id && projectItemID) ||
            (order?.id && order?.projectItemReferenceID) ? (
              <div className=" h-[60vh] flex flex-col overflow-auto pb-3">
                <StepContainer
                  steps={stepsToRender || []}
                  onAddStep={handleAddStep}
                  onDeleteStep={handleDeleteStep}
                  templates={templates}
                />
              </div>
            ) : (
              <Empty></Empty>
            )}
          </Tabs.TabPane>
          <Tabs.TabPane tab={tabTitles['5']} key="5">
            {order && order?.id ? (
              <PermissionGuard
                requiredPermissions={[Permission.REQUIREMENT_ACTIONS]}
              >
                <RequarementsList
                  isIssueVisibale={true}
                  onColumnResized={saveColumnState}
                  onGridReady={restoreColumnState}
                  order={order}
                  isAddVisiable={
                    order && order.status === 'closed' ? true : false
                  }
                  isChekboxColumn={true}
                  fetchData={transformedRequirements}
                  columnDefs={columnRequirements}
                  partNumbers={partNumbers || []}
                  taskId={order?.id}
                  onUpdateData={function (data: any[]): void {}}
                  height={'54Vh'}
                  onRowSelect={function (rowData: IRequirement | null): void {}}
                  onCheckItems={function (selectedKeys: any[]): void {
                    handleCheckItems(selectedKeys);
                    console.log(selectedKeys);
                  }}
                  onDelete={function (reqID: string): void {
                    throw new Error('Function not implemented.');
                  }}
                  onSave={function (rowData: IRequirement): void {
                    throw new Error('Function not implemented.');
                  }}
                ></RequarementsList>
              </PermissionGuard>
            ) : (
              <Empty></Empty>
            )}
          </Tabs.TabPane>
          <Tabs.TabPane tab={tabTitles['2']} key="2">
            <div className=" h-[62vh] flex flex-col overflow-auto pb-3">
              {order && !order?.projectItemReferenceID ? (
                <PartContainer
                  isButtonColumn={false}
                  isButtonVisiable={false}
                  isAddVisiable={true}
                  height={'58vh'}
                  columnDefs={columnDefs}
                  partNumbers={partNumbers || []}
                  onUpdateData={(data: any[]): void => {}}
                  rowData={
                    order?.partTaskID &&
                    transformToIPartNumber(
                      partsTask || [], // Передаем массив `order.partTaskID`
                      ['TOOL', 'GSE'] // Ваши группы инструментов
                    )
                  }
                  isLoading={isLoading}
                />
              ) : (
                <Empty></Empty>
              )}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab={tabTitles['4']} key="4">
            <div className=" h-[62vh] flex flex-col overflow-auto pb-3">
              {order && !order?.projectItemReferenceID ? (
                <PartContainer
                  isButtonColumn={false}
                  isButtonVisiable={false}
                  isLoading={isLoading}
                  isAddVisiable={true}
                  height={'58vh'}
                  columnDefs={columnDefs}
                  partNumbers={partNumbers || []}
                  onUpdateData={(data: any[]): void => {}}
                  rowData={
                    order?.partTaskID &&
                    transformToIPartNumber(
                      partsTask || [],
                      ['ROT', 'CONS', 'CHEM'] // Ваши группы инструментов
                    )
                  }
                />
              ) : (
                <Empty></Empty>
              )}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('DOCS')} key="6">
            <div>
              {order ? (
                <div
                // className="ag-theme-alpine flex"
                // style={{ width: '100%', height: '60vh' }}
                >
                  <FileListE
                    isEfectivityField={true}
                    isTaskNumberField={false}
                    handleDelete={handleDeleteUpload}
                    initialFiles={order?.reference || []}
                    onAddFile={function (file: any): void {
                      console.log(file);
                      handleUploadReference(file);
                    }}
                    // onSelectedKeys={setSelectedKeys}
                  ></FileListE>
                </div>
              ) : (
                <Empty />
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
        {/* </div> */}
      </ProForm>
    </PermissionGuard>
  );
};

export default WOAdminForm;
