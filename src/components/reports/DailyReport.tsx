// @ts-nocheck

import React, { FC, useMemo } from 'react';
import { Card, Row, Col, Typography, Button, Divider, Tag, Space, Statistic, Timeline, Empty } from 'antd';
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
    workOrderID: workOrder?._id 
  });

  if (!workOrder) {
    return <Text>Work order data is not available.</Text>;
  }

  // Functions for calculating statistics
  const calculateTaskStats = () => {
    const total = tasks?.length || 0;
    const completed = tasks?.filter(task => task.status === 'closed').length || 0;
    const remaining = total - completed;
    const defectsCount = tasks?.filter(task => task.projectItemType === 'NRC').length || 0;
    const completedDefects = tasks?.filter(task => task.projectItemType === 'NRC' && task.status === 'closed').length || 0;
    
    return { total, completed, remaining, defectsCount, completedDefects };
  };

  const calculateDefectStats = () => {
    const defects = tasks?.filter(task => task.projectItemType === 'NRC') || [];
    return defects.length;
  };

  const calculateTimeStats = (): { plannedTime: number; spentTime: number; defectTime: number } => {
    console.log('Start of calculateTimeStats');
    console.log('All actions:', allActions);
    
    const routineTasks = tasks?.filter(task => task.projectItemType !== 'NRC') || [];
    const defects = tasks?.filter(task => task.projectItemType === 'NRC') || [];
    
    console.log('Number of routine tasks:', routineTasks.length);
    console.log('Number of defects:', defects.length);
    
    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    const plannedTime = tasks?.reduce((acc, task) => acc + (task.taskId?.mainWorkTime || 0), 0) || 0;
    console.log('Planned time:', plannedTime);
    
    const calculateTaskTime = (taskActions: any[]) => {
      const totalTime = taskActions.reduce((acc, action) => {
        const actionTime = action.userDurations?.reduce((sum: number, duration: any) => sum + (duration.duration || 0), 0) || 0;
        console.log('Action time:', actionTime);
        return acc + actionTime;
      }, 0);
      console.log('Total time for task:', totalTime);
      return totalTime;
    };

    let spentTime = 0;
    let defectTime = 0;

    console.log('Calculating time for routine tasks:');
    routineTasks.forEach(task => {
      if (!task.id) {
        console.warn('Task without _id:', task);
        return;
      }
      const taskActions = allActions?.filter(action => action.projectTaskID === task.id) || [];
      console.log(`Task ${task._id}, number of actions:`, taskActions.length);
      const taskTime = calculateTaskTime(taskActions);
      console.log(`Time for routine task ${task.id}:`, taskTime);
      spentTime += taskTime;
    });

    console.log('Calculating time for defects:');
    defects.forEach(task => {
      if (!task.id) {
        console.warn('Defect without _id:', task);
        return;
      }
      const taskActions = allActions?.filter(action => action.projectTaskID === task.id) || [];
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
      defectTime: parseFloat(formatter.format(defectTime))
    };
  };

  const calculateTimeBySkill = useMemo(() => {
    console.log('useMemo for calculateTimeBySkill is called');
    const timeBySkill: Record<string, number> = {};
    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    console.log('allActions in calculateTimeBySkill:', allActions);

    if (!allActions || !Array.isArray(allActions)) {
      console.warn('allActions is missing or not an array');
      return timeBySkill;
    }

    allActions.forEach((action, index) => {
      console.log(`Processing action ${index}:`, action);
      
      if (!action.userDurations || !Array.isArray(action.userDurations)) {
        console.warn(`userDurations is missing or not an array for action ${index}`);
        return;
      }

      action.userDurations.forEach((duration, dIndex) => {
        console.log(`Processing duration ${dIndex} for action ${index}:`, duration);
        
        const skillCode = duration.userID?.skillID?.code;
        if (!skillCode) {
          console.warn(`Missing skillCode for duration ${dIndex} of action ${index}`);
          return;
        }

        const durationValue = duration.duration;
        if (typeof durationValue !== 'number' || isNaN(durationValue)) {
          console.warn(`Invalid duration value for skillCode ${skillCode}: ${durationValue}`);
          return;
        }

        timeBySkill[skillCode] = (timeBySkill[skillCode] || 0) + durationValue;
      });
    });

    console.log('Final timeBySkill before formatting:', timeBySkill);

    // Formatting values
    Object.keys(timeBySkill).forEach(skillCode => {
      timeBySkill[skillCode] = parseFloat(formatter.format(timeBySkill[skillCode]));
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
    
    // Title
    doc.setFontSize(18);
    doc.text(`Daily Report - WO №${workOrder.WONumber}`, pageWidth / 2, 15, { align: 'center' });
    
    // Aircraft Information
    doc.setFontSize(14);
    doc.text('Aircraft Information', 14, 25);
    doc.autoTable({
      startY: 30,
      head: [['Property', 'Value']],
      body: [
        ['AC Reg', workOrder.planeId?.regNbr || ''],
        ['AC Type', workOrder.planeId?.acTypeId?.[0]?.code || ''],
        ['MSN', workOrder.planeId?.serialNbr || ''],
        ['Effectivity', workOrder.planeId?.efectivityNumber || ''],
        ['Manufactory date', workOrder.planeId?.manafacturesDate || ''],
        ['Engine Type', workOrder.planeId?.engineType || ''],
        ['APU Type', workOrder.planeId?.apuType || ''],
        ['Total Frame Hours', workOrder.planeId?.airFrameHours || ''],
        ['Total Frame Cycles', workOrder.planeId?.airFrameLandings || ''],
      ],
    });
    
    // Work Order Information
    doc.text('Work Order Information', 14, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Property', 'Value']],
      body: [
        ['WO Number', workOrder.WONumber],
        ['WO Name', workOrder.WOName],
        ['Status', workOrder.status],
        ['WO Type', workOrder.WOType],
        ['Creation Date', workOrder.createDate ? new Date(workOrder.createDate).toLocaleString() : 'Not specified'],
        ['Start Date', workOrder.startDate ? new Date(workOrder.startDate).toLocaleString() : 'Not specified'],
        ['Planned Finish Date', workOrder.planedFinishDate ? new Date(workOrder.planedFinishDate).toLocaleString() : 'Not specified'],
        ['Description', workOrder.description || 'Not available'],
      ],
    });
    
    // Task Statistics
    const taskStats = calculateTaskStats();
    const timeStats = calculateTimeStats();
    doc.text('Task Statistics', 14, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Metric', 'Value']],
      body: [
        ['Total Tasks', taskStats.total],
        ['Completed Tasks', taskStats.completed],
        ['Remaining Tasks', taskStats.remaining],
        ['Defects Found (NRC)', taskStats.defectsCount],
        ['Defects Resolved', taskStats.completedDefects],
        ['Planned Time (hours)', timeStats.plannedTime.toFixed(2)],
        ['Spent Time (without NRC) (hours)', timeStats.spentTime.toFixed(2)],
        ['Spent Time on NRC (hours)', timeStats.defectTime.toFixed(2)],
      ],
    });
    
    // Time Statistics by Skill
    doc.text('Time Statistics by Skill', 14, doc.lastAutoTable.finalY + 10);
    const skillTimeData = Object.entries(calculateTimeBySkill).map(([skillCode, time]) => [skillCode, time.toFixed(2)]);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Skill Code', 'Time (hours)']],
      body: skillTimeData,
    });
    
    // Access Statistics
    const accessStats = calculateAccessStats();
    doc.text('Access Statistics', 14, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Metric', 'Value']],
      body: [
        ['Total Accesses', accessStats.total],
        ['Opened', accessStats.opened],
        ['Closed', accessStats.closed],
        ['Inspected', accessStats.inspected],
      ],
    });
    
    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const filename = `daily_report_WO_${workOrder.WONumber}_${currentDate}.pdf`;
    
    // Save the PDF
    doc.save(filename);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    // Logic for creating Excel file
    XLSX.writeFile(wb, 'daily_report.xlsx');
  };

  // Chart components
  const TasksPieChart = () => {
    const { completed, remaining } = calculateTaskStats();
    const data = [
      { type: 'Completed', value: completed },
      { type: 'Remaining', value: remaining },
    ];
    return <Pie data={data} angleField="value" colorField="type" />;
  };

  const TimeBarChart = () => {
    const { plannedTime, spentTime, defectTime } = calculateTimeStats();
    console.log('Time values:', { plannedTime, spentTime, defectTime });

    const data = [
      { type: 'Planned', value: plannedTime, category: 'Total' },
      { type: 'Spent (without NRC)', value: spentTime, category: 'Routine tasks' },
      { type: 'Spent on NRC', value: defectTime, category: 'Defects' },
    ];
    
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <Bar 
        data={data} 
        yField="value" 
        xField="type" 
        seriesField="category"
        isGroup={true}
        yAxis={{
          max: maxValue * 1.1,
          tickCount: 5,
          label: {
            formatter: (v: string) => `${Number(v).toFixed(2)} h`,
          },
        }}
        tooltip={{
          formatter: (datum: any) => {
            return {
              name: datum.category,
              value: `${datum.value.toFixed(2)} hours`,
            };
          },
        }}
        label={{
          position: 'top',
          formatter: (datum: any) => `${datum.value.toFixed(2)} h`,
        }}
        legend={{
          position: 'bottom',
        }}
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
    const taskTypes = tasks?.reduce((acc, task) => {
      const typeName = taskTypeNames[task.projectItemType as keyof typeof taskTypeNames] || task.projectItemType;
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    return Object.entries(taskTypes).map(([type, count]) => ({
      type,
      count
    }));
  };

  // Updated component for displaying task distribution by type
  const TaskTypesPieChart = () => {
    const data = calculateTaskTypeStats();
    return <Pie data={data} angleField="count" colorField="type" />;
  };

  // New function for calculating access statistics
  const calculateAccessStats = () => {
    const total = accesses?.length || 0;
    const opened = accesses?.filter(access => access.status === 'open').length || 0;
    const closed = accesses?.filter(access => access.status === 'closed').length || 0;
    const inspected = accesses?.filter(access => access.status === 'inspected').length || 0;
    
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
    return <Pie data={data} angleField="value" colorField="type" />;
  };

  const TimeBySkillPieChart = () => {
    const data = Object.entries(calculateTimeBySkill).map(([skillCode, time]) => ({
      type: skillCode,
      value: time
    }));

    return (
      <Pie
        data={data}
        angleField="value"
        colorField="type"
        radius={0.8}
        label={{
          type: 'outer',
          content: '{name} {percentage}'
        }}
        interactions={[
          { type: 'element-active' },
        ]}
      />
    );
  };

  return (
    <Card 
      title={`Daily Report - WO №${workOrder.WONumber}`}
      extra={
        <Space>
          <Button icon={<DownloadOutlined />} onClick={exportToPDF}>PDF</Button>
          {/* <Button icon={<DownloadOutlined />} onClick={exportToExcel}>Excel</Button> */}
          {/* <Button icon={<PrinterOutlined />} onClick={() => window.print()}>Print</Button> */}
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('Aircraft Information')} size="small">
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <ProDescriptions
                  column={1}
                  size="small"
                  layout="vertical"
                >
                  <ProDescriptions.Item label={t('AC Reg')}>
                    {workOrder.planeId?.regNbr && <Tag color="blue">{workOrder.planeId.regNbr}</Tag>}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label={t('AC Type')}>
                    {workOrder.planeId?.acTypeId?.[0]?.code && <Tag color="green">{workOrder.planeId.acTypeId[0].code}</Tag>}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label={t('MSN')}>
                    {workOrder.planeId?.serialNbr && <Tag color="orange">{workOrder.planeId.serialNbr}</Tag>}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label={t('Effectivity')}>
                    {workOrder.planeId?.efectivityNumber && <Tag color="purple">{workOrder.planeId.efectivityNumber}</Tag>}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label={t('Manufactory date')}>
                    {workOrder.planeId?.manafacturesDate}
                  </ProDescriptions.Item>
                </ProDescriptions>
              </Col>
              <Col span={12}>
                <ProDescriptions
                  column={1}
                  size="small"
                  layout="vertical"
                >
                  <ProDescriptions.Item label={t('Engine Type')}>
                    {workOrder.planeId?.engineType && <Tag color="cyan">{workOrder.planeId.engineType}</Tag>}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label={t('APU Type')}>
                    {workOrder.planeId?.apuType && <Tag color="magenta">{workOrder.planeId.apuType}</Tag>}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label={t('Total Frame Hours')}>
                    {workOrder.planeId?.airFrameHours && <Tag color="gold">{workOrder.planeId.airFrameHours}</Tag>}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label={t('Total Frame Cycles')}>
                    {workOrder.planeId?.airFrameLandings && <Tag color="lime">{workOrder.planeId.airFrameLandings}</Tag>}
                  </ProDescriptions.Item>
                </ProDescriptions>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('Document Revisions')} size="small">
            <ProDescriptions
              column={1}
              size="small"
              layout="vertical"
            >
              <ProDescriptions.Item label={t('MPD Rev')}>
                <Tag color="red">{getDocumentRevision('MPD')}</Tag>
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('AMM Rev')}>
                <Tag color="volcano">{getDocumentRevision('AMM')}</Tag>
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('SRM Rev')}>
                <Tag color="orange">{getDocumentRevision('SRM')}</Tag>
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('TC Rev')}>
                <Tag color="gold">{getDocumentRevision('TC')}</Tag>
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('NDTM Rev')}>
                <Tag color="lime">{getDocumentRevision('NDTM')}</Tag>
              </ProDescriptions.Item>
            </ProDescriptions>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('Work Order Information')} size="small">
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <ProDescriptions
                  column={1}
                  size="small"
                  layout="vertical"
                >
                  <ProDescriptions.Item label={t('WO Number')}>{workOrder.WONumber}</ProDescriptions.Item>
                  <ProDescriptions.Item label={t('WO Name')}>{workOrder.WOName}</ProDescriptions.Item>
                  <ProDescriptions.Item label={t('Status')}>{workOrder.status}</ProDescriptions.Item>
                  <ProDescriptions.Item label={t('WO Type')}>{workOrder.WOType}</ProDescriptions.Item>
                </ProDescriptions>
              </Col>
              <Col span={12}>
                <ProDescriptions
                  column={1}
                  size="small"
                  layout="vertical"
                >
                  <ProDescriptions.Item label={t('Creation Date')}>
                    {workOrder.createDate ? new Date(workOrder.createDate).toLocaleString() : t('Not specified')}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label={t('Start Date')}>
                    {workOrder.startDate ? new Date(workOrder.startDate).toLocaleString() : t('Not specified')}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label={t('Planned Finish Date')}>
                    {workOrder.planedFinishDate ? new Date(workOrder.planedFinishDate).toLocaleString() : t('Not specified')}
                  </ProDescriptions.Item>
                </ProDescriptions>
              </Col>
            </Row>
            <ProDescriptions
              column={1}
              size="small"
              layout="vertical"
            >
              <ProDescriptions.Item label={t('Description')}>{workOrder.description || t('Not available')}</ProDescriptions.Item>
            </ProDescriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('Task Statistics')} size="small">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic title={t('Total Tasks')} value={calculateTaskStats().total} />
              </Col>
              <Col span={8}>
                <Statistic title={t('Completed Tasks')} value={calculateTaskStats().completed} />
              </Col>
              <Col span={8}>
                <Statistic title={t('Remaining Tasks')} value={calculateTaskStats().remaining} />
              </Col>
            </Row>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic title={t('Defects Found (NRC)')} value={calculateTaskStats().defectsCount} />
              </Col>
              <Col span={12}>
                <Statistic title={t('Defects Resolved')} value={calculateTaskStats().completedDefects} />
              </Col>
            </Row>
            <Divider />
            <Title level={5}>{t('Time Statistics')}</Title>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic title={t('Planned (all tasks)')} value={calculateTimeStats().plannedTime.toFixed(2)} suffix={t('hours')} />
              </Col>
              <Col span={8}>
                <Statistic title={t('Spent (without NRC)')} value={calculateTimeStats().spentTime.toFixed(2)} suffix={t('hours')} />
              </Col>
              <Col span={8}>
                <Statistic title={t('Spent on NRC')} value={calculateTimeStats().defectTime.toFixed(2)} suffix={t('hours')} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('Task Distribution by Status')} size="small">
            <TasksPieChart />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('Task Distribution by Type')} size="small">
            <TaskTypesPieChart />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title={t('Statistics by Task Type')} size="small">
            <Row gutter={[16, 16]}>
              {calculateTaskTypeStats().map(({ type, count }) => (
                <Col key={type} span={6}>
                  <Statistic title={type} value={count as number} />
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('Time Distribution')} size="small">
            <TimeBarChart />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('Time Distribution by Skill')} size="small">
            <TimeBySkillPieChart />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title={t('Time Statistics by Skill')} size="small">
            {Object.keys(calculateTimeBySkill).length > 0 ? (
              <Row gutter={[16, 16]}>
                {Object.entries(calculateTimeBySkill).map(([skillCode, time]) => (
                  <Col key={skillCode} span={6}>
                    <Statistic 
                      title={`${skillCode}`} 
                      value={time} 
                      precision={2}
                      suffix={t('hours')} 
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description={t('No time data available by skill')} />
            )}
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('Access Statistics')} size="small">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic title={t('Total Accesses')} value={calculateAccessStats().total} />
              </Col>
              <Col span={6}>
                <Statistic title={t('Opened')} value={calculateAccessStats().opened} />
              </Col>
              <Col span={6}>
                <Statistic title={t('Closed')} value={calculateAccessStats().closed} />
              </Col>
              <Col span={6}>
                <Statistic title={t('Inspected')} value={calculateAccessStats().inspected} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('Access Distribution by Status')} size="small">
            <AccessPieChart />
          </Card>
        </Col>
      </Row>

      <Divider />
    </Card>
  );
};

export default DailyReport;