import React, { useState } from 'react';
import {
  Select,
  Input,
  Typography,
  Button,
  AutoComplete,
  Space,
  notification,
} from 'antd';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Text } = Typography;

const TemplateSelector: React.FC<{
  templates: {
    id: string;
    description: string;
    code: string;
    type: string;
    acTypeID: { _id: string; code: string; name: string }[];
    remarks: string; // Добавляем поле remarks
  }[];
  onSelectTemplate: (templateId: string, description: string) => void;
}> = ({ templates, onSelectTemplate }) => {
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [planeTypeFilter, setPlaneTypeFilter] = useState('');
  const [previewHeight, setPreviewHeight] = useState<number>(20); // Initial preview height

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    const selectedTemplateData = templates?.find((t) => t.id === value);
    console.log(selectedTemplateData);
    if (selectedTemplateData && selectedTemplateData.remarks) {
      notification.info({
        message: t('TEMPLATE SELECTED'),
        description: selectedTemplateData.remarks,
        duration: 5,
      });
    }
  };

  const handlePreviewHeightChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPreviewHeight(Number(e.target.value));
  };

  const typeOptions: string[] = Array.from(
    new Set(templates?.map((template) => template.type) || [])
  ); // Get unique type options
  const planeTypeOptions: string[] = Array.from(
    new Set(
      templates?.flatMap(
        (template) => template.acTypeID?.map((acType) => acType.code) || []
      ) || []
    )
  ); // Get unique plane type options

  const applyFilters = () => {
    const selectedTemplateData = templates?.find(
      (t) => t.id === selectedTemplate
    );
    if (selectedTemplateData) {
      onSelectTemplate(
        selectedTemplateData.id,
        selectedTemplateData.description
      );
    }
  };

  return (
    <div style={{ padding: '0 10px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="flex flex-wrap gap-2">
          <AutoComplete
            allowClear
            style={{ width: 200 }}
            value={typeFilter}
            options={typeOptions.map((option) => ({
              value: option,
              label: option === 'action' ? t('ACTION') : t('STEP'),
            }))}
            onChange={(value) => setTypeFilter(value)}
            placeholder={t('TYPE')}
          />

          <AutoComplete
            allowClear
            style={{ width: 200 }}
            value={planeTypeFilter}
            options={planeTypeOptions.map((option) => ({ value: option }))}
            onChange={(value) => setPlaneTypeFilter(value)}
            placeholder={t('PLANE TYPE')}
          />
        </div>
        <Select
          allowClear
          style={{ width: '100%' }}
          onChange={handleTemplateChange}
          placeholder={t('SELECT TEMPLATE')}
          showSearch
          filterOption={(input, option: any) =>
            option.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {templates
            ?.filter(
              (template) =>
                (typeFilter === '' || template.type === typeFilter) &&
                (planeTypeFilter === '' ||
                  template.acTypeID?.some(
                    (acType) => acType.code === planeTypeFilter
                  ))
            )
            .map((template) => (
              <Select.Option key={template.id} value={template.id}>
                {template.code}
              </Select.Option>
            ))}
        </Select>
        <div style={{ position: 'relative' }}>
          <TextArea
            rows={previewHeight}
            value={
              selectedTemplate
                ? templates?.find((t) => t.id === selectedTemplate)?.description
                : ''
            }
            onChange={handlePreviewHeightChange}
            style={{ width: '100%' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              padding: '5px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderLeft: '1px solid #d9d9d9',
              borderTop: '1px solid #d9d9d9',
              borderRadius: '4px 0 0 0',
            }}
          ></div>
        </div>
        <Button type="dashed" onClick={applyFilters}>
          {t('APPLY TEMPLATE')}
        </Button>
      </Space>
    </div>
  );
};

export default TemplateSelector;
