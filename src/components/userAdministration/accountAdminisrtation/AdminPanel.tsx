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
import { useGetCompaniesQuery } from '@/features/companyAdministration/companyApi';
interface AdminPanelProps {}
import { Split } from '@geoffcox/react-splitter';
const AdminPanel: React.FC<AdminPanelProps> = ({}) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { data: usersGroup, isLoading } = useGetGroupUsersQuery({});
  const { data: groups } = useGetGroupsUserQuery({});

  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

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
      setEditingUser(null);
    } catch (error) {
      message.error(t('ERROR SAVING USER '));
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
      <Space className="gap-4 pb-3">
        <Col span={20}>
          <Button
            size="small"
            icon={<UserAddOutlined />}
            onClick={handleCreate}
          >
            {t('ADD USER')}
          </Button>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingUser && (
            <Button
              size="small"
              icon={<UserDeleteOutlined />}
              onClick={() =>
                handleDelete(editingUser?.id || editingUser?._id || '')
              }
            >
              {t('DELETE USER')}
            </Button>
          )}
        </Col>
      </Space>

      <div className="  flex gap-4 justify-between">
        <Split initialPrimarySize="25%">
          <div
            // sm={4}
            className=" h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3 "
          >
            <UserTree
              onUserSelect={function (user: User): void {
                setEditingUser(user);
              }}
              usersGroup={usersGroup || []}
            />
          </div>
          <div
            className=" h-[73vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto  "
            // sm={19}
          >
            <UserForm
              user={editingUser || undefined}
              onSubmit={handleSubmit}
              roles={['admin']}
              groups={groups || []}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default AdminPanel;
