import React from 'react';
import { Select } from 'antd';
const { Option } = Select;
interface Props {
  options: any[];
  onChange: (values: string[]) => void;
  mode: 'multiple' | 'tags';
}
const MultiSelectForm: React.FC<Props> = ({ options, onChange, mode }) => {
  return (
    <Select
      allowClear
      mode={mode}
      style={{ width: '100%' }}
      placeholder="please enter Value"
      onChange={onChange}
    >
      {options.map((option) => (
        <Option key={option.key} value={option.key}>
          {option.value}
        </Option>
      ))}
    </Select>
  );
};
export default MultiSelectForm;
