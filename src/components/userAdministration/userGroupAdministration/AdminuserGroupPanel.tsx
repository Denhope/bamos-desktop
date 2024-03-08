import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space } from 'antd';
import {
  PlusOutlined,
  UserAddOutlined,
  EditOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';

import { User, UserGroup } from '@/models/IUser';
import { useTranslation } from 'react-i18next';
import UserGroupForm from './UserGroupForm';
import UserGroupTree from './UserGroupTree';
import {
  useAddGroupUserMutation,
  useDeleteGroupUserMutation,
  useGetGroupsUserQuery,
  useUpdateGroupUserMutation,
} from '@/features/userAdministration/userGroupApi';

interface AdminPanelProps {}

const AdminuserGroupPanel: React.FC<AdminPanelProps> = () => {
  const [editingUserGroup, setEditingUserGroup] = useState<UserGroup | null>(
    null
  );

  const { data: usersGroup, isLoading } = useGetGroupsUserQuery({});
  const [addGroupUser] = useAddGroupUserMutation();
  const [updateGroupUser] = useUpdateGroupUserMutation();
  const [deleteGroupUser] = useDeleteGroupUserMutation();

  const handleCreate = () => {
    setEditingUserGroup(null);
  };

  const handleEdit = (userGroup: UserGroup) => {
    setEditingUserGroup(userGroup);
  };

  const handleDelete = async (userGroupId: string) => {
    try {
      await deleteGroupUser(userGroupId).unwrap();
      message.success('Группа пользователей успешно удалена');
    } catch (error) {
      message.error('Ошибка при удалении группы пользователей');
    }
  };

  const handleSubmit = async (userGroup: UserGroup) => {
    try {
      if (editingUserGroup) {
        await updateGroupUser(userGroup).unwrap();
        message.success('Группа пользователей успешно обновлена');
      } else {
        await addGroupUser(userGroup).unwrap();
        message.success('Группа пользователей успешно добавлена');
      }
      setEditingUserGroup(null);
    } catch (error) {
      message.error('Ошибка при сохранении группы пользователей');
    }
  };

  const { t } = useTranslation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Space className="gap-4 py-3">
        <Col span={20}>
          <Button
            size="small"
            icon={<UserAddOutlined />}
            onClick={handleCreate}
          >
            {t('ADD GROUP')}
          </Button>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingUserGroup && (
            <Button
              size="small"
              icon={<UserDeleteOutlined />}
              onClick={() => handleDelete(editingUserGroup.id)}
            >
              {t('DELETE GROUP')}
            </Button>
          )}
        </Col>
      </Space>

      <Row gutter={[16, 16]} className="gap-4">
        <Col
          sm={5}
          className="h-[78vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 "
        >
          <UserGroupTree
            usersGroup={usersGroup || []}
            onUsersGroupSelect={handleEdit}
          />
        </Col>
        <Col
          className="h-[75vh] bg-white px-4 py-3 rounded-md brequierement-gray-400 p-3 "
          sm={18}
        >
          <UserGroupForm
            userGroup={editingUserGroup || undefined}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        </Col>
      </Row>
    </>
  );
};

export default AdminuserGroupPanel;
