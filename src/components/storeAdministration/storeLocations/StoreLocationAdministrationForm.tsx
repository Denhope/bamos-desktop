//@ts-nocheck

import {
  handleFileOpen,
  handleFileSelect,
  transformToIPartNumber,
} from '@/services/utilites';
import { deleteFile, uploadFileServer } from '@/utils/api/thunks';
import {
  ProForm,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Upload, Button, message, Modal, Tabs, Empty } from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadOutlined } from '@ant-design/icons';

import { COMPANY_ID } from '@/utils/api/http';
import { useUpdateProjectItemsMutation } from '@/features/projectItemAdministration/projectItemApi';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import {
  useGetLocationsQuery,
  useUpdateLocationMutation,
} from '@/features/storeAdministration/LocationApi';
import { ILocation } from '@/models/IUser';
import { useGetCompaniesQuery } from '@/features/companyAdministration/companyApi';
import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
import PartsList from './PartsList';
import { useGetStorePartsQuery } from '@/features/storeAdministration/PartsApi';
import { ColDef } from 'ag-grid-community';
import PartContainer from '@/components/woAdministration/PartContainer';
interface FormProps {
  reqCode?: ILocation;
  onSubmit: (reqCode: ILocation) => void;
  onDelete?: (reqCodeId: string) => void;
}
const StoreLocationAdministrationForm: FC<FormProps> = ({
  reqCode,
  onSubmit,
}) => {
  const [form] = ProForm.useForm();
  const [updateLocation] = useUpdateLocationMutation();

  const { data: parts, isLoading: partsLoading } = useGetStorePartsQuery(
    reqCode?.id ? { locationID: reqCode.id } : { locationID: null }, // This will prevent the query from running if reqCode is null or does not have an id
    {
      skip: !reqCode || !reqCode.id, // Skip the query if reqCode is null or does not have an id
    }
  );

  const { t } = useTranslation();
  const handleSubmit = async (values: any) => {
    const newUser: any = reqCode
      ? { ...reqCode, ...values }
      : { ...values, companyID: localStorage.getItem('companyID') || '' };
    onSubmit(newUser);
  };

  type CellDataType = 'text' | 'number' | 'date' | 'boolean'; // Определите возможные типы данных

  interface ExtendedColDef extends ColDef {
    cellDataType: CellDataType; // Обязательное свойство
  }

  const [columnDefs, setColumnDefs] = useState<ExtendedColDef[]>([
    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: false,
      // cellEditor: AutoCompleteEditor,
      // cellEditorParams: {
      //   options: [],
      // },
      cellDataType: 'text',
    },

    {
      field: 'NAME_OF_MATERIAL',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'GROUP',
      headerName: `${t('GROUP')}`,
      cellDataType: 'text',
    },
    {
      field: 'TYPE',
      headerName: `${t('TYPE')}`,
      cellDataType: 'text',
    },
    {
      field: 'QUANTITY',
      editable: true,
      cellDataType: 'number',
      headerName: `${t('QUANTITY')}`,
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    // Добавьте другие колонки по необходимости
  ]);
  useEffect(() => {
    if (reqCode) {
      form.resetFields();
      form.setFieldsValue(reqCode);
      // form.setFieldsValue({
      //   partNumberID: reqCode.partNumberID?._id,
      //   nameOfMaterial: reqCode.partNumberID?.DESCRIPTION,
      //   unit: reqCode.partNumberID?.UNIT_OF_MEASURE,
      //   projectItemNumberID: reqCode?.projectItemsWOID?.map(
      //     (item) => item?.taskWO
      //   ),
      // });
    } else {
      form.resetFields();
    }
  }, [reqCode, form]);
  const handleDownload = (file: any) => {
    // Здесь должен быть код для скачивания файла

    handleFileOpen(file);
  };

  const { data: companies } = useGetCompaniesQuery({});
  const handleDelete = (file: any) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить этот файл?',
      onOk: async () => {
        try {
          const response = await dispatch(
            deleteFile({ id: file.id, companyID: COMPANY_ID })
          );
          if (response.meta.requestStatus === 'fulfilled') {
            // Удаляем файл из массива files
            const updatedFiles =
              reqCode &&
              reqCode?.files &&
              reqCode?.files.filter((f) => f.id !== file.id);
            const updatedOrderItem = {
              ...reqCode,
              files: updatedFiles,
            };
            await updateLocation(updatedOrderItem).unwrap();
            reqCode && onSubmit(updatedOrderItem);
          } else {
            throw new Error('Не удалось удалить файл');
          }
        } catch (error) {
          message.error('ERROR');
        }
      },
    });
  };
  const handleUpload = async (file: File) => {
    if (!reqCode || !reqCode.id) {
      console.error(
        'Невозможно загрузить файл: Ордер не существует или не имеет id'
      );
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadFileServer(formData);

      if (response) {
        const updatedOrderItem = {
          ...reqCode,
          files: [...(reqCode?.files || []), response],
        };

        updatedOrderItem && (await updateLocation(updatedOrderItem).unwrap());
        reqCode && onSubmit(updatedOrderItem);
      }
    } catch (error) {
      message.error('Ошибка при загрузке файла');

      throw error;
    }
  };

  const { data: stores } = useGetStoresQuery({});
  const { data: locations, isLoading } = useGetLocationsQuery({});

  const storeCodesValueEnum: Record<string, string> =
    stores?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = `${String(mpdCode?.storeShortName)?.toUpperCase()}`;
      return acc;
    }, {}) || {};

  const companiesCodesValueEnum: Record<string, string> =
    companies?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.companyName;
      return acc;
    }, {}) || {};
  const dispatch = useAppDispatch();
  const transformedParts = useMemo(() => {
    return reqCode?.id && transformToIPartNumber(parts || []);
  }, [reqCode?.id, parts]);

  return (
    <Tabs defaultActiveKey="1" type="card">
      <Tabs.TabPane tab={t('INFORMATION')} key="1">
        <ProForm
          className="bg-gray-100 p-5 rounded"
          size="small"
          form={form}
          onFinish={handleSubmit}
          // submitter={false}
          initialValues={reqCode}
          layout="horizontal"
        >
          <ProForm.Group>
            <ProForm.Group>
              <ProFormText
                rules={[{ required: true }]}
                name="locationName"
                label={t('LOCATION NAME')}
                width="md"
                tooltip={t('DESCRIPTION')}
              ></ProFormText>
              {/* <ProFormText
            rules={[{ required: true }]}
            name="description"
            label={t('DESCRIPTION')}
            width="md"
            tooltip={t('DESCRIPTION')}
          ></ProFormText> */}
              <ProFormSelect
                name="description"
                label={`${t('DESCRIPTION')}`}
                width="lg"
                rules={[{ required: true }]}
                valueEnum={{
                  LOCATION_FOR_UNSERVICEABLE_PARTS: {
                    text: t('LOCATION FOR UNSERVICEABLE PARTS'),
                  },
                  LOCATION_FOR_SERVICEABLE_PARTS: {
                    text: t('LOCATION FOR SERVICEABLE PARTS'),
                  },
                  LOCATION_FOR_PARTS_IN_HANGAR: {
                    text: t('LOCATION FOR PARTS IN HANGAR'),
                  },
                  LOCATION_FOR_PARTS_IN_QUARANTINE: {
                    text: t('LOCATION FOR PARTS IN QUARANTINE'),
                  },
                  LOCATION_FOR_PARTS_IN_SHOP: {
                    text: t('LOCATION FOR PARTS TO TRANSFER'),
                  },

                  LOCATION_FOR_PARTS_TO_SCRAP: {
                    text: t('LOCATION FOR PARTS TO SCRAP'),
                  },

                  // QUAR_LOCATION: { text: t('QUAR LOCATION') },
                  // TRANSFER_LOCATION: { text: t('TRANSFER LOCATION') },
                }}
              />

              <ProFormGroup>
                <ProFormSelect
                  name="locationType"
                  label={`${t('LOCATION TYPE')}`}
                  width="sm"
                  tooltip={`${t('LOCATION TYPE')}`}
                  // rules={[{ required: true }]}
                  // valueEnum={locationCodesValueEnum}
                  valueEnum={{
                    standart: { text: t('STANDART') },
                    hangar: { text: t('HANGAR') },
                    quarantine: { text: t('QUARANTINE') },
                    // rollOut: { text: t('ROLLOUT') },
                    scrap: { text: t('SCRAP') },
                    shipment: { text: t('SHIPMENT') },
                    transfer: { text: t('TRANSFER') },
                    shop: { text: t('SHOP') },
                    unserviceable: { text: t('UNSERVICEABLE') },
                    serviceable: { text: t('SERVICEABLE') },
                    reservation: { text: t('RESERVATION') },
                    customer: { text: t('CUSTOMER') },
                    // consingment: { text: t('CONSIGNMENT') },
                    // pool: { text: t('POOL') },
                    tool: { text: t('TOOL') },
                    // arhive: { text: t('ARCHIVE') },
                    // moving: { text: t('MOVING') },
                  }}
                />
                <ProFormSelect
                  name="restrictionID"
                  label={`${t('RESTRICTION')}`}
                  width="sm"
                  tooltip={`${t('RESTRICTION')}`}
                  rules={[{ required: true }]}
                  valueEnum={{
                    standart: { text: t('STANDART') },
                    inaccessible: { text: t('INACCESSIBLE') },
                    restricted: { text: t('RESTRICTED') },
                  }}
                />
              </ProFormGroup>

              <ProFormTextArea
                width={'xl'}
                fieldProps={{
                  style: {
                    resize: 'none',
                  },
                  rows: 3,
                  // This is the correct way to set colSize within fieldProps
                }}
                name="remarks"
                label={t('REMARKS')}
              />
              <ProFormSelect
                showSearch
                rules={[{ required: true }]}
                name="storeID"
                label={t('STORE')}
                width="lg"
                valueEnum={storeCodesValueEnum || []}
                // disabled={!projectId}
              />
              <ProFormSelect
                showSearch
                rules={[{ required: true }]}
                name="ownerID"
                label={t('OWNER')}
                width="lg"
                valueEnum={companiesCodesValueEnum || []}
                // disabled={!projectId}
              />

              <ProForm.Item label={t('UPLOAD')}>
                <div className="overflow-y-auto max-h-64">
                  <Upload
                    name="FILES"
                    fileList={reqCode?.files || []}
                    // listType="picture"
                    className="upload-list-inline cursor-pointer"
                    beforeUpload={handleUpload}
                    accept="image/*"
                    onPreview={handleDownload}
                    onRemove={handleDelete}
                    multiple
                    onDownload={function (file: any): void {
                      handleFileSelect({
                        id: file?.id,
                        name: file?.name,
                      });
                    }}
                  >
                    <Button icon={<UploadOutlined />}>
                      {t('CLICK TO UPLOAD')}
                    </Button>
                  </Upload>
                </div>
              </ProForm.Item>
            </ProForm.Group>
          </ProForm.Group>
        </ProForm>
      </Tabs.TabPane>
      <Tabs.TabPane tab={t('PARTS')} key="2">
        {reqCode ? (
          <PartContainer
            isButtonVisiable={false}
            isFilesVisiable={true}
            isButtonColumn={false}
            isAddVisiable={true}
            height={'45vh'}
            columnDefs={columnDefs}
            partNumbers={[]}
            onUpdateData={(data: any[]): void => {}}
            rowData={parts || []}
          />
        ) : (
          <Empty />
        )}

        {/* // <PartsList parts={parts}></PartsList> : <Empty></Empty> */}
      </Tabs.TabPane>
    </Tabs>
  );
};

export default StoreLocationAdministrationForm;
