//@ts-nocheck
import {
  FormInstance,
  ProForm,
  ProFormGroup,
  ProFormText,
  ProFormDatePicker,
  ProFormDigit,
  ProColumns,
  ProDescriptions,
} from '@ant-design/pro-components';
import { UploadOutlined } from '@ant-design/icons';
import {
  Form,
  DatePicker,
  Space,
  Upload,
  Modal,
  message,
  Button,
  Tag,
  Row,
  Divider,
} from 'antd';

import { useAppDispatch } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { handleFileOpen, handleFileSelect } from '@/services/utilites';
import {
  uploadFileServer,
  updatedMaterialItemsById,
  deleteFile,
} from '@/utils/api/thunks';
import { COMPANY_ID } from '@/utils/api/http';
import {
  useGetStorePartsQuery,
  useUpdateStorePartsMutation,
} from '@/features/storeAdministration/PartsApi';
import { Split } from '@geoffcox/react-splitter';
import { useAddBookingMutation } from '@/features/bookings/bookingApi';
type OriginalStoreEntryType = {
  currentPart: any;
  scroll?: any;
  onUpdatePart?: (data: any) => void;
};
const OriginalStoreEntry: FC<OriginalStoreEntryType> = ({
  currentPart,
  onUpdatePart,
  scroll,
}) => {
  const [form] = Form.useForm();
  const formRef = useRef<FormInstance>(null);
  const { t } = useTranslation();
  const [data, setData] = useState<any | null>([currentPart]);
  const [dataPart, setDataPart] = useState<any | null>();
  const [updateStoreParts] = useUpdateStorePartsMutation({});
  const handleSave = (rowKey: any, data: any, row: any) => {
    // setData((prevData: any) => [...prevData, data]);

    onUpdatePart && onUpdatePart(data);
    setDataPart(data);
  };
  const {
    data: parts,
    isLoading: partsQueryLoading,
    isFetching: partsLoadingF,
    refetch,
  } = useGetStorePartsQuery(
    currentPart._id ? { ids: currentPart._id } : {}, // This will prevent the query from running if reqCode is null or does not have an id
    {
      skip: !currentPart._id,

      // Skip the query if reqCode is null or does not have an id
    }
  );
  const dispatch = useAppDispatch();

  const handleDelete = (file: any) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить этот файл?',
      onOk: async () => {
        try {
          const response = await dispatch(
            deleteFile({ id: file.id, companyID: COMPANY_ID })
          );
          if (
            response.meta.requestStatus === 'fulfilled' &&
            parts &&
            parts[0]
          ) {
            // Удаляем файл из массива files
            const updatedFiles = parts[0]?.FILES.filter(
              (f: { id: any }) => f.id !== file.id
            );

            try {
              if (currentPart?.id || currentPart?._id) {
                await updateStoreParts({
                  partsIds: [currentPart?.id || currentPart?._id],
                  FILES: updatedFiles,
                }).unwrap();
                const { _id, ...bookingData } = parts && parts[0];
                const addBookingResponse = await addBooking({
                  booking: {
                    voucherModel: 'ENTITY_CHANGE',
                    ...bookingData,
                  },
                }).unwrap();

                refetch();
                message.success(t('PARTS SUCCESSFULLY UPDATE'));
              }
            } catch (error) {
              message.error(t('ERROR UPDATE PARTS'));
            }
          } else {
            throw new Error('Не удалось удалить файл');
          }
        } catch (error) {
          message.error('ERROR DELETE');
        }
      },
    });
  };

  const handleUpload = async (file: File) => {
    if (!parts && !parts[0]) {
      console.error(
        'Невозможно загрузить файл: PART не существует или не имеет id'
      );
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadFileServer(formData);

      if (response) {
        const updatedFiles =
          parts && parts[0]?.FILES
            ? [...(parts && parts[0].FILES), response]
            : [response];

        await updateStoreParts({
          partsIds: [currentPart?.id || currentPart?._id],
          FILES: updatedFiles,
        }).unwrap();
        refetch().unwrap();
        const { _id, ...bookingData } = parts && parts[0];
        const addBookingResponse = await addBooking({
          booking: {
            voucherModel: 'ENTITY_CHANGE',
            ...bookingData,
          },
        }).unwrap();

        refetch();
        message.success(t('PARTS SUCCESSFULLY TRANSFER'));
      }
    } catch (error) {
      message.error('Ошибка при загрузке файла');

      throw error;
    }
  };
  const handleDownload = (file: any) => {
    handleFileOpen(file);
  };
  const [addBooking] = useAddBookingMutation({});

  const handleSubmit = async (values: any) => {
    try {
      if (currentPart?.id || currentPart?._id) {
        await updateStoreParts({
          partsIds: [currentPart?.id || currentPart?._id],
          SUPPLIER_BATCH_NUMBER: values?.SUPPLIER_BATCH_NUMBER,
          SERIAL_NUMBER: values?.SERIAL_NUMBER,
          PRODUCT_EXPIRATION_DATE:
            parts && parts[0]?.GROUP !== 'TOOL'
              ? values?.PRODUCT_EXPIRATION_DATE
              : parts && parts[0]?.PRODUCT_EXPIRATION_DATE,
          nextDueMOS:
            parts && parts[0]?.GROUP === 'TOOL'
              ? values?.PRODUCT_EXPIRATION_DATE
              : parts && parts[0]?.nextDueMOS,
          intervalMOS: values?.intervalMOS,
          UNIT_LIMIT: values?.UNIT_LIMIT,
          estimatedDueDate: values?.estimatedDueDate,
        }).unwrap();

        refetch().unwrap();
        const { _id, ...bookingData } = parts && parts[0];

        const addBookingResponse = await addBooking({
          booking: {
            voucherModel: 'ENTITY_CHANGE',
            ...bookingData,
          },
        }).unwrap();
        message.success(t('PARTS SUCCESSFULLY UPDATE'));
      }
    } catch (error) {
      message.error(t('ERROR UPDATE PARTS'));
    }
  };

  return (
    <div>
      <ProForm
        size="small"
        layout="horizontal"
        formRef={formRef}
        form={form}
        onFinish={async (values: any) => {
          handleSubmit(values);
          form.resetFields();
        }}
      >
        <Split horizontal initialPrimarySize="30%">
          <div className="overflow-auto">
            <ProDescriptions
              column={5}
              size="default"
              className="bg-white px-4 py-3 rounded-md  align-middle"
            >
              <ProDescriptions.Item label={t('PART No')} valueType="text">
                {parts && (parts[0]?._id || parts[0]?.id) && (
                  <Tag>
                    {String(parts && parts[0]?.PART_NUMBER).toUpperCase()}
                  </Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('DESCRIPTION')} valueType="text">
                {parts && (parts[0]?._id || parts[0]?.id) && (
                  <Tag>
                    {String(parts && parts[0]?.NAME_OF_MATERIAL).toUpperCase()}
                  </Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('GROUP')} valueType="text">
                {parts && (parts[0]?._id || parts[0]?.id) && (
                  <Tag>{String(parts && parts[0]?.GROUP).toUpperCase()}</Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('UNIT')} valueType="text">
                {parts && (parts[0]?._id || parts[0]?.id) && (
                  <Tag>{String(parts[0]?.UNIT_OF_MEASURE).toUpperCase()}</Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('QUANTITY')} valueType="text">
                {parts && (parts[0]?._id || parts[0]?.id) && (
                  <Tag>{String(parts[0]?.QUANTITY || 'N/A').toUpperCase()}</Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('STATION')} valueType="text">
                {parts && (parts[0]?._id || parts[0]?.id) && (
                  <Tag>{String('').toUpperCase()}</Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('STORE')} valueType="text">
                {parts && (parts[0]?._id || parts[0]?.id) && (
                  <Tag>
                    {String(parts[0]?.storeID?.storeShortName).toUpperCase()}
                  </Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('LOCATION')} valueType="text">
                {parts && (parts[0]?._id || parts[0]?.id) && (
                  <Tag>
                    {String(
                      parts[0]?.locationID?.locationName || 'N/A'
                    ).toUpperCase()}
                  </Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('CONDITION')} valueType="text">
                {parts && (parts[0]?._id || parts[0]?.id) && (
                  <Tag>
                    {String(parts[0]?.CONDITION || 'N/A').toUpperCase()}
                  </Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item valueType="text"></ProDescriptions.Item>
              <ProDescriptions.Item label={t('LABEL')} valueType="text">
                {parts && (parts[0]?._id || parts[0]?.id) && (
                  <Tag>
                    {String(
                      (parts && parts[0]?.LOCAL_ID) || 'N/A'
                    ).toUpperCase()}
                  </Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('BATCH')} valueType="text">
                {parts && (parts[0]?._id || parts[0]?.id) && (
                  <Tag>
                    {String(
                      parts[0]?.SUPPLIER_BATCH_NUMBER || 'N/A'
                    ).toUpperCase()}
                  </Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('SERIAL NUMBER')} valueType="text">
                {parts && (parts[0]?._id || parts[0]?.id) && (
                  <Tag>
                    {String(parts[0]?.SERIAL_NUMBER || 'N/A').toUpperCase()}
                  </Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('OWNER')} valueType="text">
                {parts && (parts[0]?._id || parts[0]?.id) && (
                  <Tag>
                    {String(
                      (parts && parts[0]?.OWNER_SHORT_NAME) || 'N/A'
                    ).toUpperCase()}
                  </Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item label={t('RECEIVING No')} valueType="text">
                {parts && (parts[0]?._id || parts[0]?.id) && (
                  <Tag>
                    {String(parts[0]?.RECEIVING_NUMBER || 'N/A').toUpperCase()}
                  </Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item valueType="date" label={t('LAST INSPECT')}>
                {(parts && parts[0]?.estimatedDueDate) || 'N/A'}
              </ProDescriptions.Item>
              <ProDescriptions.Item valueType="date" label={t('EXPIRES')}>
                {(parts && parts[0]?.PRODUCT_EXPIRATION_DATE) ||
                  (parts && parts[0]?.nextDueMOS)}
              </ProDescriptions.Item>
              <ProDescriptions.Item valueType="digit" label={t('INTERVAL')}>
                {(parts && parts[0]?.intervalMOS) || 'N/A'}
              </ProDescriptions.Item>
              <ProDescriptions.Item valueType="text" label={t('UNIT LIMIT')}>
                {String(parts && parts[0]?.UNIT_LIMIT).toUpperCase() || 'N/A'}
              </ProDescriptions.Item>
            </ProDescriptions>
          </div>
          <div className="overflow-auto h-[37vh] py-5">
            <ProForm.Item>
              <Space>
                <ProFormText label={t('UNIT_LIMIT')} name="UNIT_LIMIT" />
                <ProFormText label={t('INTERVAL')} name="intervalMOS" />
                <ProFormText label={t('SERIAL NUMBER')} name="SERIAL_NUMBER" />
                <ProFormText label={t('BATCH')} name="SUPPLIER_BATCH_NUMBER" />
              </Space>
            </ProForm.Item>
            <Divider />

            <Row justify={'space-between'}>
              <ProFormDatePicker
                label={t('ESTIMATED DUE DATE')}
                name="estimatedDueDate"
              />
              <ProFormDatePicker
                label={t('PRODUCT EXPIRATION DATE')}
                name="PRODUCT_EXPIRATION_DATE"
              />
            </Row>
            <Divider />

            <ProFormGroup>
              <ProForm.Item label={t('UPLOAD')}>
                <div className="overflow-y-auto max-h-64 ">
                  <Upload
                    listType="picture"
                    name="FILES"
                    fileList={parts ? parts[0]?.FILES : []}
                    // listType="picture"
                    className="upload-list-inline cursor-pointer"
                    beforeUpload={handleUpload}
                    // accept="image/*"
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
            </ProFormGroup>
          </div>
        </Split>
      </ProForm>
    </div>
  );
};

export default OriginalStoreEntry;
