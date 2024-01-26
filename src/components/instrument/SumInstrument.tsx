import React, { FC, useState } from "react";
import { Button, Empty, Form, Input, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { IDTO, IInstData } from "@/types/TypesData";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { saveExls } from "@/services/utilites";
import { useTranslation } from "react-i18next";
export interface ISumInstrumentsListPrors {
  data: IDTO[];
  fileName: string;
}
const SumInstrument: FC<ISumInstrumentsListPrors> = ({ data, fileName }) => {
  const { t } = useTranslation();
  const [searchedText, setSerchedText] = useState("");
  const { allInstruments, isLoading } = useTypedSelector(
    (state) => state.instrument
  );
  const notIncludeTaskFilter: string[] = [];
  const arrayOfCheakObjectData: IDTO[] = data;

  //отсутствующий инструмент
  allInstruments.forEach((task: IInstData) => {
    return notIncludeTaskFilter.push(task.taskNumber);
  });

  const notIncludeFilterSet = new Set(notIncludeTaskFilter);
  const unKnownTasks = arrayOfCheakObjectData.filter(
    (e) => !notIncludeFilterSet.has(e.taskNumber)
  );
  const arrayOfAllObjectsData: IInstData[] = allInstruments;
  const includeInstrumentsFilter: string[] = [];
  data.forEach((task: IDTO) => {
    // includeInstrumentsFilter.push(task.taskNumber);
    includeInstrumentsFilter.push(
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
          ?.replace(/Изм. 01/g, "")
          ?.trim()
      )
    );
  });
  const includeFilterSet = new Set(includeInstrumentsFilter);

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
  const allInstCopy: IInstData[] = JSON.parse(JSON.stringify(filteredItems));

  const instruments = allInstCopy.reduce((acc: IInstData[], entry) => {
    const code = entry.code;
    const instrName = entry.nameOfInstrument;
    const pn = entry.PN;

    let sameInstrument = acc.find(
      (element: IInstData) =>
        (element.PN === "НЕ РЕГЛАМЕНТИРУЕТСЯ" &&
          element.nameOfInstrument === instrName) ||
        (element.code === code &&
          element.PN === pn &&
          element.nameOfInstrument === instrName)
    );

    if (sameInstrument && sameInstrument.amout && entry.amout) {
      sameInstrument.amout = Math.max(entry.amout);
    } else acc.push(entry);

    return acc;
  }, []);

  const columns: ColumnsType<IInstData> = [
    { title: "Код", dataIndex: "code", key: "code", responsive: ["sm"] },
    { title: `${t("PN")}`, dataIndex: "PN", key: "PN", responsive: ["sm"] },

    {
      title: "НАИМЕН.",
      dataIndex: `nameOfInstrument`,
      key: "nameOfInstrument",
      responsive: ["sm"],
      filteredValue: [searchedText],
      onFilter: (value: any, record: any) => {
        return (
          record.code?.toLowerCase().includes(value.toLowerCase()) ||
          record.taskNumber?.toLowerCase().includes(value.toLowerCase()) ||
          record.nameOfInstrument
            ?.toLowerCase()
            .includes(value.toLowerCase()) ||
          record.PN?.toLowerCase().includes(value.toLowerCase()) ||
          record.alternative?.toLowerCase().includes(value.toLowerCase())
        );
      },
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
      responsive: ["sm"],
    },
  ];
  return (
    <div className="flex text-2xl flex-col gap-3">
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
        bordered
        rowClassName="text-xs text-transform: uppercase"
        // pagination={false}
        size="small"
        scroll={{ y: "calc(17vh)" }}
        dataSource={isLoading ? [] : instruments}
        locale={{
          emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
        }}
      ></Table>
      <Form.Item className="flex justify-end">
        <Button
          type="primary"
          onClick={() => saveExls(columns, instruments, fileName)}
        >
          Сохранить в формате .xlsx
        </Button>
      </Form.Item>
    </div>
  );
};

export default SumInstrument;
