import { useAppDispatch } from "@/hooks/useTypedSelector";
import React, { FC, useRef, useState } from "react";
import { Form, Upload, Button, Input, AutoComplete, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile } from "antd/lib/upload";
import { getPlanesNumber, uploadExcelFile } from "@/utils/api/thunks";
import { IPlane } from "@/models/IPlane";
import * as XLSX from "xlsx";

const AddTaskPackageform: FC = () => {
  const dispatch = useAppDispatch();

  const [optionsRegNbr, setOptionsRegNbr] = useState([]);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<RcFile[]>([]);

  const [selectedPlane, setSelectedPlane] = useState<any | null>(null);
  const timeoutRefRegNbr = useRef<NodeJS.Timeout | null>(null);

  const handleSearchPlane = async (value: any) => {
    if (timeoutRefRegNbr.current) {
      clearTimeout(timeoutRefRegNbr.current);
    }
    timeoutRefRegNbr.current = setTimeout(async () => {
      setOptionsRegNbr(await getPlanesNumber(value));
    }, 400);
  };
  const handleChange = (info: any) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    setFileList(fileList);
  };

  const handleSelectChangePlane = (plane: IPlane) => {
    form.setFieldsValue({
      regNbr: plane?.regNbr,
    });
  };
  const handleSelectPlane = (value: string) => {
    const plane = optionsRegNbr.find((plane: IPlane) => plane.regNbr === value);
    if (plane) {
      console.log(plane);
      setSelectedPlane(plane);
      handleSelectChangePlane(plane);
    }
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error("Пожалуйста, выберите файл для загрузки");
      return;
    }

    const file: any = fileList[0];
    // if (!file.name.endsWith('.xlsx')) {
    //   message.error('Пожалуйста, выберите файл формата Excel (.xlsx)');
    //   return;
    // }

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      let allData: any[] = [];
      let missingColumns = false;
      workbook.SheetNames.forEach(async (sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        if (json.length > 0) {
          // Проверка наличия определенных столбцов
          const requiredColumns = [
            // 'regNumber',
            // 'taskNbr',
            // 'description',
            // 'tasktypeLookup',
            "ata",
            // 'amtoss',
            // 'packageNbr',
            // 'partSerialNbr',
            // 'intervalMOS',
            // 'intervalHRS',
            // 'intervalAFL',
            // 'intervalDAYS',
            // 'intervalAPUS',
            // 'intervalENC',
            // 'completeDAYS',
            // 'completeMOS',
            // 'completeHRS',
            // 'completeAFL',
            // 'completeENC',
            // 'completeAPUS',
            // 'disposition',
            // 'workOrderNbr',
            // 'effectiveDate',
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
        allData.push(...json);

        try {
          const result = await uploadExcelFile({
            planeID: selectedPlane?._id || "",
            tasks: allData,
          });

          message.success(
            `Данные успешно загружены в MongoDB. Количество загруженных документов: ${allData.length}`
          );
        } catch (err) {
          console.error(err);
          message.error("Ошибка при загрузке данных в MongoDB");
        }
      });
      if (missingColumns) return;
    };
    reader.readAsArrayBuffer(file.originFileObj);
  };

  return (
    <div
      className="flex flex-col mx-auto"
      style={{
        width: "93%",
      }}
    >
      <Form
        name="complex-formк"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 14 }}
        style={{ maxWidth: 600 }}
        onFinish={async (values: any) => {
          handleUpload();
        }}
        form={form}
        className="w-full mx-auto"
      >
        <Form.Item
          rules={[{ required: true }]}
          label="Reg. Number"
          name="regNbr"
        >
          <AutoComplete
            allowClear
            onSelect={handleSelectPlane}
            options={optionsRegNbr.map((plane: IPlane) => ({
              value: plane.regNbr,
            }))}
            onSearch={handleSearchPlane}
          >
            <Input placeholder="please enter A/C Number" />
          </AutoComplete>
        </Form.Item>
        <Form.Item label="Excel File">
          <Upload
            accept=".xlsx"
            beforeUpload={() => false}
            onChange={handleChange}
            fileList={fileList}
          >
            <Button icon={<UploadOutlined />}>Change File</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary">
            Download
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddTaskPackageform;
