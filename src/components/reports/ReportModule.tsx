import React, { useState } from 'react';
import { Row, Col, Card } from 'antd';
import { useTranslation } from 'react-i18next';
import ReportForm from './ReportForm';
import ReportResults from './ReportResults';
import { useGetfilteredWOQuery } from '@/features/wpAdministration/wpApi';
import { useGetProjectItemsWOQuery, useGetProjectPanelsQuery } from '@/features/projectItemWO/projectItemWOApi';

const ReportModule: React.FC = () => {
  const { t } = useTranslation();
  const [reportData, setReportData] = useState<any>(null);
  const [filterParams, setFilterParams] = useState<any>({});

  const { data: workOrders } = useGetfilteredWOQuery(filterParams);
  const { data: tasks } = useGetProjectItemsWOQuery(
    { 

      status:filterParams?.status,
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
      ata: filterParams?.ata},
    { skip: !filterParams.WOReferenceID }
  );

  const { data: accesses, isLoading, isFetching, refetch } = useGetProjectPanelsQuery(
    { ...filterParams, WOReferenceID: filterParams.WOReferenceID || undefined },
    { skip: !filterParams.WOReferenceID }
  );

  const handleReportSearch = async (values: any) => {
    setFilterParams(values);
    console.log('setFilterParams:',values)

    const selectedWO = workOrders?.find(wo => wo._id === values.WOReferenceID);

    if (selectedWO) {
      const reportData = {
        reportType: values.reportType,
        workOrder: selectedWO,
        tasks: tasks || [],
        accesses: accesses || [],
        reportDate: values.reportDate,
       
      };
      setReportData(reportData);
    } else {
      setReportData(null);
    }
  };

  return (
    <Row gutter={24} style={{ height: '100%' }}>
      <Col span={8} style={{ height: '100%' }}>
        <Card 
          title={t('Report Filters')} 
          bordered={false} 
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          bodyStyle={{ flex: 1, overflow: 'auto' }}
        >
          <ReportForm onReportSearch={handleReportSearch} formKey="reportForm" />
        </Card>
      </Col>
      <Col span={16} style={{ height: '100%' }}>
        <Card 
          title={t('Report Results')} 
          bordered={false}
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          bodyStyle={{ flex: 1, overflow: 'auto' }}
        >
          <ReportResults results={reportData} reportType={reportData?.reportType} handleReportSearch={filterParams} />
        </Card>
      </Col>
    </Row>
  );
};

export default ReportModule;