//@ts-nocheck

import {
  ProForm,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Tabs } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Alternates from './tabs/mainView/Alternates';
import { IPartNumber } from '@/models/IUser';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';
interface UserFormProps {
  order?: IPartNumber | null;
  orderItem?: any | {};
  // requirements?:
  onSubmit: (company: any) => void;
  onDelete?: (orderID: string) => void;
  onOrderItemUpdate?: (orderItem: any) => void;
}
const PartAdminForm: FC<UserFormProps> = ({ order, orderItem, onSubmit }) => {
  const [form] = ProForm.useForm();

  const { t } = useTranslation();
  const [activeTabKey, setActiveTabKey] = useState('1'); // Default to the first tab
  const [tabTitles, setTabTitles] = useState({
    '1': `${t('PART')}`,
    '2': `${t('ALTERNATIVES')}`,
    '3': `${t('REMARKS')}`,
  });
  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {order ? t('UPDATE') : t('CREATE')}
    </Button>
  );
  useEffect(() => {
    setShowSubmitButton(activeTabKey === '1');
  }, [activeTabKey]);
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const updateTabTitle = (selectedItem: any | null, order: any) => {
    if (order) {
      setTabTitles({
        ...tabTitles,
        '1': `${t('PART No')}: ${order?.PART_NUMBER}`,
      });
    }
    if (selectedItem) {
      setTabTitles({
        ...tabTitles,
        // '3': `${t('PART No:')} ${order?.orderNumberNew}POS:${
        //   selectedItem?.index + 1
        // } - PART_NUMBER: ${selectedItem?.partID?.PART_NUMBER}`,
      });
    }
  };
  const handleSubmit = async (values: any) => {
    const newUser: any = order
      ? { ...order, ...values }
      : { ...values, companyID: localStorage.getItem('companyID') || '' };
    onSubmit(newUser);
  };
  useEffect(() => {
    updateTabTitle(orderItem, order);
  }, [orderItem, order]);

  useEffect(() => {
    if (order) {
      form.resetFields();
      form.setFieldsValue(order);
      setSelectedGroup(order.GROUP);
      setSelectedToolType(order?.TOOL_TYPE_CODE);
      setSelectedToolTypeCode(order?.TOOL_GROUP_CODE);
    } else {
      form.resetFields();
      // setSelectedProjectId(undefined);
    }
  }, [order, form]);
  const { data: acTypes, isLoading: acTypesLoading } = useGetACTypesQuery({});
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
        label: t('Средства измерений давления и разрежения'),
      },
      {
        value: 'Средства измерений электрических величин',
        label: t('Средства измерений электрических величин'),
      },
      {
        value: 'Средства измерений геометрических величин',
        label: t('Средства измерений геометрических величин'),
      },
      {
        value: 'Средства измерений радиотехнических величин',
        label: t('Средства измерений радиотехнических величин'),
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
      layout="horizontal"
      onReset={() => {
        form.resetFields();
        // setSelectedProjectId(null);
      }}
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => {
          if (showSubmitButton) {
            return [<SubmitButton key="submit" />, dom.reverse()[1]];
          }
          return null;
        },
      }}
    >
      <Tabs
        activeKey={activeTabKey}
        onChange={(key) => {
          setActiveTabKey(key);
          form.setFieldsValue({ activeTabKey: key });
        }}
        defaultActiveKey="1"
        type="card"
      >
        <Tabs.TabPane tab={tabTitles['1']} key="1">
          <div className=" h-[55vh] flex flex-col overflow-auto">
            <>
              <ProFormText
                // disabled={!isCreating}
                rules={[{ required: true }]}
                name="PART_NUMBER"
                label={t('PART No')}
                width="lg"
                tooltip={t('PART No')}
              ></ProFormText>
              <ProFormText
                fieldProps={{ style: { resize: 'none' } }}
                rules={[{ required: true }]}
                name="DESCRIPTION"
                label={t('DESCRIPTION')}
                width="lg"
                tooltip={t('DESCRIPTION')}
              ></ProFormText>
              <ProFormText
                fieldProps={{ style: { resize: 'none' } }}
                // rules={[{ required: true }]}
                name="ADD_DESCRIPTION"
                label={t('ADD DESCRIPTION')}
                width="lg"
                tooltip={t('ADD DESCRIPTION')}
              ></ProFormText>
            </>
            <ProFormSelect
              rules={[{ required: true }]}
              name="TYPE"
              label={`${t('PART TYPE')}`}
              width="lg"
              tooltip={`${t('SELECT PART TYPE')}`}
              options={[
                { value: 'ROTABLE', label: t('ROTABLE') },
                { value: 'CONSUMABLE', label: t('CONSUMABLE') },
              ]}
            />
            <ProFormSelect
              rules={[{ required: true }]}
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
              // onChange={(value) => setSelectedGroup(value)}
            />
            {/* {selectedGroup === 'TOOL' && (
              <>
                <ProFormSelect
                  // rules={[{ required: true }]}
                  name="TOOL_TYPE_CODE"
                  label={`${t('ТИП ИНСТРУМЕНТА')}`}
                  width="lg"
                  tooltip={`${t('SELECT SPECIAL GROUP')}`}
                  options={toolTypeOptions}
                  onChange={(value) => setSelectedToolType(value)}
                />
                {selectedToolType && (
                  <>
                    {selectedToolType ===
                      'СРЕДСТВА ИЗМЕРЕНИЙ ОБЩЕГО ПРИМЕНЕНИЯ' && (
                      <>
                        <ProFormSelect
                          // rules={[{ required: true }]}
                          name="TOOL_GROUP_CODE"
                          label={`${t('КОД ИНСТРУМЕНТА')}`}
                          width="lg"
                          tooltip={`${t('ВЫБЕРИТЕ КОД ИНСТРУМЕНТА')}`}
                          options={
                            toolGroupOptions[
                              'СРЕДСТВА ИЗМЕРЕНИЙ ОБЩЕГО ПРИМЕНЕНИЯ'
                            ]
                          }
                        />
                        <ProFormText
                          // rules={[{ required: true }]}
                          name="UNIT_LIMIT"
                          label={`${t('UNIT_LIMIT')}`}
                          width="lg"
                          tooltip={`${t('UNIT_LIMIT')}`}
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
              </>
            )} */}
            <ProFormSelect
              showSearch
              rules={[{ required: true }]}
              label={t('UNIT')}
              name="UNIT_OF_MEASURE"
              width="lg"
              valueEnum={{
                EA: `EA/${t('EACH').toUpperCase()}`,
                M: `M/${t('Meters').toUpperCase()}`,
                ML: `ML/${t('Milliliters').toUpperCase()}`,
                SI: `SI/${t('Sq Inch').toUpperCase()}`,
                CM: `CM/${t('Centimeters').toUpperCase()}`,
                GM: `GM/${t('Grams').toUpperCase()}`,
                YD: `YD/${t('Yards').toUpperCase()}`,
                FT: `FT/${t('Feet').toUpperCase()}`,
                SC: `SC/${t('Sq Centimeters').toUpperCase()}`,
                IN: `IN/${t('Inch').toUpperCase()}`,
                SH: `SH/${t('Sheet').toUpperCase()}`,
                SM: `SM/${t('Sq Meters').toUpperCase()}`,
                RL: `RL/${t('Roll').toUpperCase()}`,
                KT: `KT/${t('Kit').toUpperCase()}`,
                LI: `LI/${t('Liters').toUpperCase()}`,
                KG: `KG/${t('Kilograms').toUpperCase()}`,
                JR: `JR/${t('Jar/Bottle').toUpperCase()}`,
              }}
            ></ProFormSelect>
            <ProFormSelect
              showSearch
              rules={[{ required: true }]}
              label={t('ADD UNIT')}
              name="ADD_UNIT_OF_MEASURE"
              width="xl"
              valueEnum={{
                шт: `${t('шт').toUpperCase()}`,
                м: `${t('м').toUpperCase()}`,
                мл: `${t('мл').toUpperCase()}`,
                дюйм2: `${t('дюйм2').toUpperCase()}`,
                см: `${t('см').toUpperCase()}`,
                г: `${t('г').toUpperCase()}`,
                ярд: `${t('ярд').toUpperCase()}`,
                фут: `${t('фут').toUpperCase()}`,
                см2: `${t('см2').toUpperCase()}`,
                дюйм: `${t('дюйм').toUpperCase()}`,
                м2: `${t('м2').toUpperCase()}`,
                рул: `${t('рул').toUpperCase()}`,
                л: `${t('л').toUpperCase()}`,
                кг: `${t('кг').toUpperCase()}`,
              }}
            ></ProFormSelect>
            {/* <ProFormGroup>
              <ProFormText
                width="sm"
                name="WORKPIECE_DIMENSIONS"
                label={t('WORKPIECE DIMENSIONS')}
              />
              <ProFormText
                name="COATING"
                label={t('COATING')}
                width="md"
                tooltip={t('COATING')}
              ></ProFormText>
              <ProFormText
                name="MATERIAL"
                label={t('MATERIAL')}
                width="md"
                tooltip={t('MATERIAL')}
              ></ProFormText>
              <ProFormText
                name="WEIGHT"
                label={t('WEIGHT')}
                width="md"
                tooltip={t('WEIGHT')}
              ></ProFormText>
              <ProFormText
                name="SQUARE"
                label={t('SQUARE')}
                width="md"
                tooltip={t('SQUARE')}
              ></ProFormText>
              <ProFormText
                name="WORKPIECE_WEIGHT"
                label={t('WORKPIECE_WEIGHT')}
                width="md"
                tooltip={t('WORKPIECE_WEIGHT')}
              ></ProFormText>
              <ProFormText
                name="WORKPIECE_MATERIAL_TYPE"
                label={t('WORKPIECE_MATERIAL_TYPE')}
                width="md"
                tooltip={t('WORKPIECE_MATERIAL_TYPE')}
              ></ProFormText>
            </ProFormGroup> */}
            <ProFormSelect
              showSearch
              name="acTypeID"
              label={t('AC TYPE')}
              width="lg"
              valueEnum={acTypeValueEnum}
              // onChange={(value: any) => setACTypeID(value)}
            />
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={tabTitles['2']} key="2">
          <Alternates currentPart={order} />
        </Tabs.TabPane>
        {/* <Tabs.TabPane tab={tabTitles['3']} key="3"></Tabs.TabPane> */}
      </Tabs>
    </ProForm>
  );
};

export default PartAdminForm;
