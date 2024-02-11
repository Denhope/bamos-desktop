import {
  EditOutlined,
  SettingOutlined,
  PlusOutlined,
  MinusOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ProFormDatePicker,
  ProFormGroup,
} from '@ant-design/pro-components';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { Button, Col, Divider, Form, Modal, Row, Space, message } from 'antd';
import TabContent from '@/components/shared/Table/TabContent';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { IOrder, OrderType } from '@/models/IOrder';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { USER_ID } from '@/utils/api/http';
import {
  getFilteredProjects,
  postNewOrder,
  updateOrderByID,
  uploadFileServer,
} from '@/utils/api/thunks';

import QuatationTree from './OrderTree';
import AddDetailForm from './AddDetailForm';
import { v4 as originalUuidv4 } from 'uuid'; // Импортируйте библиотеку uuid

import AddVendorsForm from './AddVendorsForm';
import EditDetailForm from './EditDetailForm';
import VendorDetailForm from './VendorDetailForm';
import FilesSelector from '@/components/shared/FilesSelector';
import FileUploader, { AcceptedFileTypes } from '@/components/shared/Upload';
import { handleFileSelect } from '@/services/utilites';
import GeneretedQuotationOrder from '@/components/pdf/orders/quotation/GeneretedQuotationOrder';

type ProjectDetailsFormType = {
  order: IOrder;
  onEditOrderDetailsEdit: (data: any) => void;
};
interface Option {
  value: string;
  label: string;
}

// const ExcelJS = require("exceljs");

// export const saveExls = async (data: any, fileName: string) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Sheet1");

//   // Add static text
//   // worksheet.addRows([
//   //   [''],
//   //   [''],
//   //   ['Purchase Order №_____ dated ________'],
//   //   [''],
//   //   [''],
//   //   ['Minsk, The Republic of Belarus'],
//   // ]);

//   // Add headers
//   worksheet.columns = [
//     { header: "PART_NUMBER", key: "PART_NUMBER" },
//     { header: "DESCRIPTION", key: "DESCRIPTION" },
//     { header: "UNIT_OF_MEASURE", key: "UNIT_OF_MEASURE" },
//     { header: "QUANTITY", key: "QUANTITY" },
//   ];

//   // // Add data
//   data.parts.forEach(
//     (part: {
//       PART_NUMBER: any;
//       DESCRIPTION: any;
//       UNIT_OF_MEASURE: any;
//       QUANTITY: any;
//     }) => {
//       worksheet.addRow({
//         PART_NUMBER: part.PART_NUMBER,
//         DESCRIPTION: part.DESCRIPTION,
//         UNIT_OF_MEASURE: part.UNIT_OF_MEASURE,
//         QUANTITY: part.QUANTITY,
//       });
//     }
//   );

//   // Set page margins
//   worksheet.pageSetup.margins = {
//     top: 5,
//     bottom: 1,
//     left: 5,
//     right: 1,
//     header: 1,
//     footer: 1,
//   };

//   // Set page orientation
//   worksheet.pageSetup.orientation = "landscape";

//   // Save workbook
//   const buffer = await workbook.xlsx.writeBuffer();
//   const blob = new Blob([buffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = `${fileName}-PART_LIST.xlsx`;
//   link.click();
// };

const OrderDetails: FC<ProjectDetailsFormType> = ({
  onEditOrderDetailsEdit,
  order,
}) => {
  const dispatch = useAppDispatch();
  const [selectedSingleVendor, setSecectedSingleVendor] = useState<any>();
  const [openVendorFindModal, setOpenVendorFind] = useState(false);
  const [options, setOptions] = useState<Option[]>([]); // указываем тип состояния явно
  const [isEditing, setIsEditing] = useState(true);
  const [isEditingView, setIsEditingView] = useState(false);
  const [isCreateView, setIsCreateView] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm();
  const [formAdd] = Form.useForm();
  const { t } = useTranslation();
  const [currentDetail, setCurrentDetail] = useState<any>(null);
  const [currentEditDetail, setCurrenEditDetail] = useState<any>(null);
  const [currentEditVendor, setCurrenEditVendor] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any>([]);
  const [selectedProjectType, setSelectedProjectType] =
    useState<OrderType | null>(null);

  useEffect(() => {
    if (order && isEditingView) {
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  }, [order]);

  useEffect(() => {
    if (isEditingView) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [isEditingView]);
  useEffect(() => {
    if (order) {
      setOrderDetails(order.parts);
      setSelectedProjectType(order.orderType);
      setCurrentDetail(null);
      setCurrenEditDetail(null);
      setCurrenEditVendor(null);
      // onSelectSelectedStore && onSelectSelectedStore(selectedStore);
      form.setFields([
        { name: 'orderNumber', value: order?.orderNumber },
        { name: 'orderType', value: order?.orderType },
        { name: 'orderState', value: order?.state },
        { name: 'orderName', value: order?.orderName },
        { name: 'description', value: order?.description },
        { name: 'projectNumbers', value: order?.projectNumbers },
        { name: 'startDate', value: order?.startDate },
        { name: 'finishDate', value: order?.finishDate },
        { name: 'orderText', value: order?.orderText },
      ]);

      // onFilterTransferprojects(form.getFieldsValue());
    }
  }, [order && order?.orderName, order && order?.parts]);
  useEffect(() => {
    if (isCreating) {
      form.setFields([
        { name: 'createBySingNew', value: localStorage.getItem('singNumber') },
        { name: 'createByNameNew', value: localStorage.getItem('name') },
      ]);
    } else {
      setIsEditing(false);
    }
  }, [isCreating]);

  useEffect(() => {
    const currentCompanyID = localStorage.getItem('companyID');
    if (selectedProjectType) {
      let action;
      let url;
      switch (selectedProjectType) {
        case 'QUOTATION_ORDER':
          action = getFilteredProjects({ companyID: currentCompanyID || '' });
          break;
      }

      if (action) {
        dispatch(action)
          .then((action) => {
            const data: any[] = action.payload; // предполагаем, что payload содержит массив данных
            let options;
            switch (selectedProjectType) {
              case 'QUOTATION_ORDER':
                options = data.map((item: any) => ({
                  value: item.projectWO, // замените на нужное поле для 'PROJECT'
                  label: `${item.projectWO}-${item.projectName}`, // замените на нужное поле для 'PROJECT'
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
  }, [selectedProjectType, dispatch]);
  const [selectedPart, setSelectedPart] = useState<any>();
  const handleSelectedPart = (record: any, rowIndex?: any) => {
    setSelectedPart({ record, index: rowIndex });
  };
  const [completeOpenPrint, setOpenCompletePrint] = useState<any>();
  const tabs = [
    {
      content: (
        <div className="h-[60vh] bg-white px-4 py-3 rounded-md border-gray-400  ">
          <ProForm
            size="small"
            form={form}
            disabled={!isEditing && !isCreating}
            layout="horizontal"
            // labelCol={{ span: 10 }}
            onFinish={async (values) => {
              const currentCompanyID = localStorage.getItem('companyID') || '';
              if (isEditing && !isCreating) {
                const result = await dispatch(
                  updateOrderByID({
                    id: order._id || order.id,
                    companyID: currentCompanyID || '',
                    orderName: values.orderName,
                    planedDate: values.planedDate,
                    updateByID: USER_ID,
                    updateBySing: localStorage.getItem('singNumber'),
                    updateByName: localStorage.getItem('name'),
                    updateDate: new Date(),
                    startDate: values?.startDate,
                    finishDate: values?.finishDate,
                    description: values?.description,
                    orderType: values.orderType,
                    state: values.orderState,
                    projectNumbers: values.projectNumbers,
                    orderText: values?.orderText,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  onEditOrderDetailsEdit(result.payload);
                  message.success(t('SUCCESS'));
                  setIsEditing(false);
                  setIsCreating(false);
                } else message.error(t('ERROR'));
              }

              if (isCreating) {
                const result = await dispatch(
                  postNewOrder({
                    companyID: currentCompanyID,
                    orderName: values.orderName,
                    planedDate: values.planedDate,
                    createByID: USER_ID,
                    createBySing: localStorage.getItem('singNumber'),
                    createByName: localStorage.getItem('name'),
                    createDate: new Date(),
                    startDate: null,
                    finishDate: null,
                    description: values?.description,
                    customer: values?.customer,
                    orderType: values.orderType,
                    orderText: values?.orderText,
                    state: 'DRAFT',
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  onEditOrderDetailsEdit(result.payload);
                  message.success(t('SUCCESS'));
                  setIsEditing(false);
                  setIsCreating(false);
                }
              }
            }}
            submitter={{
              render: (_, dom) =>
                isEditing || isCreating
                  ? [
                      ...dom,
                      <Button
                        key="cancel"
                        onClick={() => {
                          isEditing && setIsEditingView(!isEditingView);
                          isCreating && setIsCreating(false);
                          setSelectedProjectType(
                            form.getFieldValue('orderState')
                          );
                        }}
                      >
                        {t('Cancel')}
                      </Button>,
                    ]
                  : [],
              submitButtonProps: {
                children: 'Search',
              },
            }}
          >
            <ProFormSelect
              disabled={!isCreating}
              rules={[{ required: true }]}
              showSearch
              name="orderType"
              label={t('ORDER TYPE')}
              width="sm"
              tooltip={t('ORDER TYPE')}
              onChange={(value: any) => setSelectedProjectType(value)}
              valueEnum={{
                // SB_ORDER: t('SB ORDER'),
                // CUSTOMER_LOAN_ORDER: t('CUSTOMER LOAN ORDER'),
                // CUSTOMER_PROVISION_ORDER: t('CUSTOMER PROVISION ORDER'),
                // CONTRACT_RE_ORDER: t('CONTRACT RE ORDER'),
                // INCOMING_REQUEST_ORDER: t('INCOMING REQUEST ORDER'),
                // INCOMING_REQUEST_IN_ADVANCE_ORDER: t(
                //   'INCOMING REQUEST IN ADVANCE ORDER'
                // ),
                // LOAN_ORDER: t('LOAN ORDER'),
                // MATERIAL_PRODUCTION_ORDER: t('MATERIAL PRODUCTION ORDER'),
                // OUTGOING_REQUEST_ORDER: t('OUTGOING REQUEST ORDER'),
                // OUTGOING_REQUEST_IN_ADVANCE_ORDER: t(
                //   'OUTGOING REQUEST IN ADVANCE ORDER'
                // ),
                QUOTATION_ORDER: t('QUATATION ORDER'),
                PURCHASE_ORDER: t('PURCHASE ORDER'),
                // POOL_REQUEST_ORDER: t('POOL REQUEST ORDER'),
                // POOL_REQUEST_EXCHANGE_ORDER: t('POOL REQUEST EXCHANGE ORDER'),
                REPAIR_ORDER: t('REPAIR ORDER'),
                CUSTOMER_REPAIR_ORDER: t('CUSTOMER REPAIR ORDER'),
                // CONSIGNMENT_STOCK_INCOMING_ORDER: t(
                //   'CONSIGNMENT STOCK INCOMING ORDER'
                // ),
                // CONSIGNMENT_STOCK_PURCHASE_ORDER: t(
                //   'CONSIGNMENT STOCK PURCHASE ORDER'
                // ),
                WARRANTY_ORDER: t('WARRANTY ORDER'),
                EXCHANGE_ORDER: t('EXCHANGE ORDER'),
                // EXCHANGE_IN_ADVANCE_ORDER: t('EXCHANGE IN ADVANCE ORDER'),
                TRANSFER_ORDER: t('TRANSFER ORDER'),
              }}
            />
            <ProFormGroup>
              <ProFormSelect
                showSearch
                disabled={isCreating || !isEditing}
                rules={[{ required: true }]}
                name="orderState"
                label={t('ORDER STATE')}
                width="sm"
                initialValue={['DRAFT']}
                valueEnum={{
                  PARTLY_RECEIVED: {
                    text: t('PARTLY_RECEIVED'),
                    status: 'Processing',
                  },
                  RECEIVED: {
                    text: t('RECEIVED'),
                    status: 'Success',
                  },
                  // ARRIVED: { text: t('ARRIVED'), status: 'Default' },
                  CLOSED: { text: t('CLOSED'), status: 'Success' },
                  // MISSING: { text: t('MISSING'), status: 'Error' },
                  OPEN: { text: t('OPEN'), status: 'Processing' },
                  // OPEN_AND_TRANSFER: {
                  //   text: t('OPEN AND TRANSFER'),
                  //   status: 'Processing',
                  // },
                  // PARTLY_ARRIVED: { text: t('PARTLY ARRIVED'), status: 'Processing' },
                  // PARTLY_MISSING: { text: t('PARTLY MISSING'), status: 'Error' },
                  // PARTLY_SENT: { text: t('PARTLY SENT'), status: 'Processing' },
                  // READY: { text: t('READY'), status: 'Success' },
                  // PARTLY_READY: { text: t('PARTLY READY'), status: 'Processing' },
                  // SENT: { text: t('SENT'), status: 'Processing' },
                  TRANSFER: { text: t('TRANSFER'), status: 'Processing' },
                  // UNKNOWN: { text: t('UNKNOWN'), status: 'Error' },
                  DRAFT: { text: t('DRAFT'), status: 'Error' },
                }}
              />
            </ProFormGroup>

            {(order?.orderType === 'QUOTATION_ORDER' ||
              selectedProjectType === 'QUOTATION_ORDER') && (
              <>
                <ProFormGroup>
                  <ProFormGroup direction="vertical">
                    <ProFormText
                      rules={[{ required: true }]}
                      name="orderName"
                      label={t('ORDER SHOT NAME')}
                      width="sm"
                    ></ProFormText>{' '}
                    <ProFormSelect
                      fieldProps={{
                        style: { resize: 'none', height: '3.5em' },
                      }}
                      rules={[{ required: true }]}
                      name="orderText"
                      label={t('ORDER TEXT')}
                      width="lg"
                      valueEnum={{
                        'Hello team! Please provide a quota for the position:':
                          t(
                            'Hello team! Please provide a quota for the position:'
                          ),
                        'Здравствуйте! Просим предоставить коммерческое предложение на:':
                          t(
                            'Здравствуйте! Просим предоставить коммерческое предложение на:'
                          ),
                      }}
                    ></ProFormSelect>
                    <ProFormSelect
                      mode="multiple"
                      rules={[{ required: true }]}
                      name="projectNumbers"
                      label={`${t(`PROJECT LINK`)}`}
                      width="sm"
                      options={options}
                    />
                  </ProFormGroup>
                  <FileExcelOutlined
                    onClick={() => {
                      // saveExls(order, `QUATATION ORDER-${order?.orderNumber}`);
                    }}
                    className="text-3xl cursor-pointer hover:text-blue-500"
                  />
                  <Modal
                    title="QUATATION ORDER"
                    open={completeOpenPrint}
                    width={'60%'}
                    onCancel={() => setOpenCompletePrint(false)}
                    footer={null}
                  >
                    {order && <GeneretedQuotationOrder order={order} />}
                  </Modal>
                  <FilePdfOutlined
                    onClick={() => {
                      setOpenCompletePrint(true);
                    }}
                    className="text-3xl cursor-pointer hover:text-blue-500"
                  />
                </ProFormGroup>
                <ProFormText
                  fieldProps={{ style: { resize: 'none' } }}
                  rules={[{ required: true }]}
                  name="description"
                  label={t('DESCRIPTION')}
                  width="lg"
                ></ProFormText>
                <ProFormGroup>
                  <ProFormDatePicker
                    label={t('ORDER START DATE')}
                    name="startDate"
                    width="sm"
                  ></ProFormDatePicker>
                  <ProFormDatePicker
                    label={t('ORDER FINISH DATE')}
                    name="finishDate"
                    width="sm"
                  ></ProFormDatePicker>
                </ProFormGroup>
                <Space size={'large'} className=" flex justify-between py-5 ">
                  <FileUploader
                    onUpload={uploadFileServer}
                    acceptedFileTypes={[
                      AcceptedFileTypes.JPG,
                      AcceptedFileTypes.PDF,
                    ]}
                    onSuccess={async function (response: any): Promise<void> {
                      if (response) {
                        const updatedFiles = order?.files
                          ? [...order?.files, response]
                          : [response];
                        const currentCompanyID =
                          localStorage.getItem('companyID') || '';

                        const result = await dispatch(
                          updateOrderByID({
                            id: (order && order._id) || (order && order.id),
                            companyID: currentCompanyID || '',
                            updateByID: USER_ID,
                            updateBySing: localStorage.getItem('singNumber'),
                            updateByName: localStorage.getItem('name'),
                            updateDate: new Date(),
                            files: updatedFiles,
                          })
                        );
                        if (result.meta.requestStatus === 'fulfilled') {
                          onEditOrderDetailsEdit &&
                            onEditOrderDetailsEdit(result.payload);
                          message.success(t('SUCCESS'));
                        } else message.error(t('ERROR'));
                      }
                    }}
                  />

                  {order?.files && order?.files.length > 0 && (
                    <FilesSelector
                      isWide
                      files={order.files || []}
                      onFileSelect={handleFileSelect}
                    />
                  )}
                </Space>
                {isCreating && (
                  <ProFormGroup>
                    <ProFormText
                      disabled
                      name="createBySingNew"
                      label={t('CREATE BY')}
                      width="sm"
                    ></ProFormText>{' '}
                    <ProFormText
                      disabled
                      name="createByNameNew"
                      width="sm"
                    ></ProFormText>
                  </ProFormGroup>
                )}
              </>
            )}
          </ProForm>
        </div>
      ),
      title: `${t(`${(order && order?.orderType) || t('NEW ORDER')}`)}`,
    },
    currentDetail &&
      currentDetail.index && {
        content: (
          <div className="h-[60vh]  bg-white px-4 py-3 rounded-md border-gray-400  ">
            <AddDetailForm
              currenOrder={order}
              currentDetail={currentDetail}
              isEditing={isEditing}
              isCreating={isCreating}
              onUpdateOrder={onEditOrderDetailsEdit}
              onSave={function (data: any): void {
                setCurrentDetail(null);
                setOrderDetails(data.parts);
              }}
              onCancel={function (data: any): void {
                setCurrentDetail(null);
              }}
            />
          </div>
        ),
        title: `${t('POS.')} ${currentDetail && currentDetail?.index}`,
      },
    currentEditDetail &&
      currentEditDetail && {
        content: (
          <div className="h-[60vh]  bg-white px-4 py-3 rounded-md border-gray-400  ">
            <EditDetailForm
              currenOrder={order}
              currentDetail={currentEditDetail}
              isEditing={isEditing}
              isCreating={isCreating}
              onUpdateOrder={onEditOrderDetailsEdit}
              onSave={function (data: any): void {
                setCurrenEditDetail(null);
              }}
              onCancel={function (data: any): void {
                setCurrenEditDetail(null);
              }}
            />
          </div>
        ),
        title: `${t('POS')}:${currentEditDetail.index + 1}- ${
          currentEditDetail && currentEditDetail?.PART_NUMBER
        }`,
      },
    currentEditVendor &&
      currentEditVendor && {
        content: (
          <div className="h-[60vh]  bg-white px-4 py-3 rounded-md border-gray-400  ">
            <VendorDetailForm
              currenOrder={order}
              currentVendor={currentEditVendor}
              isEditing={isEditing}
              isCreating={isCreating}
              onUpdateOrder={onEditOrderDetailsEdit}
              onEdit={function (value?: boolean | undefined): void {
                setIsEditing(value || false);
              }}
            />
          </div>
        ),
        title: `POS:${currentEditVendor && currentEditVendor?.index + 1} ${t(
          'VENDOR'
        )}:${currentEditVendor && currentEditVendor?.CODE}`,
      },
  ];
  const uuidv4: () => string = originalUuidv4;
  return (
    <Row gutter={{ xs: 8, sm: 11, md: 24, lg: 32 }} className="gap-4">
      <Col
        xs={2}
        sm={3}
        className="h-[64vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 "
      >
        <Space direction="vertical">
          <Space
            className={`cursor-pointer transform transition px-3 ${
              isEditing || isCreating
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:text-blue-500'
            }`}
            onClick={() => {
              if (!isEditing) {
                setIsEditingView(!isEditingView);
                form.resetFields();
                formAdd.resetFields();
                setIsCreating(true);
                setIsEditing(false);
                onEditOrderDetailsEdit(null);
                setCurrenEditDetail(null);
                setCurrenEditVendor(null);
              }
            }}
          >
            <SettingOutlined />
            <div>{t('NEW ORDER')}</div>
          </Space>
          <Space
            onClick={() => order && setIsEditingView(!isEditingView)}
            className={`transform transition px-3 ${
              isEditing || isCreating
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:text-blue-500 cursor-pointer '
            }`}
          >
            <EditOutlined
              className={`${
                isEditing || !isCreating
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer '
              }`}
            />
            <>{t('EDIT')}</>
          </Space>{' '}
          {(order?.orderType === 'QUOTATION_ORDER' ||
            selectedProjectType === 'QUOTATION_ORDER') && (
            <>
              <Space
                onClick={() =>
                  order &&
                  isEditing &&
                  setCurrentDetail({
                    index: orderDetails.length + 1,
                    key: uuidv4(),
                  })
                }
                className={`cursor-pointer transform transition px-3 ${
                  !order || !isEditing || isCreating
                    ? 'opacity-50 cursor-not-allowed'
                    : ` ${currentDetail ? 'hover:text-blue-500' : ''} `
                }`}
              >
                <PlusOutlined
                  className={`${
                    !isEditing || isCreating
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                />
                <>{t('ADD DETAIL')}</>
              </Space>
              <Space
                onClick={async () => {
                  if (order && isEditing && currentEditDetail && order.parts) {
                    Modal.confirm({
                      title: t('CONFIRM DELETE'),
                      content: t(
                        'ARE YOU SURE YOU WANT TO DELETE THIS_POSITION'
                      ),
                      okText: t('YES'),
                      cancelText: t('NO'),
                      onOk: async () => {
                        const currentCompanyID =
                          localStorage.getItem('companyID') || '';

                        const updatedParts =
                          order.parts &&
                          order.parts.filter(
                            (part) => part.id !== currentEditDetail.id
                          );

                        const result = await dispatch(
                          updateOrderByID({
                            id: order._id || order.id,
                            companyID: currentCompanyID || '',
                            updateByID: USER_ID,
                            updateBySing: localStorage.getItem('singNumber'),
                            updateByName: localStorage.getItem('name'),
                            updateDate: new Date(),
                            parts: updatedParts,
                          })
                        );

                        if (result.meta.requestStatus === 'fulfilled') {
                          onEditOrderDetailsEdit &&
                            onEditOrderDetailsEdit(result.payload);
                          message.success(t('SUCCESS'));
                        } else {
                          message.error(t('ERROR'));
                        }
                      },
                    });
                  }
                }}
                className={` ${
                  order && isEditing && currentEditDetail && !isCreating
                    ? 'hover:text-blue-500 cursor-pointer  px-3'
                    : 'opacity-50 cursor-not-allowed  px-3'
                }`}
              >
                <MinusOutlined />
                <>{t('DELETE DETAIL')}</>
              </Space>
              <Space
                onClick={() => order && isEditing && setOpenVendorFind(true)}
                className={`cursor-pointer transform transition px-3 ${
                  !order || !isEditing || isCreating
                    ? 'opacity-50 cursor-not-allowed  px-3'
                    : 'hover:text-blue-500  px-3'
                }`}
              >
                <PlusOutlined
                  className={`${
                    !isEditing || isCreating
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                />
                <>{t('ADD VENDORS')}</>
              </Space>
              <Space
                onClick={async () => {
                  if (order && isEditing && currentEditVendor && order.parts) {
                    // Show confirmation dialog
                    Modal.confirm({
                      title: t('CONFIRM DELETE'),
                      content: t('ARE YOU SURE YOU WANT TO DELETE THIS VENDOR'),
                      okText: t('YES'),
                      cancelText: t('NO'),
                      onOk: async () => {
                        const currentCompanyID =
                          localStorage.getItem('companyID') || '';

                        const updatedParts =
                          order.parts &&
                          order.parts.map((part) => {
                            if (part.vendors) {
                              const updatedVendors = part.vendors.filter(
                                (vendor: { id: any }) =>
                                  vendor.id !== currentEditVendor.id
                              );

                              return { ...part, vendors: updatedVendors };
                            }

                            return part;
                          });
                        const result = await dispatch(
                          updateOrderByID({
                            id: order._id || order.id,
                            companyID: currentCompanyID || '',
                            updateByID: USER_ID,
                            updateBySing: localStorage.getItem('singNumber'),
                            updateByName: localStorage.getItem('name'),
                            updateDate: new Date(),
                            parts: updatedParts,
                          })
                        );

                        if (result.meta.requestStatus === 'fulfilled') {
                          onEditOrderDetailsEdit &&
                            onEditOrderDetailsEdit(result.payload);
                          message.success(t('SUCCESS'));
                        } else {
                          message.error(t('ERROR'));
                        }
                      },
                    });
                  }
                }}
                className={` ${
                  order && isEditing && currentEditVendor && !isCreating
                    ? 'hover:text-blue-500 cursor-pointer  px-3'
                    : 'opacity-50 cursor-not-allowed  px-3'
                }`}
              >
                <MinusOutlined
                // className={`${
                //   !isEditing || isCreating
                //     ? 'cursor-not-allowed'
                //     : 'cursor-pointer'
                // }`}
                />
                <>{t('DELETE VENDOR')}</>
              </Space>
            </>
          )}
        </Space>
      </Col>
      <Col
        className="h-[64vh]  bg-white px-4 py-3 rounded-md border-gray-400  "
        sm={7}
      >
        {order && (
          <QuatationTree
            order={order}
            onSelectedPart={(id: any): void => {
              const part = order.parts?.find((part) => part.id === id);
              const index = order.parts?.findIndex((part) => part.id === id);
              if (part && index !== -1) {
                setCurrenEditDetail({ ...part, index: index });
              }
            }}
            onSelectedPartVendor={(id: any): void => {
              let vendorWithIndex;
              order.parts?.forEach((part, index) => {
                const vendor = part.vendors?.find(
                  (vendor: { id: any }) => vendor.id === id
                );
                if (vendor) {
                  vendorWithIndex = { ...vendor, index };
                  setCurrenEditVendor(vendorWithIndex);
                  return;
                }
              });
            }}
          ></QuatationTree>
        )}
      </Col>
      <Col
        className="h-[75vh] bg-white px-4 py-3 rounded-md brequierement-gray-400 p-3 "
        xs={2}
        sm={13}
      >
        <TabContent tabs={tabs}></TabContent>
      </Col>
      <ModalForm
        // title={`Search on Store`}
        width={'70vw'}
        // placement={'bottom'}
        open={openVendorFindModal}
        submitter={false}
        onOpenChange={setOpenVendorFind}
        onFinish={async function (record: any, rowIndex?: any): Promise<void> {
          setOpenVendorFind(false);
          setSecectedSingleVendor(record);

          form.setFields([
            { name: 'vendorName', value: selectedSingleVendor.CODE },
          ]);
        }}
      >
        <AddVendorsForm
          currenOrder={order}
          scroll={40}
          onOrderEdit={function (order?: any): void {
            onEditOrderDetailsEdit(order);
          }}
        ></AddVendorsForm>
      </ModalForm>
    </Row>
  );
};

export default OrderDetails;
