import { Form, Input, Button, Select, Col, Row } from 'antd';
import React from 'react';
const { Option } = Select;

interface FormValues {
  input1: string;
  input2: string;
  select: string;
}

interface MySearchFormProps {
  onSearch: (values: FormValues) => void;
}

const MySearchForm: React.FC<MySearchFormProps> = ({ onSearch }) => {
  const [form] = Form.useForm();

  const handleSearchClick = () => {
    onSearch(form.getFieldsValue());
  };

  return (
    <Form form={form} layout="horizontal" style={{ width: '100%' }}>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="input1"
            label="Input 1"
            style={{ display: 'inline-block', width: 'calc(30% - 8px)' }}
          >
            <Input placeholder="Input 1" />
          </Form.Item>
          <Form.Item
            name="input2"
            label="Input 2"
            style={{
              display: 'inline-block',
              width: 'calc(30% - 8px)',
              margin: '0 8px',
            }}
          >
            <Input placeholder="Input 2" />
          </Form.Item>
          <Form.Item
            name="select"
            label="Select"
            style={{ display: 'inline-block', width: 'calc(30% - 8px)' }}
          >
            <Select placeholder="Select" style={{ width: '100%' }}>
              <Option value="option1">Option 1</Option>
              <Option value="option2">Option 2</Option>
            </Select>
          </Form.Item>
          <Form.Item
            style={{
              display: 'inline-block',
              width: 'calc(10% - 8px)',
              margin: '0 8px',
            }}
          >
            <Button type="primary" onClick={handleSearchClick}>
              Поиск
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};
export default MySearchForm;
