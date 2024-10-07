import {
  ProForm,
  ProFormDateRangePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { DatePickerProps, Form } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';

import axios from 'axios';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getFilteredProjects,
  getFilteredRequirementsForecast,
  getFilteredShops,
} from '@/utils/api/thunks';

const ForecastFilteredForm: FC = () => {
  const [form] = Form.useForm();
  const [selectedStartDate, setSelectedStartDate] = useState<any>();
  const [selectedEndDate, setSelectedEndDate] = useState<any>();
  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string
  ) => {
    setSelectedEndDate(dateString[1]);
    setSelectedStartDate(dateString[0]);
  };
  interface Item {
    field1: string; // замените на тип вашего поля
    field2: string; // замените на тип вашего поля
  }
  interface Option {
    value: string;
    label: string;
  }
  const dispatch = useAppDispatch();
  const [receiverType, setReceiverType] = useState('PROJECT');
  const [options, setOptions] = useState<Option[]>([]); // указываем тип состояния явно
  const { t } = useTranslation();
  const currentCompanyID = localStorage.getItem('companyID');
  useEffect(() => {
    if (receiverType) {
      let action;
      let url;
      switch (receiverType) {
        case 'PROJECT':
          action = getFilteredProjects({ companyID: currentCompanyID || '' });
          break;
        case 'AC':
          url = '/api/ac';
          break;
        case 'SHOP':
          action = getFilteredShops({ companyID: currentCompanyID || '' });
          break;
        default:
          url = '/api/default';
      }

      if (action) {
        dispatch(action)
          .then((action) => {
            const data: any[] = action.payload; // предполагаем, что payload содержит массив данных
            let options;
            switch (receiverType) {
              case 'PROJECT':
                options = data.map((item: any) => ({
                  value: item._id, // замените на нужное поле для 'PROJECT'
                  label: item.projectWO, // замените на нужное поле для 'PROJECT'
                }));
                break;
              case 'AC':
                options = data.map((item: any) => ({
                  value: item.acField1, // замените на нужное поле для 'AC'
                  label: item.acField2, // замените на нужное поле для 'AC'
                }));
                break;
              case 'SHOP':
                options = data.map((item: any) => ({
                  value: item.shopShortName, // замените на нужное поле для 'SHOP'
                  label: item.shopShortName, // замените на нужное поле для 'SHOP'
                }));
                break;
              default:
                options = data.map((item: any) => ({
                  value: item.defaultField1, // замените на нужное поле для 'default'
                  label: item.defaultField2, // замените на нужное поле для 'default'
                }));
            }
            setOptions(options);
          })
          .catch((error) => {
            console.error('Ошибка при получении данных:', error);
          });
      }
    }
  }, [receiverType, dispatch]);
  return (
    <ProForm
      onValuesChange={(changedValues, allValues) => {
        // Handle changes in the form
        if (changedValues.receiverType) {
          setReceiverType(changedValues.receiverType);
        }
      }}
      layout="horizontal"
      size="small"
      onReset={() => {
        setSelectedEndDate(null);
        setSelectedStartDate(null);
      }}
      form={form}
      onFinish={async (values) => {
        const result = dispatch(
          getFilteredRequirementsForecast({
            regNbr: form.getFieldValue('planeNumber'),
            startDate: selectedStartDate,
            group: form.getFieldValue('partGroup'),
            type: form.getFieldValue('partType'),
            status: form.getFieldValue('requestStatus'),
            partRequestNumber: form.getFieldValue('partRequestNumber'),
            endDate: selectedEndDate,
            companyID: currentCompanyID || '',
            foForecast: true,
            projectIds:
              receiverType && receiverType === 'PROJECT'
                ? form.getFieldValue('additionalSelectProject')
                : '',
            needOnLocationShop:
              receiverType && receiverType === 'SHOP'
                ? form.getFieldValue('additionalSelectShop')
                : '',
          })
        );
      }}
    >
      <ProForm.Group>
        <ProFormRadio.Group
          name="receiverType"
          label={`${t('RECEIVER TYPE')}`}
          tooltip="ENTER TYPE "
          options={[
            { value: 'PROJECT', label: `${t(`PROJECT`)}` },
            { value: 'AC', label: `${t(`AIRCRAFT`)}` },
            { value: 'SHOP', label: `${t(`SHOP/STORE`)}` },
          ]}
          initialValue="PROJECT"
        />
        {receiverType === 'PROJECT' && (
          <ProFormSelect
            mode="multiple"
            name="additionalSelectProject"
            label={`${t(`PROJECT`)}`}
            width="lg"
            options={options}
          />
        )}
        {receiverType === 'AC' && (
          <ProFormText
            name="planeNumber"
            label="A/C REGISTRATION"
            width="lg"
            // options={options}
          />
        )}
        {receiverType === 'SHOP' && (
          <ProFormSelect
            name="additionalSelectShop"
            label={`${t(`SHOP/STORE SELECT`)}`}
            width="lg"
            options={options}
          />
        )}
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          name="partRequestNumber"
          label={`${t('PART REQUEST NBR')}`}
          width="lg"
          tooltip="PART REQUEST NBR"
          //rules={[{ required: true }]}
        />
      </ProForm.Group>
      <ProFormSelect
        initialValue={['open', 'planned']}
        mode="multiple"
        name="requestStatus"
        label={`${t('REQUEST STATUS')}`}
        width="lg"
        tooltip={`${t('SELECT PROJECT STATUS')}`}
        options={[
          { value: 'planned', label: t('PLANNED') },
          { value: 'open', label: t('NEW') },
          { value: 'closed', label: t('CLOSE') },
          { value: 'canceled', label: t('CANCELED') },
          { value: 'onOrder', label: t('ISSUED') },
          { value: 'transfer', label: t('TRANSFER') },
        ]}
      />
      <ProFormSelect
        mode="multiple"
        name="partGroup"
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
      <ProFormDateRangePicker
        name="plannedDate"
        label={`${t('PLANNED DATE')}`}
        width="lg"
        tooltip="PLANNED DATE"
        fieldProps={{
          onChange: onChange,
        }}
      />
    </ProForm>
  );
};

export default ForecastFilteredForm;
