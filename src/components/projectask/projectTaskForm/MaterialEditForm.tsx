import { Button, Form } from "antd";
import Input from "antd/es/input/Input";
import Title from "antd/es/typography/Title";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC } from "react";
import toast, { Toaster } from "react-hot-toast";
import { addMaterials } from "@/store/reducers/AdditionalTaskSlice";
export interface IMaterialAddFormProps {
  onFinish?: () => void;
}
const MaterialAddForm: FC<IMaterialAddFormProps> = ({ onFinish }) => {
  const dispatch = useAppDispatch();

  const [form] = Form.useForm();
  // const resetValues = () => {
  //   toast.success('Материалы добавлены');
  // };

  return (
    <div className="flex justify-center w-full">
      <Form
        form={form}
        className="w-full"
        autoComplete="off"
        onFinish={(values) => {
          console.log(values);
          form.resetFields();
          toast.success("Материалы добавлены");
        }}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Title level={5}>
          Part Request / Необходимые компоненты, оборудование
        </Title>
        <div className="flex flex-col">
          <Form.Item
            rules={[{ required: true }]}
            name="PN"
            label=" Partnumber / 
Парт. номер"
          >
            <Input />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Description / 
Описание"
            name="nameOfMaterial"
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="QTY / 
Кол-во"
            name="amout"
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Unit / Ед. Измер."
            name="unit"
          >
            <Input></Input>
          </Form.Item>

          <Form.Item>
            <Button
              className=""
              htmlType="submit"
              // onClick={resetValues}
              style={{ marginTop: 16 }}
            >
              New Part Req. / Новый комп./обор.
            </Button>
          </Form.Item>
        </div>

        <Button
          onClick={onFinish}
          type="primary"
          // htmlType="submit"
          style={{ marginTop: 16 }}
        >
          Дальше
        </Button>
      </Form>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default MaterialAddForm;
