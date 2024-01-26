import React, { FC, useState } from 'react';
import { Upload, Button, Space, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import { useTranslation } from 'react-i18next';

// Определение типов файлов
export enum AcceptedFileTypes {
  JPEG = '.jpeg',
  JPG = '.jpg',
  PNG = '.png',
  PDF = '.pdf',
  // Добавьте больше типов файлов по мере необходимости
}

// Определение пропсов
interface FileUploaderProps {
  onUpload: (file: FormData) => Promise<any>;
  onSuccess: (response: any) => void;
  acceptedFileTypes: AcceptedFileTypes[];
}

const FileUploader: FC<FileUploaderProps> = ({
  onUpload,
  onSuccess,
  acceptedFileTypes,
}) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const { t } = useTranslation();
  const handleUpload = async () => {
    // if (fileList[0].status === 'done') {
    const formData = new FormData();
    formData.append('file', fileList[0].originFileObj);

    const response = await onUpload(formData);
    if (response) {
      message.success('SUCCESS');
      onSuccess(response);
    } else message.error('ERROR');
  };
  // else {
  //   console.error('Файл еще не был полностью загружен');
  // }
  // };

  const handleChange = (info: UploadChangeParam) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    setFileList(fileList as RcFile[]);
  };

  return (
    <Space className="flex justify-between ">
      <Upload
        name="file"
        fileList={fileList as any[]}
        onChange={handleChange}
        beforeUpload={() => false}
        accept={acceptedFileTypes.join(',')}
      >
        <Button icon={<UploadOutlined />}>{t('SELECT FILE')}</Button>
      </Upload>
      <Button onClick={handleUpload} disabled={fileList.length === 0}>
        {t('LOAD FILE')}
      </Button>
    </Space>
  );
};

export default FileUploader;
