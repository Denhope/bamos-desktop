import React, { FC, useEffect } from 'react';
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

  return (
    <ProForm
      form={form}
      onFinish={handleSubmit}
      submitter={false}
      layout="horizontal"
    >
      <Tabs defaultActiveKey="1" type="card">
        <Tabs.TabPane tab="MAIN" key="1">
          <ProForm.Group>
            <ProForm.Group>
              <ProFormText
                width={'sm'}
                name="firstNameEnglish"
                label="First Name (English)"
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
                label="Last Name (English)"
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
                label="First Name"
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
                label="Last Name"
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
                label="Role"
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
                label="Group"
                options={groupOptions}
                rules={[{ required: true }]}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormText
                name="login"
                label="Login"
                // rules={[
                //   { required: true, message: 'Please enter your login' },
                //   { type: 'email', message: 'Please enter a valid login' },
                // ]}
              />
              <ProFormText
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              />
              {!user && (
                <ProForm.Group>
                  <ProFormText.Password
                    name="password"
                    label="Password"
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
                label="Pass"
                rules={[
                  { required: true, message: 'Please enter your pass' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              />
            </ProForm.Group>

            <ProFormText
              name="phoneNumber"
              label="Phone Number"
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
              label="Telegram ID"
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
              label="Employee ID"
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
      <ProForm.Item>
        <Button type="primary" htmlType="submit">
          {user ? 'Update' : 'Create'}
        </Button>
      </ProForm.Item>
    </ProForm>
  );
};
export default UserForm;
