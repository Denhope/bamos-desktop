import React, { FC, useState, useMemo, useEffect } from "react";
import GoodsReceivingSrarchForm from "./GoodsReceivingSrarchForm";
import OrderDetailsForm from "./OrderDetailsForm";
import BookingOrderPartsList from "./BookingOrderPartsList";
import { IOrder } from "@/models/IOrder";
import TabContent from "@/components/shared/Table/TabContent";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import { Button, Modal, Space, message } from "antd";
import Receiving from "./Receiving";
import { IReceiving } from "@/models/IReceiving";
import {
  ProFormGroup,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import GeneretedTransferPdf from "@/components/pdf/GeneretedTransferLabels";
import { getFilteredShops } from "@/utils/api/thunks";
import { useAppDispatch } from "@/hooks/useTypedSelector";
type BookingPartSideType = {
  order: IOrder | null;
  onUpdateOrder?: (data: any) => void;
};
const BookingPartSide: FC<BookingPartSideType> = ({ order, onUpdateOrder }) => {
  const dispatch = useAppDispatch();
  const [labelsOpenPrint, setOpenLabelsPrint] = useState<any>();
  const [partsToPrint, setPartsToPrint] = useState<any>(null);
  const [openPart, setOpenPart] = useState<any>(null);
  const [selectedPart, setSelectedPart] = useState<any>();
  const [selectedOrderType, setSelectedOrderType] = useState<any>("ORDER");
  const { t } = useTranslation();
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(order);
  const [selecteReceiving, setSelectedreceiving] = useState<IReceiving | null>(
    null
  );
  const [receivingType, setReceivingType] = useState<"ORDER" | "UN_ORDER">(
    "ORDER"
  );

  const handleSelectedPart = (record: any, rowIndex?: any) => {
    setSelectedPart({ record, index: rowIndex });
  };
  useEffect(() => {
    if (order) {
      setSelectedOrder(order);
      setOpenPart(null);
    }
  }, [order]);

  const handleOpenPart = () => {
    if (
      !selectedPart ||
      selectedPart.state === "RECEIVED" ||
      selectedPart.state === "CANCELLED" ||
      selectedPart.state === "CLOSED" ||
      (selectedOrder && selectedOrder?.state === "CLOSED") ||
      (selectedOrder && selectedOrder?.state === "CANCELLED") ||
      (selectedOrder && selectedOrder?.state === "RECEIVED")
    ) {
      return;
    }
    setOpenPart(selectedPart);
  };

  const tabs = useMemo(
    () =>
      [
        selectedOrderType &&
          selectedOrderType === "ORDER" && {
            content: (
              <>
                <BookingOrderPartsList
                  onSelectedPart={handleSelectedPart}
                  parts={selectedOrder?.parts}
                  scroll={20}
                />
                <Space className="mt-5" align="center">
                  <Button
                    size="small"
                    onClick={handleOpenPart}
                    disabled={
                      !!(
                        !selectedPart ||
                        selectedPart.record.state === "RECEIVED" ||
                        selectedPart.record.state === "CANCELLED" ||
                        selectedPart.record.state === "CLOSED" ||
                        (selectedOrder && selectedOrder?.state === "CLOSED") ||
                        (selectedOrder &&
                          selectedOrder?.state === "CANCELLED") ||
                        (selectedOrder && selectedOrder?.state === "RECEIVED")
                      )
                    }
                  >
                    {t("PROCESS RECEIVING")}
                  </Button>
                </Space>
              </>
            ),
            title: `${t("ORDER DETAILS")}`,
          },

        openPart &&
          openPart?.index !== undefined && {
            content: (
              <>
                <Receiving
                  currentReceiving={selecteReceiving}
                  currenOrder={selectedOrder}
                  currentPart={openPart.record}
                  onUpdateOrder={function (data: any): void {
                    setOpenPart(null);
                    setSelectedOrder(data);
                    onUpdateOrder && onUpdateOrder(data);
                  }}
                  // onReceivingPart={(data) => {
                  //   setPartsToPrint(data);
                  //   setOpenLabelsPrint(true);
                  // }}
                  onReceivingPart={async (data) => {
                    const currentCompanyID =
                      localStorage.getItem("companyID") || "";

                    if (data) {
                      const getStoreInfo = await dispatch(
                        getFilteredShops({
                          shopShortName: data[0].STOCK,
                          companyID: currentCompanyID,
                        })
                      );
                      if (getStoreInfo.meta.requestStatus === "fulfilled") {
                        const location = getStoreInfo.payload[0].locations.find(
                          (loc: any) =>
                            loc.locationName === data[0].SHELF_NUMBER
                        );
                        const locationState =
                          location?.rectriction === "standart" ||
                          location?.rectriction === "restricted"
                            ? "SERVICEABLE"
                            : "UNSERVICEABLE";
                        setPartsToPrint([
                          { ...data[0], RESTRICTION: locationState },
                        ]);

                        setOpenLabelsPrint(true);
                      } else {
                        message.error("Error");
                      }
                    }

                    //
                  }}
                />
              </>
            ),
            title: `${t("RECEIVING")}${selectedOrder?.orderNumber} POS. ${
              openPart?.index + 1
            }`,
          },
        openPart &&
          openPart?.index !== undefined && {
            content: <ProFormTextArea></ProFormTextArea>,
            title: `${t("REMARKS")}${selectedOrder?.orderNumber} POS. ${
              openPart?.index + 1
            }`,
          },
        openPart &&
          openPart?.index !== undefined && {
            content: (
              <ProFormGroup>
                <ProFormText
                  name="unitPrice"
                  label={t("UNIT PRICE")}
                  width="sm"
                ></ProFormText>
                <ProFormText
                  name="unitLocalPrice"
                  label={t("UNIT LOCAL PRICE")}
                  width="sm"
                ></ProFormText>
              </ProFormGroup>
            ),
            title: `${t("FINANCIAL DATA")}${selectedOrder?.orderNumber} POS. ${
              openPart?.index + 1
            }`,
          },

        selectedOrderType &&
          selectedOrderType === "UN_ORDER" && {
            content: (
              <>
                <Receiving
                  currentReceiving={selecteReceiving}
                  currenOrder={selectedOrder}
                  currentPart={openPart?.record}
                  onUpdateOrder={function (data: any): void {
                    setOpenPart(null);
                    setSelectedOrder(data);
                    // setSelectedOrderType('');
                    onUpdateOrder && onUpdateOrder(data);
                  }}
                  onReceivingPart={async (data) => {
                    const currentCompanyID =
                      localStorage.getItem("companyID") || "";

                    if (data) {
                      const getStoreInfo = await dispatch(
                        getFilteredShops({
                          shopShortName: data[0].STOCK,
                          companyID: currentCompanyID,
                        })
                      );
                      if (getStoreInfo.meta.requestStatus === "fulfilled") {
                        const location = getStoreInfo.payload[0].locations.find(
                          (loc: any) =>
                            loc.locationName === data[0].SHELF_NUMBER
                        );
                        const locationState =
                          location?.rectriction === "standart" ||
                          location?.restriction === "restricted"
                            ? "SERVICEABLE"
                            : "UNSERVICEABLE";
                        setPartsToPrint([
                          { ...data[0], RESTRICTION: locationState },
                        ]);

                        setOpenLabelsPrint(true);
                      } else {
                        message.error("Error");
                      }
                    }

                    //
                  }}
                />
              </>
            ),
            title: `${t("SINGLE RECEIVING")}`,
            closable: true,
          },
      ].filter(Boolean),

    [
      openPart,
      selectedOrder,
      selectedOrderType,
      selectedPart,
      selecteReceiving,
      setSelectedOrderType,

      t,
    ]
  );

  return (
    <div className=" bg-white px-4 py-3 rounded-md border-gray-400 overflow-hidden h-[78vh] flex flex-col justify-between gap-2">
      <div className="flex flex-col gap-2">
        <OrderDetailsForm
          order={selectedOrder}
          onOrdersSearch={(record) => {
            setSelectedOrder(record);
            setOpenPart(null);
          }}
          onCurrentReceiving={function (data: any): void {
            setSelectedreceiving(data);
          }}
          onReceivingType={function (data: any): void {
            setSelectedOrderType(data);
          }}
        />
        <TabContent tabs={tabs}></TabContent>
      </div>
      <Modal
        title={t("PRINT LABEL")}
        open={labelsOpenPrint}
        width={"30%"}
        onCancel={() => {
          setOpenLabelsPrint(false);
          setPartsToPrint(null);
        }}
        footer={null}
      >
        <GeneretedTransferPdf key={Date.now()} parts={partsToPrint} />
      </Modal>
    </div>
  );
};

export default BookingPartSide;
