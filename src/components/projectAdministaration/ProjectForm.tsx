// @ts-nocheck

import React, { FC, useEffect, useState } from 'react';
import { ProForm, ProFormText, ProFormGroup } from '@ant-design/pro-form';
import { Button, Tabs, Upload, message } from 'antd';

import { useTranslation } from 'react-i18next';
import { uploadFileServer } from '@/utils/api/thunks';

import {
  ProFormDatePicker,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { IProject } from '@/models/IProject';
import { useGetProjectTypesQuery } from '../projectTypeAdministration/projectTypeApi';

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
      : { ...values, status: form.getFieldValue('status')[0] };
    onSubmit(newUser);
  };
  const { data: projectTypes, isLoading } = useGetProjectTypesQuery({});
  const projectTypesValueEnum: Record<string, string> =
    projectTypes?.reduce((acc, reqType) => {
      acc[reqType.id] = reqType.code;
      return acc;
    }, {}) || {};
  useEffect(() => {
    if (project) {
      form.resetFields();
      form.setFieldsValue(project);
    } else {
      form.resetFields();
    }
  }, [project, form]);

  const handleUpload = async (file: File) => {
    if (!project || !project.id) {
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

        onSubmit({ ...project, FILES: response });
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
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const [reqTypeID, setReqTypeID] = useState<any>('');

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
      <Tabs defaultActiveKey="1" type="card">
        <Tabs.TabPane tab={t('MAIN')} key="1">
          <ProFormSelect
            showSearch
            disabled={!project}
            rules={[{ required: true }]}
            name="status"
            label={t('PROJECT STATE')}
            width="sm"
            initialValue={['DRAFT']}
            valueEnum={{
              DRAFT: { text: t('DRAFT'), status: 'DRAFT' },
              OPEN: { text: t('OPEN'), status: 'Processing' },
              inProgress: { text: t('PROGRESS'), status: 'PROGRESS' },
              PLANNED: { text: t('PLANNED'), status: 'Waiting' },
              COMPLETED: { text: t('COMPLETED'), status: 'Default' },
              CLOSED: { text: t('CLOSED'), status: 'SUCCESS' },
              CANCELLED: { text: t('CANCELLED'), status: 'Error' },
            }}
          />
          <ProFormSelect
            showSearch
            name="projectTypesID"
            label={t('PROJECT TYPE')}
            width="lg"
            valueEnum={projectTypesValueEnum}
            onChange={(value: any) => setReqTypeID(value)}
            // disabled={!acTypeID} // Disable the select if acTypeID is not set
          />
          <ProFormGroup>
            <ProFormText
              width={'xl'}
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

            <ProFormText
              width={'xl'}
              name="description"
              label={t('DESCRIPTION')}
              rules={[
                {
                  required: true,
                },
              ]}
            />

            <ProFormGroup>
              <ProFormDatePicker
                label={t('PLANED START DATE')}
                name="planedStartDate"
                width="sm"
              ></ProFormDatePicker>
              <ProFormDatePicker
                disabled
                label={t('START DATE')}
                name="startDate"
                width="sm"
              ></ProFormDatePicker>
            </ProFormGroup>
            <ProFormGroup>
              <ProFormDatePicker
                label={t('PLANED FINISH DATE')}
                name="planedFinishDate"
                width="sm"
              ></ProFormDatePicker>
              <ProFormDatePicker
                disabled
                label={t('FINISH DATE')}
                name="finishDate"
                width="sm"
              ></ProFormDatePicker>
            </ProFormGroup>
            <ProFormTextArea
              width={'xl'}
              fieldProps={{ style: { resize: 'none' } }}
              name="remarks"
              label={t('REMARKS')}
            />
          </ProFormGroup>
        </Tabs.TabPane>
      </Tabs>

      {/* <ProForm.Item>
        <Button type="primary" htmlType="submit">
          {project ? 'Update' : 'Create'}
        </Button>
      </ProForm.Item> */}
    </ProForm>
  );
};
export default ProjectForm;
