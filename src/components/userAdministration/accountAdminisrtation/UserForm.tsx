import React, { FC, useEffect, useState } from 'react';
import { ProForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-form';
import { Button, Empty, Input, Tabs, Tree } from 'antd';
import { User, UserGroup } from '@/models/IUser';
import { ProFormSelect } from '@ant-design/pro-components';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { useTranslation } from 'react-i18next';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';

interface UserFormProps {
  user?: User;
  onSubmit: (user: User) => void;
  roles: string[];
  groups: UserGroup[];
  skilss: any;
}
const { Search } = Input;
const UserForm: FC<UserFormProps> = ({
  user,
  onSubmit,
  groups,
  roles,
  skilss,
}) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const handleSubmit = async (values: User) => {
    const newUser: User = user
      ? { ...user, ...values, permissions: checkedKeys }
      : {
          ...values,
          permissions: checkedKeys,
          companyID: localStorage.getItem('companyID') || '',
        };
    onSubmit(newUser);
  };
  // enum Permission {
  //   USER_ACTIONS = 'USER_ACTIONS',
  //   ADD_NRC = 'ADD_NRC',
  //   WO_ACTIONS = 'WO_ACTIONS',
  //   PROJECT_TASK_ACTIONS = 'PROJECT_TASK_ACTIONS',
  //   EDIT_PROJECT_TASK = 'EDIT_PROJECT_TASK',
  //   WP_ACTIONS = 'WP_ACTIONS',
  //   REOPEN_TASK = 'REOPEN_TASK',
  //   DELETE_REQUIREMENT = 'DELETE_REQUIREMENT',
  //   REQUIREMENT_ACTIONS = 'REQUIREMENT_ACTIONS',
  //   DELETE_ORDER = 'DELETE_ORDER',
  //   ORDER_ACTIONS = 'ORDER_ACTIONS',
  //   ORDER_VIEWER = 'ORDER_VIEWER',
  //   PRINT_REPORT_TABLE = 'PRINT_REPORT_TABLE',
  //   PRINT_REPORT_WP = 'PRINT_REPORT_WP',
  //   PRINT_REPORT_MATERIAL = 'PRINT_REPORT_MATERIAL',
  //   PRINT_REPORT_EXPIRY = 'PRINT_REPORT_EXPIRY',
  //   COPY_ROWS = 'COPY_ROWS',
  //   EXPORT = 'EXPORT',
  //   ADD_PART_NUMBER = 'ADD_PART_NUMBER',
  //   DELETE_PART_NUMBER = 'DELETE_PART_NUMBER',
  //   ADD_ALTERNATIVE = 'ADD_ALTERNATIVE',
  //   DELETE_ALTERNATIVE = 'DELETE_ALTERNATIVE',
  //   TASK_ACTIONS = 'TASK_ACTIONS',
  //   PERMISSIONS_ACTIONS = 'PERMISSIONS_ACTIONS',
  //   PICKSLIP_CONFIRMATION_ACTIONS = 'PICKSLIP_CONFIRMATION_ACTIONS',
  //   PART_TRANSFER_ACTIONS = 'PART_TRANSFER_ACTIONS',
  //   PART_EDIT_ACTIONS = 'PART_EDIT_ACTIONS',
  //   VENDORS_ACTIONS = 'VENDORS_ACTIONS',
  //   AC_ACTIONS = 'AC_ACTIONS',
  //   SKILL_ACTIONS = 'SKILL_ACTIONS',
  //   COMPANY_ACTIONS = 'COMPANY_ACTIONS',
  //   // Добавьте другие разрешения, если нужно
  // }
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

  const groupSlills = skilss?.map((skill: any) => ({
    label: skill?.code,
    value: skill?.id, // Use the _id as the value
  }));
  const SubmitButton = () => (
    <PermissionGuard
      requiredPermissions={
        [
          // Permission.USER_ACTIONS,
          // Permission.PERMISSIONS_ACTIONS,
        ]
      }
    >
      <Button type="primary" htmlType="submit">
        {user ? t('UPDATE') : t('CREATE')}
      </Button>
    </PermissionGuard>
  );
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const [checkedKeys, setCheckedKeys] = useState<any>([]);
  // Обработчик изменения активной вкладки
  const handleTabChange = (activeKey: string) => {
    setShowSubmitButton(activeKey === '1');
  };
  const handleCheck = (checkedKeys: any) => {
    setCheckedKeys(checkedKeys);
  };
  const handleSearch = (e: any) => {
    setSearchValue(e.target.value);
  };
  const getPermissionLabel = (permission: Permission) => {
    return t(permission);
  };
  const permissionsTreeData = Object.values(Permission).map((permission) => ({
    title: getPermissionLabel(permission),
    key: permission,
  }));

  const filteredTreeData = permissionsTreeData.filter((item) =>
    item.title.toLowerCase().includes(searchValue.toLowerCase())
  );
  useEffect(() => {
    if (user && user.permissions) {
      setCheckedKeys(user.permissions);
    }
  }, [user]);
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
        <Tabs.TabPane tab={t('MAIN')} key="1">
          <div className=" h-[62vh] flex flex-col overflow-auto pb-3">
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
                  width={'md'}
                  name="role"
                  label={t('ROLE')}
                  options={[
                    { value: 'admin', label: t('ADMIN') },
                    { value: 'engineer', label: t('ENGINEER') },
                    { value: 'planning', label: t('PLANNING') },
                    { value: 'technican', label: t('TECHNICAN') },
                    { value: 'storeMan', label: t('STOREMAN') },
                    { value: 'logistic', label: t('LOGISTIC') },
                  ]}
                />
                <ProFormSelect
                  name="userGroupID"
                  label={t('GROUP')}
                  options={groupOptions}
                  rules={[{ required: true }]}
                />{' '}
                <ProFormSelect
                  name="skillID"
                  label={t('SKILL')}
                  options={groupSlills}
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
                        {
                          required: true,
                          message: 'Please enter your password',
                        },
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
                    {
                      min: 6,
                      message: 'Password must be at least 6 characters',
                    },
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
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('PERMISSIONS')} key="2">
          <div className="h-[62vh] flex flex-col overflow-auto pb-3">
            {user ? (
              <ProForm.Group>
                <div
                  className=" flex flex-col gap-2  flex-grow "
                  style={{ width: 800 }}
                >
                  <Search
                    size="small"
                    allowClear
                    onChange={handleSearch}
                    style={{ marginBottom: 8, width: '100%' }}
                  />
                  <Tree
                    showLine
                    height={540}
                    checkedKeys={checkedKeys}
                    checkable
                    treeData={filteredTreeData}
                    onCheck={handleCheck}
                    defaultExpandAll
                    style={{ width: '100%' }}
                    // style={
                    //   { '--tree-selected-bg': 'orange' } as React.CSSProperties
                    // } // Изменяем цвет выделения
                  />
                </div>
              </ProForm.Group>
            ) : (
              <Empty></Empty>
            )}
          </div>
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
