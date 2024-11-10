import React, {
  FC,
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react';
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
import { Form, notification } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { resetFormValues, setFormValues } from '@/store/reducers/formSlice';

export type TaskFilteredFormValues = {
  isCriticalTask: boolean | undefined;
  cardNumber: any;
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
  formKey: string; // Уникальный ключ формы
  onSubmit: (values: TaskFilteredFormValues) => void;
};

const AdminTaskFilteredForm: FC<
  VendorFilteredFormProps<TaskFilteredFormValues>
> = ({ onSubmit, formKey }) => {
  const formRef = useRef<FormInstance<TaskFilteredFormValues>>(null);
  const [acTypeID, setACTypeID] = useState<any>('');
  const [form] = Form.useForm();
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit();
    }
  }, []);

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const statusOptions = useMemo(
    () => ({
      ACTIVE: { text: t('ACTIVE'), status: 'SUCCESS' },
      INACTIVE: { text: t('INACTIVE'), status: 'Error' },
    }),
    [t]
  );

  const handleSubmit = useCallback(
    async (values: TaskFilteredFormValues) => {
      // if (Object.values(values).every((value) => value === '')) {
      //   // Показываем уведомление, если все значения формы пустые
      //   notification.warning({
      //     message: 'Предупреждение',
      //     description: 'Пожалуйста, введите хотя бы одно значение',
      //   });
      //   return false;
      // } else {
      //   // Вызываем onSubmit только если хотя бы одно поле заполнено
      //   const success = onSubmit({ ...values, time: new Date() });
      //   return success;
      // }
      onSubmit({ ...values, time: new Date() });
    },
    [onSubmit]
  );
  const formValues = useSelector((state: any) => state.form[formKey] || {});
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
  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);
  const handleReset = () => {
    form.resetFields();

    dispatch(resetFormValues({ formKey }));
  };
  return (
    <div className="p-3 m-1 rounded-md ">
      <ProForm
        onValuesChange={(changedValues, allValues) => {
          dispatch(setFormValues({ formKey, values: allValues }));
        }}
        onReset={handleReset}
        form={form}
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
          label={t('REFERENCE')}
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
            // PART_PRODUCE: { text: t('PART PRODUCE') },
            SB: { text: t('SERVICE BULLETIN') },
            SMC: { text: t('SHEDULED MAINTENENCE CHECK') },
            AD: { text: t('AIRWORTHINESS DIRECTIVE') },
            PN: { text: t('COMPONENT') },
            HARD_ACCESS: { text: t('HARD_ACCESS') },
            // PN: { text: t('COMPONENT') },
            // PART_PRODUCE: { text: t('PART PRODUCE') },
            // NRC: { text: t('NRC') },
            // ADD_HOC: { text: t('ADD HOC') },
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
        {/* <ProFormCheckbox name="IS_RESIDENT" label={t('RESIDENT')} /> */}
      </ProForm>
    </div>
  );
};

export default AdminTaskFilteredForm;
