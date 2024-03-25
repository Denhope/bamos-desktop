//@ts-nocheck

import React, { FC, useEffect, useRef, useState } from 'react';

import {
  ProForm,
  ProFormText,
  ProFormGroup,
  ProFormSelect,
} from '@ant-design/pro-form';
import { Button, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { IOrder, IOrderItem } from '@/models/IRequirement';
import { ProFormDatePicker, ProFormTextArea } from '@ant-design/pro-components';

import { useGetREQCodesQuery } from '@/features/requirementsCodeAdministration/requirementsCodesApi';
import { useGetProjectsQuery } from '@/features/projectAdministration/projectsApi';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';

import { OrderType } from '@/models/IOrder';
import { useGetVendorsQuery } from '@/features/vendorAdministration/vendorApi';
import PartList from './PartList';
import { useGetFilteredRequirementsQuery } from '@/features/requirementAdministration/requirementApi';
import PartDetailForm from './PartDetailForm';

interface UserFormProps {
  order?: IOrder;
  orderItem?: IOrderItem;
  onSubmit: (company: IOrder) => void;
  onDelete?: (orderID: string) => void;
  onOrderItemUpdate: (orderItem: IOrderItem) => void;
}

const OrderAdministrationForm: FC<UserFormProps> = ({
  order,
  onSubmit,
  orderItem,
  onOrderItemUpdate,
}) => {
  const [tabTitles, setTabTitles] = useState({
    '1': 'ORDER INFO',
    '2': 'PARTS',
    '3': 'ORDER #№ AND PART_NUMBER',
  });

  const [form] = ProForm.useForm();
  const [parts, setSelectedParts] = useState<any | null>([]);
  const [orderData, setOrderData] = useState<IOrder | null>();
  const [orderItemData, setSelectedOrderItemData] = useState<any | null>([]);
  const handleUpdateOrderItem = async (orderItem: IOrderItem) => {
    try {
      if (orderItem) {
        onOrderItemUpdate({
          ...orderItem,
          partID: orderItem.partID._id,
          vendorID: orderItem.vendorID._id,
        });
      }
    } catch (error) {}
  };
  const updateTabTitle = (selectedItem: IOrderItem | null, order: IOrder) => {
    if (order) {
      setTabTitles({
        ...tabTitles,
        '1': `ORDER #№: ${order?.orderNumberNew}`,
      });
    }
    if (selectedItem) {
      setTabTitles({
        ...tabTitles,
        '3': `ORDER #№: ${order?.orderNumberNew}POS:${selectedItem?.index} - PART_NUMBER: ${selectedItem?.partID?.PART_NUMBER}`,
      });
    } else {
      setTabTitles({
        ...tabTitles,
        '3': 'ORDER #№ AND PART_NUMBER',
      });
    }
  };

  // Update the tab title when the selected order item changes
  useEffect(() => {
    updateTabTitle(orderItem, order);
  }, [orderItem, order]);

  useEffect(() => {
    if (order) {
      form.resetFields();
      form.setFieldsValue(order);
      // form.setFields([{ name: 'vendorID', value: order.vendorID._id }]);

      setOrderData(order);
      setSelectedParts(order.parts);
    } else {
      form.resetFields();
      setOrderData(null);
      setSelectedParts([]);
    }
  }, [order, form]);

  useEffect(() => {
    if (orderItem) {
      setSelectedOrderItemData(orderItem);
    } else {
      form.resetFields();
      setOrderData(null);
    }
  }, [orderItem, form]);

  const { t } = useTranslation();

  const handleSubmit = async (values: any) => {
    const newUser: IOrder = order
      ? { ...order, ...values, parts }
      : { ...values, parts };

    onSubmit(newUser);
    console.log(newUser);
  };

  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {order ? t('UPDATE') : t('CREATE')}
    </Button>
  );

  const { data: vendors } = useGetVendorsQuery({});

  const { data: reqCodes } = useGetREQCodesQuery({});

  const { data: partNumbers, isLoading, isError } = useGetPartNumbersQuery({});
  const [selectedProjectType, setSelectedProjectType] =
    useState<OrderType | null>(null);

  const { data: projects } = useGetProjectsQuery({});
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const [activeTabKey, setActiveTabKey] = useState('1'); // Default to the first tab
  useEffect(() => {
    setShowSubmitButton(activeTabKey === '1' || activeTabKey === '2');
  }, [activeTabKey]);

  const vendorValueEnum: Record<string, string> =
    vendors?.reduce((acc, vendor) => {
      acc[vendor.id] = String(vendor.CODE).toUpperCase();
      return acc;
    }, {}) || {};

  const partValueEnum: Record<string, any> =
    partNumbers?.reduce((acc, partNumber) => {
      acc[partNumber._id] = partNumber.PART_NUMBER;
      return acc;
    }, {}) || {};

  const { data: requirements } = useGetFilteredRequirementsQuery({
    status: 'open',
  });
  const requirementCodesValueEnum: Record<string, string> =
    reqCodes?.reduce((acc, reqCode) => {
      acc[reqCode.id] = reqCode.code;
      return acc;
    }, {}) || {};

  return (
    <ProForm
      onReset={() => {
        form.resetFields();
      }}
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => {
          if (showSubmitButton && parts?.length > 0) {
            return [<SubmitButton key="submit" />, dom.reverse()[1]];
          }
          return null;
        },
      }}
      initialValues={order}
      layout="horizontal"
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
          <ProFormGroup>
            <ProFormSelect
              showSearch
              rules={[{ required: true }]}
              name="state"
              label={t('ORDER STATUS')}
              width="sm"
              initialValue={'draft'}
              valueEnum={{
                planned: { text: t('PLANNED'), status: 'Default' },
                onQuatation: { text: t('QUATATION'), status: 'Processing' },
                open: { text: t('NEW'), status: 'Error' },
                draft: { text: t('DRAFT'), status: 'Default' },
                closed: { text: t('CLOSED'), status: 'Default' },
                canceled: { text: t('CANCELLED'), status: 'Error' },
                onOrder: { text: t('ISSUED'), status: 'Processing' },
              }}
            />

            <ProFormSelect
              showSearch
              onChange={(value: any) => setSelectedProjectType(value)}
              name="orderType"
              label={t('ORDER TYPE')}
              width="lg"
              tooltip={t('ORDER TYPE')}
              valueEnum={{
                QUOTATION_ORDER: t('QUATATION ORDER'),
                PURCHASE_ORDER: t('PURCHASE ORDER'),
                REPAIR_ORDER: t('REPAIR ORDER'),
              }}
            />
          </ProFormGroup>

          <ProFormGroup></ProFormGroup>
          {(selectedProjectType === 'QUOTATION_ORDER' ||
            order?.orderType === 'QUOTATION_ORDER') && (
            <>
              <ProFormGroup direction="horizontal">
                <ProFormText
                  rules={[{ required: true }]}
                  name="orderName"
                  label={t('ORDER SHOT NAME')}
                  width="sm"
                ></ProFormText>{' '}
                <ProFormSelect
                  rules={[{ required: true }]}
                  name="orderText"
                  label={t('ORDER TEXT')}
                  width="lg"
                  valueEnum={{
                    'Hello team! Please provide a quota for the position:': t(
                      'Hello team! Please provide a quota for the position:'
                    ),
                    'Здравствуйте! Просим предоставить коммерческое предложение на:':
                      t(
                        'Здравствуйте! Просим предоставить коммерческое предложение на:'
                      ),
                  }}
                ></ProFormSelect>
              </ProFormGroup>
            </>
          )}

          <ProFormGroup>
            <ProFormDatePicker
              label={t(' START DATE')}
              name="startDate"
              width="sm"
            ></ProFormDatePicker>
            <ProFormDatePicker
              label={t('FINISH DATE')}
              name="finishDate"
              width="sm"
            ></ProFormDatePicker>
          </ProFormGroup>
          <ProFormGroup>
            <ProFormSelect
              showSearch
              rules={[{ required: true }]}
              mode="multiple"
              name="vendorID"
              label={`${t(`VENDORS`)}`}
              width="lg"
              valueEnum={vendorValueEnum}
              onChange={async (value: any) => {
                // setSelectedProjectId(value);
              }}
            />
          </ProFormGroup>

          <ProFormTextArea
            fieldProps={{
              style: { resize: 'none' },
              rows: 3,
            }}
            name="notes"
            colSize={1}
            label={t('REMARKS')}
            width="xl"
          ></ProFormTextArea>
        </Tabs.TabPane>
        <Tabs.TabPane tab={tabTitles['2']} key="2">
          <ProFormGroup>
            <PartList
              order={orderData}
              partValueEnum={partValueEnum}
              requirements={requirements}
              onDataChange={function (
                rows: { partNumberID: string; quantity: number }[]
              ): void {
                // console.log(rows);
                setSelectedParts(rows);
              }}
              requirementCodesValueEnum={requirementCodesValueEnum}
            />
          </ProFormGroup>
        </Tabs.TabPane>
        <Tabs.TabPane tab={tabTitles['3']} key="3">
          <ProFormGroup>
            <PartDetailForm
              partValueEnum={partValueEnum}
              orderItem={orderItemData}
              order={order}
              onSubmit={function (orderItem: IOrderItem): void {
                handleUpdateOrderItem(orderItem);
              }}
            />
          </ProFormGroup>
        </Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};
export default OrderAdministrationForm;
