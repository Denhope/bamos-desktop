import {
  ProForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { ConfigProvider, List, Space, message } from "antd";
import React, { FC, useState } from "react";

import {
  getFilteredAditionalTask,
  getFilteredMaterialItems,
  getFilteredProjectTask,
} from "@/utils/api/thunks";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { setCurrentActionIndexMtb } from "@/store/reducers/MtbSlice";

type WOPNSearchFormType = { onSearchPN: (record: any) => void };
const PNSearchForm: FC<WOPNSearchFormType> = ({ onSearchPN }) => {
  const dispatch = useAppDispatch();
  const currentProject = {}; // Замените на ваш текущий проект
  const companyID = localStorage.getItem("companyID"); // Замените на ваш companyID
  const [items, setItems] = useState<any[]>([]);

  return (
    <>
      <ProForm
        onFinish={async (values) => {
          console.log(values);

          const result = dispatch(
            getFilteredMaterialItems({
              PART_NUMBER: values.partNumber,
              companyID: companyID || "",
            })
          );
          if ((await result).meta.requestStatus === "fulfilled") {
            onSearchPN((await result).payload);
            setItems((await result).payload);
          } else {
            message.error("NO ITEMS");
          }
        }}
      >
        <ProFormText
          name="partNumber"
          label="PART NUMBER"
          width="sm"
          tooltip="PART NUMBER"
          rules={[{ required: true }]}
        />
      </ProForm>
      <List>
        {items &&
          items.map((item: any) => <List.Item key={item._id}></List.Item>)}
      </List>
    </>
  );
};

export default PNSearchForm;
