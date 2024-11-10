// @ts-nocheck

import React, { FC, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Divider,
  Tag,
  Space,
  Statistic,
  Timeline,
  Empty,
  Tabs,
  Progress,
  Table,
} from 'antd';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { Pie, Bar } from '@ant-design/charts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ProDescriptions } from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';
import { useGetFilteredActionsQuery } from '../../features/projectItemWO/actionsApi';

const { Title, Text } = Typography;

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
  lastAutoTable: {
    finalY: number;
  };
}

interface DailyReportProps {
  workOrder: any;
  tasks: any[];
  accesses: any[];
}

const DailyReport: FC<DailyReportProps> = ({ workOrder, tasks, accesses }) => {
  const { t } = useTranslation();
  const { data: allActions } = useGetFilteredActionsQuery({
    // projectStepId: workOrder?.projectStepId || '',
    workOrderID: workOrder?._id,
  });

  if (!workOrder) {
    return <Text>Work order data is not available.</Text>;
  }

  // Functions for calculating statistics
  const calculateTaskStats = () => {
    const total = tasks?.length || 0;
    const completed =
      tasks?.filter((task) => task.status === 'closed').length || 0;
    const remaining = total - completed;
    const defectsCount =
      tasks?.filter((task) => task.projectItemType === 'NRC').length || 0;
    const completedDefects =
      tasks?.filter(
        (task) => task.projectItemType === 'NRC' && task.status === 'closed'
      ).length || 0;

    return { total, completed, remaining, defectsCount, completedDefects };
  };

  const calculateDefectStats = () => {
    const defects =
      tasks?.filter((task) => task.projectItemType === 'NRC') || [];
    return defects.length;
  };

  const calculateTimeStats = (): {
    plannedTime: number;
    spentTime: number;
    defectTime: number;
  } => {
    console.log('Start of calculateTimeStats');
    console.log('All actions:', allActions);

    const routineTasks =
      tasks?.filter((task) => task.projectItemType !== 'NRC') || [];
    const defects =
      tasks?.filter((task) => task.projectItemType === 'NRC') || [];

    console.log('Number of routine tasks:', routineTasks.length);
    console.log('Number of defects:', defects.length);

    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const plannedTime =
      tasks?.reduce((acc, task) => acc + (task.taskId?.mainWorkTime || 0), 0) ||
      0;
    console.log('Planned time:', plannedTime);

    const calculateTaskTime = (taskActions: any[]) => {
      const totalTime = taskActions.reduce((acc, action) => {
        const actionTime =
          action.userDurations?.reduce(
            (sum: number, duration: any) => sum + (duration.duration || 0),
            0
          ) || 0;
        console.log('Action time:', actionTime);
        return acc + actionTime;
      }, 0);
      console.log('Total time for task:', totalTime);
      return totalTime;
    };

    let spentTime = 0;
    let defectTime = 0;

    console.log('Calculating time for routine tasks:');
    routineTasks.forEach((task) => {
      if (!task.id) {
        console.warn('Task without _id:', task);
        return;
      }
      const taskActions =
        allActions?.filter((action) => action.projectTaskID === task.id) || [];
      console.log(`Task ${task._id}, number of actions:`, taskActions.length);
      const taskTime = calculateTaskTime(taskActions);
      console.log(`Time for routine task ${task.id}:`, taskTime);
      spentTime += taskTime;
    });

    console.log('Calculating time for defects:');
    defects.forEach((task) => {
      if (!task.id) {
        console.warn('Defect without _id:', task);
        return;
      }
      const taskActions =
        allActions?.filter((action) => action.projectTaskID === task.id) || [];
      console.log(`Defect ${task.id}, number of actions:`, taskActions.length);
      const taskTime = calculateTaskTime(taskActions);
      console.log(`Time for defect ${task.id}:`, taskTime);
      defectTime += taskTime;
    });

    console.log('Total time spent:', spentTime);
    console.log('Total time on defects:', defectTime);
    return {
      plannedTime: parseFloat(formatter.format(plannedTime)),
      spentTime: parseFloat(formatter.format(spentTime)),
      defectTime: parseFloat(formatter.format(defectTime)),
    };
  };

  const calculateTimeBySkill = useMemo(() => {
    console.log('useMemo for calculateTimeBySkill is called');
    const timeBySkill: Record<string, number> = {};
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    console.log('allActions in calculateTimeBySkill:', allActions);

    if (!allActions || !Array.isArray(allActions)) {
      console.warn('allActions is missing or not an array');
      return timeBySkill;
    }

    allActions.forEach((action, index) => {
      console.log(`Processing action ${index}:`, action);

      if (!action.userDurations || !Array.isArray(action.userDurations)) {
        console.warn(
          `userDurations is missing or not an array for action ${index}`
        );
        return;
      }

      action.userDurations.forEach((duration, dIndex) => {
        console.log(
          `Processing duration ${dIndex} for action ${index}:`,
          duration
        );

        const skillCode = duration.userID?.skillID?.code;
        if (!skillCode) {
          console.warn(
            `Missing skillCode for duration ${dIndex} of action ${index}`
          );
          return;
        }

        const durationValue = duration.duration;
        if (typeof durationValue !== 'number' || isNaN(durationValue)) {
          console.warn(
            `Invalid duration value for skillCode ${skillCode}: ${durationValue}`
          );
          return;
        }

        timeBySkill[skillCode] = (timeBySkill[skillCode] || 0) + durationValue;
      });
    });

    console.log('Final timeBySkill before formatting:', timeBySkill);

    // Formatting values
    Object.keys(timeBySkill).forEach((skillCode) => {
      timeBySkill[skillCode] = parseFloat(
        formatter.format(timeBySkill[skillCode])
      );
    });

    console.log('Final timeBySkill after formatting:', timeBySkill);
    return timeBySkill;
  }, [allActions]);

  const getMissingMaterials = () => {
    // Logic for getting missing materials
    return []; // Replace with real data
  };

  // Export functions
  const exportToPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;

    // Title with №
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185); // Синий цвет для заголовка
    doc.text(`Daily Report - WO No ${workOrder.WONumber}`, pageWidth / 2, 15, {
      align: 'center',
    });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Aircraft Information
    doc.setFontSize(14);
    doc.text('Aircraft Information', margin, 30);
    doc.autoTable({
      startY: 35,
      margin,
      head: [['Property', 'Value']],
      body: [
        ['AC Reg', workOrder.planeId?.regNbr || ''],
        ['AC Type', workOrder.planeId?.acTypeId?.[0]?.code || ''],
        ['MSN', workOrder.planeId?.serialNbr || ''],
        ['Effectivity', workOrder.planeId?.efectivityNumber || ''],
        ['Manufactory date', formatDate(workOrder.planeId?.manafacturesDate)],
        ['Engine Type', workOrder.planeId?.engineType || ''],
        ['APU Type', workOrder.planeId?.apuType || ''],
        ['Total Frame Hours', workOrder.planeId?.airFrameHours || ''],
        ['Total Frame Cycles', workOrder.planeId?.airFrameLandings || ''],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 12,
      },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Work Order Information
    doc.text('Work Order Information', margin, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      margin,
      head: [['Property', 'Value']],
      body: [
        ['WO Number', workOrder.WONumber],
        ['WO Name', workOrder.WOName],
        ['Status', workOrder.status],
        ['WO Type', workOrder.WOType],
        ['Creation Date', formatDateTime(workOrder.createDate)],
        [
          'Start Date',
          workOrder.startDate
            ? formatDateTime(workOrder.startDate)
            : 'Not specified',
        ],
        [
          'Planned Finish Date',
          workOrder.planedFinishDate
            ? formatDateTime(workOrder.planedFinishDate)
            : 'Not specified',
        ],
        ['Description', workOrder.description || 'Not available'],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 12,
      },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Task Statistics
    doc.addPage();
    doc.text('Task Statistics', margin, 15);
    const taskStats = calculateTaskStats();
    const timeStats = calculateTimeStats();
    doc.autoTable({
      startY: 20,
      margin,
      head: [['Metric', 'Value']],
      body: [
        ['Total Tasks', taskStats.total],
        ['Completed Tasks', taskStats.completed],
        ['Remaining Tasks', taskStats.remaining],
        ['Planned Time (hours)', timeStats.plannedTime.toFixed(2)],
        ['Spent Time (without NRC) (hours)', timeStats.spentTime.toFixed(2)],
        ['Spent Time on NRC (hours)', timeStats.defectTime.toFixed(2)],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 12,
      },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Time by Task Type
    doc.text('Time by Task Type', margin, doc.lastAutoTable.finalY + 10);
    const timeByTaskType = calculateTimeByTaskType();
    const taskTypeTimeData = Object.entries(timeByTaskType).map(
      ([type, times]) => [
        type,
        `${times.planned.toFixed(2)}h`,
        `${times.actual.toFixed(2)}h`,
        `${(times.actual - times.planned).toFixed(2)}h`,
      ]
    );

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      margin,
      head: [['Task Type', 'Planned', 'Actual', 'Difference']],
      body: taskTypeTimeData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 12,
      },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Time by Skill
    doc.addPage();
    doc.text('Time by Skill', margin, 15);
    const skillTimeData = Object.entries(calculateTimeBySkill).map(
      ([skill, time]) => [skill, `${time.toFixed(2)}h`]
    );

    doc.autoTable({
      startY: 20,
      margin,
      head: [['Skill', 'Hours']],
      body: skillTimeData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 12,
      },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Access Statistics
    const accessStats = calculateAccessStats();
    doc.text('Access Statistics', margin, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      margin,
      head: [['Status', 'Count']],
      body: [
        ['Total Accesses', accessStats.total],
        ['Opened', accessStats.opened],
        ['Closed', accessStats.closed],
        ['Inspected', accessStats.inspected],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 12,
      },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Save PDF
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `daily_report_WO_№${workOrder.WONumber}_${currentDate}.pdf`;
    doc.save(filename);
  };

  const exportToExcel = () => {
    // Подготовка данных для Excel
    const workOrderInfo = [
      [t('Aircraft Information')],
      [t('AC Reg'), workOrder.planeId?.regNbr || ''],
      [t('AC Type'), workOrder.planeId?.acTypeId?.[0]?.code || ''],
      [t('MSN'), workOrder.planeId?.serialNbr || ''],
      [t('Effectivity'), workOrder.planeId?.efectivityNumber || ''],
      [t('Manufactory date'), workOrder.planeId?.manafacturesDate || ''],
      [t('Engine Type'), workOrder.planeId?.engineType || ''],
      [t('APU Type'), workOrder.planeId?.apuType || ''],
      [t('Total Frame Hours'), workOrder.planeId?.airFrameHours || ''],
      [t('Total Frame Cycles'), workOrder.planeId?.airFrameLandings || ''],
      [],
      [t('Work Order Information')],
      [t('WO Number'), workOrder.WONumber],
      [t('WO Name'), workOrder.WOName],
      [t('Status'), workOrder.status],
      [t('WO Type'), workOrder.WOType],
      [
        t('Creation Date'),
        workOrder.createDate
          ? new Date(workOrder.createDate).toLocaleString()
          : '',
      ],
      [
        t('Start Date'),
        workOrder.startDate
          ? new Date(workOrder.startDate).toLocaleString()
          : '',
      ],
      [
        t('Planned Finish Date'),
        workOrder.planedFinishDate
          ? new Date(workOrder.planedFinishDate).toLocaleString()
          : '',
      ],
    ];

    // Статистика задач
    const taskStats = calculateTaskStats();
    const timeStats = calculateTimeStats();
    const taskStatistics = [
      [],
      [t('Task Statistics')],
      [t('Total Tasks'), taskStats.total],
      [t('Completed Tasks'), taskStats.completed],
      [t('Remaining Tasks'), taskStats.remaining],
      [t('Planned Time (hours)'), timeStats.plannedTime.toFixed(2)],
      [t('Spent Time (without NRC) (hours)'), timeStats.spentTime.toFixed(2)],
      [t('Spent Time on NRC (hours)'), timeStats.defectTime.toFixed(2)],
    ];

    // Время по типам задач
    const timeByTaskType = calculateTimeByTaskType();
    const timeByTaskTypeData = [
      [],
      [t('Time by Task Type')],
      [
        t('Task Type'),
        t('Planned Time (h)'),
        t('Actual Time (h)'),
        t('Difference (h)'),
      ],
      ...Object.entries(timeByTaskType).map(([type, times]) => [
        type,
        times.planned.toFixed(2),
        times.actual.toFixed(2),
        (times.actual - times.planned).toFixed(2),
      ]),
    ];

    // Время по навыкам
    const timeBySkill = calculateTimeBySkill;
    const timeBySkillData = [
      [],
      [t('Time by Skill')],
      [t('Skill'), t('Hours')],
      ...Object.entries(timeBySkill).map(([skill, time]) => [
        skill,
        time.toFixed(2),
      ]),
    ];

    // Статистика доступов
    const accessStats = calculateAccessStats();
    const accessData = [
      [],
      [t('Access Statistics')],
      [t('Total Accesses'), accessStats.total],
      [t('Opened'), accessStats.opened],
      [t('Closed'), accessStats.closed],
      [t('Inspected'), accessStats.inspected],
    ];

    // Создаем рабочую книгу
    const wb = XLSX.utils.book_new();

    // Создаем листы с данными
    const wsInfo = XLSX.utils.aoa_to_sheet([...workOrderInfo]);
    const wsTaskStats = XLSX.utils.aoa_to_sheet([...taskStatistics]);
    const wsTimeByTaskType = XLSX.utils.aoa_to_sheet([...timeByTaskTypeData]);
    const wsTimeBySkill = XLSX.utils.aoa_to_sheet([...timeBySkillData]);
    const wsAccessStats = XLSX.utils.aoa_to_sheet([...accessData]);

    // Добавляем листы в книгу
    XLSX.utils.book_append_sheet(wb, wsInfo, t('General Information'));
    XLSX.utils.book_append_sheet(wb, wsTaskStats, t('Task Statistics'));
    XLSX.utils.book_append_sheet(wb, wsTimeByTaskType, t('Time by Task Type'));
    XLSX.utils.book_append_sheet(wb, wsTimeBySkill, t('Time by Skill'));
    XLSX.utils.book_append_sheet(wb, wsAccessStats, t('Access Statistics'));

    // Генерируем имя файла с текущей датой
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `daily_report_WO_${workOrder.WONumber}_${currentDate}.xlsx`;

    // Сохраняем файл
    XLSX.writeFile(wb, filename);
  };

  // Chart components
  const TasksPieChart = () => {
    const { completed, remaining } = calculateTaskStats();
    const data = [
      { type: 'Completed', value: completed },
      { type: 'Remaining', value: remaining },
    ];
    return (
      <Pie
        data={data}
        angleField="value"
        colorField="type"
        height={280}
        radius={0.8}
        label={{
          type: 'outer',
          content: '{name}: {value}',
          style: { fontSize: 12 },
        }}
        legend={{
          position: 'bottom',
          itemHeight: 8,
          itemWidth: 8,
          padding: [8, 0, 0, 0],
        }}
        padding={[10, 10, 20, 10]}
      />
    );
  };

  const TimeBarChart = () => {
    const { plannedTime, spentTime, defectTime } = calculateTimeStats();
    const data = [
      { type: 'Planned', value: plannedTime, category: 'Total' },
      {
        type: 'Spent (without NRC)',
        value: spentTime,
        category: 'Routine tasks',
      },
      { type: 'Spent on NRC', value: defectTime, category: 'Defects' },
    ];

    return (
      <Bar
        data={data}
        yField="value"
        xField="type"
        seriesField="category"
        isGroup={true}
        height={280}
        yAxis={{
          max: Math.max(...data.map((item) => item.value)) * 1.1,
          tickCount: 5,
          label: {
            formatter: (v: string) => `${Number(v).toFixed(1)}h`,
            style: { fontSize: 11 },
          },
        }}
        label={{
          position: 'top',
          formatter: (datum: any) => `${datum.value.toFixed(1)}h`,
          style: { fontSize: 11 },
        }}
        legend={{
          position: 'bottom',
          itemHeight: 8,
          itemWidth: 8,
          padding: [8, 0, 0, 0],
        }}
        padding={[10, 10, 20, 30]}
      />
    );
  };

  const getDocumentRevision = (documentName: string) => {
    const document = workOrder.documents?.find(
      (doc: any) => doc?.name === documentName
    );
    return document ? `${document?.revision}-${document?.revisionDate}` : '';
  };

  const taskTypeNames = {
    RC: t('TC (MPD, Customer MP, Access, CDCCL, ALI, STR inspection)'),
    CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
    NRC: t('NRC (Defect)'),
    NRC_ADD: t('ADHOC(Adhoc Task)'),
    MJC: t('MJC (Extended MPD)'),
    CMJC: t('CMJC (Component maintenance)'),
    FC: t('FC (Fabrication card)'),
    HARD_ACCESS: t('HARD_ACCESS'),
  };

  const calculateTaskTypeStats = () => {
    const taskTypes = {
      'TC (MPD, Customer MP, Access, CDCCL, ALI, STR inspection)': 'RC',
      'CR TASK (CRITICAL TASK/DI)': 'CR_TASK',
      'HARD ACCESS': 'HARD_ACCESS',
      'NRC (Defect)': 'NRC',
      'ADHOC(Adhoc Task)': 'NRC_ADD',
    };

    return Object.entries(taskTypes)
      .map(([displayName, code]) => {
        const tasksOfType =
          tasks?.filter((task) => task.projectItemType === code) || [];
        const total = tasksOfType.length;
        const completed = tasksOfType.filter(
          (task) => task.status === 'closed'
        ).length;

        return {
          type: displayName,
          total,
          completed,
        };
      })
      .filter((stat) => stat.total > 0); // Фильтруем типы с нулевым количеством задач
  };

  // Updated component for displaying task distribution by type
  const TaskTypesPieChart = () => {
    const taskTypeStats = calculateTaskTypeStats();

    // Фильтруем и преобразуем данные, исключая нулевые значения
    const data = taskTypeStats
      .filter(({ total }) => total > 0)
      .map(({ type, total }) => ({
        type,
        value: total,
      }));

    return (
      <Pie
        data={data}
        angleField="value"
        colorField="type"
        height={280}
        radius={0.8}
        label={{
          type: 'outer',
          content: '{name}: {value}',
          style: { fontSize: 12 },
        }}
        legend={{
          position: 'top',
          itemHeight: 8,
          itemWidth: 8,
          maxRow: 2,
          padding: [8, 0, 0, 0],
        }}
        tooltip={{
          formatter: (datum) => ({
            name: datum.type,
            value: `${datum.value}`,
          }),
        }}
      />
    );
  };

  // New function for calculating access statistics
  const calculateAccessStats = () => {
    const total = accesses?.length || 0;
    const opened =
      accesses?.filter((access) => access.status === 'open').length || 0;
    const closed =
      accesses?.filter((access) => access.status === 'closed').length || 0;
    const inspected =
      accesses?.filter((access) => access.status === 'inspected').length || 0;

    return { total, opened, closed, inspected };
  };

  // New component for displaying access distribution by status
  const AccessPieChart = () => {
    const { opened, closed, inspected } = calculateAccessStats();
    const data = [
      { type: 'Opened', value: opened },
      { type: 'Closed', value: closed },
      { type: 'Inspected', value: inspected },
    ];
    return (
      <Pie
        data={data}
        angleField="value"
        colorField="type"
        height={300}
        radius={0.8}
        label={{
          type: 'outer',
          content: '{name}: {value}',
          style: { fontSize: 12 },
        }}
        legend={{
          position: 'bottom',
          itemHeight: 8,
          itemWidth: 8,
          padding: [8, 0, 0, 0],
        }}
      />
    );
  };

  const TimeBySkillPieChart = () => {
    const data = Object.entries(calculateTimeBySkill).map(
      ([skillCode, time]) => ({
        type: skillCode,
        value: time,
      })
    );

    return (
      <Pie
        data={data}
        angleField="value"
        colorField="type"
        height={300}
        radius={0.8}
        label={{
          type: 'outer',
          content: '{name} {percentage}',
          style: { fontSize: 12 },
        }}
        legend={{
          position: 'bottom',
          itemHeight: 8,
          itemWidth: 8,
          maxRow: 2,
          padding: [8, 0, 0, 0],
        }}
        interactions={[{ type: 'element-active' }]}
      />
    );
  };

  // Обовленные компоненты диаграмм
  const TaskStatusPieChart = () => {
    const { completed, remaining } = calculateTaskStats();
    const data = [
      { type: 'Completed', value: completed },
      { type: 'Remaining', value: remaining },
    ];
    return (
      <Pie
        data={data}
        angleField="value"
        colorField="type"
        height={280}
        radius={0.8}
        label={{
          type: 'outer',
          content: '{name}: {value}',
          style: { fontSize: 12 },
        }}
        legend={{
          position: 'bottom',
          itemHeight: 8,
          itemWidth: 8,
          padding: [8, 0, 0, 0],
        }}
      />
    );
  };

  const TimeByTaskTypeBarChart = () => {
    const timeByTaskType = calculateTimeByTaskType();

    // Преобразуем и фильтруем данные
    const data = Object.entries(timeByTaskType)
      .map(([type, values]) => ({
        taskType: type,
        planned: Math.max(0, Number(values.planned) || 0),
        actual: Math.max(0, Number(values.actual) || 0),
      }))
      .filter((item) => item.planned > 0 || item.actual > 0)
      .flatMap((item) => [
        {
          taskType: item.taskType,
          hours: item.planned,
          category: 'Planned',
        },
        {
          taskType: item.taskType,
          hours: item.actual,
          category: 'Actual',
        },
      ]);

    return (
      <Bar
        data={data}
        xField="taskType"
        yField="hours"
        seriesField="category"
        isGroup={true}
        height={280}
        xAxis={{
          label: {
            autoRotate: true,
            style: { fontSize: 10 },
          },
        }}
        yAxis={{
          min: 0,
          label: {
            formatter: (v) => `${Number(v).toFixed(1)}h`,
          },
        }}
        label={{
          position: 'top',
          formatter: (datum) => {
            const value = Number(datum.hours);
            return value > 0 ? `${value.toFixed(1)}h` : '';
          },
        }}
        tooltip={{
          formatter: (datum) => ({
            name: datum.category,
            value: `${Number(datum.hours).toFixed(1)}h`,
          }),
        }}
        legend={{
          position: 'top',
        }}
        columnStyle={{
          radius: [2, 2, 0, 0],
        }}
        interactions={[{ type: 'active-region' }]}
      />
    );
  };

  // Вспомогательная функция для получения названия типа задачи
  const getTaskTypeName = (projectItemType: string): string => {
    const typeMap: Record<string, string> = {
      RC: t('TC (MPD, Customer MP, Access, CDCCL, ALI, STR inspection)'),
      CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
      NRC: t('NRC (Defect)'),
      NRC_ADD: t('ADHOC(Adhoc Task)'),
      MJC: t('MJC (Extended MPD)'),
      CMJC: t('CMJC (Component maintenance)'),
      FC: t('FC (Fabrication card)'),
      HARD_ACCESS: t('HARD_ACCESS'),
    };
    return typeMap[projectItemType] || projectItemType;
  };

  // Обновленная функция расчета времени
  const calculateTimeByTaskType = () => {
    const taskTypes = {
      'TC (MPD)': 'RC',
      'CR TASK': 'CR_TASK',
      'HARD ACCESS': 'HARD_ACCESS',
      'NRC (Defect)': 'NRC',
      'ADHOC Task': 'NRC_ADD',
    };

    return Object.entries(taskTypes).reduce((acc, [displayName, code]) => {
      const typeTasks =
        tasks?.filter((task) => task.projectItemType === code) || [];

      // Плановое время
      const planned = typeTasks.reduce((sum, task) => {
        const time = Number(task.taskId?.mainWorkTime) || 0;
        return sum + (time > 0 ? time : 0);
      }, 0);

      // Фактическое время
      const actual = typeTasks.reduce((sum, task) => {
        const taskActions =
          allActions?.filter((action) => action.projectTaskID === task.id) ||
          [];
        const taskTime = taskActions.reduce((actionSum, action) => {
          const duration =
            action.userDurations?.reduce((durSum, dur) => {
              return durSum + (Number(dur.duration) || 0);
            }, 0) || 0;
          return actionSum + duration;
        }, 0);
        return sum + taskTime;
      }, 0);

      if (planned > 0 || actual > 0) {
        acc[displayName] = {
          planned: Math.round(planned * 100) / 100,
          actual: Math.round(actual * 100) / 100,
        };
      }
      return acc;
    }, {} as Record<string, { planned: number; actual: number }>);
  };

  // Обновленный компонент для отображения статистики времени
  const TimeStatisticsCard = () => {
    const timeByTaskType = calculateTimeByTaskType();

    return (
      <Row gutter={[8, 8]} className="mt-2">
        <Col xs={24} lg={12}>
          <Card
            title={t('Time by Task Type')}
            size="small"
            bodyStyle={{ padding: '4px' }}
          >
            <Table
              size="small"
              pagination={false}
              dataSource={Object.entries(timeByTaskType).map(
                ([type, times], index) => ({
                  key: index,
                  type,
                  planned: times.planned.toFixed(2),
                  actual: times.actual.toFixed(2),
                  difference: (times.actual - times.planned).toFixed(2),
                })
              )}
              columns={[
                {
                  title: t('Type'),
                  dataIndex: 'type',
                  key: 'type',
                  width: '35%',
                  ellipsis: true,
                  className: 'text-xs',
                },
                {
                  title: t('Plan'),
                  dataIndex: 'planned',
                  key: 'planned',
                  align: 'right',
                  width: '20%',
                  className: 'text-xs',
                  render: (value) => `${value}h`,
                },
                {
                  title: t('Actual'),
                  dataIndex: 'actual',
                  key: 'actual',
                  align: 'right',
                  width: '20%',
                  className: 'text-xs',
                  render: (value) => `${value}h`,
                },
                {
                  title: t('Diff'),
                  dataIndex: 'difference',
                  key: 'difference',
                  align: 'right',
                  width: '25%',
                  className: 'text-xs',
                  render: (value: string) => {
                    const num = parseFloat(value);
                    return (
                      <span style={{ color: num > 0 ? '#cf1322' : '#3f8600' }}>
                        {num > 0 ? `+${value}h` : `${value}h`}
                      </span>
                    );
                  },
                },
              ]}
              className="text-xs"
              summary={(data) => {
                const totals = data.reduce(
                  (acc, curr) => ({
                    planned: acc.planned + parseFloat(curr.planned),
                    actual: acc.actual + parseFloat(curr.actual),
                    difference: acc.difference + parseFloat(curr.difference),
                  }),
                  { planned: 0, actual: 0, difference: 0 }
                );

                return (
                  <Table.Summary.Row className="text-xs font-bold">
                    <Table.Summary.Cell>{t('Total')}</Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      {totals.planned.toFixed(2)}h
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      {totals.actual.toFixed(2)}h
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      <span
                        style={{
                          color: totals.difference > 0 ? '#cf1322' : '#3f8600',
                        }}
                      >
                        {totals.difference > 0 ? '+' : ''}
                        {totals.difference.toFixed(2)}h
                      </span>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={t('Time by Skill')}
            size="small"
            bodyStyle={{ padding: '4px' }}
          >
            <Table
              size="small"
              pagination={false}
              dataSource={Object.entries(calculateTimeBySkill).map(
                ([skill, time], index) => ({
                  key: index,
                  skill,
                  time: time.toFixed(2),
                })
              )}
              columns={[
                {
                  title: t('Skill'),
                  dataIndex: 'skill',
                  key: 'skill',
                  width: '60%',
                  className: 'text-xs',
                },
                {
                  title: t('Hours'),
                  dataIndex: 'time',
                  key: 'time',
                  align: 'right',
                  width: '40%',
                  className: 'text-xs',
                  render: (value) => `${value}h`,
                },
              ]}
              className="text-xs"
              summary={(data) => {
                const total = data.reduce(
                  (sum, curr) => sum + parseFloat(curr.time),
                  0
                );
                return (
                  <Table.Summary.Row className="text-xs font-bold">
                    <Table.Summary.Cell>{t('Total')}</Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      {total.toFixed(2)}h
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // Добавляем новую функцию экспорта
  const exportAircraftInfoToPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;

    // Title
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.text(
      `Aircraft Information - ${workOrder.planeId?.regNbr || ''}`,
      pageWidth / 2,
      15,
      {
        align: 'center',
      }
    );

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Aircraft Information
    doc.setFontSize(14);
    doc.text('Aircraft Information', margin, 30);
    doc.autoTable({
      startY: 35,
      margin,
      head: [['Property', 'Value']],
      body: [
        ['AC Reg', workOrder.planeId?.regNbr || ''],
        ['AC Type', workOrder.planeId?.acTypeId?.[0]?.code || ''],
        ['MSN', workOrder.planeId?.serialNbr || ''],
        ['Effectivity', workOrder.planeId?.efectivityNumber || ''],
        ['Manufactory date', formatDate(workOrder.planeId?.manafacturesDate)],
        ['Engine Type', workOrder.planeId?.engineType || ''],
        ['APU Type', workOrder.planeId?.apuType || ''],
        ['Total Frame Hours', workOrder.planeId?.airFrameHours || ''],
        ['Total Frame Cycles', workOrder.planeId?.airFrameLandings || ''],
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 12 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Document Revisions
    doc.text('Document Revisions', margin, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      margin,
      head: [['Document', 'Revision']],
      body: [
        ['MPD', getDocumentRevision('MPD')],
        ['AMM', getDocumentRevision('AMM')],
        ['SRM', getDocumentRevision('SRM')],
        ['TC', getDocumentRevision('TC')],
        ['NDTM', getDocumentRevision('NDTM')],
        ['IPC', getDocumentRevision('IPC')],
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 12 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Work Order Information
    doc.text('Work Order Information', margin, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      margin,
      head: [['Property', 'Value']],
      body: [
        ['WO Number', workOrder.WONumber],
        ['WO Name', workOrder.WOName],
        ['Status', workOrder.status],
        ['WO Type', workOrder.WOType],
        ['Creation Date', formatDateTime(workOrder.createDate)],
        [
          'Start Date',
          workOrder.startDate
            ? formatDateTime(workOrder.startDate)
            : 'Not specified',
        ],
        [
          'Planned Finish Date',
          workOrder.planedFinishDate
            ? formatDateTime(workOrder.planedFinishDate)
            : 'Not specified',
        ],
        ['Description', workOrder.description || 'Not available'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 12 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Save PDF
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `aircraft_info_${
      workOrder.planeId?.regNbr || ''
    }_${currentDate}.pdf`;
    doc.save(filename);
  };

  // Добавляем функцию форматирования даты
  // Или для формата "31-01-2019":
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Функция для форматирования даты и времени (DD-MM-YYYY HH:mm)
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const formattedTime = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <div className="overflow-auto max-h-screen pb-4">
      <Card
        title={
          <div className="flex justify-between items-center px-2">
            <span className="text-xl font-bold">
              {t('Daily Report')} - WO №{workOrder.WONumber}
            </span>
            <Space size="small">
              <Button
                icon={<DownloadOutlined />}
                onClick={exportToPDF}
                size="small"
              >
                {t('Export to PDF')}
              </Button>
              <Button
                className="bg-green-600"
                icon={<DownloadOutlined />}
                onClick={exportToExcel}
                size="small"
              >
                {t('Export to Excel')}
              </Button>
            </Space>
          </div>
        }
        className="shadow-md"
        bodyStyle={{ padding: '12px' }}
      >
        {/* Summary Section */}
        <Card className="mb-3" size="small" bodyStyle={{ padding: '8px' }}>
          <Row gutter={[8, 8]}>
            <Col span={8}>
              <div className="text-center">
                <div className="text-gray-500">{t('Total Tasks')}</div>
                <div className="text-xl font-semibold">
                  {calculateTaskStats().total}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center">
                <div className="text-gray-500">{t('Completed')}</div>
                <div className="text-xl font-semibold text-green-600">
                  {calculateTaskStats().completed} /{' '}
                  {calculateTaskStats().total}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center">
                <div className="text-gray-500">{t('Remaining')}</div>
                <div className="text-xl font-semibold text-orange-600">
                  {calculateTaskStats().remaining} /{' '}
                  {calculateTaskStats().total}
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Main Content */}
        <Tabs
          defaultActiveKey="aircraft"
          type="card"
          items={[
            {
              key: 'aircraft',
              label: t('Aircraft Information'),
              children: (
                <Row gutter={[8, 8]}>
                  <Col xs={24} lg={12}>
                    <Card
                      title={
                        <div className="flex justify-between items-center">
                          <span>{t('Aircraft Information')}</span>
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={exportAircraftInfoToPDF}
                            size="small"
                            type="text"
                            title={t('Export Aircraft Information')}
                          />
                        </div>
                      }
                      size="small"
                      bodyStyle={{ padding: '8px' }}
                    >
                      <Row gutter={[8, 4]}>
                        <Col span={12}>
                          <ProDescriptions
                            column={1}
                            size="small"
                            layout="vertical"
                            style={{ padding: '0' }}
                          >
                            <ProDescriptions.Item label={t('AC Reg')}>
                              {workOrder.planeId?.regNbr && (
                                <Tag color="blue" className="text-lg">
                                  {workOrder.planeId.regNbr}
                                </Tag>
                              )}
                            </ProDescriptions.Item>
                            <ProDescriptions.Item label={t('AC Type')}>
                              {workOrder.planeId?.acTypeId?.[0]?.code && (
                                <Tag color="green">
                                  {workOrder.planeId.acTypeId[0].code}
                                </Tag>
                              )}
                            </ProDescriptions.Item>
                            <ProDescriptions.Item label={t('MSN')}>
                              {workOrder.planeId?.serialNbr && (
                                <Tag color="orange">
                                  {workOrder.planeId.serialNbr}
                                </Tag>
                              )}
                            </ProDescriptions.Item>
                            <ProDescriptions.Item label={t('Effectivity')}>
                              {workOrder.planeId?.efectivityNumber && (
                                <Tag color="purple">
                                  {workOrder.planeId.efectivityNumber}
                                </Tag>
                              )}
                            </ProDescriptions.Item>
                            <ProDescriptions.Item label={t('Manufactory date')}>
                              {workOrder.planeId?.manafacturesDate && (
                                <Tag color="cyan">
                                  {formatDate(
                                    workOrder.planeId.manafacturesDate
                                  )}
                                </Tag>
                              )}
                            </ProDescriptions.Item>
                          </ProDescriptions>
                        </Col>
                        <Col span={12}>
                          <ProDescriptions
                            column={1}
                            size="small"
                            layout="vertical"
                            style={{ padding: '0' }}
                          >
                            <ProDescriptions.Item label={t('Engine Type')}>
                              {workOrder.planeId?.engineType && (
                                <Tag color="cyan">
                                  {workOrder.planeId.engineType}
                                </Tag>
                              )}
                            </ProDescriptions.Item>
                            <ProDescriptions.Item label={t('APU Type')}>
                              {workOrder.planeId?.apuType && (
                                <Tag color="magenta">
                                  {workOrder.planeId.apuType}
                                </Tag>
                              )}
                            </ProDescriptions.Item>
                            <ProDescriptions.Item
                              label={t('Total Frame Hours')}
                            >
                              {workOrder.planeId?.airFrameHours && (
                                <Tag color="gold">
                                  {workOrder.planeId.airFrameHours}
                                </Tag>
                              )}
                            </ProDescriptions.Item>
                            <ProDescriptions.Item
                              label={t('Total Frame Cycles')}
                            >
                              {workOrder.planeId?.airFrameLandings && (
                                <Tag color="lime">
                                  {workOrder.planeId.airFrameLandings}
                                </Tag>
                              )}
                            </ProDescriptions.Item>
                          </ProDescriptions>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card
                      title={
                        <div className="flex justify-between items-center">
                          <span>{t('Work Order Information')}</span>
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={exportAircraftInfoToPDF}
                            size="small"
                            type="text"
                            title={t('Export Work Order Information')}
                          />
                        </div>
                      }
                      size="small"
                      bodyStyle={{ padding: '8px' }}
                    >
                      <Row gutter={[16, 8]}>
                        <Col span={12}>
                          <ProDescriptions
                            column={1}
                            size="small"
                            layout="vertical"
                          >
                            <ProDescriptions.Item label={t('WO Number')}>
                              {workOrder.WONumber}
                            </ProDescriptions.Item>
                            <ProDescriptions.Item label={t('WO Name')}>
                              {workOrder.WOName}
                            </ProDescriptions.Item>
                            <ProDescriptions.Item label={t('Status')}>
                              {workOrder.status}
                            </ProDescriptions.Item>
                            <ProDescriptions.Item label={t('WO Type')}>
                              {workOrder.WOType}
                            </ProDescriptions.Item>
                          </ProDescriptions>
                        </Col>
                        <Col span={12}>
                          <ProDescriptions
                            column={1}
                            size="small"
                            layout="vertical"
                          >
                            <ProDescriptions.Item label={t('Creation Date')}>
                              {workOrder.createDate ? (
                                <Tag color="blue">
                                  {formatDateTime(workOrder.createDate)}
                                </Tag>
                              ) : (
                                t('Not specified')
                              )}
                            </ProDescriptions.Item>
                            <ProDescriptions.Item label={t('Start Date')}>
                              {workOrder.startDate ? (
                                <Tag color="green">
                                  {formatDateTime(workOrder.startDate)}
                                </Tag>
                              ) : (
                                t('Not specified')
                              )}
                            </ProDescriptions.Item>
                            <ProDescriptions.Item
                              label={t('Planned Finish Date')}
                            >
                              {workOrder.planedFinishDate ? (
                                <Tag color="orange">
                                  {formatDateTime(workOrder.planedFinishDate)}
                                </Tag>
                              ) : (
                                t('Not specified')
                              )}
                            </ProDescriptions.Item>
                          </ProDescriptions>
                        </Col>
                      </Row>
                      <ProDescriptions
                        column={1}
                        size="small"
                        layout="vertical"
                      >
                        <ProDescriptions.Item label={t('Description')}>
                          {workOrder.description || t('Not available')}
                        </ProDescriptions.Item>
                      </ProDescriptions>
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'tasks',
              label: t('Tasks '),
              children: (
                <>
                  <Row gutter={[8, 8]}>
                    <Col xs={24} lg={12}>
                      <Card
                        title={t('Tasks Summary')}
                        size="small"
                        bodyStyle={{ padding: '8px' }}
                      >
                        <Row gutter={[8, 8]}>
                          <Col span={24}>
                            <Title level={5}>{t('By Task Type')}:</Title>
                          </Col>
                          {calculateTaskTypeStats().map(
                            ({ type, total, completed }) => (
                              <Col span={24} key={type}>
                                <div className="flex justify-between items-center mb-1">
                                  <Text strong className="text-sm">
                                    {type}
                                  </Text>
                                  <Text className="text-xs text-gray-500">{`${completed}/${total}`}</Text>
                                </div>
                                <Progress
                                  percent={
                                    total > 0
                                      ? Math.round((completed / total) * 100)
                                      : 0
                                  }
                                  showInfo={false}
                                  size="small"
                                  status={
                                    completed === total ? 'success' : 'active'
                                  }
                                  strokeColor={
                                    completed === total ? '#52c41a' : '#1890ff'
                                  }
                                />
                              </Col>
                            )
                          )}
                        </Row>
                      </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Card
                        title={t('Task Types Distribution')}
                        size="small"
                        bodyStyle={{ padding: '8px' }}
                      >
                        <div style={{ height: '320px' }}>
                          <TaskTypesPieChart />
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </>
              ),
            },
            {
              key: 'time',
              label: t('Time'),
              children: (
                <div
                  className="overflow-auto"
                  style={{ maxHeight: 'calc(100vh - 390px)' }}
                >
                  <Row gutter={[8, 8]}>
                    <Col xs={24} lg={12}>
                      <Card
                        title={t('Time Distribution by Task Type')}
                        size="small"
                        bodyStyle={{ padding: '8px' }}
                      >
                        <div style={{ height: '320px' }}>
                          <TimeByTaskTypeBarChart />
                        </div>
                      </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Card
                        title={t('Time Distribution by Skill')}
                        size="small"
                        bodyStyle={{ padding: '8px' }}
                      >
                        <div style={{ height: '320px' }}>
                          <TimeBySkillPieChart />
                        </div>
                      </Card>
                    </Col>
                  </Row>

                  <TimeStatisticsCard />
                </div>
              ),
            },
            {
              key: 'access',
              label: t('Access'),
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title={t('Access Status')} size="small">
                      <div style={{ height: '340px' }}>
                        <AccessPieChart />
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title={t('Access Statistics')} size="small">
                      <Row gutter={[16, 16]}>
                        <Col span={6}>
                          <Statistic
                            title={t('Total')}
                            value={calculateAccessStats().total}
                          />
                        </Col>
                        <Col span={6}>
                          <Statistic
                            title={t('Open')}
                            value={calculateAccessStats().opened}
                          />
                        </Col>
                        <Col span={6}>
                          <Statistic
                            title={t('Closed')}
                            value={calculateAccessStats().closed}
                          />
                        </Col>
                        <Col span={6}>
                          <Statistic
                            title={t('Inspected')}
                            value={calculateAccessStats().inspected}
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'documents',
              label: t('Documents'),
              children: (
                <Card title={t('Document Revisions')} size="small">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <ProDescriptions
                        column={1}
                        size="small"
                        layout="vertical"
                      >
                        <ProDescriptions.Item label={t('MPD Rev')}>
                          <Tag color="red">{getDocumentRevision('MPD')}</Tag>
                        </ProDescriptions.Item>
                        <ProDescriptions.Item label={t('AMM Rev')}>
                          <Tag color="volcano">
                            {getDocumentRevision('AMM')}
                          </Tag>
                        </ProDescriptions.Item>
                        <ProDescriptions.Item label={t('SRM Rev')}>
                          <Tag color="orange">{getDocumentRevision('SRM')}</Tag>
                        </ProDescriptions.Item>
                      </ProDescriptions>
                    </Col>
                    <Col xs={24} md={12}>
                      <ProDescriptions
                        column={1}
                        size="small"
                        layout="vertical"
                      >
                        <ProDescriptions.Item label={t('TC Rev')}>
                          <Tag color="gold">{getDocumentRevision('TC')}</Tag>
                        </ProDescriptions.Item>
                        <ProDescriptions.Item label={t('NDTM Rev')}>
                          <Tag color="lime">{getDocumentRevision('NDTM')}</Tag>
                        </ProDescriptions.Item>
                        <ProDescriptions.Item label={t('IPC Rev')}>
                          <Tag color="green">{getDocumentRevision('IPC')}</Tag>
                        </ProDescriptions.Item>
                      </ProDescriptions>
                    </Col>
                  </Row>
                </Card>
              ),
            },
          ]}
          className="mt-2"
        />
      </Card>
    </div>
  );
};

export default DailyReport;
