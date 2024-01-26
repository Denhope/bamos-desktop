import React from 'react';
import { Select } from 'antd';

const { Option } = Select;
interface FileSelectorProps {
  files: { id: string; name: string }[];
  onFileSelect: (file: { id: string; name: string }) => Promise<void>;
  isWide?: boolean;
}

const FileSelector: React.FC<FileSelectorProps> = ({
  files,
  onFileSelect,
  isWide,
}) => {
  const handleChange = async (value: string) => {
    // Найдите файл по его id
    const file = files.find((file) => file.id === value);
    if (file) {
      await onFileSelect(file);
    }
  };

  return (
    <Select
      placeholder={'FILES'}
      style={{ width: isWide ? '200px' : '60%' }}
      size="small"
      onChange={handleChange}
      defaultValue={files[0]?.id}
    >
      {files.map((file) => (
        <Option key={file.id} value={file.id}>
          {file.name}
        </Option>
      ))}
    </Select>
  );
};

export default FileSelector;
