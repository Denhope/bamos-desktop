import { ModalForm } from "@ant-design/pro-components";
import TabContent from "@/components/shared/Table/TabContent";
import React, { FC, useState } from "react";
import RemoveItemForm from "./RemoveItemForm";
import InstallItemForm from "./InstallItemForm";
type ChangeFormItemProps = { currentItem: any };
const ChangeFormItem: FC<ChangeFormItemProps> = ({ currentItem }) => {
  return (
    <div>
      <TabContent
        tabs={[
          {
            content: (
              <>
                <RemoveItemForm currentItem={currentItem} />
              </>
            ),
            title: "REMOVE",
          },
          {
            content: (
              <>
                <InstallItemForm currentItem={currentItem} />
              </>
            ),
            title: "INSTALL",
          },
        ]}
      />
    </div>
  );
};

export default ChangeFormItem;
