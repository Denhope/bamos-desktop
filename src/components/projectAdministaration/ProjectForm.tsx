// @ts-nocheck

import React, { FC, useEffect, useState } from 'react';
import { ProForm, ProFormText, ProFormGroup } from '@ant-design/pro-form';
import { Button, Empty, Modal, Tabs, Upload, message, Col, Space } from 'antd';
import { UploadOutlined, ProjectOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { deleteFile, uploadFileServer } from '@/utils/api/thunks';
import {
  useAddProjectItemWOMutation,
  useAddProjectPanelsMutation,
} from '@/features/projectItemWO/projectItemWOApi';
import {
  ProFormDatePicker,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { IProject } from '@/models/IProject';
import { useGetProjectTypesQuery } from '../projectTypeAdministration/projectTypeApi';
import ProjectWPAdmin from './projectWP/ProjectWPAdmin';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { handleFileOpen, handleFileSelect } from '@/services/utilites';
import { COMPANY_ID } from '@/utils/api/http';
import { useAppDispatch } from '@/hooks/useTypedSelector';

import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
// import { useGetPlanesQuery } from '@/features/ACAdministration/acApi';
import { useGetPlanesQuery } from '@/features/acAdministration/acApi';
import { useGetCompaniesQuery } from '@/features/companyAdministration/companyApi';
import { useGetfilteredWOQuery } from '@/features/wpAdministration/wpApi';
import ProjectTestWPAdmin from './projectWP/ProjectTestWPAdmin';
import FileListE from '../userAdministration/taskAdministration/FileList.tsx';
interface UserFormProps {
  project?: IProject;
  onSubmit: (project: IProject) => void;
  onDelete?: (projectId: string) => void;
}

const ProjectForm: FC<UserFormProps> = ({ project, onSubmit }) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const handleSubmit = async (values: IProject) => {
    const newUser: IProject = project
      ? { ...project, ...values }
      : {
          ...values,
          status: form.getFieldValue('status')[0],
          // acTypeID: selectedAcTypeID,
        };
    onSubmit(newUser);
  };

  const { data: projectTypes, isLoading } = useGetProjectTypesQuery({});
  const { data: planes } = useGetPlanesQuery({});

  // Инициализация состояния для хранения выбранного acTypeID
  const [selectedAcTypeID, setSelectedAcTypeID] = useState<string>('');
  const { data: stores } = useGetStoresQuery({});
  const { data: companies } = useGetCompaniesQuery({});
  const [addPanels] = useAddProjectPanelsMutation({});
  const {
    data: wp,
    isLoading: isLoadingWP,
    isFetching,
  } = useGetfilteredWOQuery({});
  // Формирование объекта planesValueEnum
  const planesValueEnum: Record<string, { text: string; value: string }> =
    planes?.reduce((acc, reqType) => {
      // Check if reqType.acTypeID exists and has at least one element
      if (reqType.acTypeID && reqType.acTypeID.length > 0) {
        acc[reqType.id] = { text: reqType.regNbr, value: reqType.acTypeID[0] };
      } else {
        // If reqType.acTypeID is undefined or empty, set value to an empty string or handle it as appropriate for your use case
        acc[reqType.id] = { text: reqType.regNbr, value: '' };
      }
      return acc;
    }, {}) || {};

  const storeCodesValueEnum: Record<string, string> =
    stores?.reduce((acc, mpdCode) => {
      if (mpdCode.id && mpdCode.storeShortName) {
        acc[mpdCode.id] = `${String(mpdCode.storeShortName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};

  // const projectTypesValueEnum: Record<string, string> =
  //   projectTypes?.reduce((acc, reqType) => {
  //     acc[reqType.id] = reqType.code;
  //     return acc;
  //   }, {}) || {};

  const companiesCodesValueEnum: Record<string, string> =
    companies?.reduce<Record<string, string>>((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.companyName;
      return acc;
    }, {}) || {};
  useEffect(() => {
    if (project) {
      form.resetFields();
      form.setFieldsValue(project);
      form.setFieldsValue({ planeId: project?.planeId?._id });
    } else {
      form.resetFields();
    }
  }, [project, form]);

  const handleUpload = async (file: File) => {
    if (!project || !project?._id) {
      console.error(
        'Невозможно загрузить файл: компания не существует или не имеет id'
      );
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await uploadFileServer(formData);

      if (response) {
        const updatedproject: IProject = {
          ...project,
          FILES: response,
        };
        const updatedOrderItem = {
          ...project,
          FILES: [...(project?.FILES || []), response],
        };
        updatedOrderItem && project && onSubmit(updatedOrderItem);
      } else {
        message.error('Ошибка при загрузке файла: неверный ответ сервера');
      }
    } catch (error) {
      message.error('Ошибка при загрузке файла');
      throw error;
    }
  };
  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {project ? t('UPDATE') : t('CREATE')}
    </Button>
  );
  const [activeTabKey, setActiveTabKey] = useState('1'); // Default to the first tab
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const dispatch = useAppDispatch();
  useEffect(() => {
    setShowSubmitButton(activeTabKey === '1');
  }, [activeTabKey]);
  const [reqTypeID, setReqTypeID] = useState<any>('');
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
              project &&
              project?.FILES &&
              project?.FILES.filter((f) => f.id !== file.id);
            const updatedOrderItem = {
              ...project,
              FILES: updatedFiles,
            };
            // await updateProjectItem(updatedOrderItem).unwrap();
            project && onSubmit(updatedOrderItem);
          } else {
            throw new Error('Не удалось удалить файл');
          }
        } catch (error) {
          message.error('ERROR');
        }
      },
    });
  };
  const handleDownload = (file: any) => {
    // Здесь должен быть код для скачивания файла

    handleFileOpen(file);
  };

  const wpValueEnum: Record<string, string> =
    wp?.reduce((acc, wp) => {
      if (wp._id && wp?.WOName) {
        acc[wp._id] = `№:${wp?.WONumber}/${String(wp?.WOName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};
  return (
    <ProForm
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => {
          if (showSubmitButton) {
            return [<SubmitButton key="submit" />, dom.reverse()[1]];
          }
          return null;
        },
      }}
      initialValues={project}
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
          <div className=" h-[57vh] flex flex-col overflow-auto">
            <ProFormGroup>
              <ProFormSelect
                showSearch
                disabled={!project}
                rules={[{ required: true }]}
                name="status"
                label={t('WO STATUS')}
                width="sm"
                initialValue={['DRAFT']}
                valueEnum={{
                  DRAFT: { text: t('DRAFT'), status: 'DRAFT' },
                  OPEN: { text: t('OPEN'), status: 'Processing' },
                  inProgress: { text: t('IN PROGRESS'), status: 'PROGRESS' },
                  // PLANNED: { text: t('PLANNED'), status: 'Waiting' },
                  COMPLETED: { text: t('COMPLETED'), status: 'Default' },
                  CLOSED: { text: t('CLOSE'), status: 'SUCCESS' },
                  CANCELLED: { text: t('CANCEL'), status: 'Error' },
                }}
              />
              <ProFormSelect
                showSearch
                rules={[{ required: true }]}
                name="WOReferenceID"
                label={t('WP No')}
                width="lg"
                valueEnum={wpValueEnum || []}
                // disabled={!projectId}
              />
            </ProFormGroup>

            <ProFormSelect
              showSearch
              // disabled={!project}
              rules={[{ required: true }]}
              name="projectType"
              label={t('WO TYPE')}
              width="lg"
              // initialValue={['baseMaintanance']}
              valueEnum={{
                baseMaintanance: {
                  text: t('BASE MAINTENANCE'),
                },
                lineMaintanance: {
                  text: t('LINE MAINTENANCE'),
                },

                // PLANNED: { text: t('PLANNED'), status: 'Waiting' },
                // repairPart: { text: t('REPAIR COMPONENT') },
                // repairAC: { text: t('REPAIR AC') },
                partCange: { text: t('COMPONENT CHANGE') },
                addWork: { text: t('ADD WORK') },
                enginiring: { text: t('ENGINEERING SERVICES') },
                nonProduction: { text: t('NOT PRODUCTION SERVICES') },
                // production: { text: t('PRODUCTION PART') },
              }}
            />
            {/* <ProFormSelect
            showSearch
            name="projectTypesID"
            label={t('PROJECT TYPE')}
            width="lg"
            valueEnum={projectTypesValueEnum}
            onChange={(value: any) => setReqTypeID(value)}
            // disabled={!acTypeID} // Disable the select if acTypeID is not set
          /> */}
            <ProFormGroup>
              <ProFormText
                width={'lg'}
                name="projectName"
                label={t('TITLE')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
              {/* <ProFormText
              width={'sm'}
              name="code"
              label={t('CODE')}
              rules={[
                {
                  required: true,
                },
              ]}
            /> */}

              {/* <ProFormText
                width={'xl'}
                name="description"
                label={t('DESCRIPTION')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              /> */}

              <ProFormGroup>
                <ProFormDatePicker
                  label={t('PLANNED START DATE')}
                  name="planedStartDate"
                  width="sm"
                ></ProFormDatePicker>
                <ProFormDatePicker
                  // disabled
                  label={t('START DATE')}
                  name="startDate"
                  width="sm"
                ></ProFormDatePicker>
              </ProFormGroup>
              <ProFormGroup>
                <ProFormDatePicker
                  label={t('PLANNED FINISH DATE')}
                  name="planedFinishDate"
                  width="sm"
                ></ProFormDatePicker>
                <ProFormDatePicker
                  // disabled
                  label={t('FINISH DATE')}
                  name="finishDate"
                  width="sm"
                ></ProFormDatePicker>
              </ProFormGroup>
              <ProFormGroup>
                <ProFormSelect
                  showSearch
                  mode="multiple"
                  name="storesID"
                  label={t('STORE FOR PARTS')}
                  width="lg"
                  valueEnum={storeCodesValueEnum || []}
                  // onChange={handleStoreChange}
                />
              </ProFormGroup>
              <ProFormGroup>
                <ProFormText
                  width={'xl'}
                  fieldProps={{ style: { resize: 'none' } }}
                  name="customerWO"
                  label={t('CUSTOMER WO No')}
                />
                {/* <ProFormSelect
                  showSearch
                  rules={[{ required: true }]}
                  name="customerID"
                  label={t('CUSTOMER')}
                  width="lg"
                  valueEnum={companiesCodesValueEnum || []}
                  // disabled={!projectId}
                />
                <ProFormSelect
                  showSearch
                  name="planeId"
                  label={t('PROJECT A/C')}
                  width="sm"
                  valueEnum={planesValueEnum}
                  onChange={(value: any) => setSelectedAcTypeID(value)}
                  // disabled={!acTypeID} // Disable the select if acTypeID is not set
                /> */}
              </ProFormGroup>
              <ProFormTextArea
                width={'xl'}
                fieldProps={{
                  style: {
                    resize: 'none',
                  },
                  rows: 2,
                  // This is the correct way to set colSize within fieldProps
                }}
                name="remarks"
                label={t('REMARKS')}
              />
              <ProForm.Item label={t('UPLOAD')}>
                <div className="overflow-y-auto max-h-64">
                  <Upload
                    name="FILES"
                    fileList={project?.FILES || []}
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
            </ProFormGroup>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('CHECK TASKS IN DATABASE')} key="2">
          {project && project?._id ? (
            <ProjectTestWPAdmin
              project={project}
              projectID={project?._id}
            ></ProjectTestWPAdmin>
          ) : (
            <Empty />
          )}
        </Tabs.TabPane>
        {/* <Tabs.TabPane tab={t('TASK LIST')} key="3">
          {project && project?._id ? (
            <ProjectWPAdmin
              project={project}
              projectID={project?._id}
            ></ProjectWPAdmin>
          ) : (
            <Empty />
          )}
        </Tabs.TabPane> */}
      </Tabs>
    </ProForm>
  );
};
export default ProjectForm;
