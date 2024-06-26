import React, { FC, useEffect, useState } from "react";
import { Layout, Menu, Skeleton, TabPaneProps, Tabs } from "antd";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import logoImage from "../../assets/img/407Technics_logo.png";
// import logoImage from '../../assets/img/Image.jpg';

import {
  HomeOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
  SisternodeOutlined,
  SettingOutlined,
  ProjectOutlined,
  ExclamationCircleOutlined,
  GroupOutlined,
} from "@ant-design/icons";

import { MenuItem, getItem } from "@/services/utilites";
import { RouteNames } from "@/router";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ProCard } from "@ant-design/pro-components";
import TabPane from "antd/es/tabs/TabPane";

import WPGeneration from "./planning/WPGeneration/WPGeneration";
import MaterialsStore from "./store/StoresMaterials";
import MaintenanceBase from "./maintenance/base/MaintenanceBase";
import MaintenanceMTX from "./maintenance/mtx/MaintenanceMTX";
import WorkOrder from "./APN/WorkOrder";
import StockInformstion from "./APN/StockInformation";
import PartsForecast from "./APN/PartsForecast";
import PickSlipViwer from "./APN/PickSlipViwer";
import { Content, Footer } from "antd/es/layout/layout";
import PickSlipConfirmation from "./APN/PickSlipConfirmation";
import PickSlipCancel from "./APN/PickSlipCancel";
import StoreManagment from "./APN/StoreManagment";
import PartsTransfer from "./APN/PartsTransfer";
import GoodsReciving from "./APN/GoodsReciving";
import OrderCreator from "./APN/OrderCreator";
import ReceivingTracking from "./APN/ReceivingTracking";
import PartAdministration from "./APN/PartAdministration";
import ShelfExpiry from "./APN/ShelfExpiry";
import CancelReceiving from "./APN/CancelReceiving";
import ScrapMaterial from "./APN/ScrapMaterial";
import PartsTracking from "./APN/PartsTracking";
import ProjectManagment from "./APN/ProjectManagment";
import ProjectViewer from "./APN/ProjectViewer";
import OrderManagment from "./APN/OrderManagment";
type homePropsType = { apnRoute: any | null };
const Home: FC<homePropsType> = ({ apnRoute }) => {
  const onMenuClick = ({ key }: { key: string }) => {
    let tab:
      | {
          key: string;
          title: string;
          content: JSX.Element;
          closable: boolean;
        }
      | undefined;
    // Если вкладки не существует, создаём новую и устанавливаем её в качестве активной
    if (key == RouteNames.WORKPACKGEN) {
      tab = {
        key,

        title: `${t(`WP GENERATION`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <WPGeneration />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.WORKORDER) {
      tab = {
        key,

        title: `${t(`WORKORDER`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <WorkOrder />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.ORDER_MANAGMENT) {
      tab = {
        key,

        title: `${t(`ORDER MANAGMENT`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <OrderManagment />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.SCRAP_MATERIAL) {
      tab = {
        key,

        title: `${t(`SCRAP MATERIAL`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <ScrapMaterial />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.STOCK_NFORMATIONS) {
      tab = {
        key,

        title: `${t(`STOCK INFORMATION`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <StockInformstion />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.PARTS_TRANSFER) {
      tab = {
        key,

        title: `${t(`PARTS TRANSFER`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <PartsTransfer />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.PARTS_TRACKING) {
      tab = {
        key,

        title: `${t(`PARTS TRACKING`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <PartsTracking />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.PARTS_FORECAST) {
      tab = {
        key,
        title: `${t(`PARTS CONSUMPTION FORECAST`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <PartsForecast />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.PICKSLIP_VIEWER) {
      tab = {
        key,
        title: `${t(`PICKSLIP VIEWER`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <PickSlipViwer />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.PICKSLIP_CONFIRMATIONS) {
      tab = {
        key,
        title: `${t(`PICKSLIP CONFIRMATION`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <PickSlipConfirmation />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.PICKSLIP_CANCEL) {
      tab = {
        key,
        title: `${t(`CANCEL PICKSLIP`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <PickSlipCancel />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.RESERVING_TRACK) {
      tab = {
        key,
        title: `${t(`RECEIVING VIEWER`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <ReceivingTracking />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.CANCEL_RESERVING) {
      tab = {
        key,
        title: `${t(`CANCEL RECEIVING `)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <CancelReceiving />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.PROJECT_VIEWER) {
      tab = {
        key,
        title: `${t(` PROJECT VIEWER `)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <ProjectViewer />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.STORE_MANAGMENT) {
      tab = {
        key,
        title: `${t(`STORE MANAGMENT`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <StoreManagment></StoreManagment>
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.SHELF_LIFE) {
      tab = {
        key,
        title: `${t(`SHELF EXPIRY`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <ShelfExpiry />
          </div>
        ),

        closable: true,
      };
    }
    if (key == RouteNames.GOODS_RESERVING) {
      tab = {
        key,
        title: `${t(`GOODS RECEIVING`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <GoodsReciving />
          </div>
        ),
        closable: true,
      };
    }
    if (key == RouteNames.ORDER_CREATOR) {
      tab = {
        key,
        title: `${t(`ORDER CREATOR`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <OrderCreator />
          </div>
        ),
        closable: true,
      };
    }
    if (key == RouteNames.PROJECT_MANAGMENT) {
      tab = {
        key,
        title: `${t(`PROJECT MANAGMENT`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <ProjectManagment />
          </div>
        ),
        closable: true,
      };
    }
    if (key == RouteNames.PART_ADMINISTRATIONS) {
      tab = {
        key,
        title: `${t(`PART ADMINISTRATION`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <PartAdministration />
          </div>
        ),
        closable: true,
      };
    }

    if (key == RouteNames.MTXT) {
      tab = {
        key,
        title: `${t(`MTX`)}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <MaintenanceMTX />
          </div>
        ),

        closable: true,
      };
    } else if (key === RouteNames.STORE) {
      tab = {
        key,
        title: `${t("STORES/LOGISTIC")}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <MaterialsStore />
          </div>
        ),
        closable: true,
      };
    } else if (key === RouteNames.BASE) {
      tab = {
        key,
        title: `${t("WORKPACKAGE VIEWER")}`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <MaintenanceBase />
          </div>
        ),
        closable: true,
      };
    } else if (key === RouteNames.TOOLING) {
      tab = {
        key,
        title: `TOOL`,
        content: (
          <div className="h-[79vh] overflow-hidden">
            <></>
          </div>
        ),
        closable: true,
      };
    }

    if (tab) {
      setPanes((prevPanes) => {
        // Проверяем, существует ли уже вкладка с таким ключом
        const existingTab = prevPanes.some((pane) => pane.key === tab!.key);

        if (!existingTab) {
          // Если вкладки не существует, добавляем её
          return [
            ...prevPanes,
            tab as {
              key: string;
              title: any;
              content: JSX.Element;
              closable: boolean;
            },
          ];
        } else {
          // Если вкладка уже существует, не изменяем состояние
          return prevPanes;
        }
      });
      setActiveKey(tab.key);
      setSelectedTopKeys((prevSelectedTopKeys) => {
        const newSelectedTopKeys = [
          ...new Set([...prevSelectedTopKeys, tab!.key]),
        ];
        localStorage.setItem(
          "selectedTopKeys",
          JSON.stringify(newSelectedTopKeys)
        );
        return newSelectedTopKeys;
      });
    }
  };
  useEffect(() => {
    apnRoute && onMenuClick({ key: apnRoute.route });
  }, [apnRoute]);
  const { t } = useTranslation();
  const { isLoading } = useTypedSelector((state) => state.auth);
  const itemsHorisontal: MenuItem[] = [
    // getItem(
    //   t('Work Package Generation'),
    //   RouteNames.WORKPACKGEN,
    //   <GroupOutlined />
    // ),

    // getItem(<>{t('VIEW WORKPACKAGE')}</>, RouteNames.BASE, <ProjectOutlined />),

    // // // getItem('Line Maintenance', RouteNames.LINE, <ProjectOutlined />),
    // getItem(
    //   t('Maintenance Management (MTX)'),
    //   RouteNames.MTXT,
    //   <ExclamationCircleOutlined />
    // ),
    getItem(
      t("PART ADMINISTRATION"),
      RouteNames.PART_ADMINISTRATIONS,
      <SettingOutlined />
    ),
    getItem(t("STORE MANAGMENT"), RouteNames.STORE_MANAGMENT, <HomeOutlined />),
    getItem(
      t("STOCK INFORMATION"),
      RouteNames.STOCK_NFORMATIONS,
      <ShoppingCartOutlined />
    ),
    getItem(
      t("GOODS RECEIVING"),
      RouteNames.GOODS_RESERVING,
      <ShoppingCartOutlined />
    ),
    getItem(
      t("SCRAP MATERIAL"),
      RouteNames.SCRAP_MATERIAL,
      <ShoppingCartOutlined />
    ),
    getItem(
      t("CANCEL RECEIVING"),
      RouteNames.CANCEL_RESERVING,
      <ShoppingCartOutlined />
    ),
    getItem(
      t("RECEIVING VIEWER"),
      RouteNames.RESERVING_TRACK,
      <ShoppingCartOutlined />
    ),
    getItem(
      t("PICKSLIP VIEWER"),
      RouteNames.PICKSLIP_VIEWER,
      <ShoppingCartOutlined />
    ),
    getItem(
      t("PICKSLIP CONFIRMATION"),
      RouteNames.PICKSLIP_CONFIRMATIONS,
      <ShoppingCartOutlined />
    ),
    getItem(
      t("CANCEL PICKSLIP"),
      RouteNames.PICKSLIP_CANCEL,
      <ShoppingCartOutlined />
    ),
    getItem(
      t("PARTS TRANSFER"),
      RouteNames.PARTS_TRANSFER,
      <ShoppingCartOutlined />
    ),
    getItem(t("PARTS TRACKING"), RouteNames.PARTS_TRACKING, <SwapOutlined />),

    getItem(
      t("PARTS CONSUMPTION FORECAST"),
      RouteNames.PARTS_FORECAST,
      <SisternodeOutlined />
    ),
    getItem(t("SHELF EXPIRY"), RouteNames.SHELF_LIFE, <SisternodeOutlined />),
    // getItem(<>{t('TOOL')}</>, RouteNames.TOOLING, <ToolOutlined />),
  ];
  const navigate = useNavigate();
  const [selectedTopKeys, setSelectedTopKeys] = useState<string[]>([
    RouteNames.HOME,
  ]);
  const [openSettings, setOpenSettings] = useState(false);
  const handleClick = ({ selectedKeys }: { selectedKeys: string[] }) => {
    setSelectedTopKeys((prevSelectedTopKeys) => {
      const newSelectedTopKeys = [...prevSelectedTopKeys, ...selectedKeys];
      localStorage.setItem(
        "selectedTopKeys",
        JSON.stringify(newSelectedTopKeys)
      );
      return newSelectedTopKeys;
    });
  };

  const [panes, setPanes] = useState<TabData[]>([
    {
      key: RouteNames.HOME,
      title: <HomeOutlined />,
      content: (
        <div
          style={{
            backgroundSize: "cover",
            // backgroundImage: "url('https://via.placeholder.com/150')",
            // opacity: '0.9',
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
          className="h-[79vh] overflow-hidden "
        >
          <Layout>
            <ProCard className="flex   justify-center align-middle ">
              <Menu
                style={{
                  width: "100%",
                }}
                onClick={onMenuClick}
                // onSelect={handleClick}
                mode="vertical"
                items={itemsHorisontal}
                selectedKeys={selectedTopKeys}
              />
            </ProCard>
          </Layout>
          <img
            className="ml-auto"
            src={logoImage} // замените на URL вашего логотипа
            style={{
              // width: '100px', // измените размер по желанию
              // height: '100px', // измените размер по желанию
              // borderRadius: '50%', // делает изображение круглым

              width: "200px", // измените размер по желанию
              height: "40px", // измените размер по желанию
              // // borderRadius: '50%', // делает изображение круглым
            }}
          />
        </div>
      ),
      closable: false,
    },
  ]);

  const [activeKey, setActiveKey] = useState<string>("");
  interface TabData extends TabPaneProps {
    key: string;
    title: any;
    content: React.ReactNode;
  }

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
          setActiveKey(newPanes[newPanes.length - 1].key as string);
        }
      }
    }
  };

  useEffect(() => {
    const storedSelectedTopKeys = localStorage.getItem("selectedTopKeys");
    if (storedSelectedTopKeys) {
      setSelectedTopKeys(JSON.parse(storedSelectedTopKeys));
      setActiveKey(RouteNames.HOME);
    }
  }, []);

  return (
    <div>
      {isLoading ? (
        <Skeleton active={true} paragraph={{ rows: 5 }} />
      ) : (
        <div>
          <Tabs
            tabPosition="bottom"
            style={{
              width: "98%",
            }}
            className="mx-auto"
            size="small"
            hideAdd
            onChange={setActiveKey}
            activeKey={activeKey}
            type="editable-card"
            onEdit={onEdit}
          >
            {panes.map((pane) => (
              <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
                {pane.content}
              </TabPane>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Home;
