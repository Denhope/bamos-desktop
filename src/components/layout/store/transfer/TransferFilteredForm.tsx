import {
  ModalForm,
  ProCard,
  ProForm,
  ProFormGroup,
  ProFormText,
} from "@ant-design/pro-components";
import { Form, FormInstance } from "antd";
import SearchTable from "@/components/layout/SearchElemTable";
import PartNumberSearch from "@/components/store/search/PartNumberSearch";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getFilteredShops } from "@/utils/api/thunks";
type TransferFilteredFormType = {
  onFilterTransferParts: (record: any) => void;
  onSelectLocation: (record: any) => void;
  onSelectedValues: (record: any) => void;
  onSelectSelectedStore?: (record: any) => void;
  onReset?: () => void; // Добавьте эту строку
};
const TransferFilteredForm: FC<TransferFilteredFormType> = ({
  onFilterTransferParts,
  onSelectLocation,
  onSelectSelectedStore,
  onReset,

  onSelectedValues,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [selectedFeatchStore, setSecectedFeatchStore] = useState<any>(null);
  const [selectedStore, setSecectedStore] = useState<any>(null);
  const [selectedSingleStore, setSecectedSingleStore] = useState<any>(null);
  const dispatch = useAppDispatch();
  const [openStoreViewer, setOpenStoreViewer] = useState<boolean>(false);
  const [APN, setAPN] = useState([]);
  const [LOCATION, setLOCATION] = useState([]); //
  const [selectedLocation, setSecectedLocation] = useState<any>(null);
  const [selectedSingleLocation, setSecectedSingleLocation] =
    useState<any>(null);
  const [openLocationViewer, setOpenLocationViewer] = useState<boolean>(false);
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
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const [selectedPN, setSelectedPN] = useState<any>(null);
  const [isReset, setIsReset] = useState(false);
  const handleSelect = (selectedOption: any) => {
    setSelectedPN(selectedOption);
    setIsReset(true); // затем обратно в true
    setIsReset(false); // сначала установите в false
  };
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [initialPN, setInitialPN] = useState("");
  return (
    <>
      <ProForm
        size={"small"}
        onReset={(values) => {
          setSelectedPN(null);
          setIsReset(false);
          setSecectedSinglePN(null);
          setInitialPN("");

          // Сброс значений формы
          onSelectSelectedStore && onSelectSelectedStore(null);
          onSelectedValues(null);
          onSelectLocation(null);
          onFilterTransferParts(null);
          onReset && onReset();
        }}
        formRef={formRef}
        onFinish={async (values: any) => {
          onSelectedValues(values);
          // console.log(values);
          // onSelectLocation(selectedLocation);
          // onFilterTransferParts(selectedFeatchStore);
        }}
        form={form}
        className="bg-white px-4 py-3 rounded-md border-gray-400"
      >
        <ProFormGroup align="center">
          <ProFormText
            initialValue={"MSQ"}
            disabled
            name="station"
            label={`${t("STATION")}`}
            width="xs"
            tooltip={`${t("STATION CODE")}`}
            //rules={[{ required: true }]}
            fieldProps={{
              // onKeyPress: handleKeyPress,
              autoFocus: true,
              onKeyPress: handleKeyPress,
              onChange: (e) => {
                // Преобразование введенного текста в верхний регистр и удаление пробелов по краям
                e.target.value = e.target.value.toUpperCase().trim();
              },
            }}
          />
          <ProFormText
            name="store"
            label={`${t("STORE")}`}
            width="xs"
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
            name="location"
            label={`${t("LOCATION")}`}
            width="xs"
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
            name="label"
            label={`${t("LABEL")}`}
            width="xs"
            tooltip={`${t("LABEL NUMBER")}`}
            //rules={[{ required: true }]}
            fieldProps={{
              onKeyPress: handleKeyPress,
            }}
          />
          <ProFormText
            name="partNumber"
            label={`${t("PART NUMBER")}`}
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
          setInitialPN(selectedSinglePN?.PART_NUMBER || "");
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
            setInitialPN(record.PART_NUMBER);
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
    </>
  );
};

export default TransferFilteredForm;
