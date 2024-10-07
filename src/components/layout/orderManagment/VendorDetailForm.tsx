import {
  ModalForm,
  ProForm,
  ProFormDigit,
  ProFormGroup,
  ProFormItem,
  ProFormRate,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, FormInstance, Space, message } from 'antd';
import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import { t } from 'i18next';
import { IOrder } from '@/models/IOrder';

import React, { FC, useEffect, useRef, useState } from 'react';
import Alternates from '../partAdministration/tabs/mainView/Alternates';
import AlternativeTable from '../AlternativeTable';
import {
  getFilteredAlternativePN,
  getFilteredRequirements,
  updateOrderByID,
  updatedMaterialItemsById,
  uploadFileServer,
} from '@/utils/api/thunks';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import PartsForecast from '../APN/PartsForecast';
import RequirementItemsQuatation from './RequirementItemsQuatation';
import { v4 as originalUuidv4 } from 'uuid'; // Импортируйте библиотеку uuid
import { FULL_NAME, USER_ID } from '@/utils/api/http';
import FileUploader, { AcceptedFileTypes } from '@/components/shared/Upload';
import FilesSelector from '@/components/shared/FilesSelector';
import { handleFileSelect } from '@/services/utilites';
type AddDetailFormType = {
  currentVendor?: any;
  currentDetail?: any;
  currenOrder?: IOrder | null;
  onUpdateOrder?: (data: any) => void;
  isEditing?: boolean;
  isCreating?: boolean;
  onSearchItems?: (part?: any) => void;
  onEdit: (value?: boolean) => void;
};
const VendorDetailForm: FC<AddDetailFormType> = ({
  isEditing,
  onEdit,
  isCreating,
  onSearchItems,
  currenOrder,
  currentVendor,
  onUpdateOrder,
  currentDetail,
}) => {
  const [form] = Form.useForm();
  const [requariment, setRequariment] = useState<any | null>(null);
  const [openPickViewer, setOpenPickViewer] = useState<boolean>(false);
  const [isLocalCreating, setIsLocalCreating] = useState<any>(isCreating);
  const [isLocalEditing, setIsLocalEditing] = useState<any>(isEditing);
  const [alternates, setAlternates] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [quantitySum, setQuantitySum] = useState<any>(null);
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();
  const [editedPart, setEditedPart] = useState<any>();
  const [editedVendor, setEditedVendor] = useState<any>();

  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const formRef = useRef<FormInstance>(null);
  const dispatch = useAppDispatch();
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const uuidv4: () => string = originalUuidv4;
  const companyID = localStorage.getItem('companyID') || '';
  useEffect(() => {
    if (requariment) {
      form.setFields([
        { name: 'requariment', value: requariment.partRequestNumber },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [requariment]);
  useEffect(() => {
    if (selectedSinglePN) {
      const fetchData = async () => {
        const storedKeys = localStorage.getItem('selectedKeys');
        const result = await dispatch(
          getFilteredAlternativePN({
            companyID: companyID,
            partNumber: selectedSinglePN?.PART_NUMBER || selectedSinglePN?.PN,
          })
        );

        if (result.meta.requestStatus === 'fulfilled') {
          setAlternates(result.payload);
          onSearchItems && onSearchItems(result.payload);
        }
      };
      const fetchReq = async () => {
        const partNumbers = [
          selectedSinglePN?.PART_NUMBER || selectedSinglePN?.PN,
          ...(alternates || []).map((alternate) => alternate.ALTERNATIVE),
        ];
        const resultReq = await dispatch(
          getFilteredRequirements({
            companyID: companyID,
            partNumbers: partNumbers,
            status: ['open', 'onOrder'],
          })
        );

        if (resultReq.meta.requestStatus === 'fulfilled') {
          if (resultReq.meta.requestStatus === 'fulfilled') {
            const filteredPayload = resultReq.payload.filter(
              (record: any) => record.readyStatus === 'not Ready'
            );

            const sum = filteredPayload.reduce((acc: any, record: any) => {
              const amout = record.amout || 0;
              const issuedQuantity = record.issuedQuantity || 0;
              const availableQTY = record.availableQTY || 0;
              return acc + (amout - issuedQuantity - availableQTY);
            }, 0);
            setRequirements(filteredPayload);
            setQuantitySum(sum);
            const editedPart = {
              id: uuidv4(),
              PART_NUMBER:
                selectedSinglePN?.PART_NUMBER || selectedSinglePN?.PN,
              DESCRIPTION:
                selectedSinglePN?.nameOfMaterial ||
                selectedSinglePN?.DESCRIPTION,
              GROUP: selectedSinglePN?.GROUP || selectedSinglePN?.group,
              TYPE: selectedSinglePN?.GROUP || selectedSinglePN?.type,
              UNIT_OF_MEASURE:
                selectedSinglePN?.UNIT_OF_MEASURE || selectedSinglePN?.unit,
              QUANTITY: form.getFieldValue('quantity'),
              REQUIREMENTS: (filteredPayload || []).map(
                (part: any) => part.partRequestNumber
              ),
              ALTERNATES: (alternates || []).map(
                (part: any) => part.ALTERNATIVE
              ),
              VENDORS: [],
            };

            setEditedPart(editedPart);
          }
        }
      };

      fetchData();
      fetchReq();
    }
  }, [selectedSinglePN]);

  useEffect(() => {
    if (quantitySum) {
      form.setFields([
        {
          name: 'quantity',
          value: quantitySum,
        },
      ]);
    }
  }, [quantitySum]);
  useEffect(() => {
    if (currentVendor) {
      setIsLocalCreating(isCreating);
      setIsLocalEditing(isEditing);

      form.setFields([
        {
          name: 'PART_NUMBER',
          value: currentVendor.partNumber || currentVendor.PART_NUMBER,
        },
      ]);
      form.setFields([
        {
          name: 'DESCRIPTION',
          value: currentVendor.description || currentVendor.DESCRIPTION,
        },
      ]);
      form.setFields([
        {
          name: 'UNIT_OF_MEASURE',
          value: currentVendor.unit || currentVendor.UNIT_OF_MEASURE,
        },
      ]);

      form.setFields([
        { name: 'quantityQuoted', value: currentVendor.qtyQuoted },
      ]);
      form.setFields([{ name: 'price', value: currentVendor.price }]);
      form.setFields([{ name: 'currency', value: currentVendor.currency }]);
      form.setFields([{ name: 'discount', value: currentVendor.discount }]);
      form.setFields([{ name: 'condition', value: currentVendor.condition }]);
      form.setFields([{ name: 'leadTime', value: currentVendor.leadTime }]);
      form.setFields([{ name: 'remarks', value: currentVendor.remarks }]);
      form.setFields([{ name: 'quantity', value: currentVendor.quantity }]);

      // const fetchData = async () => {
      //   const result = await dispatch(
      //     getFilteredAlternativePN({
      //       companyID: companyID,
      //       partNumber: currentVendor?.PART_NUMBER,
      //     })
      //   );

      //   if (result.meta.requestStatus === 'fulfilled') {
      //     setAlternates(result.payload);
      //     // onSearchItems && onSearchItems(result.payload);
      //   }
      // };

      // const fetchReq = async () => {
      //   const resultReq = await dispatch(
      //     getFilteredRequirements({
      //       companyID: companyID,
      //       partRequestNumbers: currentDetail.REQUIREMENTS,
      //     })
      //   );
      //   if (resultReq.meta.requestStatus === 'fulfilled') {
      //     setRequirements(resultReq.payload);
      //     // onSearchItems && onSearchItems(result.payload);
      //   }
      // };
      // // fetchData();
      // fetchReq();
    }
  }, [currentVendor]);
  return (
    <ProForm
      disabled={!isEditing}
      layout="horizontal"
      submitter={{
        render: (_, dom) =>
          isLocalEditing || isLocalCreating || isEditing
            ? [
                ...dom,
                <Button
                  key="cancel"
                  onClick={() => {
                    isLocalEditing && setIsLocalEditing(false);
                    isEditing && setIsLocalEditing(false);
                    isLocalCreating && setIsLocalCreating(false);
                    isCreating && setIsLocalCreating(false);
                    onEdit(false);
                  }}
                >
                  {t('Cancel')}
                </Button>,
              ]
            : [],
        submitButtonProps: {
          children: 'Search',
        },
      }}
      onFinish={async (values) => {
        console.log(currenOrder);
        if (currenOrder && currenOrder?.orderType === 'QUOTATION_ORDER') {
          const currentCompanyID = localStorage.getItem('companyID') || '';
          const partToUpdate = currenOrder?.parts?.find((part) =>
            part.vendors.some(
              (vendor: { id: string }) => vendor.id === currentVendor.id
            )
          );
          if (partToUpdate) {
            const vendorToUpdate = partToUpdate.vendors.find(
              (vendor: { id: any }) => vendor.id === currentVendor.id
            );
            if (vendorToUpdate) {
              vendorToUpdate.partNumber = values?.PART_NUMBER;
              vendorToUpdate.description = values?.DESCRIPTION;
              vendorToUpdate.price = values?.price;
              vendorToUpdate.currency = values?.currency;
              vendorToUpdate.quantity = form.getFieldValue('quantity');
              // partToUpdate.alternates = (alternates || []).map(
              //   (part: any) => part.ALTERNATIVE
              // );
              vendorToUpdate.discount = values?.discount || '';
              vendorToUpdate.condition = values?.condition;
              vendorToUpdate.leadTime = values?.leadTime;
              vendorToUpdate.unit = values?.UNIT_OF_MEASURE;
              vendorToUpdate.state = values?.state;
              vendorToUpdate.remarks = values?.remarks;
              vendorToUpdate.qtyQuoted = values?.quantityQuoted || '';
              vendorToUpdate.files = values?.files;
            }
          }
          const updatedParts = currenOrder?.parts?.map((part) => {
            if (part.id === partToUpdate.id) {
              return partToUpdate;
            }
            return part;
          });
          const result = await dispatch(
            updateOrderByID({
              id: currenOrder._id || currenOrder.id,
              companyID: currentCompanyID || '',
              updateByID: USER_ID,
              updateBySing: localStorage.getItem('singNumber'),
              updateByName: FULL_NAME,
              updateDate: new Date(),
              parts: updatedParts,
            })
          );

          if (result.meta.requestStatus === 'fulfilled') {
            onUpdateOrder && onUpdateOrder(result.payload);
            message.success(t('SUCCESS'));
            setIsLocalCreating(false);
            setIsLocalEditing(false);
          } else message.error(t('ERROR'));
        } else if (currenOrder && currenOrder?.orderType === 'PURCHASE_ORDER') {
          const currentCompanyID = localStorage.getItem('companyID') || '';
          const partToUpdate = currenOrder?.parts?.find((part) => {
            return part.id === currentVendor.id;
          });
          if (partToUpdate) {
            // const vendorToUpdate = partToUpdate.vendors.find(

            if (partToUpdate) {
              // partToUpdate.partNumber = values?.PART_NUMBER;
              // partToUpdate.description = values?.DESCRIPTION;
              partToUpdate.price = values?.price;
              partToUpdate.currency = values?.currency;
              partToUpdate.quantity = form.getFieldValue('quantity');
              // partToUpdate.alternates = (alternates || []).map(
              //   (part: any) => part.ALTERNATIVE
              // );
              // partToUpdate.discount = values?.discount || '';
              partToUpdate.condition = values?.condition;
              partToUpdate.leadTime = values?.leadTime;
              partToUpdate.unit = values?.UNIT_OF_MEASURE;
              partToUpdate.remarks = values?.remarks;
              partToUpdate.qtyQuoted = values?.quantityQuoted || '';
              // partToUpdate.files = values?.files;
            }
          }
          const updatedParts = currenOrder?.parts?.map((part) => {
            if (part.id === partToUpdate.id) {
              return partToUpdate;
            }
            return part;
          });
          const result = await dispatch(
            updateOrderByID({
              id: currenOrder._id || currenOrder.id,
              companyID: currentCompanyID || '',
              updateByID: USER_ID,
              updateBySing: localStorage.getItem('singNumber'),
              updateByName: FULL_NAME,
              updateDate: new Date(),
              parts: updatedParts,
            })
          );

          if (result.meta.requestStatus === 'fulfilled') {
            onUpdateOrder && onUpdateOrder(result.payload);
            message.success(t('SUCCESS'));
            setIsLocalCreating(false);
            setIsLocalEditing(false);
          } else message.error(t('ERROR'));
        }
      }}
      size="small"
      form={form}
    >
      <ProFormGroup direction="horizontal">
        <ProFormGroup direction="vertical">
          <ProFormGroup direction="horizontal">
            <ProFormText
              rules={[{ required: true }]}
              name="PART_NUMBER"
              label={t('PART No')}
              width="sm"
              tooltip={t('PART No')}
              fieldProps={{
                onDoubleClick: () => {
                  setOpenStoreFind(true);
                },
                onKeyPress: handleKeyPress,
              }}
            ></ProFormText>
            <ProFormText
              rules={[{ required: true }]}
              name="DESCRIPTION"
              label={t('DESCRIPTION')}
              width="sm"
              tooltip={t('DESCRIPTION')}
            ></ProFormText>
          </ProFormGroup>
        </ProFormGroup>
        <ProFormGroup>
          <ProFormDigit
            name="leadTime"
            label={t('LEAD TIME')}
            width="xs"
          ></ProFormDigit>
          {t('MOS')}
        </ProFormGroup>
        <ProFormGroup>
          <ProFormDigit
            rules={[{ required: true }]}
            name="price"
            label={t('PURSHASE PRICE')}
            width="sm"
          ></ProFormDigit>
          <ProFormSelect
            showSearch
            name="currency"
            rules={[{ required: true }]}
            label={t('CURRENCY')}
            width="sm"
            valueEnum={{
              BYN: `BYN/${t('Belarussian Ruble').toUpperCase()}`,
              RUB: `RUB/${t('Russian Ruble').toUpperCase()}`,
              USD: `USD/${t('US Dollar').toUpperCase()}`,
              EUR: `EUR/${t('Euro').toUpperCase()}`,
              GBP: `GBP/${t('British Pound').toUpperCase()}`,
              JPY: `JPY/${t('Japanese Yen').toUpperCase()}`,
              AUD: `AUD/${t('Australian Dollar').toUpperCase()}`,
              CAD: `CAD/${t('Canadian Dollar').toUpperCase()}`,
              CHF: `CHF/${t('Swiss Franc').toUpperCase()}`,
              CNY: `CNY/${t('Chinese Yuan').toUpperCase()}`,
              HKD: `HKD/${t('Hong Kong Dollar').toUpperCase()}`,
              NZD: `NZD/${t('New Zealand Dollar').toUpperCase()}`,
              SEK: `SEK/${t('Swedish Krona').toUpperCase()}`,
              KRW: `KRW/${t('South Korean Won').toUpperCase()}`,
              SGD: `SGD/${t('Singapore Dollar').toUpperCase()}`,
              NOK: `NOK/${t('Norwegian Krone').toUpperCase()}`,
              MXN: `MXN/${t('Mexican Peso').toUpperCase()}`,
              INR: `INR/${t('Indian Rupee').toUpperCase()}`,
              ZAR: `ZAR/${t('South African Rand').toUpperCase()}`,
              BRL: `BRL/${t('Brazilian Real').toUpperCase()}`,
              TWD: `TWD/${t('New Taiwan Dollar').toUpperCase()}`,
            }}
          ></ProFormSelect>
          {currenOrder && currenOrder?.orderType === 'PURCHASE_ORDER' && (
            <ProFormDigit
              name="quantity"
              label={t('QUANTITY')}
              width="xs"
            ></ProFormDigit>
          )}

          <ProFormSelect
            showSearch
            rules={[{ required: true }]}
            label={t('UNIT')}
            name="UNIT_OF_MEASURE"
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
          {/* <ProFormText
            name="discount"
            label={t('DISCOUNT')}
            width="sm"
          ></ProFormText> */}
        </ProFormGroup>

        <ProFormSelect
          showSearch
          rules={[{ required: true }]}
          name="condition"
          label={t('CONDITION')}
          width="sm"
          valueEnum={{
            '/NEW': t('NEW'),
            '/INSPECTION': t('INSPECTION'),
            '/REPAIRED': t('REPAIRED / ТЕКУЩИЙ РЕМОНТ'),
            '/SERVICABLE': t('SERVICABLE / ИСПРАВНО'),
            '/UNSERVICABLE': t('UNSERVICABLE / НЕИСПРАВНО'),
          }}
        />
      </ProFormGroup>
      <ProFormGroup>
        {currenOrder && currenOrder?.orderType === 'QUOTATION_ORDER' && (
          <ProFormDigit
            name="quantityQuoted"
            label={t('QUANTITY QUOTED')}
            width="xs"
          ></ProFormDigit>
        )}
        <ProFormGroup>
          <ProFormTextArea
            fieldProps={{ style: { resize: 'none' } }}
            name="remarks"
            colSize={1}
            label={t('REMARKS')}
            width="lg"
          ></ProFormTextArea>
        </ProFormGroup>
        {currenOrder && currenOrder?.orderType === 'QUOTATION_ORDER' && (
          <Space size={'large'} className=" flex justify-between py-5 ">
            <FileUploader
              onUpload={uploadFileServer}
              acceptedFileTypes={[AcceptedFileTypes.JPG, AcceptedFileTypes.PDF]}
              onSuccess={async function (response: any): Promise<void> {
                if (response) {
                  const updatedFiles = currentVendor?.files
                    ? [...currentVendor?.files, response]
                    : [response];
                  const currentCompanyID =
                    localStorage.getItem('companyID') || '';
                  // console.log(updatedFiles);
                  const partToUpdate = currenOrder?.parts?.find((part) =>
                    part.vendors.some(
                      (vendor: { id: string }) => vendor.id === currentVendor.id
                    )
                  );
                  if (partToUpdate) {
                    const vendorToUpdate = partToUpdate.vendors.find(
                      (vendor: { id: any }) => vendor.id === currentVendor.id
                    );
                    if (vendorToUpdate) {
                      vendorToUpdate.files = updatedFiles;
                    }
                  }
                  const updatedParts = currenOrder?.parts?.map((part) => {
                    if (part.id === partToUpdate.id) {
                      return partToUpdate;
                    }
                    return part;
                  });
                  const result = await dispatch(
                    updateOrderByID({
                      id:
                        (currenOrder && currenOrder._id) ||
                        (currenOrder && currenOrder.id),
                      companyID: currentCompanyID || '',
                      updateByID: USER_ID,
                      updateBySing: localStorage.getItem('singNumber'),
                      updateByName: FULL_NAME,
                      updateDate: new Date(),
                      parts: updatedParts,
                    })
                  );
                  if (result.meta.requestStatus === 'fulfilled') {
                    onUpdateOrder && onUpdateOrder(result.payload);
                    message.success(t('SUCCESS'));
                    setIsLocalCreating(false);
                    setIsLocalEditing(false);
                  } else message.error(t('ERROR'));
                }
              }}
            />

            {currentVendor?.files && currentVendor?.files.length > 0 && (
              <FilesSelector
                isWide
                files={currentVendor.files || []}
                onFileSelect={handleFileSelect}
              />
            )}
          </Space>
        )}
      </ProFormGroup>

      <ModalForm
        title=""
        open={openPickViewer}
        width={'90%'}
        onOpenChange={setOpenPickViewer}
      >
        <div className="h-[78vh]  overflow-hidden">
          <PartsForecast
            onDoubleClick={(record) => {
              setRequariment(record);
              setSecectedSinglePN(record);
              setOpenPickViewer(false);
              form.setFields([{ name: 'PART_NUMBER', value: record.PN }]);
              form.setFields([
                { name: 'DESCRIPTION', value: record.nameOfMaterial },
              ]);
              form.setFields([{ name: 'UNIT_OF_MEASURE', value: record.unit }]);

              form.setFields([{ name: 'GROUP', value: record.group }]);
              form.setFields([{ name: 'TYPE', value: record.type }]);
            }}
          ></PartsForecast>
        </div>
      </ModalForm>
    </ProForm>
  );
};

export default VendorDetailForm;
