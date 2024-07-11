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
import { IProject } from '@/models/IProject';
import { useGetTaskCodeQuery } from '@/features/tasksAdministration/taskCodesApi';
import { useGetTasksQuery } from '@/features/tasksAdministration/tasksApi';
interface FormProps {
  reqCode?: IProjectItem;
  onSubmit: (reqCode: IProjectItem) => void;
  onDelete?: (reqCodeId: string) => void;
  project: IProject;
}
const ProjectWPAdministrationForm: FC<FormProps> = ({
  reqCode,
  onSubmit,
  project,
}) => {
  const [form] = ProForm.useForm();
  const [updateProjectItem] = useUpdateProjectItemsMutation();
  const { t } = useTranslation();
  const handleSubmit = async (values: any) => {
    console.log(project);
    const newUser: any = reqCode
      ? { ...reqCode, ...values }
      : {
          ...values,
          planeID: project?.planeId._id,
          companyID: localStorage.getItem('companyID') || '',
        };
    onSubmit(newUser);
    console.log(newUser);
  };

  const { data: partNumbers, isError } = useGetPartNumbersQuery({});
  const { data: tasks, isLoading: loading } = useGetTasksQuery(
    { acTypeID: project?.planeId?.acTypeId },
    { skip: !project }
  );
  const partValueEnum: Record<string, any> =
    partNumbers?.reduce((acc, partNumber) => {
      acc[partNumber._id] = partNumber; // Store the entire partNumber object
      return acc;
    }, {}) || {};
  const taskValueEnum: Record<string, any> =
    tasks?.reduce((acc, taskNumber) => {
      acc[taskNumber.id] = taskNumber; // Store the entire partNumber object
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
        amtoss: reqCode?.taskNumberID?.amtoss,
        taskNumberID: reqCode?.taskNumberID?.id || reqCode?.taskNumberID?._id,
        type: reqCode?.taskNumberID?.type,
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
      {project && project.projectType === 'partProduce' && (
        <ProFormGroup>
          <ProForm.Group>
            <ProForm.Group>
              <ProFormSelect
                disabled
                width={'xl'}
                label={`${t(`TRACE No`)}`}
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
        </ProFormGroup>
      )}
      {project && project.projectType === 'baseMaintanance' && (
        <ProFormGroup>
          <ProFormGroup>
            <ProFormSelect
              disabled
              width={'xl'}
              label={`${t(`TRACE No`)}`}
              mode="tags"
              name="projectItemNumberID"
            ></ProFormSelect>
            <ProFormSelect
              showSearch
              // initialValue={['PART_PRODUCE']}
              name="taskType"
              label={t('TASK TYPE')}
              width="xl"
              valueEnum={{
                RC: {
                  text: t(
                    'RC (MPD, Customer MP, Access, CDCCL, ALI, STR inspection)'
                  ),
                },
                RC_ADD: { text: t('RC (Critical Task, Double Inspection)') },

                NRC: { text: t('NRC (AdHoc, Defect)') },
                MJC: { text: 'MJC (Extended MPD) ' },
                CMJC: { text: t('CMJC (Component maintenance) ') },
                FC: { text: t('FC (Fabrication card)') },
              }}
              // onChange={(value: any) => setTaskType(value)}
            />
            <>
              <ProFormGroup>
                {/* <ProFormText
                  width={'xl'}
                  name="taskNumber"
                  label={t('TASK NUMBER')}
                /> */}
                <ProFormSelect
                  showSearch
                  rules={[{ required: true }]}
                  width={'lg'}
                  name="taskNumberID"
                  label={`${t(`TASK No`)}`}
                  // value={partNumber}
                  onChange={(value, data) => {
                    // console.log(data);
                    form.setFields([
                      {
                        name: 'taskDescription',
                        value: data.data.taskDescription,
                      },
                      { name: 'amtoss', value: data.data.amtoss },
                      // { name: 'type', value: data.data.TYPE },
                      // { name: 'group', value: data.data.GROUP },
                    ]);
                  }}
                  options={Object.entries(taskValueEnum).map(([key, part]) => ({
                    label: part.taskNumber,
                    value: key,
                    data: part,
                  }))}
                />
                {/* <ProFormText width={'xs'} name="rev" label={t('REVISION')} /> */}
                {/* <ProFormDigit
                  width={'xs'}
                  name="allTaskTime"
                  label={t('MHS')}
                /> */}
                <ProFormTextArea
                  fieldProps={{
                    // style: { resize: 'none' },
                    rows: 4,
                  }}
                  width="xl"
                  name="taskDescription"
                  label={t('DESCRIPTION')}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                />
              </ProFormGroup>
              <ProFormTextArea
                width={'sm'}
                fieldProps={{
                  // style: { resize: 'none' },
                  rows: 2,
                }}
                name="amtoss"
                label={t('AMM')}
                rules={[
                  {
                    // required: true,
                  },
                ]}
              />
              {/* <ProFormSelect
                showSearch
                name="zonesID"
                mode={'multiple'}
                label={t('ZONES')}
                width="sm"
                // valueEnum={zonesValueEnum}
                // disabled={!acTypeID}
              />
              <ProFormSelect
                showSearch
                name="accessID"
                mode={'multiple'}
                label={t('ACCESS')}
                width="sm"
                // valueEnum={accessCodesValueEnum}
                // disabled={!acTypeID}
              />
              <ProFormSelect
                showSearch
                name="code"
                label={t('TASK CODE')}
                width="sm"
                // valueEnum={taskCodesValueEnum}
                // disabled={!acTypeID}
              />
              <ProFormTextArea
                fieldProps={{
                  style: { resize: 'none' },
                  rows: 1,
                }}
                name="note"
                label={t('REMARKS')}
                width="lg"
              /> */}
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
            </>
          </ProFormGroup>
        </ProFormGroup>
      )}
    </ProForm>
  );
};

export default ProjectWPAdministrationForm;
