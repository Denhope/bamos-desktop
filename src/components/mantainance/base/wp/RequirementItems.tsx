import { ProColumns } from '@ant-design/pro-components';
import { Cascader, Input, MenuProps, Popover, Table, Tag, message } from 'antd';
import { useColumnSearchProps } from '@/components/shared/Table/columnSearch';
import React, { FC, useEffect, useState } from 'react';
import { exportToExcel } from '@/services/utilites';
import { IMatData } from '@/types/TypesData';
import {
  DownloadOutlined,
  PrinterOutlined,
  PlusOutlined,
  DeleteOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import { AplicationResponce } from '@/store/reducers/WPGenerationSlise';
import {
  createRequirement,
  getFilteredRequirements,
  updateRequirementByID,
  updateRequirementsByIds,
  deleteRequirementsByIds,
  createSingleRequirement,
  getFilteredMaterialItems,
  reservationRequarementByIds,
  updateProjectTask,
} from '@/utils/api/thunks';
import EditableTable from '@/components/shared/Table/EditableTable';
import Select, { DefaultOptionType } from 'antd/es/select';
import IssuedMatForm from './activeTask/requeriments/IssuedMatForm';
import MaterialItemStoreSearchNew from '@/components/store/search/MaterialItemStoreSearchNew';
import MaterialItemStoreSearchFOrREq from '@/components/store/search/MaterialItemStoreSearchFOrREq';
import { IMaterialStoreRequestItem } from '@/models/IMaterialStoreItem';
import DoubleClickPopover from '@/components/shared/form/DoubleClickProper';
import { useTranslation } from 'react-i18next';
import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import { USER_ID } from '@/utils/api/http';

const { Option } = Select;

type FilteredRequirementItemsListPropsType = {
  data: any;
  projectData: any;
  scroll: number;
  scrollX: number;
  isLoading: boolean;
  onIssuedClick: (record: any) => void;
  selectedObjectParent?: any;
};
const RequirementItems: FC<FilteredRequirementItemsListPropsType> = ({
  data,
  // isLoading,
  scroll,
  scrollX,
  projectData,
  onIssuedClick,
  selectedObjectParent,
}) => {
  const optionsRewiew = [
    {
      label: 'TO WAIT',
      value: 'waiting',
    },
    {
      label: 'IN PROGRESS',
      value: 'inProgress',
    },
    {
      label: 'COMPLETED',
      value: 'completed',
    },
    {
      label: 'CANCELED',
      value: 'canceled',
    },
  ];
  const { isLoadingReq } = useTypedSelector((state) => state.mtbase);
  const { t } = useTranslation();
  const [localOptions, setLocalOptions] = useState([]);
  const onChangeRewiew: any['props']['onChange'] = async (
    value: any,
    selectedOptions: any
  ) => {
    const selectedCount = selectedRowKeys && selectedRowKeys.length;
    if (selectedCount < 1) {
      message.error('Please select Items.');
      return;
    }
    const companyID = localStorage.getItem('companyID');
    const result = await dispatch(
      updateRequirementsByIds({
        rewiewStatus: value,
        ids: selectedRowKeys,
        updateDate: new Date(),
        updateUserID: USER_ID || '',
        companyID: companyID || '',
      })
    );
    if (result.meta.requestStatus === 'fulfilled') {
      const result = await dispatch(
        getFilteredRequirements({
          companyID: companyID || '',
          projectId: projectData._id,
        })
      );
      setRequirements(result.payload);
    }
  };
  const filter = (inputValue: string, path: DefaultOptionType[]) =>
    path.some(
      (option) =>
        (option.label as string)
          .toLowerCase()
          .indexOf(inputValue.toLowerCase()) > -1
    );
  interface Option {
    value: string;
    label: string;
    children?: Option[];
    disabled?: boolean;
  }
  const options: Option[] = [
    {
      value: 'ed',
      label: 'ED',
      children: [
        {
          value: 'checking',
          label: 'CHECK',
        },
        {
          value: 'alternative',
          label: 'ALTERNATIVE',
        },
        {
          value: 'canceled',
          label: 'CANCELED',
        },
      ],
    },
    {
      value: 'logistic',
      label: 'LOGISTIC',
      children: [
        {
          value: 'checking',
          label: 'CHECK',
        },
        {
          value: 'purchaising',
          label: 'PURCHAICING',
        },
        {
          value: 'delivery',
          label: 'DELIVERY',
        },
        {
          label: 'AGREEMENT ON CUSTOMER',
          value: 'agreement',
        },
      ],
    },
  ];
  const cascaderOptions = [
    {
      field: 'ED',
      value: 'ed',
      language: [
        {
          field: 'CHECK',
          value: 'checking',
        },
        {
          field: 'ALTERNATIVE',
          value: 'alternative',
        },
        {
          field: 'CANCELED',
          value: 'canceled',
        },
      ],
    },

    {
      field: 'LOG',
      value: 'logistic',
      language: [
        {
          field: 'CHECK',
          value: 'checking',
        },
        {
          field: 'PURCHASE',
          value: 'purchaising',
        },
        {
          field: 'DELIVERY',
          value: 'delivery',
        },
        {
          field: 'AGREEMENT ON CUSTOMER',
          value: 'agreement',
        },
      ],
    },
  ];
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [issuedRecords, setIssuedRecords] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  function extractIds(objects: ObjectType[]): string[] {
    return objects.map((object) => object._id);
  }

  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };
  type ObjectType = {
    _id: string;
    taskNumber: string;
    startOfWork: string;
    workInterval: string;
    amtoss: string;
    code: string;
    PN: string;
    alternative: string;
    nameOfMaterial: string;
    amout: number;
    unit: string;
  };
  const [optionsSearch, setOptions] = useState([]);
  const [materialsRequirements, setRequirements] = useState<any>([]);
  const [initialMaterialsRequirements, setInitialRequirements] = useState<any>(
    []
  );
  const [selectedObject, setSelectedObject] =
    React.useState<any>(selectedObjectParent);
  const companyID = localStorage.getItem('companyID');
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const dispatch = useAppDispatch();
  useEffect(() => {
    setSelectedObject(selectedObjectParent);
    const fetchData = async () => {
      const companyID = localStorage.getItem('companyID');

      if (companyID) {
        const result = await dispatch(
          getFilteredRequirements({
            companyID: companyID,
            projectId: projectData._id,
          })
        );
        if (result.meta.requestStatus === 'fulfilled') {
          // console.log(result.payload);

          result.payload.length
            ? setRequirements(result.payload)
            : setRequirements([]);
          setInitialRequirements(result.payload);
        }
      }
    };
    fetchData();
  }, [dispatch]);

  const handleSearch = (value: any, setLocalOptions: any) => {
    dispatch(
      getFilteredMaterialItems({
        PART_NUMBER: value.trim(),
        companyID: companyID || '',
      })
    ).then((results) => {
      setLocalOptions(results);
    });
  };
  const initialColumns: ProColumns<any>[] = [
    {
      title: '',
      dataIndex: 'readyStatus',
      key: 'readyStatus',
      width: '3%',
      editable: (text, record, index) => {
        return false;
      },
      valueType: 'select',

      filters: true,
      onFilter: true,
      valueEnum: {
        'not Ready': { text: 'NOT AVAILABLE' },
        Ready: { text: 'AVAILABLE' },
      },
      render: (text: any, record: any) => {
        let color =
          record?.availableQTY &&
          record?.status &&
          record?.status !== 'closed' &&
          record.availableQTY >= (record?.amout - record?.issuedQuantity || 0)
            ? 'green'
            : record?.status === 'closed'
            ? '#d3d3d3'
            : 'red';
        return (
          <Tag
            color={color}
            style={{ borderRadius: '50%', width: '16px', height: '16px' }}
          />
        );
      },
    },
    {
      title: `${t('STATUS')}`,
      key: 'status',
      width: '7%',
      valueType: 'select',
      filterSearch: true,
      filters: true,
      onFilter: true,
      valueEnum: {
        inStockReserve: { text: t('RESERVATION'), status: 'Success' },
        onCheack: { text: t('CHECK'), status: 'Warning' },
        open: { text: t('NEW'), status: 'Error' },
        closed: { text: t('CLOSED'), status: 'Default' },
        canceled: { text: t('CANCELED'), status: 'Error' },
        onOrder: { text: t('ISSUED'), status: 'Processing' },
      },

      dataIndex: 'status',
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: `${t('REQUIREMENT NUMBER')}`,
      dataIndex: 'partRequestNumber',
      // valueType: 'index',
      ellipsis: true,
      width: '5%',

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
            {record.partRequestNumber && record.partRequestNumber}
          </a>
        );
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: `${t('W/O')}`,
      dataIndex: 'taskWO',
      key: 'taskWO',
      width: '5%',
      editable: (text, record, index) => {
        return false;
      },
      sorter: (a, b) => (a.taskWO || 0) - (b.taskWO || 0),
      ...useColumnSearchProps({
        dataIndex: 'taskWO',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              item.taskWO.toString().toLowerCase().includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setRequirements(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setRequirements(initialMaterialsRequirements);
          }
        },
        data: materialsRequirements,
      }),
    },
    {
      title: `${t('TASK')}`,
      key: 'taskNumber',
      width: '9%',
      editable: (text, record, index) => {
        return false;
      },
      dataIndex: 'taskNumber',
      ...useColumnSearchProps({
        dataIndex: 'taskNumber',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              item.taskNumber
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setRequirements(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setRequirements(initialMaterialsRequirements);
          }
        },
        data: materialsRequirements,
      }),
    },

    {
      title: `${t('PN')}`,
      dataIndex: 'PN',
      width: '12%',
      editable: (text, record, index) => {
        return false;
      },
      key: 'PN',
      ellipsis: true,
      ...useColumnSearchProps({
        dataIndex: 'PN',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = materialsRequirements.filter((item: any) =>
              item.PN.toString().toLowerCase().includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setRequirements(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setRequirements(initialMaterialsRequirements);
          }
        },
        data: materialsRequirements,
      }),
      renderFormItem: (item2, { onChange }) => {
        return (
          <DoubleClickPopover
            content={
              <div className="flex my-0 mx-auto  h-[45vh] flex-col relative overflow-hidden">
                <PartNumberSearch
                  initialParams={{ partNumber: '' }}
                  scroll={18}
                  onRowClick={function (record: any, rowIndex?: any): void {
                    // setOpenStoreFind(false);
                    setSelectedObject(record);
                    // setInitialPN(record.PART_NUMBER);
                  }}
                  isLoading={false}
                  onRowSingleClick={function (
                    record: any,
                    rowIndex?: any
                  ): void {
                    setSelectedObject(record);
                  }}
                />
              </div>
            }
            overlayStyle={{ width: '70%' }}
          >
            <Input
              value={selectedObject.PART_NUMBER}
              onChange={(e) => {
                setSelectedObject({
                  ...selectedObject,
                  PART_NUMBER: e.target.value,
                });
                if (onChange) {
                  onChange(e.target.value);
                }
              }}
            />
          </DoubleClickPopover>
        );
      },
    },

    {
      title: `${t('DESCRIPTIONS')}`,
      dataIndex: 'nameOfMaterial',
      key: 'nameOfMaterial',
      responsive: ['sm'],
      // width: '19%',
      tip: 'Text Show',
      ellipsis: true,
      renderFormItem: (item2, { onChange }) => {
        return (
          <DoubleClickPopover
            content={
              <div className="flex my-0 mx-auto  h-[45vh] flex-col relative overflow-hidden">
                <PartNumberSearch
                  initialParams={{ partNumber: '' }}
                  scroll={18}
                  onRowClick={function (record: any, rowIndex?: any): void {
                    // setOpenStoreFind(false);
                    setSelectedObject(record);
                    // setInitialPN(record.PART_NUMBER);
                  }}
                  isLoading={false}
                  onRowSingleClick={function (
                    record: any,
                    rowIndex?: any
                  ): void {
                    setSelectedObject(record);
                  }}
                />
              </div>
            }
            overlayStyle={{ width: '70%' }}
          >
            <Input
              value={
                selectedObject.NAME_OF_MATERIAL || selectedObject?.DESCRIPTION
              }
              onChange={(e) => {
                setSelectedObject({
                  ...selectedObject,
                  NAME_OF_MATERIAL: e.target.value,
                  DESCRIPTION: e.target.value,
                });
                if (onChange) {
                  onChange(e.target.value);
                }
              }}
            />
          </DoubleClickPopover>
        );
      },
    },

    {
      title: `${t('QTY')}`,
      dataIndex: 'amout',
      width: '3%',
      key: 'amout',
      // sorter: (a, b) => a.amout - b.amout,
      responsive: ['sm'],
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'unit',
      width: '6%',
      key: 'unit',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('PLANNED DATE')}`,
      dataIndex: 'plannedDate',
      key: 'plannedDate',
      ellipsis: true,
      width: '8%',
      valueType: 'date',
      sorter: (a, b) => {
        if (a.plannedDate && b.plannedDate) {
          const aFinishDate = new Date(a.plannedDate);
          const bFinishDate = new Date(b.plannedDate);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      // renderFormItem: () => {
      //   return <DatePicker />;
      // },
    },

    {
      title: `${t('REQUESTED QTY')}`,
      width: '8%',
      dataIndex: 'requestQuantity',
      key: 'requestQuantity',
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        // Вычисляем разницу между record.amout и record.issuedQuantity
        const difference = record.amout - record.requestQuantity;
        // Определяем цвет фона в зависимости от условия
        const backgroundColor = difference > 0 ? '#f0be37' : '';
        return (
          <div
            style={{ backgroundColor }} // Применяем цвет фона
          >
            {record.requestQuantity && record.requestQuantity}
          </div>
        );
      },
    },

    {
      title: `${t(' BOOKED QTY')}`,
      width: '7%',
      dataIndex: 'issuedQuantity',
      key: 'issuedQuantity',
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        const difference = record.amout - record.issuedQuantity;
        // Определяем цвет фона в зависимости от условия
        const backgroundColor = difference > 0 ? '#f0be37' : '#62d156';
        return (
          <div
            style={{ backgroundColor }}
            onClick={() => {
              // dispatch(setCurrentProjectTask(record));
              // setOpenRequirementDrawer(true);
              setIssuedRecords(record.issuedItems);
              setIsModalOpen(true);
            }}
          >
            {record.issuedQuantity && record.issuedQuantity}
          </div>
        );
      },
      // responsive: ['sm'],
    },

    {
      title: `${t('AVAIL. QTY')}`,
      dataIndex: 'availableQTY',
      key: 'availableQTY',
      width: '6%',
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        // Вычисляем разницу между record.amout и record.issuedQuantity
        const difference = record.amout - record.issuedQuantity;
        // Определяем цвет фона в зависимости от условия
        const backgroundColor =
          difference <= record.availableQTY ? '#32CD32' : 'red';
        return (
          <div
            onClick={() => {
              onIssuedClick(record.availableQTY);
            }}
            style={{ backgroundColor }} // Применяем цвет фона
          >
            {record.availableQTY && record.availableQTY}
          </div>
        );
      },
      // responsive: ['sm'],
    },
    {
      title: `${t('LINK QTY')}`,
      dataIndex: 'reservationQTY',
      key: 'reservationQTY',
      width: '6%',
      editable: (text, record, index) => {
        return false;
      },
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    {
      title: `${t('REMARKS')}`,
      dataIndex: 'note',
      width: '7%',
      key: 'note',
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },
    // {
    //   title: `${t('SKILL')}`,
    //   width: '6%',
    //   key: 'cascader',
    //   dataIndex: 'cascader',
    //   tip: 'Text Show',
    //   ellipsis: true,

    //   fieldProps: {
    //     options: cascaderOptions,
    //     fieldNames: {
    //       children: 'language',
    //       label: 'field',
    //     },
    //   },
    //   valueType: 'cascader',
    //   ...useColumnSearchProps({
    //     dataIndex: 'cascader',
    //     onSearch: (value) => {
    //       if (value) {
    //         // Отфильтруйте данные на основе поискового запроса
    //         const filteredData = materialsRequirements.filter((item: any) =>
    //           item.cascader
    //             .toString()
    //             .toLowerCase()
    //             .includes(value.toLowerCase())
    //         );
    //         // Обновление данных в таблице
    //         setRequirements(filteredData);
    //       } else {
    //         // Отобразите все данные, если поисковый запрос пуст
    //         setRequirements(initialMaterialsRequirements);
    //       }
    //     },
    //     data: materialsRequirements,
    //   }),
    //   // width: '12%',
    // },
    // {
    //   title: `${t('REWIEW')}`,
    //   dataIndex: 'rewiewStatus',
    //   key: 'rewiewStatus',
    //   width: '8%',
    //   valueType: 'select',
    //   tip: 'Text Show',
    //   ellipsis: true,
    //   // initialValue: 'all',
    //   filters: true,
    //   filterSearch: true,
    //   onFilter: true,
    //   valueEnum: {
    //     // all: { text: 'all', status: 'Default' },
    //     waiting: { text: 'TO WAIT', status: 'Warning' },
    //     inProgress: { text: 'IN PROGRESS', status: 'Processing' },
    //     completed: { text: 'COMPLETED', status: 'SUCCESS' },
    //     canceled: { text: 'CANCELED', status: 'Error' },
    //   },
    // },
    // {
    //   title: `${t('OPTION')}`,
    //   valueType: 'option',
    //   width: '5%',
    //   key: 'option',
    //   // width: '9%',
    //   render: (text, record, _, action) => [
    //     <a
    //       key="editable"
    //       onClick={() => {
    //         action?.startEditable?.(record._id);
    //       }}
    //     >
    //       Edit
    //     </a>,
    //   ],
    // },
  ];
  const onChange: any['props']['onChange'] = async (
    value: any,
    selectedOptions: any
  ) => {
    const selectedCount = selectedRowKeys && selectedRowKeys.length;
    if (selectedCount < 1) {
      message.error('Please select Items.');
      return;
    }
    const companyID = localStorage.getItem('companyID');
    const result = await dispatch(
      updateRequirementsByIds({
        cascader: value,
        ids: selectedRowKeys,
        companyID: companyID || '',
        updateDate: new Date(),
        updateUserID: USER_ID || '',
      })
    );
    if (result.meta.requestStatus === 'fulfilled') {
      const result = await dispatch(
        getFilteredRequirements({
          companyID: companyID || '',
          projectId: projectData._id,
        })
      );
      setRequirements(result.payload);
    }
  };

  type MenuItem = Required<MenuProps>['items'][number];
  function getItem(
    label: React.ReactNode,
    key?: React.Key | null,
    icon?: React.ReactNode,
    children?: any[],
    type?: 'group'
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  }

  const items: MenuProps['items'] = [
    {
      label: `${t('Actions')}`,
      key: 'actions',
      icon: null,
      children: [
        getItem('Reservation', 'sub54', <AppstoreOutlined />, [
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error('Please select  Items.');
                  return;
                }
                const companyID = localStorage.getItem('companyID');
                console.log(selectedRowKeys);

                const result = await dispatch(
                  reservationRequarementByIds({
                    ids: selectedRowKeys,
                    companyID: companyID || '',
                    updateDate: new Date(),
                    updateUserID: USER_ID || '',
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  const result = await dispatch(
                    getFilteredRequirements({
                      companyID: companyID || '',
                      projectId: projectData._id,
                    })
                  );
                  setRequirements(result.payload);
                }
              }}
            >
              Selected Items
            </div>,
            '5.17'
          ),
          getItem(<div onClick={async () => {}}>All Items</div>, '5.172'),
        ]),
        getItem('Update Status selected items ', 'subydd09', '', [
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error('Please select  Items.');
                  return;
                }
                const companyID = localStorage.getItem('companyID');
                // console.log(selectedRowKeys);

                const result = await dispatch(
                  updateRequirementsByIds({
                    status: 'open',
                    cascader: ['logistic', 'check'],
                    rewiewStatus: 'waiting',
                    ids: selectedRowKeys,
                    companyID: companyID || '',
                    updateDate: new Date(),
                    updateUserID: USER_ID || '',
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  const result = await dispatch(
                    getFilteredRequirements({
                      companyID: companyID || '',
                      projectId: projectData._id,
                    })
                  );
                  setRequirements(result.payload);
                }
              }}
            >
              Open
            </div>,
            '9sasyhqss'
          ),
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error('Please select  Items.');
                  return;
                }
                const companyID = localStorage.getItem('companyID');
                // console.log(selectedRowKeys);

                const result = await dispatch(
                  updateRequirementsByIds({
                    status: 'canceled',
                    rewiewStatus: 'completed',
                    cascader: ['ed', 'checking'],
                    ids: selectedRowKeys,
                    companyID: companyID || '',
                    updateDate: new Date(),
                    updateUserID: USER_ID || '',
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  const result = await dispatch(
                    getFilteredRequirements({
                      companyID: companyID || '',
                      projectId: projectData._id,
                    })
                  );
                  setRequirements(result.payload);
                }
              }}
            >
              Canceled
            </div>,
            '9sasddyhqss'
          ),
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error('Please select  Items.');
                  return;
                }
                const companyID = localStorage.getItem('companyID');
                // console.log(selectedRowKeys);

                const result = await dispatch(
                  updateRequirementsByIds({
                    status: 'onCheack',
                    rewiewStatus: 'inProgress',
                    cascader: ['ed', 'check'],
                    ids: selectedRowKeys,
                    companyID: companyID || '',
                    updateDate: new Date(),
                    updateUserID: USER_ID || '',
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  const result = await dispatch(
                    getFilteredRequirements({
                      companyID: companyID || '',
                      projectId: projectData._id,
                    })
                  );
                  setRequirements(result.payload);
                }
              }}
            >
              Checking
            </div>,
            '9saysddyhqss'
          ),
          getItem(
            <div
            // onClick={async () => {
            //   const selectedCount = selectedRowKeys && selectedRowKeys.length;
            //   if (selectedCount < 1) {
            //     message.error('Please select  Items.');
            //     return;
            //   }
            //   const companyID = localStorage.getItem('companyID');
            //   console.log(selectedRowKeys);

            //   const result = await dispatch(
            //     reservationRequarementByIds({
            //       ids: selectedRowKeys,
            //       companyID: companyID || '',
            //       updateDate: new Date(),
            //       updateUserID: USER_ID || '',
            //     })
            //   );
            //   if (result.meta.requestStatus === 'fulfilled') {
            //     const result = await dispatch(
            //       getFilteredRequirements({
            //         companyID: companyID || '',
            //         projectId: projectData._id,
            //       })
            //     );
            //     setRequirements(result.payload);
            //   }
            // }}
            >
              Reservation
            </div>,
            '9saysddyццhqss'
          ),
        ]),
        // getItem(<div>Update Skill selected Item</div>, 'updateSkill', '', [
        //   getItem(
        //     <div
        //       onClick={(e) => {
        //         e.stopPropagation();
        //       }}
        //     >
        //       <Cascader
        //         options={options}
        //         onChange={onChange}
        //         placeholder="Please select"
        //         showSearch={{ filter }}
        //         onSearch={(value) => {}}
        //       />
        //     </div>
        //   ),
        // ]),
        // getItem(
        //   <div
        //   // onClick={(e) => {
        //   //   e.stopPropagation();
        //   //   // setOpenAddAppForm(true);
        //   // }}
        //   >
        //     Update Skill/Wait Rewiew
        //   </div>,
        //   'updateSkill/Wait',
        //   '',
        //   [
        //     getItem(
        //       <div
        //         onClick={(e) => {
        //           e.stopPropagation();
        //         }}
        //       >
        //         <Select
        //           options={optionsRewiew}
        //           onChange={onChangeRewiew}
        //           placeholder="Please select"
        //           showSearch
        //           onSearch={(value) => {}}
        //         />
        //       </div>
        //     ),
        //   ]
        // ),
      ],
    },
    {
      label: `${t('Report')}`,
      key: 'print',
      icon: null,
      children: [
        getItem('Print', 'sub4.1', null, [
          getItem('Selected Items', 'sub4.1.1', <PrinterOutlined />),
          getItem(
            <div
            // onClick={() => setOpenAddAppForm(true)}
            >
              <PrinterOutlined /> All Items
            </div>,
            '9ssxs'
          ),
        ]),

        getItem('Export to Exel', 'sub5', '', [
          getItem(
            <div
              onClick={() => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error('Please select  Items.');
                  return;
                }
                exportToExcel(
                  false,
                  selectedRowKeys,
                  visibleColumns,
                  materialsRequirements,
                  `Filtred-RequirementItems-${data.aplicationName}`
                );
              }}
            >
              <DownloadOutlined /> Selected Items
            </div>,
            '5.1'
          ),
          getItem(
            <div
              onClick={() =>
                materialsRequirements.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  visibleColumns,
                  materialsRequirements,
                  `All RequirementItems-${data.aplicationName}`
                )
              }
            >
              <PrinterOutlined /> All Items
            </div>,
            '5.2'
          ),
        ]),
        // ]),
      ],
    },
  ];

  const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>(
    'bottom'
  );
  return (
    <div className="flex my-0 mx-auto flex-col  h-[78vh] relative overflow-hidden">
      <EditableTable
        recordCreatorProps={false}
        data={materialsRequirements}
        // showSearchInput={true}
        initialColumns={initialColumns}
        isLoading={isLoadingReq}
        menuItems={items}
        onRowClick={function (record: any): void {
          console.log(record);
        }}
        onSave={async function (
          rowKey: any,
          data: any,
          row: any
        ): Promise<void> {
          if (data.isNew) {
            const companyID = localStorage.getItem('companyID');
            const result = await dispatch(
              createSingleRequirement({
                rewiewStatus: data.rewiewStatus,
                cascader: data.cascader,
                status: data.status,
                companyID: companyID || '',
                createUserID: USER_ID || '',
                projectID: projectData._id,
                quantity: data.amout,
                alternative: data.alternative,
                unit: selectedObject.UNIT_OF_MEASURE,
                description: selectedObject.DESCRIPTION || '',
                group: selectedObject.GROUP,
                type: selectedObject.TYPE,
                partNumber: selectedObject.PART_NUMBER || '',
                isNewAdded: false,
                createDate: new Date(),
                taskNumber: data.taskNumber,
                issuedQuantity: 0,
                // registrationNumber: projectTaskData?.plane.registrationNumber,
              })
            );
            if (result.meta.requestStatus === 'fulfilled') {
              setSelectedObject({
                PART_NUMBER: '',
                QUANTITY: 0,
                NAME_OF_MATERIAL: '',
                DESCRIPTION: '',
                UNIT_OF_MEASURE: '',
                GROUP: '',
                TYPE: '',
              });
              //result.payload.projectTaskID&&
              // const resultTask = await dispatch(
              //  updateProjectTask({
              //    id: result.payload?.projectTaskID,
              //   requirementItemsIds: [
              //     ...(result.payload?.projectTaskID &&
              //     Array.isArray(result.payload.requirementItemsIds)
              //</div>      ? projectTaskData.requirementItemsIds
              //      : []),
              // result.payload._id,
              //  ],
              // })
              // );
              const result1 = await dispatch(
                getFilteredRequirements({
                  companyID: companyID || '',
                  projectId: projectData._id,
                })
              );
              setRequirements(result1.payload);
              setInitialRequirements(result1.payload);
            }
          } else {
            const companyID = localStorage.getItem('companyID');
            const result = await dispatch(
              updateRequirementByID({
                id: rowKey,
                rewiewStatus: data.rewiewStatus,
                cascader: data.cascader,
                note: data.note,
                status: data.status,
                companyID: companyID || '',
                updateUserID: USER_ID || '',
                projectID: projectData._id,
                updateDate: new Date(),
                amout: data.amout,
                alternative: data.alternative,
                unit: selectedObject.UNIT_OF_MEASURE,
                nameOfMaterial: selectedObject.DESCRIPTION,
                PN: selectedObject.PART_NUMBER,
              })
            );
            if (result.meta.requestStatus === 'fulfilled') {
              setSelectedObject({
                PART_NUMBER: '',
                QUANTITY: 0,
                NAME_OF_MATERIAL: '',
                DESCRIPTION: '',
                UNIT_OF_MEASURE: '',
                GROUP: '',
                TYPE: '',
              });
              const result1 = await dispatch(
                getFilteredRequirements({
                  companyID: companyID || '',
                  projectId: projectData._id,
                })
              );
              if (result1.meta.requestStatus === 'fulfilled') {
                setRequirements(result1.payload);
                setInitialRequirements(result1.payload);
              }
            }
          }
        }}
        yScroll={scroll}
        xScroll={scrollX}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onVisibleColumnsChange={handleVisibleColumnsChange}
        externalReload={async function (): Promise<void> {
          try {
            const companyID = localStorage.getItem('companyID');
            const result = await dispatch(
              getFilteredRequirements({
                companyID: companyID || '',
                projectId: projectData._id,
              })
            );
          } catch (error) {
            console.error(error);
          }
        }}
      ></EditableTable>
      {/* )} */}
      {
        <IssuedMatForm
          open={isModalOpen}
          onClose={handleCloseModal}
          issuedRecord={issuedRecords}
          isLoading={false}
          menuItems={[]}
          yScroll={26}
        />
      }
    </div>
  );
};

export default RequirementItems;
