import React, { FC, useEffect, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-form';
import { Button, Col, Row, Space, Tabs } from 'antd';

import { useTranslation } from 'react-i18next';

import { IACType, IMaintenanceType } from '@/models/AC';
import MaintenanceTypeTab from './MaintenanceType/MaintenanceTypeTab';

import TaskCodeFormPanel from '../taskCodeAdministration/TaskCodeFormPanel';
import ZoneCodeFormPanel from '../zoneCodeAdministration/ZoneCodeFormPanel';

interface IACTypeFormProps {
  acType: IACType | undefined;
  onSubmit: (acType: IACType) => void;
  onDelete?: (acTypeId: string) => void;
}

const ACTypeForm: FC<IACTypeFormProps> = ({ acType, onSubmit }) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const handleSubmit = async (values: IACType) => {
    const newUser: IACType = acType ? { ...acType, ...values } : { ...values };
    onSubmit(newUser);
  };
  const [editingMaintenanceType, setEditingMaintenanceType] =
    useState<IMaintenanceType | null>(null);
  const handleEdit = (acMaintType: IMaintenanceType) => {
    setEditingMaintenanceType(acMaintType);
  };
  useEffect(() => {
    if (acType) {
      form.resetFields();
      form.setFieldsValue(acType || {});
    } else {
      form.resetFields();
    }
  }, [acType, form]);

  return (
    <ProForm<IACType>
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={false}
      // initialValues={vendor || {}}
      layout="horizontal"
    >
      <Tabs defaultActiveKey="1" type="card">
        <Tabs.TabPane tab="MAIN" key="1">
          <ProFormGroup>
            <ProFormGroup>
              <ProFormText
                width={'sm'}
                name="code"
                label="CODE"
                rules={[
                  {
                    required: true,
                  },
                ]}
              />

              <ProFormText
                width={'lg'}
                name="name"
                label="TITLE"
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
              <ProFormText
                width={'lg'}
                name="manufacturer"
                label="MANUFACTURER"
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            </ProFormGroup>
            <ProFormGroup>
              <ProFormSelect
                showSearch
                // mode="multiple"
                name="status"
                label={t('STATE')}
                width="sm"
                valueEnum={{
                  ACTIVE: { text: t('ACTIVE'), status: 'SUCCESS' },
                  INACTIVE: { text: t('INACTIVE'), status: 'Error' },
                }}
              />
            </ProFormGroup>
          </ProFormGroup>
        </Tabs.TabPane>
        <Tabs.TabPane tab="MAINTENANCE TYPES" key="2">
          <MaintenanceTypeTab values={undefined} acType={acType || undefined} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="TASK CODES" key="3">
          {acType && acType.id && (
            <TaskCodeFormPanel acTypeID={acType?.id || ''} />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="ZONES CODES" key="4">
          {acType && acType.id && (
            <ZoneCodeFormPanel acTypeID={acType.id || ''} />
          )}
        </Tabs.TabPane>
      </Tabs>

      <ProForm.Item>
        <Button type="primary" htmlType="submit">
          {acType ? 'Update' : 'Create'}
        </Button>
      </ProForm.Item>
    </ProForm>
  );
};
export default ACTypeForm;
