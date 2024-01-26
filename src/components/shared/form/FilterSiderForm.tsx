import React, { useState } from 'react';
import { Form, Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Panel } = Collapse;

interface FilterSiderFormProps {
  title: string;
  children: any;
}
const FilterSiderForm: React.FC<FilterSiderFormProps> = ({
  title,
  children,
}) => {
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(true);
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
    <div>
      <Collapse
        style={{ overflow: 'auto' }}
        bordered={false}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        onChange={() => setCollapsed(!collapsed)}
      >
        <Panel collapsible="header" header={title} key="1">
          {children}
        </Panel>
      </Collapse>
    </div>
  );
};
export default FilterSiderForm;
