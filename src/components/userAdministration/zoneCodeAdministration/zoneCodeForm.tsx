import React, { FC, useEffect } from 'react';
import { ProForm, ProFormText, ProFormCheckbox } from '@ant-design/pro-form';
import { Button, Tabs } from 'antd';

import { IZoneCode } from '@/models/ITask';
import {
  ProFormGroup,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';

interface UserFormProps {
  zoneCode?: IZoneCode;
  onSubmit: (zoneCode: IZoneCode) => void;
  onDelete?: (zoneCodeId: string) => void;
}

const ZoneCodeForm: FC<UserFormProps> = ({ zoneCode, onSubmit }) => {
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const handleSubmit = async (values: IZoneCode) => {
    const newUser: IZoneCode = zoneCode
      ? { ...zoneCode, ...values }
      : { ...values };
    onSubmit(newUser);
  };
  useEffect(() => {
    if (zoneCode) {
      form.resetFields();
      form.setFieldsValue(zoneCode);
    } else {
      form.resetFields();
    }
  }, [zoneCode, form]);
  return (
    <ProForm
      size="small"
      form={form}
      onFinish={handleSubmit}
      // submitter={false}
      initialValues={zoneCode}
      layout="horizontal"
    >
      <ProForm.Group>
        <ProForm.Group>
          <ProFormText
            width={'sm'}
            name="majoreZoneNbr"
            label="MAJOREZONE NUMBER"
            rules={[
              {
                required: true,
              },
            ]}
          />
          <ProFormText
            width={'sm'}
            // fieldProps={{
            //   style: {
            //     resize: 'none',
            //   },
            //   rows: 3,
            //   // This is the correct way to set colSize within fieldProps
            // }}
            name="majoreZoneDescription"
            label=" MAJOREZONE DESCRIPTION"
            rules={[
              {
                required: true,
              },
            ]}
          />
          <ProFormText
            width={'sm'}
            name="subZoneNbr"
            label="SUBZONE NUMBER"
            rules={[
              {
                required: false,
              },
            ]}
          />
          <ProFormText
            width={'sm'}
            // fieldProps={{
            //   style: {
            //     resize: 'none',
            //   },
            //   rows: 3,
            //   // This is the correct way to set colSize within fieldProps
            // }}
            name="subZoneDescription"
            label=" SUBZONE DESCRIPTION"
          />
          <ProFormGroup>
            <ProFormSelect
              showSearch
              name="status"
              label={t('STATE')}
              width="sm"
              valueEnum={{
                ACTIVE: { text: t('ACTIVE'), status: 'SUCCESS' },
                INACTIVE: { text: t('INACTIVE'), status: 'Error' },
              }}
            />
          </ProFormGroup>
        </ProForm.Group>
      </ProForm.Group>

      {/* <ProForm.Item>
        <Button type="primary" htmlType="submit">
          {zoneCode ? 'Update' : 'Create'}
        </Button>
      </ProForm.Item> */}
    </ProForm>
  );
};
export default ZoneCodeForm;
