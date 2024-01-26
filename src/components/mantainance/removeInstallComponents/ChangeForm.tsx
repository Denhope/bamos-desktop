import { Form, Input, Button } from "antd";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { IRemovedItemResponce } from "@/models/IRemovedItem";
import React, { FC, useEffect } from "react";
import toast from "react-hot-toast";
import { updateremovedItem, getAllRemovedItems } from "@/utils/api/thunks";
type RemovedItemPropsType = {
  currentRemoveditem: IRemovedItemResponce;
  isLoading: boolean;
};
const ChangeForm: FC<RemovedItemPropsType> = ({
  currentRemoveditem,
  isLoading,
}) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  useEffect(() => {}, []);
  return (
    <div>
      <Form
        form={form}
        className="w-full"
        autoComplete="off"
        onFinish={async (values) => {
          const result = await dispatch(
            updateremovedItem({
              ...currentRemoveditem,
              _id: currentRemoveditem?._id || currentRemoveditem?._id,

              installDate: String(values.installDate).trim(),

              removeDate: values.removeDate.trim(),

              reference: values.reference,

              removeItemNumber: values.removeItemNumber.trim(),
              position: values.position.trim(),
              removeItemName: values.removeItemName.trim(),
              zone: values.zone.trim(),
              area: values.area.trim(),
              description: values.description.trim(),
            })
          );
          if (result.meta.requestStatus === "fulfilled") {
            toast.success("Информация добавлена");
            // setOpen(false);
            form.resetFields();
            dispatch(getAllRemovedItems());
          } else if (result.meta.requestStatus === "rejected") {
            toast.error("Информация не добавлена");
          }
        }}
      >
        <Form.Item
          // rules={[{ required: true }]}
          label="PN"
          name="removeItemName"
        >
          <Input defaultValue={currentRemoveditem?.removeItemName} />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          label="Ссылка на работу"
          name="reference"
        >
          <Input defaultValue={currentRemoveditem?.reference || ""} />
        </Form.Item>

        <Form.Item
          // rules={[{ required: true }]}
          label="S/N (при необход.)"
          name="removeItemNumber"
        >
          <Input defaultValue={currentRemoveditem?.removeItemNumber || ""} />
        </Form.Item>
        <Form.Item
          // rules={[{ required: true }]}
          label="Позиция"
          name="position"
        >
          <Input />
        </Form.Item>
        <Form.Item
          // rules={[{ required: true }]}
          label="Описание"
          name="description"
        >
          <Input />
        </Form.Item>
        <Form.Item label="Зона" name="zone">
          <Input />
        </Form.Item>
        <Form.Item label="Область" name="area">
          <Input />
        </Form.Item>
        <Form.Item label="Дата снятия" name="removeDate">
          <Input defaultValue={currentRemoveditem?.removeDate} />
        </Form.Item>

        <Form.Item label="Дата установки" name="installDate">
          <Input defaultValue={currentRemoveditem?.installDate} />
        </Form.Item>

        <Form.Item>
          <Button htmlType="submit">Сохранить</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChangeForm;
