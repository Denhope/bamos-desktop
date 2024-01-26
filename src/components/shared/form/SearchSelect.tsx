import React, { FC, useEffect, useState } from 'react';
import { ProFormSelect } from '@ant-design/pro-form';

interface SearchSelectProps<T> {
  name: string;
  onSearch: (searchValue: string) => Promise<any>;
  optionLabel1?: keyof T;
  optionLabel2?: keyof T;
  onSelect: (selectedValue: any) => void;
  label: string;
  tooltip: string;
  rules: any[];
  isReset?: boolean;
  onDoubleClick?: () => void; // новый пропс
  initialValue?: string; // новый пропс
  width?: 'lg' | 'sm' | 'xs';
}

const SearchSelect: FC<SearchSelectProps<any>> = ({
  name,
  onSearch,
  optionLabel1,
  optionLabel2,
  onSelect,
  label,
  tooltip,
  rules,
  isReset,
  onDoubleClick,
  initialValue, // новый пропс
  width,
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [value, setValue] = useState<string>(initialValue || '');
  useEffect(() => {
    if (isReset) {
      setValue('');
      onSelect(null);
    }
  }, [isReset]);

  const handleSearch = async (value: string) => {
    const results = await onSearch(value);
    if (results && typeof results === 'object' && 'payload' in results) {
      setOptions(results.payload);
    } else if (Array.isArray(results)) {
      setOptions(results);
    }
  };

  const handleChange = (value: string) => {
    const selectedOption = options.find((option) => {
      if (optionLabel1 && optionLabel2) {
        return option[optionLabel1] + ' - ' + option[optionLabel2] === value;
      } else if (optionLabel1) {
        return option[optionLabel1] === value;
      }
    });
    if (selectedOption) {
      onSelect(selectedOption);
      setValue(optionLabel1 ? selectedOption[optionLabel1] : '');
    }
  };
  useEffect(() => {
    setValue(initialValue || ''); // обновляем value при изменении initialValue
  }, [initialValue]);

  return (
    <div style={{ cursor: 'pointer' }} onDoubleClick={onDoubleClick}>
      <ProFormSelect
        width={width}
        name={name}
        label={label}
        tooltip={tooltip}
        rules={rules}
        showSearch
        fieldProps={{
          onSearch: handleSearch,
          onChange: handleChange,
          value: value,
        }}
        options={options.map((option) => ({
          value:
            (optionLabel1 ? option[optionLabel1] : '') +
            (optionLabel2 ? ' - ' + option[optionLabel2] : ''),
          label:
            (optionLabel1 ? option[optionLabel1] : '') +
            (optionLabel2 ? ' - ' + option[optionLabel2] : ''),
        }))}
      />
    </div>
  );
};

export default SearchSelect;
