import { Button, Form } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import React, { FC, useEffect } from "react";
import { saveExls } from "@/services/utilites";
import { ITaskType } from "@/types/TypesData";

const columns: ColumnsType<any> = [
  {
    title: "ТЯЖЕЛЫЙ ДОСТУП",
    dataIndex: "access",
    key: "access",
    responsive: ["sm"],
  },
];

export interface IHardAccessListPrors {
  data: ITaskType[];
  fileName: string;
}

const HardAccessList: FC<IHardAccessListPrors> = ({ data, fileName }) => {
  const tasksAccessArr: string[] = [];

  data.forEach((task: ITaskType) => {
    if (task !== undefined && task?.hardAccess) {
      tasksAccessArr.push(task?.hardAccess);
    }
  });

  // const accessArr = [
  //   ...new Set(
  //     tasksAccessArr
  //       .join()
  //       .split(/\s*;\s*|\s*,\s*/)
  //       .sort()
  //   ),
  // ].map((x) => {
  //   return x.trim();
  // });

  const unicHardAcces = [...new Set(tasksAccessArr.flat())]
    .sort()
    .filter((x) => !/^[1-8]/.exec(x) && x.length > 2);

  // const unicHardAcces = [
  //   ...new Set(accessArr.filter((x) => !/^[1-9]/.exec(x) && x.length > 0)),
  // ];

  const objArr = unicHardAcces.map((e) => ({ access: e }));
  useEffect(() => {}, [objArr]);

  return (
    <div className="flex flex-col gap-3 pt-14">
      <Table
        columns={columns}
        rowClassName="text-xs text-transform: uppercase"
        dataSource={objArr}
        bordered
        size="small"
        scroll={{ y: "calc(15vh)" }}
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

export default HardAccessList;
