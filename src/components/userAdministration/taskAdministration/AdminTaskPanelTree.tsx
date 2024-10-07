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
  isLoading?: boolean;
  onCheckItems: (items: any[]) => void;
}

const { Search } = Input;

const AdminTaskPanelTree: FC<UserTreeProps> = ({
  onTaskSelect,
  tasks,
  isLoading,
  onCheckItems,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const convertToTreeData = (tasks: ITask[]): TreeDataNode[] => {
    return tasks.map((task) => ({
      title: `№:${String(task.taskNumber).toUpperCase()}/${String(
        task.taskDescription
      ).toUpperCase()}
      
      /${
        String(
          // (task?.partNumber && task?.partNumber) ||
          task?.partNumberID && task?.partNumberID?.PART_NUMBER
        ).toUpperCase() || ''
      }
      `,
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
        isLoading={isLoading}
        checkable={true}
        isAllChecked={true}
        treeData={filteredTreeData}
        onSelect={(selectedKeys, info) => {
          const task = tasks.find((task) => task.id === selectedKeys[0]);
          if (task) {
            onTaskSelect(task);
          }
        }}
        height={640}
        onCheckItems={onCheckItems}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default AdminTaskPanelTree;
