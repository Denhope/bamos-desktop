import React, { FC, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormInstance,
  ProForm,
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';

export type ACTypesFilteredFormValues = {
  code: string;
  name: string;
  status: string[];
};

type VendorFilteredFormProps<T> = {
  onSubmit: (values: ACTypesFilteredFormValues) => void;
};

const VendorFilteredForm: FC<
  VendorFilteredFormProps<ACTypesFilteredFormValues>
> = ({ onSubmit }) => {
  const formRef = useRef<FormInstance<ACTypesFilteredFormValues>>(null);

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
    (values: ACTypesFilteredFormValues) => {
      return Promise.resolve(onSubmit(values));
    },
    [onSubmit]
  );
  return (
    <div className="p-3 bg-slate-100">
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
          name="code"
          label={t('CODE')}
          width="lg"
        />
        <ProFormText
          fieldProps={{
            onKeyPress: handleKeyPress,
          }}
          name="name"
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
      </ProForm>
    </div>
  );
};

export default VendorFilteredForm;
