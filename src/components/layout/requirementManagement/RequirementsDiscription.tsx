import { useAppDispatch } from '@/hooks/useTypedSelector';
import { getFilteredRequirementsManager } from '@/utils/api/thunks';
import {
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Divider, Form, FormInstance } from 'antd';
import React, { FC, useEffect, useRef } from 'react';
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
  return (
    <div className="flex flex-col gap-5">
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
            name="requirementSearch"
            width="sm"
            label={t('REQUIREMENT No')}
            fieldProps={{
              onPressEnter: async () => {
                const currentCompanyID =
                  localStorage.getItem('companyID') || '';
                if (form.getFieldValue('requirementSearch')) {
                  const result = await dispatch(
                    getFilteredRequirementsManager({
                      companyID: currentCompanyID,
                      partRequestNumber:
                        form.getFieldValue('requirementSearch'),
                    })
                  );
                  if (result.meta.requestStatus === 'fulfilled') {
                    onRequirementSearch &&
                      onRequirementSearch(result.payload[0] || {});
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
              if (form.getFieldValue('requirementSearch')) {
                const result = await dispatch(
                  getFilteredRequirementsManager({
                    companyID: currentCompanyID,
                    partRequestNumber: form.getFieldValue('requirementSearch'),
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  onRequirementSearch &&
                    onRequirementSearch(result.payload[0] || {});
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
