import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Modal, message, Spin, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ValueSetterParams, GridReadyEvent } from 'ag-grid-community';
import { ProForm, ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { useGetSupportRequestsQuery, useUpdateSupportRequestMutation } from '@/store/slices/supportRequestApi';
import { SubscriptionType, getSubscriptionTypes, getStatusColor } from '@/services/utilites';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface SupportRequestPanelProps {
  supportRequestSearchValues: any;
}

const SupportRequestPanel: React.FC<SupportRequestPanelProps> = ({ supportRequestSearchValues }) => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [gridHeight, setGridHeight] = useState('400px');

  const { data: supportRequests, isFetching, refetch } = useGetSupportRequestsQuery({
    ...supportRequestSearchValues,
    requestType: supportRequestSearchValues?.requestType?.join(',') || '',
    dateRange: supportRequestSearchValues?.dateRange?.join(',') || '',
  });
  const [updateSupportRequest] = useUpdateSupportRequestMutation();

  useEffect(() => {
    const updateGridHeight = () => {
      const windowHeight = window.innerHeight;
      const topOffset = document.getElementById('supportRequestGrid')?.offsetTop || 0;
      const newHeight = windowHeight - topOffset - 20;
      setGridHeight(`${newHeight}px`);
    };

    updateGridHeight();
    window.addEventListener('resize', updateGridHeight);

    return () => window.removeEventListener('resize', updateGridHeight);
  }, []);

  useEffect(() => {
    refetch();
  }, [supportRequestSearchValues, refetch]);

  const handleStatusChange = useCallback(async (params: ValueSetterParams) => {
    const { data, newValue } = params;
    try {
      await updateSupportRequest({ id: data._id, status: newValue }).unwrap();
      message.success(t('Status updated successfully'));
      return true;
    } catch (error) {
      message.error(t('Failed to update status'));
      return false;
    }
  }, [updateSupportRequest, t]);

  const columnDefs = useMemo<ColDef[]>(() => [
    { field: 'title', headerName: t('Title'), flex: 2 },
    {
      field: 'status',
      headerName: t('Status'),
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['open', 'inProgress', 'closed'],
      },
      valueSetter: (params) => {
        handleStatusChange(params);
        return true;
      },
      cellStyle: (params: any) => ({
        backgroundColor: getStatusColor(params.value),
        color: '#ffffff',
      }),
      cellRenderer: (params: any) => params.value.toUpperCase(),
      flex: 1,
    },
    { field: 'priority', headerName: t('Priority'), flex: 1 },
    { 
      field: 'requestType', 
      headerName: t('Request Type'),
      valueFormatter: (params: any) => {
        const types = getSubscriptionTypes(t);
        const requestType = types.find(type => type.value === params.value);
        return requestType ? requestType.label : params.value;
      },
      flex: 1,
    },
    {
      field: 'description',
      headerName: t('Description'),
      cellRenderer: (params: any) => {
        return <Tooltip title={params.value}>
          <div className="truncate">{params.value}</div>
        </Tooltip>
      },
      flex: 2,
    },
    { field: 'createDate', headerName: t('Created Date'), flex: 1 },
    { field: 'createdBy', headerName: t('Created By'), valueGetter: (params: any) => params.data.createUserID?.name || '', flex: 1 },
    {
      headerName: t('Actions'),
      cellRenderer: (params: any) => {
        return <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
          onClick={() => showModal(params.data)}
        >
          {t('Edit')}
        </button>
      },
      flex: 1,
    },
  ], [t, handleStatusChange]);

  const showModal = (record: any) => {
    setSelectedRequest(record);
    setIsModalVisible(true);
  };

  const handleOk = async (values: any) => {
    try {
      await updateSupportRequest({ id: selectedRequest.id, ...values }).unwrap();
      setIsModalVisible(false);
      message.success(t('Support request updated successfully'));
      refetch();
    } catch (error) {
      message.error(t('Failed to update support request'));
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  return (
    <>
      <div id="supportRequestGrid" className="ag-theme-alpine" style={{ height: gridHeight, width: '100%' }}>
        {isFetching ? (
          <div className="flex justify-center items-center h-full">
            <Spin size="large" />
          </div>
        ) : (
          <AgGridReact
            rowData={supportRequests}
            columnDefs={columnDefs}
            defaultColDef={{ 
              sortable: true, 
              filter: true,
              resizable: true,
              flex: 1
            }}
            pagination={true}
            paginationPageSize={10}
            onGridReady={onGridReady}
            onGridSizeChanged={(params) => params.api.sizeColumnsToFit()}
          />
        )}
      </div>
      <Modal
        title={t('Edit Support Request')}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <ProForm
          initialValues={selectedRequest}
          onFinish={handleOk}
        >
          <ProFormText
            name="title"
            label={t('Title')}
            rules={[{ required: true }]}
          />
          <ProFormSelect
            name="status"
            label={t('Status')}
            options={[
              { value: 'open', label: t('Open') },
              { value: 'inProgress', label: t('In Progress') },
              { value: 'closed', label: t('Closed') },
            ]}
            rules={[{ required: true }]}
          />
          <ProFormSelect
            name="priority"
            label={t('Priority')}
            options={[
              { value: 'low', label: t('Low') },
              { value: 'medium', label: t('Medium') },
              { value: 'high', label: t('High') },
            ]}
            rules={[{ required: true }]}
          />
          <ProFormSelect
            name="requestType"
            label={t('Request Type')}
            options={getSubscriptionTypes(t)}
            rules={[{ required: true }]}
          />
          <ProFormTextArea
            name="description"
            label={t('Description')}
            rules={[{ required: true }]}
          />
        </ProForm>
      </Modal>
    </>
  );
};

export default SupportRequestPanel;