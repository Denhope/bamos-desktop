import { Drawer, DrawerProps } from 'antd';
import React, { FC, useState } from 'react';
import FIlteredTaskForm from './FIlteredTaskForm';

interface TaskFilteredFormProps {
  open: boolean;
  setOpen: (open: any) => void;
}
const TaskFilteredForm: FC<TaskFilteredFormProps> = ({
  open,

  setOpen,
}) => {
  return (
    <Drawer
      placement="left"
      size={'default'}
      onClose={() => {
        setOpen(false);
      }}
      open={open}
      title={'Filtered Form'}
    >
      <div className="my-0 py-0">
        {/* <FIlteredTaskForm></FIlteredTaskForm> */}
      </div>
    </Drawer>
  );
};

export default TaskFilteredForm;
