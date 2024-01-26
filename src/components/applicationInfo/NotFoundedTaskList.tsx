import React, { FC } from "react";
import { IDTO, ITaskType } from "@/types/TypesData";
import cheackData from "../../data/planes/89120/2CCheckTasks.json";
import { Button, Form, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { saveExls } from "@/services/utilites";

const colums: ColumnsType<ITaskType> = [
  {
    title: "НОМЕР ЗАДАЧИ",
    dataIndex: "taskNumber",
    key: "taskNumber",
    responsive: ["sm"],
  },
  {
    title: "ОПИСАНИЕ",
    dataIndex: "taskDescription",
    key: "taskDescription",
    responsive: ["sm"],
  },
  {
    title: "ПРИМЕЧАНИЕ",
    dataIndex: "note",
    key: "note",
    responsive: ["sm"],
  },
];
export interface ITaskListProps {
  data: IDTO[];
  title?: string;
  fileName: string;
}

const TasksList: FC<ITaskListProps> = ({ data, title, fileName }) => {
  return (
    <div className="flex flex-col my-0 py-0">
      <h2 className="my-0 py-0">
        ВСЕГО:
        {data.length}
      </h2>
      <h4 className=" uppercase">
        Внимание! при расcчетах были обнаружены работы , имеющие некорректные
        даннные, либо отсутствующие в базе данных. Oбновите пожалуйста базу
        данных.
      </h4>

      <div className="flex  flex-col">
        <Table
          columns={colums}
          rowClassName="text-xs text-transform: uppercase"
          dataSource={data}
          bordered
          size="small"
          scroll={{ y: 190 }}
        ></Table>
        <Form.Item className="flex justify-end">
          <Button
            type="primary"
            onClick={() => saveExls(colums, data, fileName)}
          >
            Сохранить в формате .xlsx
          </Button>
        </Form.Item>
      </div>
    </div>
  );
};

export default TasksList;
