import React, { FC, useEffect, useState } from 'react';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Form } from 'antd';

interface SearchSelectProps<T> {
  name: string;
  onSearch?: (searchValue: string) => Promise<any> | T[];
  data?: T[];
  optionLabel1?: keyof T;
  optionLabel2?: keyof T;
  onSelect: (selectedValue: any) => void;
  label: string;
  tooltip: string;
  rules: any[];
  isReset?: boolean;
  onDoubleClick?: () => void;
  initialValue?: string;
  width?: 'lg' | 'sm' | 'xs';
}

const SearchSelect: FC<SearchSelectProps<any>> = ({
  data,
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
  initialValue,
  width,
}) => {
  const [form] = Form.useForm();
  const [options, setOptions] = useState<any[]>(data || []);
  const [value, setValue] = useState<string>(initialValue || '');

  useEffect(() => {
    if (isReset) {
      setValue('');
      onSelect(null);
      form.setFields([{ name: name, value: '' }]);
    }
  }, [isReset]);

  useEffect(() => {
    // Обновляем options при изменении onSearch или data
    if (Array.isArray(onSearch)) {
      setOptions(onSearch);
    } else if (onSearch) {
      const searchPromise = onSearch('');
      if (searchPromise instanceof Promise) {
        searchPromise.then((results) => {
          if (results && typeof results === 'object' && 'payload' in results) {
            setOptions(results.payload);
          } else if (Array.isArray(results)) {
            setOptions(results);
          }
        });
      }
    } else if (data) {
      setOptions(data);
    } else {
      setOptions([]); // Если data не предоставлен, устанавливаем пустой массив
    }
  }, [onSearch, data]);

  const handleSearch = async (value: string) => {
    // Фильтруем options на основе введенного значения
    if (onSearch) {
      const searchResults = await onSearch(value);
      if (Array.isArray(searchResults)) {
        setOptions(searchResults);
      }
    }
  };

  const handleChange = (value: string) => {
    const selectedOption = options.find((option) => {
      if (optionLabel1 && optionLabel2) {
        return `${option[optionLabel1]} - ${option[optionLabel2]}` === value;
      } else if (optionLabel1) {
        return `${option[optionLabel1]}` === value;
      }
    });
    if (selectedOption) {
      onSelect(selectedOption);
      setValue(optionLabel1 ? selectedOption[optionLabel1] : '');
    }
  };

  useEffect(() => {
    setValue(initialValue || ''); // обновляем value при изменении initialValue
  }, [initialValue, isReset]);

  return (
    <div style={{ cursor: 'pointer' }} onDoubleClick={onDoubleClick}>
      <ProForm layout="horizontal" submitter={false}>
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
      </ProForm>
    </div>
  );
};

export default SearchSelect;
