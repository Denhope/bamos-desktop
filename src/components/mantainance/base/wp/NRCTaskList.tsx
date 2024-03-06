import {
  Cascader,
  Divider,
  Drawer,
  MenuProps,
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
  getFilteredAditionalTasks,
  updateAdditionalTask,
  updateProjectAdditionalTasksByIds,
  updateProjectTask,
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

import moment from 'moment';

import { IProjectTask } from '@/models/IProjectTaskMTB';
import NavigationPanel from '@/components/shared/NavigationPanel';
import DrawerPanel from '@/components/shared/DrawerPanel';
import WOEditForm from '@/components/mantainance/mtx/wo/WOEditForm';
import {
  setCurrentActionIndexMtb,
  setCurrentAdditionalAction,
  setCurrentAdditionalActionIndexMtb,
  setCurrentProjectAdditionalTask,
  setCurrentProjectTask,
  setUpdatedProjectAdditionalTask,
  setUpdatedProjectTask,
} from '@/store/reducers/MtbSlice';
import TabContent from '@/components/shared/Table/TabContent';
import TaskDetails from './activeTask/Details';

import {
  ActionType,
  ColumnsState,
  ProColumns,
} from '@ant-design/pro-components';
import { IPlaneTask } from '@/models/ITask';
import ProjectDescription from './ProjectDescription';
import EditableTable from '@/components/shared/Table/EditableTable';
import { useColumnSearchProps } from '@/components/shared/Table/columnSearch';
import { IProjectResponce } from '@/models/IProject';

import StepsContent from './activeNRC/steps/NRCStepsContent';
import CloseContent from './activeNRC/close/NRCCloseContent';
import { setCurrentAdditionalTask } from '@/store/reducers/AdditionalTaskSlice';
import { DefaultOptionType } from 'antd/es/cascader';
import RequirementItems from './activeTask/addNRC/RequirementItems';
import GeneretedNRCPdf from '@/components/pdf/GeneretedNRCPdf';
import { useTranslation } from 'react-i18next';
import Details from './activeNRC/Details';

// import Store from '@/components/pages/Store';

export interface IProjectTaskListPrors {
  filter: TDifficulty;
}

const NRCTaskList: FC<IProjectTaskListPrors> = ({}) => {
  const [requirementRecord, setRequirementRecord] = useState(false);
  const { isLoadingReq } = useTypedSelector((state) => state.mtbase);
  const [requirementDrawer, setOpenRequirementDrawer] = useState(false);
  const [issuedRecord, setIssuedRecord] = useState(false);
  const [issuedtDrawer, setOpenIssuedDrawer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const onReqClick = (record: any) => {
    setRequirementRecord(record);
    setOpenRequirementDrawer(true);
  };
  const onIssuedClick = (record: any) => {
    setIssuedRecord(record);
    setOpenIssuedDrawer(true);
  };
  const { t } = useTranslation();
  const optionsRewiew = [
    {
      label: 'BLANC',
      value: 'blanc',
    },

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
  const { RangePicker } = DatePicker;
  const [dataSource, setDataSource] = useState<any[]>([]);

  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);

  const [openWOInfoDrawer, setOpenWOInfoDrawer] = useState(false);
  const [openAddGroupForm, setOpenAddGroupForm] = useState(false);
  const filter = (inputValue: string, path: DefaultOptionType[]) =>
    path.some(
      (option) =>
        (option.label as string)
          .toLowerCase()
          .indexOf(inputValue.toLowerCase()) > -1
    );
  const onClose = () => {
    setOpenWOInfoDrawer(false);
  };
  const dispatch = useAppDispatch();
  useEffect(() => {
    const fetchData = async () => {
      const companyID = localStorage.getItem('companyID');

      if (companyID) {
        const result = await dispatch(
          getFilteredAditionalTasks({
            projectId: currentProject?._id || '',
            companyID: companyID,
          })
        );
        if (result.payload.length) {
          setDataSource(result.payload);
        } else setDataSource([]);
      }
    };
    fetchData();
  }, []);
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
      updateProjectAdditionalTasksByIds({
        cascader: value,
        ids: selectedRowKeys,
        projectId: currentProject?._id,
      })
    );
    if (result.meta.requestStatus === 'fulfilled') {
      selectedRowKeys.forEach((rowKey) => {
        const index = projectAdditionalTasks.findIndex(
          (task) => task._id === rowKey
        );
        if (index !== -1) {
          const updatedTask = result.payload.find(
            (task: any) => task._id === rowKey
          );
          if (updatedTask) {
            dispatch(
              setUpdatedProjectAdditionalTask({
                index: index,
                task: {
                  ...projectAdditionalTasks[index],
                  cascader: [value],
                },
              })
            );
          }
        }
      });
    }
  };
  const {
    projectAdditionalTasks,
    isLoading,
    currentProject,
    currentProjectAdditionalTask,
    currentProjectTask,
    projectGroups,
  } = useTypedSelector((state) => state.mtbase);

  useEffect(() => {
    setDataSource(projectAdditionalTasks);
  }, [projectAdditionalTasks]);

  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };

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
      dataIndex: 'additionalNumberId',
      key: 'additionalNumberId',
      width: '5%',
      editable: (text, record, index) => {
        return false;
      },
      sorter: (a, b) =>
        (a.additionalNumberId || 0) - (b.additionalNumberId || 0),
      render: (text: any, record: any) => {
        let color =
          record?.readyStatus && record?.readyStatus?.status === 'not Ready'
            ? 'red'
            : 'green';
        return (
          <a
            onClick={() => {
              dispatch(setCurrentProjectAdditionalTask(record));
              setOpenTaskDrawer(true);
            }}
          >
            {record.additionalNumberId && record.additionalNumberId}
          </a>
        );
      },
      ...useColumnSearchProps({
        dataIndex: 'additionalNumberId',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = dataSource.filter((item) =>
              item.additionalNumberId
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setDataSource(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setDataSource(projectAdditionalTasks);
          }
        },
        data: dataSource,
      }),
    },
    {
      title: `${t('TASK')}`,

      dataIndex: 'taskHeadLine',
      key: 'taskHeadLine',
      editable: (text, record, index) => {
        return false;
      },
      // responsive: ['lg'],
      width: '10%',
      onFilter: true,
      ...useColumnSearchProps({
        dataIndex: 'taskHeadLine',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = dataSource.filter((item) =>
              item.taskHeadLine
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            );
            // Обновление данных в таблице
            setDataSource(filteredData);
          } else {
            // Отобразите все данные, если поисковый запрос пуст
            setDataSource(projectAdditionalTasks);
          }
        },
        data: dataSource,
      }),
    },
    {
      title: `${t('DESCRIPTIONS')}`,
      dataIndex: 'taskDescription',
      key: 'taskDescription',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      tip: 'Text Show',

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
            setDataSource(projectAdditionalTasks);
          }
        },
        data: dataSource,
      }),
    },
    {
      title: `${t('NRC TYPE')}`,
      dataIndex: 'nrcType',
      key: 'nrcType',
      // responsive: ['lg'],
      width: '6%',

      editable: (text, record, index) => {
        return false;
      },
      render: (_, record) => (
        <Space>
          {record.nrcType && (
            <Tag color={'red'} key={record.nrcType}>
              {record.nrcType}
            </Tag>
          )}
        </Space>
      ),
      onFilter: true,
      filters: Array.from(
        new Set(
          // Проверьте, что dataSource существует и является массивом
          dataSource && Array.isArray(dataSource)
            ? dataSource.map((item) => item.nrcType)
            : []
        )
      ),
      filterSearch: true,

      // ...useColumnSearchProps({
      //   dataIndex: 'nrcType',

      //   onSearch: (value) => {
      //     if (value) {
      //       // Отфильтруйте данные на основе поискового запроса
      //       const filteredData = dataSource.filter((item) =>
      //         item.nrcType
      //           .toString()
      //           .toLowerCase()
      //           .includes(value.toLowerCase())
      //       );
      //       // Обновление данных в таблице
      //       setDataSource(filteredData);
      //     } else {
      //       // Отобразите все данные, если поисковый запрос пуст
      //       setDataSource(projectAdditionalTasks);
      //     }
      //   },
      //   data: dataSource,
      // }),
    },
    // {
    //   title: 'AMM',
    //   dataIndex: 'amtoss',
    //   tip: 'Text Show',
    //   ellipsis: true,
    //   key: 'amtoss',
    //   responsive: ['lg'],
    //   // width: '12%',
    //   editable: (text, record, index) => {
    //     return false;
    //   },
    //   ...useColumnSearchProps({
    //     dataIndex: 'amtoss',
    //     onSearch: (value) => {
    //       if (value) {
    //         // Отфильтруйте данные на основе поискового запроса
    //         const filteredData = dataSource.filter((item) =>
    //           item.amtoss.toString().toLowerCase().includes(value.toLowerCase())
    //         );
    //         // Обновление данных в таблице
    //         setDataSource(filteredData);
    //       } else {
    //         // Отобразите все данные, если поисковый запрос пуст
    //         setDataSource(projectAdditionalTasks);
    //       }
    //     },
    //     data: dataSource,
    //   }),
    // },
    {
      title: `${t('SKILL')}`,
      dataIndex: 'skill',
      key: 'skill',
      // ellipsis: true,
      width: '4%',
      responsive: ['lg'],
      editable: (text, record, index) => {
        return false;
      },
      // render: (_, record) => (
      //   <Space>
      //     {record.skill.map((item: any) => (
      //       <Tag color={'red'} key={item}>
      //         {item}
      //       </Tag>
      //     ))}
      //   </Space>
      // ),

      // onFilter: true,
      valueType: 'select',
      // filters: [
      //   { text: 'MEC', value: 'MEC' },
      //   { text: 'CAB', value: 'CAB' },
      //   { text: 'AVI', value: 'AVI' },
      //   { text: 'SRC', value: 'SRC' },
      //   { text: 'NDT', value: 'NDT' },
      //   { text: 'PNT', value: 'PNT' },
      //   { text: 'ED', value: 'ED' },
      //   { text: 'QI', value: 'QI' },
      //   { text: 'OP', value: 'OP' },
      //   { text: 'OUT', value: 'OUT' },
      // ],
      filters: Array.from(
        new Set(
          // Проверьте, что dataSource существует и является массивом
          dataSource && Array.isArray(dataSource)
            ? dataSource.map((item) => item.skill)
            : []
        )
      ).map((value) => ({ text: value, value })),
      onFilter: (value, record) => record.skill.includes(value),

      filterSearch: true,
    },
    {
      title: `${t('ZONE')}`,
      dataIndex: 'area',
      key: 'area',
      width: '5%',
      responsive: ['lg'],
      editable: (text, record, index) => {
        return false;
      },

      onFilter: true,
      valueType: 'select',
      filters: Array.from(
        new Set(
          // Проверьте, что dataSource существует и является массивом
          dataSource && Array.isArray(dataSource)
            ? dataSource.map((item) => item.area)
            : []
        )
      ).map((value) => ({ text: value, value })),

      filterSearch: true,
      // filters: [
      //   { text: 'FUS', value: 'FUS' },
      //   { text: 'WING', value: 'WING' },
      //   { text: 'TAIL', value: 'TAIL' },
      //   { text: 'POWER_PLANT', value: 'POWER_PLANT' },
      //   { text: 'LG', value: 'LG' },
      //   { text: 'CABIN', value: 'CABIN' },
      //   { text: 'FUEL_TANK', value: 'FUEL_TANK' },
      //   { text: 'TBD', value: 'TBD' },
      // ],
    },
    {
      title: `${t('SUB ZONE')}`,
      dataIndex: 'zone',

      key: 'zone',
      width: '7%',
      tip: 'Text Show',
      ellipsis: true,
      responsive: ['lg'],
      editable: (text, record, index) => {
        return false;
      },
      onFilter: true,
      // filters: [
      //   { text: 'EXT UPPER', value: 'EXT UPPER' },
      //   { text: 'EXT LOWER', value: 'EXT LOWER' },
      //   { text: 'COCKPIT', value: 'COCKPIT' },
      //   { text: 'DOOR', value: 'DOOR' },
      //   { text: 'E/E COMP', value: 'E/E COMP' },
      //   { text: 'A/COND', value: 'A/COND' },
      //   { text: 'AFT C/C', value: 'AFT C/C' },
      //   { text: 'LH WING', value: 'LH WING' },
      //   { text: 'RH WING', value: 'RH WIN' },
      //   { text: 'LEADING EDGE', value: 'LEADING EDGE' },
      //   { text: 'TRAILING EDGE', value: 'TRAILING EDGE' },
      //   { text: 'THS COMP', value: 'THS COMP' },
      //   { text: 'VERT STAB', value: 'VERT STAB' },
      //   { text: 'HOR STAB', value: 'HOR STAB' },
      //   { text: 'L/H PYLON', value: 'L/H PYLON' },
      //   { text: 'L/H NACELLE', value: 'L/H NACELLE' },
      //   { text: 'L/H ENG', value: 'L/H ENG' },
      //   { text: 'R/H PYLON', value: 'R/H PYLON' },
      //   { text: 'R/H NACELLE', value: 'R/H NACELLE' },
      //   { text: 'R/H ENG', value: 'R/H ENG' },
      //   { text: 'NLG', value: 'NLG' },
      //   { text: 'MLG', value: 'MLG' },
      //   { text: 'NOSE W/W', value: 'NOSE W/W' },
      //   { text: 'MAIN W/W', value: 'MAIN W/W' },
      //   { text: 'FWD PAX', value: 'FWD PAX' },
      //   { text: 'CTR PAX', value: 'CTR PAX' },
      //   { text: 'ATF PAX', value: 'ATF PAX' },
      //   { text: 'LH TANK', value: 'LH TANK' },
      //   { text: 'CTR TANK', value: 'CTR TANK' },
      //   { text: 'RH TANK', value: 'RH TANK' },
      //   { text: 'ACT', value: 'ACT' },
      //   { text: 'TBD', value: 'TBD' },
      // ],

      filters: Array.from(
        new Set(
          // Проверьте, что dataSource существует и является массивом
          dataSource && Array.isArray(dataSource)
            ? dataSource.map((item) => item.zone)
            : []
        )
      ).map((value) => ({ text: value, value })),

      filterSearch: true,
    },

    // {
    //   title: 'C/W DATE',
    //   editable: (text, record, index) => {
    //     return false;
    //   },

    //   dataIndex: 'closeDate',
    //   key: 'closeDate',
    //   width: '7%',
    //   responsive: ['lg'],
    //   valueType: 'date',
    //   sorter: (a, b) => {
    //     if (a.closeDate && b.closeDate) {
    //       const aFinishDate = new Date(a.closeDate);
    //       const bFinishDate = new Date(b.closeDate);
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
            Array.isArray(item.ТResources) ? item.ТResources : []
          )
        )
      ).map((value) => ({ text: value, value })),
      onFilter: (value, record) => record.restrictionArr.includes(value),

      filterSearch: true,
      render: (_, record) => (
        <>
          {record.ТResources && record.ТResources.length > 0
            ? record.ТResources.map((tag: any) => {
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
    //         setDataSource(projectAdditionalTasks);
    //       }
    //     },
    //     data: dataSource,
    //   }),
    //   width: '12%',
    // },
    {
      title: `${t('NEXT SKILL')}`,
      key: 'cascader',
      dataIndex: 'cascader',
      // tip: 'Text Show',
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
        { text: 'CONDITION A/C', value: 'C' },
        { text: 'READY TO PERF', value: 'ready' },
      ],
      onFilter: (value, record) =>
        record.readyStatus.commonRestrStatus.includes(value),
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
                            (item: { status: string }) =>
                              item.status === 'open' ||
                              item.status === 'onCheack' ||
                              item.status === 'onPush'
                          )
                          .map(
                            (item: any) =>
                              `${item.PN} - ${item.nameOfMaterial}   ${item.amout}${item.unit};`
                          )
                          .join('\n')
                      : tag === 'TR' && record?.ТResources
                      ? record?.ТResources

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

    // {
    //   title: `${t('REWIEW')}`,
    //   dataIndex: 'rewiewStatus',
    //   key: 'rewiewStatus',
    //   width: '10%',
    //   valueType: 'select',
    //   tip: 'Text Show',
    //   ellipsis: true,
    //   // initialValue: 'all',
    //   filters: true,
    //   filterSearch: true,
    //   onFilter: true,
    //   valueEnum: {
    //     // all: { text: 'all', status: 'Default' },
    //     blanc: { text: 'BLANC', status: 'Default' },
    //     readyForPer: { text: 'READY FOR PERFORM', status: 'Default' },
    //     waiting: { text: 'TO WAIT', status: 'Warning' },
    //     inProgress: { text: 'IN PROGRESS', status: 'Processing' },
    //     completed: { text: 'COMPLETED', status: 'SUCCESS' },
    //     canceled: { text: 'CANCELED', status: 'Error' },
    //   },
    // },
    {
      title: `${t('OPTION')}`,
      valueType: 'option',
      key: 'option',
      width: '5%',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record._id || record.id);
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
      updateProjectAdditionalTasksByIds({
        rewiewStatus: value,
        ids: selectedRowKeys,
        projectId: currentProject?._id,
      })
    );
    if (result.meta.requestStatus === 'fulfilled') {
      selectedRowKeys.forEach((rowKey) => {
        const index = projectAdditionalTasks.findIndex(
          (task) => task._id === rowKey
        );
        if (index !== -1) {
          const updatedTask = result.payload.find(
            (task: any) => task._id === rowKey
          );
          if (updatedTask) {
            dispatch(
              setUpdatedProjectAdditionalTask({
                index: index,
                task: {
                  ...projectAdditionalTasks[index],
                  rewiewStatus: value,
                },
              })
            );
          }
        }
      });
    }
  };

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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
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
                updateProjectAdditionalTasksByIds({
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
                  dataSource,
                  `Filtred-WOTasks-${currentProject?.projectName}`
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
                projectAdditionalTasks.length &&
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
        getItem(<div>Update Skill selected Item</div>, 'updateSkill', '', [
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
        ]),
        // getItem(<div>Update Skill/Wait Rewiew</div>, 'updateSkill/Wait', '', [
        //   getItem(
        //     <div
        //       onClick={(e) => {
        //         e.stopPropagation();
        //       }}
        //     >
        //       <Select
        //         options={optionsRewiew}
        //         onChange={onChangeRewiew}
        //         placeholder="Please select"
        //         showSearch
        //         onSearch={(value) => {}}
        //       />
        //     </div>
        //   ),
        // ]),
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
                  updateProjectAdditionalTasksByIds({
                    status: 'inProgress',
                    ids: selectedRowKeys,
                    projectId: currentProject?._id,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  selectedRowKeys.forEach((rowKey) => {
                    const index = projectAdditionalTasks.findIndex(
                      (task) => task._id === rowKey
                    );
                    if (index !== -1) {
                      const updatedTask = result.payload.find(
                        (task: any) => task._id === rowKey
                      );
                      if (updatedTask) {
                        dispatch(
                          setUpdatedProjectAdditionalTask({
                            index: index,
                            task: {
                              ...projectAdditionalTasks[index],
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
                  updateProjectAdditionalTasksByIds({
                    status: 'canceled',
                    ids: selectedRowKeys,
                    projectId: currentProject?._id,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  selectedRowKeys.forEach((rowKey) => {
                    const index = projectAdditionalTasks.findIndex(
                      (task) => task._id === rowKey
                    );
                    if (index !== -1) {
                      const updatedTask = result.payload.find(
                        (task: any) => task._id === rowKey
                      );
                      if (updatedTask) {
                        dispatch(
                          setUpdatedProjectAdditionalTask({
                            index: index,
                            task: {
                              ...projectAdditionalTasks[index],
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
                updateProjectAdditionalTasksByIds({
                  status: 'open',
                  ids: selectedRowKeys,
                  projectId: currentProject?._id,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                selectedRowKeys.forEach((rowKey) => {
                  const index = projectAdditionalTasks.findIndex(
                    (task) => task._id === rowKey
                  );
                  if (index !== -1) {
                    const updatedTask = result.payload.find(
                      (task: any) => task._id === rowKey
                    );
                    if (updatedTask) {
                      dispatch(
                        setUpdatedProjectAdditionalTask({
                          index: index,
                          task: {
                            ...projectAdditionalTasks[index],
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
          // onClick={() => setOpenAddAppForm(true)}
          >
            Quick Print Work Card
          </div>,
          '9sstsssishhxs'
        ),
        getItem(
          <div
          // onClick={() => setOpenAddAppForm(true)}
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
    //       // onClick={() => setOpenAddAppForm(true)}
    //       >
    //         Quick Perfomed Work Card
    //       </div>,
    //       '9sstsssishhxs'
    //     ),
    //     getItem(
    //       <div
    //       // onClick={() => setOpenAddAppForm(true)}
    //       >
    //         Quick Inspected Work Card
    //       </div>,
    //       '9sshsssgsxtyswishhxs'
    //     ),
    //     getItem(
    //       <div
    //       // onClick={() => setOpenAddAppForm(true)}
    //       >
    //         Quick Close Work Card
    //       </div>,
    //       '9sshsssklkgswishhxs'
    //     ),
    //     getItem(
    //       <div
    //       // onClick={() => setOpenAddAppForm(true)}
    //       >
    //         Add User to Work
    //       </div>,
    //       '9sshssskdddlkgswishhxs'
    //     ),
    //   ],
    // },
  ];
  const taskItems: MenuProps['items'] = [
    {
      label: `${t('Settings')}`,
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
                  updateAdditionalTask({
                    status: 'inProgress',
                    _id: currentProjectAdditionalTask?._id,
                    projectId: currentProject?._id,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  setCurrentProjectAdditionalTask(result.payload);
                  const companyID = localStorage.getItem('companyID');
                  const index = projectAdditionalTasks.findIndex(
                    (task) => task._id === currentProjectAdditionalTask?._id
                  );
                  if (index !== -1) {
                    dispatch(
                      setUpdatedProjectAdditionalTask({
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
                  updateAdditionalTask({
                    status: 'open',
                    _id: currentProjectAdditionalTask?._id,
                    projectId: currentProject?._id,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  setCurrentProjectAdditionalTask(result.payload);
                  const companyID = localStorage.getItem('companyID');
                  const index = projectAdditionalTasks.findIndex(
                    (task) => task._id === currentProjectAdditionalTask?._id
                  );
                  if (index !== -1) {
                    dispatch(
                      setUpdatedProjectAdditionalTask({
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
    <div className="flex my-0 mx-auto flex-col  h-[78vh] relative overflow-hidden">
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
      </Row>
      <EditableTable
        data={dataSource || []}
        initialColumns={initialColumns}
        isLoading={isLoading}
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
            updateAdditionalTask({
              projectId: currentProject?._id,
              _id: rowKey,
              rewiewStatus: data.rewiewStatus,
              cascader: data.cascader,
              note: data.note,
            })
          );
          if (result.meta.requestStatus === 'fulfilled') {
            const index = projectAdditionalTasks.findIndex(
              (task) => task._id === rowKey
            );
            if (index !== -1) {
              // console.log(index);
              // console.log(result.payload);
              dispatch(
                setUpdatedProjectAdditionalTask({
                  index: index,
                  task: result.payload,
                })
              );
            }
          }
        }}
        yScroll={51}
        xScroll={1700}
        // showSearchInput={true}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onVisibleColumnsChange={handleVisibleColumnsChange}
        recordCreatorProps={false}
        externalReload={function (): Promise<void> {
          throw new Error('Function not implemented.');
        }}
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
        title={`${currentProjectAdditionalTask?.taskHeadLine?.toUpperCase()} ###${
          currentProjectAdditionalTask?.taskDescription || ''
          // steps &&
          // currentProjectAdditionalTask?.steps[0]
          //   ? currentProjectAdditionalTask?.steps[0].stepDescription?.toUpperCase()
          //   : ''
        }`}
        size={'large'}
        placement={'bottom'}
        onClose={() => {
          setOpenTaskDrawer(false);
          dispatch(setCurrentProjectAdditionalTask(null));
          dispatch(setCurrentAdditionalActionIndexMtb(0));
          dispatch(setCurrentAdditionalAction(null));
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
              color={
                currentProjectAdditionalTask?.status === 'closed'
                  ? 'green'
                  : 'red'
              }
            >
              {String(
                currentProjectAdditionalTask?.status
                  ? currentProjectAdditionalTask?.status
                  : ''
              ).toUpperCase()}
            </Tag>{' '}
            <div className=" ml-auto w-40">
              <NavigationPanel
                onMenuClick={handleMenuClick}
                columns={columns}
                selectedColumns={selectedColumns}
                menuItems={taskItems}
                selectedRows={selectedRowKeys}
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
              content: <StepsContent task={currentProjectAdditionalTask} />,
              title: `${t('PRODUCTION')}`,
            },

            {
              content: (
                <>
                  <div className="flex col relative overflow-hidden">
                    <RequirementItems
                      data
                      projectTaskData={currentProjectAdditionalTask}
                      scroll={36}
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
              content: <Details task={currentProjectAdditionalTask} />,
              title: `${t('Details')}`,
            },

            // {
            //   content: <CloseContent task={currentProjectAdditionalTask} />,
            //   title: `${t('Close Work Order')}`,
            // },

            { content: <GeneretedNRCPdf />, title: `${t('Work Card')}` },
          ]}
        />
      </DrawerPanel>
    </div>
    // </div>
  );
};

export default NRCTaskList;
