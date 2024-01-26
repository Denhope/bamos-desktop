import { Empty, Skeleton } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC } from "react";
import { IMatData, IMatDataAdditional } from "@/types/TypesData";

export interface IAdditionalPartRequestProps {
  data: IMatDataAdditional[];
}
const AdditionalPartRequest: FC<IAdditionalPartRequestProps> = ({ data }) => {
  const { isLoading } = useTypedSelector((state) => state.additioonalTasks);

  const columns: ColumnsType<IMatDataAdditional> = [
    { title: "P/N", dataIndex: "PN", key: "PN", responsive: ["sm"] },

    {
      title: <p className="text- my-0 py-0">Description / Описание</p>,
      dataIndex: "nameOfMaterial",
      key: "nameOfMaterial",
      responsive: ["sm"],
    },
    {
      title: "QTY / Кол-во",
      dataIndex: "amout",
      key: "amout",
      responsive: ["sm"],
    },
    {
      title: "Unit / Ед. Измер.",
      dataIndex: "unit",
      key: "unit",
      responsive: ["sm"],
    },
  ];

  return (
    <div className="flex  flex-col gap-3 my-o py-0">
      {data && data.length > 0 ? (
        <Table
          rowClassName={"text-xs"}
          columns={columns}
          bordered
          size="small"
          pagination={false}
          dataSource={isLoading ? [] : data}
          locale={{
            emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
          }}
        ></Table>
      ) : (
        <p className="">Нет материалов, необходимых к применению</p>
      )}
    </div>
  );
};

export default AdditionalPartRequest;
