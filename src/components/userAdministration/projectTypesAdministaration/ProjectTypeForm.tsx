import React, { FC, useEffect, useState } from 'react';
import { ProForm, ProFormText, ProFormGroup } from '@ant-design/pro-form';
import { Button, Tabs, Upload, message } from 'antd';

import { useTranslation } from 'react-i18next';
import { uploadFileServer } from '@/utils/api/thunks';

import { ProFormTextArea } from '@ant-design/pro-components';
import { IProjectType } from '@/models/AC';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';

interface UserFormProps {
  project?: IProjectType;
  onSubmit: (project: IProjectType) => void;
  onDelete?: (projectId: string) => void;
}

const ProjectTypeForm: FC<UserFormProps> = ({ project, onSubmit }) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const handleSubmit = async (values: IProjectType) => {
    const newUser: IProjectType = project
      ? { ...project, ...values }
      : { ...values };
    onSubmit(newUser);
  };
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
        const updatedproject: IProjectType = {
          ...project,
          files: response,
        };

        onSubmit({ ...project, files: response });
      } else {
        message.error('Ошибка при загрузке файла: неверный ответ сервера');
      }
    } catch (error) {
      message.error('Ошибка при загрузке файла');
      throw error;
    }
  };
  const SubmitButton = () => (
    <PermissionGuard requiredPermissions={[Permission.WP_ACTIONS]}>
      <Button type="primary" htmlType="submit">
        {project ? t('UPDATE') : t('CREATE')}
      </Button>
    </PermissionGuard>
  );
  const [showSubmitButton, setShowSubmitButton] = useState(true);
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
        <Tabs.TabPane tab={t('INFORMATION')} key="1">
          <ProFormGroup>
            <ProFormText
              width={'xl'}
              name="title"
              label={t('TITLE')}
              rules={[
                {
                  required: true,
                },
              ]}
            />
            <ProFormText
              width={'sm'}
              name="code"
              label={t('CODE')}
              rules={[
                {
                  required: true,
                },
              ]}
            />

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
export default ProjectTypeForm;
