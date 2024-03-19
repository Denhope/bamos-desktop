import {
  AutoComplete,
  Button,
  DatePicker,
  DatePickerProps,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  message,
} from 'antd';
import React, { FC, useRef, useState, useEffect } from 'react';

import {
  createNewPlaneWO,
  getPlanesNumber,
  getPlanesTaskNumber,
} from '@/utils/api/thunks';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import { RangePickerProps } from 'antd/es/date-picker';
import { IPlane } from '@/models/IPlane';
import { IPlaneTask } from '@/models/ITask';

import { setPlaneTasks } from '@/store/reducers/MtxSlice';
import TextArea from 'antd/es/input/TextArea';

import SingleSelectForm from '@/components/shared/form/SingleSelect';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { USER_ID } from '@/utils/api/http';
import { ProFormDatePicker } from '@ant-design/pro-components';
const WOAddForm: FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [form] = Form.useForm();

  const [optionsRegNbr, setOptionsRegNbr] = useState([]);
  // const [selectedPlane, setSelectedPlane] = useState<any | null>(null);
  // const timeoutRefRegNbr = useRef<NodeJS.Timeout | null>(null);

  const handleSelectDepartment = (values: string[]) => {
    form.setFieldsValue({
      department: values,
    });
  };
  const handleSelectClassifications = (values: string[]) => {
    form.setFieldsValue({
      classification: values,
    });
  };
  const handleSelectTaskType = (values: string[]) => {
    form.setFieldsValue({
      WOType: values,
    });
  };

  const { currentPlane, planesTasks } = useTypedSelector(
    (state) => state.planes
  );

  useEffect(() => {
    // setPlaneTasks([]);
    // setSelectedPlane(currentPlane);

    form.setFieldsValue({
      regNbr: currentPlane?.regNbr,
    });
  }, [currentPlane?.regNbr, planesTasks.length]);
  return (
    <div>
      <div
        className="flex flex-col mx-auto"
        style={{
          width: '100%',
        }}
      >
        <Form
          name="complex-formк"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 12 }}
          style={{ maxWidth: 600 }}
          onFinish={async (values: any) => {
            const result = await dispatch(
              createNewPlaneWO({
                WONbr: values.WONbr,
                WOType: values.WOType,
                dateIn: values.dateIn,
                dateOut: values.dateOut,
                classification: values.classification,
                department: values.department,
                status: 'OPEN',
                userID: USER_ID || '',
                planeID: currentPlane?.id || currentPlane?._id,
                dateCreate: new Date(),
                description: values.description,
                regNbr: currentPlane?.regNbr,
              })
            );
            if (result.meta.requestStatus === 'fulfilled') {
              toast.success('WO Create Sucsess');
              // dispatch(fetchAllProjects());
            } else {
              toast.error('Error');
            }
          }}
          form={form}
          className="w-full mx-auto"
        >
          <Form.Item rules={[{ required: true }]} label="Reg.Nbr" name="regNbr">
            <AutoComplete
              allowClear
              disabled
              // onSelect={handleSelectPlane}
              options={optionsRegNbr.map((plane: IPlane) => ({
                value: plane.regNbr,
              }))}
              // onSearch={handleSearchPlane}
            >
              <Input placeholder="please enter A/C Number" />
            </AutoComplete>
          </Form.Item>{' '}
          <Form.Item label="Work Order Number" name="WONbr">
            <Input placeholder="please enter Work Order Number" />
          </Form.Item>
          <Form.Item label={`${t('Description')}`} name="description">
            <TextArea placeholder="please enter decsription" />
          </Form.Item>
          <Divider />
          <Row justify={'space-between'}>
            <Form.Item label="Date In" name="dateIn">
              <ProFormDatePicker />
            </Form.Item>
            <Form.Item label="Date Out" name="dateOut">
              <ProFormDatePicker />
            </Form.Item>
          </Row>
          <Divider />
          <Form.Item rules={[{ required: true }]} label="WO Type" name="WOType">
            {' '}
            <SingleSelectForm
              options={[
                { key: 'PLANNED', value: 'PLANNED' },
                { key: 'UNPLANNED', value: 'UNPLANNED' },
              ]}
              onChange={handleSelectTaskType}
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Classifications"
            name="classification"
          >
            {' '}
            <SingleSelectForm
              options={[
                { key: 'SCHEDULED', value: 'SCHEDULED' },
                { key: 'UNSCHEDULED', value: 'UNSCHEDULED' },
              ]}
              onChange={handleSelectClassifications}
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true }]}
            label="Department"
            name="department"
          >
            {' '}
            <SingleSelectForm
              options={[
                { key: 'MAINTENANCE', value: 'MAINTENANCE' },
                { key: 'OPERATIONS', value: 'OPERATIONS' },
              ]}
              onChange={handleSelectDepartment}
            />
          </Form.Item>
          <Divider />
          <Form.Item>
            <Space className="">
              {' '}
              <Button htmlType="submit" type="primary">
                Save
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                }}
              >
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default WOAddForm;
