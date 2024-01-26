import {
  ModalForm,
  ProCard,
  ProForm,
  ProFormCheckbox,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Form, FormInstance } from "antd";
import SearchTable from "@/components/layout/SearchElemTable";
import PartNumberSearch from "@/components/store/search/PartNumberSearch";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { IStore } from "@/models/IStore";
import moment from "moment";
import React, { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getFilteredShops } from "@/utils/api/thunks";
type ScrapPartsFilteredFormType = {
  onSelectLocation: (record: any) => void;
  onSelectSelectedStore?: (record: any) => void;
  onReset?: () => void; // Добавьте эту строку
  onSelectedValues: (record: any) => void;
  onScrapped?: (record: any) => void;
};
const ScrapPartsFilteredForm: FC<ScrapPartsFilteredFormType> = ({
  onSelectLocation,
  onSelectSelectedStore,
  onSelectedValues,
  onReset,
  onScrapped,
}) => {
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      formRef.current?.submit();
    }
  };
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [shops, setShops] = useState([]);
  const dispatch = useAppDispatch();
  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const [openStoreViewer, setOpenStoreViewer] = useState<boolean>(false);
  const [selectedStore, setSecectedStore] = useState<any>(null);
  const [selectedSingleStore, setSecectedSingleStore] = useState<any>(null);
  const [selectedFeatchStore, setSecectedFeatchStore] = useState<any>(null);
  const [openLocationViewer, setOpenLocationViewer] = useState<boolean>(false);
  const [LOCATION, setLOCATION] = useState([]); //
  const [selectedLocation, setSecectedLocation] = useState<any>(null);
  const [selectedSingleLocation, setSecectedSingleLocation] =
    useState<any>(null);
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [APN, setAPN] = useState([]);
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
  const [isOnlyScrapped, setIsOnlyScrap] = useState<any>(true);
  return (
    <div>
      <ProForm
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        onFinish={async (values: any) => {
          onSelectedValues(values);
          onScrapped && onScrapped(isOnlyScrapped);
        }}
        onReset={(values) => {
          onReset && onReset();
        }}
        form={form}
        formRef={formRef}
        layout="horizontal"
        size="small"
        initialValues={{
          receivingDate: [moment().subtract(1, "months"), moment()],
        }}
      >
        <ProFormGroup>
          <ProFormSelect
            initialValue={"MSQ"}
            disabled
            name="station"
            label={`${t("STATION")}`}
            width="xs"
            tooltip={`${t("STATION CODE")}`}
          />
          <ProFormGroup direction="vertical" size={"small"}>
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
          </ProFormGroup>
          <ProFormGroup direction="vertical" size={"small"}>
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
          </ProFormGroup>
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
          <ProFormCheckbox.Group
            className="my-0 py-0"
            initialValue={["true"]}
            labelAlign="left"
            name="isAllSCPAPPED"
            fieldProps={{
              onChange: (value: any) => setIsOnlyScrap(value),
            }}
            options={[{ label: `${t("ONLY SCRAPPED")}`, value: "true" }].map(
              (option) => ({
                ...option,
                style: { display: "flex", flexWrap: "wrap" }, // Добавьте эту строку
              })
            )}
          />
        </ProFormGroup>
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
          // title={`Search on Store`}
          width={"70vw"}
          // placement={'bottom'}
          open={openStoreFindModal}
          // submitter={false}
          onOpenChange={setOpenStoreFind}
          onFinish={async function (
            record: any,
            rowIndex?: any
          ): Promise<void> {
            setOpenStoreFind(false);
            // handleSelect(selectedSinglePN);

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
              // handleSelect(record);
              form.setFields([
                { name: "partNumber", value: record.PART_NUMBER },
              ]);
            }}
            isLoading={false}
            onRowSingleClick={function (record: any, rowIndex?: any): void {
              setSecectedSinglePN(record);
              form.setFields([
                { name: "partNumber", value: record.PART_NUMBER },
              ]);
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
      </ProForm>
    </div>
  );
};

export default ScrapPartsFilteredForm;
