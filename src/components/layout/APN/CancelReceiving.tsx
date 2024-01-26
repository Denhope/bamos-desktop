import { ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { Button, Form, Modal, Space } from "antd";
import CancelReceivingForm from "@/components/store/cancelReceiving/CancelReceivingForm";
import ReceivingItemList from "@/components/store/receivingItems/ReceivingItemList";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { USER_ID } from "@/utils/api/http";
import {
  deleteMaterialStoreItemByID,
  getFilteredOrders,
  updateOrderByID,
  updateReceivingByID,
  createBookingItem,
} from "@/utils/api/thunks";

const CancelReceiving: FC = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [receivings, setReceiving] = useState<any[] | []>([]);
  const [data, setdata] = useState<any[] | []>(receivings);
  const [partsToPrint, setPartsToPrint] = useState<any>(null);
  useEffect(() => {
    if (receivings) {
      setdata(receivings);
    }
  }, [receivings]);
  const dispatch = useAppDispatch();
  return (
    <div className="h-[79vh] overflow-hidden flex flex-col justify-between gap-1">
      <div className="flex flex-col gap-5">
        <CancelReceivingForm
          onFilterReceiving={setReceiving}
        ></CancelReceivingForm>
        <ReceivingItemList
          onSelectedParts={setPartsToPrint}
          // onDoubleClick={onDoubleClick}
          scroll={35}
          data={data}
        />
      </div>
      <div className="flex justify-between">
        <ProForm form={form} submitter={false}>
          <ProFormTextArea
            width={"xl"}
            fieldProps={{ style: { resize: "none" } }}
            rules={[{ required: true }]}
            name="reasonCancel"
            label={t("REASON FOR CANCEL")}
          ></ProFormTextArea>
        </ProForm>

        <Space align="center">
          <Button
            disabled={
              !(partsToPrint && partsToPrint.length === 1) ||
              !form.getFieldValue("reasonCancel") ||
              partsToPrint[0].IS_CANCELLED
            }
            onClick={async (values: any) => {
              Modal.confirm({
                title: t("CONFIRM CANCEL"),
                onOk: async () => {
                  const currentCompanyID = localStorage.getItem("companyID");
                  const result = await dispatch(
                    updateReceivingByID({
                      companyID: currentCompanyID,
                      id: partsToPrint[0]._id,
                      state: "CANCELLED",
                      IS_CANCELLED: true,
                      reason: form.getFieldValue("reasonCancel"),
                      cancelledQTY: partsToPrint[0].QUANTITY,
                    })
                  );
                  if (result.meta.requestStatus === "fulfilled") {
                    form.setFields([
                      {
                        name: "reasonCancel",
                        value: "",
                      },
                    ]);
                    setReceiving((prevReceivings) =>
                      prevReceivings.filter(
                        (item) => item?._id !== partsToPrint[0]?._id
                      )
                    );
                    const resultDelete = await dispatch(
                      deleteMaterialStoreItemByID({
                        companyID: currentCompanyID,
                        id: partsToPrint[0].MATERIAL_STORE_ID,
                      })
                    );
                    if (resultDelete.meta.requestStatus === "fulfilled") {
                      dispatch(
                        createBookingItem({
                          companyID: resultDelete.payload.COMPANY_ID,
                          data: {
                            companyID: resultDelete.payload.COMPANY_ID,
                            userSing: localStorage.getItem("singNumber") || "",
                            userID: USER_ID || "",
                            createDate: new Date(),
                            partNumber: resultDelete.payload.PART_NUMBER,
                            station:
                              resultDelete.payload?.WAREHOUSE_RECEIVED_AT ||
                              "N/A",
                            voucherModel: "RECEIVING_CANCELLED",
                            location: resultDelete.payload?.SHELF_NUMBER,
                            orderNumber: resultDelete.payload?.ORDER_NUMBER,
                            price: resultDelete.payload?.PRICE,
                            currency: resultDelete.payload?.CURRENCY,
                            quantity: -resultDelete.payload?.QUANTITY,
                            owner: resultDelete.payload?.OWNER_SHORT_NAME,
                            batchNumber:
                              resultDelete.payload?.SUPPLIER_BATCH_NUMBER,
                            serialNumber: resultDelete.payload?.SERIAL_NUMBER,
                            partGroup: resultDelete.payload?.GROUP,
                            partType: resultDelete.payload?.TYPE,
                            condition: resultDelete.payload?.CONDITION,
                            description: resultDelete.payload?.NAME_OF_MATERIAL,
                          },
                        })
                      );
                    }

                    if (partsToPrint[0].ORDER_NUMBER) {
                      const resultADD11 = await dispatch(
                        getFilteredOrders({
                          companyID: currentCompanyID,
                          orderNumber: partsToPrint[0].ORDER_NUMBER,
                        })
                      );
                      if (resultADD11.meta.requestStatus === "fulfilled") {
                        let parts = resultADD11.payload[0].parts;

                        let partToUpdate = parts.find(
                          (part: any) =>
                            part.RECEIVINGS &&
                            part.RECEIVINGS.some((receiving: any) => {
                              return (
                                receiving.RECEIVING_ITEM_NUMBER ==
                                partsToPrint[0].RECEIVING_ITEM_NUMBER
                              );
                            })
                        );
                        if (partToUpdate) {
                          // Обновляем поля
                          // partToUpdate.IS_CANCELLED = true;
                          partToUpdate.state = "PARTLY_RECEIVED";
                          partToUpdate.backorder += partsToPrint[0].QUANTITY;

                          // Находим нужный объект RECEIVINGS и обновляем его
                          let receivingToUpdate = partToUpdate.RECEIVINGS.find(
                            (receiving: any) =>
                              receiving.RECEIVING_ITEM_NUMBER ==
                              partsToPrint[0].RECEIVING_ITEM_NUMBER
                          );
                          if (receivingToUpdate) {
                            receivingToUpdate.IS_CANCELLED = true;
                          }

                          // Создаем массив обновленных материалов
                          let updatedParts = parts.map((part: any) =>
                            part._id === partToUpdate._id ? partToUpdate : part
                          );
                          const resultUPD = await dispatch(
                            updateOrderByID({
                              id: resultADD11.payload[0]._id,
                              companyID: currentCompanyID || "",
                              parts: updatedParts,
                            })
                          );
                        }
                      }
                    }
                  }
                },
              });
            }}
            size="small"
          >
            {t("CANCEL RECEIVING")}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default CancelReceiving;
