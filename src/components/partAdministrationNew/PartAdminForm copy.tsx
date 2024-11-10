//@ts-nocheck

import React, { FC, useEffect, useState, useCallback, useMemo } from 'react';
import { Button, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  ProForm,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';

import Alternates from './tabs/mainView/Alternates';
import { IPartNumber } from '@/models/IUser';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';

interface UserFormProps {
  order?: IPartNumber | null;
  orderItem?: any;
  onSubmit: (company: any) => void;
  onDelete?: (orderID: string) => void;
  onOrderItemUpdate?: (orderItem: any) => void;
}

const PartAdminForm: FC<UserFormProps> = ({ order, orderItem, onSubmit }) => {
  console.log('Received order in form:', order); // Добавьте это логирование

  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const [tabTitles, setTabTitles] = useState({
    '1': t('PART'),
    '2': t('ALTERNATIVES'),
    '3': t('REMARKS'),
  });

  const { data: acTypes } = useGetACTypesQuery({});

  const acTypeValueEnum = useMemo(
    () =>
      acTypes?.reduce((acc, acType) => {
        if (acType.id && acType.name) {
          acc[acType.id] = acType.name;
        }
        return acc;
      }, {} as Record<string, string>) || {},
    [acTypes]
  );

  const updateTabTitle = useCallback(
    (selectedItem: any | null, order: any) => {
      if (order) {
        setTabTitles((prev) => ({
          ...prev,
          '1': `${t('PART No')}: ${order?.PART_NUMBER}`,
        }));
      }
    },
    [t]
  );

  const handleSubmit = useCallback(
    (values: any) => {
      const submitValues = { ...values };
      if (!submitValues.acTypeID) {
        delete submitValues.acTypeID;
      }
      const newUser = order
        ? { ...order, ...submitValues }
        : {
            ...submitValues,
            companyID: localStorage.getItem('companyID') || '',
          };
      onSubmit(newUser);
    },
    [order, onSubmit]
  );

  useEffect(() => {
    updateTabTitle(orderItem, order);
  }, [orderItem, order, updateTabTitle]);

  useEffect(() => {
    console.log('Order changed, updating form:', order);
    form.resetFields();
    if (order) {
      const formValues = { ...order };
      if (!formValues.acTypeID) {
        delete formValues.acTypeID;
      }
      form.setFieldsValue(formValues);
    }
  }, [order, form]);

  useEffect(() => {
    setShowSubmitButton(activeTabKey === '1');
  }, [activeTabKey]);

  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {order ? t('UPDATE') : t('CREATE')}
    </Button>
  );

  //  const initialValues = {
  //   PART_NUMBER: order?.PART_NUMBER || '',
  //   DESCRIPTION: order?.DESCRIPTION || '',
  //   ADD_DESCRIPTION: order?.ADD_DESCRIPTION || '',
  //   TYPE: order?.TYPE || '',
  //   GROUP: order?.GROUP || '',
  //   UNIT_OF_MEASURE: order?.UNIT_OF_MEASURE || '',
  //   ADD_UNIT_OF_MEASURE: order?.ADD_UNIT_OF_MEASURE || '',
  //   acTypeID: order?.acTypeID || '',
  // };

  return (
    <ProForm
      key={order ? order.PART_NUMBER : 'new'}
      layout="horizontal"
      onReset={() => form.resetFields()}
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
          <div className="h-[55vh] flex flex-col overflow-auto">
            <ProFormText
              rules={[{ required: true }]}
              name="PART_NUMBER"
              label={t('PART No')}
              width="lg"
              tooltip={t('PART No')}
            />
            <ProFormText
              fieldProps={{ style: { resize: 'none' } }}
              rules={[{ required: true }]}
              name="DESCRIPTION"
              label={t('DESCRIPTION')}
              width="lg"
              tooltip={t('DESCRIPTION')}
            />
            <ProFormText
              fieldProps={{ style: { resize: 'none' } }}
              name="ADD_DESCRIPTION"
              label={t('ADD DESCRIPTION')}
              width="lg"
              tooltip={t('ADD DESCRIPTION')}
            />
            <ProFormSelect
              rules={[{ required: true }]}
              name="TYPE"
              label={t('PART TYPE')}
              width="lg"
              tooltip={t('SELECT PART TYPE')}
              options={[
                { value: 'ROTABLE', label: t('ROTABLE') },
                { value: 'CONSUMABLE', label: t('CONSUMABLE') },
              ]}
            />
            <ProFormSelect
              rules={[{ required: true }]}
              name="GROUP"
              label={t('PART GROUP')}
              width="lg"
              tooltip={t('SELECT SPECIAL GROUP')}
              options={[
                { value: 'CONS', label: t('CONS') },
                { value: 'TOOL', label: t('TOOL') },
                { value: 'CHEM', label: t('CHEM') },
                { value: 'ROT', label: t('ROT') },
                { value: 'GSE', label: t('GSE') },
              ]}
            />
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
            />
            <ProFormSelect
              showSearch
              rules={[{ required: true }]}
              label={t('ADD UNIT')}
              name="ADD_UNIT_OF_MEASURE"
              width="xl"
              valueEnum={{
                шт: t('шт').toUpperCase(),
                м: t('м').toUpperCase(),
                мл: t('мл').toUpperCase(),
                дюйм2: t('дюйм2').toUpperCase(),
                см: t('см').toUpperCase(),
                г: t('г').toUpperCase(),
                ярд: t('ярд').toUpperCase(),
                фут: t('фут').toUpperCase(),
                см2: t('см2').toUpperCase(),
                дюйм: t('дюйм').toUpperCase(),
                м2: t('м2').toUpperCase(),
                рул: t('рул').toUpperCase(),
                л: t('л').toUpperCase(),
                кг: t('кг').toUpperCase(),
              }}
            />
            <ProFormSelect
              showSearch
              name="acTypeID"
              label={t('AC TYPE')}
              width="lg"
              valueEnum={acTypeValueEnum}
            />
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={tabTitles['2']} key="2">
          <Alternates currentPart={order} />
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};

export default PartAdminForm;
