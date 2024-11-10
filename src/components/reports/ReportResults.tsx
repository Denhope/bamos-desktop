//@ts-nocheck

import React from 'react';
import TaskReport from './TaskReport';
import MaterialsReport from './MaterialsReport/MaterialsReport';
import DailyReport from './DailyReport';
import WPSSReport from './WPSSReport';

interface TaskResults {
  tasks: any[];
  workOrder: any;
}

interface ReportResultsProps {
  results: TaskResults | any;
  reportType: 'tasks' | 'materials' | 'daily' | 'wpss';
  handleReportSearch: {
    WOReferenceID?: string;
    projectID?: string;
    projectTaskID?: string;
    pickSlipNumberNew?: string;
    partNumber?: string;
    neededOnID?: string;
  };
}

interface DailyReportData {
  reportType: string;
  workOrder: {
    id: string;
    companyID: string;
    ownerId: string | null;
    certificateId: string | null;
  };
  tasks: Array<any>;
  accesses: Array<any>;
  reportDate: string;
  WOReferenceID: string;
}

const ReportResults: React.FC<ReportResultsProps> = ({
  results,
  reportType,
  handleReportSearch,
}) => {
  console.log(handleReportSearch, 'handleReportSearch');

  if (!results) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading results...</div>
      </div>
    );
  }

  const isEmptyResults = Array.isArray(results)
    ? !results.length
    : !Object.keys(results).length;
  if (isEmptyResults) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">No results found</div>
      </div>
    );
  }

  switch (reportType) {
    case 'tasks':
      if (!results?.tasks || !results?.workOrder) {
        return (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Waiting for task data...</div>
          </div>
        );
      }
      return (
        <TaskReport
          tasks={results.tasks}
          workOrder={results.workOrder}
          filters={handleReportSearch}
        />
      );

    case 'materials':
      if (!results) {
        return (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Waiting for materials data...</div>
          </div>
        );
      }
      return (
        <MaterialsReport filterParams={handleReportSearch} results={results} />
      );

    case 'daily':
      console.log('Daily Report Raw Results:', results);

      // Проверяем наличие необходимых данных
      if (!results?.workOrder || !results?.tasks || !results?.accesses) {
        return (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">
              Waiting for daily report data...
            </div>
          </div>
        );
      }

      // Передаем данные напрямую в нужные пропсы
      return (
        <DailyReport
          workOrder={results.workOrder}
          tasks={results.tasks}
          accesses={results.accesses}
        />
      );

    case 'wpss':
      if (!results?.workOrder || !results?.tasks) {
        return (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">{t('Waiting for WPSS data...')}</div>
          </div>
        );
      }
      return <WPSSReport results={results} />;

    default:
      return null;
  }
};

export default ReportResults;
