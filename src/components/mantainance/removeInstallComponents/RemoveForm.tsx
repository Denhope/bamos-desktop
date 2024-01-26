import { Form, Input, Button } from "antd";
import form from "antd/es/form";
import Title from "antd/es/skeleton/Title";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { IRemovedItemResponce } from "@/models/IRemovedItem";
import moment from "moment";
import React, { FC, useEffect } from "react";
import toast from "react-hot-toast";
import { updateremovedItem, getAllRemovedItems } from "@/utils/api/thunks";

type RemovedItemPropsType = {
  currentRemoveditem: IRemovedItemResponce;
  isLoading: boolean;
};

const RemoveForm: FC<RemovedItemPropsType> = (
  {
    // currentRemoveditem,
    // isLoading,
  }
) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const { isLoading, currentRemoveditem } = useTypedSelector(
    (state) => state.removedItems
  );
  useEffect(() => {}, [currentRemoveditem?._id || currentRemoveditem?.id]);
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
              // removeItemName: values.removeItemName,
              removeMan: {
                removedSing: values.removeSing.trim(),
                removeName: values.removeMan.trim(),
              },
              // removeItemNumber: values.installItemNumber,
              removeDate: values.removeDate.trim(),
              status: "open",
              removeItemNumber: values.removeItemNumber,
              removeName: values.removeMan.trim(),
              reference: values.reference,
            })
          );
          if (result.meta.requestStatus === "fulfilled") {
            toast.success("Информация добавлена");
            // setOpen(false);
            dispatch(getAllRemovedItems());
          } else if (result.meta.requestStatus === "rejected") {
            toast.error("Информация не добавлена");
          }
        }}
      >
        {/* <Title level={5}>Снятие {currentRemoveditem?.removeItemName}</Title> */}

        <Form.Item
          rules={[{ required: true }]}
          label="Ссылка на работу"
          name="reference"
        >
          <Input
            disabled={
              currentRemoveditem?.status && currentRemoveditem?.status == "open"
            }
            defaultValue={currentRemoveditem?.reference || ""}
          />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          label="Дата снятия"
          name="removeDate"
        >
          <Input
            disabled={
              currentRemoveditem?.status && currentRemoveditem?.status == "open"
            }
            defaultValue={
              currentRemoveditem?.removeDate ||
              moment.utc().format("Do. MMM. YYYY")
            }
          />
        </Form.Item>
        <Form.Item
          // rules={[{ required: true }]}
          label="S/N (при необход.)"
          name="removeItemNumber"
        >
          <Input
            disabled={
              currentRemoveditem?.status && currentRemoveditem?.status == "open"
            }
            defaultValue={currentRemoveditem?.removeItemNumber || ""}
          />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          label="Табельный номер"
          name="removeSing"
        >
          <Input
            disabled={
              currentRemoveditem?.status && currentRemoveditem?.status == "open"
            }
            defaultValue={
              currentRemoveditem?.removeMan?.sing ||
              localStorage.getItem("singNumber") ||
              ""
            }
          />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          label="Снял (Имя Фамилия)"
          name="removeMan"
        >
          <Input
            disabled={
              currentRemoveditem?.status && currentRemoveditem?.status == "open"
            }
            defaultValue={
              currentRemoveditem?.installMan?.name ||
              localStorage.getItem("name") ||
              ""
            }
          />
        </Form.Item>
        <Form.Item>
          <Button
            disabled={
              isLoading ||
              (currentRemoveditem?.status &&
                currentRemoveditem?.status == "open")
            }
            htmlType="submit"
          >
            Сохранить
          </Button>
        </Form.Item>

        <></>
      </Form>
    </div>
  );
};

export default RemoveForm;
