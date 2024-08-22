// @ts-nocheck

import React, { FC, useState, useEffect } from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
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
}

const defaultDocuments: Document[] = [
  { id: 1, name: 'MPD', revision: '', revisionDate: '', description: '' },
  { id: 2, name: 'AMM', revision: '', revisionDate: '', description: '' },
  { id: 3, name: 'SRM', revision: '', revisionDate: '', description: '' },
  { id: 4, name: 'TC', revision: '', revisionDate: '', description: '' },
  { id: 5, name: 'IPC', revision: '', revisionDate: '', description: '' },
  { id: 6, name: 'NDTM', revision: '', revisionDate: '', description: '' },
];

const Documents: FC<DocumentsProps> = ({
  documents = defaultDocuments,
  onDocumentsChange,
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

  return (
    <div>
      {documentsData.map((doc, index) => (
        <div key={doc.id}>
          {index > 0 && <Divider style={{ margin: '16px 0' }} />}
          <ProForm.Group size="small">
            <ProFormText
              width="xs"
              name={`name-${doc.id}`}
              label={t('TYPE')}
              initialValue={doc.name}
              onChange={(e) => handleChange(doc.id, 'name', e.target.value)}
            />
            <ProFormText
              width="sm"
              name={`revision-${doc.id}`}
              label={t('REVISION')}
              initialValue={doc.revision}
              onChange={(e) => handleChange(doc.id, 'revision', e.target.value)}
            />
            <ProFormText
              name={`revisionDate-${doc.id}`}
              label={t('DATE')}
              initialValue={doc.revisionDate}
              onChange={(e) =>
                handleChange(doc.id, 'revisionDate', e.target.value)
              }
            />
            <ProForm.Item>
              <Button
                type="default"
                danger
                icon={<MinusOutlined />}
                onClick={() => handleRemoveDocument(doc.id)}
              />
            </ProForm.Item>
          </ProForm.Group>
        </div>
      ))}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        <Button
          type="default"
          onClick={handleAddDocument}
          icon={<PlusOutlined />}
        >
          {t('ADD DOC')}
        </Button>
      </div>
    </div>
  );
};

export default Documents;
