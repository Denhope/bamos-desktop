import React, { FC, useEffect } from 'react';
import { ProForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-form';
import { Button, Tabs } from 'antd';

import { IMPD } from '@/models/ITask';
import {
  ProFormGroup,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';

interface UserFormProps {
  taskCode?: IMPD;
  onSubmit: (taskCode: IMPD) => void;
  onDelete?: (taskCodeId: string) => void;
}

const MPDAdministrationForm: FC<UserFormProps> = ({ taskCode, onSubmit }) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const handleSubmit = async (values: IMPD) => {
    const newUser: IMPD = taskCode
      ? { ...taskCode, ...values }
      : { ...values, companyID: localStorage.getItem('companyID') || '' };
    onSubmit(newUser);
  };
  useEffect(() => {
    if (taskCode) {
      form.resetFields();
      form.setFieldsValue(taskCode);
    } else {
      form.resetFields();
    }
  }, [taskCode, form]);
  return (
    <ProForm
      size="small"
      form={form}
      onFinish={handleSubmit}
      // submitter={false}
      initialValues={taskCode}
      layout="horizontal"
    >
      <ProForm.Group>
        <ProForm.Group>
          <ProFormText
            width={'sm'}
            name="code"
            label="TITLE"
            rules={[
              {
                required: true,
              },
            ]}
          />
          <ProFormTextArea
            width={'lg'}
            fieldProps={{
              style: {
                resize: 'none',
              },
              rows: 3,
              // This is the correct way to set colSize within fieldProps
            }}
            name="description"
            label="DESCRIPTION"
            rules={[
              {
                required: true,
              },
            ]}
          />
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
        </ProForm.Group>
      </ProForm.Group>

      {/* <ProForm.Item>
        <Button type="primary" htmlType="submit">
          {taskCode ? 'Update' : 'Create'}
        </Button>
      </ProForm.Item> */}
    </ProForm>
  );
};
export default MPDAdministrationForm;