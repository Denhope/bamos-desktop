import {
  ModalForm,
  ProCard,
  ProForm,
  ProFormCheckbox,
  ProFormDigit,
  ProFormGroup,
  ProFormText,
} from "@ant-design/pro-components";
import { Form } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import SearchTable from "@/components/layout/SearchElemTable";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getFilteredShops } from "@/utils/api/thunks";
type BookingDetailsFormType = {
  onFilterBookingDEtails?: (record: any) => void;
  initialStoreName?: any;
};
const BookingDetailsForm: FC<BookingDetailsFormType> = ({
  onFilterBookingDEtails,
  initialStoreName,
}) => {
  const { t } = useTranslation();

  // Состояние для управления чекбоксами
  const [isTransferPartsChecked, setIsTransferPartsChecked] = useState(false);
  const [isChangeLocationChecked, setIsChangeLocationChecked] = useState(true);
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
    if (initialStoreName) {
      // setSecectedStore(initialStore);

      form.setFields([
        { name: "targetStore", value: initialStoreName?.toUpperCase().trim() },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [initialStoreName]);

  useEffect(() => {
    if (selectedStore) {
      form.setFields([
        {
          name: "targetStore",
          value: selectedStore?.APNNBR || selectedStore?.shopShortName,
        },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [selectedStore]);
  useEffect(() => {
    if (selectedLocation) {
      form.setFields([
        { name: "targetLocation", value: selectedLocation.APNNBR },
        { name: "owner", value: selectedLocation.ownerShotName },
        {
          name: "rectriction",
          value: selectedLocation.rectriction?.toUpperCase(),
        },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
      onFilterBookingDEtails && onFilterBookingDEtails(form.getFieldsValue());
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
    if (openLocationViewer) {
      // Если модальное окно открыто
      const currentCompanyID = localStorage.getItem("companyID") || "";
      dispatch(
        getFilteredShops({
          companyID: currentCompanyID,
          shopShortName:
            selectedStore?.APNNBR ||
            selectedStore?.shopShortName?.toUpperCase().trim(),
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

  return (
    <>
      <ProForm
        size="small"
        submitter={false}
        className="bg-white px-4 py-3 rounded-md border-gray-400"
        form={form}
        onValuesChange={(changedValues, allValues) => {
          if (changedValues.store && isChangeLocationChecked) {
            form.setFieldsValue({
              targetStore: allValues.store,
            });
          }
        }}
      >
        <ProFormGroup size={"large"}>
          <ProFormGroup>
            <ProFormText
              initialValue={"MSQ"}
              disabled
              name="station"
              label={`${t("STATION")}`}
              width="xs"
              tooltip={`${t("STATION CODE")}`}
              fieldProps={{
                autoFocus: true,
              }}
            />

            <ProFormText
              name="targetStore"
              label={`${t("TARGET STORE")}`}
              width="sm"
              tooltip={`${t("TARGET STORE")}`}
              disabled={isChangeLocationChecked} // Поле неактивно, если выбран чекбокс "Change location"
              initialValue={
                isChangeLocationChecked
                  ? form.getFieldValue("store")
                  : undefined
              } // Значение равно значению поля "STORE", если выбран чекбокс "Change location"
              fieldProps={{
                onDoubleClick: () => setOpenStoreViewer(true),
                // onKeyPress: handleKeyPress,
                autoFocus: true,
              }}
            />
            <ProFormText
              name="targetLocation"
              label={`${t("TARGET LOCATION")}`}
              width="sm"
              tooltip={`${t("TARGET LOCATION")}`}
              fieldProps={{
                onDoubleClick: () => setOpenLocationViewer(true),
                // onKeyPress: handleKeyPress,
              }}
            />
            <ProFormText
              name="rectriction"
              disabled
              label={`${t("RESRTICTION")}`}
              width="sm"
              tooltip={`${t("RESTRICTION")}`}
            />
          </ProFormGroup>
          <ProFormGroup size={"small"}>
            <ProFormCheckbox
              fieldProps={{
                checked: isTransferPartsChecked,
                onChange: (e: CheckboxChangeEvent) => {
                  setIsTransferPartsChecked(e.target.checked);
                  setIsChangeLocationChecked(!e.target.checked);
                },
              }}
            >
              {t("TRANSFER PARTS")}
            </ProFormCheckbox>
            <ProFormCheckbox
              fieldProps={{
                checked: isChangeLocationChecked,
                onChange: (e: CheckboxChangeEvent) => {
                  setIsChangeLocationChecked(e.target.checked);
                  setIsTransferPartsChecked(!e.target.checked);
                },
              }}
            >
              {t("CHANGE LOCATION")}
            </ProFormCheckbox>
          </ProFormGroup>
          <ProFormGroup>
            <ProFormDigit
              name="quantity"
              label={`${t("QUANTITY")}`}
              width="xs"
              disabled={isChangeLocationChecked}
              fieldProps={{
                autoFocus: true,
              }}
            />
            <ProFormText
              disabled
              name="owner"
              label={`${t("LOCATION OWNER")}`}
              width="md"
              fieldProps={{
                autoFocus: true,
              }}
            />
            <ProFormText
              name="remarks"
              label={`${t("REMARKS")}`}
              width="md"
              tooltip={`${t("REMARKS")}`}
              fieldProps={{
                autoFocus: true,
              }}
            />
          </ProFormGroup>
        </ProFormGroup>
      </ProForm>
      <ModalForm
        onFinish={async () => {
          setSecectedStore(selectedSingleStore);
          setOpenStoreViewer(false);
        }}
        title={`${t("TARGET STORE")}`}
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
                console.log(record);
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

export default BookingDetailsForm;
