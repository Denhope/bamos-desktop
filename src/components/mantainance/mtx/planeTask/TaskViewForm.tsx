import { Drawer, DrawerProps } from 'antd';
import React, { FC, useState } from 'react';

interface TaskViewFormProps {
  open: boolean;
  setOpen: (open: any) => void;
  task: any;
}
const TaskViewForm: FC<TaskViewFormProps> = ({ open, task, setOpen }) => {
  return (
    <Drawer
      placement="right"
      size={'large'}
      onClose={() => {
        setOpen(false);
      }}
      open={open}
      title={task.regNbr}
    >
      <div className=""></div>
    </Drawer>
  );
};

export default TaskViewForm;
