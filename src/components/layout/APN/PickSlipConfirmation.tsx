import { FormInstance, ProColumns, ProForm } from '@ant-design/pro-components';
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  TimePicker,
  message,
} from 'antd';
import { v4 as originalUuidv4 } from 'uuid';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PrinterOutlined, SaveOutlined } from '@ant-design/icons';
import {
  createBookingItem,
  createPickSlip,
  getFilteredMaterialOrders,
  updateRequirementByID,
  updatedMaterialItemsById,
  updatedMaterialOrdersById,
} from '@/utils/api/thunks';
import PickForm from '../store/pickSlipConfarmation/PickForm';

import EditableSearchTable from '@/components/shared/Table/EditableSearchTable';

import EditableTableForStore from '@/components/shared/Table/EditableTableForStore';
import { setUpdatedMaterialOrder } from '@/store/reducers/StoreLogisticSlice';
import GeneretedPickSlip from '@/components/pdf/GeneretedPickSlip';
import UserSearchForm from '@/components/shared/form/UserSearchProForm';
import { UserResponce } from '@/models/IUser';
import GeneretedCompleteSlipPdf from '@/components/pdf/GeneretedCompleteSlip';
import GeneretedCompleteLabels from '@/components/pdf/GeneretedCompleteLabels';
import GeneretedWorkLabels from '@/components/pdf/GeneretedWorkLabels';

import { handleFileOpen, handleFileSelect } from '@/services/utilites';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import FileModalList from '@/components/shared/FileModalList';
import { useUpdateRequirementMutation } from '@/features/requirementAdministration/requirementApi';

const PickSlipConfirmation: FC = () => {
  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      formRef.current?.submit(); // вызываем метод submit формы при нажатии Enter
    }
  };
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [currentPick, setCurrenPick] = useState<any>();
  const [labelsOpenPrint, setOpenLabelsPrint] = useState<any>();
  const [labelsOpenWorkPrint, setOpenLabelsWorkPrint] = useState<any>();
  const [completeOpenPrint, setOpenCompletePrint] = useState<any>();
  const [completeWorkPrint, setOpenCompleteWorkPrint] = useState<any>();
  const [updatetOrderMaterials, setUpdatedOrderMaterials] = useState<any[]>([]);
  const [rowData, setRowData] = useState(false);
  const { filteredMaterialOrders } = useTypedSelector(
    (state) => state.storesLogistic
  );
  const [quons, setQyon] = useState<any>(0);
  const initialColumns: ProColumns<any>[] = [
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
      title: `${t('STORE')}`,
      dataIndex: 'STOCK',
      key: 'STOCK',
      // responsive: ['sm'],
      tooltip: 'Text Show',
      ellipsis: true, //
      // width: '20%',
    },
    {
      title: 'LOCATION',
      dataIndex: 'SHELF_NUMBER',
      key: 'SHELF_NUMBER',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('BATCH/SERIAL')}`,
      dataIndex: 'SERIAL_NUMBER',
      width: '9%',
      key: 'SERIAL_NUMBER',
      render: (text: any, record: any) =>
        record?.SERIAL_NUMBER || record?.SUPPLIER_BATCH_NUMBER,
      // остальные свойства...
    },

    {
      title: `${t('EXPIRES')}`,
      dataIndex: 'PRODUCT_EXPIRATION_DATE',
      key: 'PRODUCT_EXPIRATION_DATE',
      //tooltip: 'ITEM EXPIRY DATE',
      ellipsis: true,
      width: '8%',
      search: false,
      valueType: 'date',
      formItemProps: {
        name: 'PRODUCT_EXPIRATION_DATE',
      },
      sorter: (a, b) => {
        if (a.PRODUCT_EXPIRATION_DATE && b.PRODUCT_EXPIRATION_DATE) {
          const aFinishDate = new Date(a.PRODUCT_EXPIRATION_DATE);
          const bFinishDate = new Date(b.PRODUCT_EXPIRATION_DATE);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      renderFormItem: () => {
        return <TimePicker />;
      },

      // responsive: ['sm'],
    },
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
      title: `${t('QTY')}`,
      dataIndex: 'QUANTITY',
      key: 'QUANTITY',
      width: '5%',
      responsive: ['sm'],
      search: false,
      render: (text, record) => {
        let backgroundColor;
        if (
          record?.PRODUCT_EXPIRATION_DATE &&
          new Date(record.PRODUCT_EXPIRATION_DATE) >= new Date()
        ) {
          backgroundColor = '#32CD32'; // Красный фон, если PRODUCT_EXPIRATION_DATE меньше текущей даты
        } // Зеленый фон по умолчанию
        if (record?.SHELF_NUMBER === 'TRANSFER') {
          backgroundColor = '#FFDB58'; // Желтый фон для SHELF_NUMBER 'TRANSFER'
        }
        if (
          record?.PRODUCT_EXPIRATION_DATE &&
          new Date(record.PRODUCT_EXPIRATION_DATE) < new Date()
        ) {
          backgroundColor = '#FF0000'; // Красный фон, если PRODUCT_EXPIRATION_DATE меньше текущей даты
        }
        return <div style={{ backgroundColor }}>{text}</div>;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'NAME_OF_MATERIAL',
      key: 'NAME_OF_MATERIAL',
      // responsive: ['sm'],
      tooltip: 'Text Show',
      ellipsis: true, //
      width: '20%',
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
      title: `${t('OWNER')}`,
      dataIndex: 'OWNER',
      key: 'OWNER',
      responsive: ['sm'],
      search: false,
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('DOC')}`,
      dataIndex: 'DOC',
      key: 'DOC',
      width: '7%',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      render: (text, record, index) => {
        return record?.FILES && record?.FILES.length > 0 ? (
          <FileModalList
            files={record?.FILES}
            onFileSelect={function (file: any): void {
              handleFileSelect({
                id: file?.id,
                name: file?.name,
              });
            }}
            onFileOpen={function (file: any): void {
              handleFileOpen(file);
            }}
          />
        ) : (
          <></>
        );
      },
    },
  ];
  const initialReleseColumns: ProColumns<any>[] = [
    {
      title: `${t('PN')}`,
      dataIndex: 'PN',
      key: 'PN',
      ellipsis: true,
      formItemProps: {
        name: 'PART_NUMBER',
      },
      editable: (text, record, index) => {
        return false;
      },
      width: '12%',

      // responsive: ['sm'],
    },

    {
      title: `${t('LOCATION FROM')}`,
      dataIndex: 'SHELF_NUMBER',
      key: 'SHELF_NUMBER',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      formItemProps: {
        name: 'SHELF_NUMBER',
      },
      width: '8%',
      render: (text: any, record: any) => {
        return (
          <div>{record.foRealese ? record.foRealese.SHELF_NUMBER : text}</div>
        );
      },
    },

    {
      title: `${t('BATCH/SERIAL')}`,
      dataIndex: 'SERIAL_NUMBER',
      width: '9%',
      editable: (text, record, index) => {
        return false;
      },
      key: 'SERIAL_NUMBER',
      render: (text: any, record: any) =>
        record?.foRealese?.SERIAL_NUMBER ||
        record?.foRealese?.SUPPLIER_BATCH_NUMBER,
      // остальные свойства...
    },

    {
      title: `${t('EXPIRES')}`,
      dataIndex: 'PRODUCT_EXPIRATION_DATE',
      key: 'PRODUCT_EXPIRATION_DATE',
      //tooltip: 'ITEM EXPIRY DATE',
      ellipsis: true,
      width: '6%',
      valueType: 'date',
      formItemProps: {
        name: 'PRODUCT_EXPIRATION_DATE',
      },
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <div>
            {record.foRealese ? record.foRealese.PRODUCT_EXPIRATION_DATE : text}
          </div>
        );
      },

      renderFormItem: () => {
        return <TimePicker />;
      },

      // responsive: ['sm'],
    },
    {
      title: `${t('LABEL')}`,
      dataIndex: 'LOCAL_ID',
      key: 'LOCAL_ID',
      // responsive: ['sm'],
      tooltip: 'Text Show',
      ellipsis: true, //
      render: (text: any, record: any) => {
        return <a>{record.foRealese ? record.foRealese.LOCAL_ID : text}</a>;
      },
      editable: (text, record, index) => {
        return false;
      },
      // width: '20%',
    },
    {
      title: `${t('QTY REQ')}`,
      dataIndex: 'onOrderQuantity',
      key: 'onOrderQuantity',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('QTY AVAL')}`,
      dataIndex: 'QTYAVAL',
      key: 'QTYAVAL',
      responsive: ['sm'],
      search: false,
      render: (text: any, record: any) => {
        return (
          <div>
            {record.foRealese
              ? record.foRealese?.QUANTITY -
                (record.foRealese?.ONBLOCK_QUANTITY || 0)
              : text}
          </div>
        );
      },
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('QTY CANC')}`,
      dataIndex: 'QUANTITY_CANCELED',
      key: 'QUANTITY_CANCELED',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('QTY BOOK')}`,
      dataIndex: 'QUANTITY_BOOK',
      key: 'QUANTITY_BOOK',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return true;
      },
      // renderFormItem: (item, { type, isEditable }, formItemProps) => {
      //   return (
      //     <CustomInput
      //       props={undefined}
      //       {...formItemProps}
      //       record={item}
      //       updateOrderMaterials={updatetOrderMaterials}
      //       selectedPartId={selectedPart.id}
      //     />
      //   );
      // },
    },

    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'description',
      key: 'description',
      // responsive: ['sm'],
      tooltip: 'Text Show',
      ellipsis: true, //
      width: '13%',
      editable: (text, record, index) => {
        return false;
      },
    },

    {
      title: `${t('UNIT')}`,
      dataIndex: 'unit',
      key: 'unit',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t('OWNER')}`,
      dataIndex: 'OWNER',
      key: 'OWNER',
      responsive: ['sm'],
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return <div>{record.foRealese ? record.foRealese.OWNER : text}</div>;
      },
    },
    {
      title: `${t('OPTION')}`,
      valueType: 'option',
      key: 'option',
      // width: '9%',
      render: (text, record, _, action) => [
        currentPick?.status === 'issued' && (
          <a
            key="editable"
            onClick={() => {
              action?.startEditable?.(record.id);
            }}
          >
            Edit
          </a>
        ),
      ],
    },
    {
      title: `${t('DOC')}`,
      dataIndex: 'DOC',
      key: 'DOC',
      width: '7%',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      render: (text, record, index) => {
        return record.foRealese?.FILES && record.foRealese?.FILES.length > 0 ? (
          <FileModalList
            files={record.foRealese?.FILES}
            onFileSelect={function (file: any): void {
              handleFileSelect({
                id: file?.id,
                name: file?.name,
              });
            }}
            onFileOpen={function (file: any): void {
              handleFileOpen(file);
            }}
          />
        ) : (
          <></>
        );
      },
    },
  ];
  const [openPickSlip, setOpenPickSlip] = useState(false);
  const [openRelese, setOpenRelese] = useState(false);
  const [issuedMaterials, setIssuedMaterials] = useState([]);
  useEffect(() => {
    setUpdatedOrderMaterials(currentPick?.materials);
    setSelectedPart(currentPick?.materials[0].PN);
  }, [currentPick]);
  useEffect(() => {
    updatetOrderMaterials &&
      updatetOrderMaterials.length &&
      setIssuedMaterials(
        updatetOrderMaterials?.reduce((acc: any, item: any) => {
          if (
            item?.onBlock?.QUANTITY !== null &&
            item?.onBlock?.QUANTITY !== 0
          ) {
            return acc.concat(item?.onBlock);
          } else {
            return acc;
          }
        }, [])
      );
  }, [currentPick, updatetOrderMaterials]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [currentStoreItem, setCurrentStoreItem] = useState<any>(null);

  const CustomInput = ({
    record,
    updateOrderMaterials,
    selectedPartId,
    ...props
  }: {
    record: any;
    updateOrderMaterials: any;
    selectedPartId: any;
    props: any;
  }) => {
    const selectedMaterial = updateOrderMaterials.find(
      (material: any) => material.id === selectedPartId
    );
    const maxQuantity =
      selectedMaterial?.foRealese?.QUANTITY -
      (selectedMaterial?.foRealese?.ONBLOCK_QUANTITY || 0);
    const [value, setValue] = useState(record.QUANTITY_BOOK || '');

    const handleChange = (e: any) => {
      if (e.target.value <= maxQuantity) {
        setValue(e.target.value);
        // setUpdatedOrderMaterials((updateOrderMaterials) => {
        //   return updateOrderMaterials.map((material: any) => {
        //     if (material.id === selectedPartId) {
        //       return { ...material, QUANTITY_BOOK: e.target.value };
        //     } else {
        //       return material;
        //     }
        //   });
        // });
      }
    };

    return <Input {...props} value={value} onChange={handleChange} />;
  };
  const [selectedStoreUser, setSelectedStoreUser] =
    useState<UserResponce | null>();
  const uuidv4: () => string = originalUuidv4;
  const [selectedСonsigneeUser, setSelectedСonsigneeUser] =
    useState<UserResponce | null>();
  // const [orderMaterials, setOrderMaterials] = useState(pi.materials || []);

  //   updatetOrderMaterials?.reduce((acc: any, item: any) => {
  //     return acc.concat(item?.onBlock);
  //   }, []) || []
  // );
  const [updateRequirement] = useUpdateRequirementMutation();
  const [updateValue, setUpdateValue] = useState<any>();
  const [intermediateData, setIntermediateData] = useState<any | null>(null);
  const handleButtonClick = () => {
    if (selectedPart) {
      setUpdatedOrderMaterials((prevState) => [
        ...prevState,
        {
          ...selectedPart,
          id: uuidv4(), // Установите id на новый UUID
          isCopy: true,
        },
      ]);
    }
  };
  return (
    <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-2">
      <div className="h-[60%]">
        <Row gutter={{ xs: 8, sm: 11, md: 18 }}>
          <Col xs={2} sm={6}>
            <PickForm
              updateValue={updateValue}
              onFilterPickSlip={setCurrenPick}
            ></PickForm>
          </Col>
          <Col xs={32} sm={18}>
            <EditableSearchTable
              showDefaultToolbarContent={false}
              initialParams={
                currentPick && {
                  STOCK: currentPick?.getFrom,
                  PART_NUMBER: selectedPart?.PN
                    ? selectedPart?.PN
                    : currentPick?.materials[0].PN,
                }
              }
              data={[]}
              initialColumns={initialColumns}
              isLoading={false}
              menuItems={undefined}
              recordCreatorProps={false}
              onSelectedRowKeysChange={handleSelectedRowKeysChange}
              onRowClick={function (record: any): void {
                if (currentPick?.status === 'issued') {
                  setCurrentStoreItem(record);
                  setUpdatedOrderMaterials((prevState) =>
                    prevState.map((item) =>
                      item.id === selectedPart.id
                        ? {
                            ...item,
                            QUANTITY_BOOK:
                              record?.QUANTITY -
                                (record?.ONBLOCK_QUANTITY || 0) >=
                              item.onOrderQuantity
                                ? item.onOrderQuantity
                                : record?.QUANTITY -
                                  (record?.ONBLOCK_QUANTITY || 0),
                            foRealese: record,
                          }
                        : { ...item }
                    )
                  );
                }
              }}
              onSave={function (rowKey: any, data: any, row: any): void {
                console.log(rowKey);
              }}
              yScroll={16}
              setQyon={setQyon} // externalReload={function (): Promise<void> {
              //   throw new Error('Function not implemented.');
              // }}
            />
            <Space className="mx-auto py-2" align="center">
              {/* <Button size="small">{t('TAKE')} </Button> */}
              <Button
                disabled={
                  currentPick?.status === 'completed' ||
                  currentPick?.status === 'closed' ||
                  currentPick?.status === 'new' ||
                  currentPick?.status === 'cancelled' ||
                  currentPick?.status === 'partyCancelled' ||
                  quons == 0
                }
                onClick={handleButtonClick}
                size="small"
              >
                {t('COPY TABLE DATA and TAKE')}{' '}
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* <div className="  flex flex-col  gap-1"> */}
      <EditableTableForStore
        status={currentPick?.status}
        data={updatetOrderMaterials || []}
        initialColumns={initialReleseColumns}
        isLoading={false}
        menuItems={undefined}
        recordCreatorProps={false}
        onRowClick={function (record: any, rowIndex?: any): void {
          // if (currentPick?.status === 'issued') {
          setSelectedPart(record);
          // setCurrentStoreItem(null);
          // }
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          if (
            data?.foRealese?.LOCAL_ID &&
            data?.QUANTITY_BOOK >
              data?.foRealese?.QUANTITY -
                (data?.foRealese?.ONBLOCK_QUANTITY || 0)
          ) {
            message.error(
              'Value should not be more than  variety of available materials'
            );
            data.QUANTITY_BOOK =
              data?.foRealese?.QUANTITY -
              (data?.foRealese?.ONBLOCK_QUANTITY || 0);
            // console.log(updatetOrderMaterials);
            setUpdatedOrderMaterials((prevState) =>
              prevState.map((item) =>
                item.id === selectedPart.id
                  ? {
                      ...item,
                      QUANTITY_BOOK:
                        data.foRealese?.QUANTITY -
                        (data.foRealese?.ONBLOCK_QUANTITY || 0),
                    }
                  : item
              )
            );
          } else if (
            data?.foRealese?.LOCAL_ID &&
            data?.QUANTITY_BOOK <=
              data?.foRealese?.QUANTITY -
                (data.foRealese?.ONBLOCK_QUANTITY || 0)
          ) {
            setUpdatedOrderMaterials((prevState) =>
              prevState.map((item) =>
                item.id === selectedPart.id
                  ? {
                      ...item,
                      QUANTITY_BOOK: data.QUANTITY_BOOK,
                    }
                  : item
              )
            );
          } else {
            setUpdatedOrderMaterials((prevState) =>
              prevState.map((item) =>
                item.id === selectedPart.id
                  ? {
                      ...item,
                      QUANTITY_BOOK: 0,
                    }
                  : item
              )
            );
          }
        }}
        yScroll={12}
        externalReload={function (): Promise<void> {
          throw new Error('Function not implemented.');
        }}
        // onTableDataChange={}
      />
      <div className="flex justify-between">
        <Space align="center">
          <Button
            icon={<PrinterOutlined />}
            disabled={!currentPick}
            onClick={() => {
              if (currentPick?.status === 'issued') {
                // console.log(updatetOrderMaterials);
                const newData = {
                  ...currentPick,
                  materials: updatetOrderMaterials,
                };

                setIntermediateData(newData);
                setOpenCompleteWorkPrint(true);
              } else if (currentPick?.status === 'completed') {
                setOpenCompletePrint(true);
              } else {
                setOpenPickSlip(true);
              }
            }}
            size="small"
          >
            {' '}
            {t('PRINT')}
          </Button>
          <Button
            disabled={
              currentPick?.status === 'completed' ||
              currentPick?.status === 'closed' ||
              currentPick?.status === 'open' ||
              currentPick?.status === 'new' ||
              currentPick?.status === 'cancelled' ||
              currentPick?.status === 'partyCancelled' ||
              !currentPick ||
              (updatetOrderMaterials && !updatetOrderMaterials.length)
            }
            onClick={async () => {
              Modal.confirm({
                title: t('CONFIRM COMPLETE'),
                onOk: async () => {
                  const newData = updatetOrderMaterials?.map((item) => {
                    return {
                      ...item,
                      QUANTITY: item.QUANTITY_BOOK,
                      onBlockQuantity: Number(item.QUANTITY_BOOK),
                      // requirementID: {...item.requirementI?,status:"completed"},
                      unit: item.unit,
                      required: item.required,
                      description: item.description,
                      onBlock: item.foRealese
                        ? [
                            Object.assign({}, item.foRealese, {
                              QUANTITY: Number(item.QUANTITY_BOOK),
                              LOCATION_TO: currentPick?.neededOn,
                              STATUS: 'completed',
                            }),
                          ]
                        : [],
                      // id: uuidv4(), // уникальный ключ для каждой вкладки,
                      status: 'completed',
                    };
                  });
                  if (newData !== null && newData.length > 0) {
                    newData?.map((item) => {
                      if (item?.onBlock !== null && item?.onBlock.length > 0) {
                        dispatch(
                          updatedMaterialItemsById({
                            companyID: localStorage.getItem('companyID') || '',
                            _id: item?.onBlock[0]?._id,
                            ONBLOCK_QUANTITY: item?.QUANTITY_BOOK,
                          })
                        );
                      }
                    });
                    const result = await dispatch(
                      updatedMaterialOrdersById({
                        ...currentPick,
                        materials: newData,
                        status: 'completed',
                        updateUserID: USER_ID,
                        updateDate: new Date(),
                      })
                    );
                    if (result.meta.requestStatus === 'fulfilled') {
                      setCurrenPick(result.payload);
                      console.log(result.payload);
                      setUpdateValue(new Date());
                      const index = filteredMaterialOrders.findIndex(
                        (itemR: any) => itemR._id === result.payload._id
                      );
                      dispatch(
                        setUpdatedMaterialOrder({
                          index: index,
                          item: result.payload,
                        })
                      );
                    }
                  }
                },
              });
            }}
            size="small"
          >
            {' '}
            {t('COMPLETE')}
          </Button>
          <Button
            icon={<SaveOutlined />}
            disabled={
              currentPick?.status === 'issued' ||
              currentPick?.status === 'open' ||
              currentPick?.status === 'closed' ||
              currentPick?.status === 'new' ||
              currentPick?.status === 'cancelled' ||
              currentPick?.status === 'partyCancelled' ||
              !currentPick
            }
            onClick={() => setOpenRelese(true)}
            size="small"
          >
            {' '}
            {t('BOOK')}
          </Button>
        </Space>
        <Space>
          <Button
            icon={<PrinterOutlined />}
            onClick={() => {
              // // currentPick.status == 'completed'
              // setOpenLabelsPrint(true);
              // setOpenLabelsWorkPrint(true)
              //     : setOpenLabelsPrint(false);
              if (currentPick?.status === 'issued') {
                const newData = {
                  ...currentPick,
                  materials: updatetOrderMaterials,
                };

                setIntermediateData(newData);
                setOpenLabelsWorkPrint(true);
              } else if (currentPick?.status === 'completed') {
                setOpenLabelsPrint(true);
              }
            }}
            size="small"
          >
            {' '}
            {t('PRINT LABEL')}
          </Button>
        </Space>
      </div>

      <Modal
        title={t('PICKSLIP PRINT')}
        open={openPickSlip}
        width={'60%'}
        onCancel={() => setOpenPickSlip(false)}
        footer={null}
      >
        <GeneretedPickSlip currentPickSlipID={currentPick?.pickSlipID} />
      </Modal>
      <Modal
        title=""
        open={openRelese}
        width={'60%'}
        onCancel={() => setOpenRelese(false)}
        footer={null}
      >
        {' '}
        <ProForm
          size="small"
          disabled={
            currentPick?.status === 'closed' ||
            currentPick?.status === 'canceled' ||
            !currentPick
          }
          form={form}
          autoComplete="off"
          onFinish={async (values: any) => {
            Modal.confirm({
              title: t('CONFIRM BOOK'),
              onOk: async () => {
                const currentCompanyID = localStorage.getItem('companyID');
                if (currentCompanyID) {
                  const result = await dispatch(
                    createPickSlip({
                      materialAplicationId:
                        currentPick._id || currentPick.id || '',
                      status: 'closed',
                      materials: updatetOrderMaterials.reduce(
                        (acc: any, item: any) => {
                          if (
                            item?.onBlock?.QUANTITY !== null &&
                            item?.onBlock?.QUANTITY !== 0
                          ) {
                            return acc.concat(item?.onBlock);
                          } else {
                            return acc;
                          }
                        },
                        []
                      ),
                      createDate: new Date(),
                      consigneeName: currentPick.createBy,
                      storeMan: selectedStoreUser?.name,
                      storeManID: selectedStoreUser?._id || '',
                      recipient: selectedСonsigneeUser?.name,
                      recipientID: selectedСonsigneeUser?._id,
                      taskNumber: currentPick.taskNumber,
                      registrationNumber:
                        currentPick?.projectID?.acRegistrationNumber,
                      planeType: currentPick?.projectID?.acType,
                      projectWO: currentPick?.projectID?.projectWO,
                      projectTaskWO: currentPick?.projectTaskId?.projectTaskWO,
                      materialAplicationNumber:
                        currentPick.materialAplicationNumber,
                      additionalTaskID: currentPick.additionalTaskID,
                      store: currentPick.getFrom,
                      workshop: currentPick?.neededOnID?.title,
                      companyID: currentCompanyID,
                      projectTaskID: currentPick?.projectTaskId,
                      projectID: currentPick.projectID,
                      neededOnID: currentPick.neededOnID,
                    })
                  );
                  // добавитьUpdateUser;
                  if (result.meta.requestStatus === 'fulfilled') {
                    result.payload.registrationNumber &&
                      result.payload?.materials &&
                      result.payload?.materials.forEach(
                        async (resultItem: any) => {
                          await dispatch(
                            createBookingItem({
                              companyID: resultItem.COMPANY_ID,
                              data: {
                                companyID: resultItem.COMPANY_ID,
                                userSing: result.payload?.recipient,
                                userID: result.payload?.recipientID || '',
                                createDate: new Date(),
                                PART_NUMBER: resultItem.PART_NUMBER,
                                station:
                                  resultItem?.WAREHOUSE_RECEIVED_AT || 'N/A',
                                voucherModel: 'STORE_TO_A/C',
                                WAREHOUSE_RECEIVED_AT:
                                  resultItem?.WAREHOUSE_RECEIVED_AT || 'N/A',
                                SHELF_NUMBER: resultItem?.SHELF_NUMBER,
                                ORDER_NUMBER: resultItem?.ORDER_NUMBER,
                                PRICE: resultItem?.PRICE,
                                CURRENCY: resultItem?.CURRENCY,
                                QUANTITY: -resultItem?.QUANTITY,
                                SUPPLIER_BATCH_NUMBER:
                                  resultItem?.SUPPLIER_BATCH_NUMBER,
                                OWNER: resultItem?.OWNER_SHORT_NAME,

                                SERIAL_NUMBER: resultItem?.SERIAL_NUMBER,
                                GROUP: resultItem?.GROUP,
                                TYPE: resultItem?.TYPE,
                                CONDITION: resultItem?.CONDITION,
                                NAME_OF_MATERIAL: resultItem?.NAME_OF_MATERIAL,

                                STOCK: resultItem?.STOCK,

                                RECEIVED_DATE: resultItem?.RECEIVED_DATE,

                                UNIT_OF_MEASURE: resultItem.UNIT_OF_MEASURE,

                                SUPPLIES_CODE: resultItem?.SUPPLIES_CODE || '',
                                SUPPLIES_LOCATION:
                                  resultItem?.SUPPLIES_LOCATION || '',
                                SUPPLIER_NAME: resultItem?.SUPPLIER_NAME,
                                SUPPLIER_SHORT_NAME:
                                  resultItem?.SUPPLIER_SHORT_NAME,
                                SUPPLIER_UNP: resultItem?.SUPPLIER_UNP,
                                SUPPLIES_ID: resultItem?.SUPPLIES_ID,
                                IS_RESIDENT: resultItem?.IS_RESIDENT,
                                ADD_UNIT_OF_MEASURE:
                                  resultItem?.ADD_UNIT_OF_MEASURE,
                                ADD_NAME_OF_MATERIAL:
                                  resultItem?.ADD_NAME_OF_MATERIAL,
                                ADD_PART_NUMBER:
                                  resultItem.payload?.ADD_PART_NUMBER,
                                ADD_QUANTITY: resultItem?.ADD_QUANTITY,
                                OWNER_SHORT_NAME: resultItem?.OWNER_SHORT_NAME,
                                OWNER_LONG_NAME: resultItem?.OWNER_LONG_NAME,
                                PRODUCT_EXPIRATION_DATE:
                                  resultItem?.PRODUCT_EXPIRATION_DATE,

                                APPROVED_CERT: resultItem?.APPROVED_CERT,
                                AWB_REFERENCE: resultItem?.AWB_REFERENCE || '',
                                AWB_TYPE: resultItem?.AWB_TYPE || '',
                                AWB_NUMBER: resultItem?.AWB_NUMBER || '',
                                AWB_DATE: resultItem?.AWB_DATE || '',
                                RECEIVING_NUMBER: resultItem?.RECEIVING_NUMBER,
                                RECEIVING_ITEM_NUMBER:
                                  resultItem.RECEIVING_ITEM_NUMBER,
                                CERTIFICATE_NUMBER:
                                  resultItem?.CERTIFICATE_NUMBER,
                                CERTIFICATE_TYPE: resultItem?.CERTIFICATE_TYPE,
                                REVISION: resultItem?.REVISION,
                                IS_CUSTOMER_GOODS:
                                  resultItem?.IS_CUSTOMER_GOODS,
                                LOCAL_ID: resultItem?.LOCAL_ID,
                                registrationNumber:
                                  result.payload?.registrationNumber,
                                planeType: result.payload?.registrationNumber,
                                projectWO: result.payload?.projectWO,
                                workshop: result.payload?.workshop,
                                projectTaskWO: result.payload?.projectTaskWO,
                                additionalTaskID:
                                  result.payload?.additionalTaskID,
                                pickDate: result.payload?.createDate,
                                pickSlipNumber:
                                  result.payload?.materialAplicationNumber,
                              },
                            })
                          );
                        }
                      );
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
                    });
                    updatetOrderMaterials.map(async (item: any) => {
                      await updateRequirement({
                        id: item.requirementID?._id,
                        forBookedQuantity: item?.onOrderQuantity,
                        projectID: result.payload.projectId,
                        _id: item.requirementID?._id,
                      }).unwrap();
                      // dispatch(
                      //   updateRequirementByID({
                      //     id: item.requirementID?._id,
                      //     // requestQuantity: -item.QUANTITY,
                      //     issuedQuantity: item.QUANTITY,
                      //     updateUserID: USER_ID || '',
                      //     updateDate: new Date(),
                      //     companyID: localStorage.getItem('companyID') || '',
                      //     projectID: result.payload.projectId,
                      //     // status: 'closed',
                      //   })
                      // );
                    });

                    const result1 = await dispatch(
                      updatedMaterialOrdersById({
                        status: 'closed',
                        _id: currentPick._id,
                        closedDate: new Date(),
                        pickSlipNumber: result.payload.pickSlipNumber,
                        pickSlipID: result.payload._id || result.payload.id,
                        updateUserID: USER_ID,
                        updateDate: new Date(),
                        materials: currentPick.materials.map((item: any) => {
                          // Создаем копию элемента, чтобы не изменять исходный объект
                          let newItem = { ...item };
                          if (newItem.status === 'completed') {
                            newItem.status = 'closed';
                            if (newItem.requirementID) {
                              // Создаем копию объекта requirementID, чтобы не изменять исходный объект
                              newItem.requirementID = {
                                ...newItem.requirementID,
                                status: 'closed',
                                issuedQuantity: newItem.QUANTITY,
                              };
                            }
                            if (newItem.onBlock && newItem.onBlock.length > 0) {
                              newItem.onBlock = newItem.onBlock.map(
                                (block: any, index: number) => {
                                  if (index === 0) {
                                    return { ...block, STATUS: 'closed' };
                                  }
                                  return block;
                                }
                              );
                            }
                            if (
                              newItem?.foRealesе &&
                              newItem?.foRealesе.length > 0
                            ) {
                              newItem.foRealesе = newItem.foRealesе.map(
                                (release: any, index: number) => {
                                  if (index === 0) {
                                    return { ...release, STATUS: 'closed' };
                                  }
                                  return release;
                                }
                              );
                            }
                          }
                          return newItem;
                        }),
                      })
                    );

                    if (result1.meta.requestStatus === 'fulfilled') {
                      setCurrenPick(result1.payload);
                      setUpdateValue(new Date());
                      const currentCompanyID =
                        localStorage.getItem('companyID');
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
              },
            });
            if (!selectedСonsigneeUser?._id || !selectedStoreUser?._id) {
              message.error('form is required!');
              return;
            }
            // console.log(order);
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
              {/* <>{console.log(issuedMaterials)}</> */}

              <h4 className="">STOREMAN</h4>
              <ProForm.Item style={{ width: '100%' }}>
                <UserSearchForm
                  performedName={
                    currentPick?.storeManName || currentPick?.storeMan
                  }
                  actionNumber={null}
                  performedSing={currentPick?.storeManSing}
                  onUserSelect={(user) => {
                    setSelectedStoreUser(user);
                  }}
                  reset={false}
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
                performedName={
                  currentPick?.recipientName || currentPick?.recipient
                }
                actionNumber={null}
                performedSing={currentPick?.recipientSing}
                onUserSelect={(user) => {
                  setSelectedСonsigneeUser(user);
                }}
                reset={false}
              />
              {/* </Form.Item> */}
            </div>
          </div>
        </ProForm>
      </Modal>
      <Modal
        title={t('PRINT LABEL')}
        open={labelsOpenPrint}
        width={'30%'}
        onCancel={() => setOpenLabelsPrint(false)}
        footer={null}
      >
        <GeneretedCompleteLabels currentPick={currentPick} />
      </Modal>
      <Modal
        title={t('PRINT LABEL')}
        open={labelsOpenWorkPrint}
        width={'30%'}
        onCancel={() => setOpenLabelsWorkPrint(false)}
        footer={null}
      >
        <GeneretedWorkLabels currentPick={intermediateData} />
      </Modal>
      <Modal
        title="COMPLETE PRINT"
        open={completeOpenPrint}
        width={'60%'}
        onCancel={() => setOpenCompletePrint(false)}
        footer={null}
      >
        <GeneretedCompleteSlipPdf currentPick={currentPick} />
      </Modal>
      <Modal
        title="PRINT"
        open={completeWorkPrint}
        width={'60%'}
        onCancel={() => setOpenCompleteWorkPrint(false)}
        footer={null}
      >
        <GeneretedCompleteSlipPdf currentPick={intermediateData} />
      </Modal>
      {/* </div> */}
    </div>
  );
};
export default PickSlipConfirmation;
