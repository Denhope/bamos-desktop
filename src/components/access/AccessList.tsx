import Table, { ColumnsType } from "antd/es/table";
import React, { FC, useEffect } from "react";
import { saveExls } from "@/services/utilites";
import { ITaskType } from "@/types/TypesData";
import { Button, Form } from "antd";

const columns: ColumnsType<any> = [
  { title: "ДОСТУП", dataIndex: "access", key: "access", responsive: ["sm"] },
];
export interface IAccessListPrors {
  data: ITaskType[];
  fileName: string;
}
const AccessList: FC<IAccessListPrors> = ({ data, fileName }) => {
  const tasksAccessArr: string[] | "" = [];
  data.forEach((task: ITaskType) => {
    if (task !== undefined) {
      tasksAccessArr.push(task.accessArr);
    }
  });

  const uniqueAccessArr = [...new Set(tasksAccessArr.flat())]
    .sort()
    .filter((x) => /^[1-8]/.exec(x) && x.length > 2);

  const objArr = uniqueAccessArr.map((e) => ({ access: e }));

  useEffect(() => {}, [objArr]);

  return (
    <div className="flex flex-col gap-3 pt-14">
      <Table
        columns={columns}
        rowClassName="text-xs text-transform: uppercase"
        dataSource={objArr}
        bordered
        size="small"
        scroll={{ y: "calc(10vh)" }}
      ></Table>
      <Form.Item className="flex justify-end">
        <Button
          type="primary"
          onClick={() => saveExls(columns, objArr, fileName)}
        >
          Сохранить в формате .xlsx
        </Button>
      </Form.Item>
    </div>
  );
};

export default AccessList;
