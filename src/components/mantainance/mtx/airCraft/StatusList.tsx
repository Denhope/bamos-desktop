// import React, { FC } from 'react';

// const StatusList: FC = () => {
//   return <div></div>;
// };

// export default StatusList;

import React, { FC, useState } from "react";
import { Table, Checkbox, Dropdown, Menu, Space, Row } from "antd";

import StatusNavigationPanel from "./StatusNavigationPanel";
import { IPlane } from "@/models/IPlane";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import moment from "moment";
import { setCurrentPlane, setPlaneTasks } from "@/store/reducers/MtxSlice";
import TaskViewForm from "../planeTask/TaskViewForm";
import { getPlaneByID } from "@/utils/api/thunks";
import { useTranslation } from "react-i18next";

type StatusListPropsType = {
  data: IPlane[];
};
const StatusList: FC<StatusListPropsType> = ({ data }) => {
  const { t } = useTranslation();
  const dataTab = [
    data &&
      data.map((plane: IPlane) => ({
        key: plane._id || plane.id,
        regNbr: plane.regNbr,
        status: plane.status,

        children: [
          {
            key: plane._id || plane.id,
            regNbr: plane.regNbr,
            model: plane.model,
            MOS: "MOS",
            ACDATE: moment(plane.utilisation?.ACDATE).format("DD.MM.YY"),
            ENC1DATE: moment(plane.utilisation?.ENC1DATE).format("DD.MM.YY"),
            ENC2DATE: moment(plane.utilisation?.ENC2DATE).format("DD.MM.YY"),
            APUDATE: moment(plane.utilisation?.APUDATE).format("DD.MM.YY"),
            // nextDueMOS: '12-Sep-24 ',
            // maxLimitMOS: '12-Sep-24 ',
            //timeRemainingDays: `56 d`,
            //timeAccruedMOS: '10.4',
          },
          {
            key: "1-2",
            regNbr: plane.regNbr,
            HRS: "HRS",
            ACHRS: plane.utilisation?.ACHRS,
            ENC1HRS: plane.utilisation?.ENC1HRS,
            ENC2HRS: plane.utilisation?.ENC2HRS,
            APUHRS: plane.utilisation?.APUHRS,
            //nextDueHRS: '1847:22',
            //maxLimitHRS: '1847:22',
            //timeRemainingHRS: '47:22',
            //timeAccruedHRS: '143:23',
          },
          {
            key: "1-3",
            serialNbr: plane.serialNbr,
            AFL: "AFL",
            ACAFL: plane.utilisation?.ACAFL,
            ENC1AFL: plane.utilisation?.ENC1AFL,
            ENC2AFL: plane.utilisation?.ENC2AFL,
            APUAFL: plane.utilisation?.APUAFL,
            //nextDueAFL: '690',
            //maxLimitAFL: '900',
            // timeRemainingAFL: 65,
            // timeAccruedAFL: 37,
          },
        ],
      })),
  ];

  const [open, setOpen] = useState(false);
  interface DataType {
    key: React.Key;
    regNbr: string;
    partNbr?: string;
    partSerialNbr?: string;
    MOS?: string;
    HRS?: string;
    intervalMOC?: string;
    intervalHRS?: string;
    intervalAHL?: string;
  }
  interface DataPlaneType {
    key: React.Key;
    model: string;
    planeType: string;
    regNbr: string;
    serialNbr: string;
    status?: string;
    eng1: any;
    eng2: any;
    apu: any;
    utilisation?: any;
  }

  const initialColumns = [
    {
      title: "Information",
      dataIndex: "information",
      key: "information",
      width: "17%",
      render: (text: any, record: any) =>
        record.model || record.regNbr || record.serialNbr,
    },
    {
      title: `${t("UNIT")}`,
      dataIndex: "unit",
      key: "unit",
      render: (text: any, record: any) =>
        record.MOS || record.HRS || record.AFL,
    },

    {
      title: "A/C Times",
      dataIndex: "acTimes",
      key: "acTimes",
      render: (text: any, record: any) =>
        record.ACDATE || record.ACHRS || record.ACAFL,
    },
    {
      title: "ENC1 Times",
      dataIndex: "eng1Times",
      key: "eng1Times",
      render: (text: any, record: any) =>
        record.ENC1DATE || record.ENC1HRS || record.ENC1AFL,
    },
    {
      title: "ENC2 Times",
      dataIndex: "eng2Times",
      key: "eng2Times",
      render: (text: any, record: any) =>
        record.ENC2DATE || record.ENC2HRS || record.ENC2AFL,
    },
    {
      title: "APU Times",
      dataIndex: "acTimes",
      key: "apyTimes",
      render: (text: any, record: any) =>
        record.APUDATE || record.APUHRS || record.APUAFL,
    },
    {
      title: `${t("Next Due(ENG/APU)A/C")}`,
      dataIndex: "due",
      key: "due",
      render: (text: any, record: any) =>
        record.nextDueMOS ||
        record.nextDueHRS ||
        record.nextDueAFL ||
        record.nextDueENC ||
        record.nextdueAPUS,
    },

    {
      title: `${t("Remaining")}`,
      dataIndex: "remaining",
      key: "remaining",
      render: (text: any, record: any) =>
        record.timeRemainingDays ||
        record.timeRemainingHRS ||
        record.timeRemainingHRSENC ||
        record.timeRemainingHRSAPUS ||
        record.timeRemainingAFL ||
        record.timeRemainingENC ||
        record.timeRemainingAPUS,
    },
    {
      title: "Discrepancies",
      dataIndex: "Discrepancies",
      key: "Discrepancies",
    },
  ];
  const [item, setItem] = useState(false);
  const [columns, setColumns] = useState(initialColumns);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const toggleColumn = (columnKey: any) => {
    setColumns((prevColumns: any) =>
      prevColumns.some((column: any) => column.key === columnKey)
        ? prevColumns.filter((column: any) => column.key !== columnKey)
        : [
            ...prevColumns,
            initialColumns.find((column) => column.key === columnKey),
          ]
    );
  };

  const onSelectChange = (selectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const menu = (
    <Menu>
      {initialColumns.map((column) => (
        <Menu.Item key={column.key}>
          <Checkbox
            checked={columns.some((col) => col.key === column.key)}
            onChange={() => toggleColumn(column.key)}
          >
            {column.title}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );
  const dispatch = useAppDispatch();

  return (
    <>
      <StatusNavigationPanel
        selectedRowKeys={selectedRowKeys}
        toggleColumn={toggleColumn}
        columns={columns}
        initialColumns={initialColumns}
        selectedACID={selectedRowKeys[0]}
      ></StatusNavigationPanel>
      <div className=" h-[74vh] overflow-y-scroll relative overflow-hidden ">
        {dataTab &&
          dataTab.length > 0 &&
          dataTab[0].map((row: any) => (
            <div key={row.key}>
              <Table<any>
                // rowSelection={rowSelection}
                columns={columns}
                rowClassName="cursor-pointer  text-xs text-transform: uppercase"
                dataSource={row.children}
                bordered
                pagination={false}
                size="small"
                title={() => (
                  <Row justify="space-between">
                    <Space>
                      <Checkbox
                        className="text-sm font-bold"
                        checked={selectedRowKeys.includes(row.key)}
                        onChange={() =>
                          onSelectChange(
                            selectedRowKeys.includes(row.key)
                              ? selectedRowKeys.filter((key) => key !== row.key)
                              : [...selectedRowKeys, row.key]
                          )
                        }
                      ></Checkbox>
                      <Row className="align-middle">
                        <a
                          onClick={() => {
                            dispatch(getPlaneByID(row.key));
                            localStorage.setItem(
                              "currentPlaneID",
                              JSON.stringify(row.key)
                            );
                            dispatch(setPlaneTasks([]));
                            setOpen(true);
                            setItem(row);
                          }}
                        >
                          {row.regNbr}
                        </a>
                        {/* <div className="ml-2"> {row.description}</div> */}
                      </Row>
                    </Space>
                    <Row>
                      <div className=" font-bold">{row.status}</div>
                    </Row>{" "}
                  </Row>
                )}
                footer={() => (
                  <Row justify="space-between">
                    <div>
                      {" "}
                      {
                        <Row>
                          <div>Status#:</div>
                          <a className="font-semibold ml-2">{row.status}</a>
                        </Row>
                      }
                    </div>
                  </Row>
                )}
              />
            </div>
          ))}
      </div>

      <TaskViewForm open={open} setOpen={setOpen} task={item}></TaskViewForm>
    </>
  );
};

export default StatusList;
