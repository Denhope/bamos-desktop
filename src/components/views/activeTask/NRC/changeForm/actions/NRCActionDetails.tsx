import { Button, Form, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";
import toast, { Toaster } from "react-hot-toast";
import { addAction } from "@/store/reducers/AdditionalTaskSlice";
import ActionDescriptionList from "./NRCActionDescriptionList ";
import ActiveActionForm from "./NRCActiveActionForm";
import JobDescriptionList from "../../../../../projectask/projectTaskForm/JobDescriptionList";
export interface IActionDetailsFormProps {
  onFinish?: () => void;
  data: any;
}

const resetValues = () => {
  toast.success("Действие добавлено");
};
const ActionDetailsForm: FC<IActionDetailsFormProps> = ({ onFinish, data }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );

  return (
    <div className="flex justify-center w-full flex-col gap-3">
      <ActionDescriptionList data={data} />
      {currentAdditionalTask.currentAction && <ActiveActionForm />}

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

export default ActionDetailsForm;
