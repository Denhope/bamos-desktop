import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';

import { UserGroup } from '@/models/IUser';
import { useTranslation } from 'react-i18next';
import UserGroupForm from './UserGroupForm';
import UserGroupTree from './UserGroupTree';
import {
  useAddGroupUserMutation,
  useDeleteGroupUserMutation,
  useGetGroupsUserQuery,
  useUpdateGroupUserMutation,
} from '@/features/userAdministration/userGroupApi';
import { Split } from '@geoffcox/react-splitter';

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
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS GROUP?'),
      onOk: async () => {
        try {
          await deleteGroupUser(userGroupId).unwrap();
          message.success(t('USER GROUP SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING USER GROUP'));
        }
      },
    });
  };

  const handleSubmit = async (userGroup: UserGroup) => {
    try {
      if (editingUserGroup) {
        await updateGroupUser(userGroup).unwrap();
        message.success(t('USER GROUP SUCCESSFULLY UPDATED'));
      } else {
        await addGroupUser(userGroup).unwrap();
        message.success(t('USER GROUP SUCCESSFULLY ADDED'));
      }
      setEditingUserGroup(null);
    } catch (error) {
      message.error(t('ERROR SAVING USER GROUP'));
    }
  };

  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div>
        <Spin />
      </div>
    );
  }
  return (
    <>
      <Space className="gap-6 pb-3">
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

      <div className="  flex gap-4 justify-between">
        <Split initialPrimarySize="20%" splitterSize="20px">
          <div className="h-[82vh] bg-white px-4 rounded-md border-gray-400 p-3 ">
            <UserGroupTree
              usersGroup={usersGroup || []}
              onUsersGroupSelect={handleEdit}
            />
          </div>
          <div className="h-[82vh] bg-white px-4 rounded-md brequierement-gray-400 p-3  overflow-y-auto ">
            <UserGroupForm
              userGroup={editingUserGroup || undefined}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default AdminuserGroupPanel;
