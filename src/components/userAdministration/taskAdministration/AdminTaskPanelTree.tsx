import React, { FC, useState, useEffect, useMemo } from 'react';
import { Tree, Input } from 'antd';
import type { DataNode } from 'antd/lib/tree';
// Убедитесь, что вы импортировали правильный тип task
import CustomTree from '../zoneCodeAdministration/CustomTree';
import { ITask } from '@/models/ITask';

interface TreeDataNode extends DataNode {
  task?: ITask;
}

interface UserTreeProps {
  onTaskSelect: (task: ITask) => void;
  tasks: ITask[] | [];
}

const { Search } = Input;

const AdminTaskPanelTree: FC<UserTreeProps> = ({ onTaskSelect, tasks }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const convertToTreeData = (tasks: ITask[]): TreeDataNode[] => {
    return tasks.map((task) => ({
      title: String(task.taskNumber).toUpperCase(),
      key: task.id,
      task: task,
    }));
  };

  useEffect(() => {
    setTreeData(convertToTreeData(tasks));
  }, [tasks]);

  const filteredTreeData = useMemo(() => {
    if (!searchQuery) {
      return treeData;
    }
    return treeData.filter((node) => {
      if (typeof node.title === 'string') {
        return node.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false;
    });
  }, [treeData, searchQuery]);

  const handleEnterPress = () => {
    if (filteredTreeData.length === 0) return;

    if (selectedIndex === -1) {
      setSelectedIndex(0);
    } else {
      setSelectedIndex(
        (prevIndex) => (prevIndex + 1) % filteredTreeData.length
      );
    }

    const selectedGroup = filteredTreeData[selectedIndex].task;
    if (selectedGroup) {
      onTaskSelect(selectedGroup);
    }
  };

  return (
    <div className="flex flex-col gap-2 ">
      <Search
        size="small"
        allowClear
        onSearch={(value) => {
          setSearchQuery(value);
          handleEnterPress();
        }}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 8 }}
        enterButton
        onPressEnter={handleEnterPress}
      />

      <CustomTree
        checkable={false}
        treeData={filteredTreeData}
        onSelect={(selectedKeys, info) => {
          const task = tasks.find((task) => task.id === selectedKeys[0]);
          if (task) {
            onTaskSelect(task);
          }
        }}
        height={660}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default AdminTaskPanelTree;
