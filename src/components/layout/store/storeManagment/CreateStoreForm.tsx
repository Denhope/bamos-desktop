import {
  ProForm,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import { IStore } from '@/models/IStore';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { postNewStoreShop } from '@/utils/api/thunks';
type CreateStoreFormType = {
  oncreateStoreData: (record: IStore) => void;
};
const CreateStoreForm: FC<CreateStoreFormType> = ({ oncreateStoreData }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  return (
    <ProForm
      onFinish={async (values) => {
        // dispatch(postNewStoreShop({}));
        oncreateStoreData(values as IStore);
      }}
    >
      <ProFormGroup>
        <ProFormText
          name="shopLongName"
          label={`${t('STORE LONG NAME')}`}
          width="lg"
          tooltip={`${t('STORE LONG NAME')}`}
          rules={[{ required: true }]}
        ></ProFormText>
        <ProFormText
          name="shopShortName"
          label={`${t('STORE SHORT NAME')}`}
          width="sm"
          tooltip={`${t('STORE SHORT NAME')}`}
          rules={[{ required: true }]}
        ></ProFormText>
        <ProFormSelect
          label={`${t('STATUS')}`}
          width="sm"
          name="status"
          tooltip={`${t('ENTER STATUS')}`}
          rules={[{ required: true }]}
          valueEnum={{
            active: { text: 'ACTIVE' },
            unActive: { text: 'UN ACTIVE' },
          }}
        ></ProFormSelect>
      </ProFormGroup>
      <ProFormGroup>
        <ProFormText
          name="description"
          label={`${t('STORE DESCRIPTION')}`}
          width="xl"
          tooltip={`${t('STORE ADRESS')}`}
          rules={[{ required: true }]}
        />
      </ProFormGroup>
      <ProFormGroup>
        <ProFormSelect
          label={`${t('STATION')}`}
          width="sm"
          name="station"
          tooltip={`${t('ENTER STATION')}`}
          rules={[{ required: true }]}
          valueEnum={{
            MSQ: { text: 'MINSK-2' },
            SMQ: { text: 'SMOLEVICHI' },
          }}
        ></ProFormSelect>
        <ProFormText
          name="adress"
          label={`${t('STORE ADRESS')}`}
          width="lg"
          tooltip={`${t('STORE ADRESS')}`}
          rules={[{ required: true }]}
        ></ProFormText>
        <ProFormText
          name="ownerShotName"
          label={`${t('OWNER SHORT NAME')}`}
          width="sm"
          tooltip={`${t('OWNER SHORT NAME')}`}
          rules={[{ required: true }]}
        ></ProFormText>
        <ProFormText
          name="remarks"
          label={`${t('REMARKS')}`}
          width="lg"
          tooltip={`${t('REMARKS')}`}
          rules={[{ required: true }]}
        ></ProFormText>
      </ProFormGroup>
    </ProForm>
  );
};

export default CreateStoreForm;
