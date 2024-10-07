import React, { FC } from 'react';
import { Typography, Table, Divider, Card, Row, Col, Button } from 'antd';
import { Bar, Pie } from '@ant-design/charts';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import DailyReport from './DailyReport';
import { useTranslation } from 'react-i18next';
import TaskReport from './TaskReport';

const { Title, Text } = Typography;

interface ReportResultsProps {
  results: any;
  reportType: string;
  handleReportSearch?:any
}

const ReportResults: FC<ReportResultsProps> = ({ results, reportType,handleReportSearch }) => {
  console.log('ReportResults props:', { results, reportType }); // Отладочная информация
  const { t } = useTranslation();
  if (!results) {
    return <Text>{t('No data to display. Please generate a report.')}</Text>;
  }

  const renderDefectsReport = () => {
    // Пример отображения отчета по дефектам
    return (
      <>
        <Title level={4}>Статистика дефектов</Title>
        <Bar
          data={results.defectStats}
          xField="value"
          yField="type"
          seriesField="type"
        />
        <Divider />
        <Table
          dataSource={results.defectList}
          columns={[
            { title: 'ID', dataIndex: 'id', key: 'id' },
            { title: 'Описание', dataIndex: 'description', key: 'description' },
            { title: 'Статус', dataIndex: 'status', key: 'status' },
          ]}
        />
      </>
    );
  };

  const renderTasksReport = () => {
    console.log('Rendering Task Report with data:', results); // Отладочная информация
    if (!results || !results.tasks) {
      return <Text>Нет данных для отображения  отчета.</Text>;
    }
    return <TaskReport tasks={results.tasks || []} workOrder={results.workOrder} filters={handleReportSearch} />;
  };

  const renderTimeReport = () => {
    // Пример отображения отчета по времени
    return (
      <>
        <Title level={4}>Статистика времени</Title>
        <Bar
          data={results.timeStats}
          xField="value"
          yField="type"
          seriesField="type"
        />
        <Divider />
        <Table
          dataSource={results.timeList}
          columns={[
            { title: 'Задача', dataIndex: 'task', key: 'task' },
            { title: 'Затраченное время', dataIndex: 'spentTime', key: 'spentTime' },
            { title: 'Плановое время', dataIndex: 'plannedTime', key: 'plannedTime' },
          ]}
        />
      </>
    );
  };

  const renderMaterialsReport = () => {
    // Пример отображения отчета по материалам
    return (
      <>
        <Title level={4}>Отчет по материалам</Title>
        <Table
          dataSource={results.materialList}
          columns={[
            { title: 'Номер детали', dataIndex: 'partNumber', key: 'partNumber' },
            { title: 'Описание', dataIndex: 'description', key: 'description' },
            { title: 'Количество', dataIndex: 'quantity', key: 'quantity' },
            { title: 'Статус', dataIndex: 'status', key: 'status' },
          ]}
        />
      </>
    );
  };

  const renderDailyReport = () => {
    console.log('Rendering Daily Report with data:', results); // Отладочная информация
    if (!results || !results.workOrder) {
      return <Text>Нет данных для отображения ежедневного отчета.</Text>;
    }
    return <DailyReport workOrder={results.workOrder} tasks={results.tasks || []} accesses={results.accesses} />;
  };

  const renderWorkorderReport = () => {
    // Реализуйте отображение отчета по рабочему заказу
    // Это может быть похоже на DailyReport или иметь свою собственную структуру
    return (
      <Card title="Отчет по рабочему заказу">
        {/* Добавьте здесь содержимое отчета по рабочему заказу */}
      </Card>
    );
  };

  const renderReport = () => {
    console.log('Rendering report of type:', reportType); // Отладочная информация
    switch (reportType) {
      case 'defects':
        return renderDefectsReport();
      case 'tasks':
        return renderTasksReport();
      case 'time':
        return renderTimeReport();
      case 'materials':
        return renderMaterialsReport();
      case 'daily':
        return renderDailyReport();
      case 'workorder':
        return renderWorkorderReport();
      default:
        return <Text>Неизвестный тип отчета: {reportType}</Text>;
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {renderReport()}
    </div>
  );
};

export default ReportResults;