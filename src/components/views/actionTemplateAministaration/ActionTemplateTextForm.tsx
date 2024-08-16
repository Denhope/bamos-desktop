import React, { FC, useEffect, useState } from 'react';
import { ProForm, ProFormText, ProFormGroup } from '@ant-design/pro-form';
import { Button, Tabs, Upload, message } from 'antd';

import { useTranslation } from 'react-i18next';
import { uploadFileServer } from '@/utils/api/thunks';

import { ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { IProjectType } from '@/models/AC';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import { useGetSkillsQuery } from '@/features/userAdministration/skillApi';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';

interface UserFormProps {
  project?: IProjectType;
  onSubmit: (project: IProjectType) => void;
  onDelete?: (projectId: string) => void;
}

const ActionTemplateTextForm: FC<UserFormProps> = ({ project, onSubmit }) => {
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
      form.setFieldsValue({
        ...project,
        skillCodeID: project.skillCodeID?.map((skill: any) => skill._id),
        acTypeID: project.acTypeID?.map((acType: any) => acType._id),
      });
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
  const { data: usersSkill } = useGetSkillsQuery({});
  const { data: acTypes } = useGetACTypesQuery({});
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const groupSlills = usersSkill?.map((skill: any) => ({
    label: skill?.code,
    value: skill?.id, // Use the _id as the value
  }));
  const acTypesGroup = acTypes?.map((skill: any) => ({
    label: skill?.code,
    value: skill?.id, // Use the _id as the value
  }));

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
            <ProFormGroup>
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
              <ProFormSelect
                name="skillCodeID"
                mode="multiple"
                width={'sm'}
                label={t('SKILL')}
                options={groupSlills}
                rules={[{ required: true }]}
              />
              <ProFormSelect
                width={'sm'}
                mode="multiple"
                name="acTypeID"
                label={t('AC TYPE')}
                options={acTypesGroup}
                rules={[{ required: true }]}
              />
              <ProFormSelect
                width={'sm'}
                name="type"
                label={t('TEMPLATE TYPE')}
                options={[
                  { label: t('ACTION'), value: 'action' },
                  { label: t('STEP'), value: 'step' },
                ]}
                rules={[{ required: true }]}
              />
            </ProFormGroup>

            <ProFormTextArea
              width={'xl'}
              name="description"
              label={t('DESCRIPTION')}
              rules={[
                {
                  required: true,
                },
              ]}
              fieldProps={{
                rows: 18,
              }}
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
export default ActionTemplateTextForm;
