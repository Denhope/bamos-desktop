import {
  ModalForm,
  ProForm,
  ProFormDateRangePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { DatePickerProps, Form, FormInstance, message } from "antd";
import { RangePickerProps } from "antd/es/date-picker";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PartNumberSearch from "../search/PartNumberSearch";
import {
  getFilteredProjects,
  getFilteredShops,
  getFilteredBookingItems,
  getFilteredPartNumber,
} from "@/utils/api/thunks";

type PartTrackingFilterFormType = {
  onBookingSearch: (bookings: any[] | []) => void;
  onPartSearch: (part?: any) => void;
};

const PartTrackingFilterForm: FC<PartTrackingFilterFormType> = ({
  onBookingSearch,
  onPartSearch,
}) => {
  interface Option {
    value: string;
    label: string;
  }
  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const { t } = useTranslation();
  const [receiverType, setReceiverType] = useState("PROJECT");
  const [options, setOptions] = useState<Option[]>([]); // указываем тип состояния явно
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const onChange = (
    value: DatePickerProps["value"] | RangePickerProps["value"],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const currentCompanyID = localStorage.getItem("companyID");

  useEffect(() => {
    const fetchData = async () => {
      if (form.getFieldValue("partNumber")) {
        const result = await dispatch(
          getFilteredPartNumber({
            partNumber: form.getFieldValue("partNumber"),
            companyID: currentCompanyID || "",
          })
        );
        if (result.meta.requestStatus === "fulfilled") {
          onPartSearch(result.payload[0]);
        }
      }
    };
    fetchData();
  }, [form.getFieldValue("partNumber")]);

  useEffect(() => {
    if (receiverType) {
      let action;
      let url;
      switch (receiverType) {
        case "PROJECT":
          action = getFilteredProjects({ companyID: currentCompanyID || "" });
          break;
        case "AC":
          url = "/api/ac";
          break;
        case "SHOP":
          action = getFilteredShops({ companyID: currentCompanyID || "" });
          break;
        default:
          url = "/api/default";
      }

      if (action) {
        dispatch(action)
          .then((action) => {
            const data: any[] = action.payload; // предполагаем, что payload содержит массив данных
            let options;
            switch (receiverType) {
              case "PROJECT":
                options = data.map((item: any) => ({
                  value: item.projectWO, // замените на нужное поле для 'PROJECT'
                  label: item.projectWO, // замените на нужное поле для 'PROJECT'
                }));
                break;
              case "AC":
                options = data.map((item: any) => ({
                  value: item.acField1, // замените на нужное поле для 'AC'
                  label: item.acField2, // замените на нужное поле для 'AC'
                }));
                break;
              case "SHOP":
                options = data.map((item: any) => ({
                  value: item.shopShortName, // замените на нужное поле для 'SHOP'
                  label: item.shopShortName, // замените на нужное поле для 'SHOP'
                }));
                break;
              default:
                options = data.map((item: any) => ({
                  value: item.defaultField1, // замените на нужное поле для 'default'
                  label: item.defaultField2, // замените на нужное поле для 'default'
                }));
            }
            setOptions(options);
          })
          .catch((error) => {
            console.error("Ошибка при получении данных:", error);
          });
      }
    }
  }, [receiverType, dispatch]);
  return (
    <div>
      <ProForm
        size="small"
        onValuesChange={(changedValues, allValues) => {
          // Handle changes in the form
          if (changedValues.receiverType) {
            setReceiverType(changedValues.receiverType);
          }
        }}
        onFinish={async (values: any) => {
          const filteredValues = Object.entries(values).filter(
            ([key]) => key !== "receiverType"
          );
          if (filteredValues.some(([, value]) => value !== "")) {
            if (null) {
              message.error("Some fields are empty");
            } else {
              const currentCompanyID = localStorage.getItem("companyID") || "";
              const result = dispatch(
                getFilteredBookingItems({
                  companyID: currentCompanyID,
                  orderNumber: form.getFieldValue("order"),
                  registrationNumber: form.getFieldValue("registrationNumber"),
                  partNumber: form.getFieldValue("partNumber"),
                  partType: form.getFieldValue("partType"),
                  partGroup: form.getFieldValue("partGroup"),
                  serialNumber: form.getFieldValue("serialNumber"),
                  batchNumber: form.getFieldValue("BATCH_NUMBER"),
                  projectWO: form.getFieldValue("projectWO"),
                  storeShop: form.getFieldValue("storeShop"),
                  voucherModel: form.getFieldValue("voucherModel"),
                  startDate: selectedStartDate,
                  endDate: selectedEndDate,
                })
              );
              if ((await result).meta.requestStatus === "fulfilled") {
                onBookingSearch((await result).payload || []);
              } else {
                message.error("Error");
              }
            }
          }
        }}
        formRef={formRef}
        form={form}
        layout="horizontal"
      >
        <ProFormText
          name="partNumber"
          label={t("PART NUMBER")}
          width="lg"
          tooltip={t("PART No")}
          fieldProps={{
            onDoubleClick: () => {
              setOpenStoreFind(true);
            },
            onKeyPress: handleKeyPress,
            autoFocus: true,
          }}
        ></ProFormText>
        <ProFormText
          name="serialNumber"
          label={t("SERIAL NUMBER")}
          width="lg"
          tooltip={t("SERIAL No")}
          fieldProps={{
            // onDoubleClick: () => setOpenPickViewer(true),
            onKeyPress: handleKeyPress,
            autoFocus: true,
          }}
        ></ProFormText>
        <ProFormText
          width="lg"
          name="BATCH_NUMBER"
          label={`${t("BATCH NUMBER")}`}
          tooltip="BATCH NUMBER"
          fieldProps={{
            onKeyPress: handleKeyPress,
          }}
        />{" "}
        <ProFormSelect
          mode="multiple"
          name="partType"
          label={`${t("PART TYPE")}`}
          width="lg"
          tooltip={`${t("SELECT PART TYPE")}`}
          options={[
            { value: "ROTABLE", label: t("ROTABLE") },
            { value: "CONSUMABLE", label: t("CONSUMABLE") },
          ]}
        />
        <ProFormSelect
          mode="multiple"
          name="partGroup"
          label={`${t("PART SPESIAL GROUP")}`}
          width="lg"
          tooltip={`${t("SELECT SPESIAL GROUP")}`}
          options={[
            { value: "CONS", label: t("CONS") },
            { value: "TOOL", label: t("TOOL") },
            { value: "CHEM", label: t("CHEM") },
            { value: "ROT", label: t("ROT") },
            { value: "GSE", label: t("GSE") },
          ]}
        />
        <ProForm.Group>
          <ProFormRadio.Group
            name="receiverType"
            label={`${t("RECEIVER TYPE")}`}
            tooltip="ENTER TYPE "
            options={[
              { value: "PROJECT", label: `${t(`PROJECT`)}` },
              { value: "AC", label: "AIRCRAFT" },
              { value: "SHOP", label: `${t(`SHOP/STORE`)}` },
            ]}
            initialValue="PROJECT"
          />
          {receiverType === "PROJECT" && (
            <ProFormSelect
              mode="multiple"
              name="projectWO"
              label={`${t(`PROJECT SELECT`)}`}
              width="lg"
              options={options}
            />
          )}
          {receiverType === "AC" && (
            <ProFormText
              name="registrationNumber"
              label="A/C REGISTRATION"
              width="lg"
              fieldProps={{
                onKeyPress: handleKeyPress,
              }}
              // options={options}
            />
          )}
          {receiverType === "SHOP" && (
            <ProFormSelect
              name="storeShop"
              label={`${t(`SHOP/STORE SELECT`)}`}
              width="lg"
              options={options}
            />
          )}
        </ProForm.Group>
        <ProFormSelect
          mode="multiple"
          name="voucherModel"
          label={`${t("BOOKING TYPE")}`}
          width="lg"
          tooltip={`${t("SELECT BOOKING TYPE")}`}
          options={[
            { value: "STORE_TO_A/C", label: t("STORE_TO_A/C") },
            { value: "A/C_TO_STORE", label: t("A/C_TO_STORE") },
            { value: "BACK_TO_STORE", label: t("BACK_TO_STORE") },
            { value: "CHANGE_LOCATION", label: t("CHANGE_LOCATION") },
            { value: "A/C_TYPE_CHANGE", label: t("AC_TYPE_CHANGE") },
            { value: "STORE_TO_SHOP", label: t("STORE_TO_SHOP") },
            { value: "RECEIVING_GOODS", label: t("RECEIVING_GOODS") },
            { value: "RECEIVING_CANCELLED", label: t("RECEIVING_CANCELLED") },
            { value: "BATCH_CHANGE", label: t("BATCH_CHANGE") },
            // { value: 'ADD_ROTABLES', label: t('ADD_ROTABLES') },

            { value: "COMPONENT_INSPECTION", label: t("COMPONENT_INSPECTION") },
            { value: "RETURN_DELIVERY", label: t("RETURN_DELIVERY") },
            // { value: 'DELETE_REQUIREMENT', label: t('DELETE_REQUIREMENT') },

            { value: "ENTITY_CHANGE", label: t("ENTITY_CHANGE") },
            { value: "SHOP_TO_STORE", label: t("SHOP_TO_STORE") },
            // { value: 'EXCHANGED', label: t('EXCHANGED') },
            // {
            //   value: 'INCOMING_SHIPMENT_ARRIVED',
            //   label: t('INCOMING_SHIPMENT_ARRIVED'),
            // },
            // { value: 'INTERVAL_REMOVED', label: t('INTERVAL_REMOVED') },
            { value: "KIT_TRANSFER", label: t("KIT_TRANSFER") },
            { value: "INVOCE_DETAIL_BOOKED", label: t("INVOCE_DETAIL_BOOKED") },
            { value: "MAT_CLASS_CHANGE", label: t("MAT_CLASS_CHANGE") },
            { value: "MODIFIED", label: t("MODIFIED") },
            { value: "OWNER_CHANGE", label: t("OWNER_CHANGE") },
            { value: "PART_ACTIVATED", label: t("PART_ACTIVATED") },
            { value: "PART_DEACTIVATED", label: t("PART_DEACTIVATED") },
            { value: "UNIT_CHANGE", label: t("UNIT_CHANGE") },
            { value: "AV_PRICE_CHANGE", label: t("AV_PRICE_CHANGE") },
            { value: "QUARANTINE", label: t("QUARANTINE") },
            { value: "PART_NUMBER_CHANGE", label: t("PART_NUMBER_CHANGE") },
            { value: "PART_RESERVATION", label: t("PART_RESERVATION") },
            { value: "QTY_CHANGE", label: t("QTY_CHANGE") },
            { value: "STOCK_PURCHASE", label: t("STOCK_PURCHASE") },
            { value: "SCRAP", label: t("SCRAP") },
            { value: "SHELF_INSPECTION", label: t("SHELF_INSPECTION") },
            { value: "S/N_CHANGE", label: t("S/N_CHANGE") },
            { value: "TRANSFER", label: t("TRANSFER") },
            { value: "TRANSFER_CANCELLED", label: t("TRANSFER_CANCELLED") },
            { value: "TRANSFER_RECEIVE", label: t("TRANSFER_RECEIVE") },
            { value: "TRANSFER_SHIP", label: t("TRANSFER_SHIP") },
            { value: "TOOL_TRANSFER", label: t("TOOL_TRANSFER") },
            { value: "TOOL_LOST_NOTICE", label: t("TOOL_LOST_NOTICE") },
            { value: "VENDOR_INSTALATION", label: t("VENDOR_INSTALATION") },
            {
              value: "INCOMING_SHIPMENT_SENT",
              label: t("INCOMING_SHIPMENT_SENT"),
            },
            // {
            //   value: 'OUTGOIN SHIPMENT ARRIVED',
            //   label: t('OUTGOIN SHIPMENT ARRIVED'),
            // },
          ]}
        />
        <ProFormDateRangePicker
          name="bookingDate"
          label={`${t("BOOKING DATE")}`}
          width="lg"
          tooltip="BOOKING DATE"
          fieldProps={{
            onChange: onChange,
          }}
        />
      </ProForm>
      <ModalForm
        // title={`Search on Store`}
        width={"70vw"}
        // placement={'bottom'}
        open={openStoreFindModal}
        // submitter={false}
        onOpenChange={setOpenStoreFind}
        onFinish={async function (record: any, rowIndex?: any): Promise<void> {
          setOpenStoreFind(false);

          form.setFields([
            { name: "partNumber", value: selectedSinglePN.PART_NUMBER },
            { name: "description", value: record.DESCRIPTION },
          ]);
        }}
      >
        <PartNumberSearch
          initialParams={{ partNumber: "" }}
          scroll={45}
          onRowClick={function (record: any, rowIndex?: any): void {
            setOpenStoreFind(false);

            form.setFields([{ name: "partNumber", value: record.PART_NUMBER }]);
            form.setFields([
              { name: "description", value: record.DESCRIPTION },
            ]);
          }}
          isLoading={false}
          onRowSingleClick={function (record: any, rowIndex?: any): void {
            setSecectedSinglePN(record);
            onPartSearch(record);
            form.setFields([{ name: "partNumber", value: record.PART_NUMBER }]);
          }}
        />
      </ModalForm>
    </div>
  );
};

export default PartTrackingFilterForm;
