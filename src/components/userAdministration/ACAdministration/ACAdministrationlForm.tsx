// @ts-nocheck

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
                mode={'multiple'}
                showSearch
                name="mpdDocumentationId"
                label={t('MPD CODE')}
                width="lg"
                valueEnum={mpdCodesValueEnum}
                disabled={!acTypeID} // Disable the select if acTypeID is not set
              />
              <ProFormSelect
                showSearch
                // mode="multiple"
                name="taskType"
                label={t('TASK TYPE')}
                width="xl"
                valueEnum={{
                  SB: { text: t('SERVICE BULLETIN') },
                  SMC: { text: t('SHEDULED MAINTENENCE CHEACK') },
                  ADP: { text: t('ADP') },
                  AD: { text: t('AIRWORTHINESS DIRECTIVE') },
                  PN: { text: t('COMPONENT') },
                }}
              />
              <ProFormGroup>
                <ProFormText
                  width={'sm'}
                  name="taskNumber"
                  label="TASK NUMBER"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                />
                <ProFormText
                  width={'xs'}
                  name="revision"
                  label={t('REVISION')}
                  rules={[
                    {
                      // required: true,
                    },
                  ]}
                />
                <ProFormText
                  width={'sm'}
                  name="taskDescription"
                  label="DESCRIPTION"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                />
              </ProFormGroup>

              <ProFormText
                width={'sm'}
                name="amtoss"
                label="AMM"
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
              <ProFormSelect
                showSearch
                name="zonesID"
                mode={'multiple'}
                label={t('ZONES')}
                width="sm"
                valueEnum={zonesValueEnum}
                disabled={!acTypeID}
              />
              <ProFormSelect
                // mode={'multiple'}
                showSearch
                name="code"
                label={t('TASK CODE')}
                width="sm"
                valueEnum={taskCodesValueEnum}
                disabled={!acTypeID} // Disable the select if acTypeID is not set
              />
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
              <ProFormDigit
                width={'xs'}
                name="intervalDAYS"
                label={t('INTERVAL DAYS')}
              />
              <ProFormDigit
                width={'xs'}
                name="toleranceDAY"
                label={t('TOLERANCE DAY')}
              />
              <ProFormDigit
                width={'xs'}
                name="intervalMOS"
                label={t('INTERVAL MOS')}
              />
              <ProFormDigit
                width={'xs'}
                name="toleranceMOS"
                label={t('TOLERANCE MOS')}
              />
              <ProFormDigit
                width={'xs'}
                name="intervalHRS"
                label={t('INTERVAL HRS')}
              />
              <ProFormDigit
                width={'xs'}
                name="toleranceMHS"
                label={t('TOLERANCE MHS')}
              />
              <ProFormDigit
                width={'xs'}
                name="intervalAFL"
                label={t('INTERVAL AFL')}
              />
              <ProFormDigit
                width={'xs'}
                name="intervalENC"
                label={t('INTERVAL ENC')}
              />
              <ProFormDigit
                width={'xs'}
                name="intervalAPUS"
                label={t('INTERVAL APUS')}
              />
            </ProFormGroup>
          </ProFormGroup>
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};

export default ACAdministrationlForm;