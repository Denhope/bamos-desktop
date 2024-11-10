// @ts-nocheck

import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  Upload,
  UploadProps,
  Space,
  Select,
  notification,
  Checkbox,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  FileOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { COMPANY_ID } from '@/utils/api/http';
import { RcFile, UploadChangeParam } from 'antd/es/upload';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { handleFileOpenTask } from '@/services/utilites';
import { useTranslation } from 'react-i18next';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';
import { useAppDispatch } from '@/hooks/useTypedSelector';
// import { useGetPlanesQuery } from '@/features/ACAdministration/acApi';
import { ProFormSelect } from '@ant-design/pro-components';
import { useGlobalState } from '@/components/woAdministration/GlobalStateContext';
import { updateFilePrintAsAttachment } from '@/utils/api/thunks';
import { useGetPlanesQuery } from '@/features/acAdministration/acApi';

// types.ts
export interface FileData {
  _id: string;
  filename: string;
  fileId: string;
  taskPrefix?: string;
  referenceType: string;
  taskNumber?: string;
  taskNumberID: string;
  customerCodeID?: any;
  acTypeId: string;
  companyID: string;
  createdAt: string;
  taskCardNumber?: number;
  efectivityACID?: any;
  type: string; // Добавлено поле type
  printAsAttachment?: boolean; // Добавлено поле для отметки печати как вложения
  isDefaultFile?: boolean;
}

interface NewFileData extends FileData {
  file: File;
  saveFail?: boolean;
}

// Определяем интерфейс для пропсов
interface FileListEProps {
  initialFiles: FileData[];
  onAddFile: (file: NewFileData) => void;
  onSelectedKeys?: (keys: any[]) => void;
  handleDelete?: (keys: any) => void;
  isTaskNumberField: boolean;
  isEfectivityField?: boolean;
  isCuctomerCode?: boolean;
  isDefaultFileDisable?: boolean;
  // Добавлен параметр для отключения редактирования дефолтных файлов
  height?: string;
}

const FileListE: React.FC<FileListEProps> = ({
  initialFiles,
  onAddFile,
  onSelectedKeys,
  handleDelete,
  isTaskNumberField,
  isCuctomerCode,
  isEfectivityField = false,
  isDefaultFileDisable = true,
  height = '44vh', // По умолчанию false
}) => {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [files, setFiles] = useState<FileData[]>(initialFiles);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newFile, setNewFile] = useState<Partial<NewFileData> | null>(null);
  const [uploadFile, setUploadFile] = useState<RcFile | null>(null);
  const dispatch = useAppDispatch();
  // Пример данных для Select
  const customerOptions = [
    { id: '66a7c334af08e2143903684a', name: 'LCV' },
    { id: '66a9eec7af08e2143903688b', name: 'THY' },
  ];

  const typeOptions = [
    { id: 'TASK_CARD', name: 'TASK CARD' },
    { id: 'REPORT', name: 'REPORT' },
    { id: 'WO', name: 'WO' },
    { id: 'AMM', name: 'AMM' },
    { id: 'OTHER', name: 'OTHER' },
  ];

  // Синхронизация состояния `files` с пропсами `initialFiles`
  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const { t } = useTranslation();
  const columnDefs = [
    {
      headerName: `${t('TYPE')}`,
      field: 'referenceType',
      sortable: true,
      filter: true,
      width: 140,
    },
    {
      headerName: `${t('FILENAME')}`,
      field: 'filename',
      sortable: true,
      filter: true,
      width: 140,
    },
    {
      headerName: `${t('CUSTOMER ID')}`,
      field: 'taskPrefix',
      sortable: true,
      filter: true,
      width: 140,
    },
    {
      headerName: `${t('REF No')}`,
      field: 'taskCardNumber',
      sortable: true,
      filter: true,
      width: 110,
    },
    {
      headerName: `${t('TASK No')}`,
      field: 'taskNumber',
      sortable: true,
      filter: true,
      width: 140,
    },
    {
      headerName: `${t('AIRCRAFT REG')}`,
      field: 'efectivityACID',
      sortable: true,
      filter: true,
      width: 140,
      valueFormatter: ({ value }) => {
        if (Array.isArray(value)) {
          return value.map((item) => item?.regNbr).join(', ');
        }
        return '';
      },
    },
    {
      headerName: `${t('CREATE DATE')}`,
      field: 'createdAt',
      sortable: true,
      filter: true,
      width: 140,
      valueFormatter: ({ value }: { value: string }) =>
        new Date(value).toLocaleString(),
    },
    {
      field: 'fileId',
      headerName: `${t('DOC')}`,
      width: 140,
      cellRenderer: (params: any) => (
        <div
          className="cursor-pointer hover:text-blue-500"
          onClick={() => {
            handleFileOpenTask(params.value, 'uploads', params.data.filename);
          }}
        >
          <FileOutlined />
        </div>
      ),
    },
    {
      headerName: `${t('PRINT AS ATTACHMENT')}`,
      field: 'printAsAttachment',
      width: 140,
      cellRenderer: (params: any) => {
        if (isDefaultFileDisable && params.data.isDefaultFile) {
          return null; // Не отображаем чекбокс для дефолтных файлов, если isDefaultFileDisable === true
        }
        return (
          <Checkbox
            checked={params.data.printAsAttachment}
            onChange={(e) => {
              const updatedFiles = files.map((file) =>
                file._id === params.data._id
                  ? { ...file, printAsAttachment: e.target.checked }
                  : file
              );
              setFiles(updatedFiles);

              // Отправка запроса на сервер для обновления свойства printAsAttachment
              dispatch(
                updateFilePrintAsAttachment({
                  fileId: params.data._id,
                  printAsAttachment: e.target.checked,
                  companyID: COMPANY_ID,
                  // type: params.data.type, // Если type есть в params.data
                  // itemID: params.data.taskNumberID, // Если itemID есть в params.data
                })
              );
            }}
          />
        );
      },
    },
  ];

  const handleAddFile = () => {
    if (newFile && uploadFile) {
      const newFileData: NewFileData = {
        ...newFile,
        _id: '',
        fileId: '',
        createdAt: new Date().toISOString(),
        file: uploadFile,
        printAsAttachment: false, // Добавлено поле для отметки печати как вложения
      } as NewFileData;
      onAddFile(newFileData);
      setNewFile(null);
      setUploadFile(null);
      setIsModalVisible(false);
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      setUploadFile(file);
      return false; // Останавливает автоматическую загрузку, чтобы можно было вручную обработать файл
    },
    onChange: (info: UploadChangeParam) => {
      if (info.file.status === 'removed') {
        setUploadFile(null);
      }
    },
  };

  const [editingFile, setEditinFile] = useState<any | null>(null);
  const [selectedAcTypeID, setSelectedAcTypeID] = useState<string>('');
  const { data: planes } = useGetPlanesQuery({});
  const planesValueEnum: Record<string, { text: string; value: string }> =
    planes?.reduce((acc, reqType) => {
      // Check if reqType.acTypeID exists and has at least one element
      if (reqType.acTypeID && reqType.acTypeID.length > 0) {
        acc[reqType.id] = { text: reqType.regNbr, value: reqType.acTypeID[0] };
      } else {
        // If reqType.acTypeID is undefined or empty, set value to an empty string or handle it as appropriate for your use case
        acc[reqType.id] = { text: reqType.regNbr, value: '' };
      }
      return acc;
    }, {}) || {};
  // const dispatch = useAppDispatch();

  const handlePrintAsAttachmentChange = (
    fileId: string,
    printAsAttachment: boolean
  ) => {
    dispatch(
      updateFilePrintAsAttachment({
        fileId,
        printAsAttachment,
        companyID: COMPANY_ID,
      })
    );
  };
  return (
    <div className="flex flex-col mb-3">
      <Space>
        <Button
          className="mb-3"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          {t('ADD FILE')}
        </Button>
        <Button
          disabled={!selectedKeys.length}
          className="mb-3"
          icon={<MinusOutlined />}
          onClick={() => handleDelete && handleDelete(editingFile?.fileId)}
        >
          {t('DELETE FILE')}
        </Button>
      </Space>

      <UniversalAgGrid
        isChekboxColumn
        gridId="fileListGrid"
        rowData={files || []}
        columnDefs={columnDefs}
        height={height} // Используем проп height
        onRowSelect={(rowData: any) => {
          setEditinFile && setEditinFile(rowData[0]);
        }}
        // onSelectionChanged={(selectedRows) => {
        //   // const keys = selectedRows.map((row) => row._id);
        //   setSelectedKeys(selectedRows);
        //   onSelectedKeys && onSelectedKeys(selectedRows);
        // }}
        onCheckItems={(selectedKeys) => {
          setSelectedKeys(selectedKeys);
        }}
        isMultiSelect={false}
        isCheckboxSelection={true}
        pagination={true}
      />
      <Modal
        title={`${t('Add New File')}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleAddFile}
      >
        <Form
          layout="vertical"
          onValuesChange={(_, values) =>
            setNewFile({
              ...values,
              _id: '',
              createdAt: new Date().toISOString(),
              printAsAttachment: false, // Добавлено поле для отметки печати как вложения
            })
          }
        >
          {isCuctomerCode && (
            <Form.Item label={`${t('CUSTOMER ID')}`} name="customerCodeID">
              <Select allowClear placeholder="Выберите значение">
                {customerOptions.map((option) => (
                  <Select.Option key={option.id} value={option.id}>
                    {option.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item
            label={`${t('REF TYPE')}`}
            name="referenceType"
            placeholder="Выберите значение"
            rules={[{ required: true, message: 'Please select a file type!' }]}
          >
            <Select allowClear>
              {typeOptions.map((option) => (
                <Select.Option key={option.id} value={option.id}>
                  {option.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {isTaskNumberField && (
            <Form.Item label={`${t('TASK No')}`} name="taskNumber">
              <Input allowClear></Input>
            </Form.Item>
          )}
          {isEfectivityField && (
            <ProFormSelect
              showSearch
              mode="multiple"
              name="efectivityACID"
              label={t('EFECTIVTY')}
              width="sm"
              valueEnum={planesValueEnum}
              onChange={(value: any) => setSelectedAcTypeID(value)}
            />
          )}
          <Form.Item
            label={t('Upload File')}
            name="upload"
            rules={[{ required: true, message: 'Please upload the file!' }]}
          >
            <Upload {...uploadProps} fileList={uploadFile ? [uploadFile] : []}>
              <Button icon={<UploadOutlined />}>{t('Select File')}</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FileListE;
