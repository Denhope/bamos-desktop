//@ts-nocheck

// Добавьте в начало файла
const tableStyles = {
  '.zones-table .ant-table-tbody > tr > td': {
    padding: '8px 4px',
    verticalAlign: 'top',
  },
  '.zones-table .ant-table-tbody > tr': {
    height: 'auto',
    minHeight: '40px',
  },
  '.zones-table .ant-table-cell': {
    wordBreak: 'break-word',
  },
};

import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Row,
  Col,
  Modal,
  message,
  Space,
  Spin,
  Empty,
  Switch,
  notification,
  Table,
  Tag,
} from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { TaskFilteredFormValues } from './AdminTaskFilterdForm';
import { useTypedSelector } from '@/hooks/useTypedSelector';

import AdminTaskPanelTree from './AdminTaskPanelTree';
import AdminTaskPanelForm from './AdminTaskPanelForm';
import { ITask, ITaskResponce } from '@/models/ITask';
import { Split } from '@geoffcox/react-splitter';
import FileUploader from '@/components/shared/FileUploader';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';
import {
  getTaskTypeColor,
  transformToITask,
  ValueEnumTypeTask,
} from '@/services/utilites';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import { useGlobalState } from '@/components/woAdministration/GlobalStateContext';
import {
  useAddMultiTaskItemsMutation,
  useAddTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from '@/features/tasksAdministration/tasksApi';
import FileUploaderV2 from '@/components/shared/FileUploaderV2';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';
import { useGetMPDCodesQuery } from '@/features/MPDAdministration/mpdCodesApi';
import { useGetGroupTaskCodesQuery } from '@/features/tasksAdministration/taskCodesApi';
import { useGetSkillsQuery } from '@/features/userAdministration/skillApi';
import { useGetFilteredZonesQuery } from '@/features/zoneAdministration/zonesApi';
import ZonesTab from './ZonesTab';
import styles from './AdminTaskPanel.module.css';

interface AdminPanelProps {
  values: TaskFilteredFormValues;
  isLoadingF?: boolean;
}

// Обновляем интерфейс ValidationResult
interface ValidationResult {
  row: number;
  status: 'success' | 'error';
  fieldErrors: {
    fieldName: string;
    value: string;
    message: string;
  }[];
}

// Добавляем интерфейсы для типизации
interface AdditionalSelect {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  mode?: 'multiple' | undefined;
  required?: boolean;
  disabled?: boolean;
  width?: number;
  dependsOn?: string;
  onChange?: (value: any) => void;
}

// Добавляем интерфейс для валидных интервалов
interface IntervalCode {
  code: string;
  description: string;
}

// Обновляем список валидных интервалов
const validIntervals = [
  '1C',
  '2A',
  '2C',
  '4C',
  '8A',
  '8C',
  // Добавляем стандартные форматы
  'FC',
  'FH',
  'MO',
  'YR',
  'WK',
  'DY',
];

// Обновляем функцию валидации интервала
const validateInterval = (interval: string): boolean => {
  if (!interval) return false;

  const trimmedInterval = interval.trim().toUpperCase();

  // Проверяем числовые коды (1C, 2A, 8A и т.д.)
  if (validIntervals.includes(trimmedInterval)) {
    return true;
  }

  // Проверяем стандартные форматы (3000 FC, 5000 FH и т.д.)
  const standardPattern = /^\d+\s*(FC|FH|MO|YR|WK|DY)$/i;
  return standardPattern.test(trimmedInterval);
};

// Обновляем конфигурацию для отображения в интерфейсе
const getIntervalsConfig = () => ({
  title: 'INTERVALS',
  type: 'table',
  headers: ['Code', 'Description', 'Example'],
  content: [
    // Стандартные интервалы
    ['FC', 'Flight Cycles', '3000 FC'],
    ['FH', 'Flight Hours', '5000 FH'],
    ['MO', 'Months', '12 MO'],
    ['YR', 'Years', '2 YR'],
    ['WK', 'Weeks', '6 WK'],
    ['DY', 'Days', '30 DY'],
    // Числовые коды
    ['1C', 'Check 1', '1C'],
    ['2A', 'Check 2A', '2A'],
    ['2C', 'Check 2C', '2C'],
    ['4C', 'Check 4C', '4C'],
    ['8A', 'Check 8A', '8A'],
    ['8C', 'Check 8C', '8C'],
  ],
});

// Обновляем сообщения об ошибках
const translations = {
  ru: {
    VALIDATION: {
      INVALID_INTERVAL_FORMAT:
        'Неверный формат интервала: {{value}}. Примеры: 3000 FC, 5000 FH, 12 MO, 1C, 2A, 8C',
      INVALID_INTERVAL_REPEAT_FORMAT:
        'Неверный формат интервала повторения: {{value}}. Примеры: 3000 FC, 5000 FH, 12 MO, 1C, 2A, 8C',
      INTERVAL_REQUIRED: 'Интервал обязателен для задач типа SMC',
      INTERVAL_REPEAT_REQUIRED:
        'Интервал повторения обязателен для задач типа SMC',
      TASK_NUMBER_REQUIRED: 'Номер задачи обязателен',
      TASK_DESCRIPTION_REQUIRED: 'Описание задачи обязательно',
      INVALID_TASK_CODE: 'Неверный код задачи: {{code}}',
      INVALID_ZONES:
        'Неверные коды зон: {{codes}}. Доступные зоны: {{availableZones}}',
      SKILL_CODES_REQUIRED: 'Коды навыков обязательны',
    },
    FIELD: {
      taskNumber: 'Номер задачи',
      taskDescription: 'Описание задачи',
      code: 'Код задачи',
      ZONE: 'Зона',
      skillCodeID: 'Код навыка',
      INTERVAL: 'Интервал',
      INTERVAL_REPEAT: 'Интервал повторения',
      // ... другие поля
    },
  },
};

// Добавляем интерфейс для зон
interface Zone {
  _id: string;
  majoreZoneNbr: string;
  subZoneNbr?: string;
  areaNbr?: string;
  majoreZoneDescription?: string;
  subZoneDescription?: string;
  areaDescription?: string;
}

// Функция для создания полного номера зоны
const createFullZoneNumber = (zone: Zone): string[] => {
  const results: string[] = [];

  // Добавляем основную зону
  const majorZone = zone.majoreZoneNbr.toString().padStart(3, '0');
  results.push(majorZone);

  // Добавляем подзону если есть
  if (zone.subZoneNbr) {
    const subZone = zone.subZoneNbr.toString().padStart(3, '0');
    results.push(subZone);
  }

  // Добавляем зону области если есть
  if (zone.areaNbr) {
    const areaZone = zone.areaNbr.toString().padStart(3, '0');
    results.push(areaZone);
  }

  return results;
};

const AdminTaskPanel: React.FC<AdminPanelProps> = ({ values, isLoadingF }) => {
  // Состояния
  const [editingvendor, setEditingvendor] = useState<ITask | null>(null);
  const [selectedItems, setSelectedItems] = useState<React.Key[] | []>([]);
  const [selectedAcType, setSelectedAcType] = useState<string>('');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('');
  const [isTreeView, setIsTreeView] = useState(false);

  // Получаем зоны для выбранного типа ВС
  const { data: zones, isLoading: zonesLoading } = useGetFilteredZonesQuery(
    { acTypeId: selectedAcType },
    { skip: !selectedAcType }
  );

  // Обновляем создание zonesMap с лучшим форматированием
  const zonesMap = useMemo(() => {
    console.group('🗺️ Creating zones map');

    if (!zones?.length) {
      console.log('⚠️ No zones data available');
      console.groupEnd();
      return {};
    }

    // Форматируем номера зон в правильном формате (3 цифры)
    const map = zones.reduce((acc: { [key: string]: string }, zone) => {
      // Основная зона
      const majorZone = String(zone.majoreZoneNbr).padStart(3, '0');
      acc[majorZone] = zone._id;

      // Подзона
      if (zone.subZoneNbr) {
        const subZone = String(zone.subZoneNbr).padStart(3, '0');
        acc[subZone] = zone._id;
      }

      // Зона области
      if (zone.areaNbr) {
        const areaZone = String(zone.areaNbr).padStart(3, '0');
        acc[areaZone] = zone._id;
      }

      return acc;
    }, {});

    // Сортируем �� логируем доступные номера зон
    const availableZones = Object.keys(map).sort(
      (a, b) => Number(a) - Number(b)
    );
    console.log('📊 Available zone numbers:', availableZones);
    console.groupEnd();

    return map;
  }, [zones]);

  const {
    data: tasksQuery,
    refetch: refetchTasks,
    isLoading,
    isFetching: isFetchungQuery,
  } = useGetTasksQuery(
    {
      acTypeID: values?.acTypeId,
      time: values?.time,
      amtoss: values?.AMM,
      taskNumber: values?.taskNumber,
      cardNumber: values?.cardNumber?.toString(),
      mpdDocumentationId: values?.mpdDocumentationId,
      taskType: values?.taskType?.toString(),
      isCriticalTask: values?.isCriticalTask,
    },
    { skip: !values }
  );

  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [addMultiTask] = useAddMultiTaskItemsMutation();
  const handleCreate = () => {
    setEditingvendor(null);
  };
  const { t } = useTranslation();
  const handleEdit = (vendor: ITask) => {
    setEditingvendor(vendor);
  };

  const handleDelete = async (items: React.Key[]) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS TASK?'),
      onOk: async () => {
        try {
          await deleteTask(items.toString()).unwrap();
          notification.success({
            message: t('SUCCESS'),
            description: t('TASK SUCCESSFULLY DELETED'),
          });
          setEditingvendor(null);
        } catch (error) {
          notification.error({
            message: t('ERROR'),
            description: t('ERROR DELETING TASK'),
          });
        }
      },
    });
  };
  const valueEnumTask: ValueEnumTypeTask = {
    RC: t('TC'),
    CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
    NRC: t('NRC (DEFECT)'),
    NRC_ADD: t('ADHOC (ADHOC TASK)'),
    MJC: t('MJC'),
    CMJC: t('CMJC'),
    FC: t('FC'),
    SMC: t('SMC'),
    SB: t('SB'),
    HARD_ACCESS: t('HARD_ACCESS'),
  };
  const valueEnumTaskType: any = {
    // RC: t('TC'),
    // CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
    // NRC: t('NRC (DEFECT)'),
    // NRC_ADD: t('ADHOC (ADHOC TASK)'),
    // MJC: t('MJC'),
    // CMJC: t('CMJC'),
    // FC: t('FC'),
    SMC: t('SMC'),
    // SB: t('SB'),
    HARD_ACCESS: t('HARD_ACCESS'),
  };
  const handleSubmit = async (task: ITask) => {
    try {
      if (editingvendor) {
        await updateTask(task).unwrap();
        notification.success({
          message: t('SUCCESS'),
          description: t('TASK SUCCESSFULLY UPDATED'),
        });
      } else {
        await addTask({ task }).unwrap();
        notification.success({
          message: t('SUCCESS'),
          description: t('TASK SUCCESSFULLY ADDED'),
        });
      }
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('ERROR SAVING TASK'),
      });
    }
  };

  const columnDefs: any[] = [
    {
      field: 'cardNumber',
      headerName: `${t('CARD No')}`,
      filter: true,
      width: 100,
    },
    {
      field: 'taskNumber',
      headerName: `${t('TASK No')}`,
      filter: true,
    },
    {
      field: 'taskType',
      headerName: `${t('TASK TYPE')}`,
      filter: true,
      valueGetter: (params: { data: { taskType: keyof ValueEnumTypeTask } }) =>
        params.data.taskType,
      valueFormatter: (params: { value: keyof ValueEnumTypeTask }) => {
        const status = params.value;
        return valueEnumTask[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumTypeTask }) => ({
        backgroundColor: getTaskTypeColor(params.value),
      }),
    },
    { field: 'description', headerName: `${t('DESCRIPTION')}`, filter: true },
    {
      field: 'rev',
      headerName: `${t('REVISION')}`,
      filter: true,
    },
    { field: 'MPD', headerName: `${t('MPD')}`, filter: true },
    { field: 'amtoss', headerName: `${t('REFERENCE')}`, filter: true },
    { field: 'ZONE', headerName: `${t('ZONE')}`, filter: true },
    { field: 'ACCESS', headerName: `${t('ACCESS')}`, filter: true },
    { field: 'ACCESS_NOTE', headerName: `${t('ACCESS_NOTE')}`, filter: true },
    { field: 'SKILL_CODE1', headerName: `${t('SKILL_CODE')}`, filter: true },
    { field: 'TASK_CODE', headerName: `${t('TASK_CODE')}`, filter: true },
    {
      field: 'SUB TASK_CODE',
      headerName: `${t('SUB TASK_CODE')}`,
      filter: true,
    },
    { field: 'PHASES', headerName: `${t('PHASES')}`, filter: true },
    {
      field: 'RESTRICTION_1',
      headerName: `${t('RESTRICTION_1')}`,
      filter: true,
    },
    {
      field: 'PREPARATION_CODE',
      headerName: `${t('PREPARATION_CODE')}`,
      filter: true,
    },
    {
      field: 'REFERENCE_2',
      headerName: `${t('REFERENCE_2')}`,
      filter: true,
    },
    {
      field: 'mainWorkTime',
      headerName: `${t('MHS')}`,
      filter: true,
    },
    {
      field: 'createDate',
      headerName: `${t('CREATE DATE')}`,
      filter: true,
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
  ];
  const { data: acTypes } = useGetACTypesQuery({});

  const { data: mpdCodes } = useGetMPDCodesQuery({ acTypeID: selectedAcType });
  const { data: taskCodes } = useGetGroupTaskCodesQuery(
    { acTypeID: selectedAcType },
    { skip: !selectedAcType }
  );

  const taskCodeMap = useMemo(() => {
    if (!taskCodes) return {};
    return taskCodes.reduce((acc: { [key: string]: string }, code) => {
      acc[code.code] = code.id;
      return acc;
    }, {});
  }, [taskCodes]);

  // Получаем данные о специальностях
  const { data: skills } = useGetSkillsQuery({});

  // Созда таблицу специальностей на основе полученных данных
  const skillCodesTable = useMemo(() => {
    if (!skills) return [];

    return skills.map((skill) => [
      skill.code,
      skill.name || skill.description || skill.code,
    ]);
  }, [skills]);

  const additionalSelects: AdditionalSelect[] = [
    {
      key: 'acTypeId',
      label: 'SELECT_AC_TYPE',
      options: (acTypes || []).map((acType) => ({
        value: acType.id,
        label: acType.name,
      })),
      required: true,
      width: 400,
    },
    {
      key: 'mpdDocumentationId',
      label: 'SELECT_MPD_CODES',
      options: (mpdCodes || []).map((mpdCode) => ({
        value: mpdCode.id,
        label: mpdCode.code,
      })),
      mode: 'multiple',
      dependsOn: 'acTypeId',
      width: 400,
    },
  ];

  const [selectedMpdCodes, setSelectedMpdCodes] = useState<string[]>([]);

  const onSelectChange = (key: string, value: any) => {
    if (key === 'acTypeId') {
      setSelectedAcType(value);
      setSelectedMpdCodes([]);
    } else if (key === 'mpdDocumentationId') {
      setSelectedMpdCodes(value);
    }
  };

  // Обновляем функцию валидации кода
  const validateZone = (zoneCode: string): boolean => {
    console.group(`🔍 Validating zone: ${zoneCode}`);

    // Проверяем формат (3 цифры)
    const formattedCode = String(zoneCode).padStart(3, '0');
    const isValidFormat = /^\d{3}$/.test(formattedCode);

    if (!isValidFormat) {
      console.log('❌ Invalid zone format');
      console.groupEnd();
      return false;
    }

    // Проверяем существование в zonesMap
    const exists = !!zonesMap[formattedCode];
    console.log(`${exists ? '✅' : '❌'} Zone exists: ${exists}`);
    console.groupEnd();

    return exists;
  };

  // Обновляем функцию парсинга зон
  const parseZones = (zoneString: string): string[] => {
    if (!zoneString) return [];

    // Нормализуем строку и разбиваем на отдельные коды
    return zoneString
      .replace(/\s+/g, ',')
      .replace(/\n/g, ',')
      .replace(/\+/g, ',')
      .split(',')
      .map((code) => String(code.trim()).padStart(3, '0'))
      .filter((code) => validateZone(code));
  };

  // Обновляем функцию алидации
  const validateData = (data: any[]): ValidationResult[] => {
    return data.map((row, index) => {
      const fieldErrors: ValidationResult['fieldErrors'] = [];

      // Проверяем каждое поле
      Object.entries(row).forEach(([fieldName, value]) => {
        switch (fieldName) {
          case 'taskNumber':
            if (!value) {
              fieldErrors.push({
                fieldName,
                value: String(value),
                message: t('VALIDATION.TASK_NUMBER_REQUIRED'),
              });
            }
            break;

          case 'taskDescription':
            if (!value) {
              fieldErrors.push({
                fieldName,
                value: String(value),
                message: t('VALIDATION.TASK_DESCRIPTION_REQUIRED'),
              });
            }
            break;

          case 'code':
            if (!taskCodeMap[value]) {
              fieldErrors.push({
                fieldName,
                value: String(value),
                message: t('VALIDATION.INVALID_TASK_CODE', { code: value }),
              });
            }
            break;

          case 'ZONE':
            if (value) {
              const zoneCodes = parseZones(String(value));
              const invalidZones = zoneCodes.filter((code) => !zonesMap[code]);
              if (invalidZones.length > 0) {
                fieldErrors.push({
                  fieldName,
                  value: String(value),
                  message: t('VALIDATION.INVALID_ZONES', {
                    codes: invalidZones.join(', '),
                    availableZones: Object.keys(zonesMap).join(', '),
                  }),
                });
              }
            }
            break;

          case 'skillCodeID':
            if (!value || (Array.isArray(value) && value.length === 0)) {
              fieldErrors.push({
                fieldName,
                value: String(value),
                message: t('VALIDATION.SKILL_CODES_REQUIRED'),
              });
            }
            break;

          // Добавляем другие поля по необходимости
        }
      });

      return {
        row: index + 2, // +2 для учета заголовка и 0-based индекса
        status: fieldErrors.length === 0 ? 'success' : 'error',
        fieldErrors,
      };
    });
  };

  // Обновляем отображение результатов валидации
  const renderValidationResults = (results: ValidationResult[]) => {
    return (
      <Table
        dataSource={results}
        columns={[
          {
            title: t('ROW'),
            dataIndex: 'row',
            width: 80,
          },
          {
            title: t('STATUS'),
            dataIndex: 'status',
            width: 100,
            render: (status) => (
              <Tag color={status === 'success' ? 'green' : 'red'}>
                {status.toUpperCase()}
              </Tag>
            ),
          },
          {
            title: t('ERRORS'),
            dataIndex: 'fieldErrors',
            render: (fieldErrors) => (
              <ul className="list-none m-0 p-0">
                {fieldErrors.map((error, index) => (
                  <li key={index} className="mb-1">
                    <strong>{t(`FIELD.${error.fieldName}`)}: </strong>
                    <span className="text-red-500">{error.value}</span>
                    <br />
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
            ),
          },
        ]}
        pagination={false}
        size="small"
        className="validation-results-table"
      />
    );
  };

  // Перемещаем функции внутрь компонента
  const getTaskFieldsConfig = (currentSkills: any[]) => ({
    title: 'TASK_FIELDS',
    type: 'table',
    headers: ['Field', 'Required', 'Example'],
    content: {
      SMC: [
        ['taskNumber', '✓', 'SMC-001'],
        ['taskDescription', '✓', 'Inspect landing gear'],
        ['code', '✓', 'SMC-LG'],
        ['mainWorkTime', '✓', '2.5'],
        ['skillCodeID', '✓', currentSkills?.[0]?.code || 'SKILL1, SKILL2'],
        ['IDENTIFICATOR', '✓', 'ROUTINE'],
        ['INTERVAL', '✓', '3000 FC'],
        ['INTERVAL_REPEAT', '✓', '3000 FC'],
        ['JOB_ZONE', '✓', 'FUS'],
        ['MPD', '✓', '25-170-00'],
      ],
      HARD_ACCESS: [
        ['taskNumber', '✓', 'HA-001'],
        ['taskDescription', '✓', 'Remove panel 125'],
        ['code', '✓', 'HA-HYD'],
        ['mainWorkTime', '✓', '2.5'],
        ['skillCodeID', '✓', currentSkills?.[0]?.code || 'SKILL1'],
        ['OPEN_MHR', '✓', '1.0'],
        ['CLOSE_MHR', '✓', '1.0'],
      ],
      PART_PRODUCE: [
        ['taskNumber', '✓', 'PP-001'],
        ['taskDescription', '✓', 'Produce bracket assembly'],
        ['code', '✓', 'PP-BA'],
        ['mainWorkTime', '✓', '4.0'],
        ['skillCodeID', '✓', currentSkills?.[0]?.code || 'SKILL1'],
        ['title', '✓', 'Bracket Assembly'],
        ['amtoss', '✓', 'DWG-123-456'],
      ],
    },
  });

  const getSkillCodesConfig = (currentSkillCodesTable: any[]) => ({
    title: 'SKILL_CODES',
    type: 'table',
    headers: ['Code', 'Description'],
    content: currentSkillCodesTable,
  });

  const getTaskCodesConfig = () => {
    const availableCodes =
      taskCodes?.map((code) => [
        code.code,
        code.description || code.code,
        `${code.code}-001`,
      ]) || [];

    return {
      title: 'TASK_CODES',
      type: 'table',
      headers: ['Code', 'Description', 'Example'],
      content: availableCodes,
    };
  };

  const getZonesConfig = () => {
    // Группируем данные
    const groupedZones = zones?.reduce((acc: any[], zone) => {
      const existingZone = acc.find(
        (z) =>
          z.majoreZoneNbr === zone.majoreZoneNbr &&
          z.subZoneNbr === zone.subZoneNbr
      );

      if (existingZone) {
        // Если такая зона уже есть, добавляем только area информацию
        existingZone.areas = existingZone.areas || [];
        if (zone.areaNbr) {
          existingZone.areas.push({
            areaNbr: zone.areaNbr,
            areaDescription: zone.areaDescription,
          });
        }
      } else {
        // Если новая зона, создаем новую запись
        acc.push({
          majoreZoneNbr: zone.majoreZoneNbr,
          subZoneNbr: zone.subZoneNbr,
          subZoneDescription: zone.subZoneDescription,
          areas: zone.areaNbr
            ? [
                {
                  areaNbr: zone.areaNbr,
                  areaDescription: zone.areaDescription,
                },
              ]
            : [],
          description: zone.majoreZoneDescription,
        });
      }
      return acc;
    }, []);

    // Сортируем по majoreZoneNbr и subZoneNbr
    const sortedZones = groupedZones?.sort((a, b) => {
      const majorCompare = Number(a.majoreZoneNbr) - Number(b.majoreZoneNbr);
      if (majorCompare !== 0) return majorCompare;
      return Number(a.subZoneNbr || 0) - Number(b.subZoneNbr || 0);
    });

    const formattedContent = sortedZones?.map((zone) => [
      zone.majoreZoneNbr,
      zone.subZoneNbr ? `${zone.subZoneNbr} - ${zone.subZoneDescription}` : '',
      zone.areas.map((a: any) => a.areaNbr).join(', ') || '-',
      zone.areas.map((a: any) => a.areaDescription).join(', ') || '-',
      zone.description,
    ]);

    return {
      type: 'table',
      headers: [
        t('ZONE_CODE'),
        t('SUB_ZONES'),
        t('AREA_CODE'),
        t('AREA_DESCRIPTION'),
        t('DESCRIPTION'),
      ],
      content: formattedContent,
      tableProps: {
        scroll: { y: 'calc(100vh - 380px)' },
        pagination: { pageSize: 15 },
        className: 'zones-table',
        size: 'small',
        columns: [
          {
            title: t('ZONE_CODE'),
            dataIndex: '0',
            width: 60,
            fixed: 'left',
            className: 'column-zone-code',
          },
          {
            title: t('SUB_ZONES'),
            dataIndex: '1',
            width: 120,
            className: 'column-sub-zones',
          },
          {
            title: t('AREA_CODE'),
            dataIndex: '2',
            width: 80,
            className: 'column-area-code',
          },
          {
            title: t('AREA_DESCRIPTION'),
            dataIndex: '3',
            width: 180,
            className: 'column-area-description',
          },
          {
            title: t('DESCRIPTION'),
            dataIndex: '4',
            width: 180,
            className: 'column-description',
          },
        ],
        style: {
          '.zones-table': {
            width: '620px', // Сумма всех колонок
            tableLayout: 'fixed',
            wordBreak: 'break-word',
            whiteSpace: 'normal',
          },
          '.zones-table .ant-table-thead > tr > th': {
            padding: '8px 4px',
            whiteSpace: 'normal',
            height: 'auto',
            backgroundColor: '#fafafa',
            fontWeight: 'bold',
          },
          '.zones-table .ant-table-tbody > tr > td': {
            padding: '4px',
            whiteSpace: 'normal',
            height: 'auto',
            verticalAlign: 'top',
            lineHeight: '1.2',
          },
          '.column-zone-code': {
            width: '60px !important',
          },
          '.column-sub-zones': {
            width: '120px !important',
          },
          '.column-area-code': {
            width: '80px !important',
          },
          '.column-area-description': {
            width: '180px !important',
          },
          '.column-description': {
            width: '180px !important',
          },
          '.ant-table-cell': {
            wordBreak: 'break-word !important',
            whiteSpace: 'normal !important',
            overflow: 'hidden !important',
            textOverflow: 'ellipsis !important',
          },
        },
      },
    };
  };

  const getTaskTypeInstructions = (taskType: string) => {
    const taskFieldsConfig = getTaskFieldsConfig(skills || []);
    const skillCodesConfig = getSkillCodesConfig(skillCodesTable);
    const intervalsConfig = getIntervalsConfig();
    const textInstructions = getTextInstructionsConfig(taskType);
    const taskCodesConfig = getTaskCodesConfig();
    const zonesConfig = getZonesConfig();

    return {
      tabs: [
        {
          key: 'instructions',
          label: t('INSTRUCTIONS'),
          content: textInstructions,
        },
        {
          key: 'fields',
          label: t('REQUIRED_FIELDS'),
          content: {
            type: 'table',
            ...taskFieldsConfig,
            content:
              taskFieldsConfig.content[
                taskType as keyof typeof taskFieldsConfig.content
              ],
          },
        },
        {
          key: 'task_codes',
          label: t('TASK_CODES'),
          content: taskCodesConfig,
        },
        {
          key: 'skills',
          label: t('AVAILABLE_SKILLS'),
          content: skillCodesConfig,
        },
        {
          key: 'zones',
          label: t('AVAILABLE_ZONES'),
          // content: zonesConfig,
          content: <></>,
        },
        ...(taskType === 'SMC'
          ? [
              {
                key: 'intervals',
                label: t('INTERVAL_FORMATS'),
                content: intervalsConfig,
              },
            ]
          : []),
      ],
    };
  };

  const getTemplateConfig = (taskType: string) => ({
    fields: [
      // Базовые оля всегда присутствую
      {
        name: 'taskNumber',
        displayName: t('TASK_NUMBER'),
        required: true,
        description: 'TASK_NUMBER_DESCRIPTION',
        example: 'TASK-001',
        width: 15,
      },
      {
        name: 'taskDescription',
        displayName: t('TASK_DESCRIPTION'),
        required: true,
        description: 'TASK_DESCRIPTION_HELP_TEXT',
        example: 'Replace the wheel assembly',
        width: 40,
      },
      {
        name: 'mainWorkTime',
        displayName: t('MHS '),
        required: true,
        description: 'MHS_DESCRIPTION',
        example: '10',
        width: 15,
        validation: (value: string) => {
          const pattern = /^\d+(\.\d{1,2})?$/;
          return pattern.test(value);
        },
      },
      {
        name: 'code',
        displayName: t('TASK_CODE '),
        required: true,
        description: 'TASK_CODE_DESCRIPTION',
        example: 'GVI',
        width: 15,
        validation: (value: string) => {
          console.log('Validating code:', value);
          console.log('Available codes:', Object.keys(taskCodeMap));

          // Проверяем, сущствует ли код в мапе
          const isValid = !!taskCodeMap[value];

          if (!isValid) {
            console.log(
              `Code ${value} not found in available codes:`,
              taskCodeMap
            );
          }

          return isValid;
        },
      },
      {
        name: 'title', // Добавляем title
        displayName: t('TASK_TITLE'),
        required: true,
        description: 'TASK_TITLE_DESCRIPTION',
        example: 'Wheel Assembly Replacement',
        width: 30,
        validation: (value: string) => {
          return value.length > 0;
        },
      },
      {
        name: 'amtoss', // Добавляем amtoss
        displayName: t('AMTOSS'),
        required: true,
        description: 'AMTOSS_DESCRIPTION',
        example: 'AMM 32-41-11',
        width: 20,
        validation: (value: string) => {
          return value.length > 0;
        },
      },
      {
        name: 'isCriticalTask',
        displayName: t('IS_CRITICAL_TASK'),
        required: true,
        description: t('IS_CRITICAL_TASK_DESCRIPTION'),
        example: 'true',
        width: 15,
        validation: (value: any) => {
          const strValue = String(value).toLowerCase();
          return strValue === 'true' || strValue === 'false';
        },
      },
      {
        name: 'skillCodeID',
        displayName: t('SKILL_CODES'),
        required: true,
        description: t('SKILL_CODES_DESCRIPTION'),
        example: 'AVI',
        width: 20,
      },
      // Доолнительные поля только для SMC
      ...(taskType === 'SMC'
        ? [
            {
              name: 'IDENTIFICATOR',
              displayName: t('IDENTIFICATOR'),
              required: true,
              description: 'IDENTIFICATOR_DESCRIPTION',
              example: 'ROUTINE',
              width: 15,
              validation: (value: string) =>
                ['ROUTINE', 'SPECIAL', 'CRITICAL'].includes(value),
            },
            {
              name: 'INTERVAL',
              displayName: t('INTERVAL '),
              required: true,
              description: 'INTERVAL_DESCRIPTION',
              example: '3000 FC, 1C, 8A',
              width: 15,
              // validation: validateInterval,
            },
            {
              name: 'INTERVAL_REPEAT',
              displayName: t('INTERVAL_REPEAT '),
              required: true,
              description: 'INTERVAL_REPEAT_DESCRIPTION',
              example: '3000 FC, 1C, 8A',
              width: 15,
              // validation: validateInterval,
            },
            {
              name: 'JOB_ZONE',
              displayName: t('JOB_ZONE'),
              required: true,
              description: 'JOB_ZONE_DESCRIPTION',
              example: 'FUS',
              width: 15,
            },
            {
              name: 'MPD',
              displayName: t('MPD '),
              required: true,
              description: 'MPD_DESCRIPTION',
              example: '25-170-00',
              width: 15,
              validation: (value: string) => {
                return value.length > 0;
              },
            },
            {
              name: 'zonesID',
              displayName: t('ZONE'),
              required: true,
              description: t('ZONE_DESCRIPTION'),
              example: '100,200+300\n400',
              width: 20,
              validation: (value: string) => {
                if (!value) return false;
                const codes = parseZones(value);
                return codes.every((code) => !!zonesMap[code]);
              },
            },
          ]
        : []),
      ...(taskType === 'HARD_ACCESS'
        ? [
            {
              name: 'OPEN_MHR',
              displayName: t('OPEN_MHR'),
              required: true,
              description: 'OPEN_MHR_DESCRIPTION',
              example: '1.0',
              width: 15,
            },
            {
              name: 'CLOSE_MHR',
              displayName: t('CLOSE_MHR'),
              required: true,
              description: 'CLOSE_MHR_DESCRIPTION',
              example: '1.0',
              width: 15,
            },
          ]
        : []),
    ],
    templateFileName: `tasks_template_${taskType.toLowerCase()}.xlsx`,
    additionalInstructions: getTaskTypeInstructions(taskType),
  });

  // Добавляем запрос навыков
  const { data: usersGroup } = useGetSkillsQuery({});

  // Создаем мапу навыков с логированием
  const skillsMap = useMemo(() => {
    console.log('Creating skills map from:', usersGroup);
    if (!usersGroup) return {};

    const map = usersGroup.reduce(
      (acc: { [key: string]: string }, skill: any) => {
        // Используем _id весто id
        acc[skill.code] = skill._id || skill.id;
        return acc;
      },
      {}
    );

    console.log('Available skill codes:', Object.keys(map));
    console.log('Skills map:', map);
    return map;
  }, [usersGroup]);

  // Обновляем handleAddMultiItems
  const handleAddMultiItems = async (data: any) => {
    try {
      console.group('🔄 Processing import data');
      console.log('📥 Initial data:', data);

      // Логируем доступные зоны с описаниями
      console.group('📊 Available Zones');
      zones?.forEach((zone) => {
        console.log(`Zone ${zone.majoreZoneNbr}:`, {
          description: zone.majoreZoneDescription,
          subZone: zone.subZoneNbr,
          subZoneDesc: zone.subZoneDescription,
          area: zone.areaNbr,
          areaDesc: zone.areaDescription,
        });
      });
      console.groupEnd();

      const processedData = data.map((item: any) => {
        console.group(`Processing item with zonesID: ${item.zonesID}`);

        const {
          code,
          skillCodeID,
          zonesID: inputZonesID,
          isCriticalTask,
          ...restItem
        } = item;

        // Обработка зон
        let processedZonesID: string[] = [];
        let normalizedZones: string = '';

        if (inputZonesID !== undefined && inputZonesID !== null) {
          const zoneNumbers = parseZones(inputZonesID);
          console.log('📊 Parsed zone numbers:', zoneNumbers);

          normalizedZones = zoneNumbers.join(',');
          console.log('📝 Normalized zones string:', normalizedZones);

          processedZonesID = zoneNumbers
            .map((zoneNumber) => {
              console.log(
                `🔍 Looking for zone ${zoneNumber} in map:`,
                zonesMap[zoneNumber]
              );
              const zoneId = zonesMap[zoneNumber];
              if (!zoneId) {
                console.warn(`⚠️ Zone ${zoneNumber} not found in map`);
              }
              return zoneId;
            })
            .filter((id): id is string => {
              const isValid = id !== null && id !== undefined;
              console.log(`✔️ Zone ID validation:`, { id, isValid });
              return isValid;
            });

          console.log('🎯 Final processed zone IDs:', processedZonesID);
        }

        const result = {
          ...restItem,
          code: taskCodeMap[code] || code,
          skillCodeID: Array.isArray(skillCodeID)
            ? skillCodeID
            : skillCodeID
            ? [skillsMap[skillCodeID]]
            : [],
          zonesID: processedZonesID,
          isCriticalTask: isCriticalTask?.toString().toLowerCase() === 'true',
          ZONE: normalizedZones,
        };

        console.log('📤 Processed item:', result);
        console.groupEnd();
        return result;
      });

      console.log('✅ Final processed data:', processedData);
      console.groupEnd();

      const response = await addMultiTask({
        taskNumberDTO: processedData,
      }).unwrap();

      notification.success({
        message: t('SUCCESS'),
        description: t('TASKS_IMPORTED_SUCCESSFULLY'),
      });
    } catch (error) {
      console.error('❌ Import error:', error);
      console.groupEnd();
      notification.error({
        message: t('ERROR'),
        description:
          error instanceof Error ? error.message : t('ERROR_IMPORTING_TASKS'),
      });
    }
  };

  // Добавляем функцию для конвертации JOB_ZONE в коды зон
  const getZoneCodesFromJobZone = (jobZone: string): string[] => {
    const zoneMap: { [key: string]: string[] } = {
      FUS: ['100', '200'],
      WING: ['500', '600'],
      TAIL: ['300'],
      LG: ['700'],
      // Добавьте другие маппинги по необхоимости
    };

    return zoneMap[jobZone] || [];
  };

  const transformedTasks = useMemo(() => {
    return transformToITask(tasksQuery || []);
  }, [tasksQuery]);
  const { data: partNumbers } = useGetPartNumbersQuery({});

  useEffect(() => {
    if (values) {
      console.log('Refetching with values:', values);
      refetchTasks();
    }
  }, [values, refetchTasks]);

  // В useEffect добавляем проверку загрузки зон
  useEffect(() => {
    console.log('Zones loading status:', {
      selectedAcType,
      isZonesLoading: zonesLoading,
      hasZones: !!zones,
      zonesCount: zones?.length || 0,
    });
  }, [selectedAcType, zones, zonesLoading]);

  // Добавляем конфигурацию текстовых инструкций
  const getTextInstructionsConfig = (taskType: string) => ({
    type: 'text',
    content: {
      SMC: [
        '1. Выберите тип воздушного судна (AC Type)',
        '2. Выберите MPD коды для импорта',
        '3. Заполните следующие обязательные поля:',
        '   - taskNumber: Уникальный номер задачи (например, SMC-001)',
        '   - taskDescription: Подробное описание работы',
        '   - code: Код типа задачи из списка доступных',
        '   - mainWorkTime: Время выполнения в часах',
        '   - skillCodeID: Коды требуемых специальностей через запятую',
        '   - IDENTIFICATOR: ROUTINE/SPECIAL/CRITICAL',
        '   - INTERVAL: Начальный интервал (например, 3000 FC)',
        '   - INTERVAL_REPEAT: Интервал повторения',
        '   - JOB_ZONE: Зона выполнения работы',
        '   - MPD: Код MPD документации',
        '   - ZONE: Коды зон можно вводить:',
        '     - каждый с новой строки',
        '     - через запятую без пробела',
        '     - через знак плюс',
        '     Примеры:',
        '     133,191+415',
        '     416',
        '     510,520+550',
        '4. Загрузите заполненный файл',
        '5. Проверьте данные в предпросмотре',
        '6. Исправьте ошибки если они есть',
        '7. Нажмите Import для завершения',
      ],
      HARD_ACCESS: [
        '1. Выберите тип воздушного судна (AC Type)',
        '2. Заполните следующие обязательные поля:',
        '   - taskNumber: Уникальный номер задачи доступа (например, HA-001)',
        '   - taskDescription: Описание процедуры доступа',
        '   - code: Код типа доступа из списка',
        '   - mainWorkTime: Общее время в часах',
        '   - skillCodeID: Коды требуемых специальностей',
        '   - OPEN_MHR: Время на открытие доступа',
        '   - CLOSE_MHR: Время на закрытие доступа',
        '   - ZONE: Коды зон можно вводить:',
        '     - каждый с новой строки',
        '     - через запятую без пробела',
        '     - через знак плюс',
        '     Примеры:',
        '     133,191+415',
        '     416',
        '     510,520+550',
        '3. Загрузите заполненный файл',
        '4. Проверьте данные в предпросмотре',
        '5. Исправьте ошибки если они есть',
        '6. Нажмите Import для завершения',
      ],
      PART_PRODUCE: [
        '1. Выберите тип воздушного судна (AC Type)',
        '2. Заполните следующие обязательные поля:',
        '   - taskNumber: Уникальный номер производственной задачи (например, PP-001)',
        '   - taskDescription: Описание производственного процесса',
        '   - code: Код типа производства из списка',
        '   - mainWorkTime: Время производства в часах',
        '   - skillCodeID: Коды требуемых специальностей',
        '   - title: Краткое название задачи',
        '   - amtoss: Ссылка на техническую документацию',
        '3. Загрузите заполненный файл',
        '4. Проверьте данные в предпросмотре',
        '5. Исправьте ошибки если они есть',
        '6. Нажмите Import для завершения',
      ],
    }[taskType],
  });

  return (
    <>
      <Space className="gap-6 pb-3">
        <Col>
          <PermissionGuard requiredPermissions={[Permission.TASK_ACTIONS]}>
            <Button
              size="small"
              icon={<PlusSquareOutlined />}
              onClick={handleCreate}
            >
              {t('ADD TASK')}
            </Button>
          </PermissionGuard>
        </Col>
        <PermissionGuard requiredPermissions={[Permission.TASK_ACTIONS]}>
          <Space className="gap-6">
            <FileUploaderV2
              templateConfig={getTemplateConfig(selectedTaskType)}
              onFileProcessed={handleAddMultiItems}
              buttonText="IMPORT_TASKS"
              modalTitle="IMPORT_TASKS"
              tooltipText="CLICK_TO_VIEW_TASK_TEMPLATE"
              additionalSelects={[
                ...additionalSelects,
                {
                  key: 'taskType',
                  label: 'SELECT_TASK_TYPE',
                  options: Object.entries(valueEnumTaskType).map(
                    ([key, value]) => ({
                      value: key,
                      label: value,
                    })
                  ),
                  required: true,
                  width: 400,
                  onChange: (value: any) => setSelectedTaskType(value),
                },
              ]}
              onSelectChange={(key, value) => {
                if (key === 'acTypeId') {
                  setSelectedAcType(value);
                } else if (key === 'taskType') {
                  setSelectedTaskType(value);
                }
              }}
            />
          </Space>
        </PermissionGuard>
        <Col style={{ textAlign: 'right' }}>
          {
            <PermissionGuard requiredPermissions={[Permission.TASK_ACTIONS]}>
              <Button
                disabled={!selectedItems?.length}
                size="small"
                icon={<MinusSquareOutlined />}
                onClick={() => handleDelete(selectedItems)}
              >
                {t('DELETE TASK')}
              </Button>
            </PermissionGuard>
          }
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

      <div className="flex flex-col md:flex-row justify-between w-full">
        <Split
          initialPrimarySize="35%"
          splitterSize="20px"
          className="w-full md:w-2/3"
        >
          <div
            className={`${styles.splitPanel} h-[72vh] bg-white px-4 rounded-md border-gray-400 p-3 overflow-auto`}
          >
            {isTreeView ? (
              <>
                {tasksQuery && tasksQuery.length ? (
                  <AdminTaskPanelTree
                    onTaskSelect={handleEdit}
                    tasks={tasksQuery || []}
                    isLoading={isFetchungQuery || isLoading}
                    onCheckItems={(items: any) => setSelectedItems(items)}
                  />
                ) : (
                  <Empty />
                )}
              </>
            ) : (
              <div className="overflow-x-auto">
                <UniversalAgGrid
                  gridId="taskList"
                  pagination={true}
                  isChekboxColumn={true}
                  columnDefs={columnDefs}
                  rowData={transformedTasks || []}
                  onRowSelect={(rowData: any | null) => handleEdit(rowData[0])}
                  height={'65vh'}
                  onCheckItems={(items: React.Key[]) => setSelectedItems(items)}
                  isLoading={isLoading || isFetchungQuery}
                  //className={styles.zonesTable}
                />
              </div>
            )}
          </div>
          <div
            className={`${styles.splitPanel} h-[70vh] bg-white px-4 rounded-md border-gray-400 p-3 overflow-y-auto`}
          >
            <AdminTaskPanelForm
              task={editingvendor || undefined}
              onSubmit={handleSubmit}
            />
          </div>
        </Split>
      </div>
    </>
  );
};
export default AdminTaskPanel;
