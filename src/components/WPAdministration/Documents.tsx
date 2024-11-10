// @ts-nocheck

import React, { FC, useState, useEffect } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';

interface Document {
  id: number;
  name: string;
  revision: string;
  revisionDate: string;
  description: string;
}

interface DocumentsProps {
  documents?: Document[];
  onDocumentsChange: (documents: Document[]) => void;
  wo?: any;
}

const defaultDocuments: Document[] = [
  { id: 1, name: 'MPD', revision: '', revisionDate: '', description: '' },
  { id: 2, name: 'AMM', revision: '', revisionDate: '', description: '' },
  { id: 3, name: 'SRM', revision: '', revisionDate: '', description: '' },
  { id: 4, name: 'TC', revision: '', revisionDate: '', description: '' },
  { id: 5, name: 'IPC', revision: '', revisionDate: '', description: '' },
  { id: 6, name: 'NDTM', revision: '', revisionDate: '', description: '' },
];

const documentTypes = [
  { value: 'MPD', label: 'MPD' },
  { value: 'AMM', label: 'AMM' },
  { value: 'SRM', label: 'SRM' },
  { value: 'TC', label: 'TC' },
  { value: 'IPC', label: 'IPC' },
  { value: 'NDTM', label: 'NDTM' },
  { value: 'OTHER', label: 'Other' },
];

const Documents: FC<DocumentsProps> = ({
  documents = defaultDocuments,
  onDocumentsChange,
  wo,
}) => {
  const { t } = useTranslation();
  const [documentsData, setDocuments] = useState<Document[]>(documents);

  useEffect(() => {
    setDocuments(documents);
  }, [documents]);

  const handleAddDocument = () => {
    const newDocument: Document = {
      id: Date.now(),
      name: '',
      revision: '',
      revisionDate: '',
      description: '',
    };
    setDocuments((prevDocuments) => {
      const updatedDocuments = [...prevDocuments, newDocument];
      onDocumentsChange(updatedDocuments);
      return updatedDocuments;
    });
  };

  const handleChange = (id: number, field: keyof Document, value: string) => {
    setDocuments((prevDocuments) => {
      const updatedDocuments = prevDocuments.map((doc) =>
        doc.id === id ? { ...doc, [field]: value } : doc
      );
      onDocumentsChange(updatedDocuments);
      return updatedDocuments;
    });
  };

  const handleRemoveDocument = (id: number) => {
    setDocuments((prevDocuments) => {
      const updatedDocuments = prevDocuments.filter((doc) => doc.id !== id);
      onDocumentsChange(updatedDocuments);
      return updatedDocuments;
    });
  };

  const isDisabled = wo?.status === 'CLOSED' || wo?.status === 'COMPLETED';

  return (
    <div className="documents-container">
      {documentsData &&
        documentsData.length > 0 &&
        documentsData.map((doc, index) => (
          <div key={doc.id}>
            {index > 0 && <Divider style={{ margin: '16px 0' }} />}
            <ProForm.Group
              disabled={isDisabled}
              size="small"
              className="document-group"
            >
              <ProFormSelect
                name={`name-${doc.id}`}
                label={t('TYPE')}
                initialValue={doc.name}
                options={documentTypes}
                onChange={(value) => handleChange(doc.id, 'name', value)}
                className="document-input"
              />
              <ProFormText
                name={`revision-${doc.id}`}
                label={t('REVISION')}
                initialValue={doc.revision}
                onChange={(e) =>
                  handleChange(doc.id, 'revision', e.target.value)
                }
                className="document-input"
              />
              <ProFormText
                name={`revisionDate-${doc.id}`}
                label={t('DATE')}
                initialValue={doc.revisionDate}
                onChange={(e) =>
                  handleChange(doc.id, 'revisionDate', e.target.value)
                }
                className="document-input"
              />
              <ProForm.Item>
                <Button
                  type="default"
                  danger
                  icon={<MinusOutlined />}
                  onClick={() => handleRemoveDocument(doc.id)}
                  disabled={isDisabled}
                />
              </ProForm.Item>
            </ProForm.Group>
          </div>
        ))}

      <div className="add-document-button">
        <Button
          type="default"
          onClick={handleAddDocument}
          icon={<PlusOutlined />}
          disabled={isDisabled}
        >
          {t('ADD DOC')}
        </Button>
      </div>

      <style jsx>{`
        .documents-container {
          width: 100%;
        }
        .document-group {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .document-input {
          flex: 1;
          min-width: 200px;
        }
        .add-document-button {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
          margin-bottom: 16px;
        }
        @media (max-width: 768px) {
          .document-group {
            flex-direction: column;
          }
          .document-input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Documents;
