import React, { FC, useEffect, useState } from 'react';
import { ProForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-form';
import { Button, Tabs } from 'antd';
import { User, Permission, UserGroup } from '@/models/IUser';
import { ProFormSelect } from '@ant-design/pro-components';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { useTranslation } from 'react-i18next';

interface UserFormProps {
  user?: User;
  onSubmit: (user: User) => void;
  roles: string[];
  groups: UserGroup[];
}

const UserForm: FC<UserFormProps> = ({ user, onSubmit, groups, roles }) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const handleSubmit = async (values: User) => {
    const newUser: User = user
      ? { ...user, ...values }
      : { ...values, companyID: localStorage.getItem('companyID') || '' };
    onSubmit(newUser);
  };
  useEffect(() => {
    if (user) {
      form.resetFields();
      form.setFieldsValue({
        ...user,
        userGroupID: user.userGroupID._id, // Set the initial value to the _id of the userGroupID
      });
    } else {
      form.resetFields();
    }
  }, [user, form]);

  const groupOptions = groups.map((group) => ({
    label: group.title,
    value: group.id, // Use the _id as the value
  }));
  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {user ? t('UPDATE') : t('CREATE')}
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
      <Tabs defaultActiveKey="1" type="card">
        <Tabs.TabPane tab="MAIN" key="1">
          <ProForm.Group>
            <ProForm.Group>
              <ProFormText
                width={'sm'}
                name="firstNameEnglish"
                label={t('FIRST NAME (ENGLISH)')}
                rules={[
                  {
                    required: true,
                    message: 'Please enter your first name in English',
                  },
                  {
                    pattern: /^[A-Za-z\s]+$/,
                    message: 'Please enter a valid name in English',
                  },
                ]}
              />
              <ProFormText
                width={'lg'}
                name="lastNameEnglish"
                label={t('LAST NAME (ENGLISH)')}
                rules={[
                  {
                    required: true,
                    message: 'Please enter your last name in English',
                  },
                  {
                    pattern: /^[A-Za-z\s]+$/,
                    message: 'Please enter a valid name in English',
                  },
                ]}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormText
                width={'sm'}
                name="firstName"
                label={t('FIRST NAME')}
                rules={[
                  {
                    required: true,
                    // message: 'Please enter your first name in English',
                  },
                  // {
                  //   pattern: /^[A-Za-z\s]+$/,
                  //   message: 'Please enter a valid name in English',
                  // },
                ]}
              />
              <ProFormText
                width={'lg'}
                name="lastName"
                label={t('LAST NAME')}
                rules={[
                  {
                    required: true,
                    // message: 'Please enter your last name in English',
                  },
                  // {
                  //   pattern: /^[A-Za-z\s]+$/,
                  //   message: 'Please enter a valid name in English',
                  // },
                ]}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormSelect
                name="role"
                label={t('ROLE')}
                options={[
                  { value: 'admin', label: t('ADMIN') },
                  { value: 'engineer', label: t('ENGINEER') },
                  { value: 'technican', label: t('TECHNICAN') },
                  { value: 'storeMan', label: t('STOREMAN') },
                  { value: 'logistic', label: t('LOGISTIC') },
                  { value: 'storeMaan', label: t('STOREMAN') },
                ]}
              />
              <ProFormSelect
                name="userGroupID"
                label={t('GROUP')}
                options={groupOptions}
                rules={[{ required: true }]}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormText
                name="login"
                label={t('LOGIN')}
                // rules={[
                //   { required: true, message: 'Please enter your login' },
                //   { type: 'email', message: 'Please enter a valid login' },
                // ]}
              />
              <ProFormText
                name="email"
                label={t('EMAIL')}
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              />
              {!user && (
                <ProForm.Group>
                  <ProFormText.Password
                    name="password"
                    label={t('PASSWORD')}
                    rules={[
                      { required: true, message: 'Please enter your password' },
                      {
                        min: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    ]}
                  />
                </ProForm.Group>
              )}
              <ProFormText.Password
                name="pass"
                label={t('PASS')}
                rules={[
                  { required: true, message: 'Please enter your pass' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              />
            </ProForm.Group>

            <ProFormText
              name="phoneNumber"
              label={t('PHONE')}
              rules={[
                { required: true, message: 'Please enter your phone number' },
                {
                  pattern:
                    /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
                  message: 'Please enter a valid phone number',
                },
              ]}
            />
            <ProFormText
              name="telegramID"
              label={t('TELEGRAM ID')}
              // rules={[
              //   { required: true, message: 'Please enter your Telegram ID' },
              //   {
              //     pattern: /^@?[A-Za-z0-9_]{5,32}$/,
              //     message: 'Please enter a valid Telegram ID',
              //   },
              // ]}
            />
            <ProFormText
              name="singNumber"
              label={t('EMPLOYEE ID')}

              // rules={[
              //   { required: true, message: 'Please enter your employee ID' },
              //   {
              //     pattern: /^[0-9]{1,10}$/,
              //     message: 'Please enter a valid employee ID',
              //   },
              // ]}
            />
            {/* <ProFormText
              name="workshopNumber"
              label="Workshop Number"
              rules={[
                { required: true, message: 'Please enter the workshop number' },
                {
                  pattern: /^[0-9]{1,10}$/,
                  message: 'Please enter a valid workshop number',
                },
              ]}
            /> */}
            <ProFormSelect
              rules={[{ required: true }]}
              name="accountStatus"
              label={`${t('USER STATUS')}`}
              width="sm"
              options={[
                { value: 'active', label: t('ACTIVE') },
                { value: 'inactive', label: t('INACTIVE') },
              ]}
            />
          </ProForm.Group>
        </Tabs.TabPane>
        <Tabs.TabPane tab="PERMISSIONS" key="2">
          <ProForm.Group>
            <ProFormCheckbox.Group
              name="permissions"
              layout="vertical"
              options={Object.values(Permission)}
            />
          </ProForm.Group>
        </Tabs.TabPane>
      </Tabs>
      {/* <ProForm.Item>
        <Button type="primary" htmlType="submit">
          {user ? 'Update' : 'Create'}
        </Button>
      </ProForm.Item> */}
    </ProForm>
  );
};
export default UserForm;
