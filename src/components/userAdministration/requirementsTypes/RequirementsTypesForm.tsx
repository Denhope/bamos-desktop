import React, { FC, useEffect, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-form';
import { Button, Col, Empty, Row, Space, Tabs } from 'antd';

import { useTranslation } from 'react-i18next';

import { IRequirementType, IMaintenanceType } from '@/models/AC';

import { ProFormTextArea } from '@ant-design/pro-components';

import ReqCodesAdmin from '../requirementsCodesAdministration/ReqCodesAdmin';

interface IRequirementTypeFormProps {
  reqType: IRequirementType | undefined;
  onSubmit: (reqType: IRequirementType) => void;
  onDelete?: (reqTypeId: string) => void;
}

const RequirementsTypesForm: FC<IRequirementTypeFormProps> = ({
  reqType,
  onSubmit,
}) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const handleSubmit = async (values: IRequirementType) => {
    const newUser: IRequirementType = reqType
      ? { ...reqType, ...values }
      : { ...values };
    onSubmit(newUser);
  };
  const [editingMaintenanceType, setEditingMaintenanceType] =
    useState<IMaintenanceType | null>(null);
  const handleEdit = (acMaintType: IMaintenanceType) => {
    setEditingMaintenanceType(acMaintType);
  };

  // Состояние для контроля видимости кнопки "Сохранить"
  const [showSubmitButton, setShowSubmitButton] = useState(true);

  // Обработчик изменения активной вкладки
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
    <Button type="primary" htmlType="submit">
      {reqType ? t('UPDATE') : t('CREATE')}
    </Button>
  );

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
      // initialValues={vendor || {}}
      layout="horizontal"
    >
      <Tabs defaultActiveKey="1" type="card" onChange={handleTabChange}>
        <Tabs.TabPane tab={t('MAIN')} key="1">
          <ProFormGroup>
            <ProFormGroup>
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
            <ProFormGroup>
              <ProFormSelect
                showSearch
                // mode="multiple"
                name="status"
                label={t('STATE')}
                width="sm"
                valueEnum={{
                  ACTIVE: { text: t('ACTIVE'), status: 'SUCCESS' },
                  INACTIVE: { text: t('INACTIVE'), status: 'Error' },
                }}
              />
            </ProFormGroup>
          </ProFormGroup>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('CODES')} key="2">
          {reqType && reqType.id ? (
            <ReqCodesAdmin reqTypeID={reqType.id} />
          ) : (
            <Empty description="No Data" />
          )}
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};
export default RequirementsTypesForm;
