import {
  ProForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { ConfigProvider, FormInstance, message } from "antd";
import React, { FC, useRef } from "react";

import {
  getFilteredAditionalTask,
  getFilteredProjectTask,
} from "@/utils/api/thunks";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { setCurrentActionIndexMtb } from "@/store/reducers/MtbSlice";
import { useTranslation } from "react-i18next";
type WOFilterFormType = { onFilterWO: (record: any) => void };
const WOFilterForm: FC<WOFilterFormType> = ({ onFilterWO }) => {
  const dispatch = useAppDispatch();
  const formRef = useRef<FormInstance>(null);
  const { t } = useTranslation();
  const currentProject = {}; // Замените на ваш текущий проект
  const companyID = localStorage.getItem("name") || ""; // Замените на ваш companyID
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  return (
    <ProForm
      size="small"
      formRef={formRef}
      onFinish={async (values) => {
        const result = dispatch(
          getFilteredProjectTask({
            workOrderNbr: values.wo,
          })
        );
        if ((await result).meta.requestStatus === "fulfilled") {
          onFilterWO((await result).payload[0]);
          dispatch(setCurrentActionIndexMtb(0));
        } else {
          message.error("NO ITEMS");
        }
        console.log(values);
        if (values.type === "NRC") {
          const result = dispatch(
            getFilteredAditionalTask({
              companyID: companyID,
              workOrderNbr: values.wo,
            })
          );
          if ((await result).meta.requestStatus === "fulfilled") {
            onFilterWO((await result).payload[0]);
          } else {
            message.error("NO ITEMS");
          }
        } else if (values.type === "PLANEDWORK") {
          const result = dispatch(
            getFilteredProjectTask({
              workOrderNbr: values.wo,
            })
          );
          if ((await result).meta.requestStatus === "fulfilled") {
            onFilterWO((await result).payload[0]);
            dispatch(setCurrentActionIndexMtb(0));
          } else {
            message.error("NO ITEMS");
          }
        }
      }}
    >
      <ProFormText
        name="wo"
        label={`${t("WORKORDER No")}`}
        width="sm"
        tooltip="WO Number"
        rules={[{ required: true }]}
        fieldProps={{
          onKeyPress: handleKeyPress,
          autoFocus: true,
        }}
      />

      {/* <ProFormSelect
        name="type"
        label={`${t('WO TYPE')}`}
        width="sm"
        tooltip="WO TYPE"
        rules={[{ required: true }]}
        showSearch
        valueEnum={{
          NRC: 'NRC',
          PLANEDWORK: 'PLANED WORK',
        }}
      /> */}
    </ProForm>
  );
};

export default WOFilterForm;
