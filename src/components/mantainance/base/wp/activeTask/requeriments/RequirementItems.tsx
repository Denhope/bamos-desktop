import { ModalForm, ProColumns } from '@ant-design/pro-components';
import {
  Cascader,
  ConfigProvider,
  Input,
  MenuProps,
  Popover,
  Tag,
  message,
} from 'antd';
import { useColumnSearchProps } from '@/components/shared/Table/columnSearch';
import React, { FC, useEffect, useRef, useState } from 'react';
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

import {
  getFilteredRequirements,
  updateRequirementByID,
  updateRequirementsByIds,
  deleteRequirementsByIds,
  createSingleRequirement,
  updateRequirementsByBody,
  createProjectTaskMaterialAplication,
  updateProjectTask,
} from '@/utils/api/thunks';
import EditableTable from '@/components/shared/Table/EditableTable';
import Select, { DefaultOptionType } from 'antd/es/select';
import { IProjectTask } from '@/models/IProjectTaskMTB';
import DrawerPanel from '@/components/shared/DrawerPanel';
import AddMatirialRequestList from './AddMatirialRequestForm';
import { setUpdatedProjectTask } from '@/store/reducers/MtbSlice';
import MaterialItemStoreSearchFOrREq from '@/components/store/search/MaterialItemStoreSearchFOrREq';
import DoubleClickPopover from '@/components/shared/form/DoubleClickProper';
import { IMaterialStoreRequestItem } from '@/models/IMaterialStoreItem';
import { useTranslation } from 'react-i18next';
import PartNumberSearch from '@/components/store/search/PartNumberSearch';
import { USER_ID } from '@/utils/api/http';

type FilteredRequirementItemsListPropsType = {
  data: any;
  projectTaskData: IProjectTask | null;
  scroll: number;
  isLoading: boolean;
  onReqClick: (record: any) => void;
  onIssuedClick: (record: any) => void;
  selectedObjectParent?: any;
};
const RequirementItems: FC<FilteredRequirementItemsListPropsType> = ({
  data,
  isLoading,
  scroll,
  projectTaskData,
  onReqClick,
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
  const [selectedObject, setSelectedObject] =
    React.useState<any>(selectedObjectParent);

  const [tableKey, setTableKey] = useState(Math.random());
  const { projectTasks, isLoadingReq } = useTypedSelector(
    (state) => state.mtbase
  );
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
          projectId: projectTaskData?.projectId || '',
          projectTaskID: projectTaskData?._id,
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
          field: 'PURCHAICING',
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
  const [allRowKeys, setAllRowKeys] = useState<React.Key[]>([]);
  const { t } = useTranslation();

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

  const [materialsRequirements, setRequirements] = useState<any>([]);
  const [initialMaterialsRequirements, setInitialRequirements] = useState<any>(
    []
  );
  const dispatch = useAppDispatch();
  const [tableData, setTableData] = useState([]);

  const handleTableDataChange = (data: any) => {
    setTableData(data);
  };
  useEffect(() => {
    setSelectedObject(selectedObjectParent);
    const fetchData = async () => {
      const companyID = localStorage.getItem('companyID');

      if (companyID) {
        const result = await dispatch(
          getFilteredRequirements({
            companyID: companyID,
            projectId: projectTaskData?.projectId || '',
            projectTaskID: projectTaskData?._id,
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
  }, [dispatch, projectTaskData?._id]);
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
      title: `${t('Status')}`,
      key: 'status',
      width: '10%',
      valueType: 'select',
      filterSearch: true,
      filters: true,
      editable: (text, record, index) => {
        return false;
      },
      onFilter: true,
      valueEnum: {
        inStockReserve: { text: t('RESERVATION'), status: 'Success' },
        onCheack: { text: t('CHECK'), status: 'Warning' },
        open: { text: t('NEW'), status: 'Error' },
        closed: { text: t('CLOSE'), status: 'Default' },
        canceled: { text: t('CANCELED'), status: 'Error' },
        onOrder: { text: t('ISSUED'), status: 'Processing' },
      },

      dataIndex: 'status',
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
              onReqClick(record);
            }}
          >
            {record.partRequestNumber && record.partRequestNumber}
          </a>
        );
      },
      // sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },

    {
      title: `${t('PN')}`,
      dataIndex: 'PN',
      key: 'PN',
      tooltip: 'Right Click open Store search',
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
      // responsive: ['sm'],
    },

    {
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'nameOfMaterial',
      key: 'nameOfMaterial',
      // responsive: ['sm'],
      tooltip: 'Text Show',
      ellipsis: true, //
      // width: '20%',
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
      key: 'amout',
      // editable: (text, record, index) => {
      //   return false;
      // },
      // sorter: (a, b) => a.amout - b.amout,
      // responsive: ['sm'],
    },
    {
      title: `${t('UNIT')}`,
      dataIndex: 'unit',
      key: 'unit',
      editable: (text, record, index) => {
        return false;
      },
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
      dataIndex: 'requestQuantity',
      key: 'requestQuantity',
      width: '10%',
      editable: (text, record, index) => {
        return false;
      },

      // editable: (text, record, index) => {
      //   return false;
      // },
      // sorter: (a, b) => a.amout - b.amout,
      // responsive: ['sm'],
    },
    // {
    //   title: `${t('ON SHORT')}`,
    //   dataIndex: 'shortQuantity',
    //   key: 'shortQuantity',
    //   editable: (text, record, index) => {
    //     return false;
    //   },
    //   render: (text: any, record: any) => {
    //     return (
    //       <a onClick={() => {}}>
    //         {record.shortQuantity && record.shortQuantity}
    //       </a>
    //     );
    //   },
    //   // responsive: ['sm'],
    // },
    {
      title: `${t(' BOOKED QTY')}`,
      dataIndex: 'issuedQuantity',
      key: 'issuedQuantity',
      editable: (text, record, index) => {
        return false;
      },
      render: (text: any, record: any) => {
        return (
          <a
            onClick={() => {
              onIssuedClick(record.issuedItems);
            }}
          >
            {record.issuedQuantity && record.issuedQuantity}
          </a>
        );
      },
      // responsive: ['sm'],
    },
    {
      title: `${t('AVAIL QTY')}`,
      dataIndex: 'availableQTY',
      key: 'availableQTY',
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
      width: '7%',
      editable: (text, record, index) => {
        return false;
      },
      responsive: ['sm'],
      // sorter: (a, b) => a.unit.length - b.unit.length,
    },

    {
      title: `${t('OPTION')}`,
      valueType: 'option',
      key: 'option',
      // width: '9%',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            setSelectedObject(record);
            action?.startEditable?.(record._id);
          }}
        >
          Edit
        </a>,
      ],
    },
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
          projectId: projectTaskData?.projectId || '',
          projectTaskID: projectTaskData?._id,
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
                  message.error('Please select Items.');
                  return;
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
                      projectId: projectTaskData?.projectId || '',
                      projectTaskID: projectTaskData?._id,
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
                      projectId: projectTaskData?.projectId || '',
                      projectTaskID: projectTaskData?._id,
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
                      projectId: projectTaskData?.projectId || '',
                      projectTaskID: projectTaskData?._id,
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
                    status: 'inStockReserve',
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
                      projectId: projectTaskData?.projectId || '',
                      projectTaskID: projectTaskData?._id,
                    })
                  );
                  setRequirements(result.payload);
                }
              }}
            >
              Reservation
            </div>,
            '9saysddyццhqss'
          ),
        ]),
        getItem(<div>Update Skill selected Item</div>, 'updateSkill', '', [
          getItem(
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Cascader
                options={options}
                onChange={onChange}
                placeholder="Please select"
                showSearch={{ filter }}
                onSearch={(value) => {}}
              />
            </div>
          ),
        ]),
        getItem(
          <div
          // onClick={(e) => {
          //   e.stopPropagation();
          //   // setOpenAddAppForm(true);
          // }}
          >
            Update Skill/Wait Rewiew
          </div>,
          'updateSkill/Wait',
          '',
          [
            getItem(
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Select
                  options={optionsRewiew}
                  onChange={onChangeRewiew}
                  placeholder="Please select"
                  showSearch
                  onSearch={(value) => {}}
                />
              </div>
            ),
          ]
        ),
        getItem('Delete Items ', 'sub85', <DeleteOutlined />, [
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error('Please select Items.');
                  return;
                }
                const companyID = localStorage.getItem('companyID');
                const result = await dispatch(
                  deleteRequirementsByIds({
                    ids: selectedRowKeys,
                    companyID: companyID || '',
                    projectID: projectTaskData?.projectId || '',
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  setSelectedRowKeys([]);
                  const result = await dispatch(
                    getFilteredRequirements({
                      companyID: companyID || '',
                      projectId: projectTaskData?.projectId || '',
                      projectTaskID: projectTaskData?._id,
                    })
                  );
                  setRequirements(result.payload);
                }
              }}
            >
              Selected Items
            </div>,
            '5.18'
          ),
          getItem(
            <div
              onClick={async () => {
                const companyID = localStorage.getItem('companyID');
                const result = await dispatch(
                  deleteRequirementsByIds({
                    ids: extractIds(materialsRequirements),
                    companyID: companyID || '',
                    projectID: projectTaskData?.projectId || '',
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  setSelectedRowKeys([]);
                  const result = await dispatch(
                    getFilteredRequirements({
                      companyID: companyID || '',
                      projectId: projectTaskData?.projectId || '',
                      projectTaskID: projectTaskData?._id,
                    })
                  );
                  setRequirements(result.payload);
                }
              }}
            >
              All Items
            </div>,
            '5.1827'
          ),
        ]),
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
              onClick={() =>
                selectedRowKeys &&
                selectedRowKeys.length > 0 &&
                exportToExcel(
                  false,
                  selectedRowKeys,
                  visibleColumns,
                  materialsRequirements,
                  `Filtred-RequirementItems-${data.aplicationName}`
                )
              }
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
    {
      label: `${t('ISSUE PICKSLIP')}`,
      key: 'matirialAplication',
      icon: null,
      children: [
        getItem(
          <div
            onClick={async () => {
              const selectedCount = selectedRowKeys && selectedRowKeys.length;
              if (selectedCount < 1) {
                message.error('Please select Items.');
                return;
              }
              setOpenNewMatRequestDrawer(true);
            }}
          >
            Add Selected Items
          </div>,
          '5.18'
        ),
        // ]),
      ],
    },
  ];
  const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>(
    'bottom'
  );
  const [openNewMatRequestDrawer, setOpenNewMatRequestDrawer] = useState(false);
  const [issuedFormData, setIssuedFormData] = useState({
    getFrom: '',
    neededOn: '',
    remarks: '',
    plannedDate: null,
  });
  // Функция для создания новой записи
  const recordId = useRef<null | any>(null);
  const handleFieldsChange = (fields: any) => {
    // Обрабатываем изменение полей здесь
    console.log(fields);
    setIssuedFormData(fields);
  };
  return (
    <>
      {' '}
      <ModalForm
        title={`PART REQUEST`}
        // size={'large'}
        width={'70vw'}
        // placement={'bottom'}
        open={openNewMatRequestDrawer}
        // submitter={false}
        onOpenChange={setOpenNewMatRequestDrawer}
        onFinish={async () => {
          // actionRef.current?.reload();
          const updatedTableData = tableData.map((item: any) => {
            if (typeof item === 'object' && item !== null) {
              return {
                ...(item as object), // Явно указываем, что item является объектом
                updateDate: new Date(),
                updateUserID: USER_ID || '',
                // requestQuantity: item?.amout,
              };
            }
            handleSelectedRowKeysChange([]);
            return item;
          });
          const result = await dispatch(
            createProjectTaskMaterialAplication({
              materials: tableData,
              createDate: new Date(),
              createUserId: USER_ID || '',
              projectTaskId: projectTaskData?._id,
              projectId: projectTaskData?.projectId || '',
              projectWO: projectTaskData?.projectWO,
              projectTaskWO: projectTaskData?.projectTaskWO,
              planeType: projectTaskData?.plane.type,
              registrationNumber: projectTaskData?.plane.registrationNumber,
              status: 'issued',
              companyID: projectTaskData?.companyID || '',
              taskNumber: projectTaskData?.taskNumber,
              plannedDate: issuedFormData && issuedFormData?.plannedDate,
              getFrom: issuedFormData && issuedFormData?.getFrom,
              remarks: issuedFormData && issuedFormData?.remarks,
              neededOn: issuedFormData && issuedFormData?.neededOn,
            })
          );
          if (result.meta.requestStatus === 'fulfilled') {
            const updatedMaterialsData = result.payload.materials.map(
              (item: any) => {
                if (typeof item === 'object' && item !== null) {
                  return {
                    ...(item as object), // Явно указываем, что item является объектом
                    materialOrderID: result.payload.id || result.payload._id,
                    // status: 'onOrder',

                    // requestQuantity: item?.amout,
                  };
                }
                return item;
              }
            );

            const result1 = await dispatch(
              updateRequirementsByBody({
                companyID: projectTaskData?.companyID || '',
                newData: {
                  updatedMaterialsData,
                },
                status: 'onOrder',
                plannedDate: issuedFormData.plannedDate,
                neededOn: issuedFormData.neededOn,
              })
            );
          }

          if (result.meta.requestStatus === 'fulfilled') {
            const result = await dispatch(
              getFilteredRequirements({
                companyID: projectTaskData?.companyID || '',
                projectId: projectTaskData?.projectId || '',
                projectTaskID: projectTaskData?._id,
              })
            );
            setRequirements(result.payload);
            setInitialRequirements(result.payload);
            handleSelectedRowKeysChange([]);
            setTableKey(Math.random()); // Изменение ключа, чтобы пересоздать таблицу
          }

          message.success('PARTS IISUED SUCCESSFULLY ');

          return true;
        }}
        // getContainer={false}
      >
        <AddMatirialRequestList
          onFieldsChange={handleFieldsChange}
          handleTableDataChange={handleTableDataChange}
          projectTaskData={projectTaskData || null}
          scroll={43}
          isLoading={isLoading}
          ids={selectedRowKeys}
          onReqClick={function (record: any): void {
            throw new Error('Function not implemented.');
          }}
        ></AddMatirialRequestList>
      </ModalForm>
      <div className="flex my-0 mx-auto flex-col relative overflow-hidden">
        <EditableTable
          key={tableKey}
          recordCreatorProps={
            position !== 'hidden'
              ? {
                  position: position as 'top',

                  record: () => {
                    const id = Date.now();
                    recordId.current = id; // Сохраняем ID в ref

                    return {
                      id: id,
                      projectID: projectTaskData?.projectId || '',
                      companyID: projectTaskData?.companyID,
                      createDate: new Date(),
                      createUserID: USER_ID || '',
                      status: 'open',
                      cascader: ['ed', 'check'],
                      rewiewStatus: 'waiting',
                      isNew: true,
                      // plannedDate: new Date(),
                    };
                  },
                  creatorButtonText: 'ADD NEW PART REQUEST',
                }
              : false
          }
          data={materialsRequirements}
          initialColumns={initialColumns}
          isLoading={isLoading}
          menuItems={items}
          onRowClick={function (record: any): void {
            console.log(record);
          }}
          isSelectable={(record) =>
            !(
              record.status === 'onCheack' ||
              record.status === 'closed' ||
              // 'canceled'

              record.amout <= record.requestQuantity ||
              record.amount <= 0
            )
          }
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
                  projectID: projectTaskData?.projectId || '',
                  projectTaskID: projectTaskData?._id,
                  quantity: data.amout,
                  alternative: data.alternative,
                  unit: selectedObject.UNIT_OF_MEASURE,
                  group: selectedObject.GROUP,
                  type: selectedObject.TYPE,
                  description: selectedObject.DESCRIPTION || '',
                  partNumber: selectedObject.PART_NUMBER || '',
                  isNewAdded: false,
                  createDate: new Date(),
                  taskNumber: projectTaskData?.taskNumber || '',
                  issuedQuantity: 0,
                  plannedDate: data.plannedDate || new Date(),
                  registrationNumber: projectTaskData?.plane.registrationNumber,
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
                const resultTask = await dispatch(
                  updateProjectTask({
                    id: projectTaskData?._id,
                    requirementItemsIds: [
                      ...(projectTaskData &&
                      Array.isArray(projectTaskData.requirementItemsIds)
                        ? projectTaskData.requirementItemsIds
                        : []),
                      result.payload._id,
                    ],
                  })
                );
                if (resultTask.meta.requestStatus === 'fulfilled') {
                  const index = projectTasks.findIndex(
                    (task) => task._id === projectTaskData?._id
                  );
                  dispatch(
                    setUpdatedProjectTask({
                      task: resultTask.payload,
                      index: index,
                    })
                  );
                }
                const result1 = await dispatch(
                  getFilteredRequirements({
                    companyID: companyID || '',
                    projectId: projectTaskData?.projectId || '',
                    projectTaskID: projectTaskData?._id,
                  })
                );
                if (result1.meta.requestStatus === 'fulfilled') {
                  setRequirements(result1.payload);
                  setInitialRequirements(result1.payload);
                }
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
                  projectID: projectTaskData?.projectId || '',
                  updateDate: new Date(),
                  amout: data.amout,
                  alternative: data.alternative,
                  unit: data.UNIT_OF_MEASURE,
                  nameOfMaterial: selectedObject.DESCRIPTION,
                  PN: selectedObject.PART_NUMBER,
                  plannedDate: data.plannedDate,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                setSelectedObject({
                  PART_NUMBER: '',
                  QUANTITY: 0,
                  DESCRIPTION: '',
                  UNIT_OF_MEASURE: '',
                });
                const result1 = await dispatch(
                  getFilteredRequirements({
                    companyID: companyID || '',
                    projectId: projectTaskData?.projectId || '',
                    projectTaskID: projectTaskData?._id,
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
          onSelectedRowKeysChange={handleSelectedRowKeysChange}
          onVisibleColumnsChange={handleVisibleColumnsChange}
          externalReload={async function (): Promise<void> {
            try {
              const companyID = localStorage.getItem('companyID');
              const result = await dispatch(
                getFilteredRequirements({
                  companyID: companyID || '',
                  projectId: projectTaskData?.projectId || '',
                  projectTaskID: projectTaskData?._id,
                })
              );
            } catch (error) {
              console.error(error);
            }
          }}
        ></EditableTable>
      </div>{' '}
    </>
  );
};

export default RequirementItems;
