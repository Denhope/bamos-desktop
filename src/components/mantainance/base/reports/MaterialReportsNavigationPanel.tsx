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
import { Checkbox, Dropdown, Menu, MenuProps } from "antd";
import { saveExls } from "@/services/utilites";
import { useTranslation } from "react-i18next";
interface MaterialReportsNavigationPanelProps {
  toggleColumn: (columnKey: any) => void;
  columns: any;
  initialColumns: any;
  selectedACID: any;
  data: any[];
}
const MaterialReportsNavigationPanel = ({
  columns,
  toggleColumn,
  initialColumns,
  selectedACID,
  data,
}: MaterialReportsNavigationPanelProps) => {
  const [open, setOpen] = useState(false);
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
      label: "Sort By",
      key: "sort",
      icon: <AppstoreOutlined />,
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
          // getItem(
          //   <div onClick={() => console.log('Quick Print Card open Form')}>
          //     Selected Items
          //   </div>,
          //   '9'
          // ),

          getItem(
            <div onClick={() => saveExls(columns, data, "MaterialReport")}>
              All Items
            </div>,
            "11"
          ),
        ]),
      ],
    },

    // {
    //    label: `${t('Actions')}`,
    //   key: 'actions',
    //   icon: <SettingOutlined />,
    //   children: [
    //     getItem(
    //       <div onClick={() => setOpen(true)}>
    //         <PlusOutlined /> ADD New A/C
    //       </div>,
    //       '9ssxs'
    //     ),
    //     getItem(
    //       <div
    //         onClick={() =>
    //           selectedACID && selectedACID.length && setOpenEdit(true)
    //         }
    //       >
    //         <EditOutlined /> Edit Selected A/C
    //       </div>,
    //       '9sxs'
    //     ),
    //   ],
    // },
  ];
  const [current, setCurrent] = useState("mail");

  const onClick: MenuProps["onClick"] = (e) => {
    // console.log('click ', e);
    setCurrent(e.key);
  };

  return (
    <>
      {/* <AicrafAddForm open={open} setOpen={setOpen} />
      {selectedACID && selectedACID.length && (
        <AicrafEditForm
          open={openEdit}
          setOpen={setOpenEdit}
          selectedACNumber={selectedACID}
        />
      )} */}
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

export default MaterialReportsNavigationPanel;
