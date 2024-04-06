import {
  FormInstance,
  ProForm,
  ProFormGroup,
  ProFormText,
  ProFormDatePicker,
  ProFormDigit,
  ProColumns,
} from '@ant-design/pro-components';
import { UploadOutlined } from '@ant-design/icons';
import { Form, DatePicker, Space, Upload, Modal, message, Button } from 'antd';
import FilesSelector from '@/components/shared/FilesSelector';
import EditableTable from '@/components/shared/Table/EditableTable';
import FileUploader, { AcceptedFileTypes } from '@/components/shared/Upload';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { handleFileOpen, handleFileSelect } from '@/services/utilites';
import {
  uploadFileServer,
  updateStoreByID,
  updateManyMaterialItems,
  updatedMaterialItemsById,
  deleteFile,
} from '@/utils/api/thunks';
import { COMPANY_ID } from '@/utils/api/http';
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

  const handleSave = (rowKey: any, data: any, row: any) => {
    // setData((prevData: any) => [...prevData, data]);

    onUpdatePart && onUpdatePart(data);
    setDataPart(data);
  };

  const dispatch = useAppDispatch();
  useEffect(() => {
    if (currentPart) {
      form.setFields([
        { name: 'partNumber', value: currentPart.PART_NUMBER },
        {
          name: 'partGroup',
          value: currentPart?.GROUP,
        },
        { name: 'store', value: currentPart.STOCK },
        {
          name: 'unit',
          value: currentPart?.UNIT_OF_MEASURE,
        },
        {
          name: 'description',
          value: currentPart?.NAME_OF_MATERIAL,
        },
        { name: 'location', value: currentPart.SHELF_NUMBER },
        { name: 'condition', value: currentPart.CONDITION },
        {
          name: 'batchNumber',
          value: currentPart.SUPPLIER_BATCH_NUMBER || 'N/A',
        },
        { name: 'serialNumber', value: currentPart.SERIAL_NUMBER || 'N/A' },
        { name: 'expiryDate', value: currentPart.PRODUCT_EXPIRATION_DATE },
        { name: 'ownerShotName', value: currentPart.OWNER_SHORT_NAME },
        { name: 'qty', value: currentPart.QUANTITY },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [currentPart]);
  // useEffect(() => {
  //   if (currentAction) {
  //     handleSelectChange(currentAction);
  //   }
  // }, [dispatch, currentPart]);
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('BATCH')}`,
      dataIndex: 'SUPPLIER_BATCH_NUMBER',
      key: 'SUPPLIER_BATCH_NUMBER',
      ellipsis: true,
      render: (text: any, record: any) => record.SUPPLIER_BATCH_NUMBER,
      // остальные свойства...
    },
    {
      title: `${t('SERIAL NUMBER')}`,
      dataIndex: 'SERIAL_NUMBER',
      key: 'SERIAL_NUMBER',
      ellipsis: true,
      render: (text: any, record: any) => record.SERIAL_NUMBER,
      // остальные свойства...
    },
    {
      title: `${t('EXPIRES')}`,
      dataIndex: 'PRODUCT_EXPIRATION_DATE',
      key: 'PRODUCT_EXPIRATION_DATE',
      ellipsis: false,
      valueType: 'date',
      editable: (text, record, index) => {
        return false;
      },
      renderFormItem: () => {
        return <DatePicker />;
      },
      // render: (_, record) => {
      //   return dayjs(record.PRODUCT_EXPIRATION_DATE).format('YYYY-MM-DD');
      // },
    },
    {
      title: `${t('M.CLASS')}`,
      dataIndex: 'GROUP',
      key: 'GROUP',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },

      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    // {
    //   title: `${t('UNIT')}`,
    //   dataIndex: 'unit',
    //   key: 'unit',
    //   responsive: ['sm'],
    //   search: false,
    //   editable: (text, record, index) => {
    //     return false;
    //   },
    //   // sorter: (a, b) => a.unit.length - b.unit.length,
    // },
    {
      title: `${t('OWNER')}`,
      dataIndex: 'OWNER_SHORT_NAME',
      key: 'OWNER_SHORT_NAME',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('QUANTITY')}`,
      dataIndex: 'QUANTITY',
      key: 'QUANTITY',
      responsive: ['sm'],
      search: false,
      // width: '10%',
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('RECEIVING No')}`,
      dataIndex: 'RECEIVING_NUMBER',
      key: 'RECEIVING_NUMBER',
      editable: (text, record, index) => {
        return false;
      },
      ellipsis: true,
      // width: '7%',
      formItemProps: {
        name: 'RECEIVING_NUMBER',
      },
      sorter: (a: any, b: any) => a.RECEIVING_NUMBER - b.RECEIVING_NUMBER, //

      // responsive: ['sm'],
    },
    {
      title: `${t('OPTION')}`,
      valueType: 'option',
      key: 'option',
      // width: '9%',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record._id);
          }}
        >
          Edit
        </a>,
      ],
    },
  ];

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
            const updatedFiles = currentPart.FILES.filter(
              (f: { id: any }) => f.id !== file.id
            );
            const updatedItem = {
              ...currentPart,
              files: updatedFiles,
            };
            // await updateOrderItem(updatedItem).unwrap();
            // orderItem && onSubmit(updatedItem);
            const result = await dispatch(
              updatedMaterialItemsById({
                companyID: COMPANY_ID,
                _id: currentPart?.id || currentPart?._id,
                FILES: updatedFiles,
              })
            );
            if (result.meta.requestStatus === 'fulfilled' && onUpdatePart) {
              onUpdatePart(result.payload);
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
    if (!currentPart) {
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
        const updatedFiles = currentPart.FILES
          ? [...currentPart.FILES, response]
          : [response];
        const currentCompanyID = localStorage.getItem('companyID') || '';
        const result = await dispatch(
          updatedMaterialItemsById({
            companyID: currentCompanyID || '',
            _id: currentPart?.id || currentPart?._id,
            FILES: updatedFiles,
          })
        );
        if (result.meta.requestStatus === 'fulfilled' && onUpdatePart) {
          onUpdatePart(result.payload);
        }
      }
    } catch (error) {
      message.error('Ошибка при загрузке файла');

      throw error;
    }
  };
  const handleDownload = (file: any) => {
    // Здесь должен быть код для скачивания файла

    handleFileOpen(file);
  };
  return (
    <div>
      <ProForm
        size="small"
        layout="horizontal"
        formRef={formRef}
        form={form}
        onFinish={async (values: any) => {
          const currentCompanyID = localStorage.getItem('companyID') || '';
          const result = await dispatch(
            updatedMaterialItemsById({
              companyID: currentCompanyID || '',
              _id: currentPart?.id || currentPart?._id,
              BATCH: dataPart?.SUPPLIER_BATCH_NUMBER,
              SERIAL_NUMBER: dataPart?.SERIAL_NUMBER,
              PRODUCT_EXPIRATION_DATE: dataPart?.PRODUCT_EXPIRATION_DATE,
            })
          );
          if (result.meta.requestStatus === 'fulfilled' && onUpdatePart) {
            onUpdatePart(result.payload);
          }
        }}
      >
        <ProFormGroup>
          <ProFormText
            disabled
            name="partNumber"
            label={t('PART No')}
            width="sm"
          ></ProFormText>
          <ProFormText disabled name="description" width="lg"></ProFormText>
          <ProFormText
            disabled
            name="partGroup"
            label={`${t('PART SPESIAL GROUP')}`}
            width="sm"
          ></ProFormText>
          <ProFormText
            disabled
            label={t('UNIT')}
            name="unit"
            width="xs"
          ></ProFormText>
        </ProFormGroup>
        <ProFormGroup>
          <ProFormText
            initialValue={'MSQ'}
            disabled
            name="station"
            label={`${t('STATION')}`}
            width="xs"
          />
          <ProFormText
            name="store"
            disabled
            label={`${t('STORE')}`}
            width="xs"
            tooltip={`${t('STORE CODE')}`}
            //rules={[{ required: true }]}
          />
          <ProFormText
            name="location"
            disabled
            label={`${t('LOCATION')}`}
            width="sm"
            tooltip={`${t('LOCATION')}`}
          />
          <ProFormText
            name="condition"
            disabled
            label={`${t('CONDITION')}`}
            width="sm"
            tooltip={`${t('CONDITION')}`}
          />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormText
            disabled
            name="batchNumber"
            label={`${t('BATCH NUMBER')}`}
            width="sm"
            tooltip={`${t('BATCH NUMBER')}`}
          />
          <ProFormText
            name="serialNumber"
            disabled
            label={`${t('SERIAL NUMBER')}`}
            width="sm"
            tooltip={`${t('SERIAL NUMBER')}`}
          />
          <ProFormDatePicker
            name="expiryDate"
            disabled
            label={t('EXPIRES')}
            width="xs"
          ></ProFormDatePicker>
          <ProFormText
            name="ownerShotName"
            disabled
            label={t('OWNER')}
            width="sm"
            tooltip={t('OWNER')}
          ></ProFormText>
          <ProFormDigit
            name="qty"
            disabled
            label={t('QUANTITY')}
            width="xs"
            tooltip={t('QTY')}
          ></ProFormDigit>
        </ProFormGroup>
        <ProForm.Item>
          <div className="flex w-[100%]  my-0 mx-auto flex-col  h-[40vh] relative overflow-hidden">
            <EditableTable
              isNoneRowSelection
              showSearchInput={false}
              actionRenderDelete
              data={[currentPart] || []}
              initialColumns={initialColumns}
              // isLoading={isLoading}
              menuItems={undefined}
              recordCreatorProps={false}
              onDoubleRowClick={function (record: any, rowIndex?: any): void {}}
              onRowClick={function (record: any, rowIndex?: any): void {}}
              onSave={handleSave}
              yScroll={scroll}
              externalReload={function (): Promise<void> {
                throw new Error('Function not implemented.');
              }}
              isLoading={false}
            />
          </div>
        </ProForm.Item>
        <ProFormGroup>
          <ProForm.Item label={t('UPLOAD')}>
            <div className="overflow-y-auto max-h-64">
              <Upload
                name="FILES"
                fileList={currentPart.FILES || []}
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
      </ProForm>
    </div>
  );
};

export default OriginalStoreEntry;
