import React, { FC, useState } from "react";
import { Button, Empty, Form, Input, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { IMatData, IDTO } from "@/types/TypesData";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { saveExls } from "@/services/utilites";
import { useTranslation } from "react-i18next";
export interface IMaterialListPrors {
  data: IDTO[];
  fileName: string;
}
const MaterialList: FC<IMaterialListPrors> = ({ data, fileName }) => {
  const { t } = useTranslation();
  const { allMaterials, isLoading } = useTypedSelector(
    (state) => state.material
  );
  //отфильтрованные материалы по задачам
  const arrayOfAllObjectsData: IMatData[] = allMaterials;
  const includeTaskFilter: string[] = [];
  data.forEach((task: IDTO) => {
    // includeTaskFilter.push(task.taskNumber);
    includeTaskFilter.push(
      String(
        task.taskNumber
          // ?.trim()
          ?.replace(/Изм.00/g, "")
          ?.replace(/Изм. 00/g, "")
          ?.replace(/Изм.03/g, "")
          ?.replace(/,Изм.00/g, "")
          ?.replace(/, Изм.00/g, "")
          ?.replace(/Изм.01/g, "")
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

  const [searchedText, setSerchedText] = useState("");

  const columns: ColumnsType<IMatData> = [
    {
      title: "ЗАДАЧA",
      dataIndex: "taskNumber",
      key: "taskNumber",
      responsive: ["sm"],
    },
    {
      title: "Код",
      dataIndex: "code",
      key: "code",
      filteredValue: [searchedText],
      onFilter: (value: any, record: any) => {
        return (
          record.code?.toLowerCase().includes(value.toLowerCase()) ||
          record.taskNumber?.toLowerCase().includes(value.toLowerCase()) ||
          record.nameOfMaterial?.toLowerCase().includes(value.toLowerCase()) ||
          record.PN?.toLowerCase().includes(value.toLowerCase()) ||
          record.alternative?.toLowerCase().includes(value.toLowerCase())
        );
      },

      responsive: ["sm"],
    },
    { title: `${t("PN")}`, dataIndex: "PN", key: "PN", responsive: ["sm"] },

    {
      title: "НАИМЕН.",
      dataIndex: "nameOfMaterial",
      key: "nameOfMaterial",
      responsive: ["sm"],
    },
    {
      title: "АЛЬТЕРН.",
      dataIndex: "alternative",
      key: "alternative",
      responsive: ["sm"],
    },
    {
      title: "КОЛ-ВО",
      dataIndex: "amout",
      key: "amout",
      sorter: (a, b) => a.amout - b.amout,
      responsive: ["sm"],
    },
    {
      title: "ЕД. ИЗМ.",
      dataIndex: "unit",
      key: "unit",
      responsive: ["sm"],
      sorter: (a, b) => a.unit.length - b.unit.length,
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
        scroll={{ y: "calc(15vh)" }}
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

export default MaterialList;
