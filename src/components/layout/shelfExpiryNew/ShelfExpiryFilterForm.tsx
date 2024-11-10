//@ts-nocheck

import {
  ProForm,
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import {
  Divider,
  Form,
  FormInstance,
  DatePickerProps,
  InputNumber,
  Select,
  Space,
} from 'antd';

import moment from 'moment';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DatePicker, { RangePickerProps } from 'antd/es/date-picker';

import { useGetStoresQuery } from '@/features/storeAdministration/StoreApi';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { useGetLocationsQuery } from '@/features/storeAdministration/LocationApi';
import {
  useGetToolsCodesQuery,
  useGetToolsTypeQuery,
} from '@/features/storeAdministration/ToolTypeApi';
const { Option } = Select;

interface FilterFormValues {
  locationID?: string;
  stationID?: string;
  storeID?: string;
  label?: string;
  partNumberID?: string;
  serialNumber?: string;
  dateIn?: [Date, Date];
  datePickerValue?: Date;
  GROUP?: string;
  TYPE?: string;
  toolTypeID?: string;
  toolCodeID?: string;
}

const { RangePicker } = DatePicker;

// Функция для преобразования числа в формат часы:минуты

const ShelfExpiryFilterForm: FC<{
  onSubmit: (values: FilterFormValues) => void;
}> = ({ onSubmit }) => {
  const { t } = useTranslation(); ///////////////////
  /////////////////////////////
  const { data: stores } = useGetStoresQuery({});
  const [selectedStoreID, setSelectedStoreID] = useState<string | undefined>(
    undefined
  );
  const [selectedTargetStoreID, setSelectedTargetStoreID] = useState<
    string | undefined
  >(undefined);
  const {
    data: locations,
    isLoading,
    refetch: refetchLocations,
  } = useGetLocationsQuery({
    storeID: selectedStoreID,
  });
  const { data: toolTypes } = useGetToolsTypeQuery({
    storeID: selectedStoreID,
  });
  const { data: toolCodes } = useGetToolsCodesQuery({
    storeID: selectedStoreID,
  });
  const { data: locationsTarget, refetch: refetchLocationsTarget } =
    useGetLocationsQuery({
      storeID: selectedTargetStoreID,
    });
  const { data: partNumbers, isError } = useGetPartNumbersQuery({});
  const storeCodesValueEnum: Record<string, string> =
    stores?.reduce((acc, mpdCode) => {
      if (mpdCode.id && mpdCode.storeShortName) {
        acc[mpdCode.id] = `${String(mpdCode.storeShortName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};

  const locationsCodesValueEnum: Record<string, string> =
    locations?.reduce((acc, mpdCode) => {
      if (mpdCode.id && mpdCode.locationName) {
        acc[mpdCode.id] = `${String(mpdCode.locationName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};

  const locationsTargetCodesValueEnum: Record<string, string> =
    locationsTarget?.reduce((acc, mpdCode) => {
      if (mpdCode.id && mpdCode.locationName) {
        acc[mpdCode.id] = `${String(mpdCode.locationName).toUpperCase()}`;
      }
      return acc;
    }, {} as Record<string, string>) || {};

  const partValueEnum: Record<string, any> =
    partNumbers?.reduce((acc, partNumber) => {
      if (partNumber._id) {
        acc[partNumber._id] = partNumber;
      }
      return acc;
    }, {} as Record<string, any>) || {};

  const toolsTypesValueEnum: Record<string, any> =
    toolTypes?.reduce((acc, toolType) => {
      acc[toolType.id] = `${String(toolType?.TOOL_TYPE_CODE)?.toUpperCase()}`;
      return acc;
    }, {}) || {};

  const toolsCodesValueEnum: Record<string, any> =
    toolCodes?.reduce((acc, toolType) => {
      acc[toolType.id] = `${String(toolType?.TOOL_GROUP_CODE)?.toUpperCase()}`;
      return acc;
    }, {}) || {};
  const handleStoreChange = (value: string) => {
    setSelectedStoreID(value);
  };

  const formRef = useRef<FormInstance>(null);
  const [form] = Form.useForm();

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };

  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();

  const handleFinish = async (values: any) => {
    // Передача данных вверх через пропс onDataUpdate
    onSubmit({ ...values });
  };
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };

  const handleValueChange = (value: any) => {
    const type = form.getFieldValue('type');
    const dateValue = form.getFieldValue('value');
    if (type === 'day') {
      const date = moment().add(value, 'days');
      form.setFieldsValue({ datePickerValue: date });
      setSelectedEndDate(date ? date.format('YYYY-MM-DD') : null);
    }
    if (type === 'mos') {
      const dateValue = form.getFieldValue('value');
      const date = moment().add(value, 'months');
      form.setFieldsValue({ datePickerValue: date });
      setSelectedEndDate(date ? date.format('YYYY-MM-DD') : null);
    }
  };

  const handleTypeChange = (value: any) => {
    const dateValue = form.getFieldValue('value');

    if (value === 'day') {
      const date = moment().add(dateValue, 'days');
      form.setFieldsValue({ datePickerValue: date });
      setSelectedEndDate(date ? date.format('YYYY-MM-DD') : null);
    }
    if (value === 'mos') {
      const date = moment().add(dateValue, 'months');
      form.setFieldsValue({ datePickerValue: date });

      setSelectedEndDate(date ? date.format('YYYY-MM-DD') : null);
    }
  };
  const date = form.getFieldValue('datePickerValue');

  useEffect(() => {
    form.setFieldsValue({
      type: localStorage.getItem('expiryMosType') || 'mos',
    });
    handleTypeChange('mos');
    // handleValueChange('mos');
    form.setFieldsValue({ value: localStorage.getItem('expiryValue') || 2 });
    handleValueChange(form.getFieldValue('value'));
  }, []);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedToolType, setSelectedToolType] = useState<string | null>(null);
  const [selectedToolTypeCode, setSelectedToolTypeCode] = useState<
    string | null
  >(null);

  const handleSubmit = (values: FilterFormValues) => {
    // Проверяем и форматируем значения перед отправкой
    const formattedValues = {
      ...values,
      // Форматируем даты если они есть
      dateIn: values.dateIn?.map((date) => date.toISOString()),
      datePickerValue: values.datePickerValue?.toISOString(),
    };

    console.log('Submitting filter values:', formattedValues);
    onSubmit(formattedValues);
  };

  return (
    <>
      <ProForm
        onReset={() => {
          setSelectedStoreID(undefined);
          form.resetFields();
        }}
        onFinish={handleFinish}
        formRef={formRef}
        form={form}
        // initialValues={{
        //   expiryDate: [moment().subtract(2, 'months'), moment()],
        // }}
        layout="horizontal"
        size="small"
      >
        <ProFormSelect
          //                   showSearch
          // mode={'multiple'}
          // rules={[{ required: true }]}
          name="stationID"
          label={t('STATION')}
          width="lg"
          // valueEnum={companiesCodesValueEnum || []}
          // disabled={!projectId}
        />
        <ProFormSelect
          showSearch
          name="storeID"
          label={t('STORE')}
          width="lg"
          valueEnum={storeCodesValueEnum || []}
          onChange={handleStoreChange}
        />
        <ProFormSelect
          showSearch
          name="locationID"
          label={t('LOCATION')}
          width="lg"
          valueEnum={locationsCodesValueEnum || []}
          disabled={!selectedStoreID}
        />
        <ProFormSelect
          mode="multiple"
          name="GROUP"
          label={`${t('PART GROUP')}`}
          width="lg"
          tooltip={`${t('SELECT SPECIAL GROUP')}`}
          options={[
            { value: 'CONS', label: t('CONS') },
            { value: 'TOOL', label: t('TOOL') },
            { value: 'CHEM', label: t('CHEM') },
            { value: 'ROT', label: t('ROT') },
            { value: 'GSE', label: t('GSE') },
          ]}
          // onChange={(value: string) => setSelectedGroup(value)}
        />
        <ProFormSelect
          mode="multiple"
          name="TYPE"
          label={`${t('PART TYPE')}`}
          width="lg"
          tooltip={`${t('SELECT PART TYPE')}`}
          options={[
            { value: 'ROTABLE', label: t('ROTABLE') },
            { value: 'CONSUMABLE', label: t('CONSUMABLE') },
          ]}
        />
        {/* <Divider />
        <ProFormSelect
          showSearch
          name="toolTypeID"
          label={t('TOOL TYPE')}
          width="lg"
          valueEnum={toolsTypesValueEnum || []}
          // onChange={handleStoreChange}
        />
        <ProFormSelect
          showSearch
          name="toolCodeID"
          label={t('TOOL GROUP')}
          width="lg"
          valueEnum={toolsCodesValueEnum || []}
          // onChange={handleStoreChange}
        />
        <Divider /> */}
        <ProForm.Item label={`${t('LIMIT')}`}>
          <Space.Compact size="small">
            <Form.Item rules={[{ required: true }]} name="value" noStyle>
              <InputNumber
                onChange={handleValueChange}
                style={{ width: '30%' }}
                placeholder="value"
                autoFocus={true}
                onKeyPress={handleKeyPress}
              />
            </Form.Item>
            <Form.Item rules={[{ required: true }]} name="type" noStyle>
              <Select
                style={{ width: '35%' }}
                onChange={handleTypeChange}
                allowClear
                placeholder="mos"
              >
                <Option value="mos">{`${t('MOS')}`}</Option>
                <Option value="day">{`${t('DAY')}`}</Option>
              </Select>
            </Form.Item>
            <Form.Item noStyle name="datePickerValue">
              <DatePicker disabled onChange={onChange} allowClear></DatePicker>
            </Form.Item>
          </Space.Compact>
        </ProForm.Item>
        <Form.Item label={`${t('EXPIRY RANGE')}`} name="dateIn">
          <RangePicker allowClear onChange={onChange}></RangePicker>
        </Form.Item>

        <Divider />
        <ProFormSelect
          showSearch
          width={'lg'}
          name="partNumberID"
          label={`${t(`PART No`)}`}
          options={Object.entries(partValueEnum).map(([key, part]) => ({
            label: part.PART_NUMBER,
            value: key,
            data: part,
          }))}
        />

        <ProFormText
          name="serialNumber"
          label={t('SERIAL No')}
          width="sm"
          tooltip={t('SERIAL No')}
          fieldProps={{
            onKeyPress: handleKeyPress,
          }}
        ></ProFormText>
        <ProFormText
          name="label"
          label={`${t('LABEL')}`}
          width="sm"
          tooltip={`${t('LABEL CODE')}`}
          //rules={[{ required: true }]}
          fieldProps={{
            onKeyPress: handleKeyPress,
          }}
        />
      </ProForm>
    </>
  );
};

export default ShelfExpiryFilterForm;
