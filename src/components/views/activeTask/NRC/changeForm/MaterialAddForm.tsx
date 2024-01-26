import { Button, Empty, Form, Input, Modal, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import Paragraph from "antd/es/typography/Paragraph";

import Title from "antd/es/typography/Title";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { addMaterials } from "@/store/reducers/AdditionalTaskSlice";
import { setInitialMaterial } from "@/store/reducers/MaterialStoreSlice";
import {
  featchFilteredNRCProject,
  featchFilteredTasksByProjectId,
  fetchSameMaterials,
  updateAdditionalTask,
} from "@/utils/api/thunks";
export interface IMaterialAddFormProps {
  onFinish?: () => void;
}
const MaterialAddForm: FC<IMaterialAddFormProps> = ({ onFinish }) => {
  const dispatch = useAppDispatch();
  const { searchedAllItemsQuantity, searchedSameItemsQuantity, isLoading } =
    useTypedSelector((state) => state.materialStore);
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );

  const [form] = Form.useForm();
  // const resetValues = () => {
  //   toast.success('Материалы добавлены');
  // };
  const [inputSearchValue, setSerchedText] = useState("");
  const [searchIsVisible, setSearchIsVisible] = useState(false);
  const columnsMatStore: ColumnsType<any> = [
    {
      title: "P/N",
      dataIndex: "PART_NUMBER",
      key: "PART_NUMBER",
      responsive: ["sm"],
      render: (record) => {
        return <Paragraph copyable>{record}</Paragraph>;
      },
    },
    {
      title: "Партия",
      dataIndex: "BATCH",
      key: "BATCH",
      responsive: ["sm"],
    },
    {
      title: "S/N",
      dataIndex: "BATCH_ID",
      key: "BATCH_ID",
      responsive: ["sm"],
    },

    {
      title: <p className="text- my-0 py-0">Наим.</p>,
      dataIndex: "NAME_OF_MATERIAL",
      key: "NAME_OF_MATERIAL",
      responsive: ["sm"],
    },
    {
      title: "Кол-во",
      dataIndex: "QUANTITY",
      key: "QUANTITY",
      responsive: ["sm"],
    },
    {
      title: "Бронь",
      dataIndex: "RESERVATION",
      key: "RESERVATION",
      responsive: ["sm"],
    },
    {
      title: "Ед. Измер.",
      dataIndex: "UNIT_OF_MEASURE",
      key: "UNIT_OF_MEASURE",
      responsive: ["sm"],
    },
    {
      title: "Склад",
      dataIndex: "STOCK",
      key: "STOCK",
      responsive: ["sm"],
    },
  ];

  return (
    <div className="flex flex-col justify-center w-full">
      <>
        <Form.Item>
          <Title level={5}>
            Part Request / Необходимые компоненты, оборудование
          </Title>
          <Input.Search
            defaultValue={""}
            allowClear
            placeholder="Для поиска введите значение"
            onSearch={(value) => {
              value.length > 0 && setSearchIsVisible(true);
              dispatch(fetchSameMaterials(value.trim()));
            }}
            onChange={(e) => {
              setSerchedText(e.target.value.trim());
              dispatch(fetchSameMaterials(inputSearchValue.trim()));
            }}
          />
        </Form.Item>

        <Modal
          title="Просмотр наличия на складе"
          visible={searchIsVisible}
          okText="Применить"
          cancelText="Отмена"
          footer={null}
          onCancel={() => {
            setSearchIsVisible(false);
            dispatch(setInitialMaterial([]));
            setSerchedText("");
          }}
          onOk={() => {
            setSearchIsVisible(false);
            dispatch(setInitialMaterial([]));

            setSerchedText("");
          }}
          width={"60%"}
        >
          <Input.Search
            defaultValue={""}
            allowClear
            placeholder="Для поиска введите значение"
            onSearch={(value) => {
              value.length > 0 && setSearchIsVisible(true);
              dispatch(fetchSameMaterials(inputSearchValue.trim()));
            }}
            onChange={(e) => {
              setSerchedText(e.target.value.trim());
              // dispatch(fetchSameMaterials(inputSearchValue.trim()));
            }}
          />
          {/* </Form.Item> */}
          <Table
            size="small"
            scroll={{ y: "calc(60vh)" }}
            rowClassName="cursor-pointer  text-xs text-transform: uppercase"
            dataSource={isLoading ? [] : searchedSameItemsQuantity}
            locale={{
              emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
            }}
            columns={columnsMatStore}
          ></Table>
        </Modal>
      </>
      <Form
        form={form}
        className="w-full"
        autoComplete="off"
        onFinish={async (values) => {
          dispatch(
            addMaterials({
              ...values,
              id: currentAdditionalTask.material.length + 1,
            })
          );
          const result = await dispatch(
            updateAdditionalTask({
              ...currentAdditionalTask,
              id: currentAdditionalTask._id || currentAdditionalTask.id,
              _id: currentAdditionalTask._id || currentAdditionalTask.id,

              material: [
                ...currentAdditionalTask.material,
                {
                  id: currentAdditionalTask.material.length + 1,
                  PN: String(values.PN).toLocaleUpperCase().trim(),
                  nameOfMaterial: String(values.nameOfMaterial)
                    .toUpperCase()
                    .trim(),
                  amout: values.amout,
                  unit: String(values.unit).toUpperCase().trim(),
                },
              ],
            })
          );
          if (result.meta.requestStatus === "fulfilled") {
            dispatch(
              featchFilteredNRCProject({
                projectId: currentAdditionalTask.projectId || "",
              })
            );
            form.resetFields();
            toast.success("Материалы добавлены");
          }
        }}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
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
        <Toaster position="top-center" reverseOrder={false} />
      </Form>
    </div>
  );
};

export default MaterialAddForm;
