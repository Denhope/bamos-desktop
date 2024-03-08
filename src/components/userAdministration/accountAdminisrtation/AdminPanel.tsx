import React, { useState } from 'react';
import { Button, Row, Col, Modal, message } from 'antd';
import {
  PlusOutlined,
  UserAddOutlined,
  EditOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import UserForm from './UserForm';
import { User, UserGroup } from '@/models/IUser';
import { useTranslation } from 'react-i18next';
import UserTree from './UserTree';
interface AdminPanelProps {
  usersGroup: UserGroup[] | [];
  onUserCreate: (user: User) => void;
  onUserUpdate: (user: User) => void;
  onUserDelete: (userId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  usersGroup,
  onUserCreate,
  onUserUpdate,
  onUserDelete,
}) => {
  // const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleCreate = () => {
    setEditingUser(null);
    // setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    // setModalVisible(true);
  };

  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить этого пользователя?',
      onOk: () => {
        onUserDelete(userId);
        message.success('Пользователь успешно удален');
      },
    });
  };

  const handleSubmit = (user: User) => {
    if (editingUser) {
      onUserUpdate(user);
    } else {
      onUserCreate(user);
    }
    // setModalVisible(false);
  };
  const { t } = useTranslation();

  return (
    <>
      <Button size="small" icon={<UserAddOutlined />} onClick={handleCreate}>
        {t('ADD USER')}
      </Button>
      <Row gutter={[16, 16]} className="gap-4">
        <Col
          sm={5}
          className="h-[78vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 "
        >
          <UserTree
            onUserSelect={function (user: User): void {
              setEditingUser(user);
              console.log(user);
            }}
            usersGroup={usersGroup}
          />
        </Col>
        <Col
          className="h-[75vh] bg-white px-4 py-3 rounded-md brequierement-gray-400 p-3 "
          sm={18}
        >
          <UserForm
            user={editingUser || undefined}
            onSubmit={handleSubmit}
            roles={['admin']}
            groups={[]}
          />
        </Col>
      </Row>
    </>
  );
};

export default AdminPanel;
