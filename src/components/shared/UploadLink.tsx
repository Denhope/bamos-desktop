import React, { FC, useEffect, useState } from 'react';
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
  onUpload: (file: FormData | any) => Promise<any>;
  isUploadTrue?: boolean;
  onSuccess: (response: any) => void;
  acceptedFileTypes: AcceptedFileTypes[];
}

const FileUploader: FC<FileUploaderProps> = ({
  onUpload,
  onSuccess,
  acceptedFileTypes,
  isUploadTrue,
}) => {
  const [fileList, setFileList] = useState<any[]>([]);

  const handleUpload = async () => {
    // if (fileList[0].status === 'done') {
    const formData = new FormData();
    formData.append('file', fileList[0].originFileObj);
    if (isUploadTrue) {
      const response = await onUpload(formData);
      if (response) {
        message.success('Файл успешно загружен');
        onSuccess(response);
      } else message.error('Ошибка');
    }
  };

  const handleChange = (info: UploadChangeParam) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    setFileList(fileList as RcFile[]);
  };
  useEffect(() => {
    if (fileList.length && isUploadTrue === true) {
      // setSecectedStore(initialStore);

      handleUpload();
    }
  }, [fileList, isUploadTrue]);
  const { t } = useTranslation();

  return (
    <Space className="flex justify-between ">
      <Upload
        multiple
        name="file"
        className="upload-list-inline cursor-pointer"
        fileList={fileList as any[]}
        onChange={handleChange}
        beforeUpload={() => false}
        accept={acceptedFileTypes.join(',')}
      >
        <Button size="small" icon={<UploadOutlined />}>
          {t('CLICK TO UPLOAD')}
        </Button>
      </Upload>
    </Space>
  );
};

export default FileUploader;
