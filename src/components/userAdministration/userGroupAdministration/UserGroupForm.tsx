import React, { FC, useEffect, useState } from 'react';
import { ProForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-form';
import { Button, Empty, Tabs, Tree, Input, Tooltip, Typography } from 'antd';
import { UserGroup } from '@/models/IUser';
import { ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';
import { Permission } from '@/components/auth/PermissionGuard';

const { Text } = Typography;

interface UserGroupFormProps {
  userGroup?: UserGroup;
  onSubmit: (userGroup: UserGroup) => void;
  onDelete?: (userGroupId: string) => void;
}

const { Search } = Input;

const UserGroupForm: FC<UserGroupFormProps> = ({ userGroup, onSubmit }) => {
  const [form] = ProForm.useForm();
  const handleSubmit = async (values: UserGroup) => {
    const newUser: UserGroup = userGroup
      ? { ...userGroup, ...values, permissions: checkedKeys }
      : {
          ...values,
          permissions: checkedKeys,
          companyID: localStorage.getItem('companyID') || '',
        };
    onSubmit(newUser);
  };
  const [searchValue, setSearchValue] = useState('');
  const handleSearch = (e: any) => {
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    if (userGroup && userGroup.permissions) {
      setCheckedKeys(userGroup.permissions);
    }
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
  const getPermissionLabel = (permission: Permission) => {
    return t(permission);
  };
  const permissionsTreeData = Object.values(Permission).map((permission) => ({
    title: getPermissionLabel(permission),
    key: permission,
  }));
  const [checkedKeys, setCheckedKeys] = useState<any>([]);
  const handleCheck = (checkedKeys: any) => {
    setCheckedKeys(checkedKeys);
  };

  const renderTreeTitle = (node: any) => {
    if (userGroup && userGroup.permissions.includes(node.key)) {
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

  const filteredTreeData = permissionsTreeData.filter((item) =>
    item.title.toLowerCase().includes(searchValue.toLowerCase())
  );
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
        <Tabs.TabPane tab={t('PERMISSIONS')} key="2">
          <div className="h-[62vh] flex flex-col overflow-auto pb-3">
            {userGroup ? (
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
      {/* <ProForm.Item>
        <Button type="primary" htmlType="submit">
          {userGroup ? 'Update' : 'Create'}
        </Button>
      </ProForm.Item> */}
    </ProForm>
  );
};
export default UserGroupForm;
