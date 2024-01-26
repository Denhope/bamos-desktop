import { Col, Divider, Form, InputNumber, Row } from "antd";
import React, { FC, useEffect, useState } from "react";
import { RangePickerProps } from "antd/es/date-picker";

import {
  AutoComplete,
  Button,
  DatePicker,
  DatePickerProps,
  Input,
  Select,
  Space,
} from "antd";
import { Toaster } from "react-hot-toast";
import Title from "antd/es/typography/Title";
import { IPlane } from "@/models/IPlane";
import moment from "moment";
import { getFilteredPlanesTasksForDue } from "@/utils/api/thunks";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import MultiSelectForm from "@/components/shared/form/MultiSelectForm";
import { ProForm } from "@ant-design/pro-components";
const { Option } = Select;
const { RangePicker } = DatePicker;
interface FIlteredDueFormProps {
  isMenuCollapse: boolean;
  currentPlane?: IPlane;
}
function parseCWHRS(cwhrs: string) {
  const [hours, minutes] = cwhrs.split(":").map(Number);
  return hours + minutes / 60;
}

// Функция для преобразования числа в формат часы:минуты
function formatCWHRS(cwhrs: any) {
  const hours = Math.floor(cwhrs);
  const minutes = Math.round((cwhrs - hours) * 60);
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}
const DUEFiltersForm: FC<FIlteredDueFormProps> = ({
  isMenuCollapse,
  currentPlane,
}) => {
  const [selectedValuesTaskype, setSelectedValuesTaskType] = useState<string[]>(
    []
  );
  const [value, setValue] = useState("");
  const [valueACHRS, setValueACHRS] = useState("");
  const handleMultiSelectTaskType = (values: string[]) => {
    setSelectedValuesTaskType(values);
  };
  const dispatch = useAppDispatch();
  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const [selecteDate, setSelectedDate] = useState<any>();
  const onChange = (
    value: DatePickerProps["value"] | RangePickerProps["value"],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };
  const [form] = Form.useForm();
  const handleValueChange = (value: any) => {
    const type = form.getFieldValue("type");
    const dateValue = form.getFieldValue("value");
    const projAFL = form.getFieldValue("projAFL");
    if (type === "day") {
      const date = moment().add(value, "days");
      form.setFieldsValue({ datePickerValue: date });
      setSelectedEndDate(date ? date.format("YYYY-MM-DD") : null);
      form.setFieldsValue({ projAFL: dateValue * 1.5 });
      form.setFieldsValue({ projHRS: dateValue * 3.29 });
      form.setFieldsValue({
        targetAFL: Number(currentPlane?.utilisation?.ACAFL) + dateValue * 1.5,
      });
      form.setFieldsValue({
        targetACHRS: formatCWHRS(
          currentPlane?.utilisation?.ACHRS &&
            parseCWHRS(currentPlane?.utilisation?.ACHRS) + dateValue * 3.29
        ),
      });
    }
    if (type === "mos") {
      const dateValue = form.getFieldValue("value");
      const projAFL = form.getFieldValue("projAFL");
      const date = moment().add(value, "months");
      form.setFieldsValue({ datePickerValue: date });
      setSelectedEndDate(date ? date.format("YYYY-MM-DD") : null);
      form.setFieldsValue({ projAFL: dateValue * 50 });
      form.setFieldsValue({ projHRS: dateValue * 101.92 });
      form.setFieldsValue({
        targetAFL: Number(currentPlane?.utilisation?.ACAFL) + dateValue * 50,
      });
      form.setFieldsValue({
        targetACHRS: formatCWHRS(
          currentPlane?.utilisation?.ACHRS &&
            parseCWHRS(currentPlane?.utilisation?.ACHRS) + dateValue * 101.92
        ),
      });
    }
  };
  // const projAFL = form.getFieldValue('projAFL');
  useEffect(() => {
    form.setFieldsValue({
      targetAFL: Number(currentPlane?.utilisation?.ACAFL) + Number(value),
    });
    form.setFieldsValue({
      targetACHRS: formatCWHRS(
        currentPlane?.utilisation?.ACHRS &&
          parseCWHRS(currentPlane?.utilisation?.ACHRS) + Number(valueACHRS)
      ),
    });
  }, [value, valueACHRS]);

  const handleTypeChange = (value: any) => {
    const dateValue = form.getFieldValue("value");
    const projAFL = form.getFieldValue("projAFL");
    // const targetAFLForm = form.getFieldValue('targetAFL');

    if (value === "day") {
      const date = moment().add(dateValue, "days");
      form.setFieldsValue({ datePickerValue: date });
      form.setFieldsValue({ projAFL: dateValue * 1.5 });
      form.setFieldsValue({ projHRS: dateValue * 3.29 });
      form.setFieldsValue({
        targetAFL: Number(currentPlane?.utilisation?.ACAFL) + dateValue * 1.5,
      });
      form.setFieldsValue({
        targetACHRS: formatCWHRS(
          currentPlane?.utilisation?.ACHRS &&
            parseCWHRS(currentPlane?.utilisation?.ACHRS) + dateValue * 3.29
        ),
      });

      setSelectedEndDate(date ? date.format("YYYY-MM-DD") : null);
    }
    if (value === "mos") {
      const date = moment().add(dateValue, "months");
      form.setFieldsValue({ datePickerValue: date });
      form.setFieldsValue({ projAFL: dateValue * 50 });
      form.setFieldsValue({ projHRS: dateValue * 101.92 });
      form.setFieldsValue({
        targetAFL: Number(currentPlane?.utilisation?.ACAFL) + dateValue * 50,
      });
      form.setFieldsValue({
        targetACHRS: formatCWHRS(
          currentPlane?.utilisation?.ACHRS &&
            parseCWHRS(currentPlane?.utilisation?.ACHRS) + dateValue * 101.92
        ),
      });
      setSelectedEndDate(date ? date.format("YYYY-MM-DD") : null);
    }
  };
  const date = form.getFieldValue("datePickerValue");
  const formattedDate = date ? date.format("YYYY-MM-DD") : null;

  useEffect(() => {
    form.setFieldsValue({ type: localStorage.getItem("dueMosType") || "mos" });
    handleTypeChange("mos");
    handleValueChange("mos");
    form.setFieldsValue({ value: localStorage.getItem("dueValue") || 2 });
    form.setFieldsValue({
      targetACHRS:
        localStorage.getItem("targetACHRS") ||
        formatCWHRS(
          currentPlane?.utilisation?.ACHRS &&
            parseCWHRS(currentPlane?.utilisation?.ACHRS) + 2 * 101.92
        ),
    });
    form.setFieldsValue({
      projHRS: localStorage.getItem("projHRS") || 2 * 101.92,
    });
    form.setFieldsValue({
      projAFL: localStorage.getItem("projAFL") || 2 * 50,
    });
    form.setFieldsValue({
      targetAFL:
        localStorage.getItem("targetAFL") ||
        Number(currentPlane?.utilisation?.ACAFL) + 2 * 50,
    });
  }, []);
  const handleChange = (inputValue: any) => {
    setValue(inputValue);
  };
  const handleChangeACHRS = (inputValue: any) => {
    setValueACHRS(inputValue);
  };

  return (
    <div
      className="flex flex-col mx-auto "
      style={{
        width: "100%",
        height: `${!isMenuCollapse ? "100%" : "35vh"}`,
      }}
    >
      <ProForm
        name="DUEfILTERS"
        onFinish={async (values: any) => {
          const result = await dispatch(
            getFilteredPlanesTasksForDue({
              dateIn: selectedStartDate || moment().format("YYYY-MM-DD"),
              dateOut: selectedEndDate,
              planeID: currentPlane?.id || currentPlane?._id,
              taskType: selectedValuesTaskype,
              targetACAFL: form.getFieldValue("targetAFL"),
              targetACHRS: form.getFieldValue("targetACHRS"),
            })
          );
          if (result.meta.requestStatus === "fulfilled") {
            localStorage.setItem("dueINDate", selectedStartDate);
            localStorage.setItem("dueOUTDate", selectedEndDate);
            localStorage.setItem("dueValue", form.getFieldValue("value"));
            localStorage.setItem("dueMosType", form.getFieldValue("type"));
            localStorage.setItem(
              "targetACHRS",
              form.getFieldValue("targetACHRS")
            );
            localStorage.setItem("projHRS", form.getFieldValue("projHRS"));
            localStorage.setItem("targetAFL", form.getFieldValue("targetAFL"));
            localStorage.setItem("projAFL", form.getFieldValue("projAFL"));
          } else {
            // toast.error('Error');
          }
        }}
        form={form}
        className=" mx-auto py-5"
      >
        <Form.Item label="LIMIT">
          <Space.Compact>
            <Form.Item
              name="value"
              noStyle
              // rules={[{ required: true, message: 'Value is required' }]}
            >
              <InputNumber
                onChange={handleValueChange}
                style={{ width: "30%" }}
                placeholder="value"
              />
            </Form.Item>
            <Form.Item
              name="type"
              noStyle
              // rules={[{ required: true, message: 'DAY/MOS is required' }]}
            >
              <Select
                style={{ width: "35%" }}
                onChange={handleTypeChange}
                allowClear
                placeholder="mos"
              >
                <Option value="mos">MOS</Option>
                <Option value="day">DAY</Option>
              </Select>
            </Form.Item>{" "}
            <Form.Item noStyle name="datePickerValue">
              <DatePicker disabled onChange={onChange} allowClear></DatePicker>
            </Form.Item>
          </Space.Compact>
        </Form.Item>
        <Form.Item label="RANGE" name="dateIn">
          <RangePicker allowClear onChange={onChange}></RangePicker>
        </Form.Item>

        <Form.Item label="TYPE" name="taskType">
          <MultiSelectForm
            options={[
              { key: "AD", value: "AIRWORTHINESS DIRECTIVE" },
              { key: "SMC", value: "SHEDULED MAINTENENCE CHEACK" },
              { key: "SB", value: "SB" },
              { key: "PKGOP", value: "PACKAGE" },
              { key: "ADP", value: "ADP " },
              { key: "PN", value: "COMPONENT" },
            ]}
            onChange={handleMultiSelectTaskType}
            mode={"multiple"}
          />
        </Form.Item>
        {/* <Divider /> */}
        <div className="text-sky-600 font-semibold">
          {currentPlane?.utilisation?.ACDATE &&
            moment(currentPlane?.utilisation?.ACDATE).format("DD-MM-YYYY")}
        </div>

        <Row align={"middle"} gutter={[16, 16]}>
          <Col span={4}></Col>
          <Col span={6}>CURRENT</Col>
          <Col span={7}>
            <div>PROJECT</div>
          </Col>
          <Col span={7}>TARGET</Col>
        </Row>
        {/* <Divider className="my-o py-0" /> */}
        <Form.Item name={"ACHRS"}>
          <div className="text-sky-600 font-semibold"> A/C</div>
          <Row align={"middle"} gutter={[16, 16]}>
            <Col span={4}>
              <div>HRS</div>
            </Col>
            <Col span={6}>
              <div>{currentPlane?.utilisation?.ACHRS}</div>
            </Col>
            <Col span={7}>
              <Form.Item noStyle name="projHRS">
                <InputNumber
                  onChange={handleChangeACHRS}
                  className="w-full"
                ></InputNumber>
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item noStyle name={"targetACHRS"}>
                <Input
                  value={
                    valueACHRS && currentPlane?.utilisation?.ACHRS
                      ? parseInt(valueACHRS) +
                        parseCWHRS(currentPlane?.utilisation?.ACHRS)
                      : ""
                  }
                  disabled
                ></Input>
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item>
          <Row align={"middle"} gutter={[16, 16]}>
            <Col span={4}>
              <div>AFL</div>
            </Col>
            <Col span={6}>
              <div>{currentPlane?.utilisation?.ACAFL}</div>
            </Col>
            <Col span={7}>
              <Form.Item noStyle name={"projAFL"}>
                <InputNumber
                  className="w-full"
                  onChange={handleChange}
                ></InputNumber>
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item noStyle name={"targetAFL"}>
                <Input
                  value={
                    value && currentPlane?.utilisation?.ACAFL
                      ? parseInt(value) + currentPlane?.utilisation?.ACAFL
                      : ""
                  }
                  disabled
                ></Input>
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
      </ProForm>
    </div>
  );
};

export default DUEFiltersForm;
