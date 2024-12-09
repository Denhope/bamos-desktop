// @ts-nocheck

import React, { FC, useEffect, useReducer, useMemo } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormGroup,
  ProFormCheckbox,
} from '@ant-design/pro-form';
import { Button, Empty, Modal, Tabs, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { deleteFile, uploadFileServer } from '@/utils/api/thunks';
import {
  ProFormDatePicker,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { IProject } from '@/models/IProject';
import { useGetProjectTypesQuery } from '../projectTypeAdministration/projectTypeApi';
import ProjectTestWPAdmin from './projectWP/ProjectTestWPAdmin';
import { handleFileOpen, handleFileSelect } from '@/services/utilites';
import { COMPANY_ID } from '@/utils/api/http';
import { useAppDispatch } from '@/hooks/useTypedSelector';

import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
import { useGetPlanesQuery } from '@/features/acAdministration/acApi';
import { useGetCompaniesQuery } from '@/features/companyAdministration/companyApi';
import { useGetfilteredWOQuery } from '@/features/wpAdministration/wpApi';

// Определение типа состояния
interface FormState {
  selectedAcTypeID: string;
  activeTabKey: string;
  showSubmitButton: boolean;
  reqTypeID: string;
}

// Определение ействий
type FormAction =
  | { type: 'SET_AC_TYPE_ID'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_SHOW_SUBMIT'; payload: boolean }
  | { type: 'SET_REQ_TYPE_ID'; payload: string };

// Редуктор
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_AC_TYPE_ID':
      return { ...state, selectedAcTypeID: action.payload };
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTabKey: action.payload,
        showSubmitButton: action.payload === '1',
      };
    case 'SET_SHOW_SUBMIT':
      return { ...state, showSubmitButton: action.payload };
    case 'SET_REQ_TYPE_ID':
      return { ...state, reqTypeID: action.payload };
    default:
      return state;
  }
}

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

  // Инициализация состояния с использованием useReducer
  const [state, dispatch] = useReducer(formReducer, {
    selectedAcTypeID: '',
    activeTabKey: '1',
    showSubmitButton: true,
    reqTypeID: '',
  });

  const { data: stores } = useGetStoresQuery({});
  const { data: companies } = useGetCompaniesQuery({});
  const {
    data: wp,
    isLoading: isLoadingWP,
    isFetching,
  } = useGetfilteredWOQuery({});
  // Формирование объекта planesValueEnum
  const planesValueEnum = useMemo(
    () =>
      planes?.reduce((acc, reqType) => {
        if (reqType.acTypeID && reqType.acTypeID.length > 0) {
          acc[reqType.id] = {
            text: reqType.regNbr,
            value: reqType.acTypeID[0],
          };
        } else {
          acc[reqType.id] = { text: reqType.regNbr, value: '' };
        }
        return acc;
      }, {}) || {},
    [planes]
  );

  const storeCodesValueEnum = useMemo(
    () =>
      stores?.reduce((acc, mpdCode) => {
        if (mpdCode.id && mpdCode.storeShortName) {
          acc[mpdCode.id] = `${String(mpdCode.storeShortName).toUpperCase()}`;
        }
        return acc;
      }, {} as Record<string, string>) || {},
    [stores]
  );

  // const projectTypesValueEnum: Record<string, string> =
  //   projectTypes?.reduce((acc, reqType) => {
  //     acc[reqType.id] = reqType.code;
  //     return acc;
  //   }, {}) || {};

  const companiesCodesValueEnum = useMemo(
    () =>
      companies?.reduce<Record<string, string>>((acc, mpdCode) => {
        acc[mpdCode.id] = mpdCode.companyName;
        return acc;
      }, {}) || {},
    [companies]
  );
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
    if (!project?._id) {
      message.error(
        'Невозможно загрузить файл: проект не существует или не имеет id'
      );
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await uploadFileServer(formData);

      if (response) {
        const updatedOrderItem = {
          ...project,
          FILES: [...(project?.FILES || []), response],
        };
        onSubmit(updatedOrderItem);
      } else {
        throw new Error('Неверный ответ сервера');
      }
    } catch (error) {
      message.error(
        `Ошибка при загрузке файла: ${
          error instanceof Error ? error.message : 'Неизвестная ошибка'
        }`
      );
    }
  };
  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {project ? t('UPDATE') : t('CREATE')}
    </Button>
  );
  interface File {
    id: string;
    name: string;
  }

  const handleDelete = (file: File) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить этот файл?',
      onOk: async () => {
        try {
          const appDispatch = useAppDispatch();
          const response = await appDispatch(
            deleteFile({ id: file.id, companyID: COMPANY_ID })
          );
          if (response.meta.requestStatus === 'fulfilled') {
            const updatedFiles =
              project?.FILES?.filter((f) => f.id !== file.id) || [];
            const updatedOrderItem = {
              ...project,
              FILES: updatedFiles,
            };
            project && onSubmit(updatedOrderItem);
          } else {
            throw new Error('Не удалось удалить файл');
          }
        } catch (error) {
          message.error('Ошибка при удалении файла');
        }
      },
    });
  };
  const handleDownload = (file: any) => {
    // Здесь должен быть код для скачивания файла

    handleFileOpen(file);
  };

  const wpValueEnum = useMemo(
    () =>
      wp?.reduce((acc, wp) => {
        if (wp._id && wp?.WOName) {
          acc[wp._id] = `№:${wp?.WONumber}/${String(wp?.WOName).toUpperCase()}`;
        }
        return acc;
      }, {} as Record<string, string>) || {},
    [wp]
  );
  return (
    <ProForm
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => {
          if (state.showSubmitButton) {
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
          dispatch({ type: 'SET_ACTIVE_TAB', payload: key });
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
                />
                <ProFormDatePicker
                  label={t('START DATE')}
                  name="startDate"
                  width="sm"
                />
                <ProFormDatePicker
                  label={t('CREATION DATE')}
                  name="createDate"
                  width="sm"
                />
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
                <ProFormSelect
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
                />
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
