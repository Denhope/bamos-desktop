import React, { FC, useEffect, useState } from 'react';
import { ProForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-form';
import { Button, Tabs } from 'antd';
import { UserGroup } from '@/models/IUser';
import { ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';

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
      form.resetFields();
      form.setFieldsValue(userGroup);
    } else {
      form.resetFields();
    }
  }, [userGroup, form]);
  const { t } = useTranslation();
  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {userGroup ? t('UPDATE') : t('CREATE')}
    </Button>
  );
  const [showSubmitButton, setShowSubmitButton] = useState(true);

  // Обработчик изменения активной вкладки
  const handleTabChange = (activeKey: string) => {
    setShowSubmitButton(activeKey === '1');
  };
  return (
    <ProForm
      size="small"
      form={form}
      onFinish={handleSubmit}
      // submitter={false}
      submitter={{
        render: (_, dom) => {
          if (showSubmitButton) {
            return [<SubmitButton key="submit" />, dom.reverse()[1]];
          }
          return null;
        },
      }}
      initialValues={userGroup}
      layout="horizontal"
    >
      <Tabs defaultActiveKey="1" type="card">
        <Tabs.TabPane tab={t('INFORMATION')} key="1">
          <ProForm.Group>
            <ProForm.Group>
              <ProFormText
                width={'sm'}
                name="title"
                label={t('TITLE')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
              <ProFormTextArea
                width={'lg'}
                name="description"
                label={t('DESCRIPTION')}
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
      {/* <ProForm.Item>
        <Button type="primary" htmlType="submit">
          {userGroup ? 'Update' : 'Create'}
        </Button>
      </ProForm.Item> */}
    </ProForm>
  );
};
export default UserGroupForm;
