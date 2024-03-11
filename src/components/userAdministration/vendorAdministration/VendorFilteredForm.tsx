import React, { FC, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormInstance,
  ProForm,
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';

export type VendorFilteredFormValues = {
  CODE: string;
  NAME: string;
  status: string[];
  IS_RESIDENT?: boolean;
};

type VendorFilteredFormProps<T> = {
  onSubmit: (values: VendorFilteredFormValues) => void;
};

const VendorFilteredForm: FC<
  VendorFilteredFormProps<VendorFilteredFormValues>
> = ({ onSubmit }) => {
  const formRef = useRef<FormInstance<VendorFilteredFormValues>>(null);

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
          name="CODE"
          label={t('CODE')}
          width="lg"
        />
        <ProFormText
          fieldProps={{
            onKeyPress: handleKeyPress,
          }}
          name="NAME"
          label={t('NAME')}
          width="lg"
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
        <ProFormCheckbox name="IS_RESIDENT" label={t('RESIDENT')} />
      </ProForm>
    </div>
  );
};

export default VendorFilteredForm;
