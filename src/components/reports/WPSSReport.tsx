//@ts-nocheck

import React, { FC, useMemo, useEffect } from 'react';
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
import { DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/charts';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { useGetFilteredActionsQuery } from '../../features/projectItemWO/actionsApi';
import PDFExport from '../shared/PDFExport';
import UniversalAgGrid from '../shared/UniversalAgGrid';
import { ErrorBoundary } from 'react-error-boundary';
import { utils as XLSXUtils, write as XLSXWrite } from 'xlsx';
import { saveAs } from 'file-saver';

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
  results: {
    tasks: any[];
    workOrder: any;
    filters?: any;
  };
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-red-500">
      <h2 className="text-lg font-semibold">Что-то пошло не так:</h2>
      <pre className="mt-2 text-sm">{error.message}</pre>
    </div>
  );
}

const WPSSReport: FC<TaskReportProps> = ({ results }) => {
  const { tasks = [], workOrder, filters = {} } = results || {};
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
    const total = tasks?.length;
    const completed = tasks?.filter((task) => {
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

  const TasksPieChart = () => {
    const data = [
      { type: 'Completed', value: taskStats.completed },
      { type: 'Remaining', value: taskStats.remaining },
    ];

    return (
      <div style={{ height: '200px' }}>
        <Pie
          data={data}
          angleField="value"
          colorField="type"
          height={200}
          radius={0.8}
          innerRadius={0.6}
          label={{
            type: 'inner',
            offset: '-50%',
            content: '{value}',
          }}
        />
      </div>
    );
  };

  const formatUserName = (user: any) => {
    if (!user) return '-';
    const firstName = user?.firstNameEnglish || '';
    const lastName = user?.lastNameEnglish || '';
    const authNumber = user?.organizationAuthorization || '-';

    return `${firstName} ${lastName} / ${authNumber}`.trim();
  };

  const columnDefs = useMemo(
    () => [
      // {
      //   headerName: t('Status'),
      //   field: 'status',
      //   cellRenderer: (params: any) => {
      //     let statusText = params.value;
      //     if (typeof statusText === 'object' && statusText !== null) {
      //       statusText =
      //         statusText.name || statusText.value || JSON.stringify(statusText);
      //     }
      //     const displayText = valueEnum[statusText] || statusText;
      //     const colorClass =
      //       statusText.toLowerCase() === 'closed' ? 'green' : 'orange';
      //     return React.createElement('span', {
      //       className: `ag-cell-tag ${colorClass}`,
      //       dangerouslySetInnerHTML: { __html: displayText },
      //     });
      //   },
      //   width: 120,
      //   cellStyle: {
      //     display: 'flex',
      //     alignItems: 'center',
      //     justifyContent: 'center',
      //   },
      // },
      {
        field: 'taskWONumber',
        headerName: `${t('SEQ No')}`,
        filter: true,

        flex: 1,
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
      },
      {
        headerName: t('DESCRIPTION'),
        field: 'taskDescription',

        tooltipField: 'taskDescription',
      },
      // {
      //   headerName: t('WORKPACKAGE'),
      //   field: 'projectID.projectName',
      //   valueGetter: (params: any) => {
      //     return params.data.projectID?.projectName || '-';
      //   },
      //   width: 300,
      // },
      {
        headerName: t('CLOSING DATE'),
        field: 'id',
        cellRenderer: (params: any) => {
          const action = allActions?.find(
            (a) => a.projectTaskID === params.value && a.type === 'closed'
          );
          if (action && action.createDate) {
            const date = new Date(action.createDate);
            return date.toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            });
          }
          return '-';
        },
      },
      {
        headerName: t('AUTORIZED STAFF'),
        field: 'closed',
        cellRenderer: (params: any) => {
          const action = allActions?.find(
            (a) => a.projectTaskID === params.data.id && a.type === 'closed'
          );
          const user = action?.userDurations[0]?.userID;
          return formatUserName(user);
        },
        width: 200, // Увеличиваем ширину колонки для размещения полного имени
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

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    }) as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(18);
    doc.text('Task Report', pageWidth / 2, 15, { align: 'center' });

    // WO Information
    doc.setFontSize(12);
    doc.text(`Work Order: ${workOrder.WONumber}`, 14, 25);
    doc.text(`WO Name: ${workOrder.WOName}`, 14, 32);

    // Filters
    let yPos = 39;
    doc.setFontSize(10);

    // Task Statistics
    doc.setFontSize(14);
    doc.text('Task Statistics', 14, yPos + 7);
    doc.autoTable({
      startY: yPos + 12,
      head: [['Metric', 'Value']],
      body: [
        ['Total Tasks', taskStats.total],
        ['Completed Tasks', taskStats.completed],
        ['Remaining Tasks', taskStats.remaining],
      ],
    });

    // Task Table
    doc.text('Task Details', 14, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [columnDefs.map((col) => col.headerName)],
      body: tasks.map((task) => {
        const closingAction = allActions?.find(
          (a) => a.projectTaskID === task.id && a.type === 'closed'
        );
        const user = closingAction?.userDurations[0]?.userID;

        return [
          task.taskWONumber,
          valueEnumTask[task.projectItemType] || task.projectItemType,
          task.taskWO,
          task.taskNumber,
          task.taskDescription,
          closingAction?.createDate
            ? new Date(closingAction.createDate).toLocaleDateString('ru-RU')
            : '-',
          formatUserName(user),
        ];
      }),
      columnStyles: {
        0: { cellWidth: 20 }, // SEQ No
        1: { cellWidth: 30 }, // TYPE
        2: { cellWidth: 30 }, // TRACE No
        3: { cellWidth: 30 }, // REFERENCE
        4: { cellWidth: 'auto' }, // DESCRIPTION
        5: { cellWidth: 30 }, // CLOSING DATE
        6: { cellWidth: 50 }, // AUTORIZED STAFF - увеличиваем ширину для полного имени
      },
    });

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const filename = `task_report_${currentDate}.pdf`;

    // Save the PDF
    doc.save(filename);
  };

  const exportToExcel = () => {
    const workbook = XLSXUtils.book_new();

    // Создаем заголовок отчета
    const titleData = [
      ['WORKPACKAGE SUMMARY SHEET (WPSS)'],
      [''],
      ['Work Order Information:'],
      [`WO Number: ${workOrder?.WONumber || '-'}`],
      [`WO Description: ${workOrder?.description || '-'}`],
      [`Aircraft Type: ${acTypeCode}`],
      [`Registration: ${regNumber}`],
      [`MSN: ${serialNumber}`],
      [`Work Package: ${projectName}`],
      [''],
      ['Task Statistics:'],
      [`Total Tasks: ${taskStats.total}`],
      [`Completed Tasks: ${taskStats.completed}`],
      [`Remaining Tasks: ${taskStats.remaining}`],
      [''],
      ['Task Details:'],
      [''], // Пустая строка перед данными
    ];

    // Создаем заголовки колонок
    const headers = [
      t('SEQ No'),
      t('TYPE'),
      t('TRACE No'),
      t('REFERENCE'),
      t('DESCRIPTION'),
      t('CLOSING DATE'),
      t('AUTORIZED STAFF'),
    ];

    // Подготовка данных для Excel
    const taskData = tasks.map((task) => {
      const closingAction = allActions?.find(
        (a) => a.projectTaskID === task.id && a.type === 'closed'
      );
      const user = closingAction?.userDurations[0]?.userID;

      return [
        task.taskWONumber,
        valueEnumTask[task.projectItemType] || task.projectItemType,
        task.taskWO,
        task.taskNumber,
        task.taskDescription,
        closingAction?.createDate
          ? new Date(closingAction.createDate).toLocaleDateString('ru-RU')
          : '-',
        formatUserName(user),
      ];
    });

    // Объединяем все данные
    const allData = [...titleData, headers, ...taskData];

    // Создаем лист
    const worksheet = XLSXUtils.aoa_to_sheet(allData);

    // Настраиваем стили для заголовков
    const range = XLSXUtils.decode_range(worksheet['!ref'] || 'A1');
    const headerStyle = {
      font: { bold: true },
      alignment: { horizontal: 'center' },
    };

    // Применяем стили к заголовкам
    for (let i = 0; i <= range.e.c; i++) {
      const cellRef = XLSXUtils.encode_cell({ r: titleData.length, c: i });
      if (!worksheet[cellRef]) worksheet[cellRef] = {};
      worksheet[cellRef].s = headerStyle;
    }

    // Устанавливаем ширину колонок
    const colWidths = [
      { wch: 10 }, // SEQ No
      { wch: 15 }, // TYPE
      { wch: 15 }, // TRACE No
      { wch: 15 }, // REFERENCE
      { wch: 50 }, // DESCRIPTION
      { wch: 15 }, // CLOSING DATE
      { wch: 20 }, // AUTORIZED STAFF
    ];
    worksheet['!cols'] = colWidths;

    // Добавляем лист в книгу
    XLSXUtils.book_append_sheet(workbook, worksheet, 'WPSS Report');

    // Генерация файла
    const excelBuffer = XLSXWrite(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false,
      compression: true,
    });

    const excelFile = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(
      excelFile,
      `wpss_report_${workOrder?.WONumber || 'unknown'}_${
        new Date().toISOString().split('T')[0]
      }.xlsx`
    );
  };

  // Безопасный доступ к данным
  const acTypeCode = workOrder?.planeId?.acTypeId?.[0]?.code || '-';
  const regNumber = workOrder?.planeId?.regNbr || '-';
  const serialNumber = workOrder?.planeId?.serialNbr || '-';
  const projectName = tasks?.[0]?.projectID?.projectName || '-';

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Card
        className="shadow-lg"
        title={
          <div className="flex items-center justify-between">
            <Title level={4} className="mb-0">
              {t('WORKPACKAGE SUMMARY SHEET (WPSS)')}
            </Title>
            <Space>
              <Button
                size="small"
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={exportToExcel}
                className="bg-green-600"
              >
                {t('Export to Excel')}
              </Button>
              <PDFExport
                title={t('WORKPACKAGE SUMMARY SHEET (WPSS)')}
                filename={`wps_report_wo_${
                  workOrder?.WONumber || 'unknown'
                }_wp_${projectName}_${new Date().toISOString().split('T')[0]}`}
                statistics={{
                  WO: workOrder?.WONumber || '-',
                  'WO DESCRIPTION': workOrder?.description || '-',
                  WORKPACKAGE: projectName,
                  'AC REG': regNumber,
                  'AC TYPE': acTypeCode,
                  MSN: serialNumber,
                  'TOTAL TASKS': tasks?.length || 0,
                }}
                // Обновляем определения колонок для PDF
                columnDefs={[
                  { field: 'taskWONumber', headerName: t('SEQ No'), width: 20 },
                  {
                    field: 'projectItemType',
                    headerName: t('TYPE'),
                    width: 30,
                  },
                  { field: 'taskWO', headerName: t('TRACE No'), width: 30 },
                  {
                    field: 'taskNumber',
                    headerName: t('REFERENCE'),
                    width: 30,
                  },
                  {
                    field: 'taskDescription',
                    headerName: t('DESCRIPTION'),
                    width: 'auto',
                  },
                  {
                    field: 'closingDate',
                    headerName: t('CLOSING DATE'),
                    width: 30,
                    valueGetter: (params: any) => {
                      const action = allActions?.find(
                        (a) =>
                          a.projectTaskID === params.data.id &&
                          a.type === 'closed'
                      );
                      return action?.createDate
                        ? new Date(action.createDate).toLocaleDateString(
                            'ru-RU'
                          )
                        : '-';
                    },
                  },
                  {
                    field: 'authorizedStaff',
                    headerName: t('AUTORIZED STAFF'),
                    width: 100, // Увеличили ширину с 50 до 80
                    valueGetter: (params: any) => {
                      const action = allActions?.find(
                        (a) =>
                          a.projectTaskID === params.data.id &&
                          a.type === 'closed'
                      );
                      const user = action?.userDurations[0]?.userID;
                      return formatUserName(user);
                    },
                  },
                ]}
                // Преобразуем данные для корректного отображения в PDF
                data={tasks.map((task) => {
                  const closingAction = allActions?.find(
                    (a) => a.projectTaskID === task.id && a.type === 'closed'
                  );
                  const user = closingAction?.userDurations[0]?.userID;

                  return {
                    ...task,
                    closingDate: closingAction?.createDate
                      ? new Date(closingAction.createDate).toLocaleDateString(
                          'ru-RU'
                        )
                      : '-',
                    authorizedStaff: formatUserName(user),
                  };
                })}
                orientation="landscape"
                footer={`RELEASE TO SERVICE: ${
                  workOrder?.certificateId?.description || '-'
                }
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
  `}
              />
            </Space>
          </div>
        }
      >
        <Tabs
          defaultActiveKey="information"
          items={[
            {
              key: 'information',
              label: t('General Information'),
              children: (
                <div className="space-y-6">
                  {/* Work Order Information */}
                  <Card className="bg-gray-50">
                    <Descriptions
                      title={<Text strong>{t('Work Order Information')}</Text>}
                      bordered
                      column={{ xxl: 4, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
                    >
                      <Descriptions.Item label={t('WO Number')}>
                        {workOrder?.WONumber || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('WO Name')}>
                        {workOrder?.WOName || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('Aircraft Type')}>
                        {acTypeCode}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('Registration')}>
                        {regNumber}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('MSN')}>
                        {serialNumber}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('Work Package')}>
                        {projectName}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  {/* Statistics Cards */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                      <Card
                        title={<Text strong>{t('Task Statistics')}</Text>}
                        className="h-full"
                      >
                        <Row gutter={[16, 16]}>
                          <Col span={8}>
                            <Statistic
                              title={t('Total Tasks')}
                              value={taskStats.total}
                              className="text-center"
                            />
                          </Col>
                          <Col span={8}>
                            <Statistic
                              title={t('Completed Tasks')}
                              value={taskStats.completed}
                              className="text-center"
                              valueStyle={{ color: '#3f8600' }}
                            />
                          </Col>
                          <Col span={8}>
                            <Statistic
                              title={t('Remaining Tasks')}
                              value={taskStats.remaining}
                              className="text-center"
                              valueStyle={{ color: '#cf1322' }}
                            />
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Card
                        title={<Text strong>{t('Task Distribution')}</Text>}
                        className="h-full"
                      >
                        <TasksPieChart />
                      </Card>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: 'tasks',
              label: t('Task List'),
              children: (
                <Card title={<Text strong>{t('Tasks')}</Text>}>
                  <div
                    className="ag-theme-alpine"
                    style={{ height: 'calc(100vh - 300px)', width: '100%' }}
                  >
                    <UniversalAgGrid
                      pagination
                      columnDefs={columnDefs}
                      rowData={tasks}
                      animateRows={true}
                      rowSelection="multiple"
                      defaultColDef={{
                        ...defaultColDef,
                        autoHeight: true,
                        wrapText: true,
                      }}
                    />
                  </div>
                </Card>
              ),
            },
          ]}
        />
      </Card>
    </ErrorBoundary>
  );
};

export default WPSSReport;
