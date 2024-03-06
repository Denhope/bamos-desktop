import React, { FC, useEffect, useState } from 'react';
import { Tree, Typography, Input, Button } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { User, UserGroup } from '@/models/IUser';
import { faker } from '@faker-js/faker';

interface TreeDataNode extends DataNode {
  user?: User;
}
interface UserTreeProps {
  onUserSelect: (user: User) => void;
}
const { TreeNode } = Tree;
const UserTree: FC<UserTreeProps> = ({ onUserSelect }) => {
  // const groups: UserGroup[] = [
  //   {
  //     id: 'group1',
  //     title: 'Group 1 Title',
  //     description: 'Group 1 Description',
  //     createDate: '2022-01-01T00:00:00.000Z',
  //     createByID: 'user1',
  //     updateDate: '2022-01-01T00:00:00.000Z',
  //     updateByID: 'user1',
  //     users: [
  //       {
  //         _id: 'user1',
  //         id: '1',
  //         firstName: 'John',
  //         lastName: 'Doe',
  //         englishFirstName: 'John',
  //         englishLastName: 'Doe',
  //         email: 'john.doe@example.com',
  //         phoneNumber: '1234567890',
  //         telegramId: 'johndoe',
  //         role: 'Admin',
  //         workshopNumber: '1',
  //         companyID: 'company1',
  //         telegramID: 'johndoe',
  //         pass: 'password1',
  //       },
  //       {
  //         _id: 'user2',
  //         id: '2',
  //         firstName: 'Jane',
  //         lastName: 'Doe',
  //         englishFirstName: 'Jane',
  //         englishLastName: 'Doe',
  //         email: 'jane.doe@example.com',
  //         phoneNumber: '0987654321',
  //         telegramId: 'janedoe',
  //         role: 'User',
  //         workshopNumber: '2',
  //         companyID: 'company1',
  //         telegramID: 'janedoe',
  //         pass: 'password2',
  //       },
  //       // Добавьте других пользователей, если нужно
  //     ],
  //   },
  //   // Добавьте другие группы, если нужно
  // ];

  const generateUser = (): User => {
    return {
      _id: faker.datatype.uuid(),
      id: faker.datatype.uuid(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      englishFirstName: faker.name.firstName(),
      englishLastName: faker.name.lastName(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.number(),
      telegramId: faker.internet.userName(),
      role: faker.helpers.arrayElement(['Admin', 'User', 'Guest']),
      workshopNumber: faker.datatype.number({ min: 1, max: 100 }).toString(),
      companyID: faker.datatype.uuid(),
      telegramID: faker.internet.userName(),
      password: faker.internet.password(),
      pass: faker.internet.password(),
    };
  };

  const generateUserGroup = (groupId: number): UserGroup => {
    const userCount = faker.datatype.number({ min: 1, max: 10 }); // Random number of users for each group
    const users: User[] = Array.from({ length: userCount }, () =>
      generateUser()
    );

    return {
      id: `group${groupId}`,
      title: `Group ${groupId} Title`,
      description: `Group ${groupId} Description`,
      createDate: faker.date.past().toISOString(),
      createByID: faker.datatype.uuid(),
      updateDate: faker.date.recent().toISOString(),
      updateByID: faker.datatype.uuid(),
      users: users,
    };
  };

  const generateGroups = (groupCount: number): UserGroup[] => {
    return Array.from({ length: groupCount }, (_, index) =>
      generateUserGroup(index + 1)
    );
  };

  const groups: UserGroup[] = generateGroups(15);

  const { Search } = Input;
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [lastFoundIndex, setLastFoundIndex] = useState(-1);

  useEffect(() => {
    setTreeData(renderTreeNodes(groups));
  }, []);
  const renderTreeNodes = (data: UserGroup[]): TreeDataNode[] => {
    return data.map((group) => ({
      title: group.title,
      key: group.id,
      children: group.users?.map((user) => ({
        title: `${user.firstName} ${user.lastName}`,
        key: user.id,
        user: user,
      })),
    }));
  };

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    const user: User = info.selectedNodes[0].user;
    setSelectedUser(user);
    onUserSelect(user);
  };

  const onExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setLastFoundIndex(-1); // Reset the last found index
    // const filteredTreeData = searchTree(treeData, value);
    // setTreeData(filteredTreeData);
  };

  const searchTree = (nodes: TreeDataNode[], term: string): TreeDataNode[] => {
    return nodes.map((node) => {
      let filteredChildren = node.children;
      if (term) {
        filteredChildren = node.children?.filter((child) => {
          // Check if child.title is a string before calling toLowerCase
          return (
            typeof child.title === 'string' &&
            child.title.toLowerCase().includes(term.toLowerCase())
          );
        });
      }
      return { ...node, children: filteredChildren };
    });
  };

  const handleEnterKey = (event: any) => {
    if (event.key === 'Enter') {
      // Find the next matching user
      const nextMatchingUser = findFirstMatchingUser(
        treeData,
        searchTerm,
        lastFoundIndex + 1
      );
      if (nextMatchingUser) {
        setSelectedUser(nextMatchingUser);
        onUserSelect(nextMatchingUser);
      }
    }
  };

  const findFirstMatchingUser = (
    nodes: any[],
    term: string,
    startIndex: number = 0
  ): User | null => {
    let foundIndex = -1;
    for (let i = startIndex; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.children) {
        for (let j = 0; j < node.children.length; j++) {
          const child = node.children[j];
          if (
            child.title &&
            typeof child.title === 'string' &&
            child.title.toLowerCase().includes(term.toLowerCase()) &&
            child.user
          ) {
            foundIndex = i;
            setLastFoundIndex(foundIndex); // Update the last found index
            return child.user;
          }
        }
        const userInChildren = findFirstMatchingUser(node.children, term, 0);
        if (userInChildren) {
          return userInChildren;
        }
      }
    }
    return null;
  };

  const renderTree = (nodes: any[]) => {
    return nodes.map((node) => {
      if (node.children) {
        return (
          <TreeNode title={node.title} key={node.key}>
            {renderTree(node.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...node} />;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}
      >
        <Search
          placeholder="Search users"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          enterButton="Search"
          style={{ marginRight: '10px' }}
          onKeyDown={handleEnterKey}
        />
      </div>
      <div style={{ flex: 1 }}>
        <Tree
          showLine
          height={690}
          onSelect={onSelect}
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          defaultExpandAll
        >
          {renderTree(treeData)}
        </Tree>
      </div>
    </div>
  );
};

export default UserTree;
