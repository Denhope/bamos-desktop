import { AutoComplete, DatePicker, DatePickerProps, Form, Input } from 'antd';
import React, { FC, useRef, useState, useEffect } from 'react';

import { getFilteredPlanesWO, getPlanesWONumber } from '@/utils/api/thunks';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import { RangePickerProps } from 'antd/es/date-picker';

import MultiSelectForm from '@/components/shared/form/MultiSelectForm';
import { IPlaneWO } from '@/models/IPlaneWO';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ProForm, ProFormText } from '@ant-design/pro-components';
const { RangePicker } = DatePicker;

interface WOFilrersFormProps {
  // currentPlaneNumberID: string;
  isMenuCollapse: boolean;
}
const WOFilrersForm: FC<WOFilrersFormProps> = ({
  isMenuCollapse,
  // currentPlaneNumberID,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };
  const { currentPlane, planesTasks, planesWO } = useTypedSelector(
    (state) => state.planes
  );
  const [form] = Form.useForm();
  const [selectedValuesStatus, setSelectedValuesStatus] = useState<string[]>(
    []
  );
  const [selectedValuesClassifications, setSelectedValuesClassifications] =
    useState<string[]>([]);
  const [selectedValuesWOType, setSelectedValuesWOType] = useState<string[]>(
    []
  );
  const [optionsRegNbr, setOptionsRegNbr] = useState([]);
  const [selectedPlane, setSelectedPlane] = useState<any | null>(currentPlane);
  const timeoutRefRegNbr = useRef<NodeJS.Timeout | null>(null);

  const [optionsWONbr, setOptionsWONbr] = useState([]);
  const [selectedTask, setSelectedWO] = useState<any | null>(null);
  const timeoutRefWONbr = useRef<NodeJS.Timeout | null>(null);

  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();

  const handleMultiSelectChange = (values: string[]) => {
    setSelectedValuesClassifications(values);
  };
  const handleMultiSelectStatusChange = (values: string[]) => {
    setSelectedValuesStatus(values);
  };
  const handleMultiSelectWOType = (values: string[]) => {
    setSelectedValuesWOType(values);
  };

  const handleSelectChangeWO = (wo: IPlaneWO) => {
    form.setFieldsValue({
      WONbr: wo?.WONbr,
    });
  };

  const handleSelectWO = (value: string) => {
    const wo = optionsWONbr.find((wo: IPlaneWO) => wo.WONbr === value);
    if (wo) {
      setSelectedWO(wo);
      handleSelectChangeWO(wo);
    }
  };

  const handleSearchWO = async (value: any) => {
    if (timeoutRefWONbr.current) {
      clearTimeout(timeoutRefWONbr.current);
    }

    value && selectedPlane
      ? (timeoutRefWONbr.current = setTimeout(async () => {
          return setOptionsWONbr(
            await getPlanesWONumber(
              value,
              selectedPlane.id || selectedPlane.key
            )
          );
        }, 400))
      : setOptionsWONbr([]);
  };

  useEffect(() => {
    // setPlaneTasks([]);
    setSelectedPlane(currentPlane);

    form.setFieldsValue({
      regNbr: currentPlane?.regNbr,
    });
  }, [currentPlane?.regNbr, planesWO.length]);
  return (
    <div
      className="flex flex-col mx-auto "
      style={{
        width: '100%',
        height: `${!isMenuCollapse ? '100%' : '35vh'}`,
      }}
    >
      <ProForm
        name="complex-formк"
        onFinish={async (values: any) => {
          const result = await dispatch(
            getFilteredPlanesWO({
              WOType: selectedValuesWOType,
              WONbr: values.WONbr,
              dateIn: values.dateIn,
              dateOut: values.dateOut,
              classification: selectedValuesClassifications,
              status: selectedValuesStatus,
              planeID: currentPlane?.id || currentPlane?._id,
              description: values.description,
              regNbr: currentPlane?.regNbr,
            })
          );
          if (result.meta.requestStatus === 'fulfilled') {
            // toast.success('WO Create Sucsess');
            // dispatch(fetchAllProjects());
          } else {
            // toast.error('Error');
          }
        }}
        form={form}
        className="pb-3 mx-auto"
      >
        <Form.Item label="WORK ORDER" name="WONbr">
          <AutoComplete
            autoClearSearchValue
            onSelect={handleSelectWO}
            options={optionsWONbr.map((planeWO: IPlaneWO) => ({
              value: planeWO.WONbr,
            }))}
            onSearch={handleSearchWO}
          >
            <Input />
          </AutoComplete>
        </Form.Item>

        <ProFormText allowClear label={t('DESCRIPTION')} name="description" />

        <Form.Item label="ACTIVE DATE" name="dateIn">
          <RangePicker allowClear onChange={onChange}></RangePicker>
        </Form.Item>
        <Form.Item label={`${t('TYPE')}`} name="WOType">
          <MultiSelectForm
            options={[
              { key: 'PLANNED', value: 'PLANNED' },
              { key: 'UNPLANNED', value: 'UNPLANNED' },
            ]}
            onChange={handleMultiSelectWOType}
            mode={'multiple'}
          />
        </Form.Item>

        <Form.Item label="CLASSIFICATION" name="classification">
          <MultiSelectForm
            options={[
              { key: 'SCHEDULED', value: 'SCHEDULED' },
              { key: 'UNSCHEDULED', value: 'UNSCHEDULED' },
            ]}
            onChange={handleMultiSelectChange}
            mode={'multiple'}
          />
        </Form.Item>
        <Form.Item label="STATUS" name="status">
          <MultiSelectForm
            options={[
              { key: 'OPEN', value: 'OPEN' },
              { key: 'C/W', value: 'C/W' },
              { key: 'CANCELLED', value: 'CANCELLED' },
              { key: 'RTS PENDING', value: 'RTS PENDING' },
              { key: 'RTS OVERDUE', value: 'RTS OVERDUE' },
            ]}
            onChange={handleMultiSelectStatusChange}
            mode={'multiple'}
          />
        </Form.Item>
      </ProForm>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default WOFilrersForm;
