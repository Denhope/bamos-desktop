import React, { FC, useState } from "react";
import { Button, Empty, Form, Input, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { IMatData, IDTO, IInstData } from "@/types/TypesData";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { saveExls } from "@/services/utilites";

export interface IInstrumentListActiveTask {
  taskNumber: string;
}
const InstrumentListActiveTask: FC<IInstrumentListActiveTask> = ({
  taskNumber,
}) => {
  const { allInstruments, isLoading } = useTypedSelector(
    (state) => state.instrument
  );
  const { routineTasks, additionalTasks, hardTimeTasks, aplicationName } =
    useTypedSelector((state) => state.application.currentAplication);
  const data: any[] = [2];
  //отфильтрованные материалы по задачам
  const arrayOfAllObjectsData: IInstData[] = allInstruments;
  const includeTaskFilter: string[] = [];
  data.forEach((task: any) => {
    // includeTaskFilter.push(taskNumber);
    includeTaskFilter.push(
      String(
        taskNumber
          // ?.trim()
          ?.replace(/Изм.00/g, "")
          ?.replace(/Изм. 00/g, "")
          ?.replace(/Изм.03/g, "")
          ?.replace(/,Изм.00/g, "")
          ?.replace(/, Изм.00/g, "")
          ?.replace(/Изм.01/g, "")
          ?.replace(/Изм. 01/g, "")
          ?.replace(/Изм. 01/g, "")
          ?.trim()
      )
    );
  });

  const includeFilterSet = new Set(includeTaskFilter);

  const filteredItems = arrayOfAllObjectsData.filter((e) =>
    // includeFilterSet.has(e.taskNumber)
    includeFilterSet.has(
      String(e.taskNumber)
        ?.replace(/Изм.00/g, "")
        ?.replace(/Изм. 00/g, "")
        ?.replace(/Изм.03/g, "")
        ?.replace(/Изм.01/g, "")
        ?.replace(/,Изм.00/g, "")
        ?.replace(/, Изм.00/g, "")
        ?.replace(/Изм. 01/g, "")
        .trim()
    )
  );

  const allInstrCopy: IInstData[] = JSON.parse(JSON.stringify(filteredItems));
  const instruments = allInstrCopy.reduce((acc: IInstData[], entry) => {
    const code = entry.code;
    const instName = entry.nameOfInstrument;
    const pn = entry.PN;

    let sameInstr = acc.find(
      (element: IInstData) =>
        (element.code === code &&
          element.PN === pn &&
          element.PN !== "НЕ РЕГЛАМЕНТИРУЕТСЯ" &&
          element.nameOfInstrument === instName) ||
        (element.PN === "НЕ РЕГЛАМЕНТИРУЕТСЯ" &&
          element.nameOfInstrument === instName) ||
        (element.PN === "НЕ РЕГЛАМЕНТИРУЕТСЯ" &&
          element.nameOfInstrument === instName &&
          element.code === code)
    );

    if (sameInstr && sameInstr.amout && entry.amout) {
      sameInstr.amout += Number(entry.amout);
    } else acc.push(entry);

    return acc;
  }, []);

  const columns: ColumnsType<IInstData> = [
    {
      title: <p className=" my-0 py-0">Код</p>,
      dataIndex: "code",
      key: "code",
      responsive: ["sm"],
    },
    { title: "P/N", dataIndex: "PN", key: "PN", responsive: ["sm"] },

    {
      title: <p className="text- my-0 py-0">Наименование</p>,
      dataIndex: "nameOfInstrument",
      key: "nameOfInstrument",
      responsive: ["sm"],
    },
    {
      title: "Альтернатива",
      dataIndex: "alternative",
      key: "alternative",
      responsive: ["sm"],
    },
    {
      title: "Кол-во",
      dataIndex: "amout",
      key: "amout",
      responsive: ["sm"],
    },
  ];

  return (
    <div className="flex  flex-col gap-3 my-o py-0">
      {instruments.length > 0 ? (
        <Table
          rowClassName={"text-xs"}
          columns={columns}
          bordered
          size="small"
          pagination={false}
          dataSource={isLoading ? [] : instruments}
          locale={{
            emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
          }}
        ></Table>
      ) : (
        <p className="">Нет инструмента, необходимых к применению</p>
      )}
    </div>
  );
};

export default InstrumentListActiveTask;
