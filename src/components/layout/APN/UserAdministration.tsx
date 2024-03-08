import { RouteNames } from '@/router';
import { getItem } from '@/services/utilites';
import { Layout, Menu, MenuProps, Tabs, message } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import TabPane, { TabPaneProps } from 'antd/es/tabs/TabPane';
import React, { FC, useState } from 'react';
import {
  DatabaseOutlined,
  UserOutlined,
  ControlOutlined,
  GroupOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import AdminPanel from '@/components/userAdministration/accountAdminisrtation/AdminPanel';
import {
  useGetUserQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetGroupUsersQuery,
  userApi,
} from '@/features/userAdministration/userApi';
import {
  useAddGroupUserMutation,
  useGetGroupsUserQuery,
} from '@/features/userAdministration/userGroupApi';
import { IUser, User, UserGroup } from '@/models/IUser';
import AdminuserGroupPanel from '@/components/userAdministration/userGroupAdministration/AdminuserGroupPanel';

import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
export const selectUserGroups = (state: RootState) => state.userGroup;
const UserAdministration: FC = () => {
  const [userId, seuserId] = useState<string>('');
  const { data, isLoading } = useGetUserQuery(userId);
  const { data: groupUsers, isLoading: isGettingUser } = useGetGroupUsersQuery(
    {}
  );
  const [addUser, { isLoading: isAddingUser }] = useAddUserMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();

  const { data: groups, refetch: refetchGroups } = useGetGroupsUserQuery({});
  const userGroups = useTypedSelector((state) => state.userGroup);

  const onAddUser = async (newUserData: Partial<User>) => {
    try {
      const result = await addUser(newUserData).unwrap();

      message.success('Пользователь успешно создан');
    } catch (error) {
      message.error('ERROR');
    }
  };

  const onEditUser = async (updatedUserData: User) => {
    try {
      const result = await updateUser(updatedUserData).unwrap();
    } catch (error) {}
  };

  // const onDeleteUser = async (userId: string) => {
  //   try {
  //     const result = await deleteUser(userId).unwrap();
  //   } catch (error) {
  //     // Handle the error
  //   }
  // };
  type MenuItem = Required<MenuProps>['items'][number];
  interface TabData extends TabPaneProps {
    key: string;
    title: string;
    content: React.ReactNode;
  }
  const { t } = useTranslation();
  const items: MenuItem[] = [
    getItem(
      <>{t('USER ADMINISTRATION')}</>,
      RouteNames.USER_ADMINISTRATION,
      <UserSwitchOutlined />
    ),
    getItem(<>{t('ACCOUNTS')}</>, RouteNames.USER_ACCOUNTS, <UserOutlined />),
    getItem(<>{t('ROLES')}</>, RouteNames.USER_ROLES, <ControlOutlined />),
    getItem(<>{t('Groups')}</>, RouteNames.USER_GROUPS, <GroupOutlined />),

    getItem(
      <>{t('PERMISSIONS')}</>,
      RouteNames.USER_PERMISSIONS,
      <DatabaseOutlined />
    ),
  ];
  const [collapsed, setCollapsed] = useState(false);
  const [panes, setPanes] = useState<TabData[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');
  const onEdit = (
    targetKey:
      | string
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>,
    action: 'add' | 'remove'
  ) => {
    if (typeof targetKey === 'string') {
      if (action === 'remove') {
        const newPanes = panes.filter((pane) => pane.key !== targetKey);
        setPanes(newPanes);
        if (newPanes.length > 0) {
          setActiveKey(newPanes[newPanes.length - 1].key);
        }
      }
    } else {
      // Обработка события мыши или клавиатуры
    }
  };
  const onMenuClick = ({ key }: { key: string }) => {
    if (key === RouteNames.USER_GROUPS) {
      const tab = {
        key,
        title: `${t('GROUPS')}`,
        content: (
          <div>
            <AdminuserGroupPanel />
          </div>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.USER_PERMISSIONS) {
      const tab = {
        key,
        title: `${t('PERMISSIONS')}`,
        content: <></>,
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.USER_ROLES) {
      const tab = {
        key,
        title: `${t('ROLES')}`,
        content: <></>,
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.USER_ACCOUNTS) {
      const tab = {
        key,
        title: `${t('ACCOUNTS')}`,
        content: (
          <>
            <AdminPanel
              usersGroup={groupUsers || []}
              onUserCreate={function (user: User): void {
                console.log(user);
                onAddUser(user);
              }}
              onUserUpdate={function (user: User): void {
                console.log(user);
              }}
              onUserDelete={function (userId: string): void {
                console.log(userId);
              }}
            />
          </>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
  };

  return (
    <Layout>
      <Sider
        className="h-[85vh] overflow-hidden"
        theme="light"
        width={250}
        collapsible
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        <Menu theme="light" mode="inline" items={items} onClick={onMenuClick} />
      </Sider>
      <Content>
        <Tabs
          style={{
            width: '98%',
          }}
          className="mx-auto"
          size="small"
          hideAdd
          onChange={setActiveKey}
          activeKey={activeKey}
          type="editable-card"
          onEdit={onEdit}
        >
          {panes.map((pane) => (
            <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
              {pane.content}
            </TabPane>
          ))}
        </Tabs>
      </Content>
    </Layout>
  );
};

export default UserAdministration;
