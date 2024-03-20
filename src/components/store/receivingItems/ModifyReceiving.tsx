import {
  ProForm,
  ProFormGroup,
  ProFormText,
  ProFormDatePicker,
  ProFormSelect,
  ProFormTimePicker,
  ProColumns,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import EditableTable from '@/components/shared/Table/EditableTable';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { IReceiving } from '@/models/IReceiving';
import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getFilteredReceivingItems,
  updateManyMaterialItems,
  updateManyReceivingItems,
  updateReceivingByNumber,
} from '@/utils/api/thunks';
type ModifyReceivingType = {
  selectedRowKeys?: any[];
  onEditReceivings: (orders: any[] | []) => void;
  data: any | null;
  onEditingReceivingItems?: (items: any) => void;
  onEditingReceivingNumber?: (number: any) => void;
};
const ModifyReceiving: FC<ModifyReceivingType> = ({
  data,
  selectedRowKeys,
  onEditReceivings,
}) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [items, setFeachItems] = useState<any[] | null>([]);

  useEffect(() => {
    const fetchData = async () => {
      const currentCompanyID = localStorage.getItem('companyID') || '';
      const result = dispatch(
        getFilteredReceivingItems({
          companyID: currentCompanyID,
          receiningNumber: data?.RECEIVING_NUMBER,
        })
      );
      if ((await result).meta.requestStatus === 'fulfilled') {
        setFeachItems((await result).payload || []);
      } else {
        message.error('Error');
      }
    };
    fetchData();
  }, [data, dispatch]);
  useEffect(() => {
    if (data) {
      form.setFields([
        { name: 'awbType', value: data.AWB_TYPE },
        { name: 'awbNumber', value: data.AWB_NUMBER },
        { name: 'awbDate', value: data.AWB_DATE },
        { name: 'awbReference', value: data.AWB_REFERENCE },
        { name: 'receivingDate', value: moment(data.RECEIVED_DATE) },
        { name: 'receivingTime', value: moment(data.RECEIVED_DATE) },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [data]);

  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('ORDER NUMBER')}`,
      dataIndex: 'ORDER_NUMBER',
      key: 'ORDER_NUMBER',
      // tooltip: 'ITEM STORE',
      ellipsis: true,

      formItemProps: {
        name: 'ORDER_NUMBER',
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('PART No')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      ellipsis: true,
      //tooltip: 'ITEM PART_NUMBER',
      // ellipsis: true,

      formItemProps: {
        name: 'PART_NUMBER',
      },
    },
    {
      title: `${t('BATCH NUMBER')}`,
      dataIndex: 'SUPPLIER_BATCH_NUMBER',
      key: 'SUPPLIER_BATCH_NUMBER',
      ellipsis: true,
      render: (text: any, record: any) => record?.SUPPLIER_BATCH_NUMBER,
      // остальные свойства...
    },
    {
      title: `${t('SERIAL NUMBER')}`,
      dataIndex: 'SERIAL_NUMBER',
      key: 'SERIAL_NUMBER',
      ellipsis: true,
      render: (text: any, record: any) => record?.SERIAL_NUMBER,
      // остальные свойства...
    },
    {
      title: `${t('CERTIFICATE NUMBER')}`,
      dataIndex: 'APPROVED_CERT',
      key: 'APPROVED_CERT',
      ellipsis: true,
      render: (text: any, record: any) => record?.APPROVED_CERT,
      // остальные свойства...
    },
  ];
  const [selectedMaterials, setSelectedMaterials] = useState<any>([]);

  return (
    <div>
      <ProForm
        onFinish={async (values) => {
          const currentCompanyID = localStorage.getItem('companyID') || '';
          const result = dispatch(
            updateReceivingByNumber({
              COMPANY_ID: currentCompanyID,
              RECEIVING_NUMBER: data?.RECEIVING_NUMBER,
              awbType: values.awbType,
              awbNumber: values.awbNumber,
              awbDate: values.awbDate,
              awbReference: values.awbReference,
              receivingDate: values.receivingDate,
              updateDate: new Date(),
              updateUserID: localStorage.getItem('companyID') || '',
              updateUserSing: localStorage.getItem('singNumber') || '',
            })
          );
          if ((await result).meta.requestStatus === 'fulfilled') {
            const result = dispatch(
              updateManyReceivingItems({
                companyID: currentCompanyID || '',
                ids: items && items.map((item: any) => item._id),
                AWB_DATE: values.awbDate,
                AWB_NUMBER: values.awbNumber,
                AWB_TYPE: values.awbType,
                RECEIVED_DATE: moment(values.receivingDate)
                  .set({
                    hour: moment(values.receivingTime, 'HH:mm').get('hour'),
                    minute: moment(values.receivingTime, 'HH:mm').get('minute'),
                  })
                  .toISOString(),
                AWB_REFERENCE: values.awbReference,
                updateDate: new Date(),
                updateUserID: localStorage.getItem('companyID') || '',
                updateUserSing: localStorage.getItem('singNumber') || '',
              })
            );
            if ((await result).meta.requestStatus === 'fulfilled') {
              const result = dispatch(
                getFilteredReceivingItems({
                  companyID: currentCompanyID,
                  receiningNumber: data?.RECEIVING_NUMBER,
                })
              );
              if ((await result).meta.requestStatus === 'fulfilled') {
                onEditReceivings((await result).payload || []);
                dispatch(
                  updateManyMaterialItems({
                    companyID: currentCompanyID || '',
                    ids:
                      (await result).payload &&
                      (await result).payload.map(
                        (item: any) =>
                          item?.MATERIAL_STORE_ID && item?.MATERIAL_STORE_ID
                      ),
                    AWB_DATE: values.awbDate,
                    AWB_NUMBER: values.awbNumber,
                    AWB_TYPE: values.awbType,
                    RECEIVED_DATE: moment(values.receivingDate)
                      .set({
                        hour: moment(values.receivingTime, 'HH:mm').get('hour'),
                        minute: moment(values.receivingTime, 'HH:mm').get(
                          'minute'
                        ),
                      })
                      .toISOString(),
                    AWB_REFERENCE: values.awbReference,
                  })
                );
              } else {
                message.error('Error');
              }
            }
          }
        }}
        // submitter={false}
        form={form}
        size="small"
        layout="horizontal"
        className="bg-white px-4 py-3 rounded-md border-gray-400"
      >
        <ProFormGroup direction="horizontal">
          <ProFormGroup direction="vertical">
            <ProFormSelect
              rules={[{ required: true }]}
              name="awbType"
              label={t('DOC TYPE')}
              valueEnum={{
                ТН: t('Товарная накладная'),
                ТТН: t('Товарно-транспортная накладная'),
                УПД: t('Универсальный передаточный документ'),
                СФ: t('Счет-фактура'),
                ДТ: t('Декларация на товары'),
                Инв: t('Инвойс'),
                АПП: t('Акт приема-передачи'),
              }}
              width="sm"
              tooltip={t('DOC TYPE')}
            ></ProFormSelect>
            <ProFormText
              name="awbNumber"
              label={t(' DOC No')}
              rules={[{ required: true }]}
              width="sm"
              tooltip={t(' DOC NNUMBER')}
            ></ProFormText>
          </ProFormGroup>
          <ProFormGroup direction="vertical">
            <ProFormDatePicker
              name="awbDate"
              rules={[{ required: true }]}
              label={t('DOC DATE')}
              width="sm"
            ></ProFormDatePicker>
            <ProFormText
              name="awbReference"
              rules={[{ required: false }]}
              label={t(' REFERENCE')}
              width="sm"
              tooltip={t(' REFERENCE')}
            ></ProFormText>
          </ProFormGroup>
          <ProFormGroup direction="vertical">
            <ProFormDatePicker
              name="receivingDate"
              rules={[{ required: true }]}
              label={t('RECEIVING DATE')}
              width="sm"
            ></ProFormDatePicker>
            <ProFormTimePicker
              name="receivingTime"
              rules={[{ required: true }]}
              label={t('RECEIVING TIME')}
              width="sm"
              fieldProps={{
                format: 'HH:mm',
              }}
            ></ProFormTimePicker>
          </ProFormGroup>
        </ProFormGroup>
        <div className="py-5">
          {' '}
          <EditableTable
            data={items}
            showSearchInput
            isNoneRowSelection={true}
            initialColumns={initialColumns}
            isLoading={false}
            menuItems={undefined}
            recordCreatorProps={false}
            onMultiSelect={(record: any, rowIndex?: any) => {
              // const materials = record.map((item: any) => item._id);
              // // console.log(locationNames);
              // setSelectedMaterials(materials);
            }}
            onRowClick={function (record: any, rowIndex?: any): void {}}
            onDoubleRowClick={() => {}}
            onSave={function (rowKey: any, data: any, row: any): void {}}
            yScroll={23}
            externalReload={function () {
              throw new Error('Function not implemented.');
            }}
          ></EditableTable>
        </div>
      </ProForm>
    </div>
  );
};

export default ModifyReceiving;
