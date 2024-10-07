import { ProFormDatePicker } from '@ant-design/pro-components';
import ProForm, { ProFormGroup, ProFormText } from '@ant-design/pro-form';
import { Button, Divider, Form, FormInstance } from 'antd';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getFilteredProjects } from '@/utils/api/thunks';

type ProjectDescriptionType = {
  project: any | null;
  onProjectSearch?: (orders: any | null) => void;
};
const ProjectDescription: FC<ProjectDescriptionType> = ({
  project,
  onProjectSearch,
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formRef = useRef<FormInstance>(null);
  useEffect(() => {
    if (project) {
      // onSelectSelectedStore && onSelectSelectedStore(selectedStore);
      form.setFields([
        { name: 'projectNumber', value: project?.projectWO },
        { name: 'lastModificateBy', value: project?.updateUserSing },
        { name: 'modificationDate', value: project?.updateDate },
        { name: 'createBy', value: project.createBySing },
        { name: 'createDate', value: project.createDate },
      ]);

      // onFilterTransferprojects(form.getFieldsValue());
    }
  }, [project]);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  return (
    <div className="flex flex-col ">
      <ProForm
        formRef={formRef}
        submitter={false}
        form={form}
        size="small"
        layout="horizontal"
        className="bg-white px-4 py-3 rounded-md border-gray-400"
      >
        <ProFormGroup>
          <ProFormText
            name="projectSearch"
            width="sm"
            label={t('PROJECT No')}
            fieldProps={{
              onPressEnter: async () => {
                const currentCompanyID =
                  localStorage.getItem('companyID') || '';
                if (form.getFieldValue('projectSearch')) {
                  const result = await dispatch(
                    getFilteredProjects({
                      companyID: currentCompanyID,
                      projectWO: form.getFieldValue('projectSearch'),
                    })
                  );
                  if (result.meta.requestStatus === 'fulfilled') {
                    onProjectSearch && onProjectSearch(result.payload[0] || {});
                  } else {
                    form.resetFields();
                  }
                }
              },
              autoFocus: true,
            }}
          ></ProFormText>
          <Button
            type="primary"
            // disabled={!form.getFieldValue('order')}
            onClick={async () => {
              const currentCompanyID = localStorage.getItem('companyID') || '';
              if (form.getFieldValue('projectSearch')) {
                const result = await dispatch(
                  getFilteredProjects({
                    companyID: currentCompanyID,
                    projectWO: form.getFieldValue('projectSearch'),
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  onProjectSearch && onProjectSearch(result.payload[0] || {});
                } else {
                  form.resetFields();
                }
              }
            }}
          >
            {t('LOAD')}
          </Button>
        </ProFormGroup>
        <Divider className="my-0 py-0 pb-5"></Divider>
        <ProFormGroup>
          <ProFormText
            disabled
            label={t('PROJECT No')}
            name="projectNumber"
            width="sm"
          ></ProFormText>
          <ProFormText
            disabled
            name="createBy"
            width="sm"
            label={t('CREATE BY')}
          ></ProFormText>
          <ProFormDatePicker
            disabled
            label={t('CREATE DATE')}
            name="createDate"
            width="sm"
          ></ProFormDatePicker>
        </ProFormGroup>
        <ProFormGroup>
          <ProFormText
            disabled
            label={t('LAST MODIFIED BY')}
            name="lastModificateBy"
            width="sm"
          ></ProFormText>

          <ProFormDatePicker
            disabled
            label={t('MODIFICATION DATE')}
            name="modificationDate"
            width="sm"
          ></ProFormDatePicker>
        </ProFormGroup>
      </ProForm>
    </div>
  );
};

export default ProjectDescription;
