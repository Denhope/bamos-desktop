import React, { FC, useEffect, useState } from 'react';
import { ProForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-form';
import { Button, Tabs } from 'antd';
import { User, UserGroup, ISkill } from '@/models/IUser';
import { ProFormSelect } from '@ant-design/pro-components';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { useTranslation } from 'react-i18next';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';

interface UserFormProps {
  user?: ISkill;
  onSubmit: (user: ISkill) => void;
  skills: ISkill[];
}

const SkillForm: FC<UserFormProps> = ({
  user,
  onSubmit,

  skills,
}) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const handleSubmit = async (values: ISkill) => {
    const newUser: ISkill = user
      ? { ...user, ...values }
      : { ...values, companyID: localStorage.getItem('companyID') || '' };
    onSubmit(newUser);
  };
  useEffect(() => {
    if (user) {
      form.resetFields();
      form.setFieldsValue({
        ...user,
        // Set the initial value to the _id of the userGroupID
      });
    } else {
      form.resetFields();
    }
  }, [user, form]);

  const SubmitButton = () => (
    <PermissionGuard requiredPermissions={[Permission.USER_ACTIONS]}>
      <Button type="primary" htmlType="submit">
        {user ? t('UPDATE') : t('CREATE')}
      </Button>
    </PermissionGuard>
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
      submitter={{
        render: (_, dom) => {
          if (showSubmitButton) {
            return [<SubmitButton key="submit" />, dom.reverse()[1]];
          }
          return null;
        },
      }}
      layout="horizontal"
    >
      <Tabs defaultActiveKey="1" type="card" onChange={handleTabChange}>
        <Tabs.TabPane tab={t('MAIN')} key="1">
          <ProForm.Group>
            <ProFormText
              width={'sm'}
              name="code"
              label={t('CODE')}
              rules={[
                {
                  required: true,
                  message: t('PLEASE ENTER YOUR CODE'),
                },
              ]}
            />
            <ProFormText
              width={'lg'}
              name="description"
              label={t('DESCRIPTION')}
              rules={[
                {
                  required: true,
                  message: t('PLEASE ENTER YOUR LAST NAME'),
                },
              ]}
            />
          </ProForm.Group>
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};
export default SkillForm;
