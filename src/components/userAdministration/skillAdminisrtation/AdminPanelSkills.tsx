import React, { useState } from 'react';
import { Split } from '@geoffcox/react-splitter';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';
import UserForm from './SkillForm';
import { ISkill, User, UserGroup } from '@/models/IUser';
import { useTranslation } from 'react-i18next';
import UserTree from './SkillTree';

import { useGetGroupsUserQuery } from '@/features/userAdministration/userGroupApi';
import { useGetCompaniesQuery } from '@/features/companyAdministration/companyApi';
import {
  useAddSkillMutation,
  useDeleteSkillMutation,
  useGetSkillsQuery,
  useUpdateSkillMutation,
} from '@/features/userAdministration/skillApi';
import SkillForm from './SkillForm';
import SkillTree from './SkillTree';
interface AdminPanelProps {}

const AdminPanelSkills: React.FC<AdminPanelProps> = ({}) => {
  const [editingUser, setEditingUser] = useState<ISkill | null>(null);
  const { data: usersGroup, isLoading } = useGetSkillsQuery({});

  const [addUser] = useAddSkillMutation();
  const [updateUser] = useUpdateSkillMutation();
  const [deleteUser] = useDeleteSkillMutation();

  const handleCreate = () => {
    setEditingUser(null);
  };

  const handleEdit = (user: ISkill) => {
    setEditingUser(user);
  };

  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: 'ARE YOU SURE, YOU WANT TO DELETE THIS SKILL?',
      onOk: async () => {
        try {
          await deleteUser(userId);
          message.success(t('SKILL  SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING USER '));
        }
      },
    });
  };

  const handleSubmit = async (skill: ISkill) => {
    try {
      if (editingUser) {
        await updateUser(skill).unwrap();
        message.success(t('USER  SUCCESSFULLY UPDATED'));
      } else {
        await addUser({
          skill: skill,
        }).unwrap();
        message.success(t('USER  SUCCESSFULLY ADDED'));
      }
      setEditingUser(null);
    } catch (error) {
      message.error(t('ERROR SAVING SKILL '));
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
            {t('ADD SKILL')}
          </Button>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {editingUser && (
            <Button
              size="small"
              icon={<UserDeleteOutlined />}
              onClick={() =>
                handleDelete(editingUser?.id || editingUser?.id || '')
              }
            >
              {t('DELETE SKILL')}
            </Button>
          )}
        </Col>
      </Space>

      <div className="  flex gap-4 justify-between">
        <Split initialPrimarySize="20%" splitterSize="20px">
          <div
            // sm={4}
            className="h-[78vh] bg-white px-4 rounded-md border-gray-400 p-3 "
          >
            <SkillTree
              onSkillSelect={function (user: ISkill): void {
                setEditingUser(user);
              }}
              skills={usersGroup || []}
            />
          </div>
          <div
            className=" h-[73vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto  "
            // sm={19}
          >
            <SkillForm
              skills={usersGroup || []}
              user={editingUser || undefined}
              onSubmit={handleSubmit}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default AdminPanelSkills;
