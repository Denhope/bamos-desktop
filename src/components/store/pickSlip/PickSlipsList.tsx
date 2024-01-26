import {
  Button,
  Empty,
  Modal,
  Skeleton,
  Checkbox,
  Form,
  Input,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  PlusOutlined,
  PrinterOutlined,
} from "@ant-design/icons";

import Table, { ColumnsType } from "antd/es/table";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useState } from "react";
import {} from "@/store/reducers/ProjectTaskSlise";

import { setCurrentMaterialAplication } from "@/store/reducers/MatirialAplicationsSlise";
import moment from "moment";
import {
  getAllPickSlips,
  updateAfterIssued,
  updatePickSlip,
} from "@/utils/api/thunks";
import toast, { Toaster } from "react-hot-toast";
import { IMatData1 } from "@/types/TypesData";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { IPickSlipResponse } from "@/models/IPickSlip";
import PickSlipCard from "./PickSlipCard";
import { setCurrentPickSlip } from "@/store/reducers/PickSlipSlice";
import { IMaterialStoreRequestItem } from "@/models/IMaterialStoreItem";

type PickSlipsPropsType = {
  data: IPickSlipResponse[];
};
const PickSlipList: FC<PickSlipsPropsType> = ({ data }) => {
  const [checked, setChecked] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [disabled, setDisabled] = useState(false);
  const [searchedText, setSerchedText] = useState("");
  const label = `Подтверждаю выдачу материалов согласно расходного требования`;
  const [searchedStatus, setSerchedStatus] = useState("");
  const dispatch = useAppDispatch();
  const [openInformation, setOpenInformation] = useState(false);
  const { isLoading, currentPickSlip } = useTypedSelector(
    (state) => state.pickSlips
  );
  const [form] = Form.useForm();

  const onChange = (e: CheckboxChangeEvent) => {
    setChecked(e.target.checked);
  };

  const columns: ColumnsType<IPickSlipResponse> = [
    {
      title: "Номер требования",
      dataIndex: "pickSlipNumber",
      key: "pickSlipNumber",
      responsive: ["sm"],
      filteredValue: [searchedText],
      onFilter: (value: any, record: any) => {
        return (
          String(record?.pickSlipNumber).includes(value) ||
          String(record.pickSlipNumber)
            ?.toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.materialAplicationId.projectWO)
            ?.toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.materialAplicationId.projectTaskWO)
            ?.toLowerCase()
            .includes(value.toLowerCase())
        );
      },
      sorter: (a: any, b: any) => a.pickSlipNumber - b.pickSlipNumber,
    },
    {
      title: "Внутренний W/O",
      dataIndex: ["materialAplicationId", "projectWO"],
      key: "projectWO",
      responsive: ["sm"],
    },
    {
      title: "Номер карты",

      dataIndex: ["materialAplicationId", "projectTaskWO"],
      key: "projectTaskWO",
      responsive: ["sm"],
    },

    {
      title: "Получатель",
      dataIndex: "recipient",
      key: "recipient",
      responsive: ["sm"],
      // width: 150,
    },
    {
      title: "Дата создания",
      dataIndex: "createDate",
      key: "createDate",
      responsive: ["sm"],
      render(text: Date) {
        return text && moment(text).format("D.MM.YY, HH:mm");
      },

      sorter: (a, b) =>
        moment(a.createDate).unix() - moment(b.createDate).unix(),
      // width: 150,
    },
    {
      title: "Дата получения",
      dataIndex: "closeDate",
      key: "closeDate",
      responsive: ["sm"],
      render(text: Date) {
        return text && moment(text).format("D.MM.YY, HH:mm");
      },
      sorter: (a, b) => moment(a.closeDate).unix() - moment(b.closeDate).unix(),
    },

    {
      title: "Тип ВС",
      dataIndex: ["materialAplicationId", "planeType"],
      key: "planeType",
      responsive: ["sm"],
      // width: 150,
    },
    {
      title: "Номер ВС",
      dataIndex: ["materialAplicationId", "registrationNumber"],
      key: "registrationNumber",
      responsive: ["sm"],
      // width: 150,
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      responsive: ["sm"],
      filteredValue: [searchedStatus],
      onFilter: (value: any, record: any) => {
        return record.status.includes(String(value));
      },
    },
  ];
  const dataEmpty: readonly IPickSlipResponse[] | undefined = [];
  const [open, setOpen] = useState(false);

  return (
    <div className="flex  flex-col">
      <div className="flex gap-x-2">
        <Form.Item>
          <Input.Search
            style={{ width: 170 }}
            allowClear
            placeholder="Поиск..."
            onSearch={(value) => {
              setSerchedText(value);
            }}
            onChange={(e) => {
              setSerchedText(e.target.value);
            }}
          />
        </Form.Item>
        <Form.Item name="status">
          <Select
            style={{ width: 170 }}
            placeholder="Статус требования"
            allowClear
            onClear={() => setSerchedStatus("")}
            onSelect={setSerchedStatus}
          >
            <Select.Option value="открыто">Открытые</Select.Option>
            <Select.Option value="закрыто">Закрытые</Select.Option>
          </Select>
        </Form.Item>
      </div>

      <Table
        className="py-0"
        rowClassName="cursor-pointer  text-xs text-transform: uppercase"
        columns={columns}
        dataSource={data.length > 0 ? data : dataEmpty}
        bordered
        pagination={{ defaultPageSize: 100 }}
        size="small"
        scroll={{ y: "calc(70vh)" }}
        locale={{
          emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        }}
        onRow={(record, rowIndex) => {
          return {
            onClick: async (event) => {
              setOpen(true);
              dispatch(setCurrentPickSlip(record));
            },
          };
        }}
      ></Table>

      <Modal
        okButtonProps={{
          disabled:
            isLoading || currentPickSlip?.status === "закрыто" || !checked,
        }}
        title="Расходное требование"
        centered
        open={open}
        cancelText="отмена"
        okType={"default"}
        okText="Отметить как закрытое "
        onOk={async () => {
          Modal.confirm({
            title:
              "Вы подтверждаете правильность введеной информации и  выдачу материалов?",
            okText: "Да",
            cancelText: "Отмена",
            okType: "danger",
            onOk: async () => {
              const result = await dispatch(
                updatePickSlip({
                  ...currentPickSlip,
                  _id: currentPickSlip?._id || currentPickSlip?.id,
                  status: "закрыто",
                  closeDate: new Date(),
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
                toast.success(
                  "Информация о выдаче материалов успешно добавлена"
                );
                // setOpen(false);
                dispatch(getAllPickSlips());
                currentPickSlip?.materials &&
                  currentPickSlip?.materials.forEach(
                    (item: IMaterialStoreRequestItem) => {
                      dispatch(updateAfterIssued(item));
                    }
                  );
              } else if (result.meta.requestStatus === "rejected") {
                toast.error("Информация не добавлена");
              }
            },
          });
        }}
        onCancel={() => {
          setOpen(false);
        }}
        width={"60%"}
      >
        <PickSlipCard data={currentPickSlip} />
        <p style={{ marginBottom: "20px" }}>
          <Checkbox
            checked={checked}
            disabled={
              disabled ||
              currentPickSlip?.status === "закрыто" ||
              !currentPickSlip?.storeMan
            }
            onChange={onChange}
          >
            {label}
          </Checkbox>
        </p>
        <Button
          disabled={
            localStorage.getItem("role") == "boss" ||
            (currentPickSlip?.storeMan &&
              currentPickSlip?.storeMan.length != 0) ||
            false
          }
          onClick={() => {
            setOpenInformation(true);
          }}
        >
          Ввод данных о получателе
        </Button>
      </Modal>
      <Modal
        okButtonProps={{ htmlType: "submit" }}
        title="Информация"
        centered
        open={openInformation}
        cancelText="отмена"
        okType={"default"}
        okText="Сохранить"
        onOk={async () => {}}
        width={"30%"}
        onCancel={() => setOpenInformation(false)}
        footer={null}
      >
        {" "}
        <div className="flex flex-col">
          <Form
            form={form}
            className="w-full"
            autoComplete="off"
            onFinish={async (values) => {
              const result = await dispatch(
                updatePickSlip({
                  ...currentPickSlip,
                  _id: currentPickSlip?._id || currentPickSlip?.id,
                  storeMan: values.storeMan,
                  recipient: values.recipient,
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
                toast.success("Информация добавлена");
                form.resetFields();
                setOpenInformation(false);
                dispatch(getAllPickSlips());
              } else if (result.meta.requestStatus === "rejected") {
                toast.error("Информация не добавлена");
              }
            }}
          >
            <Form.Item
              rules={[{ required: true, min: 5, message: "min 5 символов" }]}
              label="Получил (ФИО)"
              name="recipient"
            >
              <Input
                allowClear
                placeholder="Введите имя Получателя"
                defaultValue={currentPickSlip?.consigneeName}
              />
            </Form.Item>
            <Form.Item
              rules={[{ required: true, min: 5, message: "min 5 символов" }]}
              label="Отпустил (ФИО)"
              name="storeMan"
            >
              <Input
                defaultValue={localStorage.getItem("name") || ""}
                allowClear
                placeholder="Введите ФИО Кладовщика."
              />
            </Form.Item>
            <Form.Item className="flex">
              {" "}
              <div className="ml-auto">
                <Button
                  htmlType={"submit"}
                  type={"primary"}
                  // loading={isLoading}
                >
                  Сохранить
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default PickSlipList;
