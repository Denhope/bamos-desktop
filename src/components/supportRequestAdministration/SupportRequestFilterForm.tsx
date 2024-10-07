import React from 'react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormDateRangePicker,
} from '@ant-design/pro-components';
import { SubscriptionType, getSubscriptionTypes } from '@/services/utilites';

interface SupportRequestFilterFormProps {
  onSupportRequestSearch: (values: any) => void;
}

const SupportRequestFilterForm: React.FC<SupportRequestFilterFormProps> = ({ onSupportRequestSearch }) => {
  const { t } = useTranslation();

  return (
    <ProForm 
      size='small'
      labelAlign='left'
      layout="horizontal"
      onFinish={onSupportRequestSearch}
      submitter={{
        render: (props) => {
          return [
            <Button type="primary" key="submit" onClick={() => props.form?.submit()}>
              {t('Search')}
            </Button>,
          ];
        },
      }}
    >
      <ProFormText
        name="title"
        label={t('Title')}
      />
      <ProFormSelect
        name="status"
        label={t('Status')}
        options={[
          { value: 'open', label: t('Open') },
          { value: 'inProgress', label: t('In Progress') },
          { value: 'closed', label: t('Closed') },
        ]}
      />
      <ProFormSelect
        name="priority"
        label={t('Priority')}
        options={[
          { value: 'low', label: t('Low') },
          { value: 'medium', label: t('Medium') },
          { value: 'high', label: t('High') },
        ]}
      />
      <ProFormSelect
        name="requestType"
        label={t('Request Type')}
        mode="multiple"
        options={getSubscriptionTypes(t)}
      />
      <ProFormDateRangePicker
        name="dateRange"
        label={t('Date Range')}
      />
    </ProForm>
  );
};

export default SupportRequestFilterForm;