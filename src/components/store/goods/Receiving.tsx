import {
  ModalForm,
  ProCard,
  ProForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDigit,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, FormInstance, Modal, Upload, message } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import SearchTable from '@/components/layout/SearchElemTable';

import UploadLink, { AcceptedFileTypes } from '@/components/shared/UploadLink';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { IOrder } from '@/models/IOrder';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getFilteredShops,
  postNewReceivingItem,
  postNewStoreItem,
  updateManyMaterialItems,
  createBookingItem,
  uploadFileServer,
  updateOrderByID,
} from '@/utils/api/thunks';

import { USER_ID } from '@/utils/api/http';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
import ContextMenuStoreSearchSelect from '@/components/shared/form/ContextMenuStoreSearchSelect';
import ContextMenuLocationSearchSelect from '@/components/shared/form/ContextMenuLocationSearchSelect';
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
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [labelsOpenPrint, setOpenLabelsPrint] = useState<any>();
  const formRef = useRef<FormInstance>(null);
  const [selectedStore, setSecectedStore] = useState<any>(null);
  const [selectedSingleStore, setSecectedSingleStore] = useState<any>(null);
  const [addedMaterialItem, setAddedMaterialItem] = useState<any>(null);
  const [openLocationViewer, setOpenLocationViewer] = useState<boolean>(false);
  const [isUpload, setisUpload] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [isChangeLocationChecked, setIsChangeLocationChecked] = useState(true);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };

  const dispatch = useAppDispatch();
  const [isCustomerGoods, setIsCustomerGoods] = useState(false);
  const [LOCATION, setLOCATION] = useState([]); //
  const [selectedLocation, setSecectedLocation] = useState<any>(null);
  const [selectedSingleLocation, setSecectedSingleLocation] =
    useState<any>(null);

  useEffect(() => {
    if (isUpload) {
      setisUpload(isUpload);
    }
  }, [isUpload]);
  useEffect(() => {
    if (selectedStore) {
      form.setFields([{ name: 'store', value: selectedStore.APNNBR }]);
      const transformedData = selectedStore?.locations.map((item: any) => ({
        ...item,
        APNNBR: item.locationName, // Преобразуем shopShortName в APNNBR
      }));

      setLOCATION(transformedData);
    }
  }, [selectedStore]);
  useEffect(() => {
    if (selectedLocation) {
      form.setFields([
        { name: 'location', value: selectedLocation.APNNBR },
        {
          name: 'ownerShotName',
          value: selectedLocation?.ownerShotName,
        },
        {
          name: 'ownerDiscription',
          value: selectedLocation?.ownerLongName,
        },
        { name: 'store', value: selectedStore.shopShortName },
      ]);
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (currentPart) {
      form.setFields([
        {
          name: 'partNumber',
          value: currentPart?.PART_NUMBER || currentPart?.PN,
        },
        {
          name: 'description',
          value: currentPart?.DESCRIPTION || currentPart?.nameOfMaterial,
        },
        { name: 'serialNumber', value: currentPart?.serialNumber },
        { name: 'qty', value: currentPart.requestQuantity },
        { name: 'partGroup', value: currentPart?.GROUP || currentPart?.group },
        { name: 'partType', value: currentPart?.TYPE || currentPart?.type },
        {
          name: 'backorder',
          value: currentPart?.backorder || currentPart?.quantity,
        },

        {
          name: 'unit',
          value: currentPart?.UNIT_OF_MEASURE || currentPart?.unit,
        },
        {
          name: 'addPartNumber',
          value: currentPart?.PART_NUMBER || currentPart?.PN,
        },
        {
          name: 'addDescription',
          value:
            currentPart?.ADD_DESCRIPTION ||
            currentPart?.DESCRIPTION ||
            currentPart?.nameOfMaterial,
        },
        {
          name: 'addUnit',
          value:
            currentPart.ADD_UNIT_OF_MEASURE ||
            currentPart?.UNIT_OF_MEASURE ||
            currentPart?.unit,
        },
      ]);
    }
  }, [currentPart]);

  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const [initialForm, setinitialForm] = useState<any>('');
  return (
    <ProForm
      onReset={() => {
        setIsResetForm(true);
        setinitialForm('');
        setSecectedSinglePN(null);
        setSecectedSingleStore({ shopShortName: '' });
        setSecectedSingleLocation({ locationName: '' });
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
              PART_NUMBER: selectedSinglePN?.PART_NUMBER,
              NAME_OF_MATERIAL: values.description,
              QUANTITY: values.qty,
              GROUP: values.partGroup,
              TYPE: values.partType,
              CONDITION: values.condition,
              SHELF_NUMBER: selectedLocation.locationName,
              STOCK: selectedSingleStore?.shopShortName,
              OWNER: values?.owner,
              PRICE: 1000,
              RECEIVED_DATE: currentReceiving?.receivingDate,
              ORDER_NUMBER: currenOrder?.orderNumber,
              UNIT_OF_MEASURE: values.unit,
              CURRENCY: 'USD',
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
            })
          );
          if ((await result).meta.requestStatus === 'fulfilled') {
            setAddedMaterialItem((await result).payload);
            onReceivingPart && onReceivingPart([(await result).payload]);
            message.success('SUCCESS');

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
                MATERIAL_STORE_ID:
                  (await result).payload?._id || (await result).payload?.id,
              })
            );
            if (resultUp.meta.requestStatus === 'fulfilled') {
              setisUpload(true);
              dispatch(
                createBookingItem({
                  companyID: currentCompanyID,
                  data: {
                    userSing: localStorage.getItem('singNumber') || '',
                    partNumber: values.partNumber,
                    station: currentReceiving?.WAREHOUSE_RECEIVED_AT || '',
                    suppliesCode: currentReceiving?.SUPPLIES_CODE || '',
                    suppliesId: currentReceiving?.SUPPLIES_ID || '',
                    voucherModel: 'RECEIVING_GOODS',
                    location: values.location,
                    orderNumber: currenOrder?.orderNumber,
                    price: currentPart?.price,
                    currency: currentPart?.currency,
                    quantity: values.qty,
                    owner: values.ownerShotName,
                    batchNumber: values.batch,
                    serialNumber: values.serialNumber,
                    partGroup: values.partGroup,
                    partType: values.partType,
                    condition: values.condition,
                    description: values.description,
                    receivingNumber: resultUp.payload.RECEIVING_NUMBER,
                    receivingItemNumber: resultUp.payload.RECEIVING_ITEM_NUMBER,
                    label: resultUp.payload.LOCAL_ID,
                    companyID: currentCompanyID || '',
                    createDate: new Date(),
                    userID: USER_ID || '',
                    IS_CUSTOMER_GOODS: isCustomerGoods,
                  },
                })
              );

              if (currentPart && currenOrder?.parts) {
                const updatedParts = currenOrder?.parts.map((part) => {
                  if (part.id === currentPart.id) {
                    const updatedBarcorder =
                      Number(part.backorder) -
                      Number(resultUp.payload.QUANTITY);
                    const updatedState =
                      updatedBarcorder > 0 ? 'PARTLY_RECEIVED' : 'RECEIVED';
                    const updatedReceivings = part.RECEIVINGS
                      ? [
                          ...part.RECEIVINGS,
                          {
                            RECEIVING_NUMBER: resultUp.payload.RECEIVING_NUMBER,
                            RECEIVING_ITEM_NUMBER:
                              resultUp.payload.RECEIVING_ITEM_NUMBER,
                          },
                        ]
                      : [
                          {
                            RECEIVING_NUMBER: resultUp.payload.RECEIVING_NUMBER,
                            RECEIVING_ITEM_NUMBER:
                              resultUp.payload.RECEIVING_ITEM_NUMBER,
                          },
                        ];
                    return {
                      ...part,
                      backorder: updatedBarcorder,
                      state: updatedState,
                      RECEIVINGS: updatedReceivings,
                      BATCH: resultUp.payload.SUPPLIER_BATCH_NUMBER,
                      SERIAL_NUMBER: resultUp.payload.SERIAL_NUMBER,
                      PRICE: resultUp.payload.PRICE,
                    };
                  }
                  return part;
                });
                let stateNew;
                if (
                  updatedParts.some((part) => part.state === 'PARTLY_RECEIVED')
                ) {
                  stateNew = 'PARTLY_RECEIVED';
                } else if (
                  updatedParts.every((part) => part.state === 'CANCELLED')
                ) {
                  stateNew = 'CANCELLED';
                } else if (
                  updatedParts.every((part) => part.state === 'RECEIVED')
                ) {
                  stateNew = 'RECEIVED';
                } else if (
                  updatedParts.every(
                    (part) => part.state === 'PARTLY_CANCELLED'
                  )
                ) {
                  stateNew = 'PARTLY_CANCELLED';
                } else if (
                  updatedParts.some((part) => part.state === 'PARTLY_CANCELLED')
                ) {
                  stateNew = 'PARTLY_CANCELLED';
                }
                const result = await dispatch(
                  updateOrderByID({
                    id: currenOrder._id,
                    companyID: currentCompanyID || '',
                    parts: updatedParts,
                    state: stateNew,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  onUpdateOrder(result.payload);
                  // setOpenLabelsPrint(true);
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
      >
        {/* <GeneretedTransferPdf parts={partsToPrint} /> */}
      </Modal>
      {/* <>    {t('RECEIVE')}</> */}
      <ProFormGroup>
        <ProFormGroup direction="vertical">
          <ProFormGroup>
            <ProFormDigit
              name="qty"
              rules={[{ required: true }]}
              label={t('QTY/BACKORDER')}
              width="xs"
              tooltip={t('QTY')}
            ></ProFormDigit>
            /<ProFormDigit disabled name="backorder" width="xs"></ProFormDigit>
            <ProFormSelect
              rules={[{ required: true }]}
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
            <ProFormCheckbox
              fieldProps={{
                checked: isChangeLocationChecked,
                onChange: (e: CheckboxChangeEvent) => {
                  setIsChangeLocationChecked(e.target.checked);
                },
              }}
            >
              {t('PRINT LABELS')}
            </ProFormCheckbox>
          </ProFormGroup>
          <ProFormGroup>
            <ProFormSelect
              rules={[{ required: true }]}
              name="partGroup"
              label={`${t('PART SPESIAL GROUP')}`}
              width="sm"
              tooltip={`${t('SELECT SPESIAL GROUP')}`}
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
                isResetForm={isResetForm}
                rules={[{ required: true }]}
                onSelectedPN={function (PN: any): void {
                  setSecectedSinglePN(PN);
                  form.setFields([
                    { name: 'description', value: PN?.DESCRIPTION },
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
                initialFormPN={
                  selectedSinglePN?.PART_NUMBER ||
                  initialForm ||
                  (currentPart && currentPart?.PART_NUMBER) ||
                  (currentPart && currentPart?.PN)
                }
              ></ContextMenuPNSearchSelect>

              <ProFormText
                rules={[{ required: true }]}
                name="description"
                label={t('DESCRIPTION')}
                width="sm"
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
              rules={[{ required: true }]}
              name="certificateType"
              label={`${t('CERTIFICATE TYPE')}`}
              width="sm"
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
                { value: 'Ф-1', label: t('ТАЛОН ГОДНОСТИ КОМПОНЕНТА ФАВТ') },
              ]}
            />
            <ProFormText
              rules={[{ required: true }]}
              name="certificateNumber"
              label={t('CERTIFICATE NUMBER')}
              width="sm"
              tooltip={t('CERTIFICATE NUMBER')}
            ></ProFormText>
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
              acceptedFileTypes={[AcceptedFileTypes.JPG, AcceptedFileTypes.PDF]}
            ></UploadLink>
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
                '/REPAIRED': t('REPAIRED / ТЕКУЩИЙ РЕМОНТ'),
                '/SERVICABLE': t('SERVICABLE / ИСПРАВНО'),
                '/UNSERVICABLE': t('UNSERVICABLE / НЕИСПРАВНО'),
              }}
            />
            <ProFormDatePicker
              name="expiryDate"
              label={t('EXPIRY DATE')}
              width="xs"
            ></ProFormDatePicker>
          </ProFormGroup>

          <ProFormGroup>
            <ContextMenuStoreSearchSelect
              rules={[{ required: true }]}
              name={'store'}
              onSelectedStore={function (record: any): void {
                setSecectedSingleStore(record);
                setSecectedStore(record);
              }}
              initialFormStore={
                selectedSingleStore?.shopShortName || initialForm
              }
            />

            <ContextMenuLocationSearchSelect
              rules={[{ required: true }]}
              name={'location'}
              onSelectedLocation={function (record: any): void {
                setSecectedLocation(record);
                setSecectedSingleLocation(record);
              }}
              initialFormStore={
                selectedSingleLocation?.locationName || initialForm
              }
              locations={LOCATION}
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
          </ProFormGroup>
        </ProFormGroup>

        <ProFormGroup
          style={{
            background: '#F0F0F0',
            padding: 10,
            borderRadius: 5,
          }}
          size={'large'}
          direction="vertical"
        >
          <ProFormText
            rules={[{ required: true }]}
            name="addPartNumber"
            label={t('1C/PART NUMBER')}
            width="sm"
            tooltip={t('PART NUMBER')}
          ></ProFormText>
          <ProFormText
            rules={[{ required: true }]}
            name="addDescription"
            label={t('1C/DESCRIPTION')}
            width="sm"
            tooltip={t('DESCRIPTION')}
          ></ProFormText>
          <ProFormDigit
            name="addQty"
            rules={[{ required: true }]}
            label={t('1C/QUANTITY')}
            width="xs"
            tooltip={t('QTY')}
          ></ProFormDigit>
          <ProFormSelect
            showSearch
            rules={[{ required: true }]}
            label={t('ADD UNIT')}
            name="addUnit"
            width="sm"
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
        </ProFormGroup>
      </ProFormGroup>

      {/* <ModalForm
        onFinish={async () => {
          setSecectedLocation(selectedSingleLocation);
          setOpenLocationViewer(false);
        }}
        title={`${t('LOCATION SEARCH')}`}
        open={openLocationViewer}
        width={'35vw'}
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
      </ModalForm> */}
    </ProForm>
  );
};

export default Receiving;
