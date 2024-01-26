import {
  Empty,
  MenuProps,
  Row,
  Skeleton,
  Space,
  Spin,
  Table,
  message,
} from "antd";
import Title from "antd/es/typography/Title";
import NavigationPanel from "@/components/shared/NavigationPanel";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import React, { FC, useState } from "react";
import {
  AppstoreOutlined,
  FilterOutlined,
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
import { exportToExcel } from "@/services/utilites";
import DrawerPanel from "@/components/shared/DrawerPanel";
import WOAddForm from "./WOAddForm";
import moment from "moment";
import { IPlaneWO } from "@/models/IPlaneWO";
import WOEditForm from "./WOEditForm";
import { editPlaneWO, getFilteredPlanesWO } from "@/utils/api/thunks";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { USER_ID } from "@/utils/api/http";
type PlaneWOListPropsType = {
  data: IPlaneWO[];
  isLoading: boolean;
  onRowClick: (record: IPlaneWO) => void;
};
const WOList: FC<PlaneWOListPropsType> = ({ data, isLoading, onRowClick }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [openAddWOForm, setOpenAddWOForm] = useState(false);
  const [openEditWOForm, setOpenEditWOForm] = useState(false);
  const initialColumns = [
    {
      title: "WORKORDER",
      dataIndex: "WONbr",
      key: "WONbr",
      render: (text: any, record: any) => <a>{record.WONbr}</a>,
      width: "17%",
    },

    {
      title: `${t("DATE IN")}`,
      dataIndex: "dateIn",
      key: "dateIn",
      render(text: Date) {
        return text && moment(text).format("DD-MM-YYYY");
      },

      width: "17%",
    },
    {
      title: `${t("DATE OUT")}`,
      dataIndex: "dateOut",
      key: "dateOut",
      render(text: Date) {
        return text && moment(text).format("DD-MM-YYYY");
      },
    },
    {
      title: "DATE/TIME CLOSE",
      dataIndex: "dateClose",
      key: "dateClose",
      render(text: Date) {
        return text && moment(text).format("DD-MM-YYYY");
      },
    },

    {
      title: `${t("TYPE")}`,
      dataIndex: "classification",
      key: "classification",
      render: (text: any, record: any) => record.classification,
    },
    {
      title: `${t("CREATE BY")}`,
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
      title: `${t("Items")}`,
      dataIndex: "items",
      key: "items",
      // render: (text: any, record: any) => data.length,
    },
    {
      title: "DATE CREATED",
      dataIndex: "dateCreate",
      key: "dateCreate",
      render(text: Date) {
        return text && moment(text).format("DD-MM-YYYY");
      },
    },

    {
      title: "LAST MODIFIED",
      dataIndex: "updateDate",
      key: "updateDate",
      render(text: Date) {
        return text && moment(text).format("DD-MM-YYYY");
      },
    },
    {
      title: "ATTACHED FILES",
      dataIndex: "doc",
      key: "doc",
      render(text: Date) {
        return <FileMarkdownOutlined className="text-xl cursor-pointer" />;
      },
    },
    {
      title: `${t("NOTE")}`,
      dataIndex: "note",
      key: "note",
      render(text: Date) {
        return <FileTextOutlined className="text-xl  cursor-pointer" />;
      },
    },
  ];

  const [columns, setColumns] = useState(initialColumns);
  const [selectedColumns, setSelectedColumns] = useState(
    columns.map((column: any) => column.key)
  );
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
      label: `${t("Add New Work Order")}`,
      key: "WO",
      icon: <PlusOutlined />,
      onClick: () => {
        setOpenAddWOForm(true);
      },
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
            onClick={() => {
              const selectedCount = selectedRowKeys && selectedRowKeys.length;
              if (selectedCount !== 1) {
                message.error("Please select only one Item.");
                return;
              }

              setOpenEditWOForm(true);
            }}
          >
            <EditOutlined /> Edit WO
          </div>,
          "9sshhhxs"
        ),
        getItem(
          <div
            onClick={async () => {
              const selectedCount = selectedRowKeys && selectedRowKeys.length;
              if (selectedCount !== 1) {
                message.error("Please select only one Item.");
                return;
              }

              const result = await dispatch(
                editPlaneWO({
                  id: `${selectedRowKeys[0]}`,
                  dateClose: new Date(),
                  status: "C/W",
                  userID: USER_ID || "",
                  planeID: JSON.parse(
                    localStorage.getItem("currentPlaneID") || ""
                  ),
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
                toast.success("WO Close Sucsess");
                const currentPlaneID = localStorage.getItem("currentPlaneID");
                if (currentPlaneID) {
                  dispatch(
                    getFilteredPlanesWO({ planeID: JSON.parse(currentPlaneID) })
                  );
                }
              } else {
                toast.error("Error");
              }
            }}
          >
            <CloseOutlined /> Close WO
          </div>,
          "9sshsssshhxs"
        ),
        getItem(
          <div
            onClick={async () => {
              const currentPlaneID = localStorage.getItem("currentPlaneID");
              const selectedCount = selectedRowKeys && selectedRowKeys.length;
              if (selectedCount !== 1) {
                message.error("Please select only one Item.");
                return;
              }
              const result = await dispatch(
                editPlaneWO({
                  id: `${selectedRowKeys[0]}`,
                  // dateClose: new Date(),
                  status: "CANCELLED",
                  userID: USER_ID || "",
                  planeID: JSON.parse(
                    localStorage.getItem("currentPlaneID") || ""
                  ),
                })
              );
              if (result.meta.requestStatus === "fulfilled") {
                toast.success("WO CANCELLED");
                const currentPlaneID = localStorage.getItem("currentPlaneID");
                if (currentPlaneID) {
                  dispatch(
                    getFilteredPlanesWO({ planeID: JSON.parse(currentPlaneID) })
                  );
                }
              } else {
                toast.error("Error");
              }
            }}
          >
            <StopOutlined /> Cansel WO
          </div>,
          "9sshssssishhxs"
        ),
      ],
    },
  ];

  return (
    <div className="flex my-0  flex-col h-[74vh]">
      <Row>
        <div className="w-4/12">
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
            <>
              {" "}
              {t("Selected items")}: {selectedRowKeys.length}
            </>
          </Space>
          {/* )} */}

          <Space className="ml-auto">
            <>
              {t("items")}: {data.length}
            </>
          </Space>
        </Space>
      </Row>

      {isLoading && (
        <Spin
          style={{ height: "76vh" }}
          className="flex  flex-col items-center justify-center"
          tip="Loading"
          size="large"
        ></Spin>
      )}
      {!isLoading && data.length ? (
        <Table
          onRow={(record) => ({ onClick: () => onRowClick(record) })}
          rowKey="_id"
          className="my-1"
          rowSelection={rowSelection}
          columns={columns.filter((column: any) =>
            selectedColumns.includes(column.key)
          )}
          rowClassName="text-xs text-transform: uppercase"
          size="small"
          bordered
          // scroll={{ y: `${scroll}` }}
          scroll={{ y: "calc(76vh)" }}
          dataSource={isLoading ? [] : data}
          pagination={false}
          locale={{
            emptyText: isLoading ? <Skeleton active={true} /> : <Empty />,
          }}
        ></Table>
      ) : (
        <>{!isLoading && <Empty></Empty>}</>
      )}

      <DrawerPanel
        title={"ADD NEW WO"}
        size={"medium"}
        placement={"right"}
        open={openAddWOForm}
        onClose={setOpenAddWOForm}
      >
        <WOAddForm></WOAddForm>
      </DrawerPanel>
      <DrawerPanel
        title={"Edit WO"}
        size={"medium"}
        placement={"right"}
        open={openEditWOForm}
        onClose={setOpenEditWOForm}
      >
        <WOEditForm selectedWOumber={selectedRowKeys[0]}></WOEditForm>
      </DrawerPanel>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default WOList;
