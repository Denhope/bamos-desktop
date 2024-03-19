import {
  Button,
  DatePicker,
  DatePickerProps,
  Divider,
  Form,
  Input,
  InputNumber,
  Spin,
} from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import form from 'antd/es/form';
import Title from 'antd/es/typography/Title';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { IPlane } from '@/models/IPlane';
import moment, { localeData } from 'moment';
import dayjs from 'dayjs';

import React, { FC, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { createNewPlane, editPlane, getPlane } from '@/utils/api/thunks';
import { useTranslation } from 'react-i18next';
interface EditFormProps {
  selectedACNumber: any;
}
const EditForm: FC<EditFormProps> = ({ selectedACNumber }) => {
  const [plane, setCuttentPlane] = useState<IPlane>();
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

  const setForm = async () => {
    setCuttentPlane(await getPlane(selectedACNumber));
  };
  const handleSelectChange = (values: any) => {
    form.setFieldsValue({
      model: values?.model,
      planeType: values?.planeType,
      regNbr: values?.regNbr,
      serialNbr: values?.serialNbr,
      // certification: moment(values?.certification).format('DD.MM.YY'),

      APUmodel: values.apu?.APUmodel,
      APUSerialNumber: values.apu?.APUSerialNumber,
      // APUCertification: moment(values.apu?.APUCertification).format('DD.MM.YY'),

      ENC1model: values.eng1?.ENC1model,
      ENC1SerialNumber: values.eng1?.ENC1SerialNumber,
      // ENC1Certification: values.eng1?.ENC1Certification,

      ENC2model: values.eng2?.ENC2model,
      ENC2SerialNumber: values.eng2?.ENC2SerialNumber,
      // ENC2Certification: values.eng2?.ENC2Certification,

      // ACDATE: values.utilisation?.ACDATE,
      ACHRS: values.utilisation?.ACHRS,
      ACAFL: values.utilisation?.ACAFL,
      APUAFL: values.utilisation?.APUAFL,
      APUHRS: values.utilisation?.APUHRS,
      // APUDATE: values.utilisation?.APUDATE,
      ENC1AFL: values.utilisation?.ENC1AFL,
      // ENC1DATE: values.utilisation?.ENC1DATE,
      ENC1HRS: values.utilisation?.ENC1HRS,
      // ENC2DATE: values.utilisation?.ENC2DATE,
      ENC2HRS: values.utilisation?.ENC2HRS,
      ENC2AFL: values.utilisation?.ENC2AFL,
    });
  };
  useEffect(() => {
    setForm();
    plane && plane?.id && handleSelectChange(plane);
  }, [plane?.id]);

  return (
    <>
      <div
        className="flex flex-col mx-auto"
        style={{
          width: '93%',
        }}
      >
        {plane && plane?.id ? (
          <Form
            form={form}
            name="complex-form"
            // onFinish={onFinish}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            onFinish={async (values: any) => {
              const result = await dispatch(
                editPlane({
                  id: plane?.id,
                  model: values.model,
                  planeType: values.planeType,
                  regNbr: values.regNbr,
                  serialNbr: values.serialNbr,
                  certification: values.certification,
                  apu: {
                    APUmodel: values.APUmodel,
                    APUSerialNumber: values.APUSerialNumber,
                    APUCertification: values.APUCertification,
                  },
                  eng1: {
                    ENC1model: values.ENC1model,
                    ENC1SerialNumber: values.ENC1SerialNumber,
                    ENC1Certification: values.ENC1Certification,
                  },
                  eng2: {
                    ENC2model: values.ENC2model,
                    ENC2SerialNumber: values.ENC2SerialNumber,
                    ENC2Certification: values.ENC2Certification,
                  },

                  utilisation: {
                    ACDATE: values.ACDATE,
                    ACHRS: values.ACHRS,
                    ACAFL: values.ACAFL,
                    APUAFL: values.APUAFL,
                    APUHRS: values.APUHRS,
                    APUDATE: values.APUDATE,
                    ENC1AFL: values.ENC1AFL,
                    ENC1DATE: values.ENC1DATE,
                    ENC1HRS: values.ENC1HRS,
                    ENC2DATE: values.ENC2DATE,
                    ENC2HRS: values.ENC2HRS,
                    ENC2AFL: values.ENC2AFL,
                  },
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                toast.success(' A/C is Edited');
                // form.resetFields();
              }
            }}
            className="w-full mx-auto"
            autoComplete="off"
          >
            <Title level={5}>A/C</Title>
            <Form.Item
              rules={[{ required: true }]}
              label="Registration Number"
              name="regNbr"
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label={`${t('Serial Number')}`}
              name="serialNbr"
            >
              <Input disabled />
            </Form.Item>
            <Form.Item rules={[{ required: true }]} label="Model" name="model">
              <Input disabled />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="Plane Type"
              name="planeType"
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              // rules={[{ required: true }]}
              label="Certification"
              name="certification"
            >
              {/* <DatePicker onChange={onChange} onOk={onOk} /> */}
            </Form.Item>
            <Form.Item
              // rules={[{ required: true }]}
              label="A/C Times (Date)"
              name="ACDATE"
            >
              {/* <DatePicker onChange={onChange} onOk={onOk} /> */}
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="A/C Times (Hours)"
              name="ACHRS"
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="A/C Times (LDG)"
              name="ACAFL"
            >
              <InputNumber />
            </Form.Item>
            <Divider></Divider>
            <Title level={5}>Engine 1</Title>
            <Form.Item
              rules={[{ required: true }]}
              label={`${t('Serial Number')}`}
              name="ENC1SerialNumber"
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="Model"
              name="ENC1model"
            >
              <Input allowClear />
            </Form.Item>

            <Form.Item
              // rules={[{ required: true }]}
              label="Certification"
              name="ENC1Certification"
            >
              {/* <DatePicker onChange={onChange} onOk={onOk} /> */}
            </Form.Item>
            <Form.Item
              // rules={[{ required: true }]}
              label="ENGINE Times (Date)"
              name="ENC1DATE"
            >
              {/* <DatePicker onChange={onChange} onOk={onOk} /> */}
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="ENGINE Times (Hours)"
              name="ENC1HRS"
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="ENGINE Times (AFL)"
              name="ENC1AFL"
            >
              <InputNumber />
            </Form.Item>
            <Divider></Divider>
            <Title level={5}>Engine 2</Title>

            <Form.Item
              rules={[{ required: true }]}
              label={`${t('Serial Number')}`}
              name="ENC2SerialNumber"
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="Model"
              name="ENC2model"
            >
              <Input allowClear />
            </Form.Item>

            <Form.Item
              // rules={[{ required: true }]}
              label="Certification"
              name="ENC2Certification"
            >
              {/* <DatePicker onChange={onChange} onOk={onOk} /> */}
            </Form.Item>
            <Form.Item
              // rules={[{ required: true }]}
              label="ENGINE Times (Date)"
              name="ENC2DATE"
            >
              {/* <DatePicker onChange={onChange} onOk={onOk} /> */}
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="ENGINE Times (Hours)"
              name="ENC2HRS"
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="ENGINE Times (AFL)"
              name="ENC2AFL"
            >
              <InputNumber />
            </Form.Item>
            <Divider></Divider>
            <Title level={5}>APU</Title>

            <Form.Item
              rules={[{ required: true }]}
              label={`${t('Serial Number')}`}
              name="APUSerialNumber"
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              rules={[{ required: true }]}
              label="Model"
              name="APUmodel"
            >
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
              // rules={[{ required: true }]}
              label="APU Times (Date)"
              name="APUDATE"
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
            <Form.Item>
              <Button htmlType="submit" type="primary">
                Edit
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Spin></Spin>
        )}
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    </>
  );
};

export default EditForm;
