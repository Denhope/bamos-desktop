import React, { FC, useEffect, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-form';
import { Button, Col, Empty, Row, Space, Tabs } from 'antd';

import { useTranslation } from 'react-i18next';

import { IACType, IMaintenanceType } from '@/models/AC';
import MaintenanceTypeTab from './MaintenanceType/MaintenanceTypeTab';

import TaskCodeFormPanel from '../taskCodeAdministration/TaskCodeFormPanel';
import ZoneCodeFormPanel from '../zoneCodeAdministration/zoneCodeFormPanel';
import MPDAdministrationFormPanel from '../MPDAdministration/MPDAdministrationFormPanel';

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

  // Состояние для контроля видимости кнопки "Сохранить"
  const [showSubmitButton, setShowSubmitButton] = useState(true);

  // Обработчик изменения активной вкладки
  const handleTabChange = (activeKey: string) => {
    setShowSubmitButton(activeKey === '1');
  };
  useEffect(() => {
    if (acType) {
      form.resetFields();
      form.setFieldsValue(acType || {});
    } else {
      form.resetFields();
    }
  }, [acType?.id, form]);
  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {acType ? t('UPDATE') : t('CREATE')}
    </Button>
  );

  return (
    <ProForm<IACType>
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => {
          if (showSubmitButton) {
            return [<SubmitButton key="submit" />, dom.reverse()[1]];
          }
          return null;
        },
      }}
      // initialValues={vendor || {}}
      layout="horizontal"
    >
      <Tabs defaultActiveKey="1" type="card" onChange={handleTabChange}>
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
          {acType && acType.id ? (
            <MaintenanceTypeTab
              values={undefined}
              acType={acType || undefined}
            />
          ) : (
            <Empty description="No Data" />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="TASK CODES" key="3">
          {acType && acType.id ? (
            <TaskCodeFormPanel acTypeID={acType?.id || ''} />
          ) : (
            <Empty description="No Data" />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="ZONES CODES" key="4">
          {acType && acType.id ? (
            <ZoneCodeFormPanel acTypeId={acType.id} />
          ) : (
            <Empty description="No Data" />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="DOCUMENTATION" key="5">
          {acType && acType.id ? (
            <MPDAdministrationFormPanel acTypeID={acType.id} />
          ) : (
            <Empty description="No Data" />
          )}
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};
export default ACTypeForm;