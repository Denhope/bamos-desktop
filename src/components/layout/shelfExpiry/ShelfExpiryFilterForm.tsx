import {
  ModalForm,
  ProForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormGroup,
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

import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import moment from 'moment';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getFilteredMaterialItems,
  getFilteredMaterialItemsExpiry,
  getFilteredShops,
} from '@/utils/api/thunks';
import DatePicker, { RangePickerProps } from 'antd/es/date-picker';
import { IStore } from '@/models/IStore';
import ContextMenuPNSearchSelect from '@/components/shared/form/ContextMenuPNSearchSelect';
const { Option } = Select;
type ShelfExpiryFilterFormType = {
  onFilteredParts: (record: any) => void;
};

const { RangePicker } = DatePicker;

// Функция для преобразования числа в формат часы:минуты

const ShelfExpiryFilterForm: FC<ShelfExpiryFilterFormType> = ({
  onFilteredParts,
}) => {
  const { t } = useTranslation();
  const [isResetForm, setIsResetForm] = useState<boolean>(false);
  const formRef = useRef<FormInstance>(null);
  const [form] = Form.useForm();
  const [isAllDate, setIsAllDAte] = useState<any>(false);
  const [selectedSinglePN, setSecectedSinglePN] = useState<any>();

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const [shops, setShops] = useState([]);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const companyID = localStorage.getItem('companyID') || '';
    const fetchShops = async () => {
      const result = await dispatch(
        getFilteredShops({
          companyID: companyID,
        })
      );
      setShops(result.payload);
    };

    fetchShops();
  }, [dispatch]);

  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const [initialForm, setinitialForm] = useState<any>('');

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

  return (
    <>
      <ProForm
        onReset={() => {
          form.resetFields();
          setSelectedStartDate(null);
          setSelectedEndDate(null);
          setinitialForm('');
          setIsResetForm(true);

          setTimeout(() => {
            setIsResetForm(false);
          }, 0);

          setSecectedSinglePN(null);
        }}
        onFinish={async (values) => {
          const companyID = localStorage.getItem('companyID') || '';
          const result = await dispatch(
            getFilteredMaterialItemsExpiry({
              isAllDate: isAllDate,
              companyID: companyID,
              STOCK: form.getFieldValue('store'),
              GROUP: form.getFieldValue('partGroup'),
              TYPE: form.getFieldValue('partType'),
              PART_NUMBER: selectedSinglePN?.PART_NUMBER,
              SERIAL_NUMBER: form.getFieldValue('serialNumber'),
              localID: '' || form.getFieldValue('label'),
              startDate: selectedStartDate || moment().format('YYYY-MM-DD'),
              endDate: selectedEndDate,
            })
          );
          if (result.meta.requestStatus === 'fulfilled') {
            onFilteredParts(result.payload);
            localStorage.setItem('expiryValue', form.getFieldValue('value'));
            localStorage.setItem('expiryMosType', form.getFieldValue('type'));
            localStorage.setItem(
              'expiryStore',
              JSON.stringify(form.getFieldValue('store'))
            );
            localStorage.setItem(
              'targetACHRS',
              form.getFieldValue('targetACHRS')
            );
          }
        }}
        formRef={formRef}
        form={form}
        // initialValues={{
        //   expiryDate: [moment().subtract(2, 'months'), moment()],
        // }}
        layout="horizontal"
        size="small"
      >
        <ProFormSelect
          initialValue={'MSQ'}
          disabled
          name="station"
          label={`${t('STATION')}`}
          width="sm"
          tooltip={`${t('STATION CODE')}`}
        />
        <ProFormSelect
          rules={[{ required: true }]}
          initialValue={JSON.parse(localStorage.getItem('expiryStore') || '[]')}
          showSearch
          mode="multiple"
          label={`${t('STORE')}`}
          width="lg"
          name="store"
          tooltip={`${t('SELECT STORE')}`}
          options={shops.map((shop: IStore) => ({
            value: shop.shopShortName,
            label: shop.shopShortName,
          }))}
        ></ProFormSelect>
        <ProFormSelect
          mode="multiple"
          name="partGroup"
          label={`${t('PART GROUP')}`}
          width="lg"
          tooltip={`${t('SELECT SPESIAL GROUP')}`}
          options={[
            { value: 'CONS', label: t('CONS') },
            { value: 'TOOL', label: t('TOOL') },
            { value: 'CHEM', label: t('CHEM') },
            { value: 'ROT', label: t('ROT') },
            { value: 'GSE', label: t('GSE') },
          ]}
        />
        <ProFormSelect
          mode="multiple"
          name="partType"
          label={`${t('PART TYPE')}`}
          width="lg"
          tooltip={`${t('SELECT PART TYPE')}`}
          options={[
            { value: 'ROTABLE', label: t('ROTABLE') },
            { value: 'CONSUMABLE', label: t('CONSUMABLE') },
          ]}
        />
        <Divider />
        <ProForm.Item label="LIMIT">
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
                <Option value="mos">MOS</Option>
                <Option value="day">DAY</Option>
              </Select>
            </Form.Item>{' '}
            <Form.Item noStyle name="datePickerValue">
              <DatePicker disabled onChange={onChange} allowClear></DatePicker>
            </Form.Item>
          </Space.Compact>
        </ProForm.Item>
        <Form.Item label={`${t('EXPIRY RANGE')}`} name="dateIn">
          <RangePicker allowClear onChange={onChange}></RangePicker>
        </Form.Item>

        <Divider />
        <ContextMenuPNSearchSelect
          label={t('PART No')}
          isResetForm={isResetForm}
          rules={[{ required: false }]}
          onSelectedPN={function (PN: any): void {
            setSecectedSinglePN(PN);
          }}
          name={'partNumber'}
          initialFormPN={selectedSinglePN?.PART_NUMBER || initialForm}
          width={'sm'}
        ></ContextMenuPNSearchSelect>
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
        <ProFormCheckbox.Group
          className="my-0 py-0"
          //initialValue={['false']}
          labelAlign="left"
          name="isAllDAte"
          fieldProps={{
            onChange: (value) => setIsAllDAte(value),
          }}
          options={[{ label: `${t('INCLUDE OUTGOING')}`, value: 'true' }].map(
            (option) => ({
              ...option,
              style: { display: 'flex', flexWrap: 'wrap' }, // Добавьте эту строку
            })
          )}
        />
      </ProForm>
    </>
  );
};

export default ShelfExpiryFilterForm;
