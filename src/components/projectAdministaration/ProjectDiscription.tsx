import { useAppDispatch } from '@/hooks/useTypedSelector';
import { IProject } from '@/models/IProject';

import {
  ModalForm,
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Divider, Form, FormInstance, message } from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type projectsDiscriptionType = {
  project: IProject | null;
  onprojectSearch?: (orders: any | null) => void;
};

const ProjectDiscription: FC<projectsDiscriptionType> = ({
  project,
  onprojectSearch,
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
        { name: 'lastModificateBy', value: project?.updateUserID?.name },
        { name: 'modificationDate', value: project?.updateDate },
        { name: 'createBy', value: project?.createUserID?.name },
        { name: 'createDate', value: project.createDate },
      ]);

      // onFilterTransferprojects(form.getFieldsValue());
    }
  }, [project]);
  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const [selectedproject, setRequariment] = useState<any | null>(null);
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

export default ProjectDiscription;
