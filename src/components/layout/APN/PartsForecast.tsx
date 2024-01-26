import React, { useState, useEffect, FC } from "react";
import { Layout, Menu, MenuProps, TabPaneProps, Tabs } from "antd";

import { DatabaseOutlined } from "@ant-design/icons";

import { RouteNames } from "@/router";
import { v4 as originalUuidv4 } from "uuid"; // Импортируйте библиотеку uuid
import { ApartmentOutlined } from "@ant-design/icons";

import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";

import TabPane from "antd/es/tabs/TabPane";

import RemoverdItems from "@/components/mantainance/removeInstallComponents/RemoverdItems";
import { useTranslation } from "react-i18next";
import WOFilterForm from "@/components/mantainance/base/systemWO/woProcess/WOProcessForm";

import WOTask from "@/components/mantainance/base/systemWO/woProcess/Task";
import { ProCard } from "@ant-design/pro-components";
import Title from "antd/es/typography/Title";
import RequirementItems from "@/components/store/RequirementItems";
import ForecastFilteredForm from "../planning/planningForecast/ForecastFilteredForm";
import { getItem } from "@/services/utilites";

const { Sider, Content } = Layout;
interface PartsForecast {
  onDoubleClick?: (record: any, rowIndex?: any) => void;
  onSingleRowClick?: (record: any, rowIndex?: any) => void;
}
const PartsForecast: FC<PartsForecast> = ({
  onDoubleClick,
  onSingleRowClick,
}) => {
  const { t } = useTranslation();
  const [issuedRecord, setIssuedRecord] = useState(false);
  const [issuedtDrawer, setOpenIssuedDrawer] = useState(false);
  const [selectedObject, setSelectedObject] = useState({
    PART_NUMBER: "",
    QUANTITY: 0,
    NAME_OF_MATERIAL: "",
  });
  const onIssuedClick = (record: any) => {
    setIssuedRecord(record);
    setOpenIssuedDrawer(true);
  };
  const dispatch = useAppDispatch();
  const { projects } = useTypedSelector((state) => state.mtbase);
  const {
    projectTasks,
    isLoading,
    currentProject,
    projectGroups,
    isLoadingWO,
  } = useTypedSelector((state) => state.mtbase);

  const rootSubmenuKeys = [""];

  const [openKeys, setOpenKeys] = useState(["sub1", "sub2"]);
  const [selectedKey, setSelectedKey] = useState<string>(
    RouteNames.BASETASKLIST
  );
  const uuidv4: () => string = originalUuidv4;
  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    RouteNames.BASETASKLIST,
  ]);
  useEffect(() => {
    const storedKeys = localStorage.getItem("selectedKeys");
    if (storedKeys) {
      setSelectedKeys(JSON.parse(storedKeys));

      // navigate(storedKey);
    }
  }, []);
  const onFilterWO = (record: any) => {
    const tab: TabData = {
      key: `${record.projectTaskWO}`, // уникальный ключ для каждой вкладки
      title: `WO: ${record.projectTaskWO}`,
      content: (
        <ProCard className="h-[79vh] overflow-hidden">
          <WOTask currentTask={record}></WOTask>
        </ProCard>
      ),
      closable: true,
    };

    if (!panes.find((pane) => pane.key === tab.key)) {
      setPanes((prevPanes) => [...prevPanes, tab]);
    }

    setActiveKey(tab.key);
  };

  interface TabData extends TabPaneProps {
    key: string;
    title: string;
    content: React.ReactNode;
  }
  const [activeKey, setActiveKey] = useState<string>(""); // Используйте строку вместо массива
  const [panes, setPanes] = useState<TabData[]>([]);
  const onOpenChange: MenuProps["onOpenChange"] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const [collapsed, setCollapsed] = useState(false);
  const onEdit = (
    targetKey:
      | string
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>,
    action: "add" | "remove"
  ) => {
    if (typeof targetKey === "string") {
      if (action === "remove") {
        const newPanes = panes.filter((pane) => pane.key !== targetKey);
        setPanes(newPanes);
        if (newPanes.length > 0) {
          setActiveKey(newPanes[newPanes.length - 1].key);
        }
      }
    } else {
      // Обработка события мыши или клавиатуры
    }
  };
  type MenuItem = Required<MenuProps>["items"][number];

  const items: MenuItem[] = [
    getItem(
      <>{t("PARTS CONSUMPTION FORECAST")} (BAN:204)</>,
      "sub1",
      <ApartmentOutlined />
    ),
  ];
  return (
    <Layout>
      <Sider
        className="h-[85vh] overflow-hidden"
        theme="light"
        width={350}
        style={
          {
            // marginLeft: 'auto',
            // background: 'rgba(255, 255, 255, 0.2)',
          }
        }
        // trigger
        collapsible
        // color="rgba(255, 255, 255, 0.2)"
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        {/* {!collapsed && (
          <Title className="px-5" level={5}>
            <>{t('PARTS CONSUMPTION FORECAST (BAN:204)')}</>
          </Title>
        )} */}
        <Menu
          theme="light"
          // className="h-max"
          // defaultSelectedKeys={['/']}
          mode="inline"
          items={items}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          selectedKeys={selectedKeys}
        />
        <div className="mx-auto px-5">
          <div
            style={{
              display: !collapsed ? "block" : "none",
            }}
          >
            <ForecastFilteredForm
            //onFilterWO={onFilterWO}
            ></ForecastFilteredForm>
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <ProCard className="h-[79vh] overflow-hidden">
          <RequirementItems
            onDoubleRowClick={(record) => {
              onDoubleClick && onDoubleClick(record);
            }}
            data
            isLoading={false}
            scroll={60}
            scrollX={2500}
            projectTaskData={null}
            onReqClick={function (record: any): void {
              console.log("");
            }}
          />
        </ProCard>
      </Content>
    </Layout>
  );
};

export default PartsForecast;
