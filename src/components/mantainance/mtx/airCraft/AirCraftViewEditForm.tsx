import { Drawer, DrawerProps } from "antd";
import React, { FC, useState } from "react";
import AddForm from "./AddForm";
import { IPlane } from "@/models/IPlane";
import EditForm from "./EditForm";

interface AicrafEditFormProps {
  open: boolean;
  setOpen: (open: any) => void;
  selectedACNumber: any;
}
const AicrafEditForm: FC<AicrafEditFormProps> = ({
  selectedACNumber,
  open,

  setOpen,
}) => {
  return (
    <Drawer
      placement="right"
      size={"large"}
      onClose={() => {
        setOpen(false);
      }}
      open={open}
      title="Edit A/C"
    >
      <div className="">
        <EditForm selectedACNumber={selectedACNumber}></EditForm>
      </div>
    </Drawer>
  );
};

export default AicrafEditForm;
