// ts-nocheck

import {
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, FormInstance, message } from 'antd';

import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';

type RequirementsFilteredFormType = {
  onProjectSearch: (values: any) => void;
};
const WoFilteredForm: FC<RequirementsFilteredFormType> = ({
  onProjectSearch,
}) => {
  const formRef = useRef<FormInstance>(null);
  const [form] = Form.useForm();
  const { data: partNumbers, isError } = useGetPartNumbersQuery({});

  interface Option {
    value: string;
    label: string;
  }
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };

  const { t } = useTranslation();

  const { data: acTypes, isLoading: acTypesLoading } = useGetACTypesQuery({});

  const partValueEnum: Record<string, any> =
    partNumbers?.reduce((acc, partNumber) => {
      if (partNumber._id) {
        acc[partNumber._id] = partNumber;
      }
      return acc;
    }, {} as Record<string, any>) || {};

  const onFinish = async (values: any) => {
    try {
      // const searchParams = {
      //   startDate: selectedStartDate || '',
      //   status: form.getFieldValue('woStatus'),
      //   projectNumber: form.getFieldValue('projectNumber'),
      //   endDate: selectedEndDate,
      //   projectTypesID: form.getFieldValue('projectTypesID'),
      //   projectTaskWO: form.getFieldValue('projectTaskWO'),
      //   projectID: form.getFieldValue('projectID'),
      // };

      onProjectSearch(values);
    } catch (error) {
      message.error('Failed to fetch requirements');
    }
  };

  const acTypeValueEnum: Record<string, string> =
    acTypes?.reduce((acc, acType) => {
      if (acType.id && acType.name) {
        acc[acType.id] = acType.name;
      }
      return acc;
    }, {} as Record<string, string>) || {};
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedToolType, setSelectedToolType] = useState<string | null>(null);
  const [selectedToolTypeCode, setSelectedToolTypeCode] = useState<
    string | null
  >(null);
  const toolTypeOptions = [
    { value: 'MECHANIC_INSTRUMENT', label: t('МЕХАНИЧЕСКИЙ ИНСТРУМЕНТ') },
    {
      value: 'СРЕДСТВА ИЗМЕРЕНИЙ ОБЩЕГО ПРИМЕНЕНИЯ',
      label: t('СРЕДСТВА ИЗМЕРЕНИЙ ОБЩЕГО ПРИМЕНЕНИЯ'),
    },
    {
      value:
        'СПЕЦИАЛЬНЫЕ СРЕДСТВА ИЗМЕРЕНИЯ И СРЕДСТВА НАЗЕМНОГО КОНТРОЛЯ АВИАЦИОННОЙ ТЕХНИКИ',
      label: t(
        'СПЕЦИАЛЬНЫЕ СРЕДСТВА ИЗМЕРЕНИЯ И СРЕДСТВА НАЗЕМНОГО КОНТРОЛЯ АВИАЦИОННОЙ ТЕХНИКИ'
      ),
    },
  ];

  const toolGroupOptions = {
    'СРЕДСТВА ИЗМЕРЕНИЙ ОБЩЕГО ПРИМЕНЕНИЯ': [
      {
        value: 'Средства измерений давления и разрежения',
        label: t('ДАВЛЕНИЯ И РАЗРЯЖЕНИЯ'),
      },
      {
        value: 'Средства измерений электрических величин',
        label: t('ЭЛЕКТРИЧЕСКИХ ВЕЛИЧИН'),
      },
      {
        value: 'Средства измерений геометрических величин',
        label: t('ГЕОМЕРТИЧЕСКИХ ВЕЛИЧИН'),
      },
      {
        value: 'Средства измерений радиотехнических величин',
        label: t('РАДИОТЕХНИЧЕСКИХ ВЕЛЕЧИН'),
      },
    ],
    MECHANIC_INSTRUMENT: [
      {
        value: 'РЕЖУЩИЙ ИНСТРУМЕНТ',
        label: t('РЕЖУЩИЙ ИНСТРУМЕНТ'),
      },
    ],
    // Add other groups if needed
  };
  return (
    <ProForm
      formRef={formRef}
      onValuesChange={(changedValues, allValues) => {
        // Handle changes in the form
      }}
      layout="horizontal"
      size="small"
      form={form}
      onFinish={onFinish}
    >
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
      <ProFormSelect
        name="type"
        label={`${t('PART TYPE')}`}
        width="lg"
        tooltip={`${t('SELECT PART TYPE')}`}
        options={[
          { value: 'ROTABLE', label: t('ROTABLE') },
          { value: 'CONSUMABLE', label: t('CONSUMABLE') },
        ]}
      />
      <ProFormSelect
        name="group"
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

      <ProFormText
        name="description"
        label={t('DESCRIPTION')}
        width="lg"
        tooltip={t('DESCRIPTION')}
        fieldProps={{
          onKeyPress: handleKeyPress,
        }}
      ></ProFormText>

      {selectedGroup === 'TOOL' && (
        <>
          <ProFormSelect
            // rules={[{ required: true }]}
            name="TOOL_TYPE_CODE"
            label={`${t('ТИП ИНСТРУМЕНТА')}`}
            width="lg"
            tooltip={`${t('SELECT SPECIAL GROUP')}`}
            options={toolTypeOptions}
            // onChange={(value: string) => setSelectedToolType(value)}
          />
          {selectedToolType && (
            <>
              {selectedToolType === 'СРЕДСТВА ИЗМЕРЕНИЙ ОБЩЕГО ПРИМЕНЕНИЯ' && (
                <>
                  <ProFormSelect
                    // rules={[{ required: true }]}
                    name="TOOL_GROUP_CODE"
                    label={`${t('КОД ИНСТРУМЕНТА')}`}
                    width="lg"
                    tooltip={`${t('ВЫБЕРИТЕ КОД ИНСТРУМЕНТА')}`}
                    options={
                      toolGroupOptions['СРЕДСТВА ИЗМЕРЕНИЙ ОБЩЕГО ПРИМЕНЕНИЯ']
                    }
                  />
                </>
              )}
              {selectedToolType === 'MECHANIC_INSTRUMENT' && (
                <ProFormSelect
                  // rules={[{ required: true }]}
                  name="TOOL_GROUP_CODE"
                  label={`${t('КОД ИНСТРУМЕНТА')}`}
                  width="lg"
                  tooltip={`${t('ВЫБЕРИТЕ КОД ИНСТРУМЕНТА')}`}
                  options={toolGroupOptions['MECHANIC_INSTRUMENT']}
                />
              )}
            </>
          )}
          <ProFormSelect
            showSearch
            name="acTypeID"
            label={t('AC TYPE')}
            width="lg"
            valueEnum={acTypeValueEnum}
            // onChange={(value: any) => setACTypeID(value)}
          />
        </>
      )}
    </ProForm>
  );
};

export default WoFilteredForm;
