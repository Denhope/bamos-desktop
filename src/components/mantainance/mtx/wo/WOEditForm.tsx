import {
  AutoComplete,
  Button,
  Col,
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
import { useTranslation } from 'react-i18next';
import {
  createNewPlaneWO,
  editPlaneWO,
  getFilteredPlanesWO,
  getPlaneByID,
  getPlaneWOByID,
  getPlanesNumber,
  getPlanesTaskNumber,
} from '@/utils/api/thunks';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import { RangePickerProps } from 'antd/es/date-picker';
import { IPlane } from '@/models/IPlane';

import TextArea from 'antd/es/input/TextArea';

import toast, { Toaster } from 'react-hot-toast';
import { IPlaneWO } from '@/models/IPlaneWO';
import moment from 'moment';
import { USER_ID } from '@/utils/api/http';
import { ProFormDatePicker } from '@ant-design/pro-components';
interface EditFormProps {
  selectedWOumber: any;
  // planeWO: IPlaneWO | null;
}
const WOEditForm: FC<EditFormProps> = ({ selectedWOumber }) => {
  const dispatch = useAppDispatch();
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {};

  const onOk = (
    value: DatePickerProps['value'] | RangePickerProps['value']
  ) => {
    // console.log('onOk: ', value);
  };
  const { Option } = Select;

  const [form] = Form.useForm();

  const [optionsRegNbr, setOptionsRegNbr] = useState([]);

  const handleSelectDepartment = (values: any) => {
    form.setFieldsValue({
      department: values,
    });
  };
  const handleSelectClassifications = (values: any) => {
    form.setFieldsValue({
      classification: values,
    });
  };
  const handleSelectTaskType = (values: any) => {
    form.setFieldsValue({
      WOType: values,
    });
  };
  const handleSelectStatus = (values: any) => {
    form.setFieldsValue({
      status: values,
    });
  };

  const { currentPlane, planesTasks } = useTypedSelector(
    (state) => state.planes
  );

  const [planeWO, setPlaneWO] = useState<IPlaneWO | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const currentPlaneID = localStorage.getItem('currentPlaneID');
      if (currentPlaneID && selectedWOumber) {
        const planeWO = await getPlaneWOByID(selectedWOumber).then((wo) =>
          setPlaneWO(wo)
        );
        // setPlaneTasks(planeWO);
      }
    };

    fetchData();
    console.log(planeWO);
  }, []);

  useEffect(() => {
    // setPlaneTasks([]);
    // setSelectedPlane(currentPlane);

    form.setFieldsValue({
      regNbr: currentPlane?.regNbr,
    });
    planeWO &&
      form.setFieldsValue({
        WONbr: planeWO?.WONbr,
      });
    form.setFieldsValue({
      description: planeWO?.description,
    });
    form.setFieldsValue({
      WOType: planeWO?.WOType,
    });
    form.setFieldsValue({
      department: planeWO?.department,
    });
    form.setFieldsValue({
      dateIn: moment(planeWO?.dateIn),
    });
    form.setFieldsValue({
      dateOut: moment(planeWO?.dateOut),
    });

    form.setFieldsValue({
      classification: planeWO?.classification,
    });
    form.setFieldsValue({
      classification: planeWO?.classification,
    });
    form.setFieldsValue({
      status: planeWO?.status,
    });
  }, [currentPlane?.regNbr, planesTasks.length, planeWO?.id]);
  const { t } = useTranslation();
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
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          onFinish={async (values: any) => {
            const result = await dispatch(
              editPlaneWO({
                ...planeWO,
                WONbr: values.WONbr,
                WOType: values.WOType,
                dateIn: values.dateIn,
                dateOut: values.dateOut,
                classification: values.classification,
                department: values.department,
                status: values.status,
                userID: USER_ID || '',
                planeID: currentPlane?.id || currentPlane?._id,
                dateCreate: new Date(),
                description: values.description,
                regNbr: currentPlane?.regNbr,
              })
            );
            if (result.meta.requestStatus === 'fulfilled') {
              toast.success('WO Edit Sucsess');
              const currentPlaneID = localStorage.getItem('currentPlaneID');
              if (currentPlaneID) {
                dispatch(
                  getFilteredPlanesWO({ planeID: JSON.parse(currentPlaneID) })
                );
              }
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
          <Form.Item label="WO Type" name="WOType">
            {/* <Input placeholder="please enter Work Order Number" /> */}
            <Select
              // style={{ width: '35%' }}
              onChange={handleSelectTaskType}
              allowClear
            >
              <Option value="PLANNED">PLANNED</Option>
              <Option value="UNPLANNED">UNPLANNED</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Classification" name="classification">
            <Select
              // style={{ width: '35%' }}
              onChange={handleSelectClassifications}
              allowClear
            >
              <Option value="SCHEDULED">SCHEDULED</Option>
              <Option value="UNSCHEDULED">UNSCHEDULED</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Department" name="department">
            <Select
              // style={{ width: '35%' }}
              onChange={handleSelectClassifications}
              allowClear
            >
              <Option value="MAINTENANCE">MAINTENANCE</Option>
              <Option value="OPERATIONS">OPERATIONS</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Status" name="status">
            {/* <Input placeholder="please enter Work Order Number" /> */}
            <Select
              // style={{ width: '35%' }}
              onChange={handleSelectStatus}
              allowClear
            >
              <Option value="OPEN">OPEN</Option>
              <Option value="C/W">C/W</Option>
              <Option value="CANCELLED">CANCELLED</Option>
              <Option value="RTS PENDING">RTS PENDING</Option>
              <Option value="RTS OVERDUE">RTS OVERDUE</Option>
            </Select>
          </Form.Item>
          <Divider />
          <>Hours</>
          <Row align={'middle'} gutter={[16, 16]}>
            <Col span={7}></Col>
            <Col span={5}>Estimated</Col>
            <Col span={8}>Actual</Col>
          </Row>
          <Form.Item>
            <Row align={'middle'} gutter={[16, 16]}>
              <Col span={10}>
                <div>Labor (Hrs:Min)</div>
              </Col>

              <Col span={7}>
                <Form.Item noStyle name={'projAFL'}>
                  <Input
                    className="w-full"
                    // onChange={handleChange}
                  ></Input>
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item noStyle name={'targetAFL'}>
                  <Input
                  // value={
                  //   value && currentPlane?.utilisation?.ACAFL
                  //     ? parseInt(value) + currentPlane?.utilisation?.ACAFL
                  //     : ''
                  // }
                  // disabled
                  ></Input>
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item>
            <Row align={'middle'} gutter={[16, 16]}>
              <Col span={10}>
                <div>Labor Cost </div>
              </Col>

              <Col span={7}>
                <Form.Item noStyle name={'projAFL'}>
                  <Input
                    className="w-full"
                    // onChange={handleChange}
                  ></Input>
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item noStyle name={'targetAFL'}>
                  <Input
                  // value={
                  //   value && currentPlane?.utilisation?.ACAFL
                  //     ? parseInt(value) + currentPlane?.utilisation?.ACAFL
                  //     : ''
                  // }
                  // disabled
                  ></Input>
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>
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

export default WOEditForm;
