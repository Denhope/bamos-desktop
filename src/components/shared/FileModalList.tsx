// import React, { FC, useState } from 'react';
// import { DownloadOutlined, FileOutlined } from '@ant-design/icons';
// import { Modal } from 'antd';

// export interface File {
//   id: string;
//   name: string;
// }

// interface FileModalListProps {
//   files: File[];
//   onFileSelect: (file: File) => void;
// }

// const FileModalList: FC<FileModalListProps> = ({ files, onFileSelect }) => {
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   const showModal = () => {
//     setIsModalVisible(true);
//   };

//   const handleOk = () => {
//     if (selectedFile) {
//       onFileSelect(selectedFile);
//     }
//     setIsModalVisible(false);
//   };

//   const handleCancel = () => {
//     setIsModalVisible(false);
//   };

//   const handleFileClick = (file: File) => {
//     setSelectedFile(file);
//   };

//   return (
//     <div>
//       <div className="cursor-pointer hover:text-blue-500" onClick={showModal}>
//         <FileOutlined />
//       </div>
//       <Modal
//         title="Выберите файл для загрузки"
//         visible={isModalVisible}
//         onOk={handleOk}
//         onCancel={handleCancel}
//       >
//         {files.map((file, index) => (
//           <div
//             key={index}
//             className="hover:bg-blue-100 p-2 cursor-pointer"
//             onClick={() => handleFileClick(file)}
//           >
//             {file.name}
//           </div>
//         ))}
//       </Modal>
//     </div>
//   );
// };

// export default FileModalList;

import React, { FC, useState } from 'react';
import { DownloadOutlined, FileOutlined } from '@ant-design/icons';
import { Modal, Button } from 'antd';
import { ModalForm } from '@ant-design/pro-components';

export interface File {
  id: string;
  name: string;
}

interface FileModalListProps {
  files: File[];
  onFileSelect: (file: File) => void;
  onFileOpen: (file: File) => void; // Добавлен новый обработчик для открытия файла
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
