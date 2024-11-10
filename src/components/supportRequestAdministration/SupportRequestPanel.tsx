//@ts-nocheck
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Modal, message, Spin, Tooltip, Form, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { ColDef, ValueSetterParams } from 'ag-grid-community';
import dayjs from 'dayjs';

import {
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import {
  useGetSupportRequestsQuery,
  useUpdateSupportRequestMutation,
} from '@/store/slices/supportRequestApi';
import {
  SubscriptionType,
  getSubscriptionTypes,
  getStatusColor,
} from '@/services/utilites';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';

interface SupportRequestPanelProps {
  supportRequestSearchValues: any;
}

const SupportRequestPanel: React.FC<SupportRequestPanelProps> = ({
  supportRequestSearchValues,
}) => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [gridHeight, setGridHeight] = useState('72vh');
  const [form] = Form.useForm();

  const {
    data: supportRequests,
    isFetching,
    refetch,
  } = useGetSupportRequestsQuery({
    ...supportRequestSearchValues,
    requestType: supportRequestSearchValues?.requestType?.join(',') || '',
    dateRange: supportRequestSearchValues?.dateRange?.join(',') || '',
  });
  const [updateSupportRequest] = useUpdateSupportRequestMutation();

  useEffect(() => {
    const updateGridHeight = () => {
      const windowHeight = window.innerHeight;
      const topOffset =
        document.getElementById('supportRequestGrid')?.offsetTop || 0;
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

  const handleStatusChange = useCallback(
    async (params: ValueSetterParams) => {
      const { data, newValue } = params;
      try {
        await updateSupportRequest({ id: data._id, status: newValue }).unwrap();
        message.success(t('Status updated successfully'));
        return true;
      } catch (error) {
        message.error(t('Failed to update status'));
        return false;
      }
    },
    [updateSupportRequest, t]
  );

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'default';
    }
  };

  const getRequestTypeColor = (requestType: string) => {
    switch (requestType) {
      case 'SUBSCRIPTION_BASIC':
        return 'blue';
      case 'SUBSCRIPTION_STANDARD':
        return 'cyan';
      case 'SUBSCRIPTION_PREMIUM':
        return 'purple';
      case 'SUBSCRIPTION_ENTERPRISE':
        return 'magenta';
      default:
        return 'default';
    }
  };

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'title', headerName: t('TITLE') },
      {
        field: 'status',
        headerName: t('STATUS'),
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
        }),
        cellRenderer: (params: any) => params.value.toUpperCase(),
        // flex: 1,
      },

      {
        field: 'priority',
        headerName: t('PRIORITY'),
        cellRenderer: (params: any) => {
          return (
            <Tag color={getPriorityColor(params.value)}>
              {params.value.toUpperCase()}
            </Tag>
          );
        },
      },
      {
        field: 'requestType',
        headerName: t('REQUEST TYPE'),
        cellRenderer: (params: any) => {
          const types = getSubscriptionTypes(t);
          const requestType = types.find((type) => type.value === params.value);
          const label = requestType ? requestType.label : params.value;
          return <Tag color={getRequestTypeColor(params.value)}>{label}</Tag>;
        },
      },
      {
        field: 'description',
        headerName: t('DESCRIPTION'),
        cellRenderer: (params: any) => {
          return (
            <Tooltip title={params.value}>
              <div className="truncate">{params.value}</div>
            </Tooltip>
          );
        },
        // flex: 2,
      },

      {
        field: 'createDate',
        headerName: t('CREATE DATE'),
        cellRenderer: (params: any) => {
          const date = params.data.createDate;
          if (!date) return '';

          const formattedDate = dayjs(date).format('DD.MM.YYYY HH:mm');
          return <div style={{ padding: '4px' }}>{formattedDate}</div>;
        },
      },
      {
        field: 'createdBy',
        headerName: t('CREATED BY'),
        valueGetter: (params: any) => {
          return params.data.createUserID?.name || '';
        },
      },

      {
        headerName: t('Actions'),
        cellRenderer: (params: any) => {
          return (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
              onClick={() => showModal(params.data)}
            >
              {t('Edit')}
            </button>
          );
        },
        // flex: 1,
      },
    ],
    [t, handleStatusChange]
  );

  const showModal = (record: any) => {
    setSelectedRequest({ ...record });
    form.setFieldsValue({ ...record });
    setIsModalVisible(true);
  };

  const handleOk = async (values: any) => {
    try {
      await updateSupportRequest({
        id: selectedRequest?._id || selectedRequest?.id,
        ...values,
      }).unwrap();
      setIsModalVisible(false);
      setSelectedRequest(null);
      form.resetFields();
      message.success(t('Support request updated successfully'));
      refetch();
    } catch (error) {
      message.error(t('Failed to update support request'));
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRequest(null);
    form.resetFields();
  };

  return (
    <>
      <div
        id="supportRequestGrid"
        className="ag-theme-alpine"
        style={{ height: gridHeight, width: '100%' }}
      >
        {isFetching ? (
          <div className="flex justify-center items-center h-full">
            <Spin size="large" />
          </div>
        ) : (
          <UniversalAgGrid
            gridId="supportRequestGrid"
            rowData={supportRequests}
            columnDefs={columnDefs}
            // pagination={true}
            height="82vh"
            className="h-full"
            isLoading={isFetching}
            onRowDoubleClicked={(params) => showModal(params.data)}
          />
        )}
      </div>
      <Modal
        title={t('Edit Support Request')}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <ProForm
          form={form}
          onFinish={handleOk}
          initialValues={selectedRequest}
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
