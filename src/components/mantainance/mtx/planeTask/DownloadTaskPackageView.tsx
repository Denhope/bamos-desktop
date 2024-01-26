import { Drawer, DrawerProps } from 'antd';
import React, { FC, useState } from 'react';
import AddTaskPackageform from './AddTaskPackageform';

interface DownloadTaskPackageFormProps {
  open: boolean;
  setOpen: (open: any) => void;
  // task: any;
}
const DownloadTaskPackageView: FC<DownloadTaskPackageFormProps> = ({
  open,
  // task,
  setOpen,
}) => {
  return (
    <Drawer
      placement="right"
      size={'default'}
      onClose={() => {
        setOpen(false);
      }}
      open={open}
      title="Download Package"
    >
      <div className="">
        <AddTaskPackageform></AddTaskPackageform>
      </div>
    </Drawer>
  );
};

export default DownloadTaskPackageView;
