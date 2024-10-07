import React, { FC, useState } from 'react';
import { FileOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { ModalForm } from '@ant-design/pro-components';
// Убедитесь, что путь к ModalForm правильный

export interface File {
  id: string;
  name: string;
}

interface FileModalListProps {
  files: File[];
  onFileSelect: (file: File) => void;
  onFileOpen: (file: File) => void;
}

const FileModalList: FC<FileModalListProps> = ({
  files,
  onFileSelect,
  onFileOpen,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleFileClick = (file: File) => {
    setSelectedFile(file);
    onFileOpen(file);
  };

  if (!files || files.length === 0) {
    return null; // Возвращаем null, если файлов нет
  }

  return (
    <div>
      <div className="cursor-pointer hover:text-blue-500" onClick={showModal}>
        <FileOutlined />
      </div>
      <ModalForm
        submitter={false}
        title="Выберите файл для загрузки"
        open={isModalVisible}
        onOpenChange={setIsModalVisible}
      >
        {files.map((file, index) => (
          <div
            key={index}
            className="hover:bg-blue-100 p-2 cursor-pointer flex justify-between items-center"
            onDoubleClick={() => handleFileClick(file)}
          >
            <span>{file.name}</span>
            <Button
              icon={<DownloadOutlined />}
              onClick={(e) => {
                e.stopPropagation(); // Предотвращаем всплытие события к родительскому элементу
                onFileSelect(file);
              }}
            />
          </div>
        ))}
      </ModalForm>
    </div>
  );
};

export default FileModalList;
