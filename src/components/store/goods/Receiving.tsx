import {
  ProForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDigit,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';

import { Button, Form, Modal, Upload, message, notification } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

import UploadLink, { AcceptedFileTypes } from '@/components/shared/UploadLink';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { IOrder } from '@/models/IOrder';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  postNewReceivingItem,
  postNewStoreItem,
  updateManyMaterialItems,
  createBookingItem,
  uploadFileServer,
  updateOrderByID,
  deleteFile,
} from '@/utils/api/thunks';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
import ContextMenuStoreSearchSelect from '@/components/shared/form/ContextMenuStoreSearchSelect';
import ContextMenuLocationSearchSelect from '@/components/shared/form/ContextMenuLocationSearchSelect';
import { useUpdateOrderItemMutation } from '@/features/orderItemsAdministration/orderItemApi';
import { IOrderItem } from '@/models/IRequirement';
import { useUpdateOrderMutation } from '@/features/orderNewAdministration/ordersNewApi';
import { handleFileSelect } from '@/services/utilites';
import { useGetLocationsQuery } from '@/features/storeAdministration/LocationApi';
import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
import { Split } from '@geoffcox/react-splitter';
// import ReportPrintLabel from '@/components/shared/ReportPrintLabel';
// import ReportGenerator from '@/components/shared/GeneratedLabel';
// import ReportPrintQR from '@/components/shared/ReportPrintQR';
type ReceivingType = {
  currentPart?: any;
  currenOrder?: IOrder | null;
  currentReceiving: any | null;
  onCurrentPart?: (data: any) => void;
  onUpdateOrder: (data: any) => void;
  onReceivingPart?: (data: any) => void;
};
const Receiving: FC<ReceivingType> = ({
  currentPart,
  currenOrder,
  currentReceiving,
  onUpdateOrder,
  onReceivingPart,
}) => {
  const [isPrintQRChecked, setIsPrintQRChecked] = useState(false); // Состояние для галки "Печать QR"
  const [printData, setPrintData] = useState(null); // Данные для печати
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [selectedSinglePNID, setSecectedSinglePNID] = useState<string | null>(
    null
  );
  const [labelsOpenPrint, setOpenLabelsPrint] = useState<any>();

  const [addedMaterialItem, setAddedMaterialItem] = useState<any>(null);

  const [isUpload, setisUpload] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [isChangeLocationChecked, setIsChangeLocationChecked] = useState(true);
  const [isChangeQRPrintChecked, setIsChangeQRPrintChecked] = useState(true);

  const dispatch = useAppDispatch();
  const [isCustomerGoods, setIsCustomerGoods] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState<any>(null);

  useState<any>(null);
  const [selectedOwnerID, setSelectedOwnerID] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (isUpload) {
      setisUpload(isUpload);
    }
  }, [isUpload]);

  const { data: stores } = useGetStoresQuery({});
  const [selectedStoreID, setSelectedStoreID] = useState<string | undefined>(
    undefined
  );
  const [selectedLocationID, setSelectedLocationID] = useState<
    string | undefined
  >(undefined);
  const [selectedStoreName, setSelectedStoreName] = useState<
    string | undefined
  >(undefined);
  const {
    data: locations,
    isLoading,
    refetch: refetchLocations,
  } = useGetLocationsQuery({
    storeID: selectedStoreID,
  });
  const locationsCodesValueEnum: Record<string, string> =
    locations?.reduce((acc, mpdCode) => {
      if (mpdCode.id && mpdCode.locationName) {
        acc[mpdCode.id] = `${String(mpdCode.locationName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};

  useEffect(() => {
    if (currentPart) {
      setSecectedSinglePN(currentPart?.partID);
      // setSecectedSinglePN(currentPart);
      setinitialForm(currentPart?.partID?.PART_NUMBER);
      form.setFields([
        {
          name: 'partNumber',
          value: currentPart?.partID?.PART_NUMBER,
        },
        {
          name: 'description',
          value: currentPart?.partID?.DESCRIPTION,
        },
        { name: 'serialNumber', value: currentPart?.serialNumber },
        // { name: 'qty', value: currentPart.amout },
        { name: 'partGroup', value: currentPart?.partID?.GROUP },
        {
          name: 'partType',
          value: currentPart?.partID?.TYPE,
        },
        {
          name: 'backorder',
          value: currentPart?.backorderQty,
        },

        {
          name: 'unit',
          value: currentPart?.unit || currentPart?.partID?.UNIT_OF_MEASURE,
        },
        {
          name: 'addPartNumber',
          value: currentPart?.partID?.PART_NUMBER,
        },
        {
          name: 'addDescription',
          value: currentPart?.partID?.ADD_DESCRIPTION,
        },
        {
          name: 'addUnit',
          value: currentPart?.partID?.ADD_UNIT_OF_MEASURE,
        },
      ]);
    }
  }, [currentPart]);

  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const [initialForm, setinitialForm] = useState<any>('');
  const [updateOrderItem] = useUpdateOrderItemMutation();
  const [updateOrder] = useUpdateOrderMutation();

  const storeCodesValueEnum: Record<string, string> =
    stores?.reduce((acc, mpdCode) => {
      if (mpdCode?.id && mpdCode.storeShortName) {
        acc[mpdCode.id] = `${String(mpdCode.storeShortName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};

  const handleStoreChange = (value: string) => {
    setSelectedStoreID(value);
    const selectedStore = stores?.find((store) => store.id === value);
    setSelectedStoreName(selectedStore?.storeShortName);
  };
  const handleLocationChange = (value: string) => {
    setSelectedLocationID(value);
    const selectedLocation = locations?.find((store) => store.id === value);
    setSelectedLocationName(selectedLocation?.locationName);

    form.setFields([
      {
        name: 'ownerDiscription',
        value: selectedLocation?.ownerID?.companyName,
      },
      {
        name: 'ownerShotName',
        value: selectedLocation?.ownerID?.title,
      },
    ]);
  };
  return (
    <ProForm
      onReset={() => {
        setIsResetForm(true);
        setSelectedStoreID(undefined);
        setSelectedLocationID(undefined);
        setSecectedSinglePNID(null);
        setSelectedOwnerID(undefined);
        setSelectedStoreName(undefined);
        setSelectedLocationName(null);
        form.resetFields();
      }}
      submitter={{
        submitButtonProps: {
          disabled: !!(
            !currentReceiving ||
            (currentReceiving && Object.keys(currentReceiving).length === 0)
          ),
        },
      }}
      onFinish={async (values) => {
        if (
          !currentReceiving ||
          (currentReceiving && Object.keys(currentReceiving)?.length === 0)
        ) {
          message.error('Some fields are empty');
        } else {
          const currentCompanyID = localStorage.getItem('companyID') || '';

          const result = dispatch(
            postNewStoreItem({
              PART_NUMBER:
                selectedSinglePN?.PART_NUMBER || selectedSinglePN?.PN,
              NAME_OF_MATERIAL: values.description,
              QUANTITY: values.qty,
              GROUP: values.partGroup,
              TYPE: values.partType,
              CONDITION: values.condition,
              SHELF_NUMBER: selectedLocationName,
              STOCK: selectedStoreName,
              OWNER: values?.owner,
              PRICE: currentPart?.price,
              RECEIVED_DATE: currentReceiving?.receivingDate,
              ORDER_NUMBER: currenOrder?.orderNumberNew,
              UNIT_OF_MEASURE: values?.unit,
              CURRENCY: currentPart?.currency,
              COMPANY_ID: currentCompanyID,
              SUPPLIER_BATCH_NUMBER: values.batch,
              SUPPLIES_CODE: currentReceiving?.SUPPLIES_CODE || '',
              SUPPLIES_LOCATION: currentReceiving?.SUPPLIES_LOCATION || '',
              SUPPLIER_NAME: currentReceiving?.SUPPLIER_NAME,
              SUPPLIER_SHORT_NAME: currentReceiving?.SUPPLIER_SHORT_NAME,
              SUPPLIER_UNP: currentReceiving?.SUPPLIER_UNP,
              SUPPLIES_ID: currentReceiving?.SUPPLIES_ID,
              IS_RESIDENT: currentReceiving?.IS_RESIDENT,
              ADD_UNIT_OF_MEASURE: values?.addUnit,
              ADD_NAME_OF_MATERIAL: values?.addDescription,
              ADD_PART_NUMBER: selectedSinglePN?.addPartNumber,
              ADD_QUANTITY: values.addQty,
              OWNER_SHORT_NAME: values.ownerShotName,
              OWNER_LONG_NAME: values.ownerDiscription,
              PRODUCT_EXPIRATION_DATE: values.expiryDate,
              WAREHOUSE_RECEIVED_AT:
                currentReceiving?.WAREHOUSE_RECEIVED_AT || '',
              SERIAL_NUMBER: values.serialNumber,
              APPROVED_CERT: values.certificateNumber,
              AWB_REFERENCE: currentReceiving?.awbReference || '',
              AWB_TYPE: currentReceiving?.awbType || '',
              AWB_NUMBER: currentReceiving?.awbNumber || '',
              AWB_DATE: currentReceiving?.receivingDate || '',
              RECEIVING_NUMBER: currentReceiving?.receivingNumber,
              CERTIFICATE_NUMBER: values?.certificateNumber,
              CERTIFICATE_TYPE: values?.certificateType,
              REVISION: 'C',
              IS_CUSTOMER_GOODS: isCustomerGoods,
              partID: selectedSinglePNID || currentPart?.partID?._id,
              locationID: selectedLocationID,
              ownerID: selectedOwnerID,
              storeID: selectedStoreID,
              RECEIVING_ID: currentReceiving._id,
              ORDER_ITEM_ID:
                (currentPart && currentPart?.id) || currentPart?._id,
            })
          );
          if ((await result).meta.requestStatus === 'fulfilled') {
            setAddedMaterialItem((await result).payload);
            onReceivingPart && onReceivingPart([(await result).payload]);

            notification.success({
              message: t('МАТЕРИАЛЫ ПРИНЯТЫ УСПЕШНО'),
              description: t('МАТЕРИАЛЫ ПРИНЯТЫ'),
            });
            setPrintData((await result).payload.id);

            // Устанавливаем галку "Печать QR" в true

            const resultUp = await dispatch(
              postNewReceivingItem({
                ...(await result).payload,
                companyID: currentCompanyID || '',
                createDate: new Date(),
                createUserID: USER_ID,
                state: 'RECEIVED',
                voucherModel: 'RECEIVING_GOODS',
                ORDER_TYPE: currenOrder && currenOrder?.orderType,
                ORDER_ID: (currenOrder && currenOrder?.id) || currenOrder?._id,
                ORDER_ITEM_ID:
                  (currentPart && currentPart?.id) || currentPart?._id,
                MATERIAL_STORE_ID:
                  (await result).payload?._id || (await result).payload?.id,
              })
            );
            if (resultUp.meta.requestStatus === 'fulfilled') {
              setisUpload(true);
              // setIsPrintQRChecked(true);

              // Устанавливаем данные для
              dispatch(
                createBookingItem({
                  companyID: currentCompanyID,
                  data: {
                    PART_NUMBER:
                      selectedSinglePN?.PART_NUMBER || selectedSinglePN?.PN,
                    WAREHOUSE_RECEIVED_AT:
                      currentReceiving?.WAREHOUSE_RECEIVED_AT || '',
                    SUPPLIES_CODE: currentReceiving?.SUPPLIES_CODE || '',
                    SUPPLIES_ID: currentReceiving?.SUPPLIES_ID || '',
                    STOCK: selectedStoreName,
                    SHELF_NUMBER: selectedLocationName,
                    ORDER_NUMBER: currenOrder?.orderNumberNew,
                    PRICE: currentPart?.price,
                    CURRENCY: currentPart?.currency,
                    QUANTITY: values.qty,
                    OWNER: values.ownerShotName,
                    SUPPLIER_BATCH_NUMBER: values.batch,
                    SERIAL_NUMBER: values.serialNumber,
                    GROUP: values.partGroup,
                    TYPE: values.partType,
                    CONDITION: values.condition,
                    NAME_OF_MATERIAL: values.description,
                    RECEIVING_NUMBER: resultUp.payload.RECEIVING_NUMBER,
                    RECEIVING_ITEM_NUMBER:
                      resultUp.payload.RECEIVING_ITEM_NUMBER,
                    LOCAL_ID: resultUp.payload.LOCAL_ID,
                    IS_CUSTOMER_GOODS: isCustomerGoods,
                    SUPPLIES_LOCATION:
                      currentReceiving?.SUPPLIES_LOCATION || '',
                    SUPPLIER_NAME: currentReceiving?.SUPPLIER_NAME,
                    SUPPLIER_SHORT_NAME: currentReceiving?.SUPPLIER_SHORT_NAME,
                    SUPPLIER_UNP: currentReceiving?.SUPPLIER_UNP,
                    IS_RESIDENT: currentReceiving?.IS_RESIDENT,
                    UNIT_OF_MEASURE: values.unit,
                    ADD_UNIT_OF_MEASURE: values?.addUnit,
                    ADD_NAME_OF_MATERIAL: values?.addDescription,
                    ADD_PART_NUMBER: selectedSinglePN?.addPartNumber,
                    ADD_QUANTITY: values.addQty,
                    OWNER_SHORT_NAME: values.ownerShotName,
                    OWNER_LONG_NAME: values.ownerDiscription,
                    PRODUCT_EXPIRATION_DATE: values.expiryDate,
                    APPROVED_CERT: values.certificateNumber,
                    AWB_REFERENCE: currentReceiving?.awbReference || '',
                    AWB_TYPE: currentReceiving?.awbType || '',
                    AWB_NUMBER: currentReceiving?.awbNumber || '',
                    AWB_DATE: currentReceiving?.receivingDate || '',
                    CERTIFICATE_NUMBER: values?.certificateNumber,
                    CERTIFICATE_TYPE: values?.certificateType,
                    REVISION: 'C',
                    ORDER_ITEM_ID:
                      (currentPart && currentPart?.id) || currentPart?._id,
                    companyID: currentCompanyID || '',
                    createDate: new Date(),
                    userID: USER_ID || '',
                    userSing: localStorage.getItem('singNumber') || '',
                    voucherModel: 'RECEIVING_GOODS',
                    station: currentReceiving?.WAREHOUSE_RECEIVED_AT || '',
                    projectID: currenOrder?.projectID,
                    projectWO: currenOrder?.projectWO,
                    planeType: currenOrder?.planeType,
                    registrationNumber: currenOrder?.registrationNumber,
                    orderId: currenOrder?.id,
                    orderType: currenOrder?.orderType,
                    RECEIVING_ITEMS_ID:
                      resultUp.payload?._id || resultUp.payload?.id,
                    partID: selectedSinglePNID || currentPart?.partID?._id,
                    locationID: selectedLocationID,
                    ownerID: selectedOwnerID,
                    storeID: selectedStoreID,
                    RECEIVING_ID: resultUp?.payload?.RECEIVING_ID,
                  },
                })
              );

              if (currentPart && currenOrder?.orderItemsID) {
                // Обновляем части заказа
                const updatedParts = await Promise.all(
                  currenOrder.orderItemsID.map(async (part: IOrderItem) => {
                    if (part._id === currentPart._id) {
                      const updatedBarcorder =
                        Number(part.backorderQty) -
                        Number(resultUp.payload.QUANTITY);
                      const updatedState =
                        updatedBarcorder > 0 ? 'PARTLY_RECEIVED' : 'RECEIVED';
                      const updatedReceivings = part.RECEIVINGS
                        ? [
                            ...part.RECEIVINGS,
                            {
                              RECEIVING_NUMBER:
                                resultUp.payload.RECEIVING_NUMBER,
                              RECEIVING_ITEM_NUMBER:
                                resultUp.payload.RECEIVING_ITEM_NUMBER,
                              receivingNumberID: resultUp.payload._id,
                              receivingItemNumberID: resultUp.payload._id,
                            },
                          ]
                        : [
                            {
                              RECEIVING_NUMBER:
                                resultUp.payload.RECEIVING_NUMBER,
                              RECEIVING_ITEM_NUMBER:
                                resultUp.payload.RECEIVING_ITEM_NUMBER,
                              receivingNumberID: resultUp.payload._id,
                              receivingItemNumberID: resultUp.payload._id,
                            },
                          ];
                      return await updateOrderItem({
                        ...part,
                        backorderQty: updatedBarcorder,
                        state: updatedState,
                        RECEIVINGS: updatedReceivings,
                        BATCH: resultUp.payload?.SUPPLIER_BATCH_NUMBER,
                        SERIAL_NUMBER: resultUp?.payload?.SERIAL_NUMBER,
                        PRICE: resultUp.payload.PRICE,
                      }).unwrap();
                    }
                    return part; // Если часть не была обновлена, вернуть ее без изменений
                  })
                );

                // Сохраняем состояния всех заказов в массив
                const orderStates = updatedParts.map((part) =>
                  part ? part.state : null
                );

                // Выводим состояния всех заказов в консоль
                console.log('Состояния всех заказов:', orderStates);

                // Определяем новое состояние заказа на основе состояний всех частей
                let stateNew;
                if (orderStates.some((state) => state === 'PARTLY_RECEIVED')) {
                  stateNew = 'PARTLY_RECEIVED';
                } else if (
                  orderStates.every((state) => state === 'CANCELLED')
                ) {
                  stateNew = 'CANCELLED';
                } else if (orderStates.every((state) => state === 'RECEIVED')) {
                  stateNew = 'RECEIVED';
                } else if (
                  orderStates.every((state) => state === 'PARTLY_CANCELLED')
                ) {
                  stateNew = 'PARTLY_CANCELLED';
                } else if (
                  orderStates.some((state) => state === 'PARTLY_CANCELLED')
                ) {
                  stateNew = 'PARTLY_CANCELLED';
                }

                // Проверяем, что stateNew определен и не равен null или undefined
                if (stateNew !== null && stateNew !== undefined) {
                  try {
                    const updateResult = await updateOrder({
                      id: currenOrder._id || currenOrder.id || '',
                      state: stateNew,
                      _id: currenOrder._id || currenOrder.id || '',
                    });
                    onUpdateOrder(updateResult);

                    // Вызываем функцию onUpdateOrder с результатом обновления заказа
                    // updateResult && onUpdateOrder(updateResult);
                  } catch (error) {
                    console.error('Ошибка при обновлении заказа:', error);
                    // Здесь можно добавить обработку ошибок, если это необходимо
                  }
                } else {
                  console.log(
                    'Не удалось определить новое состояние для заказа.'
                  );
                }
              }
            }
          } else {
            message.error('Error');
          }
        }
      }}
      size="small"
      form={form}
      layout="horizontal"
    >
      <Modal
        title={t('PRINT LABEL')}
        open={labelsOpenPrint}
        width={'30%'}
        onCancel={() => setOpenLabelsPrint(false)}
        footer={null}
      ></Modal>
      <div className="flex flex-col">
        <Split initialPrimarySize="65%" splitterSize="20px">
          <div className="h-[49vh] overflow-y-auto">
            <ProFormGroup direction="vertical">
              <ProFormGroup>
                <ProFormDigit
                  name="qty"
                  rules={[{ required: true, message: 'Required' }]}
                  label={t('QTY/BACKORDER')}
                  width="xs"
                  tooltip={t('QTY')}
                ></ProFormDigit>
                /
                <ProFormDigit
                  disabled
                  name="backorder"
                  width="xs"
                ></ProFormDigit>
                <ProFormSelect
                  rules={[{ required: true, message: 'Required' }]}
                  label={t('UNIT')}
                  name="unit"
                  width="sm"
                  valueEnum={{
                    EA: `EA/${t('EACH').toUpperCase()}`,
                    M: `M/${t('Meters').toUpperCase()}`,
                    ML: `ML/${t('Milliliters').toUpperCase()}`,
                    SI: `SI/${t('Sq Inch').toUpperCase()}`,
                    CM: `CM/${t('Centimeters').toUpperCase()}`,
                    GM: `GM/${t('Grams').toUpperCase()}`,
                    YD: `YD/${t('Yards').toUpperCase()}`,
                    FT: `FT/${t('Feet').toUpperCase()}`,
                    SC: `SC/${t('Sq Centimeters').toUpperCase()}`,
                    IN: `IN/${t('Inch').toUpperCase()}`,
                    SH: `SH/${t('Sheet').toUpperCase()}`,
                    SM: `SM/${t('Sq Meters').toUpperCase()}`,
                    RL: `RL/${t('Roll').toUpperCase()}`,
                    KT: `KT/${t('Kit').toUpperCase()}`,
                    LI: `LI/${t('Liters').toUpperCase()}`,
                    KG: `KG/${t('Kilograms').toUpperCase()}`,
                    JR: `JR/${t('Jar/Bottle').toUpperCase()}`,
                  }}
                ></ProFormSelect>
              </ProFormGroup>
              <ProFormGroup>
                <ProFormSelect
                  rules={[{ required: true }]}
                  name="partGroup"
                  label={`${t('PART GROUP')}`}
                  width="sm"
                  tooltip={`${t('SELECT SPECIAL GROUP')}`}
                  options={[
                    { value: 'CONS', label: t('CONS') },
                    { value: 'TOOL', label: t('TOOL') },
                    { value: 'CHEM', label: t('CHEM') },
                    { value: 'ROT', label: t('ROT') },
                    { value: 'GSE', label: t('GSE') },
                  ]}
                />
                <ProFormSelect
                  rules={[{ required: true }]}
                  name="partType"
                  label={`${t('PART TYPE')}`}
                  width="sm"
                  tooltip={`${t('SELECT PART TYPE')}`}
                  options={[
                    { value: 'ROTABLE', label: t('ROTABLE') },
                    { value: 'CONSUMABLE', label: t('CONSUMABLE') },
                  ]}
                />
              </ProFormGroup>
              <ProFormGroup direction="horizontal">
                <ProFormGroup>
                  <ContextMenuPNSearchSelect
                    label={t('PART No')}
                    isResetForm={isResetForm}
                    rules={[{ required: true }]}
                    onSelectedPN={function (PN: any): void {
                      console.log(PN);
                      setSecectedSinglePN(PN);
                      setSecectedSinglePNID(PN?._id || PN?.id);
                      form.setFields([
                        {
                          name: 'description',
                          value: PN?.DESCRIPTION || PN?.NAME_OF_MATERIAL,
                        },
                      ]);
                      form.setFields([
                        { name: 'unit', value: PN?.UNIT_OF_MEASURE },
                      ]);
                      form.setFields([
                        { name: 'addPartNumber', value: PN?.PART_NUMBER },
                      ]);
                      form.setFields([
                        {
                          name: 'addDescription',
                          value: PN?.ADD_DESCRIPTION || PN?.DESCRIPTION,
                        },
                      ]);
                      form.setFields([
                        {
                          name: 'addUnit',
                          value: PN?.ADD_UNIT_OF_MEASURE || PN?.UNIT_OF_MEASURE,
                        },
                      ]);
                      form.setFields([{ name: 'partGroup', value: PN?.GROUP }]);
                      form.setFields([{ name: 'partType', value: PN?.TYPE }]);
                    }}
                    name={'partNumber'}
                    initialFormPN={initialForm}
                    width={'sm'}
                  ></ContextMenuPNSearchSelect>

                  <ProFormText
                    rules={[{ required: true }]}
                    name="description"
                    label={t('DESCRIPTION')}
                    width="lg"
                    tooltip={t('DESCRIPTION')}
                  ></ProFormText>
                </ProFormGroup>
              </ProFormGroup>

              <ProFormGroup>
                <ProFormText
                  name="batch"
                  label={t('BATCH NUMBER')}
                  width="sm"
                  tooltip={t('BATCH NUMBER')}
                ></ProFormText>
                <ProFormText
                  name="serialNumber"
                  label={t('SERIAL NUMBER')}
                  width="sm"
                  tooltip={t('SERIAL NUMBER')}
                ></ProFormText>
              </ProFormGroup>
              <ProFormGroup>
                <ProFormSelect
                  // rules={[{ required: true }]}
                  name="certificateType"
                  label={`${t('CERTIFICATE TYPE')}`}
                  width="lg"
                  options={[
                    { value: 'B1', label: t('BCAA SRC FORM 2.2.2 V2') },
                    { value: 'B2', label: t('BCAA FORM (CONTRACTED AMO)') },
                    { value: 'C1', label: t('CERTIFICATE OF CONFORMANCE') },
                    {
                      value: 'CAAC',
                      label: t('CHINA AUTHORIZED RELEASE CERTIFICATE'),
                    },
                    { value: 'E1', label: t('EASA-145 APPROVAL') },
                    { value: 'F100', label: t('ANAC BRAZIL FORM F-100-01') },
                    { value: 'JAA', label: t(' JAA FORM ONE') },
                    { value: 'T1', label: t('TCCA FORM ONE CANADA') },
                    { value: 'UK1', label: t('CAA UK FORM 1') },
                    {
                      value: 'Ф-1',
                      label: t('ТАЛОН ГОДНОСТИ КОМПОНЕНТА ФАВТ'),
                    },
                    { value: 'Ф-2', label: t('СЕРТИФИКАТ') },
                  ]}
                />
                <ProFormText
                  // rules={[{ required: true }]}
                  name="certificateNumber"
                  label={t('CERTIFICATE NUMBER')}
                  width="sm"
                  tooltip={t('CERTIFICATE NUMBER')}
                ></ProFormText>
              </ProFormGroup>

              <ProFormGroup>
                <ProFormSelect
                  showSearch
                  rules={[{ required: true }]}
                  name="condition"
                  label={t('CONDITION')}
                  width="sm"
                  tooltip={t('CONDITION')}
                  valueEnum={{
                    '/NEW': t('NEW'),
                    '/INSPECTED': t('INSPECTED'),
                    '/REPAIRED': t('REPAIRED'),
                    '/SERVICABLE': t('SERVICABLE'),
                    '/UNSERVICABLE': t('UNSERVICABLE'),
                  }}
                />
                <ProFormDatePicker
                  name="expiryDate"
                  label={t('EXPIRY DATE')}
                  width="sm"
                ></ProFormDatePicker>
                <ProFormGroup></ProFormGroup>
              </ProFormGroup>

              <ProFormGroup>
                <ProFormSelect
                  showSearch
                  name="storeID"
                  rules={[{ required: true }]}
                  label={t('STORE')}
                  width="sm"
                  valueEnum={storeCodesValueEnum || []}
                  onChange={handleStoreChange}
                />

                <ProFormSelect
                  showSearch
                  name="locationID"
                  rules={[{ required: true }]}
                  label={t('LOCATION')}
                  width="sm"
                  valueEnum={locationsCodesValueEnum || []}
                  disabled={!selectedStoreID}
                  onChange={handleLocationChange}
                />
              </ProFormGroup>
              <ProFormGroup>
                <ProFormText
                  disabled
                  name="ownerShotName"
                  rules={[{ required: true }]}
                  label={t('OWNER')}
                  width="sm"
                  tooltip={t('OWNER')}
                ></ProFormText>
                <ProFormText
                  disabled
                  label={t('OWNER DESCRIPTION')}
                  name="ownerDiscription"
                  width="sm"
                ></ProFormText>

                <ProFormText
                  name="notes"
                  label={t('REMARKS')}
                  width="lg"
                  tooltip={t('REMARKS')}
                ></ProFormText>
              </ProFormGroup>
            </ProFormGroup>
          </div>

          <ProFormGroup
            style={{
              background: '#F0F0F0',
              padding: 10,
              borderRadius: 5,
            }}
            size={'small'}
            direction="vertical"
          >
            <ProFormText
              rules={[{ required: true }]}
              name="addPartNumber"
              label={t('1C/PART No')}
              width="lg"
              tooltip={t('PART No')}
            ></ProFormText>
            <ProFormText
              rules={[{ required: true, message: 'Required' }]}
              name="addDescription"
              label={t('1C/DESCRIPTION')}
              width="lg"
              tooltip={t('DESCRIPTION')}
            ></ProFormText>
            <ProFormDigit
              name="addQty"
              rules={[{ required: true }]}
              label={t('1C/QUANTITY')}
              width="sm"
              tooltip={t('QTY')}
            ></ProFormDigit>
            <ProFormSelect
              showSearch
              rules={[{ required: true, message: 'Required' }]}
              label={t('ADD UNIT')}
              name="addUnit"
              width="lg"
              valueEnum={{
                шт: `${t('шт').toUpperCase()}`,
                м: `${t('м').toUpperCase()}`,
                мл: `${t('мл').toUpperCase()}`,
                дюйм2: `${t('дюйм2').toUpperCase()}`,
                см: `${t('см').toUpperCase()}`,
                г: `${t('г').toUpperCase()}`,
                ярд: `${t('ярд').toUpperCase()}`,
                фут: `${t('фут').toUpperCase()}`,
                см2: `${t('см2').toUpperCase()}`,
                дюйм: `${t('дюйм').toUpperCase()}`,
                м2: `${t('м2').toUpperCase()}`,
                рул: `${t('рул').toUpperCase()}`,
                л: `${t('л').toUpperCase()}`,
                кг: `${t('кг').toUpperCase()}`,
              }}
            ></ProFormSelect>
            <ProFormCheckbox
              fieldProps={{
                checked: isCustomerGoods,
                onChange: (e: CheckboxChangeEvent) => {
                  setIsCustomerGoods(e.target.checked);
                },
              }}
            >
              {t('CUSTOMER GOODS')}
            </ProFormCheckbox>

            <ProFormGroup>
              <ProForm.Item label={t('UPLOAD')}>
                <div className="overflow-y-auto max-h-64">
                  <div className="mb-5">
                    <UploadLink
                      isUploadTrue={isUpload}
                      onUpload={uploadFileServer}
                      onSuccess={async function (response: any): Promise<void> {
                        if (response) {
                          setisUpload(false);
                          const updatedFiles = addedMaterialItem.FILES
                            ? [...addedMaterialItem.FILES, response]
                            : [response];

                          const currentCompanyID =
                            localStorage.getItem('companyID') || '';
                          const result = await dispatch(
                            updateManyMaterialItems({
                              companyID: currentCompanyID || '',
                              ids: [addedMaterialItem.id],
                              FILES: updatedFiles,
                            })
                          );
                        }
                      }}
                      acceptedFileTypes={[
                        AcceptedFileTypes.JPG,
                        AcceptedFileTypes.PDF,
                      ]}
                    ></UploadLink>
                  </div>
                </div>
              </ProForm.Item>
              <ProFormGroup>
                {/* <ReportPrintLabel
                  xmlTemplate={''}
                  data={[]}
                  ids={[printData]}
                  isDisabled={!printData}
                ></ReportPrintLabel> */}
                {/* <ReportPrintQR
                  openSettingsModal
                  pageBreakAfter={false}
                  // qrCodeSize={32}
                  // fontSize={5}
                  isDisabled={!printData}
                  data={[printData]}
                  ids={[printData]}
                ></ReportPrintQR> */}
              </ProFormGroup>
            </ProFormGroup>
          </ProFormGroup>
        </Split>
      </div>
    </ProForm>
  );
};

export default Receiving;
