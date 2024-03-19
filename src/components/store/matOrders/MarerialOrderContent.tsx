import {
  ModalForm,
  ProColumns,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import EditableTable from '@/components/shared/Table/EditableTable';
import React, { FC, useEffect, useState } from 'react';
import { MaterialOrder } from '@/store/reducers/StoreLogisticSlice';
import { SearchOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Form, Input, Modal, message } from 'antd';

import ModalSearchContent from './ModalContent';

import { UserResponce } from '@/models/IUser';
import Title from 'antd/es/typography/Title';
import TabContent from '@/components/shared/Table/TabContent';
import {
  createPickSlip,
  updatedMaterialOrdersById,
  getFilteredMaterialOrders,
  updatedMaterialItemsById,
  updateRequirementByID,
} from '@/utils/api/thunks';
import { PrinterOutlined } from '@ant-design/icons';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import moment from 'moment';
import GeneretedPickSlip from '@/components/pdf/GeneretedPickSlip';
import { useTranslation } from 'react-i18next';
import UserSearchForm from '@/components/shared/form/UserSearchProForm';
import { USER_ID } from '@/utils/api/http';
type MarerialOrderContentProps = {
  order: MaterialOrder;
  disabled?: boolean;
};

import { DownOutlined, DownloadOutlined } from '@ant-design/icons';
import { handleFileOpen, handleFileSelect } from '@/services/utilites';
import FileModalList, { File } from '@/components/shared/FileModalList';

const MarerialOrderContent: FC<MarerialOrderContentProps> = ({
  order,
  disabled,
}) => {
  const { t } = useTranslation();
  const [orderData, setOrderData] = useState(order);
  const [openPickSlip, setOpenPickSlip] = useState(false);
  const [updatedOrderData, setUpdatedOrderData] = useState(order);
  const [rowData, setRowData] = useState(false);
  const [updatetOrderMaterials, setUpdatedOrderMaterials] = useState(
    order.materials
  );
  let onBlockSum = updatetOrderMaterials.reduce((acc: any, item: any) => {
    return acc.concat(item?.onBlock);
  }, []);
  const dispatch = useAppDispatch();
  const [orderMaterials, setOrderMaterials] = useState(
    (order.materials || []).filter(
      (material: { isCopy: any }) => !material.isCopy
    )
  );
  const [orderMaterials1, setOrderMaterials1] = useState(
    order?.materials?.requirementID
  );
  const [issuedMaterials, setIssuedMaterials] = useState(
    updatetOrderMaterials.reduce((acc: any, item: any) => {
      return acc.concat(item?.onBlock);
    }, []) || []
  );

  const [isHovered, setIsHovered] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // updatetOrderMaterials.reduce((acc: any, item: any) => {
  //   return acc.concat(item.onBlock);
  // }, [])
  useEffect(() => {
    // if () {
    setOrderMaterials1(order?.materials?.requirementID);
    setOrderData(order);
    // setOrderMaterials(updatetOrderMaterials);
    updatetOrderMaterials &&
      updatetOrderMaterials.length &&
      setIssuedMaterials(
        updatetOrderMaterials.reduce((acc: any, item: any) => {
          return acc.concat(item?.onBlock);
        }, [])
      );

    //console.log(issuedMaterials);
  }, [updatetOrderMaterials]);

  // useEffect(() => {
  //   // if () {

  //   setOrderData(updatedOrderData);
  //   setOrderMaterials(updatedOrderData.materials);
  // }, [updatedOrderData]);

  const initialBlockColumns: ProColumns<any>[] = [
    {
      title: 'LABEL',
      dataIndex: 'LOCAL_ID',
      // valueType: 'index',
      ellipsis: true,
      key: 'LOCAL_ID',
      width: '7%',

      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <a
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              // onReqClick(record);
            }}
          >
            {record.LOCAL_ID}
          </a>
        );
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },

    {
      title: `${t('PN')}`,
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      ellipsis: true,
      formItemProps: {
        name: 'PART_NUMBER',
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('SN/BN')}`,
      dataIndex: 'BATCH_ID',
      key: 'BATCH_ID',
      ellipsis: true,
      formItemProps: {
        name: 'BATCH_ID',
      },

      // responsive: ['sm'],
    },

    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'NAME_OF_MATERIAL',
      key: 'NAME_OF_MATERIAL',
      // responsive: ['sm'],
      tooltip: 'Text Show',
      ellipsis: true, //
      // width: '20%',
    },
    {
      title: `${t('BOOKED QTY')}`,
      dataIndex: 'QUANTITY',
      key: 'QUANTITY',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('CANCELLED QTY')}`,
      dataIndex: 'CANCELED_QUANTITY',
      key: 'CANCELED_QUANTITY',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t('UNIT')}`,
      dataIndex: 'UNIT_OF_MEASURE',
      key: 'UNIT_OF_MEASURE',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: 'LOCATION FROM',
      dataIndex: 'SHELF_NUMBER',
      key: 'SHELF_NUMBER',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: 'LOCATION TO',
      dataIndex: 'LOCATION_TO',
      key: 'LOCATION_TO',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('REMARKS')}`,
      dataIndex: 'doc',
      key: 'doc',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('DOC')}`,
      dataIndex: 'doc',
      key: 'doc',
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <div
            className="cursor-pointer hover:text-blue-500"
            onClick={() => {
              // handleFileSelect({
              //   id: record?.FILES[0]?.id,
              //   name: record?.FILES[0]?.name,
              // });
            }}
          >
            {record?.FILES && record?.FILES?.length > 0 && (
              <FileModalList
                files={record?.FILES}
                onFileSelect={function (file: any): void {
                  handleFileSelect({
                    id: file?.id,
                    name: file?.name,
                  });
                }}
                onFileOpen={function (file: File): void {
                  handleFileOpen(file);
                }}
              />
            )}
          </div>

          // <div
          //   className="relative cursor-pointer"
          //   onMouseEnter={() => setIsHovered(true)}
          //   onMouseLeave={() => setIsHovered(false)}
          // >
          //   {record?.FILES?.length && (
          //     <div className="text-black hover:text-blue-500">
          //       <DownloadOutlined />
          //     </div>
          //   )}
          //   <div className="relative">
          //     <div
          //       className="cursor-pointer hover:text-blue-500"
          //       onClick={() => setIsModalOpen(true)}
          //     >
          //       <DownloadOutlined />
          //     </div>
          //     {isModalOpen && (
          //       <div className="absolute z-10 bg-white shadow-lg p-2">
          //         {record?.FILES.map((file, index) => (
          //           <div
          //             key={index}
          //             className="hover:bg-blue-100 p-2 cursor-pointer"
          //             onClick={() => handleFileSelect(file)}
          //           >
          //             {file.name}
          //           </div>
          //         ))}
          //       </div>
          //     )}
          //   </div>
          // </div>
        );
      },
    },
    {
      title: `${t('Status')}`,
      key: 'STATUS',
      width: '10%',
      valueType: 'select',
      filterSearch: true,
      filters: true,
      editable: (text, record, index) => {
        return false;
      },

      valueEnum: {
        issued: { text: 'ISSUED', status: 'Processing' },
        open: { text: 'NEW', status: 'Error' },
        closed: { text: 'CLOSED', status: 'Default' },
        cancelled: { text: 'CANCELLED', status: 'Error' },
        partyCancelled: { text: 'PARTY CANCELLED', status: 'Error' },
        transfer: { text: 'TRANSFER', status: 'Processing' },
        completed: { text: 'COMPLETED', status: 'SUCCESS' },
      },

      dataIndex: 'STATUS',
    },
  ];
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('Status')}`,
      key: 'status',
      width: '11%',
      valueType: 'select',
      filterSearch: true,
      filters: true,
      editable: (text, record, index) => {
        return false;
      },
      onFilter: true,

      valueEnum: {
        issued: { text: t('ISSUED'), status: 'Processing' },
        open: { text: t('NEW'), status: 'Error' },
        closed: { text: t('CLOSED'), status: 'Default' },
        cancelled: { text: t('CANCELLED'), status: 'Error' },
        partyCancelled: { text: t('PARTY_CANCELLED'), status: 'Error' },
        transfer: { text: t('TRANSFER'), status: 'Processing' },
        completed: { text: t('COMPLETED'), status: 'SUCCESS' },
      },

      dataIndex: 'status',
    },

    {
      title: `${t('PN')}`,
      dataIndex: 'PN',
      key: 'PN',
      ellipsis: true,

      // responsive: ['sm'],
    },

    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'description',
      key: 'description',
      // responsive: ['sm'],
      tooltip: 'Text Show',
      ellipsis: true, //
      // width: '20%',
    },

    {
      title: `${t('QUANTITY REQUIRED')}`,
      dataIndex: 'onOrderQuantity',
      key: 'onOrderQuantity',
      editable: (text, record, index) => {
        return false;
      },
    },

    {
      title: `${t('UNIT')}`,
      dataIndex: 'unit',
      key: 'unit',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    // {
    //   title: `${t('OPTION')}`,
    //   dataIndex: 'id',
    //   key: 'id',
    //   responsive: ['sm'],
    //   render: (text: any, record: any) => {
    //     return (
    //       <a>
    //         <SearchOutlined
    //           className="hover:text-blue-500 hover:scale-110  transition duration-200"
    //           onClick={() => {
    //             setOpenStoreFind(true);
    //             setRowData(record);
    //           }}
    //         ></SearchOutlined>
    //         <a
    //           onClick={() => {
    //             setOpenStoreFind(true);
    //             setRowData(record);
    //           }}
    //         >
    //           {' '}
    //           EDIT
    //         </a>
    //       </a>
    //     );
    //   },
    // },
  ];
  const [openStoreFindModal, setOpenStoreFind] = useState(false);
  const [selectedStoreUser, setSelectedStoreUser] =
    useState<UserResponce | null>();
  const [selectedСonsigneeUser, setSelectedСonsigneeUser] =
    useState<UserResponce | null>();
  const [reset, setReset] = useState(false);
  const [form] = Form.useForm();
  return (
    <div className="flex flex-col  h-[73vh]  gap-2 w-[99%]">
      <ModalForm
        // title={`Search on Store`}
        width={'90vw'}
        // placement={'bottom'}
        open={openStoreFindModal}
        // submitter={false}
        onOpenChange={setOpenStoreFind}
        onFinish={async () => {}}
      >
        <ModalSearchContent
          order={order}
          item={rowData}
          scroll={30}
          onRowClick={function (record: any): void {
            throw new Error('Function not implemented.');
          }}
          onSetData={setUpdatedOrderMaterials}
        />
      </ModalForm>
      <TabContent
        tabs={[
          {
            content: (
              <div className=" w-[99%]">
                <EditableTable
                  isNoneRowSelection={true}
                  data={orderMaterials || []}
                  initialColumns={initialColumns}
                  isLoading={false}
                  menuItems={undefined}
                  recordCreatorProps={false}
                  onRowClick={function (record: any, rowIndex?: any): void {}}
                  onSave={function (rowKey: any, data: any, row: any): void {}}
                  yScroll={13}
                  externalReload={function (): Promise<void> {
                    throw new Error('Function not implemented.');
                  }}
                  // onTableDataChange={}
                />
              </div>
            ),
            title: 'REQUIREMENT ITEMS',
          },
          {
            content: (
              <div className=" w-[99%]">
                <EditableTable
                  isNoneRowSelection={true}
                  data={issuedMaterials || null}
                  initialColumns={initialBlockColumns}
                  isLoading={false}
                  menuItems={undefined}
                  recordCreatorProps={false}
                  onRowClick={function (record: any, rowIndex?: any): void {}}
                  onSave={function (rowKey: any, data: any, row: any): void {}}
                  yScroll={10}
                  externalReload={function (): Promise<void> {
                    throw new Error('Function not implemented.');
                  }}
                  // onTableDataChange={}
                />
              </div>
            ),
            title: 'BOOKED ITEMS',
          },
        ]}
      />
      {orderData.status === 'closed' && (
        <div className="flex  justify-between items-center mx-auto content-center  border-1 border-gray-300 p-4 bg-white">
          <ProForm
            disabled={
              orderMaterials.some(
                (item: { status: string }) => item.status === 'open'
              ) ||
              orderData.status === 'closed' ||
              orderData.status === 'canceled'
            }
            form={form}
            autoComplete="off"
            onFinish={async (values: any) => {
              if (!selectedСonsigneeUser?._id || !selectedStoreUser?._id) {
                message.error('form is required!');
                return;
              }
              // console.log(order);
              const currentCompanyID = localStorage.getItem('companyID');
              if (currentCompanyID) {
                const result = await dispatch(
                  createPickSlip({
                    materialAplicationId: order._id || order.id || '',
                    status: 'closed',
                    materials: issuedMaterials,
                    createDate: new Date(),
                    consigneeName: order.createBy,
                    storeMan: selectedStoreUser?.name,
                    storeManID: selectedStoreUser?._id || '',
                    recipient: selectedСonsigneeUser?.name,
                    recipientID: selectedСonsigneeUser?._id,
                    taskNumber: order.taskNumber,
                    registrationNumber: order.registrationNumber,
                    planeType: order.planeType,
                    projectWO: order.projectWO,
                    projectTaskWO: order.projectTaskWO,
                    materialAplicationNumber: order.materialAplicationNumber,
                    additionalTaskID: order.additionalTaskID,
                    store: '10',
                    workshop: '0700',
                    companyID: currentCompanyID,
                  })
                );
                //добавитьUpdateUser
                if (result.meta.requestStatus === 'fulfilled') {
                  issuedMaterials.map((item: any) => {
                    dispatch(
                      updatedMaterialItemsById({
                        companyID: localStorage.getItem('companyID') || '',
                        _id: item._id,
                        issuedQuantity: Number(item.QUANTITY),
                        // BATCH: item.BATCH,
                        // ID: values.ID,
                      })
                    );
                    dispatch(
                      updateRequirementByID({
                        id: item.requirementID?._id,
                        // requestQuantity: -item.QUANTITY,
                        issuedQuantity: item.QUANTITY,
                        updateUserID: USER_ID || '',
                        updateDate: new Date(),
                        companyID: localStorage.getItem('companyID') || '',
                        projectID: result.payload.projectId,
                        status: 'closed',
                      })
                    );
                  });

                  const result1 = await dispatch(
                    updatedMaterialOrdersById({
                      status: 'closed',
                      _id: order._id,
                      closedDate: new Date(),
                      pickSlipNumber: result.payload.pickSlipNumber,
                      pickSlipID: result.payload._id || result.payload.id,
                      updateUserID: USER_ID,
                      updateDate: new Date(),
                    })
                  );

                  if (result1.meta.requestStatus === 'fulfilled') {
                    setOrderData(result1.payload);
                    const currentCompanyID = localStorage.getItem('companyID');
                    if (currentCompanyID) {
                      dispatch(
                        getFilteredMaterialOrders({
                          companyID: currentCompanyID,
                          projectId: '',
                        })
                      );
                    }
                    message.success('SUCCESS');
                  }
                }
              }
            }}
          >
            <div className="flex justify-between content-center h-[25vh] justify-items-center gap-2">
              <div
                style={{
                  border: '0.5px solid #ccc',
                  padding: '10px',
                  marginBottom: '5px',
                  borderRadius: '5px',
                  // flex: 1,
                }}
              >
                <h4 className="">STOREMAN</h4>
                <ProForm.Item style={{ width: '100%' }}>
                  <UserSearchForm
                    performedName={orderData.storeManName || orderData.storeMan}
                    actionNumber={null}
                    performedSing={orderData.storeManSing}
                    onUserSelect={(user) => {
                      setSelectedStoreUser(user);
                    }}
                    reset={reset}
                  />
                </ProForm.Item>
              </div>
              <div
                style={{
                  border: '0.5px solid #ccc',
                  padding: '10px',
                  marginBottom: '5px',
                  borderRadius: '5px',
                  // flex: 1,
                }}
              >
                <h4 className=""> RECEIVER</h4>
                {/* <Form.Item style={{ width: '100%' }}> */}
                <UserSearchForm
                  performedName={orderData.recipientName || orderData.recipient}
                  actionNumber={null}
                  performedSing={orderData.recipientSing}
                  onUserSelect={(user) => {
                    setSelectedСonsigneeUser(user);
                  }}
                  reset={reset}
                />
                {/* </Form.Item> */}
              </div>
              <div
                className="w-2/5"
                style={{
                  border: '0.5px solid #ccc',
                  padding: '10px',
                  marginBottom: '5px',
                  borderRadius: '5px',
                  // flex: ,
                }}
              >
                <h4 className=""> INFORMATION</h4>
                <Form.Item style={{ width: '100%' }}>
                  <div className="w-full  align-middle justify-between flex">
                    PICKSLIP STATUS:
                    <a className="text-lg ">
                      {orderData.status?.toUpperCase()}
                    </a>
                  </div>
                  <div className="w-full align-middle justify-between flex">
                    BOOKED NUMBER:{' '}
                    <a
                      onClick={() => setOpenPickSlip(true)}
                      className="text-lg "
                    >
                      {orderData.pickSlipNumber} <PrinterOutlined />
                    </a>
                  </div>
                  <div className="w-full  align-middle justify-between flex">
                    DATE:
                    <a className="text-lg ">
                      {' '}
                      {orderData.closedDate &&
                        moment(orderData.closedDate).format(
                          'D.MM.YY, HH:mm'
                        )}{' '}
                    </a>
                  </div>
                </Form.Item>
              </div>
            </div>
          </ProForm>
          <Modal
            title="PICKSLIP PRINT"
            open={openPickSlip}
            width={'60%'}
            onCancel={() => setOpenPickSlip(false)}
            footer={null}
          >
            <GeneretedPickSlip currentPickSlipID={orderData.pickSlipID} />
          </Modal>
        </div>
      )}
    </div>
  );
};

export default MarerialOrderContent;
