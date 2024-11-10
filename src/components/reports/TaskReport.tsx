//@ts-nocheck

import React, { FC, useMemo, useEffect, useState } from 'react';
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
  Descriptions,
  Tooltip,
  Tabs,
} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/charts';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { useGetFilteredActionsQuery } from '../../features/projectItemWO/actionsApi';
import PDFExport from '../shared/PDFExport';
import UniversalAgGrid from '../shared/UniversalAgGrid';
import { utils, writeFile } from 'xlsx';

const { Title, Text } = Typography;

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
  lastAutoTable: {
    finalY: number;
  };
}

type ValueEnumType = Record<string, string>;
type ValueEnumTypeTask = Record<string, string>;

interface TaskReportProps {
  tasks: any[];
  workOrder: any; // Добавляем информацию о WO
  filters: any; // Добавляем информацию о фильтрах
}

const TaskReport: FC<TaskReportProps> = ({ tasks, workOrder, filters }) => {
  const { t } = useTranslation();
  const { data: allActions } = useGetFilteredActionsQuery({
    workOrderID: workOrder?._id,
  });

  useEffect(() => {
    console.log('Tasks in TaskReport:', tasks);
  }, [tasks]);

  const valueEnum: ValueEnumType = {
    inspect: t('INSPECTION'),
    onQuatation: t('QUATATION'),
    open: t('OPEN'),
    closed: t('CLOSE'),
    canceled: t('CANCEL'),
    cancelled: t('CANCEL'),
    inProgress: t('IN PROGRESS'),
    complete: t('COMPLETE'),
    RECEIVED: t('RECEIVED'),
    PARTLY_RECEIVED: t('PARTLY RECEIVED'),
    performed: t('PERFORMED'),
    onOrder: t('ON ORDER'),
    onShort: t('ON SHORT'),
    draft: t('DRAFT'),
    issued: t('ISSUED'),
    test: t('TEST'),
    progress: t('IN PROGRESS'),
    nextAction: t('NEXT ACTION'),
    needInspection: t('NEED INSPECTION'),
  };

  const valueEnumTask: ValueEnumTypeTask = {
    RC: t('TC'),
    CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
    NRC: t('NRC (DEFECT)'),
    NRC_ADD: t('ADHOC (ADHOC TASK)'),
    MJC: t('MJC'),
    CMJC: t('CMJC'),
    FC: t('FC'),
    HARD_ACCESS: t('HARD_ACCESS'),
  };

  const calculateTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((task) => {
      const status =
        typeof task.status === 'object'
          ? task.status.name || task.status.value
          : task.status;
      return status === 'closed';
    }).length;
    const remaining = total - completed;
    return { total, completed, remaining };
  };

  const taskStats = calculateTaskStats();

  // 1. Определяем компоненты графиков
  const TaskStatusPieChart = () => {
    const data = [
      { type: t('Completed'), value: taskStats.completed },
      { type: t('Remaining'), value: taskStats.remaining },
    ];

    return (
      <Pie
        data={data}
        angleField="value"
        colorField="type"
        radius={0.8}
        height={300}
        label={{
          type: 'outer',
          content: '{name}: {percentage}',
          style: {
            fontSize: 14,
          },
        }}
        legend={{
          position: 'bottom',
          offsetY: 20,
          itemHeight: 10,
          itemWidth: 10,
          text: {
            style: {
              fontSize: 14,
            },
          },
        }}
        statistic={{
          title: {
            style: {
              fontSize: '16px',
            },
          },
          content: {
            style: {
              fontSize: '24px',
            },
          },
        }}
      />
    );
  };

  const TaskTypesPieChart = () => {
    const typeStats = tasks.reduce((acc, task) => {
      const type = valueEnumTask[task.projectItemType] || task.projectItemType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const data = Object.entries(typeStats).map(([type, count]) => ({
      type,
      value: count,
    }));

    return (
      <Pie
        data={data}
        angleField="value"
        colorField="type"
        radius={0.8}
        label={{
          type: 'outer',
          content: '{name}: {percentage}',
        }}
        legend={{
          position: 'bottom',
        }}
      />
    );
  };

  // 2. Определяем функции рендеринга табов
  const renderSummaryTab = () => (
    <div className="space-y-4 p-4">
      <Card className="shadow-sm">
        <Descriptions title={t('Work Order Information')} column={2}>
          <Descriptions.Item label={t('WO Number')}>
            {workOrder?.WONumber || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('WO Name')}>
            {workOrder?.WOName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('AC REG')}>
            {workOrder?.planeId?.regNbr || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('AC TYPE')}>
            {workOrder?.planeId?.acTypeId?.[0]?.code || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('MSN')}>
            {workOrder?.planeId?.serialNbr || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('Task Statistics')} className="shadow-sm">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title={t('Total Tasks')}
                  value={taskStats.total}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={t('Completed')}
                  value={taskStats.completed}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={t('Remaining')}
                  value={taskStats.remaining}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={t('Task Distribution')}
            className="shadow-sm"
            style={{ height: '100%' }}
          >
            <div style={{ height: 300 }}>
              <TaskStatusPieChart />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderTasksTab = () => (
    <div className="space-y-4 p-4">
      <div className="ag-theme-alpine" style={{ height: 'calc(65vh)' }}>
        <UniversalAgGrid
          pagination
          columnDefs={columnDefs}
          rowData={filteredTasks}
          defaultColDef={defaultColDef}
          animateRows={true}
          rowSelection="multiple"
          height="100%"
          width="100%"
          enableRangeSelection
          enableCellTextSelection
          copyHeadersToClipboard
          suppressScrollOnNewData
          suppressPropertyNamesCheck
          suppressDragLeaveHidesColumns
        />
      </div>
    </div>
  );

  const renderChartsTab = () => (
    <div className="space-y-4 p-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('Task Status Distribution')} className="shadow-sm">
            <TaskStatusPieChart />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('Task Types Distribution')} className="shadow-sm">
            <TaskTypesPieChart />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderManhoursTab = () => {
    // Фильтруем действия для отображения в таблице
    const filteredActions = allActions?.filter((action) => {
      const task = tasks.find((t) => t.id === action.projectTaskID);
      return task?.taskWONumber;
    });

    const manhourColumnDefs = useMemo(
      () => [
        {
          field: 'projectTaskID',
          headerName: `${t('SEQ No')}`,
          filter: true,
          valueGetter: (params: any) => {
            const task = tasks.find((t) => t.id === params.data.projectTaskID);
            return task?.taskWONumber || '-';
          },
        },
        {
          field: 'projectTaskID',
          headerName: t('TASK NUMBER'),
          valueGetter: (params: any) => {
            const task = tasks.find((t) => t.id === params.data.projectTaskID);
            return task?.taskNumber || '-';
          },
        },
        {
          headerName: t('TRACE No'),
          field: 'projectTaskID',
          valueGetter: (params: any) => {
            const task = tasks.find((t) => t.id === params.data.projectTaskID);
            return task?.taskWO || '-';
          },
        },
        {
          headerName: t('TASK TYPE'),
          field: 'projectTaskID',
          valueGetter: (params: any) => {
            const task = tasks.find((t) => t.id === params.data.projectTaskID);
            return (
              valueEnumTask[task?.projectItemType] ||
              task?.projectItemType ||
              '-'
            );
          },
        },
        {
          headerName: t('ACTION TYPE'),
          field: 'type',
          valueFormatter: (params: any) => params.value?.toUpperCase() || '-',
        },
        {
          headerName: t('ACTION DESCRIPTION'),
          field: 'description',
          tooltipField: 'description',
        },
        {
          headerName: t('DATE'),
          field: 'createDate',
          valueFormatter: (params: any) => {
            if (!params.value) return '-';
            return new Date(params.value).toLocaleString('ru-RU', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
          },
        },
        {
          headerName: t('STAFF'),
          field: 'userDurations',
          valueGetter: (params: any) => {
            const user = params.data.userDurations?.[0]?.userID;
            return user ? `${user.firstName} ${user.lastName}` : '-';
          },
        },
        {
          headerName: t('POSITION'),
          field: 'userDurations',
          valueGetter: (params: any) =>
            params.data.userDurations?.[0]?.userID?.position || '-',
        },
        {
          headerName: t('SKILL'),
          field: 'userDurations',
          valueGetter: (params: any) =>
            params.data.userDurations?.[0]?.userID?.skillID?.code || '-',
        },
        {
          headerName: t('AUTH №'),
          field: 'userDurations',
          valueGetter: (params: any) =>
            params.data.userDurations?.[0]?.userID?.organizationAuthorization ||
            '-',
        },
        {
          headerName: t('HOURS'),
          field: 'userDurations',
          valueGetter: (params: any) =>
            params.data.userDurations?.[0]?.duration || 0,
        },
      ],
      [t, tasks, valueEnumTask]
    );

    return (
      <div style={{ height: '100%', overflow: 'auto', padding: '10px' }}>
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} lg={8}>
            <Card size="small">
              <Statistic
                title={t('Total Manhours')}
                value={filteredActions
                  ?.reduce(
                    (acc, action) =>
                      acc + (action.userDurations?.[0]?.duration || 0),
                    0
                  )
                  .toFixed(2)}
                suffix="h"
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card size="small">
              <Statistic
                title={t('Total Actions')}
                value={filteredActions?.length || 0}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card size="small">
              <Statistic
                title={t('Average Hours per Action')}
                value={(
                  filteredActions?.reduce(
                    (acc, action) =>
                      acc + (action.userDurations?.[0]?.duration || 0),
                    0
                  ) / (filteredActions?.length || 1)
                ).toFixed(2)}
                suffix="h"
              />
            </Card>
          </Col>
        </Row>

        <div
          className="ag-theme-alpine"
          style={{ height: 'calc(65vh - 120px)' }}
        >
          <UniversalAgGrid
            gridId="manHours"
            pagination
            columnDefs={manhourColumnDefs}
            rowData={filteredActions}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowSelection="single"
            height="100%"
            width="100%"
            // enableRangeSelection
            // enableCellTextSelection
            // copyHeadersToClipboard
            // suppressScrollOnNewData
            // suppressPropertyNamesCheck
            // suppressDragLeaveHidesColumns
          />
        </div>
      </div>
    );
  };

  const columnDefs = useMemo(
    () => [
      {
        field: 'taskWONumber',
        headerName: `${t('SEQ No')}`,
        filter: true,
      },
      {
        headerName: t('TYPE'),
        field: 'projectItemType',
        cellRenderer: (params: any) =>
          valueEnumTask[params.value] || params.value,
      },
      {
        headerName: t('TRACE No'),
        field: 'taskWO',
      },
      {
        headerName: t('REFERENCE'),
        field: 'taskNumber',
        // width: 120,
      },
      {
        headerName: t('DESCRIPTION'),
        field: 'taskDescription',
        tooltipField: 'taskDescription',
      },
      {
        headerName: t('WORKPACKAGE'),
        field: 'projectID.projectName',
        valueGetter: (params: any) => {
          return params.data.projectID?.projectName || '-';
        },
      },
      {
        headerName: t('CLOSING DATE'),
        field: 'id',
        cellRenderer: (params: any) => {
          const action = allActions?.find(
            (a) => a.projectTaskID === params.value && a.type === 'closed'
          );
          if (action && action.createDate) {
            const date = new Date(action.createDate);
            return date.toLocaleString('ru-RU', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
          }
          return '-';
        },
        // width: 180,
      },
      {
        headerName: t('AUTORIZED STAFF'),
        field: 'closed',
        cellRenderer: (params: any) => {
          const action = allActions?.find(
            (a) => a.projectTaskID === params.data.id && a.type === 'closed'
          );
          return action
            ? action?.userDurations[0]?.userID?.organizationAuthorization
            : '-';
        },
      },
    ],
    [t, allActions, valueEnum, valueEnumTask]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const renderFilters = () => {
    return Object.entries(filters)
      .map(([key, value]) => {
        if (value) {
          return (
            <Descriptions.Item key={key} label={t(key)}>
              {Array.isArray(value) ? value.join(', ') : value}
            </Descriptions.Item>
          );
        }
        return null;
      })
      .filter(Boolean);
  };

  const pdfExportProps = {
    title: t('TASK SUMMARY SHEET'),
    filename: `task_report_wo_${workOrder?.WONumber}_${
      new Date().toISOString().split('T')[0]
    }`,
    statistics: {
      WO: workOrder?.WONumber || '',
      'WO DESCRIPTION': workOrder?.WOName || '',
      'AC REG': workOrder?.planeId?.regNbr || '',
      'AC TYPE': workOrder?.planeId?.acTypeId?.[0]?.code || '',
      MSN: workOrder?.planeId?.serialNbr || '',
      'TOTAL TASKS': tasks?.length || 0,
    },
    columnDefs,
    data: tasks.map((task) =>
      columnDefs.reduce((acc, col) => {
        if (col.field === 'status') {
          let statusText = task.status;
          if (typeof statusText === 'object' && statusText !== null) {
            statusText =
              statusText.name || statusText.value || JSON.stringify(statusText);
          }
          acc[col.field] = valueEnum[statusText] || statusText;
        } else if (col.field === 'projectItemType') {
          acc[col.field] =
            valueEnumTask[task.projectItemType] || task.projectItemType;
        } else if (col.field === 'projectID.projectName') {
          acc[col.field] = task.projectID?.projectName || '-';
        } else if (col.cellRenderer) {
          acc[col.field] = col.cellRenderer({
            value: task[col.field],
            data: task,
          });
        } else if (col.valueGetter) {
          acc[col.field] = col.valueGetter({ data: task });
        } else {
          acc[col.field] = task[col.field];
        }
        return acc;
      }, {})
    ),
    orientation: 'landscape',
    footer: `RELEASE TO SERVICE: ${workOrder?.certificateId?.description || '-'}
    APPROVAL No: ${workOrder?.certificateId?.code || '-'}

    WORKPACKAGE SUMMARY SHEET    CHECKED AND VERIFIED BY EPD STAFF:


    ______________________       ______________________             ____________________________
          DATE                                       NAME                                            SIGNATURE

    
    
    STA:

    DATE:

    TIME(UTC):

    NAME:

    SIGN/STAMP:

    ORGANIZATION AUTHORIZATION №:

    `,
  };

  // Получаем уникальные специальности - выносим на уровень компонента
  const uniqueSkills = useMemo(
    () =>
      Array.from(
        new Set(
          allActions?.flatMap((action) => {
            const skill = action.userDurations?.[0]?.userID?.skillID?.code;
            return skill ? [skill] : [];
          }) || []
        )
      ).sort(),
    [allActions]
  );

  const exportToExcel = () => {
    if (!allActions) return;

    const workbook = utils.book_new();

    // 1. Work Order Information Sheet
    const workOrderInfo = [
      [t('TASK SUMMARY SHEET')],
      [],
      [t('Work Order Information')],
      [t('WO Number'), workOrder?.WONumber || '-'],
      [t('WO Name'), workOrder?.WOName || '-'],
      [t('AC REG'), workOrder?.planeId?.regNbr || '-'],
      [t('AC TYPE'), workOrder?.planeId?.acTypeId?.[0]?.code || '-'],
      [t('MSN'), workOrder?.planeId?.serialNbr || '-'],
      [],
      [t('Task Statistics')],
      [t('Total Tasks'), taskStats.total],
      [t('Completed Tasks'), taskStats.completed],
      [t('Remaining Tasks'), taskStats.remaining],
    ];

    const summarySheet = utils.aoa_to_sheet(workOrderInfo);
    utils.book_append_sheet(workbook, summarySheet, t('Summary'));

    // 2. Tasks Sheet - обновляем структуру данных
    const tasksData = tasks.map((task) => {
      // Находим действие закрытия для задачи
      const closeAction = allActions.find(
        (a) => a.projectTaskID === task.id && a.type === 'closed'
      );

      return {
        [t('SEQ No')]: task.taskWONumber,
        [t('TYPE')]:
          valueEnumTask[task.projectItemType] || task.projectItemType,
        [t('TRACE No')]: task.taskWO,
        [t('REFERENCE')]: task.taskNumber,
        [t('DESCRIPTION')]: task.taskDescription,
        [t('WORKPACKAGE')]: task.projectID?.projectName || '-',
        [t('CLOSING DATE')]: closeAction?.createDate
          ? new Date(closeAction.createDate).toLocaleString('ru-RU', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          : '-',
        [t('AUTORIZED STAFF')]:
          closeAction?.userDurations?.[0]?.userID?.organizationAuthorization ||
          '-',
      };
    });

    const tasksSheet = utils.json_to_sheet(tasksData);
    utils.book_append_sheet(workbook, tasksSheet, t('Tasks'));

    // 3. Manhours Sheet
    const filteredActions = allActions.filter((action) => {
      const task = tasks.find((t) => t.id === action.projectTaskID);
      return task?.taskWONumber;
    });

    const manhoursData = filteredActions.map((action) => {
      const task = tasks.find((t) => t.id === action.projectTaskID);
      return {
        [t('SEQ No')]: task?.taskWONumber || '-',
        [t('TRACE No')]: task?.taskWO || '-',
        [t('TASK NUMBER')]: task?.taskNumber || '-',
        [t('TASK TYPE')]:
          valueEnumTask[task?.projectItemType] || task?.projectItemType || '-',
        [t('TASK DESCRIPTION')]: task?.taskDescription || '-',
        [t('ACTION TYPE')]: action.type?.toUpperCase() || '-',
        [t('ACTION DESCRIPTION')]: action.description || '-',
        [t('DATE')]: action.createDate
          ? new Date(action.createDate).toLocaleString('ru-RU', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-',
        [t('STAFF')]: action.userDurations?.[0]?.userID
          ? `${action.userDurations[0].userID.firstName} ${action.userDurations[0].userID.lastName}`
          : '-',
        [t('POSITION')]: action.userDurations?.[0]?.userID?.position || '-',
        [t('SKILL')]: action.userDurations?.[0]?.userID?.skillID?.code || '-',
        [t('AUTH №')]:
          action.userDurations?.[0]?.userID?.organizationAuthorization || '-',
        [t('HOURS')]: action.userDurations?.[0]?.duration || 0,
      };
    });

    const manhoursSheet = utils.json_to_sheet(manhoursData);
    utils.book_append_sheet(workbook, manhoursSheet, t('Manhours'));

    // 4. Set column widths - исправленная версия
    const setColumnWidths = (sheet: any) => {
      if (!sheet['!ref']) return; // Проверяем наличие данных

      const range = utils.decode_range(sheet['!ref']);
      const columnCount = range.e.c - range.s.c + 1;

      // Устанавливаем фиксированную ширину для всех колонок
      sheet['!cols'] = Array(columnCount).fill({ wch: 20 });
    };

    // Применяем ширину колонок к каждому листу
    try {
      setColumnWidths(summarySheet);
      setColumnWidths(tasksSheet);
      setColumnWidths(manhoursSheet);
    } catch (error) {
      console.error('Error setting column widths:', error);
    }

    // 5. Task Time Summary Sheet
    const taskTimeSummaryData = tasks.map((task) => {
      const taskActions =
        allActions?.filter((action) => action.projectTaskID === task.id) || [];

      // Группируем время по специальностям
      const skillTimes = taskActions.reduce((acc, action) => {
        const skill = action.userDurations?.[0]?.userID?.skillID?.code;
        if (skill) {
          acc[skill] =
            (acc[skill] || 0) + (action.userDurations?.[0]?.duration || 0);
        }
        return acc;
      }, {} as Record<string, number>);

      // Считаем общее время для задачи
      const totalTime = Object.values(skillTimes).reduce(
        (sum, time) => sum + time,
        0
      );

      return {
        [t('SEQ No')]: task.taskWONumber,
        [t('TASK NUMBER')]: task.taskNumber,
        [t('TRACE No')]: task.taskWO,
        [t('TASK TYPE')]:
          valueEnumTask[task.projectItemType] || task.projectItemType,
        [t('DESCRIPTION')]: task.taskDescription,
        ...Object.fromEntries(
          uniqueSkills.map((skill) => [
            `${t('HOURS')} (${skill})`,
            skillTimes[skill]?.toFixed(2) || '0.00',
          ])
        ),
        [t('TOTAL HOURS')]: totalTime.toFixed(2),
      };
    });

    // Добавляем итоговую строку
    const totalsBySkill = uniqueSkills.reduce((acc, skill) => {
      acc[skill] = taskTimeSummaryData.reduce(
        (sum, task) =>
          sum + parseFloat(task[`${t('HOURS')} (${skill})`] || '0'),
        0
      );
      return acc;
    }, {} as Record<string, number>);

    const grandTotal = Object.values(totalsBySkill).reduce(
      (sum, time) => sum + time,
      0
    );

    const summaryRow = {
      [t('SEQ No')]: t('TOTAL'),
      [t('TASK NUMBER')]: '',
      [t('TRACE No')]: '',
      [t('TASK TYPE')]: '',
      [t('DESCRIPTION')]: '',
      ...Object.fromEntries(
        uniqueSkills.map((skill) => [
          `${t('HOURS')} (${skill})`,
          totalsBySkill[skill].toFixed(2),
        ])
      ),
      [t('TOTAL HOURS')]: grandTotal.toFixed(2),
    };

    // Добавляем заголовок и информацию о WO
    const headerRows = [
      [t('TASK TIME SUMMARY')],
      [],
      [t('Work Order Information')],
      [t('WO Number'), workOrder?.WONumber || '-'],
      [t('WO Name'), workOrder?.WOName || '-'],
      [t('AC REG'), workOrder?.planeId?.regNbr || '-'],
      [t('AC TYPE'), workOrder?.planeId?.acTypeId?.[0]?.code || '-'],
      [t('MSN'), workOrder?.planeId?.serialNbr || '-'],
      [],
    ];

    // одаем лист с заголовком и данными
    const timeSummarySheet = utils.aoa_to_sheet(headerRows);

    // Добавляем основные данные
    utils.sheet_add_json(timeSummarySheet, taskTimeSummaryData, {
      origin: 'A' + (headerRows.length + 1),
      skipHeader: false,
    });

    // Добавляем итоговую строку
    utils.sheet_add_json(timeSummarySheet, [summaryRow], {
      origin: 'A' + (headerRows.length + taskTimeSummaryData.length + 2),
      skipHeader: true,
    });

    // Применяем стили
    const range = utils.decode_range(timeSummarySheet['!ref'] || 'A1');
    const totalRowIndex = headerRows.length + taskTimeSummaryData.length + 1;

    // Устанавливаем стили для заголовков и итоговой строки
    for (let C = range.s.c; C <= range.e.c; C++) {
      const headerAddress = utils.encode_cell({ r: headerRows.length, c: C });
      const totalAddress = utils.encode_cell({ r: totalRowIndex, c: C });

      if (!timeSummarySheet[headerAddress]) continue;

      timeSummarySheet[headerAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'CCCCCC' } },
      };

      if (timeSummarySheet[totalAddress]) {
        timeSummarySheet[totalAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'EEEEEE' } },
        };
      }
    }

    utils.book_append_sheet(workbook, timeSummarySheet, t('Task Time Summary'));

    // Устанавливаем ширину колонок
    const maxWidth = 20;
    timeSummarySheet['!cols'] = Object.keys(taskTimeSummaryData[0] || {}).map(
      () => ({
        wch: maxWidth,
      })
    );

    // Экспортируем файл
    writeFile(
      workbook,
      `task_report_wo_${workOrder?.WONumber}_${
        new Date().toISOString().split('T')[0]
      }.xlsx`
    );
  };

  // Добавляем состояние для отфильтрованных задач
  const [filteredTasks, setFilteredTasks] = useState<typeof tasks>([]);

  // Изменяем эффект для фильтрации
  useEffect(() => {
    // Всегда начинаем с исходного массива задач
    const newFilteredTasks = tasks.filter((task) => {
      if (!filters || Object.keys(filters).length === 0) {
        return true; // Если фильтров нет, возвращаем все задачи
      }

      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        switch (key) {
          case 'dateRange':
            if (!value || !Array.isArray(value) || value.length !== 2)
              return true;
            const taskDate = new Date(task.createDate);
            const [startDate, endDate] = value;
            return taskDate >= startDate && taskDate <= endDate;

          case 'status':
            if (!value) return true;
            const taskStatus =
              typeof task.status === 'object'
                ? task.status.name || task.status.value
                : task.status;
            return value.includes(taskStatus);

          case 'taskType':
            if (!value) return true;
            return value.includes(task.projectItemType);

          // Добавьте другие случаи по необходимости
          default:
            return true;
        }
      });
    });

    setFilteredTasks(newFilteredTasks);
  }, [tasks, filters]); // Зависимости только от tasks и filters

  // В рендере используем filteredTasks вместо tasks
  const renderTaskTimeSummaryTab = () => {
    // Используем useMemo для вычисления данных и итогов
    const { taskTimeSummary, totalsBySkill, grandTotal } = useMemo(() => {
      const uniqueTasks = new Map();

      // Обработка задач
      filteredTasks.forEach((task) => {
        if (!uniqueTasks.has(task.id)) {
          const taskActions =
            allActions?.filter((action) => action.projectTaskID === task.id) ||
            [];

          const skillTimes = taskActions.reduce((acc, action) => {
            const skill = action.userDurations?.[0]?.userID?.skillID?.code;
            if (skill) {
              acc[skill] =
                (acc[skill] || 0) + (action.userDurations?.[0]?.duration || 0);
            }
            return acc;
          }, {} as Record<string, number>);

          const totalTime = Object.values(skillTimes).reduce(
            (sum, time) => sum + time,
            0
          );

          uniqueTasks.set(task.id, {
            id: task.id,
            taskWONumber: task.taskWONumber,
            taskNumber: task.taskNumber,
            taskWO: task.taskWO,
            taskType:
              valueEnumTask[task.projectItemType] || task.projectItemType,
            taskDescription: task.taskDescription,
            ...skillTimes,
            totalTime,
          });
        }
      });

      const tasks = Array.from(uniqueTasks.values());

      // Расчет итогов по специальностям
      const totals = uniqueSkills.reduce((acc, skill) => {
        acc[skill] = tasks.reduce((sum, task) => sum + (task[skill] || 0), 0);
        return acc;
      }, {} as Record<string, number>);

      // Расчет общего итога
      const total = Object.values(totals).reduce((sum, time) => sum + time, 0);

      return {
        taskTimeSummary: tasks,
        totalsBySkill: totals,
        grandTotal: total,
      };
    }, [filteredTasks, allActions, valueEnumTask, uniqueSkills]);

    // Определяем колонки для AG-Grid
    const timeColumnDefs = useMemo(
      () => [
        {
          field: 'taskWONumber',
          headerName: t('SEQ No'),
          filter: true,
          pinned: 'left',
          // width: 120,
          checkboxSelection: true,
          headerCheckboxSelection: true,
        },
        {
          field: 'taskNumber',
          headerName: t('TASK NUMBER'),
          pinned: 'left',
          // width: 150,
        },
        {
          field: 'taskWO',
          headerName: t('TRACE No'),
        },
        {
          field: 'taskType',
          headerName: t('TASK TYPE'),
        },
        {
          field: 'taskDescription',
          headerName: t('DESCRIPTION'),
          tooltipField: 'taskDescription',
        },
        ...uniqueSkills.map((skill) => ({
          field: skill,
          headerName: `${t('HOURS')} (${skill})`,
          valueFormatter: (params: any) =>
            params.value ? params.value.toFixed(2) : '0.00',
          type: 'numericColumn',
        })),
        {
          field: 'totalTime',
          headerName: t('TOTAL HOURS'),
          valueFormatter: (params: any) => params.value.toFixed(2),
          type: 'numericColumn',
          pinned: 'right',
          cellStyle: { fontWeight: 'bold' },
        },
      ],
      [t, uniqueSkills]
    );

    return (
      <div style={{ height: '100%', overflow: 'auto', padding: '10px' }}>
        <Row gutter={[16, 16]} className="mb-4">
          {uniqueSkills.map((skill) => (
            <Col key={skill} xs={24} sm={12} lg={6}>
              <Card size="small">
                <Statistic
                  title={`${t('Total Hours')} (${skill})`}
                  value={totalsBySkill[skill]}
                  precision={2}
                  suffix="h"
                />
              </Card>
            </Col>
          ))}
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title={t('Grand Total Hours')}
                value={grandTotal}
                precision={2}
                suffix="h"
                valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        </Row>

        <div className="ag-theme-alpine" style={{}}>
          <UniversalAgGrid
            gridId="taskTimeSummary"
            pagination
            columnDefs={timeColumnDefs}
            rowData={taskTimeSummary}
            defaultColDef={{
              ...defaultColDef,
              // flex: 1,
              // minWidth: 120,
            }}
            height="45vh"
            animateRows={true}
            rowSelection="multiple"
            suppressRowClickSelection={true}
            rowMultiSelectWithClick={true}
            enableRangeSelection={true}
            enableCellTextSelection={true}
            getRowId={(params) => params.data.id}
          />
        </div>
      </div>
    );
  };

  // 3. Теперь определяем items после всех необходимых функций
  const items = [
    {
      key: '1',
      label: t('SUMMARY'),
      children: renderSummaryTab(),
    },
    {
      key: '2',
      label: t('TASKS'),
      children: renderTasksTab(),
    },
    {
      key: '3',
      label: t('MANHOURS'),
      children: renderManhoursTab(),
    },
    {
      key: '4',
      label: t('CHARTS'),
      children: renderChartsTab(),
    },
    {
      key: '5',
      label: t('TASK TIME SUMMARY'),
      children: renderTaskTimeSummaryTab(),
    },
  ];

  return (
    <div>
      <Card
        title={
          <div className="flex justify-between items-center px-2">
            <span className="text-xl font-bold">
              {t('Task Report')} - WO №{workOrder.WONumber}
            </span>
            <Space size="small">
              <PDFExport {...pdfExportProps} />
              <Button
                icon={<DownloadOutlined />}
                onClick={exportToExcel}
                size="small"
                className="bg-green-600"
              >
                {t('Export to Excel')}
              </Button>
            </Space>
          </div>
        }
        className="shadow-md"
        bodyStyle={{ padding: '12px' }}
      >
        <Tabs
          defaultActiveKey="1"
          items={items}
          type="card"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
          tabBarStyle={{
            margin: 0,
            padding: '8px 16px 0',
            background: '#fafafa',
            borderBottom: '1px solid #f0f0f0',
          }}
          className="report-tabs"
        />
      </Card>
    </div>
  );
};

export default TaskReport;
