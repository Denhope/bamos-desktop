import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Collapse,
} from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import moment from 'moment';
const { RangePicker } = DatePicker;
const { Panel } = Collapse;
interface SearchFormProps {
  height: number;
}
const SearchForm: React.FC<SearchFormProps> = ({ height }) => {
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const onReset = () => {
    form.resetFields();
  };
  const onLast30Days = () => {
    form.setFieldsValue({
      dateRange: [
        moment().subtract(30, 'days').startOf('day'),
        moment().endOf('day'),
      ],
    });
  };
  const onLast6Months = () => {
    form.setFieldsValue({
      dateRange: [
        moment().subtract(6, 'months').startOf('month'),
        moment().endOf('month'),
      ],
    });
  };
  return (
    <div style={{ overflow: 'hidden' }}>
      <Collapse
        bordered={false}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        onChange={() => setCollapsed(!collapsed)}
      >
        <Panel header="Search Form" key="1">
          <Form
            form={form}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            //style={{ maxWidth: 600, overflowY: 'auto', overflowX: 'hidden' }}
            layout="vertical"
          >
            <Form.Item label="Item Description" name="itemDescription">
              <Input size="small" />
            </Form.Item>
            <Form.Item label="Task Type" name="taskType">
              <Select size="small">
                <Select.Option value="type1">Type 1</Select.Option>
                <Select.Option value="type2">Type 2</Select.Option>
              </Select>
            </Form.Item>
            <Row gutter={1}>
              <Col span={18}>
                <Form.Item label="Date Range" name="dateRange">
                  <RangePicker />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Select onSelect={onLast30Days}>
                  <Select.Option value="last30Days">Last 30 Days</Select.Option>
                </Select>
              </Col>
              <Col span={3}>
                <Select onSelect={onLast6Months}>
                  <Select.Option value="last6Months">
                    Last 6 Months
                  </Select.Option>
                </Select>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col span={12}>
                <Button type="primary" htmlType="submit">
                  Apply
                </Button>
              </Col>
              <Col span={12}>
                <Button htmlType="button" onClick={onReset}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Panel>
      </Collapse>
    </div>
  );
};
export default SearchForm;
