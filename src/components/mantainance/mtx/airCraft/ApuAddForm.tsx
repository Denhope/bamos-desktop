import {
  Button,
  DatePicker,
  DatePickerProps,
  Divider,
  Form,
  Input,
  InputNumber,
} from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import form from 'antd/es/form';
import Title from 'antd/es/typography/Title';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { IPlane } from '@/models/IPlane';

import React, { FC } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createNewPlane } from '@/utils/api/thunks';

const ApuAddForm: FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const timeFormat = /^\d{1,4}:\d{2}$/;
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    // console.log('Selected Time: ', value);
    // console.log('Formatted Selected Time: ', dateString);
  };

  const onOk = (
    value: DatePickerProps['value'] | RangePickerProps['value']
  ) => {
    // console.log('onOk: ', value);
  };
  const [form] = Form.useForm();

  return (
    <div
      className="flex flex-col mx-auto"
      style={{
        width: '93%',
      }}
    >
      <Form
        form={form}
        name="complex-form"
        // onFinish={onFinish}
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        onFinish={async (values: any) => {
          // const result = await dispatch(
          //   createNewPlane({
          //     model: values.model,
          //     planeType: values.planeType,
          //     regNbr: values.regNbr,
          //     serialNbr: values.serialNbr,
          //     certification: values.certification,
          //     status: 'FLY',
          //     apu: {
          //       APUmodel: values.APUmodel,
          //       APUSerialNumber: values.APUSerialNumber,
          //       APUCertification: values.APUCertification,
          //     },
          //     eng1: {
          //       ENC1model: values.ENC1model,
          //       ENC1SerialNumber: values.ENC1SerialNumber,
          //       ENC1Certification: values.ENC1Certification,
          //     },
          //     eng2: {
          //       ENC2model: values.ENC2model,
          //       ENC2SerialNumber: values.ENC2SerialNumber,
          //       ENC2Certification: values.ENC2Certification,
          //     },
          //     utilisation: {
          //       ACDATE: values.ACDATE,
          //       ACHRS: values.ACHRS,
          //       ACAFL: values.ACAFL,
          //       APUAFL: values.APUAFL,
          //       APUHRS: values.APUHRS,
          //       APUDATE: values.APUDATE,
          //       ENC1AFL: values.ENC1AFL,
          //       ENC1DATE: values.ENC1DATE,
          //       ENC1HRS: values.ENC1HRS,
          //       ENC2DATE: values.ENC2DATE,
          //       ENC2HRS: values.ENC2HRS,
          //       ENC2AFL: values.ENC2AFL,
          //     },
          //   })
          // );
          // if (result.meta.requestStatus === 'fulfilled') {
          //   toast.success('New A/C Added');
          //   form.resetFields();
          // }
        }}
        className="w-full mx-auto"
        autoComplete="off"
      >
        <Form.Item
          rules={[{ required: true }]}
          label={`${t('Serial Number')}`}
          name="APUSerialNumber"
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item rules={[{ required: true }]} label="Model" name="APUmodel">
          <Input allowClear />
        </Form.Item>

        <Form.Item
          rules={[{ required: true }]}
          label="Certification"
          name="APUCertification"
        >
          {/* <DatePicker onChange={onChange} onOk={onOk} /> */}
        </Form.Item>

        <Form.Item
          rules={[{ required: true }]}
          label="APU Times (Hours)"
          name="APUHRS"
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          label="APU Times (AFL)"
          name="APUAFL"
        >
          <InputNumber />
        </Form.Item>
        <Divider></Divider>

        <Form.Item>
          <Button htmlType="submit" type="primary">
            Create
          </Button>
        </Form.Item>
      </Form>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default ApuAddForm;
