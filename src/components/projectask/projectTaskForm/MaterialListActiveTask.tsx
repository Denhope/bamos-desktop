import React, { FC, useState } from "react";
import { Button, Empty, Form, Input, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { IMatData, IDTO } from "@/types/TypesData";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { saveExls } from "@/services/utilites";

export interface MaterialListActiveTask {
  taskNumber: string;
}
const MaterialListActiveTask: FC<MaterialListActiveTask> = ({ taskNumber }) => {
  const { allMaterials, isLoading } = useTypedSelector(
    (state) => state.material
  );
  const { routineTasks, additionalTasks, hardTimeTasks, aplicationName } =
    useTypedSelector((state) => state.application.currentAplication);
  const data: any[] = [2];
  //отфильтрованные материалы по задачам
  const arrayOfAllObjectsData: IMatData[] = allMaterials;
  const includeTaskFilter: string[] = [];
  data.forEach((task: any) => {
    // includeTaskFilter.push(taskNumber);
    includeTaskFilter.push(
      String(
        taskNumber //       // ?.trim()
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

  const allMatCopy: IMatData[] = JSON.parse(JSON.stringify(filteredItems));
  const materials = allMatCopy.reduce((acc: IMatData[], entry) => {
    const code = entry.code;
    const matName = entry.nameOfMaterial;
    const pn = entry.PN;

    let sameMaterial = acc.find(
      (element: IMatData) =>
        (element.code === code &&
          element.PN === pn &&
          element.PN !== "НЕ РЕГЛАМЕНТИРУЕТСЯ" &&
          element.nameOfMaterial === matName) ||
        (element.PN === "НЕ РЕГЛАМЕНТИРУЕТСЯ" &&
          element.nameOfMaterial === matName) ||
        (element.PN === "НЕ РЕГЛАМЕНТИРУЕТСЯ" &&
          element.nameOfMaterial === matName &&
          element.code === code)
    );

    if (sameMaterial && sameMaterial.amout && entry.amout) {
      sameMaterial.amout += Number(entry.amout);
    } else acc.push(entry);

    return acc;
  }, []);

  const columns: ColumnsType<IMatData> = [
    {
      title: <p className=" my-0 py-0">Код</p>,
      dataIndex: "code",
      key: "code",
      responsive: ["sm"],
    },
    { title: "P/N", dataIndex: "PN", key: "PN", responsive: ["sm"] },

    {
      title: <p className="text- my-0 py-0">Наименование</p>,
      dataIndex: "nameOfMaterial",
      key: "nameOfMaterial",
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
    {
      title: "Ед. Измер.",
      dataIndex: "unit",
      key: "unit",
      responsive: ["sm"],
    },
  ];

  return (
    <div className="flex  flex-col gap-3 my-o py-0">
      {materials.length > 0 ? (
        <Table
          rowClassName={"text-xs"}
          columns={columns}
          bordered
          size="small"
          pagination={false}
          dataSource={isLoading ? [] : materials}
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

export default MaterialListActiveTask;
