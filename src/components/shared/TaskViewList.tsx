import React, { FC, useState } from "react";
import { Button, Empty, Form, Input, Skeleton, Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import { ITaskType } from "@/types/TypesData";
import { saveExls } from "@/services/utilites";
import { useTypedSelector } from "@/hooks/useTypedSelector";

export interface ITaskViewListProps {
  filteredItems: ITaskType[];
  fileName: string;
}
const TaskViewList: FC<ITaskViewListProps> = ({ filteredItems, fileName }) => {
  // const filteredItems1=
  const [searchedText, setSerchedText] = useState("");
  const { isLoading } = useTypedSelector((state) => state.tasks);
  const columns: ColumnsType<any> = [
    {
      title: "Задача",
      dataIndex: "taskNumber",
      key: "taskNumber",
      responsive: ["sm"],
      filteredValue: [searchedText],
      onFilter: (value: any, record: any) => {
        return (
          record.code?.toLowerCase().includes(value.toLowerCase()) ||
          // record.specialization?.toLowerCase().includes(value.toLowerCase()) ||
          record.taskNumber?.toLowerCase().includes(value.toLowerCase()) ||
          record.taskDescription?.toLowerCase().includes(value.toLowerCase()) ||
          record.amtossNewRev?.toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      title: `Описание`,
      dataIndex: "taskDescription",
      key: "taskDescription",
      responsive: ["sm"],
    },
    { title: "Зона", dataIndex: "area", key: "area", responsive: ["sm"] },
    {
      title: "Доступ",
      dataIndex: "access",
      key: "access",
      responsive: ["sm"],
    },
    {
      title: `АММ`,
      dataIndex: "amtossNewRev",
      key: "amtossNewRev",
      responsive: ["sm"],
    },
    {
      title: "Код",
      dataIndex: "code",
      key: "code",
      responsive: ["sm"],
      filters: [
        {
          text: "LU",
          value: "LU",
        },
        {
          text: "GVI",
          value: "GVI",
        },
        {
          text: "RS",
          value: "RS",
        },
        {
          text: "VC",
          value: "VC",
        },
        {
          text: "FC",
          value: "FC",
        },
        {
          text: "OP",
          value: "OP",
        },
        {
          text: "DET",
          value: "DET",
        },
        {
          text: "DS",
          value: "DS",
        },
      ],
      onFilter: (value: any, record) =>
        value && record.code && record.code.indexOf(value) === 0,
    },
    {
      title: "Спец.",
      dataIndex: "specialization",
      key: "specialization",
      responsive: ["sm"],
      filters: [
        {
          text: "AF/AV",
          value: "AF/AV",
        },
        {
          text: "AF",
          value: "AF",
        },
        {
          text: "AV",
          value: "AV",
        },
        {
          text: "EN",
          value: "EN",
        },
        {
          text: "EN/AV",
          value: "EN/AV",
        },
        {
          text: "NDT",
          value: "NDT",
        },
      ],

      onFilter: (value: any, record: any) => {
        return value && record.specialization.indexOf(value as string) === 0;
      },
    },
    {
      title: "Кол.спец",
      dataIndex: "workerNumber",
      key: "workerNumber",
      responsive: ["sm"],
    },

    {
      title: "Вр. осн работ",
      dataIndex: "mainWorkTime",
      key: "mainWorkTime",
      sorter: (a: any, b: any) => {
        return a.mainWorkTime - b.mainWorkTime;
      },

      responsive: ["sm"],
    },
    {
      title: "Вр. подгот",
      dataIndex: "prepareTaskTime",
      key: "prepareTaskTime",
      sorter: (a: any, b: any) => {
        return Number(a.mainWorkTime - b.mainWorkTime);
      },

      responsive: ["sm"],
    },
    {
      title: "Сумма",
      dataIndex: "allTaskTime",
      key: "allTaskTime",
      sorter: (a: any, b: any) => {
        return Number(a.mainWorkTime - b.mainWorkTime);
      },

      responsive: ["sm"],
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Input.Search
        allowClear
        placeholder="Поиск..."
        onSearch={(value) => {
          setSerchedText(value);
        }}
        onChange={(e) => {
          setSerchedText(e.target.value);
        }}
      />

      <Table
        columns={columns}
        rowClassName="text-xs text-transform: uppercase"
        bordered
        size="small"
        scroll={{ y: "calc(13vh)" }}
        dataSource={isLoading ? [] : filteredItems}
        locale={{
          emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        }}
      ></Table>
      <Form.Item className="flex justify-end">
        <Button
          type="primary"
          onClick={() => saveExls(columns, filteredItems, fileName)}
        >
          Сохранить в формате .xlsx
        </Button>
      </Form.Item>
    </div>
  );
};

export default TaskViewList;
