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
import PartsTable from '@/components/shared/Table/PartsTable';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { useGetPlanesQuery } from '@/features/ACAdministration/acApi';
import { ProFormSelect } from '@ant-design/pro-components';
import { useGlobalState } from '@/components/woAdministration/GlobalStateContext';
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
}

const FileListE: React.FC<FileListEProps> = ({
  initialFiles,
  onAddFile,
  onSelectedKeys,
  handleDelete,
  isTaskNumberField,
  isEfectivityField = false,
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
    { id: 'TASK_CARD', name: 'TASK_CARD' },
    { id: 'REPORT', name: 'REPORT' },
    { id: 'OTHER', name: 'OTHER' },
  ];

  // Синхронизация состояния `files` с пропсами `initialFiles`
  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const { t } = useTranslation();
  const columnDefs = [
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
      headerName: `${t('CARD No')}`,
      field: 'taskCardNumber',
      sortable: true,
      filter: true,
      width: 140,
    },
    {
      headerName: `${t('TASK No')}`,
      field: 'taskNumber',
      sortable: true,
      filter: true,
      width: 140,
    },
    {
      headerName: `${t('EFECTIVITY')}`,
      field: 'efectivityACID',
      sortable: true,
      filter: true,
      width: 140,
      valueFormatter: ({ value }) => {
        if (Array.isArray(value)) {
          return value.map((item) => item.serialNbr).join(', ');
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
  ];

  const handleAddFile = () => {
    if (newFile && uploadFile) {
      const newFileData: NewFileData = {
        ...newFile,
        _id: '',
        fileId: '',
        createdAt: new Date().toISOString(),
        file: uploadFile,
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
  // const handleDelete = (file: any) => {
  //   Modal.confirm({
  //     title: 'Вы уверены, что хотите удалить этот файл?',
  //     onOk: async () => {
  //       try {
  //         const response = await dispatch(
  //           deleteFileUploads({ id: file.id, companyID: COMPANY_ID })
  //         );
  //       } catch (error) {
  //         notification.error({
  //           message: t('ERROR'),
  //           description: t('Error delete files.'),
  //         });
  //       }
  //     },
  //   });
  // };
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
  return (
    <div>
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

      {/* <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          rowData={files}
          columnDefs={columnDefs}
          defaultColDef={{ flex: 1, resizable: true }}
          domLayout="autoHeight"
        />
      </div> */}
      <PartsTable
        rowSelection="single"
        isFilesVisiable={false}
        isChekboxColumn={true}
        isVisible={true}
        isButtonColumn={false}
        pagination={true}
        isEditable={false}
        isAddVisiable={true}
        isButtonVisiable={false}
        height={'35vh'}
        // isLoading={isLoading}
        rowData={files || []}
        columnDefs={columnDefs}
        partNumbers={[]}
        onAddRow={function (): void {}}
        onDelete={function (id: string): void {}}
        onSave={function (data: any): void {}}
        onCellValueChanged={function (params: any): void {}} // onAddRow={onAddRow}
        onRowSelect={function (rowData: any): void {
          setEditinFile && setEditinFile(rowData);
        }}
        onCheckItems={function (keys: any): void {
          setSelectedKeys(keys);

          onSelectedKeys && onSelectedKeys(keys);
        }}
      />
      <Modal
        title="Add New File"
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
            })
          }
        >
          <Form.Item label={`${t('CUSTOMER ID')}`} name="customerCodeID">
            <Select allowClear placeholder="Select a customer">
              {customerOptions.map((option) => (
                <Select.Option key={option.id} value={option.id}>
                  {option.name}
                </Select.Option>
              ))}
            </Select>
            {/* <Form.Item label={`${t('EFECTIVITY')}`} name="customerCodeID">
            <Select allowClear placeholder="Select a customer">
              {customerOptions.map((option) => (
                <Select.Option key={option.id} value={option.id}>
                  {option.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item> */}
          </Form.Item>
          <Form.Item
            label={`${t('REF TYPE')}`}
            name="referenceType"
            rules={[{ required: true, message: 'Please select a file type!' }]}
          >
            <Select allowClear placeholder="Select a file type">
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
              // disabled={!acTypeID} // Disable the select if acTypeID is not set
            />
          )}
          <Form.Item
            label="Upload File"
            name="upload"
            rules={[{ required: true, message: 'Please upload the file!' }]}
          >
            <Upload {...uploadProps} fileList={uploadFile ? [uploadFile] : []}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FileListE;
