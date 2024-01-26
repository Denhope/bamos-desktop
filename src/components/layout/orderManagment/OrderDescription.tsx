import {
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormText,
} from "@ant-design/pro-components";
import { Button, Divider, Form, FormInstance } from "antd";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getFilteredOrders } from "@/utils/api/thunks";
type OrderDescriptionType = {
  order: any | null;
  onOrderSearch?: (orders: any | null) => void;
};
const OrderDescription: FC<OrderDescriptionType> = ({
  order,
  onOrderSearch,
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formRef = useRef<FormInstance>(null);
  useEffect(() => {
    if (order) {
      // onSelectSelectedStore && onSelectSelectedStore(selectedStore);
      form.setFields([
        { name: "orderNumber", value: order?.orderNumber },
        { name: "lastModificateBy", value: order?.updateBySing },
        { name: "modificationDate", value: order?.updateDate },
        { name: "createBy", value: order.createBySing },
        { name: "createDate", value: order.createDate },
      ]);

      // onFilterTransferprojects(form.getFieldsValue());
    }
  }, [order]);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  return (
    <div className="flex flex-col gap-5">
      <ProForm
        formRef={formRef}
        submitter={false}
        form={form}
        size="small"
        layout="horizontal"
        className="bg-white px-4 py-3 rounded-md border-gray-400"
      >
        <ProFormGroup>
          <ProFormText
            name="orderSearch"
            width="sm"
            label={t("ORDER No")}
            fieldProps={{
              onPressEnter: async () => {
                const currentCompanyID =
                  localStorage.getItem("companyID") || "";
                if (form.getFieldValue("orderSearch")) {
                  const result = await dispatch(
                    getFilteredOrders({
                      companyID: currentCompanyID,
                      orderNumber: form.getFieldValue("orderSearch"),
                    })
                  );
                  if (result.meta.requestStatus === "fulfilled") {
                    onOrderSearch && onOrderSearch(result.payload[0] || {});
                  } else {
                    form.resetFields();
                  }
                }
              },
              autoFocus: true,
            }}
          ></ProFormText>
          <Button
            type="primary"
            // disabled={!form.getFieldValue('order')}
            onClick={async () => {
              const currentCompanyID = localStorage.getItem("companyID") || "";
              if (form.getFieldValue("orderSearch")) {
                const result = await dispatch(
                  getFilteredOrders({
                    companyID: currentCompanyID,
                    orderNumber: form.getFieldValue("orderSearch"),
                  })
                );
                if (result.meta.requestStatus === "fulfilled") {
                  onOrderSearch && onOrderSearch(result.payload[0] || {});
                } else {
                  form.resetFields();
                }
              }
            }}
          >
            {t("LOAD")}
          </Button>
        </ProFormGroup>
        <Divider className="my-0 py-0 pb-5"></Divider>
        <ProFormGroup>
          <ProFormText
            disabled
            label={t("ORDER No")}
            name="orderNumber"
            width="sm"
          ></ProFormText>
          <ProFormText
            disabled
            name="createBy"
            width="sm"
            label={t("CREATE BY")}
          ></ProFormText>
          <ProFormDatePicker
            disabled
            label={t("CREATE DATE")}
            name="createDate"
            width="sm"
          ></ProFormDatePicker>
        </ProFormGroup>
        <ProFormGroup>
          <ProFormText
            disabled
            label={t("LAST MODIFIED BY")}
            name="lastModificateBy"
            width="sm"
          ></ProFormText>

          <ProFormDatePicker
            disabled
            label={t("MODIFICATION DATE")}
            name="modificationDate"
            width="sm"
          ></ProFormDatePicker>
        </ProFormGroup>
      </ProForm>
    </div>
  );
};

export default OrderDescription;
