import {
  FormInstance,
  ModalForm,
  ProColumns,
  ProForm,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import VendorSearchForm from '@/components/store/search/VendorSearchForm';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { t } from 'i18next';
import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { USER_ID } from '@/utils/api/http';
import { getFilteredOrders, updateOrderByID } from '@/utils/api/thunks';
import { v4 as originalUuidv4 } from 'uuid'; // Импортируйте библиотеку uuid
import ContextMenuVendorsSearchSelect from '@/components/shared/form/ContextMenuVendorsSearchSelect';
import { IOrder } from '@/models/IOrder';
type AddVendorsFormPropsType = {
  scroll: number;
  scrollX?: number;
  currenOrder?: IOrder;
  onOrderEdit: (order?: any) => void;
};
const AddVendorsForm: FC<AddVendorsFormPropsType> = ({
  scroll,
  currenOrder,
  onOrderEdit,
}) => {
  const uuidv4: () => string = originalUuidv4;
  const [form] = Form.useForm();
  const formRef = useRef<FormInstance>(null);
  const [openVendorFindModal, setOpenVendorFind] = useState(false);
  const [selectedSingleVendor, setSecectedSingleVendor] = useState<any>();
  const [selectedRowKey, setSelectedRowKey] = useState<string | null | number>(
    null
  );
  const [data, setData] = useState<any>([]);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const addData = (newRecord: any) => {
    if (!data.some((record: any) => record.CODE === newRecord.CODE)) {
      setData((prevData: any) => [...prevData, newRecord]);
    }
  };
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const [initialForm, setinitialForm] = useState<any>('');
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('CODE')}`,
      dataIndex: 'CODE',
      key: 'CODE',

      ellipsis: true,
      formItemProps: {
        name: 'code',
      },
    },

    {
      title: `${t('NAME')}`,
      dataIndex: 'NAME',
      key: 'NAME',
      ellipsis: true, //

      formItemProps: {
        name: 'name',
      },
    },

    {
      title: `${t('CITY')}`,
      dataIndex: 'CITY',
      key: 'CITY',

      // responsive: ['sm'],

      ellipsis: true, //
      // width: '20%',
      formItemProps: {
        name: 'city',
      },
    },
    {
      title: `${t('COUNTRY')}`,
      dataIndex: 'COUNTRY',
      key: 'COUNTRY',

      // responsive: ['sm'],

      ellipsis: true, //
      // width: '20%',
      formItemProps: {
        name: 'country',
      },
    },
  ];

  const rowClassName = (record: any) => {
    if (record?._id) {
      return record?._id === selectedRowKey
        ? 'cursor-pointer text-xs text-transform: uppercase bg-blue-100 py-0 my-0 '
        : 'cursor-pointer  text-xs text-transform: uppercase  py-0 my-0';
    } else {
      return 'cursor-pointer  text-xs text-transform: uppercase py-0 my-0';
    }
  };
  return (
    <div>
      <ProForm
        onReset={() => {
          setinitialForm('');
          setSecectedSingleVendor({ CODE: '' });
          setData([]);
        }}
        formRef={formRef}
        form={form}
        onFinish={async (values: any) => {
          if (null) {
            message.error('Some fields are empty');
          } else {
            const currentCompanyID = localStorage.getItem('companyID') || '';
            if (currenOrder?.orderType === 'QUOTATION_ORDER') {
              const result = await dispatch(
                updateOrderByID({
                  id: currenOrder._id || currenOrder.id,
                  companyID: currentCompanyID || '',
                  updateByID: USER_ID,
                  updateBySing: localStorage.getItem('singNumber'),
                  updateByName: localStorage.getItem('name'),
                  updateDate: new Date(),

                  parts: (currenOrder.parts || []).map((part: any) => ({
                    ...part,
                    vendors: data.map((item: any) => ({
                      ...item,
                      id: uuidv4(),
                      partNumber: part.PART_NUMBER || part.PN,
                      description: part.DESCRIPTION || part.nameOfMaterial,
                      price: null,
                      currency: null,
                      quantity: null,
                      alternates: [],
                      discount: null,
                      condition: null,
                      leadTime: null,
                      state: 'DRAFT',
                      files: [],
                    })),
                  })),
                })
              );
              if ((await result).meta.requestStatus === 'fulfilled') {
                onOrderEdit((await result).payload || []);
                message.success('SUCCESS');
              } else {
                message.error('ERROR');
              }
            } else if (currenOrder?.orderType === 'PURCHASE_ORDER') {
              const result = await dispatch(
                updateOrderByID({
                  id: currenOrder._id || currenOrder.id,
                  companyID: currentCompanyID || '',
                  updateByID: USER_ID,
                  updateBySing: localStorage.getItem('singNumber'),
                  updateByName: localStorage.getItem('name'),
                  updateDate: new Date(),
                  vendors: [selectedSingleVendor],
                })
              );
              if ((await result).meta.requestStatus === 'fulfilled') {
                onOrderEdit((await result).payload || []);
                message.success('SUCCESS');
              } else {
                message.error('ERROR');
              }
            }

            // onSelectLocation(selectedLocation);
            // onFilterTransferParts(selectedFeatchStore);
          }
        }}
      >
        <ContextMenuVendorsSearchSelect
          // disabled={!isCreating}
          width="lg"
          rules={[{ required: true }]}
          name={'SUPPLIES_CODE'}
          onSelectedVendor={function (record: any, rowIndex?: any): void {
            setSecectedSingleVendor(record);
            addData(record);
          }}
          initialForm={
            selectedSingleVendor?.CODE || initialForm
            //  ||
            // currentReceiving?.SUPPLIES_CODE
          }
          label={'SUPPLIES CODE'}
        />
        <ProTable
          className="m-0 py-5"
          rowClassName={rowClassName}
          columns={initialColumns}
          size="small"
          bordered
          search={false}
          options={{
            density: false,
            search: false,
            fullScreen: false,
            reload: false,
            setting: false,
          }}
          onRow={(record: any, rowIndex) => {
            return {
              onClick: async (event) => {
                setSelectedRowKey(record?._id);
              },
            };
          }}
          scroll={{ y: `calc(${scroll}vh)` }}
          dataSource={data}
        ></ProTable>
        <ModalForm
          // title={`Search on Store`}
          width={'70vw'}
          // placement={'bottom'}
          open={openVendorFindModal}
          // submitter={false}
          onOpenChange={setOpenVendorFind}
          onFinish={async function (
            record: any,
            rowIndex?: any
          ): Promise<void> {
            setOpenVendorFind(false);
            setSecectedSingleVendor(record);

            form.setFields([
              { name: 'vendorName', value: selectedSingleVendor.CODE },
            ]);
          }}
        >
          <VendorSearchForm
            initialParams={{ partNumber: '' }}
            scroll={45}
            onRowClick={function (record: any, rowIndex?: any): void {
              setOpenVendorFind(false);
              // setData([record]);
              // console.log(data);

              // form.setFields([{ name: 'vendorName', value: record.CODE }]);
            }}
            isLoading={false}
            onRowSingleClick={function (record: any, rowIndex?: any): void {
              setSecectedSingleVendor(record);
              form.setFields([{ name: 'vendorName', value: record.CODE }]);
              addData(record);
              // console.log(record);
            }}
          />
        </ModalForm>
      </ProForm>
    </div>
  );
};

export default AddVendorsForm;
