import React, { FC, useState } from "react";
import { Button, Empty, Form, Input, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { IDTO, IInstData } from "@/types/TypesData";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import { saveExls } from "@/services/utilites";
import { IProjectTaskAll } from "@/models/IProjectTask";
import {
  IActionType,
  setCurrentAction,
  setCurrentActionIndex,
} from "@/store/reducers/AdditionalTaskSlice";
import { IAdditionalTask } from "@/models/IAdditionalTask";

export interface IActionDescriptionListPrors {
  data: IActionType[];
}

const ActionDescriptionList: FC<IActionDescriptionListPrors> = ({ data }) => {
  const [selectedRowKey, setSelectedRowKey] = useState<number | null>(null);
  const rowClassName = (record: any) => {
    // console.log(record.actionNumber);
    return record.actionNumber === selectedRowKey
      ? "cursor-pointer text-xs text-transform: uppercase bg-blue-400"
      : "cursor-pointer text-xs text-transform: uppercase ";
  };
  const { isLoading } = useTypedSelector((state) => state.additioonalTasks);
  const dispatch = useAppDispatch();
  const columns: ColumnsType<IActionType> = [
    {
      title: "Action Step №/ № действия ",
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

  return (
    <div>
      <Table
        className="cursor-pointer w-full"
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => {
              setSelectedRowKey(record.actionNumber || null);
              console.log(rowIndex);
              dispatch(setCurrentAction(record));
              dispatch(setCurrentActionIndex(rowIndex));
            },
          };
        }}
        columns={columns}
        rowClassName={rowClassName}
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

export default ActionDescriptionList;
