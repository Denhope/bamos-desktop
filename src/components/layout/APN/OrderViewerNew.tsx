//@ts-nocheck

import React, { FC, useEffect, useMemo, useState } from 'react';
import TabContent from '@/components/shared/Table/TabContent';
import { useTranslation } from 'react-i18next';
import { ApartmentOutlined, PlusSquareOutlined } from '@ant-design/icons';
import OrderItemList from '@/components/orderViewer/OrderItemList';
import OrdersFilterViewerForm from '@/components/orderViewer/OrdersFilterViewerForm';
import { Button, Col, Layout, Menu, MenuProps, Modal, Space } from 'antd';
import { PrinterOutlined, SaveOutlined } from '@ant-design/icons';
import { useGetFilteredOrderItemsFullQuery } from '@/features/orderItemsAdministration/orderItemApi';
import GeneretedMarcketingTable from '@/components/orderViewer/GeneretedMarcketingTable';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import {
  ValueEnumType,
  getItem,
  getStatusColor,
  handleFileOpen,
  handleFileSelect,
  transformToIORderItem,
} from '@/services/utilites';
import FileModalList from '@/components/shared/FileModalList';

interface ReceivingTracking {
  onDoubleClick?: (record: any, rowIndex?: any) => void;
  onSingleRowClick?: (record: any) => void;
}
const OrderViewer: FC<ReceivingTracking> = ({ onSingleRowClick }) => {
  const { t } = useTranslation();

  const valueEnum: ValueEnumType = {
    onShort: t('ON SHORT'),
    onQuatation: t('QUATATION'),
    open: t('OPEN'),
    closed: t('CLOSED'),
    canceled: t('CANCELLED'),
    onOrder: t('ISSUED'),
    draft: t('DRAFT'),
    issued: t('ISSUED'),
    progress: t('IN PROGRESS'),
    transfer: t('TRANSFER'),
    complete: t('COMPLETE'),
    RECEIVED: t('RECEIVED'),
    PARTLY_RECEIVED: t('PARTLY RECEIVED'),
  };
  const columnOrderItems = [
    {
      field: 'orderNumber',
      headerName: `${t('ORDER No')}`,
      cellDataType: 'text',
      with: 100,
    },
    {
      field: 'orderType',
      headerName: `${t('ORDER TYPE')}`,
      cellDataType: 'text',
    },
    {
      field: 'index',
      headerName: `${t('POS')}`,
      cellDataType: 'text',
      with: 50,
    },
    {
      field: 'status',
      headerName: `${t('Status')}`,
      cellDataType: 'text',
      width: 200,
      filter: true,
      valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
        params.data.status,
      valueFormatter: (params: { value: keyof ValueEnumType }) => {
        const status = params.value;
        return valueEnum[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumType }) => ({
        backgroundColor: getStatusColor(params.value),
        color: '#ffffff', // Text color
      }),
    },

    {
      headerName: `${t('PART No')}`,
      field: 'PART_NUMBER',
      editable: false,
      width: 200,
    },
    {
      field: 'DESCRIPTION',
      headerName: `${t('DESCRIPTION')}`,
      cellDataType: 'text',
    },
    {
      field: 'GROUP',
      headerName: `${t('GROUP')}`,
      cellDataType: 'text',
    },
    {
      field: 'TYPE',
      headerName: `${t('TYPE')}`,
      cellDataType: 'text',
      editable: false,
    },
    {
      field: 'amout',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('QUANTITY')}`,
    },
    {
      field: 'UNIT_OF_MEASURE',
      editable: false,
      filter: false,
      headerName: `${t('UNIT OF MEASURE')}`,
      cellDataType: 'text',
    },
    {
      field: 'backorderQty',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('BACKORDER')}`,
    },
    {
      field: 'vendorCode',
      editable: false,
      cellDataType: 'text',
      headerName: `${t('VENDOR')}`,
      valueFormatter: (params: { value: string }) => {
        const vendorCode = params?.value?.toUpperCase();
        return vendorCode;
      },
    },
    {
      field: 'allPrice',
      editable: false,
      cellDataType: 'number',
      headerName: `${t('PRICE')}`,
    },
    {
      field: 'currency',
      editable: false,
      cellDataType: 'text',
      headerName: `${t('CURRENCY')}`,
    },

    {
      field: 'createUserName',
      editable: false,
      cellDataType: 'text',
      headerName: `${t('CREATE BY')}`,
      valueFormatter: (params: { value: string }) => {
        const user = params?.value?.toUpperCase();
        return user;
      },
    },
    {
      field: 'createDate',
      editable: false,
      cellDataType: 'date',
      headerName: `${t('CREATE DATE')}`,
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },

    // {
    //   field: 'files',
    //   headerName: `${t('DOC')}`,
    //   width: 200, // Увеличиваем ширину
    //   editable: false,
    //   cellRenderer: (params) => {
    //     <>
    //       <>{console.log}</>
    //       <FileModalList
    //         files={params.files}
    //         onFileSelect={(file) => {
    //           console.log('Selected file:', file);
    //           handleFileSelect({
    //             id: file?.id,
    //             name: file?.name,
    //           });
    //         }}
    //         onFileOpen={(file) => {
    //           console.log('Opened file:', file);
    //           handleFileOpen(file);
    //         }}
    //       />
    //     </>;
    //     // const files = params.row.files || []; // Проверяем, есть ли файлы
    //     // console.log('params.row.files:', files); // Отладка

    //     // if (files.length > 0) {
    //     //   return (
    //     //     <FileModalList
    //     //       files={files}
    //     //       onFileSelect={(file) => {
    //     //         console.log('Selected file:', file);
    //     //         handleFileSelect({
    //     //           id: file?.id,
    //     //           name: file?.name,
    //     //         });
    //     //       }}
    //     //       onFileOpen={(file) => {
    //     //         console.log('Opened file:', file);
    //     //         handleFileOpen(file);
    //     //       }}
    //     //     />
    //     //   );
    //     // } else {
    //     //   return <div>No files</div>;
    //     // }
    //   },
    // },
  ];
  const [orderSearchValues, setOrderSearchValues] = useState<any>();
  const [completeOpenPrintTable, setOpenCompletePrintTable] = useState<any>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const {
    data: ordersItems,
    isLoading,
    isFetching,
    refetch: refetchOrders,
  } = useGetFilteredOrderItemsFullQuery(
    {
      startDate: orderSearchValues?.startDate
        ? orderSearchValues?.startDate
        : '',
      endDate: orderSearchValues?.endDate ? orderSearchValues?.endDate : '',
      state: orderSearchValues?.state || '',
      orderNumberNew: orderSearchValues?.orderNumberNew,
      orderType: orderSearchValues?.orderType || 'QUOTATION_ORDER',
      partNumberID: orderSearchValues?.partNumberID,
      vendorID: orderSearchValues?.vendorID,
    },
    {
      skip: !orderSearchValues,
      refetchOnMountOrArgChange: true,
    }
  );

  const transformedRequirements = useMemo(() => {
    console.log(transformToIORderItem(ordersItems || []));
    return transformToIORderItem(ordersItems || []);
  }, [ordersItems]);
  const tabs = [
    {
      content: (
        <>
          <OrderItemList
            isLoading={isLoading || isFetching}
            rowData={transformedRequirements}
            onCheckItems={setSelectedRowKeys}
            onRowSelect={onSingleRowClick}
            columnDefs={columnOrderItems}
            onUpdateData={function (data: any[]): void {}}
            height={'72vh'}
            isChekboxColumn={true}
            isAddVisiable={true}
            isButtonVisiable={false}
            isEditable={false}
            isVisible={true}
            pagination={true}
          />
        </>
      ),
      title: `${t('ORDER LIST')}`,
    },
  ];
  type MenuItem = Required<MenuProps>['items'][number];
  const [collapsed, setCollapsed] = useState(false);
  const items: MenuItem[] = [
    getItem(
      <>{t('ORDER ITEM VIEWER')} (BAN:121)</>,
      'sub1',
      <ApartmentOutlined />
    ),
  ];
  return (
    <Layout>
      <Sider
        className="h-[87vh] overflow-hidden"
        theme="light"
        width={350}
        collapsible
        // color="rgba(255, 255, 255, 0.2)"
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        <Menu theme="light" mode="inline" items={items} />
        <div className="mx-auto px-5 ">
          <div
            style={{
              display: !collapsed ? 'block' : 'none',
            }}
          >
            <OrdersFilterViewerForm
              loding={isLoading}
              onOrderItemsFilterSearch={setOrderSearchValues}
            />
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <></>
        <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-5">
          <Space className="">
            <Col>
              <Button
                disabled={!selectedRowKeys.length}
                icon={<PrinterOutlined />}
                // disabled={!rowKeys.length}
                onClick={() => {
                  // setPartsToPrint(selectedParts);
                  setOpenCompletePrintTable(true);
                }}
                size="small"
              >
                {t('PRINT TABLE')}
              </Button>
            </Col>
          </Space>
          <TabContent tabs={tabs}></TabContent>
          {/* <OrderPanel orderSearchValues={requirementsSearch}></OrderPanel> */}
          <Modal
            title={t('TABLE PRINT')}
            open={completeOpenPrintTable}
            width={'70%'}
            onCancel={() => setOpenCompletePrintTable(false)}
            footer={null}
          >
            {/* {editingOrder && editingOrder.state === 'onQuatation' && ( */}
            <GeneretedMarcketingTable orderIDs={selectedRowKeys} />
          </Modal>
        </div>
      </Content>
    </Layout>
    // <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-1">
    //   <div className="flex flex-col gap-5">
    //     <OrdersFilterViewerForm
    //       loding={isLoading}
    //       onOrderItemsFilterSearch={setOrderSearchValues}
    //     />
    //     <TabContent tabs={tabs}></TabContent>
    //   </div>

    //   <div className="flex justify-between">
    //     <Space>
    //       <Button
    //         disabled={!selectedRowKeys.length}
    //         icon={<PrinterOutlined />}
    //         // disabled={!rowKeys.length}
    //         onClick={() => {
    //           // setPartsToPrint(selectedParts);
    //           setOpenCompletePrintTable(true);
    //         }}
    //         size="small"
    //       >
    //         {t('PRINT TABLE')}
    //       </Button>
    //     </Space>
    //     <Space>
    //       <Button
    //         icon={<SaveOutlined />}
    //         // }}
    //         size="small"
    //       >
    //         {t('SAVE TABLE')}
    //       </Button>
    //     </Space>
    //   </div>
    //   <Modal
    //     title={t('TABLE PRINT')}
    //     open={completeOpenPrintTable}
    //     width={'70%'}
    //     onCancel={() => setOpenCompletePrintTable(false)}
    //     footer={null}
    //   >
    //     {/* {editingOrder && editingOrder.state === 'onQuatation' && ( */}
    //     <GeneretedMarcketingTable orderIDs={selectedRowKeys} />
    //   </Modal>
    // </div>
  );
};

export default OrderViewer;
