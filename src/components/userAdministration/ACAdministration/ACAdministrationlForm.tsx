//@ts-nocheck

// The rest of your TypeScript code here will not be type-checked by the compiler

import React, { FC, useEffect, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-form';
import { Button, Divider, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { ITask } from '@/models/ITask';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';
import { useGetMPDCodesQuery } from '@/features/MPDAdministration/mpdCodesApi';
import { useGetZonesByGroupQuery } from '@/features/zoneAdministration/zonesApi';
import { useGetGroupTaskCodesQuery } from '@/features/tasksAdministration/taskCodesApi';
import { ProFormDigit, ProFormTextArea } from '@ant-design/pro-components';
import { useGetCompaniesQuery } from '@/features/companyAdministration/companyApi';

interface UserFormProps {
  task?: ITask;
  onSubmit: (task: ITask) => void;
  onDelete?: (taskId: string) => void;
}

const ACAdministrationlForm: FC<UserFormProps> = ({ task, onSubmit }) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const [acTypeID, setACTypeID] = useState<any>(task?.acTypeId || '');

  const handleSubmit = async (values: ITask) => {
    const newUser: ITask = task ? { ...task, ...values } : { ...values };

    onSubmit(newUser);
  };

  useEffect(() => {
    if (task) {
      form.resetFields();
      form.setFieldsValue(task);
      setACTypeID(task.acTypeId);
    } else {
      form.resetFields();
      setACTypeID(undefined);
    }
  }, [task, form]);

  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {task ? t('UPDATE') : t('CREATE')}
    </Button>
  );
  const { data: zones, isLoading: loading } = useGetZonesByGroupQuery(
    { acTypeID },
    { skip: !acTypeID }
  );
  const { data: acTypes, isLoading: acTypesLoading } = useGetACTypesQuery({});

  const zonesValueEnum: Record<string, string> =
    zones?.reduce((acc, acType) => {
      acc[acType.id] = acType.majoreZoneNbr;
      return acc;
    }, {}) || {};

  const acTypeValueEnum: Record<string, string> =
    acTypes?.reduce((acc, acType) => {
      acc[acType.id] = acType.name;
      return acc;
    }, {}) || {};
  const { data: companies, isLoading } = useGetCompaniesQuery({});
  const { data: mpdCodes, isLoading: mpdCodesLoading } = useGetMPDCodesQuery(
    { acTypeID },
    { skip: !acTypeID } // Skip the query if acTypeID is not set
  );
  const { data: taskCodes } = useGetGroupTaskCodesQuery(
    { acTypeID },
    { skip: !acTypeID }
  );
  const taskCodesValueEnum: Record<string, string> =
    taskCodes?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.code;
      return acc;
    }, {}) || {};
  const mpdCodesValueEnum: Record<string, string> =
    mpdCodes?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.code;
      return acc;
    }, {}) || {};
  const companiesCodesValueEnum: Record<string, string> =
    companies?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.companyName;
      return acc;
    }, {}) || {};

  return (
    <ProForm
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => [<SubmitButton key="submit" />, dom.reverse()[1]],
      }}
      layout="horizontal"
    >
      <Tabs defaultActiveKey="1" type="card">
        <Tabs.TabPane tab="MAIN" key="1">
          <ProFormGroup>
            <ProFormGroup>
              <ProFormSelect
                showSearch
                name="acTypeId"
                label={t('AC TYPE')}
                width="sm"
                valueEnum={acTypeValueEnum}
                onChange={(value: any) => setACTypeID(value)}
              />
              <ProFormSelect
                showSearch
                name="mpdDocumentationId"
                label={t('MPD CODE')}
                width="lg"
                valueEnum={mpdCodesValueEnum}
                disabled={!acTypeID} // Disable the select if acTypeID is not set
              />
              <ProFormSelect
                showSearch
                name="companyID"
                label={t('COMPANY CODE')}
                width="lg"
                valueEnum={companiesCodesValueEnum}
                disabled={!acTypeID} // Disable the select if acTypeID is not set
              />

              <ProFormText
                name="serialNbr"
                label={t('SERIAL No')}
                width="sm"
              ></ProFormText>
              <ProFormText
                name="regNbr"
                label={t('REGISTRATION No')}
                width="sm"
              ></ProFormText>
              <ProFormTextArea
                // mode={'multiple'}

                name="note"
                label={t('REMARKS')}
                width="lg"
                // Disable the select if acTypeID is not set
              />
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
            <Divider />
            <ProFormGroup>
              <ProFormDigit width={'xs'} name="ACAFL" label={t('ACAFL')} />
            </ProFormGroup>
          </ProFormGroup>
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};

export default ACAdministrationlForm;
