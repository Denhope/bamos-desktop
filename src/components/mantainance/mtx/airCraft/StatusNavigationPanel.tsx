import React, { FC, useState } from "react";
import {
  AppstoreOutlined,
  MailOutlined,
  EditOutlined,
  SettingOutlined,
  DeleteColumnOutlined,
  PlusOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Checkbox, Dropdown, Menu, MenuProps, message } from "antd";
import AicraftList from "./AicrafViewList";
import AicrafAddForm from "./AirCraftViewAddForm";
import AicrafEditForm from "./AirCraftViewEditForm";
import DrawerPanel from "@/components/shared/DrawerPanel";
import EngineAddForm from "./EngineAddForm";
import ApuAddForm from "./ApuAddForm";
import { useTranslation } from "react-i18next";

interface StatusNavigationPanelProps {
  toggleColumn: (columnKey: any) => void;
  columns: any;
  initialColumns: any;
  selectedACID: any;
  selectedRowKeys: any[];
}
const StatusNavigationPanel = ({
  columns,
  toggleColumn,
  initialColumns,
  selectedACID,
  selectedRowKeys,
}: StatusNavigationPanelProps) => {
  const [open, setOpen] = useState(false);
  const [openAddEngine, setOpenAddEngine] = useState(false);
  const [openAddApu, setOpenAddApu] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const { t } = useTranslation();
  const menu = (
    <Menu>
      {initialColumns.map((column: any) => (
        <Menu.Item key={column.key}>
          <Checkbox
            checked={columns.some(
              (col: { key: any }) => col.key === column.key
            )}
            onChange={() => toggleColumn(column.key)}
          >
            {column.title}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );
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
      label: "VIEWS",
      key: "views",
      icon: <SettingOutlined />,
      children: [
        {
          label: (
            <Dropdown overlay={menu}>
              <a onClick={(e) => e.preventDefault()}>Columns</a>
            </Dropdown>
          ),
          key: "setting:188",
        },
      ],
    },

    {
      label: `${t("Print")}`,
      key: "print",
      icon: <AppstoreOutlined />,
      children: [
        // {
        //   label: (
        //     <div onClick={() => console.log('Quick Print Card open Form')}>
        //       <PrinterOutlined className="mr-2" />
        //       Quick Print Card
        //     </div>
        //   ),

        //   key: 'setting:1',
        // },
        getItem("Print Status Report", "sub4", <PrinterOutlined />, [
          getItem(
            <div onClick={() => console.log("Quick Print Card open Form")}>
              Selected Items
            </div>,
            "9"
          ),

          getItem(
            <div onClick={() => console.log("Quick Print Card open Form")}>
              All Items
            </div>,
            "11"
          ),
        ]),
      ],
    },

    {
      label: `${t("Actions")}`,
      key: "actions",
      icon: <SettingOutlined />,
      children: [
        getItem(
          <div onClick={() => setOpen(true)}>
            <PlusOutlined /> {t("ADD New A/C")},
          </div>,
          "9ssxs"
        ),
        getItem(
          <div onClick={() => setOpenAddApu(true)}>
            <PlusOutlined /> ADD New APU
          </div>,
          "Apus"
        ),
        getItem(
          <div onClick={() => setOpenAddEngine(true)}>
            <PlusOutlined /> ADD New ENGINE
          </div>,
          "Engine"
        ),
        getItem(
          <div
            // onClick={() => setOpenEdit(true)}
            onClick={() => {
              const selectedCount = selectedRowKeys && selectedRowKeys.length;
              if (selectedCount !== 1) {
                message.error("Please select  one Item.");
                return;
              }
              setOpenEdit(true);
            }}
          >
            <EditOutlined /> Edit Selected A/C
          </div>,
          "9sxs"
        ),
      ],
    },
  ];
  const [current, setCurrent] = useState("mail");

  const onClick: MenuProps["onClick"] = (e) => {
    // console.log('click ', e);
    setCurrent(e.key);
  };

  return (
    <>
      <AicrafAddForm open={open} setOpen={setOpen} />
      {selectedACID && selectedACID.length && (
        <AicrafEditForm
          open={openEdit}
          setOpen={setOpenEdit}
          selectedACNumber={selectedACID}
        />
      )}
      <DrawerPanel
        title={"ADD NEW ENGINE"}
        size={"medium"}
        placement={"right"}
        open={openAddEngine}
        onClose={setOpenAddEngine}
      >
        <EngineAddForm></EngineAddForm>
      </DrawerPanel>
      <DrawerPanel
        title={"ADD NEW APU"}
        size={"medium"}
        placement={"right"}
        open={openAddApu}
        onClose={setOpenAddApu}
      >
        <ApuAddForm></ApuAddForm>
      </DrawerPanel>
      <Menu
        style={{
          // marginLeft: 'auto',
          background: "rgba(255, 255, 255, 00)",
        }}
        onClick={onClick}
        selectedKeys={[current]}
        mode="horizontal"
        items={items}
      />
    </>
  );
};

export default StatusNavigationPanel;
