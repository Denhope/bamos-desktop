//@ts-nocheck
import React, { FC, useEffect, useState } from 'react';
import { Button, Layout, Skeleton, Tabs, Modal, Checkbox } from 'antd';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import logoImage from '../../assets/img/407Technics_logo.png';
import { RouteNames } from '@/router';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ProCard } from '@ant-design/pro-components';
import TabPane, { TabPaneProps } from 'antd/es/tabs/TabPane';
import Draggable from 'react-draggable';
import {
  HomeOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
  SisternodeOutlined,
  SettingOutlined,
  UserOutlined,
  ProjectOutlined,
  StockOutlined,
  ShopOutlined,
  InboxOutlined,
  TransactionOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  OrderedListOutlined,
  FileSearchOutlined,
  ScheduleOutlined,
  BarcodeOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { getItem } from '@/services/utilites';
import { ipcRenderer } from 'electron';
import { Content, Footer } from 'antd/es/layout/layout';
import { Row, Col, Menu } from 'antd';
import WPGeneration from './planning/WPGeneration/WPGeneration';
import MaintenanceBase from './maintenance/base/MaintenanceBase';
import UserAdministration from './APN/UserAdministration';
import MaterialsStore from './store/StoresMaterials';
import ProjectAdministration from './APN/ProjectAdministration';
import WOAdministration from './APN/WOAdmonistration';
import RequirementViewerNew from './APN/RequirementViewerNew';
import PickslipRequestNew from './APN/PickslipRequestNew';
import OrderViewer from './APN/OrderViewerNew';
import OrderViewerNew from './APN/OrderViewerNew';
import StockInformationNew from './APN/StockInformationNew';
import WorkOrder from './APN/WorkOrder';
import OrderManagment from './APN/OrderManagment';
import OrderAdministration from './APN/OrderAdministration';
import PartsTracking from './APN/PartsTracking';
import PartsTransferNew from './APN/PartsTransferNew';
import PickSlipConfirmationNew from './APN/PickSlipConfirmationNew';
import PickSlipConfirmation from './APN/PickSlipConfirmation';
import PickSlipViwer from './APN/PickSlipViwer';
import PartAdministration from './APN/PartAdministration';
import MaintenanceMTX from './maintenance/mtx/MaintenanceMTX';
import ProjectViewer from './APN/ProjectViewer';
import PartsForecast from './APN/PartsForecast';
import PickSlipAdministration from './APN/PickSlipAdministration';
import RequirementManagement from './APN/RequirementManagement';
import AccessTracking from './APN/AccessTracking';
import StoreManagment from './APN/StoreManagment';
import ScrapMaterial from './APN/ScrapMaterial';
import ProjectManagment from './APN/ProjectManagment';
import OrderCreator from './APN/OrderCreator';
import { useDispatch } from 'react-redux';
import StoreAdministration from './APN/StoreAdministration';
import { addTab, removeTab, setActiveKey } from '@/store/reducers/TabsSlice';
import GoodsRecivingNew from './APN/GoodsRecivingNew';
import PartAdministrationNew from './APN/PartAdministrationNew';
import ShelfExpiryNew from './APN/ShelfExpiryNew';
import RequirementAdministration from './APN/RequirementAdministration';
import WPAdministration from './APN/WPAdministration';
import ReceivingTracking from './APN/ReceivingTracking';
import PickSlipCancel from './APN/PickSlipCancel';
import CancelReceiving from './APN/CancelReceiving';

import { setCardPosition } from '@/store/reducers/cardPositionReducer';
import { setVisibleMenuItems } from '@/store/reducers/menuItemsReducer';
import { RootState } from '@/store';
import PickSlipStatus from '../pickSlipStatus/PickSlipStatus';
import SupportRequestAdministration from '../supportRequestAdministration/SupportRequestAdministration';
import PdfSlicerAdministration from '../pdfSlicer/PdfSlicerAdministration';
import ReportModule from '../reports/ReportModule';

type HomePropsType = { apnRoute: any | null };
const Home: FC<HomePropsType> = ({ apnRoute }) => {
  const { user } = useTypedSelector((state: RootState) => state.auth);
  const { panes, activeKey } = useTypedSelector(
    (state: RootState) => state.tabs
  );
  const { visibleMenuItems } = useTypedSelector(
    (state: RootState) => state.menuItems
  );
  const { position } = useTypedSelector(
    (state: RootState) => state.cardPosition
  );
  const dispatch = useDispatch();

  const onMenuClick = ({ key }: { key: string }) => {
    let tab:
      | {
          key: string;
          title: string;
          contentKey: string; // Изменено на contentKey
          closable: boolean;
        }
      | undefined;
    // Если вкладки не существует, создаём новую и устанавливаем её в качестве активной
    if (key == RouteNames.WORKPACKGEN) {
      tab = {
        key,
        title: `${t(`WP GENERATION`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.STORES_ADMINISTRATIONS) {
      tab = {
        key,
        title: `${t(`STORES ADMINISTRATION`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.KFC_VIEWER) {
      tab = {
        key,
        title: `${t(`PICKSLIP VIEWER`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.GOODS_RESERVING_NEW) {
      tab = {
        key,
        title: `${t(`GOODS RECEIVING`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.PART_ADMINISTRATIONS_NEW) {
      tab = {
        key,
        title: `${t(`PART ADMINISTRATION`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.PROJECT_ADMINISTRATION) {
      tab = {
        key,
        title: `${t(`PROJECT ADMINISTRATION`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.PICKSLIP_ADMINISTRATION) {
      tab = {
        key,
        title: `${t(`PICKSLIP ADMINISTRATION`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.PARTS_TRANSFER) {
      tab = {
        key,
        title: `${t(`PARTS TRANSFER`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.PARTS_TRACKING) {
      tab = {
        key,
        title: `${t(`PARTS TRACKING`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.WORKORDER_ADMINISTRATION) {
      tab = {
        key,
        title: `${t(`WORKORDER ADMINISTRATION`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.WP_ADMINISTRATION) {
      tab = {
        key,
        title: `${t(`WP ADMINISTRATION`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.ACCESS_TRACKING) {
      tab = {
        key,
        title: `${t(`ACCESS TRACKING`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.ORDER_VIEWER_NEW) {
      tab = {
        key,
        title: `${t(`ORDER VIEWER`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.REQUIREMENT_VIEWER_VIEWER) {
      tab = {
        key,
        title: `${t(`REQUIREMENT VIEWER`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }

    if (key == RouteNames.REQUIREMENT_ADMINISTRATION) {
      tab = {
        key,
        title: `${t(`REQUIREMENT ADMINISTRATION`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.PICKSLIP_VIEWER) {
      tab = {
        key,
        title: `${t(`PICKSLIP VIEWER`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.PICKSLIP_CONFIRMATIONS_NEW) {
      tab = {
        key,
        title: `${t(`PICKSLIP CONFIRMATION`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.SHELF_LIFE) {
      tab = {
        key,
        title: `${t(`SHELF EXPIRY`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.RESERVING_TRACK) {
      tab = {
        key,
        title: `${t(`RECEIVING VIEWER`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.CANCEL_RESERVING) {
      tab = {
        key,
        title: `${t(`CANCEL RECEIVING`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.STOCK_NFORMATIONS) {
      tab = {
        key,
        title: `${t(`STOCK INFORMATION`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }

    if (key == RouteNames.PICKSLIP_CANCEL) {
      tab = {
        key,
        title: `${t(`CANCEL PICKSLIP`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.USER_ADMINISTRATION) {
      tab = {
        key,
        title: `${t(`ADMINISTRATION`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.ORDERS_ADMINISTRATION) {
      tab = {
        key,
        title: `${t(`ORDER ADMINISTRATION`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.ACCESS_TRACKING) {
      tab = {
        key,
        title: `${t(`ACCESS TRACKING`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.SUPPORT_REQUEST_ADMINISTRATION) {
      tab = {
        key,
        title: `${t(`SUPPORT REQUEST`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.PDF_SLICER) {
      tab = {
        key,
        title: `${t(`PDF SLICER`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    if (key == RouteNames.REPORTS) {
      tab = {
        key,
        title: `${t(`REPORTS`)}`,
        contentKey: key, // Изменено на contentKey
        closable: true,
      };
    }
    // ... (остальные условия)

    if (tab) {
      dispatch(addTab(tab));
    }
  };

  useEffect(() => {
    if (apnRoute) {
      onMenuClick({ key: apnRoute.route });
    }
  }, [apnRoute]);

  const { t } = useTranslation();
  const { isLoading } = useTypedSelector((state: RootState) => state.auth);

  const roleMenuItems: Record<any, any[]> = {
    admin: [
      getItem(
        t('ADMINISTRATION'),
        RouteNames.USER_ADMINISTRATION,
        <UserOutlined />
      ),
      getItem(t('PICKSLIP VIEWER'), RouteNames.KFC_VIEWER, <HomeOutlined />),
      getItem(
        t('WP ADMINISTRATION'),
        RouteNames.WP_ADMINISTRATION,
        <HomeOutlined />
      ),
      getItem(
        t('PROJECT ADMINISTRATION'),
        RouteNames.PROJECT_ADMINISTRATION,
        <ProjectOutlined />
      ),
      getItem(
        t('PART ADMINISTRATION'),
        RouteNames.PART_ADMINISTRATIONS_NEW,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('STOCK INFORMATION'),
        RouteNames.STOCK_NFORMATIONS,
        <StockOutlined />
      ),
      getItem(
        t('STORES ADMINISTRATION'),
        RouteNames.STORES_ADMINISTRATIONS,
        <ShopOutlined />
      ),

      getItem(
        t('GOODS RECEIVING'),
        RouteNames.GOODS_RESERVING_NEW,
        <InboxOutlined />
      ),
      getItem(t('PARTS TRACKING'), RouteNames.PARTS_TRACKING, <SwapOutlined />),
      getItem(
        t('PARTS TRANSFER'),
        RouteNames.PARTS_TRANSFER,
        <TransactionOutlined />
      ),
      getItem(
        t('PICKSLIP CONFIRMATION'),
        RouteNames.PICKSLIP_CONFIRMATIONS_NEW,
        <CheckCircleOutlined />
      ),
      getItem(
        t('CANCEL PICKSLIP'),
        RouteNames.PICKSLIP_CANCEL,
        <CloseCircleOutlined />
      ),

      getItem(
        t('CANCEL RECEIVING'),
        RouteNames.CANCEL_RESERVING,
        <StopOutlined />
      ),
      getItem(
        t('RECEIVING VIEWER'),
        RouteNames.RESERVING_TRACK,
        <EyeOutlined />
      ),

      getItem(
        t('SHELF EXPIRY'),
        RouteNames.SHELF_LIFE,
        <ClockCircleOutlined />
      ),
      getItem(
        t('REQUIREMENT ADMINISTRATION'),
        RouteNames.REQUIREMENT_ADMINISTRATION,
        <ToolOutlined />
      ),
      getItem(
        t('ORDER ADMINISTRATION'),
        RouteNames.ORDERS_ADMINISTRATION,
        <OrderedListOutlined />
      ),
      getItem(
        t('ORDER VIEWER'),
        RouteNames.ORDER_VIEWER_NEW,
        <FileSearchOutlined />
      ),

      getItem(
        t('WORKORDER ADMINISTRATION'),
        RouteNames.WORKORDER_ADMINISTRATION,
        <ScheduleOutlined />
      ),
      getItem(
        t('PICKSLIP ADMINISTRATION'),
        RouteNames.PICKSLIP_ADMINISTRATION,
        <BarcodeOutlined />
      ),
      getItem(
        t('ACCESS TRACKING'),
        RouteNames.ACCESS_TRACKING,
        <ShoppingCartOutlined />
      ),
      getItem(t('PEF SLICER'), RouteNames.PDF_SLICER, <ShoppingCartOutlined />),
      getItem(t('REPORTS'), RouteNames.REPORTS, <BarChartOutlined />),
      getItem(
        t('SUPPORT REQUEST'),
        RouteNames.SUPPORT_REQUEST_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
    ],
    technican: [
      getItem(
        t('WORKORDER ADMINISTRATION'),
        RouteNames.WORKORDER_ADMINISTRATION,
        <ScheduleOutlined />
      ),
      getItem(
        t('PART ADMINISTRATION'),
        RouteNames.PART_ADMINISTRATIONS_NEW,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('STOCK INFORMATION'),
        RouteNames.STOCK_NFORMATIONS,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('ACCESS TRACKING'),
        RouteNames.ACCESS_TRACKING,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('REQUIREMENT ADMINISTRATION'),
        RouteNames.REQUIREMENT_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('SUPPORT REQUEST'),
        RouteNames.SUPPORT_REQUEST_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(t('PICKSLIP VIEWER'), RouteNames.KFC_VIEWER, <HomeOutlined />),
    ],
    engineer: [
      getItem(
        t('WORKORDER ADMINISTRATION'),
        RouteNames.WORKORDER_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('STOCK INFORMATION'),
        RouteNames.STOCK_NFORMATIONS,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('PART ADMINISTRATION'),
        RouteNames.PART_ADMINISTRATIONS_NEW,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('STORES ADMINISTRATION'),
        RouteNames.STORES_ADMINISTRATIONS,
        <HomeOutlined />
      ),
      getItem(
        t('ACCESS TRACKING'),
        RouteNames.ACCESS_TRACKING,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('REQUIREMENT ADMINISTRATION'),
        RouteNames.REQUIREMENT_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(t('PARTS TRACKING'), RouteNames.PARTS_TRACKING, <SwapOutlined />),
      getItem(
        t('PICKSLIP ADMINISTRATION'),
        RouteNames.PICKSLIP_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('SHELF EXPIRY'),
        RouteNames.SHELF_LIFE,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('ADMINISTRATION'),
        RouteNames.USER_ADMINISTRATION,
        <HomeOutlined />
      ),
      getItem(
        t('ORDER VIEWER'),
        RouteNames.ORDER_VIEWER_NEW,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('REQUIREMENT ADMINISTRATION'),
        RouteNames.REQUIREMENT_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('SUPPORT REQUEST'),
        RouteNames.SUPPORT_REQUEST_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(t('PICKSLIP VIEWER'), RouteNames.KFC_VIEWER, <HomeOutlined />),
    ],
    planning: [
      getItem(
        t('PART ADMINISTRATION'),
        RouteNames.PART_ADMINISTRATIONS_NEW,
        <ShoppingCartOutlined />
      ),

      getItem(
        t('WORKORDER ADMINISTRATION'),
        RouteNames.WORKORDER_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('WP ADMINISTRATION'),
        RouteNames.WP_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('PROJECT ADMINISTRATION'),
        RouteNames.PROJECT_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('STOCK INFORMATION'),
        RouteNames.STOCK_NFORMATIONS,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('ACCESS TRACKING'),
        RouteNames.ACCESS_TRACKING,
        <ShoppingCartOutlined />
      ),

      getItem(t('PARTS TRACKING'), RouteNames.PARTS_TRACKING, <SwapOutlined />),
      getItem(
        t('PICKSLIP ADMINISTRATION'),
        RouteNames.PICKSLIP_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('SHELF EXPIRY'),
        RouteNames.SHELF_LIFE,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('ADMINISTRATION'),
        RouteNames.USER_ADMINISTRATION,
        <HomeOutlined />
      ),
      getItem(
        t('ORDER VIEWER'),
        RouteNames.ORDER_VIEWER_NEW,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('REQUIREMENT ADMINISTRATION'),
        RouteNames.REQUIREMENT_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(t('PDF SLICER'), RouteNames.PDF_SLICER, <ShoppingCartOutlined />),
      getItem(
        t('SUPPORT REQUEST'),
        RouteNames.SUPPORT_REQUEST_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(t('PICKSLIP VIEWER'), RouteNames.KFC_VIEWER, <HomeOutlined />),
    ],
    logistic: [
      getItem(
        t('STOCK INFORMATION'),
        RouteNames.STOCK_NFORMATIONS,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('STORES ADMINISTRATION'),
        RouteNames.STORES_ADMINISTRATIONS,
        <HomeOutlined />
      ),
      getItem(
        t('PART ADMINISTRATION'),
        RouteNames.PART_ADMINISTRATIONS_NEW,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('RECEIVING VIEWER'),
        RouteNames.RESERVING_TRACK,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('GOODS RECEIVING'),
        RouteNames.GOODS_RESERVING_NEW,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('PARTS TRANSFER'),
        RouteNames.PARTS_TRANSFER,
        <ShoppingCartOutlined />
      ),
      getItem(t('PARTS TRACKING'), RouteNames.PARTS_TRACKING, <SwapOutlined />),
      getItem(
        t('PICKSLIP CONFIRMATION'),
        RouteNames.PICKSLIP_CONFIRMATIONS_NEW,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('CANCEL PICKSLIP'),
        RouteNames.PICKSLIP_CANCEL,
        <ShoppingCartOutlined />
      ),

      getItem(
        t('CANCEL RECEIVING'),
        RouteNames.CANCEL_RESERVING,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('REQUIREMENT ADMINISTRATION'),
        RouteNames.REQUIREMENT_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('ORDER ADMINISTRATION'),
        RouteNames.ORDERS_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('ORDER VIEWER'),
        RouteNames.ORDER_VIEWER_NEW,
        <ShoppingCartOutlined />
      ),

      getItem(
        t('SHELF EXPIRY'),
        RouteNames.SHELF_LIFE,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('SUPPORT REQUEST'),
        RouteNames.SUPPORT_REQUEST_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(t('PICKSLIP VIEWER'), RouteNames.KFC_VIEWER, <HomeOutlined />),
    ],
    storeMan: [
      getItem(
        t('STOCK INFORMATION'),
        RouteNames.STOCK_NFORMATIONS,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('STORES ADMINISTRATION'),
        RouteNames.STORES_ADMINISTRATIONS,
        <HomeOutlined />
      ),
      getItem(
        t('PART ADMINISTRATION'),
        RouteNames.PART_ADMINISTRATIONS_NEW,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('RECEIVING VIEWER'),
        RouteNames.RESERVING_TRACK,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('GOODS RECEIVING'),
        RouteNames.GOODS_RESERVING_NEW,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('PARTS TRANSFER'),
        RouteNames.PARTS_TRANSFER,
        <ShoppingCartOutlined />
      ),
      getItem(t('PARTS TRACKING'), RouteNames.PARTS_TRACKING, <SwapOutlined />),
      getItem(
        t('PICKSLIP CONFIRMATION'),
        RouteNames.PICKSLIP_CONFIRMATIONS_NEW,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('CANCEL PICKSLIP'),
        RouteNames.PICKSLIP_CANCEL,
        <ShoppingCartOutlined />
      ),

      getItem(
        t('CANCEL RECEIVING'),
        RouteNames.CANCEL_RESERVING,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('REQUIREMENT ADMINISTRATION'),
        RouteNames.REQUIREMENT_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('ORDER ADMINISTRATION'),
        RouteNames.ORDERS_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('ORDER VIEWER'),
        RouteNames.ORDER_VIEWER_NEW,
        <ShoppingCartOutlined />
      ),

      getItem(
        t('SHELF EXPIRY'),
        RouteNames.SHELF_LIFE,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('SUPPORT REQUEST'),
        RouteNames.SUPPORT_REQUEST_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(t('PICKSLIP VIEWER'), RouteNames.KFC_VIEWER, <HomeOutlined />),
    ],
    director: [
      getItem(
        t('WORKORDER ADMINISTRATION'),
        RouteNames.WORKORDER_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('STOCK INFORMATION'),
        RouteNames.STOCK_NFORMATIONS,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('STORES ADMINISTRATION'),
        RouteNames.STORES_ADMINISTRATIONS,
        <HomeOutlined />
      ),
      getItem(
        t('PART ADMINISTRATION'),
        RouteNames.PART_ADMINISTRATIONS_NEW,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('RECEIVING VIEWER'),
        RouteNames.RESERVING_TRACK,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('GOODS RECEIVING'),
        RouteNames.GOODS_RESERVING_NEW,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('PARTS TRANSFER'),
        RouteNames.PARTS_TRANSFER,
        <ShoppingCartOutlined />
      ),
      getItem(t('PARTS TRACKING'), RouteNames.PARTS_TRACKING, <SwapOutlined />),
      getItem(
        t('PICKSLIP CONFIRMATION'),
        RouteNames.PICKSLIP_CONFIRMATIONS_NEW,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('CANCEL PICKSLIP'),
        RouteNames.PICKSLIP_CANCEL,
        <ShoppingCartOutlined />
      ),

      getItem(
        t('CANCEL RECEIVING'),
        RouteNames.CANCEL_RESERVING,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('REQUIREMENT ADMINISTRATION'),
        RouteNames.REQUIREMENT_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('ORDER ADMINISTRATION'),
        RouteNames.ORDERS_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('ORDER VIEWER'),
        RouteNames.ORDER_VIEWER_NEW,
        <ShoppingCartOutlined />
      ),

      getItem(
        t('SHELF EXPIRY'),
        RouteNames.SHELF_LIFE,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('SUPPORT REQUEST'),
        RouteNames.SUPPORT_REQUEST_ADMINISTRATION,
        <ShoppingCartOutlined />
      ),
      getItem(
        t('ACCESS TRACKING'),
        RouteNames.ACCESS_TRACKING,
        <ShoppingCartOutlined />
      ),
      getItem(t('PICKSLIP VIEWER'), RouteNames.KFC_VIEWER, <HomeOutlined />),
    ],
  };

  const menuItems = roleMenuItems[user.role] || [];
  const navigate = useNavigate();
  const [selectedTopKeys, setSelectedTopKeys] = useState<string[]>([
    RouteNames.HOME,
  ]);
  const [openSettings, setOpenSettings] = useState(false);

  const onEdit = (
    targetKey:
      | string
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>,
    action: 'add' | 'remove'
  ) => {
    if (typeof targetKey === 'string') {
      if (action === 'remove') {
        dispatch(removeTab(targetKey));
      }
    }
  };

  useEffect(() => {
    const storedSelectedTopKeys = localStorage.getItem('selectedTopKeys');
    if (storedSelectedTopKeys) {
      setSelectedTopKeys(JSON.parse(storedSelectedTopKeys));
      setActiveKey(RouteNames.HOME);
    }
  }, []);

  const handleSettingsOk = () => {
    dispatch(setVisibleMenuItems(visibleMenuItems));
    setOpenSettings(false);
  };

  const handleSettingsCancel = () => {
    setOpenSettings(false);
  };

  const onCheckboxChange = (key: string) => {
    const isChecked = visibleMenuItems.includes(key);
    if (isChecked) {
      dispatch(
        setVisibleMenuItems(visibleMenuItems.filter((item) => item !== key))
      );
    } else {
      dispatch(setVisibleMenuItems([...visibleMenuItems, key]));
    }
  };

  const filteredMenuItems = menuItems.filter((item) =>
    visibleMenuItems.includes(item.key)
  );

  const onDragStop = (e: any, data: any) => {
    dispatch(setCardPosition({ x: data.x, y: data.y }));
  };

  const getContentByKey = (key: string): JSX.Element | null => {
    switch (key) {
      case RouteNames.HOME:
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            className="h-[82vh] overflow-hidden "
          >
            <Layout>
              <Draggable
                defaultPosition={position}
                onStop={onDragStop}
                bounds="parent"
              >
                <ProCard
                  className="flex justify-center align-middle p-5 w-2/6 cursor-pointer "
                  style={{
                    // minWidth: '900px',
                    // width: '100%',
                    position: 'relative',
                  }}
                >
                  <SettingOutlined
                    onClick={() => setOpenSettings(true)}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      zIndex: 1000,
                    }}
                  />

                  <Row gutter={[8, 8]} justify="center">
                    {filteredMenuItems.map((item) => (
                      <Col key={item.key} span={24}>
                        <Button
                          icon={item.icon}
                          onClick={() => onMenuClick({ key: item.key })}
                          block
                          style={{
                            height: '40px',
                            fontSize: '12px',
                            padding: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span
                            style={{
                              whiteSpace: 'wrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.label}
                          </span>
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </ProCard>
              </Draggable>
            </Layout>
            <img
              className="ml-auto"
              src={logoImage}
              style={{
                width: '200px', // измените размер по желанию
                height: '40px', // измените размер по желанию
                // borderRadius: '50%',
              }}
            />
          </div>
        );
      case RouteNames.WORKPACKGEN:
        return (
          <div className="h-[82vh] overflow-hidden">
            <WPGeneration />
          </div>
        );
      case RouteNames.WORKORDER:
        return (
          <div className="h-[82vh] overflow-hidden">
            <WorkOrder />
          </div>
        );
      case RouteNames.PICKSLIP_ADMINISTRATION:
        return (
          <div className="h-[82vh] overflow-hidden">
            <PickSlipAdministration />
          </div>
        );
      case RouteNames.WORKORDER_ADMINISTRATION:
        return (
          <div className="h-[82vh] overflow-hidden">
            <WOAdministration />
          </div>
        );

      case RouteNames.WP_ADMINISTRATION:
        return (
          <div className="h-[82vh] overflow-hidden">
            <WPAdministration />
          </div>
        );
      case RouteNames.STOCK_NFORMATIONS:
        return (
          <div className="h-[82vh] overflow-hidden">
            <StockInformationNew />
          </div>
        );
      case RouteNames.STORES_ADMINISTRATIONS:
        return (
          <div className="h-[82vh] overflow-hidden">
            <StoreAdministration />
          </div>
        );
      case RouteNames.GOODS_RESERVING_NEW:
        return (
          <div className="h-[82vh] overflow-hidden">
            <GoodsRecivingNew />
          </div>
        );
      case RouteNames.GOODS_RESERVING_NEW:
        return (
          <div className="h-[82vh] overflow-hidden">
            <GoodsRecivingNew />
          </div>
        );

      case RouteNames.PART_ADMINISTRATIONS_NEW:
        return (
          <div className="h-[82vh] overflow-hidden">
            <PartAdministrationNew />
          </div>
        );
      case RouteNames.REQUIREMENT_ADMINISTRATION:
        return (
          <div className="h-[82vh] overflow-hidden">
            <RequirementAdministration />
          </div>
        );
      case RouteNames.ORDERS_ADMINISTRATION:
        return (
          <div className="h-[82vh] overflow-hidden">
            <OrderAdministration />
          </div>
        );
      case RouteNames.PICKSLIP_CONFIRMATIONS_NEW:
        return (
          <div className="h-[82vh] overflow-hidden">
            <PickSlipConfirmationNew />
          </div>
        );
      case RouteNames.KFC_VIEWER:
        return (
          <div className="h-[82vh] overflow-hidden">
            <PickSlipStatus />
          </div>
        );
      case RouteNames.SHELF_LIFE:
        return (
          <div className="h-[82vh] overflow-hidden">
            <ShelfExpiryNew />
          </div>
        );
      case RouteNames.USER_ADMINISTRATION:
        return (
          <div className="h-[82vh] overflow-hidden">
            <UserAdministration />
          </div>
        );
      case RouteNames.WP_ADMINISTRATION:
        return (
          <div className="h-[82vh] overflow-hidden">
            <WPAdministration />
          </div>
        );
      case RouteNames.ORDER_VIEWER_NEW:
        return (
          <div className="h-[82vh] overflow-hidden">
            <OrderViewerNew />
          </div>
        );
      case RouteNames.RESERVING_TRACK:
        return (
          <div className="h-[82vh] overflow-hidden">
            <ReceivingTracking />
          </div>
        );

      case RouteNames.CANCEL_RESERVING:
        return (
          <div className="h-[82vh] overflow-hidden">
            <CancelReceiving />
          </div>
        );
      case RouteNames.PROJECT_ADMINISTRATION:
        return (
          <div className="h-[82vh] overflow-hidden">
            <ProjectAdministration />
          </div>
        );
      case RouteNames.PICKSLIP_CANCEL:
        return (
          <div className="h-[82vh] overflow-hidden">
            <PickSlipCancel />
          </div>
        );
      case RouteNames.PARTS_TRANSFER:
        return (
          <div className="h-[82vh] overflow-hidden">
            <PartsTransferNew />
          </div>
        );

      case RouteNames.PARTS_TRACKING:
        return (
          <div className="h-[82vh] overflow-hidden">
            <PartsTracking />
          </div>
        );
      case RouteNames.ACCESS_TRACKING:
        return (
          <div className="h-[82vh] overflow-hidden">
            <AccessTracking />
          </div>
        );
      case RouteNames.SUPPORT_REQUEST_ADMINISTRATION:
        return (
          <div className="h-[82vh] overflow-hidden">
            <SupportRequestAdministration />
          </div>
        );

      case RouteNames.PDF_SLICER:
        return (
          <div className="h-[82vh] overflow-hidden">
            <PdfSlicerAdministration />
          </div>
        );
      case RouteNames.REPORTS:
        return (
          <div className="h-[82vh] overflow-hidden">
            <ReportModule />
          </div>
        );

      // ... (остальные условия)
      default:
        return null;
    }
  };

  return (
    <div>
      <Modal
        title={t('MENU SETTING')}
        open={openSettings}
        onOk={handleSettingsOk}
        onCancel={handleSettingsCancel}
        style={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {menuItems.map((item) => (
            <Checkbox
              key={item.key}
              checked={visibleMenuItems.includes(item.key)}
              onChange={() => onCheckboxChange(item.key)}
            >
              {item.label}
            </Checkbox>
          ))}
        </div>
      </Modal>
      {isLoading ? (
        <Skeleton active={true} paragraph={{ rows: 5 }} />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '10px',
          }}
        >
          <Tabs
            tabPosition="bottom"
            style={{
              width: '98%',
            }}
            className="mx-auto "
            size="small"
            hideAdd
            onChange={(key) => dispatch(setActiveKey(key))}
            activeKey={activeKey}
            type="editable-card"
            onEdit={onEdit}
          >
            {panes.map((pane: any) => (
              <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
                {getContentByKey(pane.contentKey)}
              </TabPane>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Home;
