import React, { FC, useRef, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormInstance,
  ProForm,
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';
import { useGetMPDCodesQuery } from '@/features/MPDAdministration/mpdCodesApi';
import { notification } from 'antd';

export type TaskFilteredFormValues = {
  taskNumber?: string;
  AMM?: string;
  taskType?: string[];
  acTypeId?: string;
  mpdDocumentationId?: string[];
  status?: string[];
  time?: any;
  taskCardNumber?: any;
};

type VendorFilteredFormProps<T> = {
  onSubmit: (values: TaskFilteredFormValues) => void;
};

const AdminTaskFilteredForm: FC<
  VendorFilteredFormProps<TaskFilteredFormValues>
> = ({ onSubmit }) => {
  const formRef = useRef<FormInstance<TaskFilteredFormValues>>(null);
  const [acTypeID, setACTypeID] = useState<any>('');

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit();
    }
  }, []);

  const { t } = useTranslation();

  const statusOptions = useMemo(
    () => ({
      ACTIVE: { text: t('ACTIVE'), status: 'SUCCESS' },
      INACTIVE: { text: t('INACTIVE'), status: 'Error' },
    }),
    [t]
  );

  const handleSubmit = useCallback(
    async (values: TaskFilteredFormValues) => {
      onSubmit({ ...values, time: new Date() });
    },
    [onSubmit]
  );

  const { data: mpdCodes } = useGetMPDCodesQuery({ acTypeID });

  const { data: acTypes } = useGetACTypesQuery({});

  const mpdCodesValueEnum: Record<string, string> =
    (mpdCodes || []).reduce((acc: Record<string, string>, mpdCode) => {
      acc[mpdCode.id] = mpdCode.code;
      return acc;
    }, {}) || {};

  const acTypeValueEnum: Record<string, string> =
    (acTypes || []).reduce((acc: Record<string, string>, acType) => {
      acc[acType.id] = acType.name;
      return acc;
    }, {}) || {};

  return (
    <div
      className="p-3 m-1 rounded-md bg-slate-100 overflow-y-auto"
      style={{ maxHeight: '400px' }}
    >
      <ProForm
        size="small"
        onFinish={handleSubmit}
        layout="horizontal"
        formRef={formRef}
      >
        <ProFormText
          fieldProps={{
            onKeyPress: handleKeyPress,
          }}
          name="taskNumber"
          label={t('TASK No')}
          width="lg"
        />
        <ProFormText
          fieldProps={{
            onKeyPress: handleKeyPress,
          }}
          name="AMM"
          label={t('AMM')}
          width="lg"
        />
        <ProFormText
          fieldProps={{
            onKeyPress: handleKeyPress,
          }}
          name="cardNumber"
          label={t('CARD No')}
          width="lg"
        />
        <ProFormSelect
          showSearch
          mode="multiple"
          name="taskType"
          label={t('TASK TYPE')}
          width="xl"
          valueEnum={{
            SB: { text: t('SERVICE BULLETIN') },
            SMC: { text: t('SHEDULED MAINTENENCE CHECK') },
            AD: { text: t('AIRWORTHINESS DIRECTIVE') },
            PN: { text: t('COMPONENT') },
          }}
        />
        <ProFormSelect
          showSearch
          name="acTypeId"
          label={t('AC TYPE')}
          width="lg"
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
          disabled={!acTypeID}
          onChange={(value: any) => {
            formRef.current?.setFieldsValue({ mpdDocumentationId: value });
          }}
        />

        <ProFormSelect
          showSearch
          mode="multiple"
          name="status"
          label={t('STATUS')}
          width="lg"
          valueEnum={statusOptions}
        />
      </ProForm>
    </div>
  );
};

export default AdminTaskFilteredForm;
