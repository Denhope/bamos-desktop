import React, { FC, useEffect } from 'react';
import { ProForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-form';

import {
  ProFormGroup,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';
import { IRequirementCode } from '@/models/AC';

interface UserFormProps {
  reqCode?: IRequirementCode;
  onSubmit: (reqCode: IRequirementCode) => void;
  onDelete?: (reqCodeId: string) => void;
}

const ReqCodesAdministrationForm: FC<UserFormProps> = ({
  reqCode,
  onSubmit,
}) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const handleSubmit = async (values: IRequirementCode) => {
    const newUser: IRequirementCode = reqCode
      ? { ...reqCode, ...values }
      : { ...values, companyID: localStorage.getItem('companyID') || '' };
    onSubmit(newUser);
  };
  useEffect(() => {
    if (reqCode) {
      form.resetFields();
      form.setFieldsValue(reqCode);
    } else {
      form.resetFields();
    }
  }, [reqCode, form]);
  return (
    <ProForm
      size="small"
      form={form}
      onFinish={handleSubmit}
      // submitter={false}
      initialValues={reqCode}
      layout="horizontal"
    >
      <ProForm.Group>
        <ProForm.Group>
          <ProFormText
            width={'lg'}
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
          <ProFormTextArea
            width={'xl'}
            fieldProps={{
              style: {
                resize: 'none',
              },
              rows: 12,
              // This is the correct way to set colSize within fieldProps
            }}
            name="description"
            label="DESCRIPTION"
            rules={[
              {
                required: true,
              },
            ]}
          />
          <ProFormGroup>
            <ProFormSelect
              showSearch
              name="status"
              label={t('STATE')}
              width="sm"
              valueEnum={{
                ACTIVE: { text: t('ACTIVE'), status: 'SUCCESS' },
                INACTIVE: { text: t('INACTIVE'), status: 'Error' },
              }}
            />
          </ProFormGroup>
        </ProForm.Group>
      </ProForm.Group>

      {/* <ProForm.Item>
        <Button type="primary" htmlType="submit">
          {reqCode ? 'Update' : 'Create'}
        </Button>
      </ProForm.Item> */}
    </ProForm>
  );
};
export default ReqCodesAdministrationForm;
