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
type CreateStoreFormType = {
  odrerType: OrderType;
  onOrderDetailsChange: (data: any) => void;
};

const OrderCratorTypesForm: FC<CreateStoreFormType> = ({
  odrerType,
  onOrderDetailsChange,
}) => {
  const { t } = useTranslation();
  return (
    <div>
      {odrerType == "PURCHASE_ORDER" && (
        <PushachceOrderForm
          onPushachceOrderForm={onOrderDetailsChange}
        ></PushachceOrderForm>
      )}
    </div>
  );
};

export default OrderCratorTypesForm;
