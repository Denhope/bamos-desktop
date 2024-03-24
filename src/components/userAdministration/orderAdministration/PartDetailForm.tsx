//@ts-nocheck

import { IOrder, IOrderItem } from '@/models/IRequirement';
import {
  ProFormDigit,
  ProFormGroup,
  ProFormSelect,
  ProFormTextArea,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import { Button } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
type Props = {
  orderItem?: IOrderItem | null;
  partValueEnum: Record<string, string>;
  onSubmit: (orderItem: IOrderItem) => void;
};
const PartDetailForm: FC<Props> = ({ orderItem, onSubmit, partValueEnum }) => {
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {orderItem ? t('UPDATE') : null}
    </Button>
  );
  const { t } = useTranslation();
  const [form] = ProForm.useForm();
  const handleSubmit = async (values: any) => {
    const newUser: IOrderItem = orderItem
      ? { ...orderItem, ...values }
      : { ...values };

    onSubmit(newUser);
  };
  useEffect(() => {
    if (orderItem) {
      form.resetFields();
      form.setFieldsValue(orderItem);
      form.setFields([
        { name: 'description', value: orderItem.partID?.DESCRIPTION },
        { name: 'partNumberID', value: orderItem.partID?._id },
      ]);
      console.log(orderItem);
    } else {
      form.resetFields();
    }
  }, [orderItem]);
  return (
    <>
      <ProForm
        onFinish={handleSubmit}
        layout="horizontal"
        onReset={() => {
          form.resetFields();
        }}
        // submitter={{
        //   render: (_, dom) => {
        //     if (showSubmitButton) {
        //       return [<SubmitButton key="submit" />, dom.reverse()[1]];
        //     }
        //     return null;
        //   },
        // }}
        size="small"
        form={form}
      >
        <ProFormGroup>
          <ProFormDigit
            name="leadTime"
            rules={[{ required: true }]}
            label={t('LEAD TIME')}
            width="xs"
          ></ProFormDigit>
          {t('DAY')}
        </ProFormGroup>
        <ProFormGroup>
          <ProFormSelect
            showSearch
            // disabled
            rules={[{ required: true }]}
            width={'sm'}
            name="partNumberID"
            label={`${t(`PART No`)}`}
            valueEnum={partValueEnum}
            // options={Object.entries(partValueEnum).map(([key, part]) => ({
            //   label: part.PART_NUMBER,
            //   value: key,
            //   data: part,
            // }))}
          />
          <ProFormText
            rules={[{ required: true }]}
            name="description"
            disabled
            label={t('DESCRIPTION')}
            width="sm"
          ></ProFormText>
        </ProFormGroup>

        <ProFormGroup>
          <ProFormDigit
            rules={[{ required: true }]}
            name="price"
            label={t('PURSHASE PRICE')}
            width="xs"
          ></ProFormDigit>
          <ProFormDigit
            rules={[{ required: true }]}
            name="allPrice"
            label={t('ALL PRICE')}
            width="xs"
          ></ProFormDigit>
          <ProFormSelect
            showSearch
            name="currency"
            rules={[{ required: true }]}
            label={t('CURRENCY')}
            width="sm"
            valueEnum={{
              BYN: `BYN/${t('Belarussian Ruble').toUpperCase()}`,
              RUB: `RUB/${t('Russian Ruble').toUpperCase()}`,
              USD: `USD/${t('US Dollar').toUpperCase()}`,
              EUR: `EUR/${t('Euro').toUpperCase()}`,
              GBP: `GBP/${t('British Pound').toUpperCase()}`,
              JPY: `JPY/${t('Japanese Yen').toUpperCase()}`,
              AUD: `AUD/${t('Australian Dollar').toUpperCase()}`,
              CAD: `CAD/${t('Canadian Dollar').toUpperCase()}`,
              CHF: `CHF/${t('Swiss Franc').toUpperCase()}`,
              CNY: `CNY/${t('Chinese Yuan').toUpperCase()}`,
              HKD: `HKD/${t('Hong Kong Dollar').toUpperCase()}`,
              NZD: `NZD/${t('New Zealand Dollar').toUpperCase()}`,
              SEK: `SEK/${t('Swedish Krona').toUpperCase()}`,
              KRW: `KRW/${t('South Korean Won').toUpperCase()}`,
              SGD: `SGD/${t('Singapore Dollar').toUpperCase()}`,
              NOK: `NOK/${t('Norwegian Krone').toUpperCase()}`,
              MXN: `MXN/${t('Mexican Peso').toUpperCase()}`,
              INR: `INR/${t('Indian Rupee').toUpperCase()}`,
              ZAR: `ZAR/${t('South African Rand').toUpperCase()}`,
              BRL: `BRL/${t('Brazilian Real').toUpperCase()}`,
              TWD: `TWD/${t('New Taiwan Dollar').toUpperCase()}`,
            }}
          ></ProFormSelect>

          <ProFormSelect
            showSearch
            rules={[{ required: true }]}
            label={t('UNIT')}
            name="unit"
            width="sm"
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
          <ProFormDigit
            name="minQuoted"
            label={t('MIN QUOTED')}
            width="sm"
          ></ProFormDigit>
          <ProFormDigit
            name="qtyQuoted"
            label={t('QUANTITY QTY')}
            width="sm"
          ></ProFormDigit>
          <ProFormText name="nds" label={t('NDS')} width="sm"></ProFormText>
        </ProFormGroup>

        <ProFormSelect
          showSearch
          rules={[{ required: true }]}
          name="condition"
          label={t('CONDITION')}
          width="sm"
          valueEnum={{
            '/NEW': t('NEW'),
            '/INSPECTED': t('INSPECTED'),
            '/REPAIRED': t('REPAIRED / ТЕКУЩИЙ РЕМОНТ'),
            '/SERVICABLE': t('SERVICABLE / ИСПРАВНО'),
            '/UNSERVICABLE': t('UNSERVICABLE / НЕИСПРАВНО'),
          }}
        />
        <ProFormGroup>
          {orderItem && orderItem?.orderID?.orderType === 'QUOTATION_ORDER' && (
            <ProFormDigit
              name="qtyQuoted"
              label={t('QUANTITY QUOTED')}
              width="xs"
            ></ProFormDigit>
          )}
          <ProFormTextArea
            className="mb-5"
            fieldProps={{ style: { resize: 'none' } }}
            name="notes"
            colSize={1}
            label={t('REMARKS')}
            width="lg"
          ></ProFormTextArea>
        </ProFormGroup>
      </ProForm>
    </>
  );
};

export default PartDetailForm;
