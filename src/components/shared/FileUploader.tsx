import React, { useState } from 'react';
import { Upload, Button, message, notification } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';

interface FileUploaderProps {
  requiredFields: string[];
  onFileProcessed: (data: any[]) => void;
  isDisabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  requiredFields,
  onFileProcessed,
  isDisabled,
}) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const { t } = useTranslation();
  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Convert to array of objects
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1);
      const formattedData = rows.map((row: any) => {
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index];
        });
        return rowData;
      });

      // Validate required fields
      const missingFields = requiredFields.filter((field) =>
        formattedData.some((row: any) => !row[field])
      );

      if (missingFields.length > 0) {
        notification.error({
          message: t('FAILED '),
          description: `Missing required fields: ${missingFields.join(', ')}`,
        });

        return;
      }

      onFileProcessed(formattedData);
    };
    reader.readAsArrayBuffer(file);

    return false; // Prevent automatic upload by Ant Design
  };

  // const handleChange = (info: any) => {
  //   let newFileList = [...info.fileList];
  //   newFileList = newFileList.slice(-1); // Limit to one file
  //   setFileList(newFileList);
  // };
  const handleChange = (info: any) => {
    setFileList([]); // Clear file list to not display any files
  };

  return (
    <Upload
      beforeUpload={handleFileUpload}
      fileList={fileList}
      onChange={handleChange}
      accept=".xlsx, .xls"
    >
      <Button
        disabled={isDisabled}
        size="small"
        icon={<UploadOutlined />}
      >{`${t('IMPORT EXCEL')}`}</Button>
    </Upload>
  );
};

export default FileUploader;
