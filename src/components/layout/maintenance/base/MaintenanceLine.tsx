import React, { useState, useEffect, FC } from "react";
import { Layout, Menu, MenuProps } from "antd";
import { Routes, Route, Outlet, Link, useNavigate } from "react-router-dom";
import { MailOutlined } from "@ant-design/icons";
import MenuItem from "antd/es/menu/MenuItem";
import { RouteNames } from "@/router";

import {
  FileTextOutlined,
  AppstoreOutlined,
  ProjectOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import MTXTask from "@/components/layout/maintenance/mtx/MTXTask";
import MTXStatus from "../mtx/MTXStatus";
const { Sider, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number];
function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  // path?: any,
  type?: "group"
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    // path,
    type,
  } as MenuItem;
}
const items: MenuItem[] = [
  getItem("Line Maintenance", "sub1", <ProjectOutlined />, [
    getItem("Work Orders", "sub2", <AppstoreOutlined />, [
      getItem("Поиск", "/1111", <SearchOutlined />),
      getItem("Создать", "/rrr", <PlusOutlined />),
      getItem("Отчет", "/ffff", <FileTextOutlined />),
    ]),
    getItem("NRC", "sub3", <AppstoreOutlined />, [
      getItem("Поиск", "/114411", <SearchOutlined />),
      getItem("Создать", "/rr44r", <PlusOutlined />),
      getItem("Отчет", "/fff44f", <FileTextOutlined />),
    ]),
  ]),
];

const MaintenanceLine: FC = () => {
  const navigate = useNavigate();
  const rootSubmenuKeys = [
    "sub1",
    "sub4",
    "sub9",
    "sub12",
    "sub16",
    "sub90",
    "sub20",
    "sub21",
  ];
  const [openKeys, setOpenKeys] = useState(["sub1"]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  useEffect(() => {
    const storedKey = localStorage.getItem("selectedKey");
    if (storedKey) {
      setSelectedKey(storedKey);
      // navigate(storedKey);
    }
  }, []);
  const handleClick = (e: any) => {
    setSelectedKey(e.key);
    localStorage.setItem("selectedKey", e.key);
    //navigate(e.key);
  };

  const onOpenChange: MenuProps["onOpenChange"] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout>
      <Sider
        theme="light"
        style={{
          // marginLeft: 'auto',
          background: "rgba(255, 255, 255, 0.2)",
        }}
        width={300}
        // trigger
        collapsible
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        <Menu
          theme="light"
          openKeys={openKeys}
          defaultSelectedKeys={["/"]}
          mode="inline"
          items={items}
          onOpenChange={onOpenChange}
          onClick={handleClick}
        />
      </Sider>
      <Content>
        <Routes>
          <Route element={<MTXStatus />} path={RouteNames.MTXSTATUS} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default MaintenanceLine;
