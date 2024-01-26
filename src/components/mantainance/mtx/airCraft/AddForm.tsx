import {
  Button,
  DatePicker,
  DatePickerProps,
  Divider,
  Form,
  Input,
  InputNumber,
} from "antd";
import { RangePickerProps } from "antd/es/date-picker";
import form from "antd/es/form";
import Title from "antd/es/typography/Title";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { IPlane } from "@/models/IPlane";

import React, { FC } from "react";
import toast, { Toaster } from "react-hot-toast";
import { createNewPlane } from "@/utils/api/thunks";
import { useTranslation } from "react-i18next";
import {
  ProForm,
  ProFormDigit,
  ProFormGroup,
  ProFormText,
} from "@ant-design/pro-components";
const AddForm: FC = () => {
  const dispatch = useAppDispatch();
  const timeFormat = /^\d{1,4}:\d{2}$/;
  const onChange = (
    value: DatePickerProps["value"] | RangePickerProps["value"],
    dateString: [string, string] | string
  ) => {
    // console.log('Selected Time: ', value);
    // console.log('Formatted Selected Time: ', dateString);
  };

  const onOk = (
    value: DatePickerProps["value"] | RangePickerProps["value"]
  ) => {
    // console.log('onOk: ', value);
  };
  const [form] = Form.useForm();
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col mx-auto"
      style={{
        width: "93%",
      }}
    >
      <ProForm
        size="middle"
        form={form}
        name="complex-form"
        // onFinish={onFinish}

        onFinish={async (values: any) => {
          const result = await dispatch(
            createNewPlane({
              model: values.model,
              planeType: values.planeType,
              regNbr: values.regNbr,
              serialNbr: values.serialNbr,
              certification: values.certification,
              status: "FLY",
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
          if (result.meta.requestStatus === "fulfilled") {
            toast.success("New A/C Added");
            form.resetFields();
          }
        }}
        className=" mx-auto"
        autoComplete="off"
      >
        <Title level={5}>A/C</Title>
        <ProForm.Group>
          <ProFormText
            rules={[{ required: true }]}
            label="Registration Number"
            name="regNbr"
            width={"sm"}
            allowClear
          />
          <ProFormText
            rules={[{ required: true }]}
            label={`${t("Serial Number")}`}
            name="serialNbr"
            width={"sm"}
            allowClear
          />
          <ProFormText
            width={"xs"}
            rules={[{ required: true }]}
            label="Model"
            name="model"
            allowClear
          />
        </ProForm.Group>
        <ProForm.Group>
          <Form.Item
            rules={[{ required: true }]}
            label="Plane Type"
            name="planeType"
          >
            <Input allowClear />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Certification"
            name="certification"
          >
            <DatePicker onChange={onChange} onOk={onOk} />
          </Form.Item>{" "}
        </ProForm.Group>
        <ProForm.Group>
          <ProForm.Item
            rules={[{ required: true }]}
            label="A/C Times (Date)"
            name="ACDATE"
          >
            <DatePicker size="middle" onChange={onChange} onOk={onOk} />
          </ProForm.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="A/C Times (Hours)"
            name="ACHRS"
          >
            <Input allowClear />
          </Form.Item>

          <ProFormDigit
            rules={[{ required: true }]}
            label="A/C Times (LDG)"
            name="ACAFL"
          />
        </ProForm.Group>

        <Divider></Divider>
        <Title level={5}>Engine 1</Title>
        <ProFormGroup>
          <ProFormText
            allowClear
            rules={[{ required: true }]}
            label={`${t("Serial Number")}`}
            name="ENC1SerialNumber"
          />

          <ProFormText
            width={"xs"}
            allowClear
            rules={[{ required: true }]}
            label="Model"
            name="ENC1model"
          />

          <ProForm.Item
            rules={[{ required: true }]}
            label="Certification"
            name="ENC1Certification"
          >
            <DatePicker onChange={onChange} onOk={onOk} />
          </ProForm.Item>
        </ProFormGroup>
        <ProFormGroup>
          <Form.Item
            rules={[{ required: true }]}
            label="ENGINE Times (Date)"
            name="ENC1DATE"
          >
            <DatePicker onChange={onChange} onOk={onOk} />
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
        </ProFormGroup>

        <Divider></Divider>
        <Title level={5}>Engine 2</Title>
        <ProFormGroup>
          <Form.Item
            rules={[{ required: true }]}
            label={`${t("Serial Number")}`}
            name="ENC2SerialNumber"
          >
            <Input allowClear />
          </Form.Item>

          <ProFormText
            width={"xs"}
            rules={[{ required: true }]}
            label="Model"
            name="ENC2model"
            allowClear
          />

          <Form.Item
            rules={[{ required: true }]}
            label="Certification"
            name="ENC2Certification"
          >
            <DatePicker onChange={onChange} onOk={onOk} />
          </Form.Item>
        </ProFormGroup>
        <ProFormGroup>
          <Form.Item
            rules={[{ required: true }]}
            label="ENGINE Times (Date)"
            name="ENC2DATE"
          >
            <DatePicker onChange={onChange} onOk={onOk} />
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
        </ProFormGroup>

        <Divider></Divider>
        <Title level={5}>APU</Title>
        <ProFormGroup>
          <Form.Item
            rules={[{ required: true }]}
            label={`${t("Serial Number")}`}
            name="APUSerialNumber"
          >
            <Input allowClear />
          </Form.Item>

          <ProFormText
            width={"xs"}
            rules={[{ required: true }]}
            label="Model"
            name="APUmodel"
            allowClear
          />

          <Form.Item
            rules={[{ required: true }]}
            label="Certification"
            name="APUCertification"
          >
            <DatePicker onChange={onChange} onOk={onOk} />
          </Form.Item>
        </ProFormGroup>
        <ProFormGroup>
          <Form.Item
            rules={[{ required: true }]}
            label="APU Times (Date)"
            name="APUDATE"
          >
            <DatePicker onChange={onChange} onOk={onOk} />
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
        </ProFormGroup>
      </ProForm>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default AddForm;
