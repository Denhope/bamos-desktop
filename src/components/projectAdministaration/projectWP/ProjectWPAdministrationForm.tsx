//@ts-nocheck

import { handleFileOpen, handleFileSelect } from '@/services/utilites';
import {
  deleteFile,
  uploadFileServer,
  uploadFileServerReference,
  deleteFileUploads,
} from '@/utils/api/thunks';
import {
  ProForm,
  ProFormDigit,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import {
  Upload,
  Button,
  message,
  Modal,
  Tabs,
  Empty,
  notification,
} from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadOutlined } from '@ant-design/icons';
import { IProjectItem } from '@/models/AC';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import {
  useUpdateProjectItemsMutation,
  useGetProjectItemsQuery,
} from '@/features/projectItemAdministration/projectItemApi';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { IProject } from '@/models/IProject';
import { useGetTaskCodeQuery } from '@/features/tasksAdministration/taskCodesApi';
import { useGetTasksQuery } from '@/features/tasksAdministration/tasksApi';
import FileListE from '@/components/userAdministration/taskAdministration/FileList.tsx';
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
          planeID: project?.planeId?._id,
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

  const { refetch: refetchProjectItems } = useGetProjectItemsQuery({
    projectID: project._id,
  });
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
  const handleDeleteUpload = (key: any) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить этот файл?',
      onOk: async () => {
        try {
          const response = await dispatch(
            deleteFileUploads({
              id: key,
              companyID: COMPANY_ID,
              type: 'projectItem',
              itemID: reqCode && reqCode.id,
            })
          );

          refetchProjectItems();
        } catch (error) {
          notification.error({
            message: t('ERROR'),
            description: t('Error delete files.'),
          });
        }
      },
    });
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
      console.error('Невозможно загрузить файл');
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
      notification.error({
        message: t('ERROR'),
        description: t('Error '),
      });
      throw error;
    }
  };

  const handleUploadReference = async (data: any) => {
    if (!reqCode || !reqCode.id) {
      console.error('Невозможно загрузить файл');
      return;
    }

    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('referenceType', data.referenceType);
    formData.append('taskNumber', data.taskNumber);
    formData.append('customerCodeID', data.customerCodeID);
    formData.append('onSavedReference', 'true');
    formData.append('projectItemID', reqCode.id);
    formData.append('fileName', data.file.name);
    formData.append('companyID', COMPANY_ID);
    formData.append('createDate', new Date().toISOString());
    formData.append('createUserID', USER_ID);

    try {
      const response = await uploadFileServerReference(formData);
      console.log('File uploaded successfully:', response.data);
      notification.success({
        message: t('success'),
        description: t(''),
      });

      refetchProjectItems();
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error .'),
      });
    }
  };

  const dispatch = useAppDispatch();
  const [activeTabKey, setActiveTabKey] = useState('1'); // Default to the first tab
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  return (
    <ProForm
      className="bg-gray-100 p-2 rounded"
      size="small"
      form={form}
      onFinish={handleSubmit}
      // submitter={false}
      initialValues={reqCode}
      layout="horizontal"
    >
      <Tabs
        onChange={(key) => {
          setActiveTabKey(key);
        }}
        defaultActiveKey="1"
        type="card"
      >
        <Tabs.TabPane tab={t('INFORMATION')} key="1">
          <div
            className=" h-[43vh]  rounded-md brequierement-gray-400  overflow-y-auto "
            // sm={19}
          >
            {project && project.projectType === 'production' && (
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
                            {
                              name: 'nameOfMaterial',
                              value: data.data.DESCRIPTION,
                            },
                            { name: 'unit', value: data.data.UNIT_OF_MEASURE },
                            { name: 'type', value: data.data.TYPE },
                            { name: 'group', value: data.data.GROUP },
                          ]);
                        }}
                        options={Object.entries(partValueEnum).map(
                          ([key, part]) => ({
                            label: part.PART_NUMBER,
                            value: key,
                            data: part,
                          })
                        )}
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
              label={t('STATUS')}
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
                      RC_ADD: {
                        text: t('RC (Critical Task, Double Inspection)'),
                      },

                      NRC: { text: t('NRC (Defect)') },
                      NRC_ADD: { text: t('ADHOC(Adhoc Task)') },
                      MJC: { text: t('MJC ((Extended MPD)') },
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
                        options={Object.entries(taskValueEnum).map(
                          ([key, part]) => ({
                            label: part.taskNumber,
                            value: key,
                            data: part,
                          })
                        )}
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
                      width={'lg'}
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
                        rows: 2,
                        // This is the correct way to set colSize within fieldProps
                      }}
                      name="notes"
                      label={t('REMARKS')}
                    />
                    <ProFormSelect
                      showSearch
                      name="status"
                      label={t('STATUS')}
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
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('DOCS')} key="5">
          <div>
            {reqCode ? (
              <div
              // className="ag-theme-alpine flex"
              // style={{ width: '100%', height: '60vh' }}
              >
                <FileListE
                  handleDelete={handleDeleteUpload}
                  initialFiles={reqCode.reference || []}
                  onAddFile={function (file: any): void {
                    handleUploadReference(file);
                  }}
                ></FileListE>
              </div>
            ) : (
              <Empty />
            )}
          </div>
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};

export default ProjectWPAdministrationForm;
