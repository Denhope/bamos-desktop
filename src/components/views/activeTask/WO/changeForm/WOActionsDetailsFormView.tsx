import { Button, Form, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";
import ActiveActionForm from "@/components/views/activeTask/NRC/changeForm/actions/NRCActiveActionForm";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IActionType, addAction } from "@/store/reducers/AdditionalTaskSlice";

import ActionDescriptionList from "@/components/views/activeTask/NRC/changeForm/actions/NRCActionDescriptionList ";
import WOActiveActionForm from "./actions/WOActiveActionForm";
import WOActionDescriptionList from "./actions/WOActionDescriptionList ";

export interface IActionDetailsFormProps {
  onFinish?: () => void;
  data: IActionType[];
}
const resetValues = () => {
  toast.success("Действие добавлено");
};
const ActionDetailsFormView: FC<IActionDetailsFormProps> = ({
  onFinish,
  data,
}) => {
  const { currentProjectTask } = useTypedSelector((state) => state.projectTask);
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();

  return (
    <div className="flex justify-center w-full flex-col gap-3">
      <WOActionDescriptionList data={data} />
      {currentProjectTask.actions && currentProjectTask.currentAction && (
        <WOActiveActionForm />
      )}

      {/* <Button
        // onClick={onFinish}
        // type="primary"
        // htmlType="submit"
        style={{ marginTop: 16 }}
      >
        Дальше
      </Button> */}
    </div>
  );
};

export default ActionDetailsFormView;
