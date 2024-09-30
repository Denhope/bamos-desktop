import Table, { ColumnsType } from "antd/es/table";
import React, { FC, useState } from "react";
import {
  IMatRequestAplication,
  MatRequestAplication,
} from "@/store/reducers/ProjectTaskSlise";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  PlusOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Button, Descriptions, Modal } from "antd";
import moment from "moment";
import { IMatData1 } from "@/types/TypesData";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import {
  setEditedMaterialAplication,
  setEditedMaterialAplicationMaterials,
} from "@/store/reducers/MatirialAplicationsSlise";
import { sign } from "crypto";
import {
  getAllMaterialAplication,
  updateAplicationById,
} from "@/utils/api/thunks";
import { IPickSlipResponse } from "@/models/IPickSlip";
import Title from "antd/es/typography/Title";
import GeneretedPickSlip from "@/components/pdf/GeneretedPickSlip";

type PickSlipTypeProps = { data: any };
const MaterialAplicationView: FC<PickSlipTypeProps> = ({ data }) => {
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<IMatData1 | null>(
    null
  );
  const columnsMat: ColumnsType<any> = [
    // {
    //   title: <p className=" my-0 py-0">Код</p>,
    //   dataIndex: 'code',
    //   key: 'code',
    //   responsive: ['sm'],
    // },
    {
      title: "P/N",
      dataIndex: "PART_NUMBER",
      key: "PN",
      responsive: ["sm"],
    },

    {
      title: <p className="text- my-0 py-0">Наименование</p>,
      dataIndex: "NAME_OF_MATERIAL",
      key: "nameOfMaterial",
      responsive: ["sm"],
    },
    {
      title: <p className="text- my-0 py-0">Партия</p>,
      dataIndex: "BATCH",
      key: "BATCH",
      responsive: ["sm"],
    },
    {
      title: <p className="text- my-0 py-0">Серийный номер</p>,
      dataIndex: "BATCH_ID",
      key: "BATCH_ID",
      responsive: ["sm"],
    },

    {
      title: "Кол-во",
      dataIndex: "QUANTITY",
      key: "QUANTITY",
      responsive: ["sm"],
    },
    {
      title: "Ед. Измер.",
      dataIndex: "UNIT_OF_MEASURE",
      key: "UNIT_OF_MEASURE",
      responsive: ["sm"],
    },
  ];

  return (
    <div>
      <div className="flex">
        <PrinterOutlined
          onClick={() => setOpen(true)}
          className="cursor-pointer"
          style={{ fontSize: "25px" }}
        />

        <p className="my-1 mx-4 font-semibold ml-auto">
          Статус: {data?.status?.toUpperCase()}
        </p>
      </div>
      <Descriptions
        className="flex justify-between"
        // bordered
        size="small"
        column={{ xxl: 4, xl: 4, lg: 4, md: 4, sm: 4, xs: 3 }}
      >
        <Descriptions.Item
          label={
            <p className="text-l mx-0 my-0">Номер расходного требования</p>
          }
        >
          <p className="text-l font-semibold mx-0 my-0">
            {data?.pickSlipNumber}
          </p>
        </Descriptions.Item>

        <Descriptions.Item
          label={<p className="text-l mx-0 my-0">Номер карты</p>}
        >
          <p className="text-l font-semibold my-0">
            {data?.materialAplicationId?.projectTaskWO}
          </p>
        </Descriptions.Item>
        <Descriptions.Item label="Рег. Номер ВС">
          <p className="text-l  font-semibold my-0">
            {data?.materialAplicationId?.registrationNumber}
          </p>
        </Descriptions.Item>
        <Descriptions.Item
          label={<p className="text-l  my-0">Внутренний W/O</p>}
        >
          <p className="text-l  font-semibold my-0">
            {data?.materialAplicationId?.projectWO}
          </p>{" "}
        </Descriptions.Item>
        <Descriptions.Item label={<p className="text-l  my-0">Номер Заявки</p>}>
          <p className="text-l  font-semibold my-0">
            {data?.materialAplicationId?.materialAplicationNumber}
          </p>
        </Descriptions.Item>
        <Descriptions.Item label={<p className="text-l  my-0">Получатель</p>}>
          <p className="text-l  font-semibold my-0">{data?.recipient || ""}</p>
        </Descriptions.Item>
        <Descriptions.Item label={<p className="text-l my-0">Дата создания</p>}>
          <p className="text-l  font-semibold my-0">
            {data?.createDate &&
              moment(data?.createDate).format("D.MM.YY, HH:mm")}
          </p>
        </Descriptions.Item>
        <Descriptions.Item label={<p className="text-l  my-0">Дата выдачи</p>}>
          <p className="text-l  font-semibold my-0">
            {data?.closeDate && moment(data?.closeDate).format("D.MM.YY, HH:mm")}
          </p>
        </Descriptions.Item>

        <Descriptions.Item label={<p className="text-l  my-0">Кладовщик</p>}>
          <p className="text-l  font-semibold my-0">{data?.storeMan || ""}</p>
        </Descriptions.Item>
      </Descriptions>
      <Table
        size="small"
        scroll={{ y: "calc(60vh)" }}
        rowClassName="cursor-pointer  text-xs text-transform: uppercase"
        columns={columnsMat}
        dataSource={data?.materials}
      ></Table>{" "}
      <Modal
        okButtonProps={{}}
        title="Печать расходного требования"
        centered
        open={open}
        cancelText="отмена"
        okType={"default"}
        okText="Закрыть "
        onOk={async () => {}}
        width={"60%"}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <GeneretedPickSlip />
      </Modal>
    </div>
  );
};

export default MaterialAplicationView;
