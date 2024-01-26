import React from 'react';
import { Select } from 'antd';
const { Option } = Select;
interface Props {
  options: any[];
  onChange: (values: string[]) => void;
}
const SingleSelectForm: React.FC<Props> = ({ options, onChange }) => {
  return (
    <Select
      allowClear
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
export default SingleSelectForm;
