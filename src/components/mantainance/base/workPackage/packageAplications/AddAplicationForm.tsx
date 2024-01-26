import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useRef, useState } from "react";
import {
  Form,
  Upload,
  Button,
  Input,
  AutoComplete,
  message,
  DatePicker,
  DatePickerProps,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile } from "antd/lib/upload";
import {
  createNewAplications,
  getPlanesNumber,
  uploadExcelAppFile,
  uploadExcelFile,
} from "@/utils/api/thunks";
import { IPlane } from "@/models/IPlane";
import * as XLSX from "xlsx";
import { RangePickerProps } from "antd/es/date-picker";
import { ProForm, ProFormText } from "@ant-design/pro-components";
import { USER_ID } from "@/utils/api/http";
export interface ITaskDTO {
  id: number;
  taskNumber: string;
  taskDescription?: string;
  amtoss?: string;
  note?: string;
  WOCustomer?: string;
  WOPackageType?: string;
  position?: string;
}
const AddAplicationForm: FC = () => {
  const dispatch = useAppDispatch();
  const companyID = localStorage.getItem("companyID");
  const [form] = Form.useForm();
  const [fileListRoutine, setFileListRoutine] = useState<RcFile[]>([]);
  const [fileListAdd, setFileListAdd] = useState<RcFile[]>([]);

  const handleChangeRoutine = (info: any) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    setFileListRoutine(fileList);
  };

  const handleChangeAdd = (info: any) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    setFileListAdd(fileList);
  };

  const handleUpload = async () => {
    let taskData: any[] = [];
    let addData: any[] = [];

    if (fileListRoutine.length === 0 && fileListAdd.length === 0) {
      message.error("Пожалуйста, выберите файл для загрузки");
      return;
    }
    if (fileListRoutine.length > 0) {
      const file: any = fileListRoutine[0];
      if (!file.name.endsWith(".xlsx")) {
        message.error("Пожалуйста, выберите файл формата Excel (.xlsx)");
        return;
      }
      taskData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          let missingColumns = false;
          let result: any[] = [];
          for (let i = 0; i < workbook.SheetNames.length; i++) {
            const sheetName = workbook.SheetNames[i];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            if (json.length > 0) {
              // Проверка наличия определенных столбцов
              const requiredColumns = [
                "taskNumber",
                "taskDescription",
                "amtoss",
                "WOCustomer",
                "WOPackageType",
              ];
              const firstRow: any = json[0];
              requiredColumns.forEach((column) => {
                if (!(column in firstRow)) {
                  message.error(
                    `Отсутствует столбец "${column}" в листе "${sheetName}"`
                  );
                  missingColumns = true;
                }
              });
            }
            result.push(...json);
          }
          if (missingColumns) resolve([]);
          else resolve(result);
        };
        reader.readAsArrayBuffer(file.originFileObj);
      });
    }

    if (fileListAdd.length > 0) {
      const file: any = fileListAdd[0];
      if (!file.name.endsWith(".xlsx")) {
        message.error("Pleese change  File Excel (.xlsx)");
        return;
      }
      addData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          let missingColumns = false;
          let result: any[] = [];
          for (let i = 0; i < workbook.SheetNames.length; i++) {
            const sheetName = workbook.SheetNames[i];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            if (json.length > 0) {
              // Проверка наличия определенных столбцов
              const requiredColumns = [
                "taskNumber",
                "taskDescription",
                "amtoss",
                "WOCustomer",
                "WOPackageType",
              ];
              const firstRow: any = json[0];
              requiredColumns.forEach((column) => {
                if (!(column in firstRow)) {
                  message.error(
                    `Отсутствует столбец "${column}" в листе "${sheetName}"`
                  );
                  missingColumns = true;
                }
              });
            }
            result.push(...json);
          }
          if (missingColumns) resolve([]);
          else resolve(result);
        };
        reader.readAsArrayBuffer(file.originFileObj);
      });
    }
    try {
      const result = await dispatch(
        createNewAplications({
          planeID: "63b5c9a1b7fd6da202520ea9",
          aplicationName: form.getFieldValue("applicationName"),
          companyName: form.getFieldValue("companyName"),
          planeNumber: form.getFieldValue("regNbr"),
          planeType: form.getFieldValue("planeType"),
          isCreatedProject: false,
          ownerId: USER_ID || "",
          dateOfAplication: new Date(),
          serviceType: form.getFieldValue("serviceType"),
          routineTasks: taskData,
          additionalTasks: addData,
          companyID: (companyID && companyID) || "",
        })
      );
      if (result.meta.requestStatus === "fulfilled") {
        message.success(
          `Data uploaded successfully. Number of uploaded works: ${
            taskData.length + addData.length
          }`
        );
      }
    } catch (err) {
      console.error(err);
      message.error("Error loading data");
    }
  };
  const [selectedDate, setSelectedDate] = useState<any>();
  const onChange = (
    value: DatePickerProps["value"] | RangePickerProps["value"],
    dateString: [string, string] | string
  ) => {
    setSelectedDate(dateString[0]);
  };

  const onOk = (
    value: DatePickerProps["value"] | RangePickerProps["value"]
  ) => {
    // console.log('onOk: ', value);
  };

  return (
    <div
      className="flex flex-col mx-auto"
      style={{
        width: "93%",
      }}
    >
      <ProForm
        name="complex-formк"
        // labelCol={{ span: 8 }}
        // wrapperCol={{ span: 14 }}
        // style={{ maxWidth: 600 }}
        onFinish={async (values: any) => {
          handleUpload();
        }}
        form={form}
        className="w-full mx-auto"
      >
        <ProFormText
          rules={[{ required: true }]}
          label="Company"
          name="companyName"
        />

        {/* <Form.Item
          rules={[{ required: true }]}
          label="Aplication Nbr."
          name="applicationName"
        > */}
        <ProFormText
          label="Aplication Nbr."
          name="applicationName"
          rules={[{ required: true }]}
          allowClear
        />
        {/* </Form.Item> */}

        <ProFormText
          rules={[{ required: true }]}
          label="Service type"
          name="serviceType"
          allowClear
        />

        <ProFormText
          rules={[{ required: true }]}
          label="Reg. Number"
          name="regNbr"
          allowClear
        />

        <ProFormText
          rules={[{ required: true }]}
          label="Plane type"
          name="planeType"
          allowClear
        />

        <Form.Item
          rules={[{ required: true }]}
          label="Date"
          name="dateOfAplication"
        >
          <DatePicker allowClear onChange={onChange} onOk={onOk}></DatePicker>
        </Form.Item>

        <Form.Item label="Tasks Items">
          <Upload
            accept=".xlsx"
            beforeUpload={() => false}
            onChange={handleChangeRoutine}
            fileList={fileListRoutine}
          >
            <Button icon={<UploadOutlined />}>Open</Button>
          </Upload>
        </Form.Item>

        {/* <Form.Item label="Additional Task">
          <Upload
            accept=".xlsx"
            beforeUpload={() => false}
            onChange={handleChangeAdd}
            fileList={fileListAdd}
          >
            <Button icon={<UploadOutlined />}>Open</Button>
          </Upload>
        </Form.Item> */}

        {/* <Form.Item>
          <Button htmlType="submit" type="primary">
            Download
          </Button>
        </Form.Item> */}
      </ProForm>
    </div>
  );
};

export default AddAplicationForm;
