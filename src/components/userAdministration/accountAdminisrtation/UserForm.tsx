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

  const permissionsTreeData = Object.values(Permission).map((permission) => ({
    title: getPermissionLabel(permission),
    key: permission,
  }));

  const filteredTreeData = permissionsTreeData.filter((item) =>
    item.title.toLowerCase().includes(searchValue.toLowerCase())
  );

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
                  label={t('Position')}
                  rules={[{ required: true }]}
                />
                <ProFormText
                  width={'sm'}
                  name="organizationAuthorization"
                  label={t('ORGANIZATION AUTHORIZATION')}
                />
                <ProFormText name="login" label={t('LOGIN')} />
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
          <div className="h-[62vh] flex flex-col overflow-auto pb-3">
            {user ? (
              <ProForm.Group>
                <div
                  className="flex flex-col gap-2 flex-grow"
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
