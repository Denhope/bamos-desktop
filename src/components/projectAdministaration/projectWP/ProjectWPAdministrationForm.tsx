//@ts-nocheck

import { handleFileOpen, handleFileSelect } from '@/services/utilites';
import { deleteFile, uploadFileServer } from '@/utils/api/thunks';
import {
  ProForm,
  ProFormDigit,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Upload, Button, message, Modal } from 'antd';
import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadOutlined } from '@ant-design/icons';
import { IProjectItem } from '@/models/AC';
import { COMPANY_ID } from '@/utils/api/http';
import { useUpdateProjectItemsMutation } from '@/features/projectItemAdministration/projectItemApi';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
interface FormProps {
  reqCode?: IProjectItem;
  onSubmit: (reqCode: IProjectItem) => void;
  onDelete?: (reqCodeId: string) => void;
}
const ProjectWPAdministrationForm: FC<FormProps> = ({ reqCode, onSubmit }) => {
  const [form] = ProForm.useForm();
  const [updateProjectItem] = useUpdateProjectItemsMutation();
  const { t } = useTranslation();
  const handleSubmit = async (values: any) => {
    const newUser: any = reqCode
      ? { ...reqCode, ...values }
      : { ...values, companyID: localStorage.getItem('companyID') || '' };
    onSubmit(newUser);
  };

  const { data: partNumbers, isError } = useGetPartNumbersQuery({});

  const partValueEnum: Record<string, any> =
    partNumbers?.reduce((acc, partNumber) => {
      acc[partNumber._id] = partNumber; // Store the entire partNumber object
      return acc;
    }, {}) || {};
  useEffect(() => {
    if (reqCode) {
      form.resetFields();
      form.setFieldsValue(reqCode);
      form.setFieldsValue({
        partNumberID: reqCode.partNumberID?._id,
        nameOfMaterial: reqCode.partNumberID?.DESCRIPTION,
        unit: reqCode.partNumberID?.UNIT_OF_MEASURE,
        projectItemNumberID: reqCode?.projectItemsWOID?.map(
          (item) => item?.taskWO
        ),
      });
    } else {
      form.resetFields();
    }
  }, [reqCode, form]);
  const handleDownload = (file: any) => {
    // Здесь должен быть код для скачивания файла

    handleFileOpen(file);
  };

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
            await updateProjectItem(updatedOrderItem).unwrap();
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

        updatedOrderItem &&
          (await updateProjectItem(updatedOrderItem).unwrap());
        reqCode && onSubmit(updatedOrderItem);
      }
    } catch (error) {
      message.error('Ошибка при загрузке файла');

      throw error;
    }
  };

  const dispatch = useAppDispatch();

  return (
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
          <ProFormSelect
            disabled
            width={'xl'}
            label={`${t(`ЗАКАЗ`)}`}
            mode="tags"
            name="projectItemNumberID"
          ></ProFormSelect>
          <ProFormGroup>
            <ProFormSelect
              showSearch
              rules={[{ required: true }]}
              width={'lg'}
              name="partNumberID"
              label={`${t(`PART No`)}`}
              // value={partNumber}
              onChange={(value, data) => {
                // console.log(data);
                form.setFields([
                  { name: 'nameOfMaterial', value: data.data.DESCRIPTION },
                  { name: 'unit', value: data.data.UNIT_OF_MEASURE },
                  { name: 'type', value: data.data.TYPE },
                  { name: 'group', value: data.data.GROUP },
                ]);
              }}
              options={Object.entries(partValueEnum).map(([key, part]) => ({
                label: part.PART_NUMBER,
                value: key,
                data: part,
              }))}
            />

            <ProFormText
              disabled
              rules={[{ required: true }]}
              name="nameOfMaterial"
              label={t('DESCRIPTION')}
              width="md"
              tooltip={t('DESCRIPTION')}
            ></ProFormText>
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
            name="notes"
            label={t('REMARKS')}
          />
          <ProFormGroup>
            <ProFormDigit
              rules={[{ required: true }]}
              name="qty"
              label={t('QUANTITY')}
              width="xs"
            ></ProFormDigit>
            <ProFormSelect
              showSearch
              rules={[{ required: true }]}
              label={t('UNIT')}
              name="unit"
              width="xs"
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

          {/* <ProFormGroup>
            <ProFormSelect
              showSearch
              name="status"
              label={t('STATE')}
              width="sm"
              valueEnum={{
                ACTIVE: { text: t('ACTIVE'), status: 'SUCCESS' },
                INACTIVE: { text: t('INACTIVE'), status: 'Error' },
              }}
            />
          </ProFormGroup> */}
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
  );
};

export default ProjectWPAdministrationForm;
