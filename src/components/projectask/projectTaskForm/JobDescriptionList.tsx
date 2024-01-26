import React, { FC } from "react";
import { Empty, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/lib/table";

import { useTypedSelector } from "@/hooks/useTypedSelector";

import { IActionType } from "@/store/reducers/AdditionalTaskSlice";
import { IAdditionalTask } from "@/models/IAdditionalTask";

export interface IJobDescriptionListPrors {
  data: IActionType[];
}

const JobDescriptionList: FC<IJobDescriptionListPrors> = ({ data }) => {
  const { isLoading } = useTypedSelector((state) => state.projectTask);
  const columns: ColumnsType<IActionType> = [
    {
      title: "Action Step / Действие ",
      dataIndex: "actionDescription",
      key: "actionDescription",
      // responsive: ['sm'],
      // width: 350,
    },
    {
      title: "Performed / Выполнил",
      dataIndex: "performedSing",
      key: "performedSing",
      responsive: ["sm"],
      width: 150,
    },
    {
      title: "Inspected / Проверил",
      dataIndex: "inspectedSing",
      key: "inspectedSing",
      responsive: ["sm"],
      width: 150,
    },
  ];
  const dataEmpty: readonly IActionType[] | undefined = [];

  return (
    <div className="flex mt-3 text-2xl flex-col gap-3">
      <Table
        columns={columns}
        dataSource={data.length > 0 ? data : dataEmpty}
        bordered
        pagination={false}
        size="small"
        locale={{
          emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        }}
      ></Table>
    </div>
  );
};

export default JobDescriptionList;
