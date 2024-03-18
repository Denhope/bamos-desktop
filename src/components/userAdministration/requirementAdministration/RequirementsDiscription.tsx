import { useAppDispatch } from '@/hooks/useTypedSelector';
import { getFilteredRequirementsManager } from '@/utils/api/thunks';
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

type RequirementsDiscriptionType = {
  requirement: any | null;
  onRequirementSearch?: (orders: any | null) => void;
};

const RequirementsDiscription: FC<RequirementsDiscriptionType> = ({
  requirement,
  onRequirementSearch,
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formRef = useRef<FormInstance>(null);
  useEffect(() => {
    if (requirement) {
      // onSelectSelectedStore && onSelectSelectedStore(selectedStore);
      form.setFields([
        { name: 'partRequestNumber', value: requirement?.partRequestNumber },
        { name: 'lastModificateBy', value: requirement?.updateBy },
        { name: 'modificationDate', value: requirement?.updateDate },
        { name: 'createBy', value: requirement.createBy },
        { name: 'createDate', value: requirement.createDate },
      ]);

      // onFilterTransferprojects(form.getFieldsValue());
    }
  }, [requirement]);
  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const [selectedRequirement, setRequariment] = useState<any | null>(null);
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
            label={t('REQUIREMENT No')}
            name="partRequestNumber"
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

export default RequirementsDiscription;
