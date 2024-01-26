import {
  FormInstance,
  ModalForm,
  ProCard,
  ProForm,
  ProFormDateRangePicker,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormCheckbox,
} from "@ant-design/pro-components";
import { DatePickerProps, Form, message } from "antd";
import { useAppDispatch } from "@/hooks/useTypedSelector";

import React, { FC, useEffect, useRef, useState } from "react";
import PartNumberSearch from "../search/PartNumberSearch";
import {
  getFilteredOrders,
  getFilteredShops,
  getFilteredReceivingItems,
} from "@/utils/api/thunks";
import SearchTable from "@/components/layout/SearchElemTable";
import { RangePickerProps } from "antd/es/date-picker";
import moment from "moment";
import { useTranslation } from "react-i18next";
type ReceivingItemsFilterFormType = {
  onReceivingSearch: (orders: any[] | []) => void;
};
const ReceivingItemsFilterorm: FC<ReceivingItemsFilterFormType> = ({
  onReceivingSearch,
}) => {
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const [isOnlyReturn, setIsOnlyReturn] = useState<any>(false);
  const [isOnlyCancelled, setIsOnlyCancelled] = useState<any>(false);
  const dispatch = useAppDispatch();
  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const handleSelect = (selectedOption: any) => {};
  const [selectedSingleLocation, setSecectedSingleLocation] =
    useState<any>(null);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [openStoreViewer, setOpenStoreViewer] = useState<boolean>(false);
  const [openLocationViewer, setOpenLocationViewer] = useState<boolean>(false);
  const [selectedStore, setSecectedStore] = useState<any>(null);
  const [selectedSingleStore, setSecectedSingleStore] = useState<any>(null);
  const [selectedFeatchStore, setSecectedFeatchStore] = useState<any>(null);
  const [LOCATION, setLOCATION] = useState([]); //
  const [APN, setAPN] = useState([]);
  const [selectedLocation, setSecectedLocation] = useState<any>(null);
  useEffect(() => {
    if (selectedStore) {
      // onSelectSelectedStore && onSelectSelectedStore(selectedStore);
      form.setFields([
        { name: "store", value: selectedStore.APNNBR },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
      // onFilterTransferParts(form.getFieldsValue());
    }
  }, [selectedStore]);
  useEffect(() => {
    if (selectedLocation) {
      form.setFields([
        { name: "location", value: selectedLocation.APNNBR },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [selectedLocation]);
  useEffect(() => {
    if (openStoreViewer) {
      // Если модальное окно открыто
      const currentCompanyID = localStorage.getItem("companyID") || "";
      dispatch(
        getFilteredShops({
          companyID: currentCompanyID,
        })
      ).then((action) => {
        if (action.meta.requestStatus === "fulfilled") {
          const transformedData = action.payload.map((item: any) => ({
            ...item,
            APNNBR: item.shopShortName, // Преобразуем shopShortName в APNNBR
          }));
          setAPN(transformedData);
          // Обновляем состояние с преобразованными данными
        }
      });
    }
  }, [openStoreViewer, dispatch]);
  useEffect(() => {
    if (
      openLocationViewer &&
      (selectedStore?.APNNBR || form.getFieldValue("store"))
    ) {
      // Если модальное окно открыто
      const currentCompanyID = localStorage.getItem("companyID") || "";
      dispatch(
        getFilteredShops({
          companyID: currentCompanyID,
          shopShortName:
            selectedStore?.APNNBR ||
            form.getFieldValue("store").toUpperCase().trim(),
        })
      ).then((action) => {
        if (action.meta.requestStatus === "fulfilled") {
          setSecectedFeatchStore(action.payload[0]);
          const transformedData = action.payload[0].locations.map(
            (item: any) => ({
              ...item,
              APNNBR: item.locationName, // Преобразуем shopShortName в APNNBR
            })
          );

          setLOCATION(transformedData);
          // Обновляем состояние с преобразованными данными
        }
      });
    }
  }, [openLocationViewer, dispatch]);
  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const onChange = (
    value: DatePickerProps["value"] | RangePickerProps["value"],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };
  return (
    <>
      <ProForm
        initialValues={{
          receivingDate: [moment().subtract(1, "months"), moment()],
        }}
        onFinish={async (values: any) => {
          if (null) {
            message.error("Some fields are empty");
          } else {
            const currentCompanyID = localStorage.getItem("companyID") || "";
            const result = dispatch(
              getFilteredReceivingItems({
                companyID: currentCompanyID,
                orderNumber: form.getFieldValue("onorderNumber"),
                vendorName: form.getFieldValue("vendorName"),
                partNumber: form.getFieldValue("partNumber"),
                orderType: form.getFieldValue("orderType"),
                serialNumber: form.getFieldValue("serialNumber"),
                batchNumber: form.getFieldValue("batchNumber"),
                receiningNumber: form.getFieldValue("receiningNumber"),
                receiningItemNumber: form.getFieldValue("receiningItemNumber"),
                store: form.getFieldValue("store"),
                station: form.getFieldValue("station"),
                partGroup: form.getFieldValue("partGroup"),
                partType: form.getFieldValue("partType"),
                location: form.getFieldValue("location"),
                receivedBy: form.getFieldValue("receivedBy"),
                label: form.getFieldValue("label"),
                startDate: selectedStartDate,
                endDate: selectedEndDate,
                isReturned: isOnlyReturn,
                isCancelled: isOnlyCancelled,
              })
            );
            if ((await result).meta.requestStatus === "fulfilled") {
              onReceivingSearch((await result).payload || []);
            } else {
              message.error("Error");
            }
            // onSelectLocation(selectedLocation);
            // onFilterTransferParts(selectedFeatchStore);
          }
        }}
        layout="horizontal"
        formRef={formRef}
        size="small"
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        form={form}
      >
        <ProFormGroup>
          <ProFormGroup direction="vertical" size={"small"}>
            <ProFormText
              name="onorderNumber"
              label={`${t("ORDER No")}`}
              width="sm"
              tooltip="ORDER NUMBER"
              //rules={[{ required: true }]}
              fieldProps={{
                onKeyPress: handleKeyPress,
                autoFocus: true,
              }}
            />
            <ProFormText
              name="partNumber"
              label={`${t("PART No")}`}
              width="sm"
              tooltip={`${t("PART NUMBER")}`}
              //rules={[{ required: true }]}
              fieldProps={{
                onDoubleClick: () => {
                  setOpenStoreFind(true);
                },
                onKeyPress: handleKeyPress,
              }}
            />
            <ProFormText
              name="serialNumber"
              label={t("SERIAL No")}
              width="sm"
              tooltip={t("SERIAL No")}
              fieldProps={{
                // onDoubleClick: () => setOpenPickViewer(true),
                onKeyPress: handleKeyPress,
                autoFocus: true,
              }}
            ></ProFormText>
            <ProFormText
              name="batchNumber"
              label={t("BATCH No")}
              width="sm"
              tooltip={t("BATCH No")}
              fieldProps={{
                // onDoubleClick: () => setOpenPickViewer(true),
                onKeyPress: handleKeyPress,
                autoFocus: true,
              }}
            ></ProFormText>
          </ProFormGroup>
          <ProFormGroup direction="vertical" size={"small"}>
            <ProFormText
              name="receiningNumber"
              label={`${t("RECEIVING No")}`}
              width="sm"
              tooltip="RECEIVING NUMBER"
              //rules={[{ required: true }]}
              fieldProps={{
                onKeyPress: handleKeyPress,
                autoFocus: true,
              }}
            />
            <ProFormText
              name="receiningItemNumber"
              label={`${t("RECEIVING ITEM No")}`}
              width="sm"
              tooltip="RECEIVING ITEM NUMBER"
              //rules={[{ required: true }]}
              fieldProps={{
                onKeyPress: handleKeyPress,
                autoFocus: true,
              }}
            />
            <ProFormSelect
              showSearch
              mode="multiple"
              name="orderType"
              label={t("ORDER TYPE")}
              width="sm"
              tooltip={t("ORDER TYPE")}
              valueEnum={{
                // SB_ORDER: t('SB ORDER'),
                // CUSTOMER_LOAN_ORDER: t('CUSTOMER LOAN ORDER'),
                // CUSTOMER_PROVISION_ORDER: t('CUSTOMER PROVISION ORDER'),
                // CONTRACT_RE_ORDER: t('CONTRACT RE ORDER'),
                // INCOMING_REQUEST_ORDER: t('INCOMING REQUEST ORDER'),
                // INCOMING_REQUEST_IN_ADVANCE_ORDER: t(
                //   'INCOMING REQUEST IN ADVANCE ORDER'
                // ),
                // LOAN_ORDER: t('LOAN ORDER'),
                // MATERIAL_PRODUCTION_ORDER: t('MATERIAL PRODUCTION ORDER'),
                // OUTGOING_REQUEST_ORDER: t('OUTGOING REQUEST ORDER'),
                // OUTGOING_REQUEST_IN_ADVANCE_ORDER: t(
                //   'OUTGOING REQUEST IN ADVANCE ORDER'
                // ),
                PURCHASE_ORDER: t("PURCHASE ORDER"),
                // POOL_REQUEST_ORDER: t('POOL REQUEST ORDER'),
                // POOL_REQUEST_EXCHANGE_ORDER: t('POOL REQUEST EXCHANGE ORDER'),
                REPAIR_ORDER: t("REPAIR ORDER"),
                CUSTOMER_REPAIR_ORDER: t("CUSTOMER REPAIR ORDER"),
                // CONSIGNMENT_STOCK_INCOMING_ORDER: t(
                //   'CONSIGNMENT STOCK INCOMING ORDER'
                // ),
                // CONSIGNMENT_STOCK_PURCHASE_ORDER: t(
                //   'CONSIGNMENT STOCK PURCHASE ORDER'
                // ),
                WARRANTY_ORDER: t("WARRANTY ORDER"),
                EXCHANGE_ORDER: t("EXCHANGE ORDER"),
                // EXCHANGE_IN_ADVANCE_ORDER: t('EXCHANGE IN ADVANCE ORDER'),
                TRANSFER_ORDER: t("TRANSFER ORDER"),
              }}
            />
            <ProFormDateRangePicker
              name="receivingDate"
              label={`${t("RECEIVING DATE")}`}
              width="sm"
              tooltip="RECEIVING DATE"
              fieldProps={{
                onChange: onChange,
              }}
            />
          </ProFormGroup>
          <ProFormGroup direction="vertical" size={"small"}>
            <ProFormText
              label={`${t("VENDOR")}`}
              name="vendorName"
              tooltip="VENDOR NAME"
              //rules={[{ required: true }]}
              fieldProps={{
                autoFocus: true,
                onKeyPress: handleKeyPress,
              }}
            />

            <ProFormText
              disabled
              name="station"
              label={`${t("STATION")}`}
              tooltip="STATION"
              //rules={[{ required: true }]}
              fieldProps={{
                autoFocus: true,
                onKeyPress: handleKeyPress,
              }}
            />
            <ProFormText
              name="store"
              label={`${t("STORE")}`}
              width="sm"
              tooltip={`${t("STORE CODE")}`}
              //rules={[{ required: true }]}
              fieldProps={{
                onDoubleClick: () => setOpenStoreViewer(true),
                // onKeyPress: handleKeyPress, onKeyPress: handleKeyPress,
                autoFocus: true,
                onKeyPress: handleKeyPress,
                onChange: (e) => {
                  // Преобразование введенного текста в верхний регистр и удаление пробелов по краям
                  e.target.value = e.target.value.toUpperCase().trim();
                },
              }}
            />
            <ProFormText
              name="label"
              label={`${t("LABEL")}`}
              width="sm"
              tooltip={`${t("LABEL CODE")}`}
              //rules={[{ required: true }]}
              fieldProps={{
                // onKeyPress: handleKeyPress, onKeyPress: handleKeyPress,
                autoFocus: true,
                onKeyPress: handleKeyPress,
                onChange: (e) => {
                  // Преобразование введенного текста в верхний регистр и удаление пробелов по краям
                  e.target.value = e.target.value.toUpperCase().trim();
                },
              }}
            />
          </ProFormGroup>
          <ProFormGroup direction="vertical" size={"small"}>
            <ProFormSelect
              mode="multiple"
              name="partGroup"
              label={`${t("PART SPESIAL GROUP")}`}
              width="sm"
              tooltip={`${t("SELECT SPESIAL GROUP")}`}
              options={[
                { value: "CONS", label: t("CONS") },
                { value: "TOOL", label: t("TOOL") },
                { value: "CHEM", label: t("CHEM") },
                { value: "ROT", label: t("ROT") },
                { value: "GSE", label: t("GSE") },
              ]}
            />
            <ProFormSelect
              mode="multiple"
              name="partType"
              label={`${t("PART TYPE")}`}
              width="sm"
              tooltip={`${t("SELECT PART TYPE")}`}
              options={[
                { value: "ROTABLE", label: t("ROTABLE") },
                { value: "CONSUMABLE", label: t("CONSUMABLE") },
              ]}
            />
            <ProFormText
              name="location"
              label={`${t("LOCATION")}`}
              width="sm"
              tooltip={`${t("LOCATION")}`}
              fieldProps={{
                onDoubleClick: () => setOpenLocationViewer(true),
                // onKeyPress: handleKeyPress,
                onKeyPress: handleKeyPress,
                onChange: (e) => {
                  // Преобразование введенного текста в верхний регистр и удаление пробелов по краям
                  e.target.value = e.target.value.toUpperCase().trim();
                },
              }}
            />
            <ProFormText
              name="receivedBy"
              label={`${t("RECEIVED BY")}`}
              width="sm"
              tooltip={`${t("RECEIVED BY")}`}
              fieldProps={{
                // onDoubleClick: () => setOpenLocationViewer(true),
                // onKeyPress: handleKeyPress,
                onKeyPress: handleKeyPress,
                onChange: (e) => {
                  // Преобразование введенного текста в верхний регистр и удаление пробелов по краям
                  e.target.value = e.target.value.toUpperCase().trim();
                },
              }}
            />
          </ProFormGroup>
          <ProFormGroup direction="vertical" size={"small"}>
            <ProFormCheckbox.Group
              className="my-0 py-0"
              //initialValue={['false']}
              labelAlign="left"
              name="isAllDAte"
              fieldProps={{
                onChange: (value: any) => setIsOnlyReturn(value),
              }}
              options={[{ label: `${t("ONLY RETURNED")}`, value: "true" }].map(
                (option) => ({
                  ...option,
                  style: { display: "flex", flexWrap: "wrap" }, // Добавьте эту строку
                })
              )}
            />
            <ProFormCheckbox.Group
              className="my-0 py-0"
              //initialValue={['false']}
              labelAlign="left"
              name="isAllCANCELLED"
              fieldProps={{
                onChange: (value: any) => setIsOnlyCancelled(value),
              }}
              options={[{ label: `${t("ONLY CANCELLED")}`, value: "true" }].map(
                (option) => ({
                  ...option,
                  style: { display: "flex", flexWrap: "wrap" }, // Добавьте эту строку
                })
              )}
            />
          </ProFormGroup>
        </ProFormGroup>
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
          handleSelect(selectedSinglePN);

          form.setFields([
            { name: "partNumber", value: selectedSinglePN.PART_NUMBER },
          ]);
        }}
      >
        <PartNumberSearch
          initialParams={{ partNumber: "" }}
          scroll={45}
          onRowClick={function (record: any, rowIndex?: any): void {
            setOpenStoreFind(false);
            handleSelect(record);
            form.setFields([{ name: "partNumber", value: record.PART_NUMBER }]);
          }}
          isLoading={false}
          onRowSingleClick={function (record: any, rowIndex?: any): void {
            setSecectedSinglePN(record);
            form.setFields([{ name: "partNumber", value: record.PART_NUMBER }]);
          }}
        />
      </ModalForm>
      <ModalForm
        onFinish={async () => {
          setSecectedLocation(selectedSingleLocation);
          setOpenLocationViewer(false);
        }}
        title={`${t("LOCATION SEARCH")}`}
        open={openLocationViewer}
        width={"35vw"}
        onOpenChange={setOpenLocationViewer}
      >
        <ProCard
          className="flex mx-auto justify-center align-middle"
          style={{}}
        >
          {LOCATION && (
            <SearchTable
              data={LOCATION}
              onRowClick={function (record: any, rowIndex?: any): void {
                setSecectedLocation(record);
                setOpenLocationViewer(false);
              }}
              onRowSingleClick={function (record: any, rowIndex?: any): void {
                setSecectedSingleLocation(record);
              }}
            ></SearchTable>
          )}
        </ProCard>
      </ModalForm>
      <ModalForm
        onFinish={async () => {
          setSecectedStore(selectedSingleStore);
          setOpenStoreViewer(false);
        }}
        title={`${t("STORE SEARCH")}`}
        open={openStoreViewer}
        width={"35vw"}
        onOpenChange={setOpenStoreViewer}
      >
        <ProCard
          className="flex mx-auto justify-center align-middle"
          style={{}}
        >
          {APN && (
            <SearchTable
              data={APN}
              onRowClick={function (record: any, rowIndex?: any): void {
                setSecectedStore(record);
                setOpenStoreViewer(false);
              }}
              onRowSingleClick={function (record: any, rowIndex?: any): void {
                setSecectedSingleStore(record);
              }}
            ></SearchTable>
          )}
        </ProCard>
      </ModalForm>
    </>
  );
};

export default ReceivingItemsFilterorm;
