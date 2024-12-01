// //ts-nocheck
// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   Button,
//   Row,
//   Col,
//   Modal,
//   message,
//   Space,
//   Spin,
//   Empty,
//   Switch,
//   notification,
// } from 'antd';
// import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
// import { useTranslation } from 'react-i18next';
// import { TaskFilteredFormValues } from './AdminTaskFilterdForm';
// import { useTypedSelector } from '@/hooks/useTypedSelector';

// import AdminTaskPanelTree from './AdminTaskPanelTree';
// import AdminTaskPanelForm from './AdminTaskPanelForm';
// import { ITask, ITaskResponce } from '@/models/ITask';
// import { Split } from '@geoffcox/react-splitter';
// import FileUploader from '@/components/shared/FileUploader';
// import UniversalAgGrid from '@/components/shared/UniversalAgGrid';
// import {
//   getTaskTypeColor,
//   transformToITask,
//   ValueEnumTypeTask,
// } from '@/services/utilites';
// import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
// import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
// import { useGlobalState } from '@/components/woAdministration/GlobalStateContext';
// import {
//   useAddMultiTaskItemsMutation,
//   useAddTaskMutation,
//   useDeleteTaskMutation,
//   useGetTasksQuery,
//   useUpdateTaskMutation,
// } from '@/features/tasksAdministration/tasksApi';
// import FileUploaderV2 from '@/components/shared/FileUploaderV2';
// import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';
// import { useGetMPDCodesQuery } from '@/features/MPDAdministration/mpdCodesApi';
// import { useGetGroupTaskCodesQuery } from '@/features/tasksAdministration/taskCodesApi';
// import { useGetSkillsQuery } from '@/features/userAdministration/skillApi';

// interface AdminPanelProps {
//   values: TaskFilteredFormValues;
//   isLoadingF?: boolean;
// }

// // Добавляем интерфейсы для типизации
// interface ValidationResult {
//   row: number;
//   status: 'success' | 'error';
//   messages: string[];
//   fieldName?: string;
//   value?: string;
// }

// interface AdditionalSelect {
//   key: string;
//   label: string;
//   options: { value: string; label: string }[];
//   mode?: 'multiple' | undefined;
//   required?: boolean;
//   disabled?: boolean;
//   width?: number;
//   dependsOn?: string;
//   onChange?: (value: any) => void;
// }

// const getIntervalsConfig = () => ({
//   title: 'INTERVALS',
//   type: 'table',
//   headers: ['Code', 'Example'],
//   content: [
//     ['FC (Flight Cycles)', '3000 FC'],
//     ['FH (Flight Hours)', '5000 FH'],
//     ['MO (Months)', '12 MO'],
//     ['YR (Years)', '2 YR'],
//     ['WK (Weeks)', '6 WK'],
//     ['DY (Days)', '30 DY'],
//   ],
// });

// // Добавляем конфигурацию текстовых инструкций
// const getTextInstructionsConfig = (taskType: string) => ({
//   title: 'INSTRUCTIONS',
//   type: 'text',
//   content: {
//     SMC: [
//       '1. Выберите тип воздушного судна (AC Type)',
//       '2. Выберите MPD коды для импорта',
//       '3. Заполните следующие обязательные поля:',
//       '   - taskNumber: Уникальный номер задачи (например, SMC-001)',
//       '   - taskDescription: Подробное описание работы',
//       '   - code: Код типа задачи из списка доступных',
//       '   - mainWorkTime: Время выполнения в часах',
//       '   - skillCodeID: Коды требуемых специальностей через запятую',
//       '   - IDENTIFICATOR: ROUTINE/SPECIAL/CRITICAL',
//       '   - INTERVAL: Начальный интервал (например, 3000 FC)',
//       '   - INTERVAL_REPEAT: Интервал повторения',
//       '   - JOB_ZONE: Зона выполнения работы',
//       '   - MPD: Код MPD документации',
//       '4. Загрузите заполненный файл',
//       '5. Проверьте данные в предпросмотре',
//       '6. Исправьте ошибки если они есть',
//       '7. Нажмите Import для завершения',
//     ],
//     HARD_ACCESS: [
//       '1. Выберите тип воздушного судна (AC Type)',
//       '2. Заполните следующие обязательные поля:',
//       '   - taskNumber: Уникальный номер задачи доступа (например, HA-001)',
//       '   - taskDescription: Описание процедуры доступа',
//       '   - code: Код типа доступа из списка',
//       '   - mainWorkTime: Общее время в часах',
//       '   - skillCodeID: Коды требуемых специальностей',
//       '   - OPEN_MHR: Время на открытие доступа',
//       '   - CLOSE_MHR: Время на закрытие доступа',
//       '3. Загрузите заполненный файл',
//       '4. Проверьте данные в предпросмотре',
//       '5. Исправьте ошибки если они есть',
//       '6. Нажмите Import для завершения',
//     ],
//     PART_PRODUCE: [
//       '1. Выберите тип воздушного судна (AC Type)',
//       '2. Заполните следующие обязательные поля:',
//       '   - taskNumber: Уникальный номер производственной задачи (например, PP-001)',
//       '   - taskDescription: Описание производственного процесса',
//       '   - code: Код типа производства из списка',
//       '   - mainWorkTime: Время производства в часах',
//       '   - skillCodeID: Коды требуемых специальностей',
//       '   - title: Краткое название задачи',
//       '   - amtoss: Ссылка на техническую документацию',
//       '3. Загрузите заполненный файл',
//       '4. Проверьте данные в предпросмотре',
//       '5. Исправьте ошибки если они есть',
//       '6. Нажмите Import для завершения',
//     ],
//   }[taskType],
// });

// const AdminTaskPanel: React.FC<AdminPanelProps> = ({ values, isLoadingF }) => {
//   const [editingvendor, setEditingvendor] = useState<ITask | null>(null);
//   const [selectedItems, setSelectedItems] = useState<React.Key[] | []>([]);
//   const {
//     data: tasksQuery,
//     refetch: refetchTasks,
//     isLoading,
//     isFetching: isFetchungQuery,
//   } = useGetTasksQuery(
//     {
//       acTypeID: values?.acTypeId,
//       time: values?.time,
//       amtoss: values?.AMM,
//       taskNumber: values?.taskNumber,
//       cardNumber: values?.cardNumber?.toString(),
//       mpdDocumentationId: values?.mpdDocumentationId,
//       taskType: values?.taskType?.toString(),
//       isCriticalTask: values?.isCriticalTask,
//     },
//     { skip: !values }
//   );

//   const [addTask] = useAddTaskMutation();
//   const [updateTask] = useUpdateTaskMutation();
//   const [deleteTask] = useDeleteTaskMutation();
//   const [addMultiTask] = useAddMultiTaskItemsMutation();
//   const [isTreeView, setIsTreeView] = useState(false);
//   const handleCreate = () => {
//     setEditingvendor(null);
//   };
//   const { t } = useTranslation();
//   const handleEdit = (vendor: ITask) => {
//     setEditingvendor(vendor);
//   };

//   const handleDelete = async (items: React.Key[]) => {
//     Modal.confirm({
//       title: t('ARE YOU SURE, YOU WANT TO DELETE THIS TASK?'),
//       onOk: async () => {
//         try {
//           await deleteTask(items.toString()).unwrap();
//           notification.success({
//             message: t('SUCCESS'),
//             description: t('TASK SUCCESSFULLY DELETED'),
//           });
//           setEditingvendor(null);
//         } catch (error) {
//           notification.error({
//             message: t('ERROR'),
//             description: t('ERROR DELETING TASK'),
//           });
//         }
//       },
//     });
//   };
//   const valueEnumTask: ValueEnumTypeTask = {
//     RC: t('TC'),
//     CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
//     NRC: t('NRC (DEFECT)'),
//     NRC_ADD: t('ADHOC (ADHOC TASK)'),
//     MJC: t('MJC'),
//     CMJC: t('CMJC'),
//     FC: t('FC'),
//     SMC: t('SMC'),
//     SB: t('SB'),
//     HARD_ACCESS: t('HARD_ACCESS'),
//   };
//   const valueEnumTaskType: any = {
//     // RC: t('TC'),
//     // CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
//     // NRC: t('NRC (DEFECT)'),
//     // NRC_ADD: t('ADHOC (ADHOC TASK)'),
//     // MJC: t('MJC'),
//     // CMJC: t('CMJC'),
//     // FC: t('FC'),
//     SMC: t('SMC'),
//     // SB: t('SB'),
//     HARD_ACCESS: t('HARD_ACCESS'),
//   };
//   const handleSubmit = async (task: ITask) => {
//     try {
//       if (editingvendor) {
//         await updateTask(task).unwrap();
//         notification.success({
//           message: t('SUCCESS'),
//           description: t('TASK SUCCESSFULLY UPDATED'),
//         });
//       } else {
//         await addTask({ task }).unwrap();
//         notification.success({
//           message: t('SUCCESS'),
//           description: t('TASK SUCCESSFULLY ADDED'),
//         });
//       }
//     } catch (error) {
//       notification.error({
//         message: t('ERROR'),
//         description: t('ERROR SAVING TASK'),
//       });
//     }
//   };

//   const columnDefs: any[] = [
//     {
//       field: 'cardNumber',
//       headerName: `${t('CARD No')}`,
//       filter: true,
//       width: 100,
//     },
//     {
//       field: 'taskNumber',
//       headerName: `${t('TASK No')}`,
//       filter: true,
//     },
//     {
//       field: 'taskType',
//       headerName: `${t('TASK TYPE')}`,
//       filter: true,
//       valueGetter: (params: { data: { taskType: keyof ValueEnumTypeTask } }) =>
//         params.data.taskType,
//       valueFormatter: (params: { value: keyof ValueEnumTypeTask }) => {
//         const status = params.value;
//         return valueEnumTask[status] || '';
//       },
//       cellStyle: (params: { value: keyof ValueEnumTypeTask }) => ({
//         backgroundColor: getTaskTypeColor(params.value),
//       }),
//     },
//     { field: 'description', headerName: `${t('DESCRIPTION')}`, filter: true },
//     {
//       field: 'rev',
//       headerName: `${t('REVISION')}`,
//       filter: true,
//     },
//     { field: 'MPD', headerName: `${t('MPD')}`, filter: true },
//     { field: 'amtoss', headerName: `${t('REFERENCE')}`, filter: true },
//     { field: 'ZONE', headerName: `${t('ZONE')}`, filter: true },
//     { field: 'ACCESS', headerName: `${t('ACCESS')}`, filter: true },
//     { field: 'ACCESS_NOTE', headerName: `${t('ACCESS_NOTE')}`, filter: true },
//     { field: 'SKILL_CODE1', headerName: `${t('SKILL_CODE')}`, filter: true },
//     { field: 'TASK_CODE', headerName: `${t('TASK_CODE')}`, filter: true },
//     {
//       field: 'SUB TASK_CODE',
//       headerName: `${t('SUB TASK_CODE')}`,
//       filter: true,
//     },
//     { field: 'PHASES', headerName: `${t('PHASES')}`, filter: true },
//     {
//       field: 'RESTRICTION_1',
//       headerName: `${t('RESTRICTION_1')}`,
//       filter: true,
//     },
//     {
//       field: 'PREPARATION_CODE',
//       headerName: `${t('PREPARATION_CODE')}`,
//       filter: true,
//     },
//     {
//       field: 'REFERENCE_2',
//       headerName: `${t('REFERENCE_2')}`,
//       filter: true,
//     },
//     {
//       field: 'mainWorkTime',
//       headerName: `${t('MHS')}`,
//       filter: true,
//     },
//     {
//       field: 'createDate',
//       headerName: `${t('CREATE DATE')}`,
//       filter: true,
//       valueFormatter: (params: any) => {
//         if (!params.value) return '';
//         const date = new Date(params.value);
//         return date.toLocaleDateString('ru-RU', {
//           year: 'numeric',
//           month: '2-digit',
//           day: '2-digit',
//         });
//       },
//     },
//   ];
//   const { data: acTypes } = useGetACTypesQuery({});
//   const [selectedAcType, setSelectedAcType] = useState<string>('');
//   const { data: mpdCodes } = useGetMPDCodesQuery({ acTypeID: selectedAcType });
//   const { data: taskCodes } = useGetGroupTaskCodesQuery(
//     { acTypeID: selectedAcType },
//     { skip: !selectedAcType }
//   );

//   const taskCodeMap = useMemo(() => {
//     if (!taskCodes) return {};
//     return taskCodes.reduce((acc: { [key: string]: string }, code) => {
//       acc[code.code] = code.id;
//       return acc;
//     }, {});
//   }, [taskCodes]);

//   // Получаем данные о специальностях
//   const { data: skills } = useGetSkillsQuery({});

//   // Создаем таблицу специальностей на основе полученных данных
//   const skillCodesTable = useMemo(() => {
//     if (!skills) return [];

//     return skills.map((skill) => [
//       skill.code,
//       skill.name || skill.description || skill.code,
//     ]);
//   }, [skills]);

//   const additionalSelects: AdditionalSelect[] = [
//     {
//       key: 'acTypeId',
//       label: 'SELECT_AC_TYPE',
//       options: (acTypes || []).map((acType) => ({
//         value: acType.id,
//         label: acType.name,
//       })),
//       required: true,
//       width: 400,
//     },
//     {
//       key: 'mpdDocumentationId',
//       label: 'SELECT_MPD_CODES',
//       options: (mpdCodes || []).map((mpdCode) => ({
//         value: mpdCode.id,
//         label: mpdCode.code,
//       })),
//       mode: 'multiple',
//       dependsOn: 'acTypeId',
//       width: 400,
//     },
//   ];

//   const [selectedMpdCodes, setSelectedMpdCodes] = useState<string[]>([]);

//   const onSelectChange = (key: string, value: any) => {
//     if (key === 'acTypeId') {
//       setSelectedAcType(value);
//       setSelectedMpdCodes([]);
//     } else if (key === 'mpdDocumentationId') {
//       setSelectedMpdCodes(value);
//     }
//   };

//   // Добавим подробное логирование в валидацию
//   const validateData = (data: any[]): ValidationResult[] => {
//     console.group('Validation Process');
//     console.log('Full data to validate:', data);
//     console.log('Available task codes:', taskCodes);
//     console.log('Task code map:', taskCodeMap);

//     const results = data.map((row, index) => {
//       console.group(`Validating row ${index + 1}`);
//       console.log('Row data:', row);

//       const messages: string[] = [];
//       let isValid = true;

//       // Проверка кода задачи
//       if (!row.code) {
//         console.log('Code is missing');
//         messages.push(t('VALIDATION.TASK_CODE_REQUIRED'));
//         isValid = false;
//       } else {
//         console.log('Checking code:', row.code);
//         console.log('Available codes:', Object.keys(taskCodeMap));

//         if (!taskCodeMap[row.code]) {
//           console.log(`Code "${row.code}" not found in available codes`);
//           messages.push(
//             t('VALIDATION.INVALID_TASK_CODE', {
//               code: row.code,
//               availableCodes: Object.keys(taskCodeMap).join(', '),
//             })
//           );
//           isValid = false;
//         } else {
//           console.log(
//             `Code "${row.code}" is valid, mapped to ID:`,
//             taskCodeMap[row.code]
//           );
//         }
//       }

//       // Проверка isCriticalTask
//       if (row.isCriticalTask === undefined) {
//         messages.push(t('VALIDATION.IS_CRITICAL_TASK_REQUIRED'));
//         isValid = false;
//       } else {
//         const strValue = String(row.isCriticalTask).toLowerCase();
//         if (strValue !== 'true' && strValue !== 'false') {
//           messages.push(t('VALIDATION.INVALID_IS_CRITICAL_TASK'));
//           isValid = false;
//         }
//       }

//       // Проверка skillCodeID
//       console.group('Validating skillCodeID');
//       console.log('Checking value:', row.skillCodeID);
//       console.log('Available skill codes:', Object.keys(skillsMap));

//       if (!row.skillCodeID) {
//         console.log('No skillCodeID found');
//         messages.push(t('VALIDATION.SKILL_CODES_REQUIRED'));
//         isValid = false;
//       } else {
//         const codes = row.skillCodeID
//           .split(',')
//           .map((code: string) => code.trim());
//         console.log('Split skill codes:', codes);

//         const invalidCodes = codes.filter((code: string) => {
//           const isValid = skillsMap[code];
//           console.log(
//             `Validating skill code "${code}":`,
//             isValid ? 'valid' : 'invalid'
//           );
//           return !isValid;
//         });

//         if (invalidCodes.length > 0) {
//           console.log('Invalid skill codes found:', invalidCodes);
//           console.log('Available skill codes:', Object.keys(skillsMap));
//           messages.push(
//             t('VALIDATION.INVALID_SKILL_CODES', {
//               codes: invalidCodes.join(', '),
//               availableCodes: Object.keys(skillsMap).join(', '),
//             })
//           );
//           isValid = false;
//         } else {
//           console.log('All skill codes are valid');
//         }
//       }
//       console.groupEnd();

//       const result = {
//         row: index + 2,
//         status: isValid ? 'success' : 'error',
//         messages,
//         fieldName: isValid ? undefined : 'skillCodeID',
//         value: row.skillCodeID,
//       };

//       console.log('Validation result:', result);
//       console.groupEnd();
//       return result;
//     });

//     console.log('Final validation results:', results);
//     console.groupEnd();
//     return results;
//   };

//   // Обновляем переводы для более подробных сообщений об ошибках
//   const translations = {
//     ru: {
//       VALIDATION: {
//         TASK_NUMBER_REQUIRED: 'Номер задачи обязателен для заполнения',
//         TASK_DESCRIPTION_REQUIRED: 'Описание задачи обязательно для заполнения',
//         TASK_CODE_REQUIRED: 'Код задачи обязателен для заполнения',
//         INVALID_TASK_CODE:
//           'Неверный код задачи: {{code}}. Проверьте список доступных кодов',
//         IDENTIFICATOR_REQUIRED: 'Идентификатор обязателен для задач типа SMC',
//         INVALID_IDENTIFICATOR:
//           'Неверный идентификатор: {{value}}. Допустимые значения: ROUTINE, SPECIAL, CRITICAL',
//         INTERVAL_REQUIRED: 'Интервал обязателен для задач типа SMC',
//         INVALID_INTERVAL_FORMAT:
//           'Неверный формат интервала: {{value}}. Пример: 3000 FC, 5000 FH, 12 MO',
//         INTERVAL_REPEAT_REQUIRED:
//           'Интервал повторения обязателен для задач типа SMC',
//         INVALID_INTERVAL_REPEAT_FORMAT:
//           'Неверный формат интервала повторения: {{value}}. Пример: 3000 FC, 5000 FH, 12 MO',
//         JOB_ZONE_REQUIRED: 'Зона работы обязательна для задач типа SMC',
//         MPD_REQUIRED: 'MPD код обязателен для задач типа SMC',
//         INVALID_MPD_FORMAT:
//           'Неверный формат MPD кода: {{value}}. Должен быть в формате XX-XXX-XX',
//         INVALID_TASK_TYPE: 'Неверный тип задачи: {{type}}',
//         ROW_VALID: 'Строка валидна',
//         MPD_CODES_REQUIRED: 'Необходимо выбрать MPD коды перед импортом',
//         IS_CRITICAL_TASK_REQUIRED:
//           'Поле isCriticalTask обязательно для задач типа SMC',
//         INVALID_IS_CRITICAL_TASK: 'Неверное значение isCriticalTask: {{value}}',
//         SKILL_CODES_REQUIRED: 'Коды навыков обязательны для задач типа SMC',
//         INVALID_SKILL_CODES:
//           'Неверные коды навыков: {{codes}}. Проверьте список доступных кодов',
//       },
//     },
//   };

//   const [selectedTaskType, setSelectedTaskType] = useState<string>('');

//   // Перемещаем функции внутрь компонента
//   const getTaskFieldsConfig = (currentSkills: any[]) => ({
//     title: 'TASK_FIELDS',
//     type: 'table',
//     headers: ['Field', 'Required', 'Example'],
//     content: {
//       SMC: [
//         ['taskNumber', '✓', 'SMC-001'],
//         ['taskDescription', '✓', 'Inspect landing gear'],
//         ['code', '✓', 'SMC-LG'],
//         ['mainWorkTime', '✓', '2.5'],
//         ['skillCodeID', '✓', currentSkills?.[0]?.code || 'SKILL1, SKILL2'],
//         ['IDENTIFICATOR', '✓', 'ROUTINE'],
//         ['INTERVAL', '✓', '3000 FC'],
//         ['INTERVAL_REPEAT', '✓', '3000 FC'],
//         ['JOB_ZONE', '✓', 'FUS'],
//         ['MPD', '✓', '25-170-00'],
//       ],
//       HARD_ACCESS: [
//         ['taskNumber', '✓', 'HA-001'],
//         ['taskDescription', '✓', 'Remove panel 125'],
//         ['code', '✓', 'HA-HYD'],
//         ['mainWorkTime', '✓', '2.5'],
//         ['skillCodeID', '✓', currentSkills?.[0]?.code || 'SKILL1'],
//         ['OPEN_MHR', '✓', '1.0'],
//         ['CLOSE_MHR', '✓', '1.0'],
//       ],
//       PART_PRODUCE: [
//         ['taskNumber', '✓', 'PP-001'],
//         ['taskDescription', '✓', 'Produce bracket assembly'],
//         ['code', '✓', 'PP-BA'],
//         ['mainWorkTime', '✓', '4.0'],
//         ['skillCodeID', '✓', currentSkills?.[0]?.code || 'SKILL1'],
//         ['title', '✓', 'Bracket Assembly'],
//         ['amtoss', '✓', 'DWG-123-456'],
//       ],
//     },
//   });

//   const getSkillCodesConfig = (currentSkillCodesTable: any[]) => ({
//     title: 'SKILL_CODES',
//     type: 'table',
//     headers: ['Code', 'Description'],
//     content: currentSkillCodesTable,
//   });

//   const getTaskCodesConfig = () => {
//     const availableCodes =
//       taskCodes?.map((code) => [
//         code.code,
//         code.description || code.code,
//         `${code.code}-001`,
//       ]) || [];

//     return {
//       title: 'TASK_CODES',
//       type: 'table',
//       headers: ['Code', 'Description', 'Example'],
//       content: availableCodes,
//     };
//   };

//   const getTaskTypeInstructions = (taskType: string) => {
//     const taskFieldsConfig = getTaskFieldsConfig(skills || []);
//     const skillCodesConfig = getSkillCodesConfig(skillCodesTable);
//     const intervalsConfig = getIntervalsConfig();
//     const textInstructions = getTextInstructionsConfig(taskType);
//     const taskCodesConfig = getTaskCodesConfig();

//     return {
//       tabs: [
//         {
//           key: 'instructions',
//           label: t('INSTRUCTIONS'),
//           content: textInstructions,
//         },
//         {
//           key: 'fields',
//           label: t('REQUIRED_FIELDS'),
//           content: {
//             type: 'table',
//             ...taskFieldsConfig,
//             content:
//               taskFieldsConfig.content[
//                 taskType as keyof typeof taskFieldsConfig.content
//               ],
//           },
//         },
//         {
//           key: 'task_codes',
//           label: t('TASK_CODES'),
//           content: taskCodesConfig,
//         },

//         {
//           key: 'skills',
//           label: t('AVAILABLE_SKILLS'),
//           content: skillCodesConfig,
//         },
//         ...(taskType === 'SMC'
//           ? [
//               {
//                 key: 'intervals',
//                 label: t('INTERVAL_FORMATS'),
//                 content: intervalsConfig,
//               },
//             ]
//           : []),
//       ],
//     };
//   };

//   const getTemplateConfig = (taskType: string) => ({
//     fields: [
//       // Базовые оля всегда присутствуют
//       {
//         name: 'taskNumber',
//         displayName: t('TASK_NUMBER'),
//         required: true,
//         description: 'TASK_NUMBER_DESCRIPTION',
//         example: 'TASK-001',
//         width: 15,
//       },
//       {
//         name: 'taskDescription',
//         displayName: t('TASK_DESCRIPTION'),
//         required: true,
//         description: 'TASK_DESCRIPTION_HELP_TEXT',
//         example: 'Replace the wheel assembly',
//         width: 40,
//       },
//       {
//         name: 'mainWorkTime',
//         displayName: t('MHS '),
//         required: true,
//         description: 'MHS_DESCRIPTION',
//         example: '10',
//         width: 15,
//         validation: (value: string) => {
//           const pattern = /^\d+(\.\d{1,2})?$/;
//           return pattern.test(value);
//         },
//       },
//       {
//         name: 'code',
//         displayName: t('TASK_CODE '),
//         required: true,
//         description: 'TASK_CODE_DESCRIPTION',
//         example: 'GVI',
//         width: 15,
//         validation: (value: string) => {
//           console.log('Validating code:', value);
//           console.log('Available codes:', Object.keys(taskCodeMap));

//           // Проверяем, сущствует ли код в мапе
//           const isValid = !!taskCodeMap[value];

//           if (!isValid) {
//             console.log(
//               `Code ${value} not found in available codes:`,
//               taskCodeMap
//             );
//           }

//           return isValid;
//         },
//       },
//       {
//         name: 'title', // Добавляем title
//         displayName: t('TASK_TITLE'),
//         required: true,
//         description: 'TASK_TITLE_DESCRIPTION',
//         example: 'Wheel Assembly Replacement',
//         width: 30,
//         validation: (value: string) => {
//           return value.length > 0;
//         },
//       },
//       {
//         name: 'amtoss', // Добавляем amtoss
//         displayName: t('AMTOSS'),
//         required: true,
//         description: 'AMTOSS_DESCRIPTION',
//         example: 'AMM 32-41-11',
//         width: 20,
//         validation: (value: string) => {
//           return value.length > 0;
//         },
//       },
//       {
//         name: 'isCriticalTask',
//         displayName: t('IS_CRITICAL_TASK'),
//         required: true,
//         description: t('IS_CRITICAL_TASK_DESCRIPTION'),
//         example: 'true',
//         width: 15,
//         validation: (value: any) => {
//           const strValue = String(value).toLowerCase();
//           return strValue === 'true' || strValue === 'false';
//         },
//       },
//       {
//         name: 'skillCodeID',
//         displayName: t('SKILL_CODES'),
//         required: true,
//         description: t('SKILL_CODES_DESCRIPTION'),
//         example: 'AVI',
//         width: 20,
//       },
//       // Дополнительные поля только для SMC
//       ...(taskType === 'SMC'
//         ? [
//             {
//               name: 'IDENTIFICATOR',
//               displayName: t('IDENTIFICATOR'),
//               required: true,
//               description: 'IDENTIFICATOR_DESCRIPTION',
//               example: 'ROUTINE',
//               width: 15,
//               validation: (value: string) =>
//                 ['ROUTINE', 'SPECIAL', 'CRITICAL'].includes(value),
//             },
//             {
//               name: 'INTERVAL',
//               displayName: t('INTERVAL '),
//               required: true,
//               description: 'INTERVAL_DESCRIPTION',
//               example: '3000 FC',
//               width: 15,
//               validation: (value: string) => {
//                 const pattern = /^\d+\s*(FC|FH|MO|YR|WK|DY)$/i;
//                 return pattern.test(value);
//               },
//             },
//             {
//               name: 'INTERVAL_REPEAT',
//               displayName: t('INTERVAL_REPEAT '),
//               required: true,
//               description: 'INTERVAL_REPEAT_DESCRIPTION',
//               example: '3000 FC',
//               width: 15,
//               validation: (value: string) => {
//                 const pattern = /^\d+\s*(FC|FH|MO|YR|WK|DY)$/i;
//                 return pattern.test(value);
//               },
//             },
//             {
//               name: 'JOB_ZONE',
//               displayName: t('JOB_ZONE'),
//               required: true,
//               description: 'JOB_ZONE_DESCRIPTION',
//               example: 'FUS',
//               width: 15,
//             },
//             {
//               name: 'MPD',
//               displayName: t('MPD '),
//               required: true,
//               description: 'MPD_DESCRIPTION',
//               example: '25-170-00',
//               width: 15,
//               validation: (value: string) => {
//                 return value.length > 0;
//               },
//             },
//           ]
//         : []),
//       ...(taskType === 'HARD_ACCESS'
//         ? [
//             {
//               name: 'OPEN_MHR',
//               displayName: t('OPEN_MHR'),
//               required: true,
//               description: 'OPEN_MHR_DESCRIPTION',
//               example: '1.0',
//               width: 15,
//             },
//             {
//               name: 'CLOSE_MHR',
//               displayName: t('CLOSE_MHR'),
//               required: true,
//               description: 'CLOSE_MHR_DESCRIPTION',
//               example: '1.0',
//               width: 15,
//             },
//           ]
//         : []),
//     ],
//     templateFileName: `tasks_template_${taskType.toLowerCase()}.xlsx`,
//     additionalInstructions: getTaskTypeInstructions(taskType),
//   });

//   // Добавляем запрос навыков
//   const { data: usersGroup } = useGetSkillsQuery({});

//   // Создаем мапу навыков с логированием
//   const skillsMap = useMemo(() => {
//     console.log('Creating skills map from:', usersGroup);
//     if (!usersGroup) return {};

//     const map = usersGroup.reduce(
//       (acc: { [key: string]: string }, skill: any) => {
//         // Используем _id вместо id
//         acc[skill.code] = skill._id || skill.id;
//         return acc;
//       },
//       {}
//     );

//     console.log('Available skill codes:', Object.keys(map));
//     console.log('Skills map:', map);
//     return map;
//   }, [usersGroup]);

//   const handleAddMultiItems = async (data: any) => {
//     try {
//       console.log('Initial data:', data);

//       const processedData = data.map((item: any) => {
//         const { code, mpdDocumentationId, ...restItem } = item;

//         // Преобразуем строку с кодами навыков в массив ID
//         const skillCodeIDs = item.skillCodeID
//           .split(',')
//           .map((code: string) => code.trim())
//           .filter((code: string) => !!skillsMap[code])
//           .map((code: string) => skillsMap[code]);

//         return {
//           ...restItem,
//           code: taskCodeMap[code],
//           acTypeId: selectedAcType,
//           mpdDocumentationId: mpdDocumentationId || selectedMpdCodes,
//           skillCodeID: skillCodeIDs,
//           isCriticalTask: false,
//         };
//       });

//       console.log('Processed data:', processedData);

//       const response = await addMultiTask({
//         taskNumberDTO: processedData,
//       }).unwrap();

//       notification.success({
//         message: t('SUCCESS'),
//         description: t('TASKS_SUCCESSFULLY_IMPORTED'),
//       });

//       refetchTasks();
//     } catch (error) {
//       console.error('Import error:', error);
//       notification.error({
//         message: t('ERROR'),
//         description:
//           error instanceof Error ? error.message : t('ERROR_IMPORTING_TASKS'),
//       });
//     }
//   };
//   const transformedTasks = useMemo(() => {
//     return transformToITask(tasksQuery || []);
//   }, [tasksQuery]);
//   const { data: partNumbers } = useGetPartNumbersQuery({});

//   useEffect(() => {
//     if (values) {
//       console.log('Refetching with values:', values);
//       refetchTasks();
//     }
//   }, [values, refetchTasks]);

//   return (
//     <>
//       <Space className="gap-6 pb-3">
//         <Col>
//           <PermissionGuard requiredPermissions={[Permission.TASK_ACTIONS]}>
//             <Button
//               size="small"
//               icon={<PlusSquareOutlined />}
//               onClick={handleCreate}
//             >
//               {t('ADD TASK')}
//             </Button>
//           </PermissionGuard>
//         </Col>
//         <PermissionGuard requiredPermissions={[Permission.TASK_ACTIONS]}>
//           <Space className="gap-6">
//             <FileUploaderV2
//               templateConfig={getTemplateConfig(selectedTaskType)}
//               onFileProcessed={handleAddMultiItems}
//               buttonText="IMPORT_TASKS"
//               modalTitle="IMPORT_TASKS"
//               tooltipText="CLICK_TO_VIEW_TASK_TEMPLATE"
//               additionalSelects={[
//                 ...additionalSelects,
//                 {
//                   key: 'taskType',
//                   label: 'SELECT_TASK_TYPE',
//                   options: Object.entries(valueEnumTaskType).map(
//                     ([key, value]) => ({
//                       value: key,
//                       label: value,
//                     })
//                   ),
//                   required: true,
//                   width: 400,
//                   onChange: (value: any) => setSelectedTaskType(value),
//                 },
//               ]}
//               onSelectChange={(key, value) => {
//                 if (key === 'acTypeId') {
//                   setSelectedAcType(value);
//                 } else if (key === 'taskType') {
//                   setSelectedTaskType(value);
//                 }
//               }}
//             />
//           </Space>
//         </PermissionGuard>
//         <Col style={{ textAlign: 'right' }}>
//           {
//             <PermissionGuard requiredPermissions={[Permission.TASK_ACTIONS]}>
//               <Button
//                 disabled={!selectedItems?.length}
//                 size="small"
//                 icon={<MinusSquareOutlined />}
//                 onClick={() => handleDelete(selectedItems)}
//               >
//                 {t('DELETE TASK')}
//               </Button>
//             </PermissionGuard>
//           }
//         </Col>
//         <Col>
//           <Switch
//             checkedChildren="Table"
//             unCheckedChildren="Tree"
//             defaultChecked
//             onChange={() => setIsTreeView(!isTreeView)}
//           />
//         </Col>
//       </Space>

//       <div className="flex justify-between">
//         <Split initialPrimarySize="35%" splitterSize="20px">
//           <div className="h-[72vh] bg-white px-4 rounded-md border-gray-400 p-3">
//             {isTreeView ? (
//               <>
//                 {tasksQuery && tasksQuery.length ? (
//                   <AdminTaskPanelTree
//                     onTaskSelect={handleEdit}
//                     tasks={tasksQuery || []}
//                     isLoading={isFetchungQuery || isLoading}
//                     onCheckItems={function (items: any): void {
//                       return setSelectedItems(items);
//                     }}
//                   />
//                 ) : (
//                   <Empty />
//                 )}
//               </>
//             ) : (
//               <UniversalAgGrid
//                 gridId="taskList"
//                 pagination={true}
//                 isChekboxColumn={true}
//                 columnDefs={columnDefs}
//                 rowData={transformedTasks || []}
//                 onRowSelect={function (rowData: any | null): void {
//                   handleEdit(rowData[0]);
//                 }}
//                 height={'65vh'}
//                 onCheckItems={(items: React.Key[]): void => {
//                   setSelectedItems(items);
//                 }}
//                 isLoading={isLoading || isFetchungQuery}
//               />
//             )}
//           </div>
//           <div className="h-[70vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
//             {
//               <AdminTaskPanelForm
//                 task={editingvendor || undefined}
//                 onSubmit={handleSubmit}
//               />
//             }
//           </div>
//         </Split>
//       </div>
//     </>
//   );
// };

// export default AdminTaskPanel;
