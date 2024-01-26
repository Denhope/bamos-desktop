import React, { useState, useEffect, FC } from "react";
import { Layout, Menu, MenuProps } from "antd";
import { useNavigate } from "react-router-dom";

import MenuItem from "antd/es/menu/MenuItem";
import { RouteNames } from "@/router";

import {
  TeamOutlined,
  SettingOutlined,
  AppstoreOutlined,
  ProjectOutlined,
  DatabaseOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import MTXTask from "@/components/layout/maintenance/mtx/MTXTask";
import MTXStatus from "@/components/layout/maintenance/mtx/MTXStatus";

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
  getItem("Maintenance Management (MTX)", "sub1", <AppstoreOutlined />, [
    getItem("Status", RouteNames.MTXSTATUS, <DatabaseOutlined />),
    getItem("AirCraft ", "sub2", <ProjectOutlined />, [
      getItem("Information", "/r0r2esss5244r", <DatabaseOutlined />),
      getItem("Documents", "/r0r2s5244r", <DatabaseOutlined />),
      getItem("Task/Status", RouteNames.MTXTask, <DatabaseOutlined />),
      getItem("Due List", "/r0r2254434r", <DatabaseOutlined />),
      getItem("AD/SB", "/r0r522544r", <DatabaseOutlined />),
      getItem("LogBook Entries", "/r05rs23yh244r", <DatabaseOutlined />),
      getItem("Work Orders", "sub15", <AppstoreOutlined />, [
        getItem("WO List", "/111e5r1", <SearchOutlined />),
        getItem("Add New", "/rr5ear", <PlusOutlined />),
      ]),
      getItem("Flight Log", "/r05rs23dyh244r", <DatabaseOutlined />),
    ]),
  ]),
];

const MaintenanceMTX: FC = () => {
  const navigate = useNavigate();
  const rootSubmenuKeys = ["-"];

  const [selectedKeys, setSelectedKeys] = useState<string[]>(["sub1"]);
  const [openKeys, setOpenKeys] = useState(["sub1", "sub2"]);
  useEffect(() => {
    const storedKeys = localStorage.getItem("selectedKeys");
    if (storedKeys) {
      setSelectedKeys(JSON.parse(storedKeys));

      // navigate(storedKey);
    }
  }, []);
  const handleClick = ({ selectedKeys }: { selectedKeys: string[] }) => {
    setSelectedKeys(selectedKeys);
    localStorage.setItem("selectedKeys", JSON.stringify(selectedKeys));
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
          mode="inline"
          items={items}
          onOpenChange={onOpenChange}
          onSelect={handleClick}
          openKeys={openKeys}
          selectedKeys={selectedKeys}
        />
      </Sider>
      <Content className="">
        //{selectedKeys[0] == RouteNames.MTXSTATUS && <MTXStatus />}
      </Content>
    </Layout>
  );
};

export default MaintenanceMTX;
