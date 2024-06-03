//@ts-nocheck

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

export type VendorFilteredFormValues = {
  CODE: string;
  NAME: string;
  status: string[];
  IS_RESIDENT?: boolean;
};

type VendorFilteredFormProps<T> = {
  onSubmit: (values: VendorFilteredFormValues) => void;
};

const AdminTaskFilterdForm: FC<
  VendorFilteredFormProps<VendorFilteredFormValues>
> = ({ onSubmit }) => {
  const formRef = useRef<FormInstance<VendorFilteredFormValues>>(null);
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
    (values: VendorFilteredFormValues) => {
      return Promise.resolve(onSubmit(values));
    },
    [onSubmit]
  );
  const { data: mpdCodes, isLoading: mpdCodesLoading } = useGetMPDCodesQuery(
    { acTypeID },
    { skip: !acTypeID } // Skip the query if acTypeID is not set
  );
  const { data: acTypes, isLoading: acTypesLoading } = useGetACTypesQuery({});
  const mpdCodesValueEnum: Record<string, string> =
    mpdCodes?.reduce((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.code;
      return acc;
    }, {}) || {};

  const acTypeValueEnum: Record<string, string> =
    acTypes?.reduce((acc, acType) => {
      acc[acType.id] = acType.name;
      return acc;
    }, {}) || {};

  return (
    <div className="p-3 m-1 rounded-md bg-slate-100">
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
        <ProFormSelect
          showSearch
          mode="multiple"
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
        <ProFormSelect
          showSearch
          // initialValue={['65f1a33071106bb8e027f359']}
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
          disabled={!acTypeID}
          // Disable the select if acTypeID is not set
        />

        <ProFormSelect
          showSearch
          mode="multiple"
          name="status"
          label={t('STATUS')}
          width="sm"
          // initialValue={['ACTIVE']}
          valueEnum={statusOptions}
        />
        {/* <ProFormCheckbox name="IS_RESIDENT" label={t('RESIDENT')} /> */}
      </ProForm>
    </div>
  );
};

export default AdminTaskFilterdForm;
