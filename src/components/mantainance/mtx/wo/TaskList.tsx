import { IPlaneTaskResponce } from "@/models/ITask";
import moment from "moment";
import React, { FC, useEffect, useState } from "react";
import {
  DownloadOutlined,
  StopOutlined,
  CloseOutlined,
  SettingOutlined,
  PlusOutlined,
  PrinterOutlined,
  EditOutlined,
  FileMarkdownOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  Empty,
  MenuProps,
  Row,
  Skeleton,
  Space,
  Spin,
  Table,
  theme,
  Button,
  Drawer,
} from "antd";
import { exportToExcel } from "@/services/utilites";
import NavigationPanel from "@/components/shared/NavigationPanel";
import {
  getFilteredPlanesTasksForWO,
  getPlaneWOByID,
} from "@/utils/api/thunks";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import Title from "antd/es/typography/Title";
import { IPlaneWO } from "@/models/IPlaneWO";
import Statistic from "./Statistic";

import WOEditForm from "./WOEditForm";
import DrawerPanel from "@/components/shared/DrawerPanel";
import { useTranslation } from "react-i18next";
type PlaneTaskWOListPropsType = {
  data: IPlaneTaskResponce[];
  woNbr?: string;
  woID?: string;
  isLoading: boolean;
};
const TaskList: FC<PlaneTaskWOListPropsType> = ({
  data,
  // isLoading,
  woNbr,
  woID,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { isLoading } = useTypedSelector((state) => state.planes);
  const [planeTasks, setPlaneTasks] = useState([]);
  const [planeWO, setPlaneWO] = useState<IPlaneWO | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const currentPlaneID = localStorage.getItem("currentPlaneID");
      if (currentPlaneID && woID) {
        const result = await dispatch(
          getFilteredPlanesTasksForWO({
            planeID: JSON.parse(currentPlaneID),
            // workOrderNbr: woNbr,
            workOrderID: woID,
          })
        );
        if (result.meta.requestStatus === "fulfilled") {
          setPlaneTasks(result.payload);
        }
        const planeWO = await getPlaneWOByID(woID).then((wo) => setPlaneWO(wo));
        // setPlaneTasks(planeWO);
      }
    };

    fetchData();
  }, [dispatch]);

  const initialColumns = [
    {
      title: `${t("Item Number.")}`,
      dataIndex: "taskNbr",
      key: "taskNbr",
      render: (text: any, record: any) => <a>{record.taskNbr}</a>,
      width: "17%",
    },

    {
      title: `${t("Description")}`,
      dataIndex: "description",
      key: "description",
      // render(text: Date) {
      //   return text && moment(text).format('DD-MM-YYYY');
      // },

      width: "17%",
    },
    {
      title: `${t("Status")}`,
      dataIndex: "status",
      key: "status",
    },
    {
      title: `${t("Est. Due")}`,
      dataIndex: "estimatedDueDate",
      key: "estimatedDueDate",
      render(text: Date) {
        return text && moment(text).format("DD-MM-YYYY");
      },
    },

    {
      title: `${t("Create By")}`,
      dataIndex: "userId",
      key: "userId",
      render: (text: any, record: any) => record.userId,
    },

    {
      title: `${t("Status")}`,

      dataIndex: "status",
      key: "status",
      render: (text: any, record: any) => record.status,
    },
    {
      title: `${t("Ata")}`,
      dataIndex: "ata",
      key: "ata",
      // render: (text: any, record: any) => data.length,
    },
    {
      title: `${t("Task Type")}`,
      dataIndex: "tasktypeLookup",
      key: "tasktypeLookup",
      // render: (text: any, record: any) => data.length,
    },

    {
      title: `${t("Date Create")}`,
      dataIndex: "dateCreate",
      key: "dateCreate",
      render(text: Date) {
        return text && moment(text).format("DD-MM-YYYY");
      },
    },

    // {
    //   title: 'Last Modified',
    //   dataIndex: 'updateDate',
    //   key: 'updateDate',
    //   render(text: Date) {
    //     return text && moment(text).format('DD-MM-YYYY');
    //   },
    // },

    {
      title: `${t("Note")}`,
      dataIndex: "note",
      key: "note",
      render(text: any) {
        return <FileTextOutlined className="text-xl  cursor-pointer" />;
      },
    },
  ];
  const [columns, setColumns] = useState(initialColumns);
  const [selectedColumns, setSelectedColumns] = useState(
    columns.map((column: any) => column.key)
  );
  const [openAddWOForm, setOpenAddWOForm] = useState(false);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const handleMenuClick = (e: { key: React.Key }) => {
    if (selectedColumns.includes(e.key)) {
      setSelectedColumns(selectedColumns.filter((key: any) => key !== e.key));
    } else {
      setSelectedColumns([...selectedColumns, e.key]);
    }
  };
  type MenuItem = Required<MenuProps>["items"][number];
  function getItem(
    label: React.ReactNode,
    key?: React.Key | null,
    icon?: React.ReactNode,
    children?: any[],
    type?: "group"
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  }
  const items: MenuProps["items"] = [
    {
      label: `${t("Add Items from")}`,
      key: "add",
      icon: <PlusOutlined />,
      // onClick: () => {
      //   setOpenAddWOForm(true);
      // },
    },

    {
      label: `${t("Report")}`,
      key: "print",
      icon: null,
      children: [
        // getItem('Print Status Report', 'sub4', <PrinterOutlined />, [
        getItem("Print", "sub4.1", null, [
          getItem("Selected Items", "sub4.1.1", <PrinterOutlined />),
          getItem(
            <div
            // onClick={() => setOpenAddAppForm(true)}
            >
              <PrinterOutlined /> All Items
            </div>,
            "9ssxs"
          ),
        ]),

        getItem("Export to Exel", "sub5", "", [
          getItem(
            <div
              onClick={() =>
                selectedRowKeys &&
                selectedRowKeys.length > 0 &&
                exportToExcel(
                  false,
                  selectedRowKeys,
                  selectedColumns,
                  data,
                  `Filtred-WO-${data[0].regNbr}`
                )
              }
            >
              <DownloadOutlined /> Selected Items
            </div>,
            "5.1"
          ),
          getItem(
            <div
              onClick={() =>
                data.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  selectedColumns,
                  data,
                  `ALL-WO-${data[0].regNbr}`
                )
              }
            >
              <DownloadOutlined /> All Items
            </div>,
            "5.2"
          ),
        ]),
        // ]),
      ],
    },

    {
      label: `${t("Actions")}`,
      key: "actions",
      icon: <SettingOutlined />,
      children: [
        getItem(
          <div
          // onClick={() => setOpenAddAppForm(true)}
          >
            <StopOutlined />
            Delete Items
          </div>,
          "9ss2hhhxs"
        ),
        getItem(
          <div
          // onClick={() => setOpenAddAppForm(true)}
          >
            Transfer Items
          </div>,
          "9sshssyyyysshhxs"
        ),
        getItem(
          <div
          // onClick={() => setOpenAddAppForm(true)}
          >
            Copy Items to
          </div>,
          "9sshstsssishhxs"
        ),
        getItem(
          <div
          // onClick={() => setOpenAddAppForm(true)}
          >
            <EditOutlined /> Edit selected Item
          </div>,
          "9sshsssswishhxs"
        ),
        getItem(
          <div
          // onClick={() => setOpenAddAppForm(true)}
          >
            Update Rewiew Status
          </div>,
          "9sshysssysishhxs"
        ),
      ],
    },
  ];
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);
  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  const [openEditWOForm, setOpenEditWOForm] = useState(false);

  return (
    <div className="flex my-0 mx-auto flex-col h-[74vh] relative">
      <Row justify={"space-between"} className=" ">
        <Space className="">
          <EditOutlined
            onClick={() => setOpenEditWOForm(true)}
            className="cursor-pointer"
          />
          <a onClick={showDrawer}>{woNbr}</a>-
          <>{planeWO && planeWO?.description}</>
        </Space>{" "}
        <Space>
          <>
            {t("Date In")}:{" "}
            {planeWO && moment(planeWO?.dateIn).format("DD-MMM-YYYY")}
          </>
        </Space>
        <Space>
          <>
            {t("Date Out")}:{" "}
            {planeWO && moment(planeWO?.dateOut).format("DD-MMM-YYYY")}
          </>
        </Space>
      </Row>{" "}
      <Row>
        <div className="w-4/12 ">
          <NavigationPanel
            onMenuClick={handleMenuClick}
            columns={columns}
            selectedColumns={selectedColumns}
            menuItems={items}
            selectedRows={selectedRowKeys}
            data={isLoading ? [] : []}
            isSorting={false}
            isView={true}
            sortOptions={[]}
          />
        </div>
        <Space className="ml-auto">
          {/* {selectedRowKeys.length && selectedRowKeys.length > 0 && ( */}
          <Space className="ml-auto">
            {t("Selected items")}: {selectedRowKeys.length}
          </Space>
          {/* )} */}

          <Space className="ml-auto">
            <>
              {t("items")}: {planeTasks.length}
            </>
          </Space>
        </Space>
      </Row>
      {isLoading && (
        <Spin
          style={{ height: "74vh" }}
          className="flex  flex-col items-center justify-center"
          tip="Loading"
          size="large"
        ></Spin>
      )}
      {!isLoading && planeTasks.length > 0 ? (
        <div className="relative">
          <Drawer
            title={woNbr}
            placement="top"
            closable={false}
            onClose={onClose}
            open={open}
            getContainer={false}
          >
            <Row>
              <Space className="w-2/5">Info</Space>
              <div className="w-3/5">{/* <Statistic></Statistic> */}</div>
            </Row>
          </Drawer>
          <Table
            scroll={
              { y: "calc(69vh)" }
              // !isProjectTAskListFull ? { y: 'calc(55vh)' } : { y: 'calc(25vh)' }
            }
            pagination={false}
            // onRow={(record) => ({ onClick: () => onRowClick(record) })}
            rowKey="_id"
            className="my-1 "
            rowSelection={rowSelection}
            columns={columns.filter((column: any) =>
              selectedColumns.includes(column.key)
            )}
            rowClassName="text-xs text-transform: uppercase"
            size="small"
            bordered
            dataSource={isLoading ? [] : planeTasks}
            locale={{
              emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
            }}
          ></Table>
        </div>
      ) : (
        <>{!isLoading && <Empty></Empty>}</>
      )}
      <DrawerPanel
        title={"Edit WO"}
        size={"medium"}
        placement={"right"}
        open={openEditWOForm}
        onClose={setOpenEditWOForm}
      >
        <WOEditForm selectedWOumber={planeWO?.id}></WOEditForm>
      </DrawerPanel>
    </div>
  );
};

export default TaskList;
