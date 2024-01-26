import React, { FC, useEffect } from "react";
import { IPanelDTO, ITaskType } from "@/types/TypesData";
import Table, { ColumnsType } from "antd/es/table";
import { Button, Empty, Form, Skeleton } from "antd";
import { saveExls } from "@/services/utilites";
import { useTypedSelector } from "@/hooks/useTypedSelector";

export interface ILaborListPrors {
  data: ITaskType[];
  isLoading: boolean;
  fileName: string;
}
const LaborList: FC<ILaborListPrors> = ({ data, isLoading, fileName }) => {
  const { allPanels, allTasks } = useTypedSelector((state) => state.tasks);

  const columns: ColumnsType<any> = [
    {
      title: "СПЕЦИАЛЬНОСТЬ",
      dataIndex: "spec",
      key: "spec",
      responsive: ["sm"],
    },
    {
      title: "ВРЕМЯ (ЧАС.)",
      dataIndex: "time",
      key: "time",
      responsive: ["sm"],
    },
  ];

  const allTasksCopy: ITaskType[] = JSON.parse(JSON.stringify(data));

  let result = allTasksCopy.reduce((prev: ITaskType, item: ITaskType) => {
    if (
      item.specialization &&
      item.specialization in prev &&
      item.mainWorkTime &&
      item.workerNumber
    ) {
      prev[item.specialization as keyof typeof result] += Number(
        item.mainWorkTime * Number(item.workerNumber)
      );
    } else {
      prev[item.specialization as keyof typeof result] = Number(
        item.mainWorkTime
      );
    }
    return prev;
  }, {} as any);

  const timeObjArr = Object.keys(result).map((e) => ({
    spec: e,
    time: result[e as keyof typeof result],
  }));

  const initialValue = 0;
  const sumWithInitial = timeObjArr.reduce(
    (accumulator, currentValue: any) => accumulator + currentValue.time,
    initialValue
  );

  let taskAsccessArrAll: string[][] = [];
  const tasksAccessArr: string[] = [];
  const newData: ITaskType[] = [];

  const sumWithInitialPrepareTime = allTasksCopy.reduce(
    (accumulator, currentValue: ITaskType) =>
      (accumulator += Number(currentValue?.prepareTaskTime)),
    initialValue
  );

  data.forEach((task: ITaskType) => {
    if (task !== undefined) {
      tasksAccessArr.push(task.access);
      let access = String(task?.access) || "";
      let re = /\s*;\s*|\s*,\s*|\s*\r\n\s*/;
      let accessList = access.split(re);
      taskAsccessArrAll.push(accessList);
    }
  });

  const uniqueAccessArr = [...new Set(taskAsccessArrAll.flat())]
    .sort()
    .filter((x) => /^[1-8]/.exec(x) && x.length > 2);

  const objArr = uniqueAccessArr.map((e) => ({ access: e }));

  useEffect(() => {}, [objArr]);

  const includeFilterSet = new Set(uniqueAccessArr);

  const filteredPanels = allPanels.filter((e: IPanelDTO) =>
    includeFilterSet.has(e.panel)
  );
  const panelTimeOpen = filteredPanels.reduce(
    (accumulator, currentValue: IPanelDTO) =>
      accumulator + Number(currentValue.openingTime),
    initialValue
  );
  const panelTimeClose = filteredPanels.reduce(
    (accumulator, currentValue: IPanelDTO) =>
      accumulator + Number(currentValue.closingTime),
    initialValue
  );

  const sumTimeObjArr = [
    { spec: "Работы", time: sumWithInitial },
    { spec: "Подготовительные работы", time: sumWithInitialPrepareTime },
    { spec: "Панели", time: panelTimeOpen + panelTimeClose },
    {
      spec: "Всего",
      time:
        sumWithInitial +
        panelTimeOpen +
        panelTimeClose +
        sumWithInitialPrepareTime,
    },
    { spec: "Всего работ", time: allTasksCopy.length },
  ];
  const sumTime = [...timeObjArr, ...sumTimeObjArr];

  return (
    <div className="flex  flex-col gap-2">
      <Table
        columns={columns}
        rowClassName="text-xs text-transform: uppercase"
        dataSource={isLoading ? [] : sumTime}
        bordered
        scroll={{ y: "calc(15vh)" }}
        pagination={false}
        size="small"
        locale={{
          emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        }}
      ></Table>

      <Form.Item className="flex justify-end">
        <Button
          type="primary"
          onClick={() => saveExls(columns, sumTime, fileName)}
        >
          Сохранить в формате .xlsx
        </Button>
      </Form.Item>
    </div>
  );
};

export default LaborList;
