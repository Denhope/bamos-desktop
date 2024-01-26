import React, { FC, useState } from "react";
import { Button, Empty, Form, Input, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/lib/table";

import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";

import {
  IActionType,
  setCurrentAction,
} from "@/store/reducers/AdditionalTaskSlice";
import {
  // setCurrentAction,
  setCurrentActionIndex,
} from "@/store/reducers/ProjectTaskSlise";

export interface IActionDescriptionListPrors {
  data: IActionType[];
}

const WOActionDescriptionList: FC<IActionDescriptionListPrors> = ({ data }) => {
  const { currentProjectTask, isLoading } = useTypedSelector(
    (state) => state.projectTask
  );

  const dispatch = useAppDispatch();
  const columns: ColumnsType<IActionType> = [
    {
      title: "Action Step №/ № Действия ",
      dataIndex: "actionNumber",
      key: "actionNumber",
      responsive: ["sm"],
      // width: 350,
    },
    {
      title: "Action Step Description / Описание действия ",
      dataIndex: "actionDescription",
      key: "actionDescription",
      responsive: ["sm"],
      width: 350,
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
  const dataEmpty = [
    {
      actionDescription: "",
      performedSing: "",
      performedDate: "",
      performedTime: "",
    },
  ];
  const [selectedRowKey, setSelectedRowKey] = useState<number | null>(null);
  const rowClassName = (record: any) => {
    // console.log(record.actionNumber);
    return record.actionNumber === selectedRowKey
      ? "cursor-pointer text-xs text-transform: uppercase bg-blue-400"
      : "cursor-pointer text-xs text-transform: uppercase ";
  };

  return (
    <div>
      <Table
        className="cursor-pointer w-full"
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => {
              setSelectedRowKey(record.actionNumber || null);
              // console.log(record.actionNumber);
              // console.log(selectedRowKey);
              dispatch(setCurrentAction(record));
              dispatch(setCurrentActionIndex(rowIndex));
            },
          };
        }}
        rowClassName={rowClassName}
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

export default WOActionDescriptionList;
