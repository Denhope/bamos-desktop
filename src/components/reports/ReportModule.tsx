import React, { useEffect, useState } from 'react';
import { Card, Menu } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { getItem } from '@/services/utilites';
import { useTranslation } from 'react-i18next';

import ReportForm from './ReportForm';
import ReportResults from './ReportResults';
import { useGetfilteredWOQuery } from '@/features/wpAdministration/wpApi';
import {
  useGetProjectItemsWOQuery,
  useGetProjectPanelsQuery,
} from '@/features/projectItemWO/projectItemWOApi';
import { Split } from '@geoffcox/react-splitter';

const ReportModule: React.FC = () => {
  const { t } = useTranslation();
  const [reportData, setReportData] = useState<any>(null);
  const [filterParams, setFilterParams] = useState<any>({});

  const { data: workOrders, isFetching: isWOFetching } =
    useGetfilteredWOQuery(filterParams);
  const { data: tasks, isFetching: isTasksFetching } =
    useGetProjectItemsWOQuery(
      {
        status: filterParams?.status,
        startDate: filterParams?.startDate,
        finishDate: filterParams?.endDate,
        projectID: filterParams?.projectID,
        vendorID: filterParams?.vendorID,
        partNumberID: filterParams?.partNumberID,
        taskWO: filterParams?.projectTaskWO,
        planeId: filterParams?.planeId,
        restrictionID: filterParams?.restrictionID,
        phasesID: filterParams?.phasesID,
        useID: filterParams?.useID,
        skillCodeID: filterParams?.skillCodeID,
        accessID: filterParams?.accessID,
        zonesID: filterParams?.zonesID,
        projectItemType: filterParams?.projectItemType,
        WOReferenceID: filterParams?.WOReferenceID,
        time: filterParams?.time,
        defectCodeID: filterParams?.defectCodeID,
        ata: filterParams?.ata,
      },
      { skip: !filterParams.WOReferenceID }
    );

  const { data: accesses, isFetching: isAccessesFetching } =
    useGetProjectPanelsQuery(
      {
        ...filterParams,
        WOReferenceID: filterParams.WOReferenceID || undefined,
      },
      { skip: !filterParams.WOReferenceID }
    );

  const handleReportSearch = async (values: any) => {
    setFilterParams(values);
    console.log(values, 'values');

    if (
      !isWOFetching &&
      !isTasksFetching &&
      !isAccessesFetching &&
      workOrders
    ) {
      const selectedWO = workOrders.find(
        (wo) => wo._id === values.WOReferenceID
      );

      if (selectedWO) {
        const newReportData = {
          reportType: values.reportType,
          workOrder: selectedWO,
          tasks: tasks || [],
          accesses: accesses || [],
          reportDate: values.reportDate,
        };
        setReportData(newReportData);
      } else {
        setReportData(null);
      }
    }
  };

  React.useEffect(() => {
    if (
      !isWOFetching &&
      !isTasksFetching &&
      !isAccessesFetching &&
      workOrders &&
      filterParams.WOReferenceID
    ) {
      const selectedWO = workOrders.find(
        (wo) => wo._id === filterParams.WOReferenceID
      );

      if (selectedWO) {
        const newReportData = {
          reportType: filterParams.reportType,
          workOrder: selectedWO,
          tasks: tasks || [],
          accesses: accesses || [],
          reportDate: filterParams.reportDate,
        };
        setReportData(newReportData);
      } else {
        setReportData(null);
      }
    }
  }, [
    isWOFetching,
    isTasksFetching,
    isAccessesFetching,
    workOrders,
    tasks,
    accesses,
    filterParams,
  ]);

  return (
    <Split initialPrimarySize="25%" splitterSize="20px">
      <div style={{ minWidth: '200px', maxWidth: '100%', height: '100%' }}>
        <Menu
          theme="light"
          className="h-max"
          mode="inline"
          items={[getItem(<>{t('REPORTS')}</>, 'sub1', <FileTextOutlined />)]}
        />
        <div className="mx-auto px-5">
          <ReportForm
            onReportSearch={handleReportSearch}
            formKey="reportForm"
          />
        </div>
      </div>
      <div style={{ minWidth: '60%' }}>
        <Card
          bordered={true}
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          bodyStyle={{ flex: 1, overflow: 'auto' }}
        >
          <ReportResults
            results={reportData}
            reportType={reportData?.reportType}
            handleReportSearch={filterParams}
          />
        </Card>
      </div>
    </Split>
  );
};

export default ReportModule;
