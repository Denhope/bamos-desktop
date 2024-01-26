import {
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormText,
} from "@ant-design/pro-components";
import { OrderType } from "@/models/IOrder";
import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import PushachceOrderForm from "./purshaceOrders/PushachceOrderForm";
import PurchaseOrderDetails from "./purshaceOrders/PurchaseOrderDetails";
import PurchaseOrderCreateDetails from "./purshaceOrders/PurchaseOrderDetails";
type OrderCreatorDetailsType = {
  odrerType: OrderType;
  onAddedData?: (record: any, rowIndex?: any) => void;
};

const OrderCreatorDetails: FC<OrderCreatorDetailsType> = ({
  odrerType,
  onAddedData,
}) => {
  const { t } = useTranslation();
  return (
    <div>
      {odrerType == "PURCHASE_ORDER" && (
        <PurchaseOrderCreateDetails onAddedData={onAddedData} />
      )}
    </div>
  );
};

export default OrderCreatorDetails;
