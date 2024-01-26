import { ProForm } from "@ant-design/pro-components";
import { Row, Col, message } from "antd";
import { OrderType } from "@/models/IOrder";
import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import OrderCratorTypesForm from "../store/order/OrderCratorTypesForm";
import OrderCreatorDetails from "../store/order/OrderCreatorDetails";
import OrderCreatorForm from "../store/order/OrderCreatorForm";
import { postNewOrder } from "@/utils/api/thunks";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { USER_ID } from "@/utils/api/http";
const OrderCreator: FC = () => {
  const { t } = useTranslation();
  const [orderType, setOrderType] = useState<OrderType>("PURCHASE_ORDER");
  const [orderCreateDate, setOrderCreateDate] = useState("");
  const [orderCreateParts, setOrderCreateParts] = useState<any[]>([]);
  const [orderCreateVendorForm, setOrderCreateVendorsForm] = useState<any>({});

  const handleOrderDetailsChange = (
    newOrderType: OrderType,
    newOrderCreateDate: string
  ) => {
    setOrderType(newOrderType);
    setOrderCreateDate(newOrderCreateDate);
  };

  const initialValues = {
    orderType: "PURCHASE_ORDER",
    orderCreateDate: "",
    orderCreateParts: [],
    orderCreateVendorForm: {},
  };
  const dispatch = useAppDispatch();
  return (
    <div className="h-[79vh] overflow-hidden flex flex-col justify-between gap-1">
      <ProForm
        size="small"
        onFinish={async (values: any) => {
          if (
            orderCreateDate === "" ||
            orderCreateParts.length === 0 ||
            Object.keys(orderCreateVendorForm).length === 0
          ) {
            message.error("Some fields are empty");
          } else {
            const currentCompanyID = localStorage.getItem("companyID") || "";
            const result = dispatch(
              postNewOrder({
                companyID: currentCompanyID,
                createUserID: USER_ID,
                state: "OPEN",

                orderCreateDate,
                parts: orderCreateParts,
                vendors: [orderCreateVendorForm],
                orderType,
              })
            );
            if ((await result).meta.requestStatus === "fulfilled") {
            } else {
              message.error("Error");
            }
            // onSelectLocation(selectedLocation);
            // onFilterTransferParts(selectedFeatchStore);
          }
        }}
        initialValues={initialValues}
      >
        <div className="flex flex-col py-5">
          <div className="py-4">
            <Row gutter={{ xs: 8, sm: 11, md: 24, lg: 32 }}>
              <Col xs={2} sm={6}>
                <OrderCreatorForm
                  onOrderDetailsChange={handleOrderDetailsChange}
                ></OrderCreatorForm>
              </Col>
              <Col xs={32} sm={18}>
                <OrderCratorTypesForm
                  onOrderDetailsChange={setOrderCreateVendorsForm}
                  odrerType={orderType}
                ></OrderCratorTypesForm>
              </Col>
            </Row>
          </div>
          <OrderCreatorDetails
            onAddedData={setOrderCreateParts}
            odrerType={orderType}
          ></OrderCreatorDetails>
        </div>
        <div className="flex justify-between"></div>
      </ProForm>
    </div>
  );
};

export default OrderCreator;
