import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IACType, IMaintenanceType } from '@/models/AC';
import {
  ProForm,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Tabs } from 'antd';
import { v4 as uuidv4 } from 'uuid';

interface IACTypeFormProps {
  acType: IACType | undefined;
  maintenanceType?: IMaintenanceType | null;
  onSubmit: (acType: IMaintenanceType) => void;
  // onDelete?: (acTypeId: string) => void;
}

const MaintenanceTypeForm: FC<IACTypeFormProps> = ({
  onSubmit,
  maintenanceType,
  acType,
}) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();

  const handleSubmit = async (values: IMaintenanceType) => {
    console.log('Значения формы:', values); // Отладка: проверьте значения формы
    const newMaintenanceType: IMaintenanceType = maintenanceType
      ? { ...maintenanceType, ...values }
      : { ...values, id: uuidv4() };
    onSubmit(newMaintenanceType);
    form.resetFields();
  };

  useEffect(() => {
    form.resetFields();
    if (maintenanceType) {
      form.setFieldsValue(maintenanceType);
    } else form.resetFields();
  }, [maintenanceType, acType]);
  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {maintenanceType ? t('UPDATE') : t('CREATE')}
    </Button>
  );
  return (
    <div className="bg-white  p-2">
      <ProForm<IMaintenanceType>
        size="small"
        form={form}
        onFinish={handleSubmit}
        // submitter={false}
        layout="horizontal"
      >
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
              width={'xl'}
              name="name"
              label="TITLE"
              rules={[
                {
                  required: true,
                },
              ]}
            />
            <ProFormTextArea
              fieldProps={{
                style: {
                  resize: 'none',
                },
                rows: 10,
              }}
              width={'lg'}
              name="description"
              label="DESCRIPTION"
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
        {/* </Tabs.TabPane>
        </Tabs> */}
        {/* <ProForm.Item>
          <Button type="primary" htmlType="submit">
            {maintenanceType ? 'Update' : 'Create'}
          </Button>
        </ProForm.Item> */}
      </ProForm>
    </div>
  );
};

export default MaintenanceTypeForm;
