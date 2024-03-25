import {
  AutoComplete,
  Button,
  DatePicker,
  DatePickerProps,
  Form,
  Input,
  Select,
  Space,
} from 'antd';
import React, { FC, useRef, useState, useEffect } from 'react';

import {
  getFilteredPlanesTasks,
  getPlanesNumber,
  getPlanesTaskNumber,
} from '@/utils/api/thunks';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import { RangePickerProps } from 'antd/es/date-picker';
import { IPlane } from '@/models/IPlane';
import { IPlaneTask } from '@/models/ITask';

import { setPlaneTasks } from '@/store/reducers/MtxSlice';
import SingleSelectForm from '@/components/shared/form/SingleSelect';
import MultiSelectForm from '@/components/shared/form/MultiSelectForm';
import { ProForm, ProFormText } from '@ant-design/pro-components';

const { RangePicker } = DatePicker;

interface FIlteredTaskFormProps {
  // currentPlaneNumberID: string;
  isMenuCollapse: boolean;
}
const FIlteredTaskForm: FC<FIlteredTaskFormProps> = ({
  isMenuCollapse,
  // currentPlaneNumberID,
}) => {
  const dispatch = useAppDispatch();
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };
  const { currentPlane, planesTasks } = useTypedSelector(
    (state) => state.planes
  );
  const [form] = Form.useForm();
  const [selectedValuesATA, setSelectedValuesATA] = useState<string[]>([]);
  const [selectedValuesTaskype, setSelectedValuesTaskType] = useState<string[]>(
    []
  );
  const [optionsRegNbr, setOptionsRegNbr] = useState([]);
  const [selectedPlane, setSelectedPlane] = useState<any | null>(currentPlane);
  const timeoutRefRegNbr = useRef<NodeJS.Timeout | null>(null);

  const [optionsTaskNbr, setOptionsTaskNbr] = useState([]);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const timeoutRefTaskNbr = useRef<NodeJS.Timeout | null>(null);

  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();

  const handleMultiSelectChange = (values: string[]) => {
    setSelectedValuesATA(values);
  };
  const handleMultiSelectTaskType = (values: string[]) => {
    setSelectedValuesTaskType(values);
    form.setFieldsValue({
      taskType: values,
    });
  };

  const handleSelectChangePlane = (plane: any) => {
    form.setFieldsValue({
      regNbr: plane?.regNbr,
    });
    setSelectedPlane(plane);
  };

  const handleSelectPlane = (value: string) => {
    const plane = optionsRegNbr.find((plane: IPlane) => plane.regNbr === value);
    if (plane) {
      handleSelectChangePlane(plane);
    }
  };

  const handleSearchPlane = async (value: any) => {
    if (timeoutRefRegNbr.current) {
      clearTimeout(timeoutRefRegNbr.current);
    }
    timeoutRefRegNbr.current = setTimeout(async () => {
      value
        ? setOptionsRegNbr(await getPlanesNumber(value))
        : setOptionsRegNbr([]);
    }, 400);
  };

  const handleSelectChangeTask = (task: IPlaneTask) => {
    form.setFieldsValue({
      taskNbr: task?.taskNbr,
    });
  };

  const handleSelectTask = (value: string) => {
    const task = optionsTaskNbr.find(
      (task: IPlaneTask) => task.taskNbr === value
    );
    if (task) {
      setSelectedTask(task);
      handleSelectChangeTask(task);
    }
  };

  const handleSearchTask = async (value: any) => {
    if (timeoutRefTaskNbr.current) {
      clearTimeout(timeoutRefTaskNbr.current);
    }

    value && selectedPlane
      ? (timeoutRefTaskNbr.current = setTimeout(async () => {
          return setOptionsTaskNbr(
            await getPlanesTaskNumber(
              value,
              selectedPlane.id || selectedPlane.key
            )
          );
        }, 400))
      : setOptionsTaskNbr([]);
  };

  useEffect(() => {
    setPlaneTasks([]);
    setSelectedPlane(currentPlane);

    form.setFieldsValue({
      regNbr: currentPlane?.regNbr,
    });
  }, [currentPlane?.regNbr, planesTasks.length]);
  return (
    <div
      className="flex flex-col  mx-auto"
      style={{
        width: '100%',
        height: `${!isMenuCollapse ? '100%' : '35vh'}`,
      }}
    >
      <ProForm
        name="complex-formк"
        onFinish={async (values: any) => {
          const result = await dispatch(
            getFilteredPlanesTasks({
              ata: selectedValuesATA,
              planeID: currentPlane?._id || currentPlane?.id,

              taskType: selectedValuesTaskype,
              taskNbr: values.taskNbr,
              description: values.description,

              startDate: selectedStartDate,
              endDate: selectedEndDate,
            })
          );
          if (
            result.meta.requestStatus === 'fulfilled' &&
            result.payload.length == 0
          ) {
            setPlaneTasks([]);
          }
        }}
        form={form}
        className="pb-3 mx-auto"
      >
        <Form.Item label="ITEM" name="taskNbr">
          <AutoComplete
            autoClearSearchValue
            onSelect={handleSelectTask}
            options={optionsTaskNbr.map((planeTask: IPlaneTask) => ({
              value: planeTask.taskNbr,
            }))}
            onSearch={handleSearchTask}
          >
            <Input />
          </AutoComplete>
        </Form.Item>

        <ProFormText allowClear label={t('DESCRIPTION')} name="description" />

        <Form.Item label="C/W DATE" name="CWDATE">
          <RangePicker allowClear onChange={onChange}></RangePicker>
        </Form.Item>
        <Form.Item rules={[{ required: true }]} label="TYPE" name="taskType">
          <MultiSelectForm
            options={[
              { key: 'AD', value: 'AIRWORTHINESS DIRECTIVE' },
              { key: 'SMC', value: 'SHEDULED MAINTENENCE CHEACK' },
              { key: 'SB', value: 'SB' },
              { key: 'PKGOP', value: 'PACKAGE' },
              { key: 'ADP', value: 'ADP ' },
              { key: 'PN', value: 'COMPONENT' },
            ]}
            onChange={handleMultiSelectTaskType}
            mode={'multiple'}
          />
        </Form.Item>

        <Form.Item label="ATA" name="ata">
          <MultiSelectForm
            options={[
              { key: '00', value: '00 - INFORMATION' },
              { key: '01', value: '01 - lIMITATIONS' },
              { key: '05', value: '05 - TIME LIMITS/MAINTENANCE CHECKS' },
              { key: '08', value: '08 - LEVELING AND WEIGHING' },
              { key: '20', value: '20 - STANDARD PRACTICES - AIRFRAME' },
              { key: '21', value: '21 - AIR CONDITIONING' },
              { key: '22', value: '22 - AUTO FLIGHT' },
              { key: '23', value: '23 - COMMUNICATIONS' },
              { key: '24', value: '24 - ELECTRICAL POWER' },
              { key: '25', value: '25 - EQUIPMENT/FURNISHINGS' },
              { key: '26', value: '26 - FIRE PROTECTION' },
              { key: '27', value: '27 - FLIGHT CONTROLS' },
              { key: '28', value: '28 - FUEL' },
              { key: '30', value: '30 - ICE AND RAIN PROTECTION' },
              { key: '31', value: '31 - INDICATING/RECORDING SYSTEMS' },
              { key: '32', value: '32 - LANDING GEAR' },
              { key: '33', value: '33 - LIGHTS' },
              { key: '34', value: '34 - NAVIGATION' },
              { key: '35', value: '35 - OXYGEN' },
              { key: '36', value: '36 - PNEUMATIC' },
              { key: '38', value: '38 - WATER/WASTE' },
              {
                key: '44',
                value: '44 - CABIN SYSTEMS',
              },
              { key: '45', value: '45 - CENTRAL MAINT SYSTEM' },
              { key: '46', value: '46 - INFORMATION SYSTEMS' },
              { key: '49', value: '49 - AIRBORNE AUXILIARY POWER' },
              { key: '50', value: '50 - CARGO COMPARTMENTS' },
              { key: '52', value: '52 - DOORS' },
              { key: '53', value: '53 - FUSELAGE' },
              { key: '54', value: '54 - NACELLES/PYLONS' },
              { key: '55', value: '55 - STABILIZERS' },
              { key: '56', value: '56 - WINDOWS' },
              { key: '57', value: '57 - WINGS' },
              { key: '71', value: '71 - POWER PLANT' },
              { key: '72', value: '72 - ENGINE' },
              { key: '73', value: '73 - ENGINE FUEL AND CONTROL' },
              { key: '74', value: '74 - IGNITION' },
              { key: '75', value: '75 - AIR' },
              { key: '76', value: '76 - ENGINE CONTROLS' },
              { key: '77', value: '77 - ENGINE INDICATING' },
              { key: '78', value: '78 - EXHAUST' },
              { key: '79', value: '79 - OIL' },
              { key: '80', value: '80 - STARTING' },
              { key: '81', value: '81 - TURBINES' },
            ]}
            onChange={handleMultiSelectChange}
            mode={'multiple'}
          />
        </Form.Item>
      </ProForm>
    </div>
  );
};

export default FIlteredTaskForm;
