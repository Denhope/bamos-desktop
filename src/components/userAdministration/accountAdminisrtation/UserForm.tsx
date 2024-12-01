// @ts-nocheck

import React, { FC, useEffect, useState } from 'react';
import { ProForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-form';
import {
  Button,
  Empty,
  Input,
  Tabs,
  Tree,
  Upload,
  Image,
  UploadProps,
  Tooltip,
  Typography,
} from 'antd';
import { User, UserGroup } from '@/models/IUser';
import { ProFormSelect } from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import { UploadOutlined } from '@ant-design/icons';
import millingCutterImage from '@/assets/logo-electron.svg';
import { UploadChangeParam } from 'antd/es/upload';

interface UserFormProps {
  user?: User;
  onSubmit: (user: User) => void;
  roles: string[];
  groups: UserGroup[];
  skills: any;
  handleUploadReference: (data: any) => void;
}

const { Search } = Input;
const { Text } = Typography;

const UserForm: FC<UserFormProps> = ({
  user,
  onSubmit,
  groups,
  roles,
  skills,
  handleUploadReference,
}) => {
  const [form] = ProForm.useForm();
  const [uploadFile, setUploadFile] = useState<RcFile | null>(null);
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(user?.photoUrl);
  const [fileList, setFileList] = useState<any[]>([]);
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const [checkedKeys, setCheckedKeys] = useState<any>([]);

  const handleSubmit = async (values: User) => {
    const newUser: User = user
      ? { ...user, ...values, permissions: checkedKeys, photoUrl }
      : {
          ...values,
          permissions: checkedKeys,
          companyID: localStorage.getItem('companyID') || '',
          photoUrl,
        };
    onSubmit(newUser);
  };

  useEffect(() => {
    if (user) {
      form.resetFields();
      form.setFieldsValue({
        ...user,
        userGroupID: user.userGroupID._id,
      });
      setPhotoUrl(user.photoUrl);
      if (user.photoUrl) {
        setFileList([{ url: user.photoUrl }]);
      }
    } else {
      form.resetFields();
      setPhotoUrl(undefined);
      setFileList([]);
    }
  }, [user, form]);

  const groupOptions = groups.map((group) => ({
    label: group.title,
    value: group.id,
  }));

  const skillOptions = skills?.map((skill: any) => ({
    label: skill?.code,
    value: skill?.id,
  }));

  const SubmitButton = () => (
    <PermissionGuard requiredPermissions={[]}>
      <Button type="primary" htmlType="submit">
        {user ? t('UPDATE') : t('CREATE')}
      </Button>
    </PermissionGuard>
  );

  const handleTabChange = (activeKey: string) => {
    setShowSubmitButton(activeKey === '1' || activeKey === '2');
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

  const groupPermissions = user?.userGroupID?.permissions || [];

  const disableCheckbox = (node: any) => {
    if (node.children) {
      return node.children.every((child: any) => disableCheckbox(child));
    }
    return groupPermissions.includes(node.key);
  };

  const permissionsTreeData = [
    {
      title: 'User Actions',
      key: 'user-actions',
      children: [
        {
          title: getPermissionLabel(Permission.USER_ACTIONS),
          key: Permission.USER_ACTIONS,
        },
        {
          title: getPermissionLabel(Permission.PERMISSIONS_ACTIONS),
          key: Permission.PERMISSIONS_ACTIONS,
        },
      ],
    },
    {
      title: 'Work Order Actions',
      key: 'wo-actions',
      children: [
        {
          title: getPermissionLabel(Permission.WO_ACTIONS),
          key: Permission.WO_ACTIONS,
        },
        {
          title: getPermissionLabel(Permission.PRINT_AS_ORIGINAL),
          key: Permission.PRINT_AS_ORIGINAL,
        },
      ],
    },
    {
      title: 'Work Package Actions',
      key: 'wp-actions',
      children: [
        {
          title: getPermissionLabel(Permission.WP_ACTIONS),
          key: Permission.WP_ACTIONS,
        },
      ],
    },
    {
      title: 'Project Task Actions',
      key: 'project-task-actions',
      children: [
        {
          title: getPermissionLabel(Permission.PROJECT_TASK_ACTIONS),
          key: Permission.PROJECT_TASK_ACTIONS,
        },
        {
          title: getPermissionLabel(Permission.EDIT_PROJECT_TASK),
          key: Permission.EDIT_PROJECT_TASK,
        },
        {
          title: getPermissionLabel(Permission.REOPEN_TASK),
          key: Permission.REOPEN_TASK,
        },
        {
          title: getPermissionLabel(Permission.ADD_NRC),
          key: Permission.ADD_NRC,
        },
      ],
    },
    {
      title: 'Requirement Actions',
      key: 'requirement-actions',
      children: [
        {
          title: getPermissionLabel(Permission.REQUIREMENT_ACTIONS),
          key: Permission.REQUIREMENT_ACTIONS,
        },
        {
          title: getPermissionLabel(Permission.ADD_REQUIREMENT),
          key: Permission.ADD_REQUIREMENT,
        },
        {
          title: getPermissionLabel(Permission.DELETE_REQUIREMENT),
          key: Permission.DELETE_REQUIREMENT,
        },
      ],
    },
    {
      title: 'Order Actions',
      key: 'order-actions',
      children: [
        {
          title: getPermissionLabel(Permission.ORDER_ACTIONS),
          key: Permission.ORDER_ACTIONS,
        },
        {
          title: getPermissionLabel(Permission.DELETE_ORDER),
          key: Permission.DELETE_ORDER,
        },
        {
          title: getPermissionLabel(Permission.ORDER_VIEWER),
          key: Permission.ORDER_VIEWER,
        },
      ],
    },
    {
      title: 'Pickslip Actions',
      key: 'pickslip-actions',
      children: [
        {
          title: getPermissionLabel(Permission.PICKSLIP_ACTIONS),
          key: Permission.PICKSLIP_ACTIONS,
        },
        {
          title: getPermissionLabel(Permission.PICKSLIP_CONFIRMATION_ACTIONS),
          key: Permission.PICKSLIP_CONFIRMATION_ACTIONS,
        },
        {
          title: getPermissionLabel(Permission.DELETE_PICKSLIP),
          key: Permission.DELETE_PICKSLIP,
        },
      ],
    },
    {
      title: 'Part Number Actions',
      key: 'part-number-actions',
      children: [
        {
          title: getPermissionLabel(Permission.PART_NUMBER_EDIT),
          key: Permission.PART_NUMBER_EDIT,
        },
        {
          title: getPermissionLabel(Permission.DELETE_PART_NUMBER),
          key: Permission.DELETE_PART_NUMBER,
        },
        {
          title: getPermissionLabel(Permission.ADD_ALTERNATIVE),
          key: Permission.ADD_ALTERNATIVE,
        },
        {
          title: getPermissionLabel(Permission.DELETE_ALTERNATIVE),
          key: Permission.DELETE_ALTERNATIVE,
        },
      ],
    },
    {
      title: 'Part Actions',
      key: 'part-actions',
      children: [
        {
          title: getPermissionLabel(Permission.PART_TRANSFER_ACTIONS),
          key: Permission.PART_TRANSFER_ACTIONS,
        },
        {
          title: getPermissionLabel(Permission.PART_EDIT_ACTIONS),
          key: Permission.PART_EDIT_ACTIONS,
        },
      ],
    },
    {
      title: 'Task Actions',
      key: 'task-actions',
      children: [
        {
          title: getPermissionLabel(Permission.TASK_ACTIONS),
          key: Permission.TASK_ACTIONS,
        },
      ],
    },
    {
      title: 'Report Actions',
      key: 'report-actions',
      children: [
        {
          title: getPermissionLabel(Permission.PRINT_REPORT_TABLE),
          key: Permission.PRINT_REPORT_TABLE,
        },
        {
          title: getPermissionLabel(Permission.PRINT_REPORT_WP),
          key: Permission.PRINT_REPORT_WP,
        },
        {
          title: getPermissionLabel(Permission.PRINT_REPORT_MATERIAL),
          key: Permission.PRINT_REPORT_MATERIAL,
        },
        {
          title: getPermissionLabel(Permission.PRINT_REPORT_EXPIRY),
          key: Permission.PRINT_REPORT_EXPIRY,
        },
      ],
    },
    {
      title: 'Other Actions',
      key: 'other-actions',
      children: [
        {
          title: getPermissionLabel(Permission.COPY_ROWS),
          key: Permission.COPY_ROWS,
        },
        {
          title: getPermissionLabel(Permission.EXPORT),
          key: Permission.EXPORT,
        },
      ],
    },
    {
      title: 'Vendor Actions',
      key: 'vendor-actions',
      children: [
        {
          title: getPermissionLabel(Permission.VENDORS_ACTIONS),
          key: Permission.VENDORS_ACTIONS,
        },
      ],
    },
    {
      title: 'AC Actions',
      key: 'ac-actions',
      children: [
        {
          title: getPermissionLabel(Permission.AC_ACTIONS),
          key: Permission.AC_ACTIONS,
        },
      ],
    },
    {
      title: 'Skill Actions',
      key: 'skill-actions',
      children: [
        {
          title: getPermissionLabel(Permission.SKILL_ACTIONS),
          key: Permission.SKILL_ACTIONS,
        },
      ],
    },
    {
      title: 'Company Actions',
      key: 'company-actions',
      children: [
        {
          title: getPermissionLabel(Permission.COMPANY_ACTIONS),
          key: Permission.COMPANY_ACTIONS,
        },
      ],
    },
    {
      title: 'Store Actions',
      key: 'store-actions',
      children: [
        {
          title: getPermissionLabel(Permission.STORE_ACTIONS),
          key: Permission.STORE_ACTIONS,
        },
        {
          title: getPermissionLabel(Permission.STORE_DELETE_ACTIONS),
          key: Permission.STORE_DELETE_ACTIONS,
        },
      ],
    },
    {
      title: 'Access Actions',
      key: 'access-actions',
      children: [
        {
          title: getPermissionLabel(Permission.ADD_ACCESS),
          key: Permission.ADD_ACCESS,
        },
        {
          title: getPermissionLabel(Permission.CLOSE_ACCESS),
          key: Permission.CLOSE_ACCESS,
        },
        {
          title: getPermissionLabel(Permission.OPEN_ACCESS),
          key: Permission.OPEN_ACCESS,
        },
        {
          title: getPermissionLabel(Permission.INSPECT_ACCESS),
          key: Permission.INSPECT_ACCESS,
        },
      ],
    },
    {
      title: 'Critical Task Actions',
      key: 'critical-task-actions',
      children: [
        {
          title: getPermissionLabel(Permission.CLOSE_CRITICAL_TASK),
          key: Permission.CLOSE_CRITICAL_TASK,
        },
      ],
    },
    {
      title: 'Action Actions',
      key: 'action-actions',
      children: [
        {
          title: getPermissionLabel(Permission.ADD_ACTION),
          key: Permission.ADD_ACTION,
        },
        {
          title: getPermissionLabel(Permission.DELETE_ACTION),
          key: Permission.DELETE_ACTION,
        },
        {
          title: getPermissionLabel(Permission.EDIT_ACTION),
          key: Permission.EDIT_ACTION,
        },
      ],
    },
    {
      title: 'Step Actions',
      key: 'step-actions',
      children: [
        {
          title: getPermissionLabel(Permission.ADD_STEP),
          key: Permission.ADD_STEP,
        },
        {
          title: getPermissionLabel(Permission.DELETE_STEP),
          key: Permission.DELETE_STEP,
        },
        {
          title: getPermissionLabel(Permission.EDIT_STEP),
          key: Permission.EDIT_STEP,
        },
      ],
    },
    {
      title: 'Print Actions',
      key: 'print-actions',
      children: [
        {
          title: getPermissionLabel(Permission.PRINT_TAG),
          key: Permission.PRINT_TAG,
        },
        {
          title: getPermissionLabel(Permission.PRINT_LABEL),
          key: Permission.PRINT_LABEL,
        },
        {
          title: getPermissionLabel(Permission.PRINT_TASK_CARD),
          key: Permission.PRINT_TASK_CARD,
        },
      ],
    },
    {
      title: 'Parts Modification',
      key: 'parts-modification',
      children: [
        {
          title: getPermissionLabel(Permission.PartsModification),
          key: Permission.PartsModification,
        },
      ],
    },
  ];

  const filteredTreeData = permissionsTreeData
    .map((group) => ({
      ...group,
      children: group.children.filter((permission) =>
        permission.title.toLowerCase().includes(searchValue.toLowerCase())
      ),
    }))
    .filter((group) => group.children.length > 0)
    .map((group) => ({
      ...group,
      disableCheckbox: disableCheckbox(group),
      children: group.children.map((permission) => ({
        ...permission,
        disableCheckbox: disableCheckbox(permission),
      })),
    }));

  const renderTreeTitle = (node: any) => {
    if (node.disableCheckbox) {
      return (
        <Tooltip
          title={t(
            'This permission is inherited from the group and cannot be modified'
          )}
        >
          <Text disabled>{node.title}</Text>
        </Tooltip>
      );
    }
    return (
      <Tooltip title={t(`Permissions.${node.key}.description`)}>
        <Text>{node.title}</Text>
      </Tooltip>
    );
  };

  useEffect(() => {
    if (user && user.permissions) {
      setCheckedKeys([...user.permissions, ...user?.userGroupID?.permissions]);
    }
  }, [user]);

  const handlePhotoUpload = (info: any) => {
    if (info.file.status === 'done') {
      setPhotoUrl(info.file.response.url);
      setFileList([info.file]);
      handleUploadReference({
        file: info.file,
        // Добавьте другие необходимые данные
      });
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      setUploadFile(file);
      return false;
    },
    onChange: (info: UploadChangeParam) => {
      if (info.file.status === 'removed') {
        setUploadFile(null);
      } else if (info.file.status === 'done') {
        handlePhotoUpload(info);
      }
    },
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
        <Tabs.TabPane tab={t('INFORMATION')} key="1">
          <div className="h-[62vh] flex flex-col overflow-auto pb-3">
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
                  rules={[{ required: true }]}
                />
                <ProFormText
                  width={'lg'}
                  name="lastName"
                  label={t('LAST NAME')}
                  rules={[{ required: true }]}
                />
              </ProForm.Group>
              <ProForm.Group>
                <ProFormSelect
                  width={'md'}
                  name="role"
                  label={t('ROLE')}
                  rules={[{ required: true }]}
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
                />
                <ProFormSelect
                  name="skillID"
                  label={t('SKILL')}
                  options={skillOptions}
                  rules={[{ required: true }]}
                />
              </ProForm.Group>
              <ProForm.Group>
                <ProFormText
                  width={'lg'}
                  name="position"
                  label={t('POSITION')}
                  rules={[{ required: true }]}
                />
                <ProFormText
                  width={'sm'}
                  name="organizationAuthorization"
                  label={t('ORGANIZATION AUTHORIZATION')}
                />
                <ProFormText
                  width={'sm'}
                  rules={[{ required: true }]}
                  name="login"
                  label={t('LOGIN')}
                />
                <ProFormText
                  width={'sm'}
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
                      width={'sm'}
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
                  width={'sm'}
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
              <ProFormText name="telegramID" label={t('TELEGRAM ID')} />
              <ProFormText name="singNumber" label={t('EMPLOYEE ID')} />
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
              <ProForm.Item label={t('PHOTO')}>
                <div className="flex flex-col px-3">
                  {millingCutterImage && (
                    <Image
                      src={millingCutterImage}
                      alt="User"
                      className="w-full h-auto"
                      width={200}
                      height={200}
                    />
                  )}
                  <Upload
                    {...uploadProps}
                    fileList={uploadFile ? [uploadFile] : []}
                  >
                    <Button icon={<UploadOutlined />}>
                      {t('Select File')}
                    </Button>
                  </Upload>
                </div>
              </ProForm.Item>
            </ProForm.Group>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('PERMISSIONS')} key="2">
          <div className="h-full flex flex-col overflow-auto pb-3">
            {user ? (
              <ProForm.Group>
                <div className="flex flex-col gap-2 w-full">
                  <Search
                    size="small"
                    allowClear
                    onChange={(e) => handleSearch(e.target.value)}
                    className="mb-2 w-full"
                    style={{ width: 750 }}
                  />
                  <Tree
                    showLine
                    height={540}
                    checkable
                    defaultExpandAll
                    style={{ width: '100%', height: '100%' }}
                    treeData={filteredTreeData}
                    onCheck={handleCheck}
                    checkedKeys={checkedKeys}
                    titleRender={renderTreeTitle}
                  />
                </div>
              </ProForm.Group>
            ) : (
              <Empty></Empty>
            )}
          </div>
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};

export default UserForm;
