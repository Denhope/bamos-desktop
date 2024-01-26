import React, { FC, useState } from "react";
import { Button, Empty, Form, Input, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { IDTO, IInstData } from "@/types/TypesData";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import { saveExls } from "@/services/utilites";
import { useTranslation } from "react-i18next";
export interface IInstrumentListPrors {
  data: IDTO[];
  fileName: string;
}

const InstrumentList: FC<IInstrumentListPrors> = ({ data, fileName }) => {
  const { t } = useTranslation();
  const [searchedText, setSerchedText] = useState("");
  const { allInstruments, isLoading } = useTypedSelector(
    (state) => state.instrument
  );
  const arrayOfAllObjectsData: any = allInstruments;

  const includeTaskFilter: string[] = [];
  data.forEach((task: IDTO) => {
    // includeTaskFilter.push(String(task.taskNumber.trim()));
    includeTaskFilter.push(
      String(
        task.taskNumber
          //       // ?.trim()
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
  const filteredItems = arrayOfAllObjectsData.filter(
    (e: { taskNumber: string }) =>
      // includeFilterSet.has(String(e.taskNumber.trim()))
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
  const columns: ColumnsType<IInstData> = [
    {
      title: "ЗАДАЧА",
      dataIndex: "taskNumber",
      key: "taskNumber",
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
    { title: "Код", dataIndex: "code", key: "code", responsive: ["sm"] },
    { title: `${t("PN")}`, dataIndex: "PN", key: "PN", responsive: ["sm"] },

    {
      title: "НАИМЕН.",
      dataIndex: "nameOfInstrument",
      key: "nameOfInstrument",
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
        dataSource={isLoading ? [] : filteredItems}
        rowClassName="text-xs text-transform: uppercase"
        bordered
        size="small"
        scroll={{ y: "calc(17vh)" }}
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

export default InstrumentList;
