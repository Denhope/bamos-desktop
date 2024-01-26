import { Drawer, DrawerProps } from 'antd';
import React, { FC, useState } from 'react';
import AddForm from './AddForm';

interface AicraftAddFormProps {
  open: boolean;
  setOpen: (open: any) => void;
}
const AicrafAddForm: FC<AicraftAddFormProps> = ({
  open,

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
      title="ADD New A/C"
    >
      <div className="">
        <AddForm></AddForm>
      </div>
    </Drawer>
  );
};

export default AicrafAddForm;
