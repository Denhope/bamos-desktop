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
import {
  ProFormDatePicker,
  ProFormDigit,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useGetCompaniesQuery } from '@/features/companyAdministration/companyApi';
import { useGetCustomerCodesQuery } from '@/features/customerCodeAdministration/customerCodeApi';

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
      setACTypeID(task.acTypeId[0]?._id);
      form.setFieldsValue({ acTypeId: task.acTypeId[0]?._id });
      form.setFieldsValue({ cuctumerCodeID: task.cuctumerCodeID?._id });
      form.setFieldsValue({ companyID: task.companyID?._id });
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
  // Получаем данные о кодах клиентов
  const { data: customerCodes, isLoading: isCustomerCodesLoading } =
    useGetCustomerCodesQuery({});
  // Преобразуем полученные данные в формат, подходящий для ProFormSelect
  const customerOptions =
    customerCodes?.map((code) => ({
      value: code.id,
      label: code?.prefix, // Используем customerName, если оно есть, иначе используем code
    })) || [];

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
        <Tabs.TabPane tab={t('INFORMATION')} key="1">
          <div
            className=" h-[58vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto "
            // sm={19}
          >
            <ProFormGroup direction="vertical">
              <ProFormGroup>
                <ProFormText
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  name="regNbr"
                  label={t('AIRCRAFT ADMINISTRATION No')}
                  width="sm"
                ></ProFormText>
                <ProFormText
                  name="serialNbr"
                  label={t('MANUFACTURER SERIAL No')}
                  width="sm"
                ></ProFormText>
              </ProFormGroup>
              <ProFormSelect
                showSearch
                rules={[
                  {
                    required: true,
                  },
                ]}
                name="mpdDocumentationId"
                label={t('FLEET CODE')}
                width="lg"
                valueEnum={mpdCodesValueEnum}
                disabled={!acTypeID} // Disable the select if acTypeID is not set
              />
              <ProFormGroup>
                <ProFormSelect
                  showSearch
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  name="acTypeId"
                  label={t('AIRCRAFT TYPE')}
                  width="lg"
                  valueEnum={acTypeValueEnum}
                  onChange={(value: any) => setACTypeID(value)}
                />
                <ProFormText
                  name="acSubType"
                  label={t('AIRCRAFT SUB TYPE')}
                  width="sm"
                  // valueEnum={acTypeValueEnum}
                  onChange={(value: any) => setACTypeID(value)}
                />
                <ProFormText
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  name="model"
                  label={t('MODEL')}
                  width="sm"
                ></ProFormText>
              </ProFormGroup>
              <ProFormGroup direction="vertical">
                <ProFormDatePicker
                  name="manafacturesDate"
                  label={`${t('DATE OF MANAFACTURE')}`}
                  width="sm"
                  tooltip="PLANNED DATE"
                  fieldProps={
                    {
                      // onChange: onChange,
                    }
                  }
                />
                <ProFormDatePicker
                  name="firstServiceDate"
                  label={`${t('FIRST SERVICE DATE')}`}
                  width="sm"
                  tooltip="PLANNED DATE"
                  fieldProps={
                    {
                      // onChange: onChange,
                    }
                  }
                />
                <ProFormGroup>
                  <ProFormText
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    name="engineType"
                    label={t('ENGINE TYPE')}
                    width="sm"
                  ></ProFormText>
                  <ProFormText
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    name="apuType"
                    label={t('APU TYPE')}
                    width="sm"
                  ></ProFormText>
                  <ProFormText
                    name="weightWariant"
                    label={t('WEIGHT VARIANT')}
                    width="sm"
                  ></ProFormText>
                </ProFormGroup>
                <ProFormGroup>
                  <ProFormSelect
                    showSearch
                    name="companyID"
                    label={t('COMPANY')}
                    width="sm"
                    valueEnum={companiesCodesValueEnum}
                    disabled={!acTypeID} // Disable the select if acTypeID is not set
                  />
                  <ProFormSelect
                    showSearch
                    name="cuctumerCodeID"
                    label={t('CUSTOMER CODE ID')}
                    width="sm"
                    options={customerOptions}
                    loading={isCustomerCodesLoading}
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  />
                </ProFormGroup>

                <ProFormGroup>
                  <ProFormText
                    name="airFrameHours"
                    label={t('AIRFRAME HOURS')}
                    width="sm"
                  ></ProFormText>
                  <>
                    <ProFormDigit
                      name="airFrameLandings"
                      label={t('AIRFRAME LANDINGS')}
                      width="sm"
                    ></ProFormDigit>
                  </>
                  <ProFormGroup>
                    <ProFormText
                      name="efectivityNumber"
                      label={t('EFECTIVITY No')}
                      width="sm"
                    ></ProFormText>
                    <ProFormDigit
                      name="lineNumber"
                      label={t('LINE No')}
                      width="sm"
                    ></ProFormDigit>
                    <ProFormDigit
                      name="variableNumber"
                      label={t('VARIABLE No')}
                      width="sm"
                    ></ProFormDigit>
                  </ProFormGroup>
                </ProFormGroup>

                <ProFormTextArea
                  // mode={'multiple'}

                  name="remarks"
                  label={t('REMARKS')}
                  width="lg"
                  // Disable the select if acTypeID is not set
                />
              </ProFormGroup>{' '}
            </ProFormGroup>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};

export default ACAdministrationlForm;
