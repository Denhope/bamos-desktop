import React, { useState } from 'react';
import { Select, Input, Typography, Button, AutoComplete, Space } from 'antd';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Text } = Typography;

const TemplateSelector: React.FC<{
  templates: {
    id: string;
    name: string;
    content: string;
    type: string;
    planeType: string;
  }[];
  onSelectTemplate: (templateId: string) => void;
}> = ({ templates, onSelectTemplate }) => {
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [planeTypeFilter, setPlaneTypeFilter] = useState('');
  const [previewHeight, setPreviewHeight] = useState<number>(20); // Initial preview height

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
  };

  const handlePreviewHeightChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPreviewHeight(Number(e.target.value));
  };

  const typeOptions: string[] = Array.from(
    new Set(templates.map((template) => template.type))
  ); // Get unique type options
  const planeTypeOptions: string[] = Array.from(
    new Set(templates.map((template) => template.planeType))
  ); // Get unique plane type options

  const applyFilters = () => {
    onSelectTemplate(selectedTemplate || '');
  };

  return (
    <div style={{ padding: '0 10px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="flex flex-wrap gap-2">
          <AutoComplete
            allowClear
            style={{ width: 200 }}
            value={typeFilter}
            options={typeOptions.map((option) => ({ value: option }))}
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
            .filter(
              (template) =>
                (typeFilter === '' || template.type === typeFilter) &&
                (planeTypeFilter === '' ||
                  template.planeType === planeTypeFilter)
            )
            .map((template) => (
              <Select.Option key={template.id} value={template.id}>
                {template.name}
              </Select.Option>
            ))}
        </Select>
        <TextArea
          rows={19}
          value={
            selectedTemplate
              ? templates.find((t) => t.id === selectedTemplate)?.content
              : ''
          }
          onChange={handlePreviewHeightChange}
          style={{ width: '100%' }}
        />
        <Button type="primary" onClick={applyFilters}>
          {t('APPLY')}
        </Button>
      </Space>
    </div>
  );
};

export default TemplateSelector;
