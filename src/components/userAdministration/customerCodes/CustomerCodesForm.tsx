//@ts-nocheck

import React, { FC, useEffect, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-form';
import { Button, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { IRequirementType } from '@/models/AC';
import { ProFormTextArea } from '@ant-design/pro-components';
import PermissionGuard, { Permission } from '@/components/auth/PermissionGuard';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';

interface IRequirementTypeFormProps {
  reqType: IRequirementType | undefined;
  onSubmit: (reqType: IRequirementType) => void;
  onDelete?: (reqTypeId: string) => void;
  onAcTypeChange: (acTypeId: string) => void;
}

const CertificatesForm: FC<IRequirementTypeFormProps> = ({
  reqType,
  onSubmit,
  onAcTypeChange,
}) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const { data: acTypes, isLoading: acTypesLoading } = useGetACTypesQuery({});

  const handleSubmit = async (values: IRequirementType) => {
    const newUser: IRequirementType = reqType
      ? { ...reqType, ...values }
      : { ...values };
    onSubmit(newUser);
  };

  const [showSubmitButton, setShowSubmitButton] = useState(true);

  const handleTabChange = (activeKey: string) => {
    setShowSubmitButton(activeKey === '1');
  };

  useEffect(() => {
    if (reqType) {
      form.resetFields();
      form.setFieldsValue(reqType || {});
    } else {
      form.resetFields();
    }
  }, [reqType?.id, form]);

  const SubmitButton = () => (
    <PermissionGuard requiredPermissions={[Permission.REQUIREMENT_ACTIONS]}>
      <Button type="primary" htmlType="submit">
        {reqType ? t('UPDATE') : t('CREATE')}
      </Button>
    </PermissionGuard>
  );
  const [acTypeID, setACTypeID] = useState<any>(reqType?.acTypeId || '');

  const acTypeValueEnum: Record<string, string> =
    acTypes?.reduce((acc, acType) => {
      acc[acType.id] = acType.name;
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
      layout="horizontal"
    >
      <Tabs defaultActiveKey="1" type="card" onChange={handleTabChange}>
        <Tabs.TabPane tab={t('INFORMATION')} key="1">
          <ProFormGroup>
            <ProFormGroup>
              <ProFormText
                width={'sm'}
                name="prefix"
                label={t('CODE')}
                rules={[{ required: true }]}
              />
              <ProFormSelect
                showSearch
                name="acTypeId"
                label={t('AC TYPE')}
                width="lg"
                valueEnum={acTypeValueEnum}
                onChange={(value: any) => setACTypeID(value)}
              />
              <ProFormTextArea
                width={'xl'}
                fieldProps={{ style: { resize: 'none' } }}
                name="remarks"
                label={t('REMARKS')}
              />
            </ProFormGroup>
            <ProFormGroup>
              <ProFormSelect
                showSearch
                name="status"
                label={t('STATUS')}
                width="sm"
                valueEnum={{
                  ACTIVE: { text: t('ACTIVE'), status: 'SUCCESS' },
                  INACTIVE: { text: t('INACTIVE'), status: 'Error' },
                }}
              />
            </ProFormGroup>
          </ProFormGroup>
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};

export default CertificatesForm;
