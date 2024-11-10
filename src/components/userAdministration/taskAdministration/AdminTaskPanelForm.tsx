// ts-nocheck

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormGroup,
  ProFormSelect,
  ProFormCheckbox,
  ProFormSwitch, // Импортируйте ProFormSwitch
} from '@ant-design/pro-form';

import { Button, Empty, Modal, Tabs, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { ITask } from '@/models/ITask';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';
import { useGetMPDCodesQuery } from '@/features/MPDAdministration/mpdCodesApi';
import {
  useGetFilteredZonesQuery,
  useGetZonesByGroupQuery,
} from '@/features/zoneAdministration/zonesApi';
import { useGetGroupTaskCodesQuery } from '@/features/tasksAdministration/taskCodesApi';
import { ProFormDigit, ProFormTextArea } from '@ant-design/pro-components';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import StepContainer from './StepContainer';
import { IStep } from '@/models/IStep';
import { useGetGroupsUserQuery } from '@/features/userAdministration/userGroupApi';
import { useGetSkillsQuery } from '@/features/userAdministration/skillApi';
import {
  useAddStepMutation,
  useDeleteStepMutation,
  useGetFilteredStepsQuery,
} from '@/features/tasksAdministration/stepApi';
import { useAddBookingMutation } from '@/features/bookings/bookingApi';
import PartsTable from '@/components/shared/Table/PartsTable';
import { IPartNumber } from '@/models/IUser';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

import { AgGridReact } from 'ag-grid-react';
import PartList from './PartList';
import AutoCompleteEditor from '@/components/shared/Table/ag-grid/AutoCompleteEditor';
import { useGetAccessCodesQuery } from '@/features/accessAdministration/accessApi';
import { useGetFilteredRestrictionsQuery } from '@/features/restrictionAdministration/restrictionApi';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import FileListE from './FileList.tsx';
import {
  deleteFileUploads,
  uploadFileServerReference,
} from '@/utils/api/thunks';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { useGlobalState } from '@/components/woAdministration/GlobalStateContext';
import { useGetActionsTemplatesQuery } from '@/features/templatesAdministration/actionsTemplatesApi';
import { useGetTasksQuery } from '@/features/tasksAdministration/tasksApi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  DatePicker,
  Radio,
  Checkbox,
  Spin,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
const { RangePicker } = DatePicker;

import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useGetFilteredActionsQuery } from '@/features/projectItemWO/actionsApi';

// Инициализируем плагины
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

// После импортов, до начала компонента
interface UserFormProps {
  task?: ITask;
  onSubmit: (task: ITask) => void;
  onDelete?: (taskId: string) => void;
}

type CellDataType = 'text' | 'number' | 'date' | 'boolean';

interface ExtendedColDef extends ColDef {
  cellDataType: CellDataType;
}

interface TaskStats {
  date: string;
  completed: number;
  inProgress: number;
  manhours: number;
  avgTaskTime: number;
  totalTaskTime: number;
}

interface Stats {
  totalCompleted: number;
  totalInProgress: number;
  totalManhours: number;
  avgTaskTime: number;
  totalTaskTime: number;
}

interface ChartDataItem {
  date: string;
  completed: number;
  totalTaskTime: number;
  avgTimePerTask: number;
}

interface TaskTimeStats {
  totalTime: number;
  avgTimePerAction: number;
  totalActions: number;
  uniqueTasksCount: number;
  timeBySkill: Record<string, number>;
  actionsCountBySkill: Record<string, number>;
  avgTimeBySkill: Record<string, number>;
  completed: number;
}

interface StatsData {
  totalCompleted: number;
  totalTaskTime: number;
}

// Константы для моковых данных (если они нужны)
const taskStats: TaskStats[] = [
  {
    date: '2024-01',
    completed: 5,
    inProgress: 3,
    manhours: 24,
    avgTaskTime: 8,
    totalTaskTime: 24,
  },
  {
    date: '2024-02',
    completed: 8,
    inProgress: 4,
    manhours: 32,
    avgTaskTime: 8,
    totalTaskTime: 32,
  },
];

const stats: Stats = {
  totalCompleted: 13,
  totalInProgress: 7,
  totalManhours: 56,
  avgTaskTime: 8,
  totalTaskTime: 56,
};

// Создаем общую функцию для расчета статистики
const calculateTaskStats = (actions: any[]) => {
  if (!actions || actions.length === 0) {
    return {
      totalTime: 0,
      avgTimePerTask: 0,
      totalActions: 0,
      uniqueTasksCount: 0,
      completed: 0,
    };
  }

  const uniqueTaskIds = new Set<string>();
  let totalTime = 0;
  let completed = 0;

  actions.forEach((action) => {
    const duration = action.userDurations?.[0]?.duration || 0;
    if (duration > 0) {
      totalTime += duration;
      uniqueTaskIds.add(action.projectTaskID);
    }
    if (action.type === 'closed') {
      completed++;
    }
  });

  const uniqueTasksCount = uniqueTaskIds.size;
  const avgTimePerTask =
    uniqueTasksCount > 0 ? totalTime / uniqueTasksCount : 0;

  return {
    totalTime: Number(totalTime.toFixed(2)),
    avgTimePerTask: Number(avgTimePerTask.toFixed(2)),
    totalActions: actions.length,
    uniqueTasksCount,
    completed,
  };
};

// Начало компонента
const AdminTaskPanelForm: FC<UserFormProps> = ({ task, onSubmit }) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const [acTypeID, setACTypeID] = useState<any>(task?.acTypeId || '');
  const [taskType, setTaskType] = useState<string>(task?.taskType || '');
  const { data: partNumbers } = useGetPartNumbersQuery({});
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const { tasksFormValues, setTasksFormValues } = useGlobalState();
  // const { data: tools } = useGetPartNumbersQuery({ group: 'TOOL,GSE' });
  const [addStep] = useAddStepMutation({});
  const [deleteStep] = useDeleteStepMutation();
  const [activeTabKey, setActiveTabKey] = useState('1');
  const partValueEnum: Record<string, any> = useMemo(() => {
    return (
      partNumbers?.reduce(
        (acc: Record<string, any>, partNumber: IPartNumber) => {
          acc[partNumber?._id || partNumber?.id] = partNumber;
          return acc;
        },
        {}
      ) || {}
    );
  }, [partNumbers]);

  // const toolValueEnum: Record<string, IPartNumber> =
  //   tools?.reduce(
  //     (acc: Record<string, IPartNumber>, partNumber: IPartNumber) => {
  //       acc[partNumber?._id || partNumber?.id] = partNumber; // Используйте id вместо _id
  //       return acc;
  //     },
  //     {}
  //   ) || {};
  const handleSubmit = async (values: ITask) => {
    const newUser: ITask = task ? { ...task, ...values } : { ...values };
    onSubmit(newUser);
  };

  useEffect(() => {
    if (task) {
      form.resetFields();
      form.setFieldsValue(task);
      setACTypeID(task.acTypeId || ''); // Используйте пустую строку в качестве значения по уолчанию, если task.acTypeId равно undefined
      task?.taskType && setTaskType(task?.taskType);
      form.setFieldsValue({
        partNumberID: task?.partNumberID?._id,
        nameOfMaterial: task?.partNumberID?.DESCRIPTION,
        WORKPIECE_DIMENSIONS: task?.partNumberID?.WORKPIECE_DIMENSIONS,
        COATING: task?.partNumberID?.COATING,
        MATERIAL: task?.partNumberID?.MATERIAL,
        WEIGHT: task?.partNumberID?.WEIGHT,
        SQUARE: task?.partNumberID?.SQUARE,
        WORKPIECE_WEIGHT: task.partNumberID?.WORKPIECE_WEIGHT,
        WORKPIECE_MATERIAL_TYPE: task.partNumberID?.WORKPIECE_MATERIAL_TYPE,
        instrumentID:
          task.instrumentID?.map(
            (instrument: { _id: string }) => instrument._id
          ) || [],
      });
    } else {
      form.resetFields();
      setACTypeID(''); // Установите пустую строку в качестве значения по умолчанию
      setTaskType('PART_PRODUCE');
    }
  }, [task, form]);

  const SubmitButton = () => (
    <PermissionGuard requiredPermissions={[Permission.TASK_ACTIONS]}>
      <Button type="primary" htmlType="submit">
        {task ? t('UPDATE') : t('CREATE')}
      </Button>
    </PermissionGuard>
  );
  const { data: usersSkill } = useGetSkillsQuery({});
  const groupSlills = usersSkill?.map((skill: any) => ({
    label: skill?.code,
    value: skill?.id, // Use the _id as the value
  }));
  const { data: zones, isLoading: loading } = useGetFilteredZonesQuery(
    { acTypeId: acTypeID },
    { skip: !acTypeID }
  );
  // const { data: zones, isLoading: loading } = useGetZonesByGroupQuery(
  //   { acTypeId: acTypeID },
  //   { skip: !acTypeID }
  // );

  const { data: tasksQueryHard } = useGetTasksQuery(
    {
      acTypeID: acTypeID,
      time: tasksFormValues?.time,

      taskType: 'HARD_ACCESS',
    },
    { skip: !acTypeID }
  );
  const { data: restriction } = useGetFilteredRestrictionsQuery({});
  const restrictionValueEnum: Record<string, string> =
    restriction?.reduce((acc, reqType) => {
      acc[reqType.id || reqType?._id] = `${reqType.code}`;
      return acc;
    }, {}) || {};
  const hardValueEnum: Record<string, string> =
    tasksQueryHard?.reduce((acc: Record<string, string>, reqType: any) => {
      acc[reqType.id || reqType?._id] = `${reqType.taskNumber}`;
      return acc;
    }, {} as Record<string, string>) || {};

  const { data: acTypes, isLoading: acTypesLoading } = useGetACTypesQuery({});
  const { data: accessesData } = useGetAccessCodesQuery(
    { acTypeID: acTypeID },
    { skip: acTypeID }
  );
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
  const { data: templates, isLoading: isTemplatesLoading } =
    useGetActionsTemplatesQuery({});
  const zonesValueEnum: Record<string, string> =
    zones?.reduce((acc: any, zone: any) => {
      acc[zone?.id || zone?._id] =
        zone?.areaNbr || zone?.subZoneNbr || zone?.majoreZoneNbr;
      return acc;
    }, {} as Record<string, string>) || {};

  const acTypeValueEnum: Record<string, string> =
    acTypes?.reduce((acc, acType) => {
      acc[acType.id] = acType.name;
      return acc;
    }, {} as Record<string, string>) || {};
  const { data: groups } = useGetGroupsUserQuery({});
  const [addBooking] = useAddBookingMutation({});
  const { data: skills } = useGetSkillsQuery({});
  const { data: mpdCodes, isLoading: mpdCodesLoading } = useGetMPDCodesQuery(
    { acTypeID },
    { skip: !acTypeID }
  );
  const { data: taskCodes } = useGetGroupTaskCodesQuery(
    { acTypeID },
    { skip: !acTypeID }
  );
  const accessCodesValueEnum: Record<string, string> =
    accessesData?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.accessNbr;
      return acc;
    }, {} as Record<string, string>) || {};
  const taskCodesValueEnum: Record<string, string> =
    taskCodes?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.code;
      return acc;
    }, {} as Record<string, string>) || {};
  const mpdCodesValueEnum: Record<string, string> =
    mpdCodes?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.code;
      return acc;
    }, {} as Record<string, string>) || {};
  const handleAddStep = async (newStep: IStep) => {
    try {
      const step = await addStep({
        step: newStep,
        taskId: task?.id,
      }).unwrap();
      // await refetch();
      await addBooking({
        booking: { voucherModel: 'ADD_STEP', data: step },
      }).unwrap(); // Передаем данные о новом шаге в addBooking
      notification.success({
        message: t('STEP SUCCESSFULLY ADDED'),
        description: t('The step has been successfully added.'),
      });
      // setIsModalVisible(false); // Если у вас есть функция для закрыия модального окна после добавления ага
    } catch (error) {
      notification.error({
        message: t('FAILED TO ADD STEP'),
        description: 'There was an error adding the step.',
      });
    }
  };
  const dispatch = useAppDispatch();
  const handleDeleteUpload = (key: any) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить этот файл?',
      onOk: async () => {
        try {
          const response = await dispatch(
            deleteFileUploads({
              id: key,
              companyID: COMPANY_ID,
              type: 'taskItem',
              itemID: task && task.id,
            })
          );

          setTasksFormValues({ tasksFormValues, time: new Date() });
        } catch (error) {
          notification.error({
            message: t('ERROR'),
            description: t('Error delete files.'),
          });
        }
      },
    });
  };
  const handleUploadReference = async (data: any) => {
    if (!task || !task.id) {
      console.error('Невозможно загрузить файл');
      return;
    }

    const formData = new FormData();

    formData.append('isDefaultFile', 'true');
    formData.append('file', data?.file);
    formData.append('referenceType', data?.referenceType || '');
    formData.append('taskNumber', data?.taskNumber || '');
    if (data?.customerCodeID) {
      formData.append('customerCodeID', data.customerCodeID);
    }
    formData.append('onSavedReference', 'true');
    formData.append('taskNumberID', task.id);
    formData.append('fileName', data.file.name);
    if (COMPANY_ID) {
      formData.append('companyID', COMPANY_ID);
    }
    formData.append('createDate', new Date().toISOString());
    formData.append('createUserID', USER_ID || '');
    if (data?.efectivityACID) {
      formData.append('efectivityACID', data.efectivityACID);
    }

    try {
      const response = await uploadFileServerReference(formData);
      setTasksFormValues({ tasksFormValues, time: new Date() });
      notification.success({
        message: t('SUCCESS'),
        description: t('File uploaded successfully'),
      });
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error File uploaded.'),
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
  const { data: steps, refetch } = useGetFilteredStepsQuery(
    { taskId: task?.id },
    {
      skip: !task?.id,
    }
  );

  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: true,
      cellEditor: AutoCompleteEditor,
      cellEditorParams: {
        options: partNumbers,
      },
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
    // Добавьте другие колонки по необходимости
  ]);

  // const onGridReady = useCallback((params: any) => {
  //   // Загрузите данные для таблицы здесь
  // }, []);

  const [periodType, setPeriodType] = useState<'day' | 'week' | 'month'>(
    'week'
  );
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(1, 'year').startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showTaskTimes, setShowTaskTimes] = useState(true);

  // Добавляем новый хук для получения действий по taskID
  const { data: taskActions } = useGetFilteredActionsQuery(
    {
      taskID: task?.id || task?._id,
      projectStepId: '',
    } as any,
    {
      skip: !task?.id,
    }
  );

  // Обновляем функцию getChartData
  const getChartData = useMemo(() => {
    if (!taskActions) return [];

    const filteredActions = taskActions.filter((action) => {
      const actionDate = dayjs(action.createDate);
      return (
        actionDate.isAfter(dateRange[0]) && actionDate.isBefore(dateRange[1])
      );
    });

    const groupedData = filteredActions.reduce(
      (acc: Record<string, any>, action) => {
        const date = dayjs(action.createDate);
        const key = (() => {
          switch (periodType) {
            case 'day':
              return date.format('YYYY-MM-DD');
            case 'week':
              return `${date.year()}-W${String(date.isoWeek()).padStart(
                2,
                '0'
              )}`;
            case 'month':
              return date.format('YYYY-MM');
            default:
              return date.format('YYYY-MM-DD');
          }
        })();

        if (!acc[key]) {
          acc[key] = {
            date: key,
            actions: [],
          };
        }

        acc[key].actions.push(action);
        return acc;
      },
      {}
    );

    // Преобразуем данные для графика
    return Object.entries(groupedData)
      .map(([date, data]: [string, any]) => {
        const stats = calculateTaskStats(data.actions);

        return {
          date,
          completed: stats.completed,
          totalTaskTime: stats.totalTime,
          avgTimePerTask: stats.avgTimePerTask,
        };
      })
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  }, [taskActions, periodType, dateRange]);

  // Обновляем компонент графика
  <LineChart
    data={getChartData}
    margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis
      dataKey="date"
      fontSize={10}
      tickFormatter={(value) => {
        switch (periodType) {
          case 'day':
            return dayjs(value).format('DD.MM');
          case 'week':
            const [year, week] = value.split('-W');
            return `W${week}`;
          case 'month':
            return dayjs(value).format('MM.YY');
          default:
            return value;
        }
      }}
    />
    <YAxis
      fontSize={10}
      width={30}
      yAxisId="left"
      orientation="left"
      domain={[0, 'auto']}
    />
    <YAxis
      fontSize={10}
      width={30}
      yAxisId="right"
      orientation="right"
      domain={[0, 'auto']}
    />
    <Tooltip
      formatter={(value: any, name: string) => {
        const formatters: Record<string, string> = {
          completed: t('Completed'),
          totalTaskTime: t('Total Time'),
          avgTimePerTask: t('Avg Time per Task'),
        };

        const formattedValue =
          typeof value === 'number'
            ? name.includes('Time')
              ? `${value.toFixed(1)}h`
              : value
            : value;

        return [formattedValue, formatters[name] || name];
      }}
    />
    <Legend wrapperStyle={{ fontSize: '10px' }} />
    {showCompleted && (
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="completed"
        stroke="#52c41a"
        name={t('Completed')}
        dot={{ r: 2 }}
      />
    )}
    {showTaskTimes && (
      <>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="avgTimePerTask"
          stroke="#722ed1"
          name={t('Avg Time per Task')}
          dot={{ r: 2 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="totalTaskTime"
          stroke="#eb2f96"
          name={t('Total Time')}
          dot={{ r: 2 }}
        />
      </>
    )}
  </LineChart>;

  // Обновляем общую статистику
  const taskTimeStats = useMemo(() => {
    if (!taskActions) {
      return {
        totalTime: 0,
        avgTimePerAction: 0,
        totalActions: 0,
        uniqueTasksCount: 0,
        timeBySkill: {},
        actionsCountBySkill: {},
        avgTimeBySkill: {},
        completed: 0,
      };
    }

    const stats = calculateTaskStats(taskActions);
    const timeBySkill: Record<string, number> = {};
    const actionsCountBySkill: Record<string, number> = {};

    taskActions.forEach((action) => {
      const duration = action.userDurations?.[0]?.duration || 0;
      if (duration > 0) {
        const skill = action.userDurations?.[0]?.userID?.skillID?.code;
        if (skill) {
          timeBySkill[skill] = (timeBySkill[skill] || 0) + duration;
          actionsCountBySkill[skill] = (actionsCountBySkill[skill] || 0) + 1;
        }
      }
    });

    const avgTimeBySkill = Object.entries(timeBySkill).reduce(
      (acc, [skill, time]) => {
        acc[skill] =
          stats.uniqueTasksCount > 0
            ? Number((time / stats.uniqueTasksCount).toFixed(2))
            : 0;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalTime: stats.totalTime,
      avgTimePerAction: stats.avgTimePerTask,
      totalActions: stats.totalActions,
      uniqueTasksCount: stats.uniqueTasksCount,
      timeBySkill,
      actionsCountBySkill,
      avgTimeBySkill,
      completed: stats.completed,
    };
  }, [taskActions]);

  // Обновляем компонент статистики
  const renderTaskTimeStats = () => (
    <Row gutter={[4, 4]} className="mt-1">
      <Col span={4}>
        <Card size="small" bodyStyle={{ padding: '4px' }}>
          <Statistic
            title={<span className="text-[10px]">{t('Total Task Time')}</span>}
            value={taskTimeStats.totalTime}
            precision={1}
            valueStyle={{ color: '#1890ff', fontSize: '14px' }}
            suffix="h"
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card size="small" bodyStyle={{ padding: '4px' }}>
          <Statistic
            title={
              <span className="text-[10px]">{t('Avg Time per Task')}</span>
            }
            value={taskTimeStats.avgTimePerAction}
            precision={1}
            valueStyle={{ color: '#52c41a', fontSize: '14px' }}
            suffix="h"
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card size="small" bodyStyle={{ padding: '4px' }}>
          <Statistic
            title={<span className="text-[10px]">{t('Tasks/Actions')}</span>}
            value={`${taskTimeStats.uniqueTasksCount}/${taskTimeStats.totalActions}`}
            valueStyle={{ color: '#faad14', fontSize: '14px' }}
          />
        </Card>
      </Col>
      {Object.entries(taskTimeStats.avgTimeBySkill).map(([skill, avgTime]) => (
        <Col span={4} key={skill}>
          <Card size="small" bodyStyle={{ padding: '4px' }}>
            <Statistic
              title={
                <span className="text-[10px]">{`${t('Avg')} ${skill}`}</span>
              }
              value={avgTime}
              precision={1}
              valueStyle={{ color: '#722ed1', fontSize: '14px' }}
              suffix="h"
            />
            <div className="text-[8px] text-gray-500">
              {`${t('Actions')}: ${
                taskTimeStats.actionsCountBySkill[skill] || 0
              }`}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  return (
    <ProForm
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => [
          activeTabKey !== '3' &&
            activeTabKey !== '4' &&
            activeTabKey !== '5' &&
            activeTabKey !== '2' && <SubmitButton key="submit" />,
          task &&
            activeTabKey !== '3' &&
            activeTabKey !== '4' &&
            activeTabKey !== '2' &&
            activeTabKey !== '5' &&
            dom.reverse()[1],
        ],
      }}
      layout="horizontal"
    >
      <Tabs
        activeKey={activeTabKey}
        defaultActiveKey="1"
        type="card"
        onChange={(key) => setActiveTabKey(key)}
      >
        <Tabs.TabPane tab={t('INFORMATION')} key="1">
          <div className=" h-[57vh] flex flex-col overflow-auto">
            <ProFormGroup>
              <ProFormGroup>
                <ProFormSelect
                  showSearch
                  name="acTypeId"
                  label={t('AC TYPE')}
                  width="lg"
                  valueEnum={acTypeValueEnum}
                  onChange={(value: any) => setACTypeID(value)}
                />
                {taskType !== 'PART_PRODUCE' && taskType !== 'HARD_ACCESS' && (
                  <ProFormSelect
                    mode={'multiple'}
                    showSearch
                    name="mpdDocumentationId"
                    label={t('MPD CODE')}
                    width="lg"
                    valueEnum={mpdCodesValueEnum}
                    disabled={!acTypeID} // Disable the select if acTypeID is not set
                  />
                )}
                {taskType !== 'PART_PRODUCE' && (
                  <>
                    <ProFormSelect
                      showSearch
                      // initialValue={['PART_PRODUCE']}
                      name="taskType"
                      label={t('TASK TYPE')}
                      width="xl"
                      valueEnum={{
                        SB: { text: t('SERVICE BULLETIN') },
                        SMC: { text: t('SHEDULED MAINTENENCE CHECK') },
                        AD: { text: t('AIRWORTHINESS DIRECTIVE') },
                        PN: { text: t('COMPONENT') },
                        HARD_ACCESS: { text: t('HARD_ACCESS') },
                      }}
                      onChange={(value: any) => setTaskType(value)}
                    />
                  </>
                )}
                {taskType === 'PART_PRODUCE' && (
                  <>
                    <ProFormSelect
                      showSearch
                      name="taskType"
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                      label={t('TASK TYPE')}
                      width="xl"
                      valueEnum={{
                        SB: { text: t('SERVICE BULLETIN') },
                        SMC: { text: t('SHEDULED MAINTENENCE CHECK') },
                        // ADP: { text: t('ADP') },
                        AD: { text: t('AIRWORTHINESS DIRECTIVE') },
                        PN: { text: t('COMPONENT') },
                        HARD_ACCESS: { text: t('HARD_ACCESS') },
                        // PART_PRODUCE: { text: t('PART PRODUCE') },
                        // NRC: { text: t('NRC') },
                        // ADD_HOC: { text: t('ADD HOC') },
                      }}
                      onChange={(value: any) => setTaskType(value)}
                    />
                    <ProFormText
                      width={'lg'}
                      name="taskNumber"
                      label={t('TASK NUMBER')}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    />
                    <ProFormText
                      width={'lg'}
                      name="title"
                      label={t('TASK TITE')}
                      rules={[
                        {
                          required: false,
                        },
                      ]}
                    />
                    <ProFormTextArea
                      fieldProps={{
                        style: { resize: 'none' },
                        rows: 3,
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
                    <ProFormGroup>
                      <ProFormTextArea
                        fieldProps={{
                          style: { resize: 'none' },
                          rows: 5,
                        }}
                        width="xl"
                        name="notes"
                        label={t('NOTE')}
                      />
                      {/* <ProFormSelect
                        showSearch
                        mode="multiple"
                        rules={[{ required: true }]}
                        width={'md'}
                        name="instrumentID"
                        label={`${t(`TOOL`)}`}
                        // value={partNumber}
                        onChange={(value, data) => {
                          // console.log(data);
                        }}
                        options={Object.entries(toolValueEnum).map(
                          ([key, part]) => ({
                            label: part.PART_NUMBER,
                            value: key,
                            data: part,
                          })
                        )}
                      /> */}
                    </ProFormGroup>

                    {/* <ProFormGroup>
                      <ProFormSelect
                        showSearch
                        rules={[{ required: true }]}
                        width={'lg'}
                        name="partNumberID"
                        label={`${t(`PART No`)}`}
                        // valueEnum={partValueEnum}
                        // value={partNumber}
                        onChange={(value: string | undefined, data: any) => {
                          console.log(data);
                          form.setFields([
                            {
                              name: 'nameOfMaterial',
                              value: data.data.DESCRIPTION,
                            },
                            { name: 'unit', value: data.data.UNIT_OF_MEASURE },
                            { name: 'type', value: data.data.TYPE },
                            { name: 'group', value: data.data.GROUP },
                            {
                              name: 'WORKPIECE_DIMENSIONS',
                              value: data.data.WORKPIECE_DIMENSIONS,
                            },
                            {
                              name: 'MATERIAL',
                              value: data.data.MATERIAL,
                            },
                            {
                              name: 'WEIGHT',
                              value: data.data.WEIGHT,
                            },
                            {
                              name: 'SQUARE',
                              value: data.data.SQUARE,
                            },
                            {
                              name: 'COATING',
                              value: data.data.COATING,
                            },
                            {
                              name: 'WORKPIECE_WEIGHT',
                              value: data.data.WORKPIECE_WEIGHT,
                            },
                            {
                              name: 'WORKPIECE_MATERIAL_TYPE',
                              value: data.data.WORKPIECE_MATERIAL_TYPE,
                            },
                          ]);
                        }}
                        options={Object.entries(partValueEnum).map(
                          ([key, part]) => ({
                            label: part.PART_NUMBER,
                            value: key,
                            data: part,
                          })
                        )}
                      />

                      <ProFormText
                        disabled
                        rules={[{ required: true }]}
                        name="nameOfMaterial"
                        label={t('DESCRIPTION')}
                        width="md"
                        tooltip={t('DESCRIPTION')}
                      ></ProFormText>
                      <ProFormText
                        disabled
                        width="sm"
                        name="WORKPIECE_DIMENSIONS"
                        label={t('WORKPIECE DIMENSIONS')}
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      />
                      <ProFormText
                        disabled
                        rules={[{ required: true }]}
                        name="COATING"
                        label={t('COATING')}
                        width="md"
                        tooltip={t('COATING')}
                      ></ProFormText>
                      <ProFormText
                        disabled
                        rules={[{ required: true }]}
                        name="MATERIAL"
                        label={t('MATERIAL')}
                        width="md"
                        tooltip={t('MATERIAL')}
                      ></ProFormText>
                      <ProFormText
                        disabled
                        rules={[{ required: true }]}
                        name="WEIGHT"
                        label={t('WEIGHT')}
                        width="md"
                        tooltip={t('WEIGHT')}
                      ></ProFormText>
                      <ProFormText
                        disabled
                        rules={[{ required: true }]}
                        name="SQUARE"
                        label={t('SQUARE')}
                        width="md"
                        tooltip={t('SQUARE')}
                      ></ProFormText>
                      <ProFormText
                        disabled
                        rules={[{ required: true }]}
                        name="WORKPIECE_WEIGHT"
                        label={t('WORKPIECE_WEIGHT')}
                        width="md"
                        tooltip={t('WORKPIECE_WEIGHT')}
                      ></ProFormText>

                      <ProFormText
                        disabled
                        // rules={[{ required: true }]}
                        name="WORKPIECE_MATERIAL_TYPE"
                        label={t('WORKPIECE_MATERIAL_TYPE')}
                        width="md"
                        tooltip={t('WORKPIECE_MATERIAL_TYPE')}
                      ></ProFormText>
                    </ProFormGroup> */}
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
                        width={'xl'}
                        name="taskNumber"
                        label={t('TASK NUMBER')}
                      />
                      <ProFormText
                        width={'lg'}
                        name="title"
                        label={t('TASK TITE')}
                        rules={[
                          {
                            required: false,
                          },
                        ]}
                      />
                      <ProFormText
                        width={'xs'}
                        name="rev"
                        label={t('REVISION')}
                      />
                      <ProFormDigit
                        width={'xs'}
                        name="mainWorkTime"
                        label={t('MHS')}
                      />
                      {taskType == 'HARD_ACCESS' && (
                        <ProFormGroup>
                          <ProFormDigit
                            width={'xs'}
                            name="OPEN_MHR"
                            label={t('REMOVE MHS')}
                          />
                          <ProFormDigit
                            width={'xs'}
                            name="CLOSE_MHR"
                            label={t('INSTALL MHS')}
                          />
                        </ProFormGroup>
                      )}

                      <ProFormCheckbox
                        name="isCriticalTask"
                        label={t('CRITICAL TASK')}
                        initialValue={task?.isCriticalTask || false}
                      />
                      <ProFormTextArea
                        fieldProps={{
                          style: { resize: 'none' },
                          rows: 6,
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
                      width={'sm'}
                      fieldProps={{ style: { resize: 'none' } }}
                      name="amtoss"
                      label={t('REFERENCE')}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    />
                    <ProFormSelect
                      showSearch
                      name="zonesID"
                      mode={'multiple'}
                      label={t('ZONES')}
                      width="sm"
                      valueEnum={zonesValueEnum}
                      disabled={!acTypeID}
                    />
                    {taskType !== 'HARD_ACCESS' && (
                      <ProFormSelect
                        showSearch
                        name="accessID"
                        mode={'multiple'}
                        label={t('ACCESS')}
                        width="sm"
                        valueEnum={accessCodesValueEnum}
                        disabled={!acTypeID}
                      />
                    )}
                    <ProFormSelect
                      showSearch
                      name="code"
                      label={t('TASK CODE')}
                      width="sm"
                      valueEnum={taskCodesValueEnum}
                      disabled={!acTypeID}
                    />
                    <ProFormSelect
                      // disabled
                      showSearch
                      mode="multiple"
                      name="restrictionID"
                      label={t('RESTRICTION')}
                      width="sm"
                      valueEnum={restrictionValueEnum}
                      // disabled={!acTypeID}
                    />
                    {taskType !== 'HARD_ACCESS' && (
                      <ProFormSelect
                        // disabled={!order?.projectTaskReferenceID}
                        showSearch
                        mode="multiple"
                        name="preparationID"
                        label={t('HARD_ACCESS')}
                        width="sm"
                        valueEnum={hardValueEnum}
                        // disabled={!acTypeID}
                      />
                    )}
                    <ProFormSelect
                      // disabled
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
                      name="note"
                      label={t('REMARKS')}
                      width="lg"
                    />
                    <ProFormSelect
                      showSearch
                      name="status"
                      label={t('STATUS')}
                      width="sm"
                      valueEnum={{
                        ACTIVE: { text: t('ACTIVE'), status: 'SUCCESS' },
                        INACTIVE: { text: t('INACTIVE'), status: 'Error' },
                      }}
                    />
                  </>
                )}
              </ProFormGroup>
              {/* {taskType !== 'PART_PRODUCE' && (
                <ProFormGroup>
                  <ProFormDigit
                    width={'xs'}
                    name="intervalDAYS"
                    label={t('INTERVAL DAYS')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="toleranceDAY"
                    label={t('TOLERANCE DAY')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="intervalMOS"
                    label={t('INTERVAL MOS')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="toleranceMOS"
                    label={t('TOLERANCE MOS')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="intervalHRS"
                    label={t('INTERVAL HRS')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="toleranceMHS"
                    label={t('TOLERANCE MHS')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="intervalAFL"
                    label={t('INTERVAL AFL')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="intervalENC"
                    label={t('INTERVAL ENC')}
                  />
                  <ProFormDigit
                    width={'xs'}
                    name="intervalAPUS"
                    label={t('INTERVAL APUS')}
                  />
                </ProFormGroup>
              )} */}
              {/* Добавьте ProFormSwitch для isCriticalTask */}
            </ProFormGroup>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('STEPS')} key="2">
          <div className=" h-[62vh] flex flex-col overflow-auto pb-3">
            {steps ? (
              <StepContainer
                templates={templates}
                steps={steps || []}
                onAddStep={function (newStep: IStep): void {
                  handleAddStep(newStep);
                }}
                onDeleteStep={handleDeleteStep}
                groups={groups || []}
                skills={skills || []}
              />
            ) : (
              <Empty />
            )}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('PARTS')} key="3">
          <div>
            {task ? (
              <div
                className="ag-theme-alpine flex"
                style={{ width: '100%', height: '60vh' }}
              >
                <PartList
                  isTool="TOOL,GSE"
                  fetchData={[]}
                  taskId={task.id}
                  columnDefs={columnDefs}
                  partNumbers={partNumbers || []}
                  onUpdateData={function (data: any[]): void {
                    console.log(data);
                  }}
                ></PartList>
              </div>
            ) : (
              <Empty />
            )}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('TOOL')} key="4">
          <div>
            {task ? (
              <div
                className="ag-theme-alpine flex"
                style={{ width: '100%', height: '60vh' }}
              >
                <PartList
                  isTool="ROT,CONS,CHEM"
                  fetchData={[]}
                  taskId={task.id}
                  columnDefs={columnDefs}
                  onUpdateData={function (data: any[]): void {}}
                ></PartList>
              </div>
            ) : (
              <Empty />
            )}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('DOCS')} key="5">
          <div>
            {task ? (
              <div
              // className="ag-theme-alpine flex"
              // style={{ width: '100%', height: '60vh' }}
              >
                <FileListE
                  height={'60vh'}
                  isDefaultFileDisable={false}
                  isCuctomerCode={true}
                  isEfectivityField={true}
                  isTaskNumberField={false}
                  handleDelete={handleDeleteUpload}
                  initialFiles={task.reference || []}
                  onAddFile={function (file: any): void {
                    handleUploadReference(file);
                  }}
                  onSelectedKeys={setSelectedKeys}
                ></FileListE>
              </div>
            ) : (
              <Empty />
            )}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('STATISTICS')} key="statistics">
          <div className="flex flex-col gap-2 p-2 h-full">
            {/* Верхние карточки со статистикой */}
            <Row gutter={[4, 4]}>
              <Col span={4}>
                <Card size="small" bodyStyle={{ padding: '4px' }}>
                  <Statistic
                    title={
                      <span className="text-[10px]">{t('Completed')}</span>
                    }
                    value={taskTimeStats.completed || 0}
                    valueStyle={{ color: '#52c41a', fontSize: '14px' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card size="small" bodyStyle={{ padding: '4px' }}>
                  <Statistic
                    title={
                      <span className="text-[10px]">{t('Total Time')}</span>
                    }
                    value={taskTimeStats.totalTime}
                    precision={1}
                    valueStyle={{ color: '#eb2f96', fontSize: '14px' }}
                    suffix="h"
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card size="small" bodyStyle={{ padding: '4px' }}>
                  <Statistic
                    title={
                      <span className="text-[10px]">
                        {t('Avg Time per Task')}
                      </span>
                    }
                    value={taskTimeStats.avgTimePerAction}
                    precision={1}
                    valueStyle={{ color: '#722ed1', fontSize: '14px' }}
                    suffix="h"
                  />
                </Card>
              </Col>
              {Object.entries(taskTimeStats.avgTimeBySkill).map(
                ([skill, avgTime]) => (
                  <Col span={4} key={skill}>
                    <Card size="small" bodyStyle={{ padding: '4px' }}>
                      <Statistic
                        title={
                          <span className="text-[10px]">{`${t(
                            'Avg'
                          )} ${skill}`}</span>
                        }
                        value={avgTime}
                        precision={1}
                        valueStyle={{ color: '#722ed1', fontSize: '14px' }}
                        suffix="h"
                      />
                      <div className="text-[8px] text-gray-500">
                        {`${t('Actions')}: ${
                          taskTimeStats.actionsCountBySkill[skill] || 0
                        }`}
                      </div>
                    </Card>
                  </Col>
                )
              )}
            </Row>

            {/* Контролы графика */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-4">
                <Checkbox
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                >
                  {t('Show Completed')}
                </Checkbox>
                <Checkbox
                  checked={showTaskTimes}
                  onChange={(e) => setShowTaskTimes(e.target.checked)}
                >
                  {t('Show Task Times')}
                </Checkbox>
              </div>
              <div className="flex items-center gap-4">
                <Radio.Group
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value)}
                  size="small"
                >
                  <Radio.Button value="day">{t('Daily')}</Radio.Button>
                  <Radio.Button value="week">{t('Weekly')}</Radio.Button>
                  <Radio.Button value="month">{t('Monthly')}</Radio.Button>
                </Radio.Group>
                <RangePicker
                  size="small"
                  onChange={handleDateRangeChange}
                  picker={
                    periodType === 'month'
                      ? 'month'
                      : periodType === 'week'
                      ? 'week'
                      : 'date'
                  }
                  value={dateRange}
                  format={
                    periodType === 'month'
                      ? 'YYYY-MM'
                      : periodType === 'week'
                      ? 'YYYY-[W]ww'
                      : 'YYYY-MM-DD'
                  }
                />
              </div>
            </div>

            {/* График */}
            <div style={{ height: '40vh', width: '100%' }}>
              <ResponsiveContainer>
                <LineChart
                  data={getChartData}
                  margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    fontSize={10}
                    tickFormatter={(value) => {
                      switch (periodType) {
                        case 'day':
                          return dayjs(value).format('DD.MM');
                        case 'week':
                          const [year, week] = value.split('-W');
                          return `W${week}`;
                        case 'month':
                          return dayjs(value).format('MM.YY');
                        default:
                          return value;
                      }
                    }}
                  />
                  <YAxis
                    fontSize={10}
                    width={30}
                    yAxisId="left"
                    orientation="left"
                    domain={[0, 'auto']}
                  />
                  <YAxis
                    fontSize={10}
                    width={30}
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      const formatters: Record<string, string> = {
                        completed: t('Completed'),
                        totalTaskTime: t('Total Time'),
                        avgTimePerTask: t('Avg Time per Task'),
                      };

                      const formattedValue =
                        typeof value === 'number'
                          ? name.includes('Time')
                            ? `${value.toFixed(1)}h`
                            : value
                          : value;

                      return [formattedValue, formatters[name] || name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  {showCompleted && (
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="completed"
                      stroke="#52c41a"
                      name={t('Completed')}
                      dot={{ r: 2 }}
                    />
                  )}
                  {showTaskTimes && (
                    <>
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgTimePerTask"
                        stroke="#722ed1"
                        name={t('Avg Time per Task')}
                        dot={{ r: 2 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="totalTaskTime"
                        stroke="#eb2f96"
                        name={t('Total Time')}
                        dot={{ r: 2 }}
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};

export default AdminTaskPanelForm;
