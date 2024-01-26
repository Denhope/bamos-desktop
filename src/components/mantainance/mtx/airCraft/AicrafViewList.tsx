import { Drawer, DrawerProps } from 'antd';
import React, { FC, useState } from 'react';

interface AicraftListProps {
  open: boolean;
  setOpen: (open: any) => void;
  taskNumber: any;
}
const AicraftViewList: FC<AicraftListProps> = ({
  open,
  taskNumber,
  setOpen,
}) => {
  return (
    <Drawer
      placement="right"
      size={'large'}
      onClose={() => {
        setOpen(false);
      }}
      open={open}
      title={taskNumber}
    >
      <div className=""></div>
    </Drawer>
  );
};

export default AicraftViewList;
