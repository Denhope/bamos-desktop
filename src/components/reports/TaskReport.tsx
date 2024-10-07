import React, { FC, useMemo, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Divider, Tag, Space, Statistic, Descriptions, Tooltip } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/charts';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { useGetFilteredActionsQuery } from '../../features/projectItemWO/actionsApi';

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
    workOrderID: workOrder?._id 
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
    const completed = tasks.filter(task => {
      const status = typeof task.status === 'object' ? task.status.name || task.status.value : task.status;
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
    return <Pie data={data} angleField="value" colorField="type" />;
  };

  const columnDefs = useMemo(() => [
    {
      headerName: t('Status'),
      field: 'status',
      cellRenderer: (params: any) => {
        let statusText = params.value;
        if (typeof statusText === 'object' && statusText !== null) {
          statusText = statusText.name || statusText.value || JSON.stringify(statusText);
        }
        const displayText = valueEnum[statusText] || statusText;
        const colorClass = statusText.toLowerCase() === 'closed' ? 'green' : 'orange';
        return React.createElement('span', {
          className: `ag-cell-tag ${colorClass}`,
          dangerouslySetInnerHTML: { __html: displayText }
        });
      },
      width: 120,
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    },
    {
      headerName: t('Task Type'),
      field: 'projectItemType',
      cellRenderer: (params: any) => valueEnumTask[params.value] || params.value,
      width: 150,
    },
    {
      headerName: t('Trace No'),
      field: 'taskWO',
      width: 120,
    },
    {
      headerName: t('Task Number'),
      field: 'taskNumber',
      width: 120,
    },
    {
      headerName: t('Description'),
      field: 'taskDescription',
      width: 200,
      tooltipField: 'taskDescription',
    },
    {
      headerName: t('WP Title'),
      field: 'projectID.projectName',
      valueGetter: (params: any) => {
        return params.data.projectID?.projectName || '-';
      },
      width: 150,
    },
    {
      headerName: t('Closed By'),
      field: 'closed',
      cellRenderer: (params: any) => {
        const action = allActions?.find(a => a.projectTaskID === params.data.id && a.type === 'closed');
        return action ? action?.userDurations[0]?.userID?.organizationAuthorization : '-';
      },
      width: 150,
    },
    {
      headerName: t('Closed Date'),
      field: 'id',
      cellRenderer: (params: any) => {
        const action = allActions?.find(a => a.projectTaskID === params.value && a.type === 'closed');
        if (action && action.createDate) {
          const date = new Date(action.createDate);
          return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        }
        return '-';
      },
      width: 180,
    },
  ], [t, allActions, valueEnum, valueEnumTask]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  const renderFilters = () => {
    return Object.entries(filters).map(([key, value]) => {

      if (value) {
        return (
          <Descriptions.Item key={key} label={t(key)}>
            {Array.isArray(value) ? value.join(', ') : value}
          </Descriptions.Item>
        );
      }
      return null;
    }).filter(Boolean);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
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
      head: [columnDefs.map(col => col.headerName)],
      body: tasks.map(task => columnDefs.map(col => {
        if (col.field === 'status') {
          let statusText = task.status;
          if (typeof statusText === 'object' && statusText !== null) {
            statusText = statusText.name || statusText.value || JSON.stringify(statusText);
          }
          return valueEnum[statusText] || statusText;
        }
        if (col.field === 'projectItemType') {
          return valueEnumTask[task.projectItemType] || task.projectItemType;
        }
        if (col.field === 'projectID.projectName') {
          return task.projectID?.projectName || '-';
        }
        if (col.cellRenderer) {
          return col.cellRenderer({ value: task[col.field], data: task });
        }
        if (col.valueGetter) {
          return col.valueGetter({ data: task });
        }
        return task[col.field];
      })),
    });
    
    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const filename = `task_report_${currentDate}.pdf`;
    
    // Save the PDF
    doc.save(filename);
  };

  return (
    <Card 
      title={t("Task Report")}
      extra={
        <Button icon={<DownloadOutlined />} onClick={exportToPDF}>{t("PDF")}</Button>
      }
    >
      <Descriptions title="Work Order Information" bordered>
        <Descriptions.Item label={t("WO Number")}>{workOrder.WONumber}</Descriptions.Item>
        <Descriptions.Item label={t("WO Name")}>{workOrder.WOName}</Descriptions.Item>
      </Descriptions>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('Task Statistics')} size="small">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic title={t('Total Tasks')} value={taskStats.total} />
              </Col>
              <Col span={8}>
                <Statistic title={t('Completed Tasks')} value={taskStats.completed} />
              </Col>
              <Col span={8}>
                <Statistic title={t('Remaining Tasks')} value={taskStats.remaining} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('Task Distribution')} size="small">
            <TasksPieChart />
          </Card>
        </Col>
      </Row>

      <Divider />

      <div className="ag-theme-alpine" style={{ height: '50vh', width: '100%' }}>
        <AgGridReact pagination
          columnDefs={columnDefs}
          rowData={tasks}
          defaultColDef={defaultColDef}
          animateRows={true}
          rowSelection='multiple'
        />
      </div>
    </Card>
  );
};

export default TaskReport;