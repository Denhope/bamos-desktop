import React, { FC, useEffect } from 'react';
import { ProForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-form';
import { Button, Tabs } from 'antd';
import { User, Permission, UserGroup } from '@/models/IUser';
import { ProFormSelect } from '@ant-design/pro-components';

interface UserFormProps {
  userGroup?: UserGroup;
  onSubmit: (userGroup: UserGroup) => void;
  onDelete?: (userGroupId: string) => void;
}

const UserGroupForm: FC<UserFormProps> = ({ userGroup, onSubmit }) => {
  const [form] = ProForm.useForm();
  const handleSubmit = async (values: UserGroup) => {
    const newUser: UserGroup = userGroup
      ? { ...userGroup, ...values }
      : { ...values, companyID: localStorage.getItem('companyID') || '' };
    onSubmit(newUser);
  };
  useEffect(() => {
    if (userGroup) {
      form.setFieldsValue(userGroup);
    } else {
      form.resetFields();
    }
  }, [userGroup, form]);
  return (
    <ProForm
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={false}
      initialValues={userGroup}
      layout="horizontal"
    >
      <Tabs defaultActiveKey="1" type="card">
        <Tabs.TabPane tab="MAIN" key="1">
          <ProForm.Group>
            <ProForm.Group>
              <ProFormText
                width={'sm'}
                name="title"
                label="TITLE"
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
              <ProFormText
                width={'lg'}
                name="description"
                label="DESCRIPTION"
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            </ProForm.Group>
          </ProForm.Group>
        </Tabs.TabPane>
      </Tabs>
      <ProForm.Item>
        <Button type="primary" htmlType="submit">
          {userGroup ? 'Update' : 'Create'}
        </Button>
      </ProForm.Item>
    </ProForm>
  );
};
export default UserGroupForm;
