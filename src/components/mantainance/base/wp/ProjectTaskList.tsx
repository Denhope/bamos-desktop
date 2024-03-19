import {
  Cascader,
  ConfigProvider,
  Divider,
  Drawer,
  MenuProps,
  Popover,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  message,
} from 'antd';

import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';

import { FC, useEffect, useRef, useState } from 'react';

import {
  getFilteredProjectTasks,
  updateProjectTask,
  updateProjectTasksByIds,
} from '@/utils/api/thunks';
import { DatePicker } from 'antd';

import {
  DownloadOutlined,
  StopOutlined,
  SettingOutlined,
  PlusOutlined,
  PrinterOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { TDifficulty } from '@/models/IAdditionalTask';
import { exportToExcel, tagInfo } from '@/services/utilites';
import React from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { IProjectTask } from '@/models/IProjectTaskMTB';
import NavigationPanel from '@/components/shared/NavigationPanel';
import DrawerPanel from '@/components/shared/DrawerPanel';

import {
  setCurrentAction,
  setCurrentActionIndexMtb,
  setCurrentProjectTask,
  setUpdatedProjectTask,
} from '@/store/reducers/MtbSlice';
import TabContent from '@/components/shared/Table/TabContent';
import TaskDetails from './activeTask/Details';

import StepsContent from './activeTask/steps/StepsContent';
import {
  ActionType,
  ColumnsState,
  ModalForm,
  ProColumns,
} from '@ant-design/pro-components';
import { IPlaneTask } from '@/models/ITask';
import ProjectDescription from './ProjectDescription';
import EditableTable from '@/components/shared/Table/EditableTable';
import { useColumnSearchProps } from '@/components/shared/Table/columnSearch';
import { IProjectResponce } from '@/models/IProject';
import CloseContent from './activeTask/close/CloseContent';
import NRCStepForm from './activeTask/addNRC/NRCStepForm';
import WOEditForm from './WOEditForm';
import { DefaultOptionType } from 'antd/es/cascader';
import GroupAddForm from './GroupAddForm';
import RequirementItems from './activeTask/requeriments/RequirementItems';
import IssuedMatForm from './activeTask/requeriments/IssuedMatForm';
import GeneretedWOPdf from '@/components/pdf/GeneretedWOPdf';
import GeneretedWOPdfCurr from '@/components/pdf/GeneretedWOPdfCurr';

// import Store from '@/components/pages/Store';

export interface IProjectTaskListPrors {
  filter: TDifficulty;
}

const ProjectTaskList: FC<IProjectTaskListPrors> = ({}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const companyID = localStorage.getItem('companyID');
  const { RangePicker } = DatePicker;
  const [dataSource, setDataSource] = useState<any[]>([]);

  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const { currentProjectTask } = useTypedSelector((state) => state.mtbase);
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const { language } = useTypedSelector((state) => state.userPreferences);
  const [requirementRecord, setRequirementRecord] = useState(false);

  const [requirementDrawer, setOpenRequirementDrawer] = useState(false);
  const [issuedRecord, setIssuedRecord] = useState(false);
  const [issuedtDrawer, setOpenIssuedDrawer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [openWOInfoDrawer, setOpenWOInfoDrawer] = useState(false);
  const [openAddGroupForm, setOpenAddGroupForm] = useState(false);

  const onClose = () => {
    setOpenWOInfoDrawer(false);
  };
  const onReqClick = (record: any) => {
    setRequirementRecord(record);
    setOpenRequirementDrawer(true);
  };
  const onIssuedClick = (record: any) => {
    setIssuedRecord(record);
    setOpenIssuedDrawer(true);
  };
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  useEffect(() => {
    const fetchData = async () => {
      const companyID = localStorage.getItem('companyID');

      if (companyID) {
        const result = await dispatch(
          getFilteredProjectTasks({
            projectId: currentProject?._id || '',
          })
        );
        setDataSource(result.payload);
      }
    };
    fetchData();
  }, []);
  const {
    projectTasks,
    isLoading,
    isLoadingReq,
    currentProject,
    projectGroups,
  } = useTypedSelector((state) => state.mtbase);

  useEffect(() => {
    setDataSource(projectTasks);
  }, [projectTasks]);

  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };
  const newMenuItems = projectGroups.map(
    (group) =>
      group.status &&
      group.status == 'open' &&
      selectedRowKeys.length > 0 &&
      getItem(
        group.status == 'open' && (
          <div
            onClick={async () => {
              const result = await dispatch(
                updateProjectTasksByIds({
                  projectGroprojectGroupID: group._id,
                  ids: selectedRowKeys,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                message.success('Task upload');
              }
            }}
          >
            {group.groupName}
          </div>
        ),
        group.groupName
      )
  );
  interface Option {
    value: string;
    label: string;
    children?: Option[];
    disabled?: boolean;
  }

  const options: Option[] = [
    {
      value: 'mec',
      label: 'MEC',
      children: [
        {
          value: 'accessOpen',
          label: 'ACCESS OPEN',
        },
        {
          value: 'accessClose',
          label: 'ACCESS CLOSE',
        },
      ],
    },
    {
      value: 'cab',
      label: 'CAB',
      children: [
        {
          value: 'accessOpen',
          label: 'ACCESS OPEN',
        },
        {
          value: 'accessClose',
          label: 'ACCESS CLOSE',
        },
      ],
    },
    {
      value: 'avi',
      label: 'AVI',
      children: [
        {
          value: 'accessOpen',
          label: 'ACCESS OPEN',
        },
        {
          value: 'accessClose',
          label: 'ACCESS CLOSE',
        },
      ],
    },
    {
      value: 'srs',
      label: 'SRS',
      children: [
        {
          value: 'accessOpen',
          label: 'ACCESS OPEN',
        },
        {
          value: 'accessClose',
          label: 'ACCESS CLOSE',
        },
      ],
    },
    {
      value: 'ndt',
      label: 'NDT',
      children: [
        {
          value: 'accessOpen',
          label: 'ACCESS OPEN',
        },
        {
          value: 'accessClose',
          label: 'ACCESS CLOSE',
        },
      ],
    },

    {
      value: 'pnt',
      label: 'PNT',
      children: [
        {
          value: 'accessOpen',
          label: 'ACCESS OPEN',
        },
        {
          value: 'accessClose',
          label: 'ACCESS CLOSE',
        },
      ],
    },

    {
      value: 'ED',
      label: 'ED',
      children: [
        {
          value: 'accessOpen',
          label: 'ACCESS OPEN',
        },
        {
          value: 'accessClose',
          label: 'ACCESS CLOSE',
        },
      ],
    },
    {
      value: 'QI',
      label: 'QI',
      children: [
        {
          value: 'accessOpen',
          label: 'ACCESS OPEN',
        },
        {
          value: 'accessClose',
          label: 'ACCESS CLOSE',
        },
      ],
    },
    {
      value: 'OUT A/C',
      label: 'OUT A/C',
      children: [
        {
          value: 'accessOpen',
          label: 'ACCESS OPEN',
        },
        {
          value: 'accessClose',
          label: 'ACCESS CLOSE',
        },
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
    const result = await dispatch(
      updateProjectTasksByIds({
        cascader: value,
        ids: selectedRowKeys,
      })
    );
    if (result.meta.requestStatus === 'fulfilled') {
      selectedRowKeys.forEach((rowKey) => {
        const index = projectTasks.findIndex((task) => task._id === rowKey);
        if (index !== -1) {
          const updatedTask = result.payload.find(
            (task: any) => task._id === rowKey
          );
          if (updatedTask) {
            dispatch(
              setUpdatedProjectTask({
                index: index,
                task: {
                  ...projectTasks[index],
                  cascader: [value],
                },
              })
            );
          }
        }
      });
    }
  };
  const onChangeRewiew: any['props']['onChange'] = async (
    value: any,
    selectedOptions: any
  ) => {
    const selectedCount = selectedRowKeys && selectedRowKeys.length;
    if (selectedCount < 1) {
      message.error('Please select Items.');
      return;
    }
    const result = await dispatch(
      updateProjectTasksByIds({
        rewiewStatus: value,
        ids: selectedRowKeys,
      })
    );
    if (result.meta.requestStatus === 'fulfilled') {
      selectedRowKeys.forEach((rowKey) => {
        const index = projectTasks.findIndex((task) => task._id === rowKey);
        if (index !== -1) {
          const updatedTask = result.payload.find(
            (task: any) => task._id === rowKey
          );
          if (updatedTask) {
            dispatch(
              setUpdatedProjectTask({
                index: index,
                task: {
                  ...projectTasks[index],
                  rewiewStatus: value,
                },
              })
            );
          }
        }
      });
    }
  };

  const filter = (inputValue: string, path: DefaultOptionType[]) =>
    path.some(
      (option) =>
        (option.label as string)
          .toLowerCase()
          .indexOf(inputValue.toLowerCase()) > -1
    );
  const optionsRewiew = [
    {
      label: 'READY FOR PERFORM',
      value: 'readyForPer',
    },
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
  const optionsSkill = [
    { field: 'MEC', value: 'MEC' },
    { field: 'CAB', value: 'CAB' },
    { label: 'AVI', value: 'AVI' },
    { label: 'SRC', value: 'SRC' },
    { label: 'NDT', value: 'NDT' },
    { label: 'PNT', value: 'PNT' },
    { label: 'ED', value: 'ED' },
    { label: 'QI', value: 'QI' },
    { label: 'QUT A/C', value: 'OUT' },
  ];
  const cascaderOptions = [
    {
      field: 'MEC',
      value: 'mec',
      language: [
        {
          field: 'ACCESS OPEN',
          value: 'accessOpen',
        },
        {
          field: 'ACCESS CLOSE',
          value: 'accessClose',
        },
      ],
    },

    {
      field: 'CAB',
      value: 'cab',
      language: [
        {
          field: 'ACCESS OPEN',
          value: 'accessOpen',
        },
        {
          field: 'ACCESS CLOSE',
          value: 'accessClose',
        },
      ],
    },
    {
      field: 'AVI',
      value: 'avi',
      language: [
        {
          field: 'ACCESS OPEN',
          value: 'accessOpen',
        },
        {
          field: 'ACCESS CLOSE',
          value: 'accessClose',
        },
      ],
    },
    {
      field: 'SRS',
      value: 'srs',
      language: [
        {
          field: 'ACCESS OPEN',
          value: 'accessOpen',
        },
        {
          field: 'ACCESS CLOSE',
          value: 'accessClose',
        },
      ],
    },
    {
      field: 'NDT',
      value: 'ndt',
      language: [
        {
          field: 'ACCESS OPEN',
          value: 'accessOpen',
        },
        {
          field: 'ACCESS CLOSE',
          value: 'accessClose',
        },
      ],
    },

    {
      field: 'PNT',
      value: 'pnt',
      language: [
        {
          field: 'ACCESS OPEN',
          value: 'accessOpen',
        },
        {
          field: 'ACCESS CLOSE',
          value: 'accessClose',
        },
      ],
    },
    {
      field: 'ED',
      value: 'ed',
      language: [
        {
          field: 'ACCESS OPEN',
          value: 'accessOpen',
        },
        {
          field: 'ACCESS CLOSE',
          value: 'accessClose',
        },
      ],
    },
    {
      field: 'QI',
      value: 'qi',
      language: [
        {
          field: 'ACCESS OPEN',
          value: 'accessOpen',
        },
        {
          field: 'ACCESS CLOSE',
          value: 'accessClose',
        },
      ],
    },
    {
      field: 'OUT A/C',
      value: 'out',
      language: [
        {
          field: 'ACCESS OPEN',
          value: 'accessOpen',
        },
        {
          field: 'ACCESS CLOSE',
          value: 'accessClose',
        },
      ],
    },
  ];
  const initialBlockColumns: ProColumns<any>[] = [
    {
      title: 'LABEL',
      dataIndex: 'LOCAL_ID',
      // valueType: 'index',
      ellipsis: true,
      key: 'LOCAL_ID',
      width: '12%',

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
            {record.ID}
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
      title: `${t('DESCRIPTION')}`,
      dataIndex: 'NAME_OF_MATERIAL',
      key: 'NAME_OF_MATERIAL',
      // responsive: ['sm'],
      tooltip: 'Text Show',
      ellipsis: true, //
      // width: '20%',
    },
    {
      title: `${t('QUANTITY')}`,
      dataIndex: 'QUANTITY',
      key: 'QUANTITY',
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
      title: 'B/S NUMBER',
      dataIndex: 'BATCH_ID',
      key: 'BATCH_ID',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: 'STOCK',
      dataIndex: 'STOCK',
      key: 'BATCH_ID',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
    {
      title: `${t('DOC')}`,
      dataIndex: 'DOC',
      key: 'DOC',
      editable: (text, record, index) => {
        return false;
      },
      search: false,
    },
  ];

  const initialColumns: ProColumns<any>[] = [
    {
      title: '',
      dataIndex: ['readyStatus', 'status'],
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
          record?.readyStatus && record.readyStatus.status === 'not Ready'
            ? 'red'
            : 'green';
        return (
          <>
            <Tooltip
              title={
                <>
                  <div>
                    material Status:{' '}
                    {record?.readyStatus && record.readyStatus.materialStatus}
                  </div>
                  <div>
                    access Status:{' '}
                    {record?.readyStatus && record.readyStatus.accessStatus}
                  </div>
                </>
              }
            >
              {' '}
              <Tag
                color={color}
                style={{ borderRadius: '50%', width: '16px', height: '16px' }}
              />{' '}
            </Tooltip>
          </>
        );
      },
    },
    {
      title: `${t('W/O')}`,
      dataIndex: 'projectTaskWO',
      key: 'projectTaskWO',
      width: '5%',
      editable: (text, record, index) => {
        return false;
      },

      sorter: (a, b) => (a.projectTaskWO || 0) - (b.projectTaskWO || 0),
      render: (text: any, record: any) => {
        return (
          <>
            <a
              onClick={() => {
                dispatch(setCurrentProjectTask(record));
                setOpenTaskDrawer(true);
              }}
            >
              {record.projectTaskWO && record.projectTaskWO}
            </a>
          </>
        );
      },
      ...useColumnSearchProps({
        dataIndex: 'projectTaskWO',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = dataSource.filter((item) =>
              item.projectTaskWO
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setDataSource(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setDataSource(projectTasks);
          }
        },
        data: dataSource,
      }),
    },
    {
      title: `${t('TASK')}`,

      dataIndex: 'taskNumber',
      key: 'taskNumber',
      editable: (text, record, index) => {
        return false;
      },
      // responsive: ['lg'],
      width: '6%',
      onFilter: true,
      ...useColumnSearchProps({
        dataIndex: 'taskNumber',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = dataSource.filter((item) =>
              item.taskNumber
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setDataSource(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setDataSource(projectTasks);
          }
        },
        data: dataSource,
      }),
    },
    {
      title: `${t('DISCRIPTIONS')}`,
      dataIndex: 'taskDescription',
      key: 'taskDescription',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      tooltip: 'Text Show',
      // width: '30%',

      responsive: ['lg'],

      ...useColumnSearchProps({
        dataIndex: 'taskDescription',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = dataSource.filter((item) =>
              item.taskDescription
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setDataSource(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setDataSource(projectTasks);
          }
        },
        data: dataSource,
      }),
    },
    // {
    //   title: 'Task type',
    //   dataIndex: 'WOPackageType',
    //   key: 'WOPackageType',
    //   // responsive: ['lg'],
    //   width: '6%',
    //   editable: (text, record, index) => {
    //     return false;
    //   },

    //   ...useColumnSearchProps({
    //     dataIndex: 'WOPackageType',
    //     onSearch: (value) => {
    //       if (value) {
    //         // Отфильтруйте данные на основе поискового запроса
    //         const filteredData = dataSource.filter((item) =>
    //           item.WOPackageType.toString()
    //             .toLowerCase()
    //             .includes(value.toLowerCase())
    //         );
    //         // Обновление данных в таблице
    //         setDataSource(filteredData);
    //       } else {
    //         // Отобразите все данные, если поисковый запрос пуст
    //         setDataSource(projectTasks);
    //       }
    //     },
    //     data: dataSource,
    //   }),
    // },
    {
      title: `${t('REFERENCE')}`,
      dataIndex: 'amtoss',
      tooltip: 'REFERENCE',
      ellipsis: true,
      key: 'amtoss',
      responsive: ['lg'],
      width: '8%',
      editable: (text, record, index) => {
        return false;
      },
      ...useColumnSearchProps({
        dataIndex: 'amtoss',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = dataSource.filter((item) =>
              item.amtoss.toString().toLowerCase().includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setDataSource(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setDataSource(projectTasks);
          }
        },
        data: dataSource,
      }),
    },
    // {
    //   title: 'Phases',
    //   dataIndex: 'phase',
    //   key: 'phase',
    //   // width: '5%',
    //   tooltip: 'Phases maint',
    //   ellipsis: true,
    //   responsive: ['lg'],
    //   editable: (text, record, index) => {
    //     return false;
    //   },
    //   onFilter: true,
    //   valueType: 'select',
    //   filters: [
    //     { text: 'INCOMING TEST', value: 'INCOMING TEST' },
    //     { text: 'INSP WITHOUT ACCESS', value: 'INSP WITHOUT ACCESS' },
    //     { text: 'ACCESS OPENING', value: 'ACCESS OPENING' },
    //     { text: 'TEST WITH SPEC TOOL', value: 'TEST WITH SPEC TOOL' },
    //     { text: 'INSP WITH ACCESS', value: 'INSP WITH ACCESS' },
    //     { text: 'AD/SB/MOD', value: 'AD/SB/MOD' },
    //     { text: 'STR REPAIR', value: 'STR REPAIR' },
    //     { text: 'SERVICING', value: 'SERVICING' },
    //     { text: 'DI RECTIFICATION', value: 'DI RECTIFICATION' },
    //     { text: 'ACCESS CLOSING', value: 'ACCESS CLOSING' },
    //     { text: 'FINAL TEST', value: 'FINAL TEST' },
    //     { text: 'FINAL WORK', value: 'FINAL WORK' },
    //   ],

    //   filterSearch: true,
    // },
    // {
    //   title: `${t('SKILL')}`,
    //   dataIndex: 'skillCode',
    //   key: 'skill',
    //   width: '5%',
    //   tooltip: 'Skill code',
    //   ellipsis: true,
    //   responsive: ['lg'],
    //   editable: (text, record, index) => {
    //     return false;
    //   },
    //   onFilter: true,
    //   valueType: 'select',
    //   filters: [
    //     { text: 'MEC', value: 'MEC' },
    //     { text: 'CAB', value: 'CAB' },
    //     { text: 'AVI', value: 'AVI' },
    //     { text: 'SRC', value: 'SRC' },
    //     { text: 'NDT', value: 'NDT' },
    //     { text: 'PNT', value: 'PNT' },
    //   ],

    //   filterSearch: true,
    // },
    {
      title: `${t('CODE')}`,
      dataIndex: 'code',
      key: 'code',
      width: '4%',
      responsive: ['lg'],
      editable: (text, record, index) => {
        return false;
      },

      onFilter: true,
      valueType: 'select',
      // filters: [
      //   { text: 'FC', value: 'FC' },
      //   { text: 'RS', value: 'RS' },
      //   { text: 'GVI', value: 'GVI' },
      //   { text: 'DET', value: 'DET' },
      //   { text: 'VC', value: 'VC' },
      //   { text: 'LU', value: 'LU' },
      //   { text: 'OP', value: 'OP' },
      //   { text: 'SDI', value: 'SDI' },
      //   { text: 'OP', value: 'OP' },
      //   { text: 'NDT', value: 'NDT' },
      // ],
      filters: Array.from(
        new Set(
          // Замените `dataSource` на ваш исходный массив данных
          dataSource.map((item) => item.code)
        )
      ).map((value) => ({ text: value, value })),

      filterSearch: true,
    },
    {
      title: `${t('ZONE')}`,
      width: '5%',
      dataIndex: 'zonesArr',
      key: 'majoreZoneShort',
      editable: (text, record, index) => {
        return false;
      },
      render: (zonesArr) =>
        Array.isArray(zonesArr)
          ? [
              ...new Set(
                zonesArr.map(
                  (zone: { majoreZoneShort: string }) => zone.majoreZoneShort
                )
              ),
            ].join(', ')
          : '',
      filters: Array.from(
        new Set(
          dataSource.flatMap((item) =>
            Array.isArray(item.zonesArr)
              ? item.zonesArr.map(
                  (zone: { majoreZoneShort: string }) => zone.majoreZoneShort
                )
              : []
          )
        )
      ).map((value) => ({ text: value, value })),
      onFilter: (value, record) =>
        record.zonesArr.some(
          (zone: { majoreZoneShort: string }) => zone.majoreZoneShort === value
        ),
    },

    {
      title: `${t('ZONE ID')}`,
      dataIndex: 'area',

      key: 'area',
      width: '7%',

      ellipsis: true,
      responsive: ['lg'],
      editable: (text, record, index) => {
        return false;
      },
      ...useColumnSearchProps({
        dataIndex: 'area',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = dataSource.filter((item) =>
              item.area.toString().toLowerCase().includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setDataSource(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setDataSource(projectTasks);
          }
        },
        data: dataSource,
      }),
    },
    {
      title: `${t('ACCESS')}`,
      dataIndex: 'access',
      editable: (text, record, index) => {
        return false;
      },
      key: 'access',
      width: '5%',

      ellipsis: true,
      // responsive: ['lg'],
    },

    // {
    //   title: 'C/W Date',
    //   editable: (text, record, index) => {
    //     return false;
    //   },

    //   dataIndex: 'finishDate',
    //   key: 'finishDate',
    //   width: '7%',
    //   responsive: ['lg'],
    //   valueType: 'date',
    //   sorter: (a, b) => {
    //     if (a.finishDate && b.finishDate) {
    //       const aFinishDate = new Date(a.finishDate);
    //       const bFinishDate = new Date(b.finishDate);
    //       return aFinishDate.getTime() - bFinishDate.getTime();
    //     } else {
    //       return 0; // default value
    //     }
    //   },
    //   renderFormItem: () => {
    //     return <RangePicker />;
    //   },
    // },

    {
      title: `${t('PROGRESS')}`,
      dataIndex: 'status',

      key: 'status',
      width: '7%',
      editable: (text, record, index) => {
        return false;
      },

      filters: true,
      onFilter: true,
      valueType: 'select',
      filterSearch: true,
      valueEnum: {
        open: { text: t('OPEN'), status: 'Default' },
        inProgress: { text: t('IN_PROGRESS'), status: 'Processing' },
        closed: { text: t('CLOSED'), status: 'Success' },
        canceled: { text: t('CANCELED'), status: 'Error' },
      },
    },
    {
      title: `${t('TAGS')}`,
      dataIndex: 'restrictionArr',
      search: false,
      editable: (text, record, index) => {
        return false;
      },
      width: '8%',

      valueType: 'select',
      filters: Array.from(
        new Set(
          dataSource.flatMap((item) =>
            Array.isArray(item.restrictionArr) ? item.restrictionArr : []
          )
        )
      ).map((value) => ({ text: value, value })),
      onFilter: (value, record) => record.restrictionArr.includes(value),

      filterSearch: true,
      render: (_, record) => (
        <>
          {record.restrictionArr && record.restrictionArr.length > 0
            ? record.restrictionArr.map((tag: any) => {
                const info = tagInfo[tag] || { color: 'yellow' };
                return (
                  <Tooltip title={tag}>
                    <Tag className="text-xs" color={info.color} key={tag}>
                      {info.tagShort?.toUpperCase()}
                    </Tag>
                  </Tooltip>
                );
              })
            : null}
        </>
      ),
    },

    // {
    //   title: `${t('SKILL')}`,
    //   key: 'cascader',
    //   dataIndex: 'cascader',
    //   tooltip: 'Text Show',
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
    //         const filteredData = dataSource.filter((item) =>
    //           item.cascader
    //             .toString()
    //             .toLowerCase()
    //             .includes(value.toLowerCase())
    //         );
    //         // Обновление данных в таблице
    //         setDataSource(filteredData);
    //       } else {
    //         // Отобразите все данные, если поисковый запрос пуст
    //         setDataSource(projectTasks);
    //       }
    //     },
    //     data: dataSource,
    //   }),
    //   width: '6%',
    // },
    {
      title: `${t('NEXT SKILL')}`,
      key: 'cascader',
      dataIndex: 'cascader',
      // tooltip: 'Text Show',
      ellipsis: true,
      valueType: 'treeSelect',
      width: '7%',
      valueEnum: {
        AF: { text: 'AF' },
        AV: { text: 'AV' },
        CA: { text: 'CA' },
        EL: { text: 'EL' },
        EN: { text: 'EN' },
        RA: { text: 'RA' },
        UT: { text: 'UT' },
        SRC: { text: 'SRC' },
        NDT: { text: 'NDT' },
        PNT: { text: 'PNT' },
        ED: { text: 'ED' },
        QI: { text: 'QI' },
        OUT: { text: 'QUT A/C' },
      },
      filters: true,
      filterSearch: true,
      onFilter: true,
    },

    // {
    //   title: `${t('Status')}`,
    //   dataIndex: 'rewiewStatus',
    //   key: 'rewiewStatus',
    //   width: '6%',
    //   valueType: 'select',
    //   tooltip: 'Text Show',
    //   ellipsis: true,
    //   // initialValue: 'all',
    //   filters: true,
    //   filterSearch: true,
    //   onFilter: true,
    //   valueEnum: {
    //     // all: { text: 'all', status: 'Default' },

    //     readyForPer: { text: 'READY FOR PERFORM', status: 'Default' },
    //     waiting: { text: 'TO WAIT', status: 'Warning' },
    //     inProgress: { text: 'IN PROGRESS', status: 'Processing' },
    //     completed: { text: 'COMPLETED', status: 'SUCCESS' },
    //     canceled: { text: 'CANCELED', status: 'Error' },
    //   },
    // },
    {
      title: `${t('WAIT STATUS')}`,
      dataIndex: ['readyStatus', 'commonRestrStatus'],
      key: 'commonRestrStatus',
      width: '8%',
      valueType: 'select',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      filters: [
        { text: 'ACCESS', value: 'A' },
        { text: 'MATERIAL', value: 'M' },
        { text: 'TOOL', value: 'T' },
        { text: 'CONFIGURATION A/C', value: 'TR' },
        { text: 'READY TO PERF', value: 'ready' },
      ],
      onFilter: (value, record) =>
        record?.readyStatus?.commonRestrStatus.includes(value),
      filterSearch: true,
      render: (_, record) => (
        <>
          {record?.readyStatus?.commonRestrStatus &&
          record?.readyStatus?.commonRestrStatus.length > 0 ? (
            record?.readyStatus?.commonRestrStatus.map((tag: any) => {
              let color;
              if (tag === 'M') {
                color = 'volcano';
              } else if (tag === 'A') {
                color = 'geekblue';
              } else if (tag === 'TR') {
                color = 'orange';
              } else {
                color = 'green';
              }
              return (
                <Tooltip
                  title={
                    tag === 'A' && record?.removeInslallItemsIds
                      ? record?.removeInslallItemsIds
                          .filter(
                            (item: { status: string }) =>
                              item.status === 'closed'
                          )
                          .map(
                            (item: { accessItemID: any }) =>
                              item.accessItemID.panel
                          )
                          .join(', ')
                      : tag === 'M' && record?.requirementItemsIds
                      ? record?.requirementItemsIds
                          .filter(
                            (item: { readyStatus: string }) =>
                              item.readyStatus == 'not Ready'
                            // ||
                            // item.status === 'onCheack' ||
                            // item.status === 'onPush'
                          )
                          .map(
                            (item: any) =>
                              `${item.PN} - ${item.nameOfMaterial}   ${item.amout}${item.unit};`
                          )
                          .join('\n')
                      : tag === 'TR' && record?.restrictionArr
                      ? record?.restrictionArr

                          .map((item: any) => `${item};`)
                          .join('\n')
                      : ''
                  }
                >
                  <Tag color={color} key={tag}>
                    {tag.toUpperCase()}
                  </Tag>
                </Tooltip>
              );
            })
          ) : (
            <Tag color="green">READY</Tag>
          )}
        </>
      ),
    },

    {
      title: `${t('NOTE')}`,
      dataIndex: 'note',
      key: 'note',
      render: (text) => {
        if (typeof text === 'string' && text.length > 1) {
          return (
            <Tooltip placement="top" title={text}>
              <Tag color={'red'}>{'note'}</Tag>
            </Tooltip>
          );
        } else {
          return '-';
        }
      },
      width: '4%',
      filters: [{ text: 'Note', value: true }],
      onFilter: (value, record) => {
        if (value) {
          return !!record.note;
        } else {
          return true;
        }
      },
    },
    {
      title: `${t('OPTION')}`,
      valueType: 'option',
      key: 'option',
      width: '5%',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record._id);
          }}
        >
          Edit
        </a>,
      ],
    },
  ];

  const rowClassName = (record: IProjectTask) => {
    return record._id === selectedRowKey
      ? 'cursor-pointer text-sm text-transform: uppercase bg-blue-100 '
      : 'cursor-pointer  text-sm text-transform: uppercase ';
  };
  const [columns, setColumns] = useState(initialColumns);

  const [selectedColumns, setSelectedColumns] = useState(
    columns.map((column: any) => column.key)
  );

  // const [visibleColumns, setVisibleColumns] = useState<string[]>(
  //   initialColumns.map((column: any) => column.key)
  // );

  // const handleColumnsStateChange = (
  //   columnsState: Record<string, ColumnsState>
  // ) => {
  //   const visibleColumns = Object.entries(columnsState)
  //     .filter(([key, value]) => value.show)
  //     .map(([key, value]) => key);
  //   setVisibleColumns(visibleColumns);
  // };

  const handleMenuClick = (e: { key: React.Key }) => {
    if (selectedColumns.includes(e.key)) {
      setSelectedColumns(selectedColumns.filter((key: any) => key !== e.key));
    } else {
      setSelectedColumns([...selectedColumns, e.key]);
    }
  };

  // const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
  //   console.log('selectedRowKeys changed: ', newSelectedRowKeys);
  //   setSelectedRowKeys(newSelectedRowKeys);
  // };

  // const rowSelection = {
  //   selectedRowKeys,
  //   onChange: onSelectChange,
  // };
  const showDrawer = () => {
    setOpenWOInfoDrawer(true);
  };
  const [openEditWOForm, setOpenEditWOForm] = useState(false);
  // const [openEditTaskForm, setOpenEditTaskForm] = useState(false);
  const [openTaskDrawer, setOpenTaskDrawer] = useState(false);
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
    // {
    //   label: 'Add New Task',
    //   key: 'add',
    //   icon: <PlusOutlined />,
    //   // onClick: () => {
    //   //   setOpenAddWOForm(true);
    //   // },
    // },

    {
      label: `${t('Report')}`,
      key: 'print',
      icon: null,
      children: [
        // getItem('Print Status Report', 'sub4', <PrinterOutlined />, [
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
          getItem(
            <div
            // onClick={() => setOpenAddAppForm(true)}
            >
              <PrinterOutlined /> MJSS
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
                  dataSource,
                  `Filtred-WOTasks-${currentProject?.projectName}`
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
                projectTasks.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  visibleColumns,
                  dataSource,
                  `ALL-WOTasks-${currentProject?.projectName}`
                )
              }
            >
              <DownloadOutlined /> All Items
            </div>,
            '5.2'
          ),
        ]),
        // ]),
      ],
    },

    {
      label: `${t('Actions')}`,
      key: 'actions',
      icon: null,
      children: [
        getItem('Add Selected Task to Group', 'sub09', '', [
          getItem(
            <>
              <div onClick={() => setOpenAddGroupForm(true)}>
                <PlusOutlined /> New Group<Divider></Divider>
              </div>
            </>,
            '9ss'
          ),

          ...newMenuItems,
        ]),
        getItem(
          <div
          // onClick={() => setOpenAddAppForm(true)}
          >
            <EditOutlined /> Edit selected Item
          </div>,
          '9sshsssswishhxs'
        ),
        // getItem(
        //   <div
        //   // onClick={(e) => {
        //   //   e.stopPropagation();
        //   //   // setOpenAddAppForm(true);
        //   // }}
        //   >
        //     Update Skill selected Item
        //   </div>,
        //   'updateSkill',
        //   '',
        //   [
        //     getItem(
        //       <div
        //         onClick={(e) => {
        //           e.stopPropagation();
        //         }}
        //       >
        //         <Cascader
        //           options={options}
        //           onChange={onChange}
        //           placeholder="Please select"
        //           showSearch={{ filter }}
        //           onSearch={(value) => {}}
        //         />
        //       </div>
        //     ),
        //   ]
        // ),
        getItem(
          <div
          // onClick={(e) => {
          //   e.stopPropagation();
          //   // setOpenAddAppForm(true);
          // }}
          >
            Update Skill
          </div>,
          'updateSkill',
          '',
          [
            getItem(
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Select
                  options={[
                    { value: 'AF', label: 'AF' },
                    { value: 'AV', label: 'AV' },
                    { value: 'CA', label: 'CA' },
                    { value: 'EL', label: 'EL' },
                    { value: 'EN', label: 'EN' },
                    { value: 'RA', label: 'RA' },
                    { value: 'UT', label: 'UT' },
                    { value: 'SRC', label: 'SRC' },
                    { value: 'NDT', label: 'NDT' },
                    { value: 'PNT', label: 'PNT' },
                    { value: 'ED', label: 'ED' },
                    { value: 'QI', label: 'QI' },
                    { value: 'OUT', label: 'QUT A/C' },
                  ]}
                  onChange={onChange}
                  placeholder="Please select"
                  showSearch
                  onSearch={(value) => {}}
                />
              </div>
            ),
          ]
        ),
        getItem('Update Status selected items', 'subydd09', '', [
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error('Please select  Items.');
                  return;
                }
                // console.log(selectedRowKeys);
                const result = await dispatch(
                  updateProjectTasksByIds({
                    status: 'inProgress',
                    ids: selectedRowKeys,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  selectedRowKeys.forEach((rowKey) => {
                    const index = projectTasks.findIndex(
                      (task) => task._id === rowKey
                    );
                    if (index !== -1) {
                      const updatedTask = result.payload.find(
                        (task: any) => task._id === rowKey
                      );
                      if (updatedTask) {
                        dispatch(
                          setUpdatedProjectTask({
                            index: index,
                            task: {
                              ...projectTasks[index],
                              status: 'inProgress',
                            },
                          })
                        );
                      }
                    }
                  });
                }
              }}
            >
              In Progress
            </div>,
            '9sasyhqss'
          ),

          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error('Please select Items.');
                  return;
                }
                // console.log(selectedRowKeys);
                const result = await dispatch(
                  updateProjectTasksByIds({
                    status: 'canceled',
                    ids: selectedRowKeys,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  selectedRowKeys.forEach((rowKey) => {
                    const index = projectTasks.findIndex(
                      (task) => task._id === rowKey
                    );
                    if (index !== -1) {
                      const updatedTask = result.payload.find(
                        (task: any) => task._id === rowKey
                      );
                      if (updatedTask) {
                        dispatch(
                          setUpdatedProjectTask({
                            index: index,
                            task: {
                              ...projectTasks[index],
                              status: 'canceled',
                            },
                          })
                        );
                      }
                    }
                  });
                }
              }}
            >
              Canceled
            </div>,
            '9saqs46ms'
          ),
        ]),
        getItem(
          <div
            onClick={async () => {
              const selectedCount = selectedRowKeys && selectedRowKeys.length;
              if (selectedCount < 1) {
                message.error('Please select Items.');
                return;
              }
              // console.log(selectedRowKeys);
              const result = await dispatch(
                updateProjectTasksByIds({
                  status: 'open',
                  ids: selectedRowKeys,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                selectedRowKeys.forEach((rowKey) => {
                  const index = projectTasks.findIndex(
                    (task) => task._id === rowKey
                  );
                  if (index !== -1) {
                    const updatedTask = result.payload.find(
                      (task: any) => task._id === rowKey
                    );
                    if (updatedTask) {
                      dispatch(
                        setUpdatedProjectTask({
                          index: index,
                          task: {
                            ...projectTasks[index],
                            status: 'open',
                          },
                        })
                      );
                    }
                  }
                });
              }
            }}
          >
            <StopOutlined /> Reopen selected items
          </div>,
          '9ss2hhhxs'
        ),
      ],
    },

    {
      label: `${t('Print')}`,
      key: 'printAction',
      icon: null,
      children: [
        getItem(
          <div
            onClick={() => {
              const selectedCount = selectedRowKeys && selectedRowKeys.length;
              if (selectedCount < 1) {
                message.error('Please select Items.');
                return;
              }
            }}
          >
            Quick Print Work Card
          </div>,
          '9sstsssishhxs'
        ),
        getItem(
          <div
            onClick={() => {
              const selectedCount = selectedRowKeys && selectedRowKeys.length;
              if (selectedCount < 1) {
                message.error('Please select Items.');
                return;
              }
            }}
          >
            Print Work Card with options
          </div>,
          '9sshsssswishhxs'
        ),
      ],
    },
    // {
    //   label: 'Hot keys',
    //   key: 'keys',
    //   icon: null,
    //   children: [
    //     getItem(
    //       <div
    //         onClick={() => {
    //           const selectedCount = selectedRowKeys && selectedRowKeys.length;
    //           if (selectedCount < 1) {
    //             message.error('Please select Items.');
    //             return;
    //           }
    //         }}
    //       >
    //         Quick Perfomed Work Card
    //       </div>,
    //       '9sstsssishhxs'
    //     ),
    //     getItem(
    //       <div
    //         onClick={() => {
    //           const selectedCount = selectedRowKeys && selectedRowKeys.length;
    //           if (selectedCount < 1) {
    //             message.error('Please select Items.');
    //             return;
    //           }
    //         }}
    //       >
    //         Quick Inspected Work Card
    //       </div>,
    //       '9sshsssgsxtyswishhxs'
    //     ),
    //     getItem(
    //       <div
    //         onClick={() => {
    //           const selectedCount = selectedRowKeys && selectedRowKeys.length;
    //           if (selectedCount < 1) {
    //             message.error('Please select Items.');
    //             return;
    //           }
    //         }}
    //       >
    //         Quick Close Work Card
    //       </div>,
    //       '9sshsssklkgswishhxs'
    //     ),
    //     getItem(
    //       <div
    //         onClick={() => {
    //           const selectedCount = selectedRowKeys && selectedRowKeys.length;
    //           if (selectedCount < 1) {
    //             message.error('Please select Items.');
    //             return;
    //           }
    //         }}
    //       >
    //         Start User to Work
    //       </div>,
    //       '9sshssskdddlkgswishhxs'
    //     ),
    //     getItem(
    //       <div
    //         onClick={() => {
    //           const selectedCount = selectedRowKeys && selectedRowKeys.length;
    //           if (selectedCount < 1) {
    //             message.error('Please select Items.');
    //             return;
    //           }
    //         }}
    //       >
    //         Finish User to Work
    //       </div>,
    //       '9sshssskdddlkuygeeswishhxs'
    //     ),
    //   ],
    // },
  ];
  const taskItems: MenuProps['items'] = [
    {
      label: `${t('Actions')}`,
      key: 'actions',
      icon: <SettingOutlined />,
      children: [
        {
          label: `${'Print'}`,
          key: 'printAction',
          icon: null,
          children: [
            getItem(
              <div
              // onClick={() => setOpenAddAppForm(true)}
              >
                Print Work Card with options
              </div>,
              '9sshsssswishhxs'
            ),
            getItem(
              <div
              // onClick={() => setOpenAddAppForm(true)}
              >
                Print Material list
              </div>,
              '9sshsssswishhxs'
            ),
          ],
        },
        getItem(
          <div onClick={() => console.log('New Work Order open Form')}>
            <EditOutlined /> Edit in Data
          </div>,
          '9sssxxss'
        ),

        getItem('Update Status', 'subydd09', '', [
          getItem(
            <div
              onClick={async () => {
                // console.log(selectedRowKeys);
                const result = await dispatch(
                  updateProjectTask({
                    status: 'inProgress',
                    id: currentProjectTask?._id,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  setCurrentProjectTask(result.payload);
                  const companyID = localStorage.getItem('companyID');
                  const index = projectTasks.findIndex(
                    (task) => task._id === currentProjectTask?._id
                  );
                  if (index !== -1) {
                    dispatch(
                      setUpdatedProjectTask({
                        index: index,
                        task: result.payload,
                      })
                    );
                  }
                  message.success('Task successfully updated ');
                } else {
                  message.error('Task not updated');
                }
              }}
            >
              In Progress
            </div>,
            '9saqss'
          ),
          getItem(
            <div
              onClick={async () => {
                // console.log(selectedRowKeys);
                const result = await dispatch(
                  updateProjectTask({
                    status: 'open',
                    id: currentProjectTask?._id,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  setCurrentProjectTask(result.payload);
                  const companyID = localStorage.getItem('companyID');
                  const index = projectTasks.findIndex(
                    (task) => task._id === currentProjectTask?._id
                  );
                  if (index !== -1) {
                    dispatch(
                      setUpdatedProjectTask({
                        index: index,
                        task: result.payload,
                      })
                    );
                  }
                  message.success('Task successfully updated ');
                } else {
                  message.error('Task not updated');
                }
              }}
            >
              Open
            </div>,
            'open'
          ),
        ]),
      ],
    },
  ];
  const actionRef = useRef<ActionType>();
  const [selectedObject, setSelectedObject] = useState({
    PART_NUMBER: '',
    QUANTITY: 0,
    NAME_OF_MATERIAL: '',
  });

  return (
    // <div className="flex my-0 mx-auto flex-col  relative overflow-hidden">
    <div className="flex my-0 mx-auto flex-col  h-[77vh] relative overflow-hidden">
      <Row justify={'space-between'}>
        <Space className="">
          <EditOutlined
            onClick={() => setOpenEditWOForm(true)}
            className="cursor-pointer"
          />
          <Tooltip placement="top" title={currentProject?.planeNumber}>
            <a onClick={showDrawer}>{currentProject?.projectName}</a>
          </Tooltip>
        </Space>{' '}
        <Space>
          <>
            {t('Date In')}:{' '}
            {currentProject &&
              moment(currentProject?.startDate).format('DD-MMM-YYYY')}
          </>
        </Space>
        <Space>
          <>
            {t('Date Out')}:{' '}
            {currentProject &&
              moment(currentProject?.finishDate).format('DD-MMM-YYYY')}
          </>
        </Space>
      </Row>{' '}
      <EditableTable
        // showSearchInput={true}
        xScroll={1700}
        data={dataSource}
        initialColumns={initialColumns}
        menuItems={items}
        onRowClick={function (record: any): void {
          // console.log(record);
        }}
        onSave={async function (
          rowKey: any,
          data: any,
          row: any
        ): Promise<void> {
          const result = await dispatch(
            updateProjectTask({
              id: rowKey,
              rewiewStatus: data.rewiewStatus,
              cascader: data.cascader,
              note: data.note,
            })
          );
          if (result.meta.requestStatus === 'fulfilled') {
            const index = projectTasks.findIndex((task) => task._id === rowKey);
            if (index !== -1) {
              // console.log(index);
              // console.log(result.payload);
              dispatch(
                setUpdatedProjectTask({
                  index: index,
                  task: result.payload,
                })
              );
            }
          }
        }}
        yScroll={51}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onVisibleColumnsChange={handleVisibleColumnsChange}
        recordCreatorProps={false}
        externalReload={function (): Promise<void> {
          throw new Error('Function not implemented.');
        }}
        isLoading={isLoading}
      ></EditableTable>
      <Drawer
        title={false}
        placement="top"
        closable={false}
        onClose={onClose}
        open={openWOInfoDrawer}
        getContainer={false}
      >
        <ProjectDescription />
      </Drawer>
      <DrawerPanel
        title={`Edit WP: ${currentProject?.projectName}(W/O: ${currentProject?.projectWO})`}
        size={'medium'}
        placement={'right'}
        open={openEditWOForm}
        onClose={setOpenEditWOForm}
      >
        <WOEditForm selectedWOumber={currentProject?._id}></WOEditForm>
      </DrawerPanel>{' '}
      <ModalForm
        title={`ISSUE PICKSLIP INFORMARION`}
        size={'small'}
        // placement={'bottom'}
        open={requirementDrawer}
        submitter={false}
        onOpenChange={setOpenRequirementDrawer}
        width={'70vw'}
        // getContainer={false}
      >
        <></>
      </ModalForm>{' '}
      <ModalForm
        title={`ISSUE PICKSLIP INFORMARION`}
        size={'small'}
        // placement={'bottom'}
        open={issuedtDrawer}
        submitter={false}
        width={'70vw'}
        onOpenChange={setOpenIssuedDrawer}
        // getContainer={false}
      >
        <EditableTable
          data={issuedRecord || null}
          initialColumns={initialBlockColumns}
          isLoading={isLoading}
          menuItems={undefined}
          recordCreatorProps={false}
          onRowClick={function (record: any, rowIndex?: any): void {
            console.log(record);
          }}
          onSave={function (rowKey: any, data: any, row: any): void {
            console.log(rowKey);
          }}
          yScroll={26}
          externalReload={function (): Promise<void> {
            throw new Error('Function not implemented.');
          }}
          // onTableDataChange={}
        />
      </ModalForm>
      <IssuedMatForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        issuedRecord={undefined}
        isLoading={isLoading}
        menuItems={undefined}
        yScroll={0}
      />
      <DrawerPanel
        title={`Add New Group`}
        size={'medium'}
        placement={'right'}
        open={openAddGroupForm}
        onClose={setOpenAddGroupForm}
        getContainer={false}
      >
        <GroupAddForm
          projectID={currentProject?._id || ''}
          companyID={companyID || ''}
        ></GroupAddForm>
      </DrawerPanel>
      <DrawerPanel
        className="pt-5"
        title={`${currentProjectTask?.taskNumber?.toUpperCase()} ###${currentProjectTask?.taskDescription?.toUpperCase()}`}
        size={'large'}
        placement={'bottom'}
        onClose={() => {
          setOpenTaskDrawer(false);
          dispatch(setCurrentProjectTask(null));
          dispatch(setCurrentActionIndexMtb(0));
          dispatch(setCurrentAction(null));
          setSelectedObject({
            PART_NUMBER: '',
            QUANTITY: 0,
            NAME_OF_MATERIAL: '',
          });
        }}
        open={openTaskDrawer}
        getContainer={false}
        extra={
          <Row align={'middle'}>
            <Tag
              color={currentProjectTask?.status === 'closed' ? 'green' : 'red'}
            >
              {String(
                currentProjectTask?.status ? currentProjectTask?.status : ''
              ).toUpperCase()}
            </Tag>{' '}
            <div className=" ml-auto w-40">
              <NavigationPanel
                onMenuClick={handleMenuClick}
                columns={[]}
                selectedColumns={[]}
                menuItems={taskItems}
                selectedRows={[]}
                data={[]}
                sortOptions={[]}
                isSorting={false}
                isView={false}
              />
            </div>
          </Row>
        }
      >
        <TabContent
          tabs={[
            {
              content: (
                <>
                  <div className="flex col relative  overflow-hidden">
                    <TaskDetails task={currentProjectTask} />
                  </div>
                </>
              ),

              title: `${t('Details')}`,
            },
            {
              content: (
                <>
                  <div className="flex col relative overflow-hidden">
                    <RequirementItems
                      data
                      projectTaskData={currentProjectTask}
                      scroll={35}
                      isLoading={isLoadingReq}
                      onReqClick={onReqClick}
                      onIssuedClick={onIssuedClick}
                      selectedObjectParent={selectedObject}
                    />
                  </div>{' '}
                </>
              ),
              title: `${t('Requests/Parts')}`,
            },
            {
              content: <StepsContent task={currentProjectTask} />,
              title: `${t('Steps')}`,
            },
            {
              content: (
                <CloseContent
                  task={currentProjectTask}
                  upData={function (record: any): void {
                    throw new Error('Function not implemented.');
                  }}
                />
              ),
              title: `${t('Close Work Order')}`,
            },
            {
              content: (
                <NRCStepForm
                  disabled={currentProjectTask?.status !== 'inProgress'}
                  task={currentProjectTask}
                  projectTasks={projectTasks}
                />
              ),
              title: `${t('+ Add NRC')}`,
            },
            {
              content: <GeneretedWOPdfCurr task={currentProjectTask} />,
              title: `${t('Work Card')}`,
            },
          ]}
        />
      </DrawerPanel>
    </div>

    // </div>
  );
};

export default ProjectTaskList;
