import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';
import UserForm from './UserForm';
import { User, UserGroup } from '@/models/IUser';
import { useTranslation } from 'react-i18next';
import UserTree from './UserTree';
import {
  useAddUserMutation,
  useDeleteUserMutation,
  useGetGroupUsersQuery,
  useUpdateUserMutation,
} from '@/features/userAdministration/userApi';
import { useGetGroupsUserQuery } from '@/features/userAdministration/userGroupApi';
import { useGetSkillsQuery } from '@/features/userAdministration/skillApi';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import { Split } from '@geoffcox/react-splitter';
import { uploadFileServerReference } from '@/utils/api/thunks';

interface AdminPanelProps {}

const AdminPanel: React.FC<AdminPanelProps> = ({}) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { data: usersGroup, isLoading } = useGetGroupUsersQuery({});
  const { data: groups } = useGetGroupsUserQuery({});
  const { data: usersSkill } = useGetSkillsQuery({});
  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const { t } = useTranslation();

  const handleCreate = () => {
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: 'ARE YOU SURE, YOU WANT TO DELETE THIS USER?',
      onOk: async () => {
        try {
          await deleteUser(userId);
          message.success(t('USER  SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING USER '));
        }
      },
    });
  };

  const handleSubmit = async (user: User) => {
    try {
      if (editingUser) {
        await updateUser(user).unwrap();
        message.success(t('USER  SUCCESSFULLY UPDATED'));
      } else {
        await addUser({
          ...user,
          name: `${user.firstName} ${user.lastName}`,
        }).unwrap();
        message.success(t('USER  SUCCESSFULLY ADDED'));
      }
    } catch (error) {
      message.error(t('ERROR SAVING USER '));
    }
  };

  const handleUploadReference = async (data: any) => {
    if (!editingUser || !editingUser.id) {
      console.error('Невозможно загрузить файл');
      return;
    }

    const formData = new FormData();

    formData.append('file', data?.file);
    formData.append('referenceType', data?.referenceType);
    formData.append('onSavedReference', 'true');
    formData.append('fileName', data.file.name);
    formData.append('companyID', localStorage.getItem('companyID') || '');
    formData.append('createDate', new Date().toISOString());
    formData.append('createUserID', localStorage.getItem('userID') || '');

    try {
      const response = await uploadFileServerReference(formData);
      message.success(t('File uploaded successfully'));
    } catch (error) {
      message.error(t('Error File uploaded.'));
    }
  };

  if (isLoading) {
    return (
      <div>
        <Spin />
      </div>
    );
  }

  return (
    <>
      <Space className="gap-4 pb-3">
        <Col span={20}>
          <PermissionGuard requiredPermissions={[Permission.USER_ACTIONS]}>
            <Button
              size="small"
              icon={<UserAddOutlined />}
              onClick={handleCreate}
            >
              {t('ADD USER')}
            </Button>
          </PermissionGuard>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingUser && (
            <PermissionGuard requiredPermissions={[Permission.USER_ACTIONS]}>
              <Button
                size="small"
                icon={<UserDeleteOutlined />}
                onClick={() =>
                  handleDelete(editingUser?.id || editingUser?._id || '')
                }
              >
                {t('DELETE USER')}
              </Button>
            </PermissionGuard>
          )}
        </Col>
      </Space>

      <div className="flex gap-4 justify-between">
        <Split initialPrimarySize="25%" splitterSize="20px">
          <div className="h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3">
            <UserTree onUserSelect={handleEdit} usersGroup={usersGroup || []} />
          </div>
          <div className="h-[73vh] bg-white px-4 rounded-md border-gray-400 p-3 overflow-y-auto">
            <UserForm
              user={editingUser || undefined}
              onSubmit={handleSubmit}
              roles={['admin']}
              groups={groups || []}
              skills={usersSkill}
              handleUploadReference={handleUploadReference}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default AdminPanel;
