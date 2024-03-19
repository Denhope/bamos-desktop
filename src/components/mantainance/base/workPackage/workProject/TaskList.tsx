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
  findTasksAndCalculateTotalTime,
  getFilteredGroupsTasks,
  getFilteredProjectTasks,
  updateProjectTask,
  updateProjectTasksByIds,
  getAplicationByID,
  createProjectTask,
  createRemoveInstallComponents,
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
import { exportToExcel } from '@/services/utilites';
import React from 'react';

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
import { ProColumns, ActionType, ModalForm } from '@ant-design/pro-components';
import { DefaultOptionType } from 'antd/es/select';
import EditableTable from '@/components/shared/Table/EditableTable';
import { useColumnSearchProps } from '@/components/shared/Table/columnSearch';
import GroupAddForm from '../../wp/GroupAddForm';
import ProjectDescription from '../../wp/ProjectDescription';
import WOEditForm from '../../wp/WOEditForm';

import TaskDetails from '../../wp/activeTask/Details';
import NRCStepForm from '../../wp/activeTask/addNRC/NRCStepForm';
import WOEditFormPlanning from './WOEditFormPlanning';
import { IReferencesLinkType } from '@/models/IAdditionalTaskMTB';
import { ITaskType } from '@/types/TypesData';
import { ITaskDTO } from '../packageAplications/AddAplicationForm';
import WOAddForm from './WOAddForm';
import { useTranslation } from 'react-i18next';
import StepsContent from '../../wp/activeTask/steps/StepsContent';
import CloseContent from '../../wp/activeTask/close/CloseContent';
import RequirementItems from '../../wp/activeTask/requeriments/RequirementItems';
import GeneretedWOPdfCurr from '@/components/pdf/GeneretedWOPdfCurr';
import IssuedMatForm from '../../wp/activeTask/requeriments/IssuedMatForm';
import { FULL_NAME, USER_ID } from '@/utils/api/http';

// import Store from '@/components/pages/Store';

export interface IGroupTaskListPrors {
  projectID: string;
  projectData: any;
  yscroll: number;
  onResult?: (result: any) => void;
}

const GroupTaskList: FC<IGroupTaskListPrors> = ({
  projectID,
  yscroll,
  projectData,
  onResult,
}) => {
  const { t } = useTranslation();
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const companyID = localStorage.getItem('companyID');
  const { RangePicker } = DatePicker;
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);

  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const { currentProjectTask, isLoadingReq } = useTypedSelector(
    (state) => state.mtbase
  );

  const [openWOInfoDrawer, setOpenWOInfoDrawer] = useState(false);
  const [openAddWOForm, setOpenAddWOForm] = useState(false);
  const [notFoundTaskDTOs, setNotFoundTaskDTOs] = useState<any>([]);
  const [foundTasks, setFoundTasks] = useState<any>([]);
  const [dataSourceApp, setDataSourceApp] = useState<any>();

  const onClose = () => {
    setOpenWOInfoDrawer(false);
  };
  const dispatch = useAppDispatch();
  const fetch = () => {};
  useEffect(() => {
    const fetchData = async () => {
      const companyID = localStorage.getItem('companyID');

      if (companyID) {
        const result = await dispatch(
          getFilteredProjectTasks({
            projectId: projectID,
          })
        );
        const resultApp = await dispatch(
          getAplicationByID({
            companyID: projectData.companyID,
            aplicationID: projectData.aplicationId,
          })
        );
        if (resultApp.meta.requestStatus === 'fulfilled') {
          // console.log(result.payload);

          setDataSource(result.payload);
          setProjectTasks(dataSource);
          setDataSourceApp(resultApp.payload);
          const resultTasks = await dispatch(
            findTasksAndCalculateTotalTime({
              taskDTO: resultApp.payload?.tasks || [],
            })
          );
          if (resultTasks.meta.requestStatus === 'fulfilled') {
            if (onResult) {
              onResult(resultTasks.payload.foundTasks);
            }
          }
        }
      }
    };
    fetchData();
  }, [dispatch]);

  const { isLoading } = useTypedSelector((state) => state.mtbase);

  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };

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
      const result = await dispatch(
        getFilteredGroupsTasks({
          projectId: projectID,
        })
      );
      setDataSource(result.payload);
      setProjectTasks(dataSource);
      setDataSource(result.payload);
      setProjectTasks(dataSource);
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
                  cascader: value,
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
      const result = await dispatch(
        getFilteredGroupsTasks({
          projectId: projectID,
        })
      );
      setDataSource(result.payload);
      setProjectTasks(dataSource);
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

  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('W/O')}`,
      dataIndex: 'projectTaskWO',
      key: 'projectTaskWO',
      width: '7%',
      editable: (text, record, index) => {
        return false;
      },
      sorter: (a, b) => (a.projectTaskWO || 0) - (b.projectTaskWO || 0),
      render: (text: any, record: any) => {
        return (
          <a
            onClick={() => {
              dispatch(setCurrentProjectTask(record));
              setOpenTaskDrawer(true);
            }}
          >
            {record.projectTaskWO && record.projectTaskWO}
          </a>
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
      title: 'Task Nbr',

      dataIndex: 'taskNumber',
      key: 'taskNumber',
      editable: (text, record, index) => {
        return false;
      },
      // responsive: ['lg'],
      width: '9%',
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
      title: `${t('DESCRIPTIONS')}`,
      dataIndex: 'taskDescription',
      key: 'taskDescription',
      ellipsis: true,
      editable: (text, record, index) => {
        return false;
      },
      tooltip: 'Text Show',
      // width: '9%',

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

    {
      title: 'AMM',
      dataIndex: 'amtoss',
      tooltip: 'Text Show',
      ellipsis: true,
      key: 'amtoss',
      responsive: ['lg'],
      // width: '12%',
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
    {
      title: `${t('CODE')}`,
      dataIndex: 'code',
      key: 'code',
      width: '6%',
      responsive: ['lg'],
      editable: (text, record, index) => {
        return false;
      },

      onFilter: true,
      valueType: 'select',
      filters: [
        { text: 'FC', value: 'FC' },
        { text: 'RS', value: 'RS' },
        { text: 'GVI', value: 'GVI' },
        { text: 'DET', value: 'DET' },
        { text: 'VC', value: 'VC' },
        { text: 'LU', value: 'LU' },
        { text: 'OP', value: 'OP' },
        { text: 'SDI', value: 'SDI' },
        { text: 'OP', value: 'OP' },
        { text: 'NDT', value: 'NDT' },
      ],

      filterSearch: true,
    },
    {
      title: `${t('ZONE')}`,
      dataIndex: 'area',

      key: 'area',
      width: '5%',
      tooltip: 'Text Show',
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
      title: 'C/W Date',
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: 'finishDate',
      key: 'finishDate',
      // width: '7%',
      responsive: ['lg'],
      valueType: 'date',
      sorter: (a, b) => {
        if (a.finishDate && b.finishDate) {
          const aFinishDate = new Date(a.finishDate);
          const bFinishDate = new Date(b.finishDate);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      renderFormItem: () => {
        return <RangePicker />;
      },
    },

    {
      title: `${t('Status')}`,
      dataIndex: 'status',

      key: 'status',
      width: '9%',

      filters: true,
      onFilter: true,
      valueType: 'select',
      filterSearch: true,
      valueEnum: {
        отложен: { text: t('OPEN'), status: 'Default' },
        inProgress: { text: t('IN_PROGRESS'), status: 'Processing' },
        closed: { text: t('CLOSED'), status: 'Success' },
        canceled: { text: t('CANCELED'), status: 'Error' },
      },
    },
    {
      disable: true,
      title: `${t('TAGS')}`,
      dataIndex: 'labels',
      search: false,
      renderFormItem: (_, { defaultRender }) => {
        return defaultRender(_);
      },
      width: '5%',
    },
    {
      title: 'Skill/Wait',
      key: 'cascader',
      dataIndex: 'cascader',
      tooltip: 'Text Show',
      ellipsis: true,

      fieldProps: {
        options: cascaderOptions,
        fieldNames: {
          children: 'language',
          label: 'field',
        },
      },
      valueType: 'cascader',
      ...useColumnSearchProps({
        dataIndex: 'cascader',
        onSearch: (value) => {
          if (value) {
            // Отфильтруйте данные на основе поискового запроса
            const filteredData = dataSource.filter((item) =>
              item.cascader
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
      width: '12%',
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
      width: '6%',
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
      title: `${t('REWIEW')}`,
      dataIndex: 'rewiewStatus',
      key: 'rewiewStatus',
      width: '10%',
      valueType: 'select',
      tooltip: 'Text Show',
      ellipsis: true,
      // initialValue: 'all',
      filters: true,
      filterSearch: true,
      onFilter: true,
      valueEnum: {
        // all: { text: 'all', status: 'Default' },
        blanc: { text: 'BLANC', status: 'Default' },
        readyForPer: { text: 'READY FOR PERFORM', status: 'Default' },
        waiting: { text: 'TO WAIT', status: 'Warning' },
        inProgress: { text: 'IN PROGRESS', status: 'Processing' },
        completed: { text: 'COMPLETED', status: 'Success' },
        canceled: { text: 'CANCELED', status: 'Error' },
      },
    },
    {
      title: `${t('OPTION')}`,
      valueType: 'option',
      key: 'option',
      width: '9%',
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
  const [requirementDrawer, setOpenRequirementDrawer] = useState(false);
  const [issuedRecord, setIssuedRecord] = useState(false);
  const [issuedtDrawer, setOpenIssuedDrawer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMenuClick = (e: { key: React.Key }) => {
    if (selectedColumns.includes(e.key)) {
      setSelectedColumns(selectedColumns.filter((key: any) => key !== e.key));
    } else {
      setSelectedColumns([...selectedColumns, e.key]);
    }
  };

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
    {
      label: 'Add New Task',
      key: 'add',
      icon: <PlusOutlined />,
      onClick: () => {
        setOpenAddWOForm(true);
      },
    },

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
                  `Filtred-WOTasks-${projectID}`
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
                  `ALL-WOTasks-${projectID}`
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
        getItem(
          <div
          // onClick={() => setOpenAddAppForm(true)}
          >
            <EditOutlined /> Edit selected Item in DATABASE
          </div>,
          '9sshsssswishhxs'
        ),
        getItem(
          <div
          // onClick={(e) => {
          //   e.stopPropagation();
          //   // setOpenAddAppForm(true);
          // }}
          >
            Update Skill selected Item
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
                <Cascader
                  options={options}
                  onChange={onChange}
                  placeholder="Please select"
                  showSearch={{ filter }}
                  onSearch={(value) => {}}
                />
              </div>
            ),
          ]
        ),
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
                  const result = await dispatch(
                    getFilteredGroupsTasks({
                      projectId: projectID,
                    })
                  );
                  setDataSource(result.payload);
                  setProjectTasks(dataSource);
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
                  const result = await dispatch(
                    getFilteredGroupsTasks({
                      projectId: projectID,
                    })
                  );
                  setDataSource(result.payload);
                  setProjectTasks(dataSource);
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
                const result = await dispatch(
                  getFilteredGroupsTasks({
                    projectId: projectID,
                  })
                );
                setDataSource(result.payload);
                setProjectTasks(dataSource);
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
  const [requirementRecord, setRequirementRecord] = useState(false);

  const onReqClick = (record: any) => {
    setRequirementRecord(record);
    setOpenRequirementDrawer(true);
  };
  const onIssuedClick = (record: any) => {
    setIssuedRecord(record);
    setOpenIssuedDrawer(true);
  };
  return (
    <div className="flex my-0 mx-auto flex-col h-[78vh] relative overflow-hidden">
      <Row justify={'start'}>
        <Space className="p-2">
          <EditOutlined
            onClick={() => setOpenEditWOForm(true)}
            className="cursor-pointer"
          />{' '}
          <a onClick={() => setOpenEditWOForm(true)}>EDIT</a>
        </Space>{' '}
        <Space className="p-2">
          <PlusOutlined
            onClick={() => setOpenEditWOForm(true)}
            className="cursor-pointer"
          />
          <a
            onClick={async () => {
              const result = await dispatch(
                findTasksAndCalculateTotalTime({
                  taskDTO: dataSourceApp?.tasks,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                // console.log(result.payload);

                setFoundTasks(result.payload.foundTasks);

                const createFoundedTasks = async () => {
                  let tasks = result.payload.foundTasks;
                  if (tasks) {
                    let promises = tasks.map(async (task: ITaskType) => {
                      let refArr =
                        task.ammtossArrNew ||
                        (task.amtossArr && task.ammtossArrNew) ||
                        task.amtossArr?.map(
                          (item: string): IReferencesLinkType =>
                            ({
                              type: 'AMM',
                              reference: item,
                              description: '',
                            } || [])
                        );

                      const result = await dispatch(
                        createProjectTask({
                          taskId: task._id,
                          companyID: localStorage.getItem('companyID'),
                          projectId: projectData._id || '',
                          taskType: 'sheduled',
                          createDate: new Date(),
                          ownerId: USER_ID,
                          optional: {
                            amtoss: task.amtossDTO,
                            MJSSNumber: task.dtoIndex,
                            WOCustomer: task.WOCustomer,
                            WOPackageType: task.WOPackageType,
                            position: task.positionDTO,
                            taskNumber: task.taskNumberDTO,
                            taskDescription: task.taskDescriptionDTO,
                            isActive: false,
                            isDone: false,
                            isFavorite: false,
                            isStarting: false,
                          },
                          status: 'open',
                          _id: '',
                          name: FULL_NAME,
                          sing: String(localStorage.getItem('singNumber')),
                          actions: [
                            {
                              actionDescription: `ВЫПОЛНЕНО: \r\n ${
                                task.taskDescription
                              }\nв соответствии с:${(
                                task.ammtossArrNew ||
                                (task.amtossArr && task.ammtossArrNew) ||
                                task.amtossArr
                              )?.map(
                                (item: string) => `\n${item.toUpperCase()}`
                              )}`,
                              actionNumber: 1,
                            },
                          ],

                          projectTaskNRSs: [],

                          workStepReferencesLinks: [
                            ...(refArr || []),
                            {
                              type: 'WO',
                              reference: task.WOCustomer || '',
                              description: 'Customer WO / WO Заказчика',
                            },
                            {
                              type: 'WO',
                              reference: String(projectData.projectWO) || '',
                              description: 'Local WO / Внутренний WO',
                            },
                          ],
                          materialReuest: [],
                          materialReuestAplications: [],
                          plane: {
                            registrationNumber: projectData.planeNumber,
                            type: projectData.planeType || '',
                            companyName: projectData.companyName,
                          },
                          projectWO: projectData.projectWO,
                          newMaterial: [],
                          cascader:
                            task.accessArr && task.accessArr.length
                              ? ['AF']
                              : null,
                          rewiewStatus:
                            task.accessArr && task.accessArr.length
                              ? 'waiting'
                              : null,
                        })
                      );
                      if (result.meta.requestStatus !== 'fulfilled') {
                        throw new Error('Ошибка при создании задачи');
                      }
                      return result;
                    });

                    Promise.all(promises)
                      .then((results) => {
                        // Проверяем, есть ли среди результатов какие-либо ошибки
                        const errors = results.filter(
                          (result) => result instanceof Error
                        );
                        if (errors.length > 0) {
                          // Если есть ошибки, выводим сообщение об ошибке
                          message.error(
                            'При создании некоторых задач произошли ошибки'
                          );
                        } else {
                          // Если ошибок нет, выводим сообщение об успехе
                          message.success('Все задачи успешно созданы');
                        }
                      })
                      .catch((error) => {
                        // Обработка ошибок при создании задач
                        console.error(error);
                      });
                  }
                  let notFoundTasks = result.payload.notFoundTaskDTOs;
                  if (notFoundTasks) {
                    let promisesNotFounded = notFoundTasks.map(
                      async (task: ITaskDTO) => {
                        const resultNotFounded = await dispatch(
                          createProjectTask({
                            // taskId: task.id,
                            companyID: localStorage.getItem('companyID'),
                            projectId: projectData._id || '',
                            taskType: 'sheduled',
                            createDate: new Date(),
                            ownerId: USER_ID,
                            optional: {
                              amtoss: task.amtoss,
                              MJSSNumber: task.id,
                              WOCustomer: task.WOCustomer,
                              WOPackageType: task.WOPackageType,
                              taskNumber: task.taskNumber,
                              position: task.position,
                              taskDescription: task.taskDescription,
                              isActive: false,
                              isDone: false,
                              isFavorite: false,
                              isStarting: false,
                            },
                            status: 'open',
                            _id: '',
                            actions: [
                              {
                                actionDescription: `ВЫПОЛНЕНО: \r\n ${
                                  task.taskDescription
                                  //   ?.replace(
                                  //   /ДОСТУП ПРИМЕЧАНИЕ:.+/,
                                  //   ''.replace(/ДОСТУП:.+/, '')
                                  // )
                                  // }\nв соответствии с:\nAMM-${task.amtoss}`,
                                }\nв соответствии с:${task.amtoss}`,
                                cteateDate: new Date(),
                                actionCteateUserID: USER_ID,
                              },
                            ],
                            projectTaskNRSs: [],

                            workStepReferencesLinks: [
                              {
                                type: 'WO',
                                reference: task.WOCustomer || '',
                                description: 'Customer WO / WO Заказчика',
                              },
                              {
                                type: 'WO',
                                reference: String(projectData.projectWO) || '',
                                description: 'Local WO / Внутренний WO',
                              },
                            ],
                            materialReuest: [],
                            materialReuestAplications: [],
                            plane: {
                              registrationNumber: projectData.planeNumber,
                              type: projectData.planeType || '',
                              companyName: projectData.companyName,
                            },
                            projectWO: projectData.projectWO,
                            newMaterial: [],
                          })
                        );
                        if (
                          resultNotFounded.meta.requestStatus !== 'fulfilled'
                        ) {
                          throw new Error('Ошибка при создании задачи');
                        }

                        return resultNotFounded;
                      }
                    );
                    Promise.all(promisesNotFounded)
                      .then((results) => {
                        // Проверяем, есть ли среди результатов какие-либо ошибки
                        const errors = results.filter(
                          (result) => result instanceof Error
                        );
                        if (errors.length > 0) {
                          // Если есть ошибки, выводим сообщение об ошибке
                          message.error(
                            'При создании некоторых задач произошли ошибки'
                          );
                        } else {
                          // Если ошибок нет, выводим сообщение об успехе
                          message.success('Все задачи успешно созданы');
                        }
                      })
                      .catch((error) => {
                        // Обработка ошибок при создании задач
                        console.error(error);
                      });
                  }
                };

                createFoundedTasks();
                setNotFoundTaskDTOs(result.payload.notFoundTaskDTOs);
                // result.payload.notFoundTaskDTOs &&
                //   result.payload.notFoundTaskDTOs.forEach(
                //     async (task: ITaskDTO) => {
                //       const resultNotFounded = await dispatch(
                //         createProjectTask({
                //           // taskId: task.id,
                //           companyID: localStorage.getItem('companyID'),
                //           projectId: projectData._id || '',
                //           taskType: 'sheduled',
                //           createDate: new Date(),
                //           ownerId: USER_ID,
                //           optional: {
                //             amtoss: task.amtoss,
                //             MJSSNumber: task.id,
                //             WOCustomer: task.WOCustomer,
                //             WOPackageType: task.WOPackageType,
                //             taskNumber: task.taskNumber,
                //             position: task.position,
                //             taskDescription: task.taskDescription,
                //             isActive: false,
                //             isDone: false,
                //             isFavorite: false,
                //             isStarting: false,
                //           },
                //           status: 'open',
                //           _id: '',
                //           actions: [
                //             {
                //               actionDescription: `ВЫПОЛНЕНО: \r\n ${
                //                 task.taskDescription
                //                 //   ?.replace(
                //                 //   /ДОСТУП ПРИМЕЧАНИЕ:.+/,
                //                 //   ''.replace(/ДОСТУП:.+/, '')
                //                 // )
                //                 // }\nв соответствии с:\nAMM-${task.amtoss}`,
                //               }\nв соответствии с:${task.amtoss}`,
                //               cteateDate: new Date(),
                //               actionCteateUserID:
                //                 USER_ID,
                //             },
                //           ],
                //           projectTaskNRSs: [],

                //           workStepReferencesLinks: [
                //             {
                //               type: 'WO',
                //               reference: task.WOCustomer || '',
                //               description: 'Customer WO / WO Заказчика',
                //             },
                //             {
                //               type: 'WO',
                //               reference: String(projectData.projectWO) || '',
                //               description: 'Local WO / Внутренний WO',
                //             },
                //           ],
                //           materialReuest: [],
                //           materialReuestAplications: [],
                //           plane: {
                //             registrationNumber: projectData.planeNumber,
                //             type: projectData.planeType || '',
                //             companyName: projectData.companyName,
                //           },
                //           projectWO: projectData.projectWO,
                //           newMaterial: [],
                //         })
                //       );
                //     }
                //   );
              }
            }}
          >
            GENERATE TASKS{' '}
          </a>
        </Space>{' '}
        <Space className="p-2">
          <PlusOutlined
            onClick={() => setOpenEditWOForm(true)}
            className="cursor-pointer"
          />
          <a>GENERATE TASKS FROM APLICATION</a>
        </Space>{' '}
        <Space className="p-2">
          <PlusOutlined
            // onClick={() => setOpenEditWOForm(true)}
            className="cursor-pointer"
          />
          <a
            onClick={async () => {
              let allAccessArr = dataSource.flatMap(
                (task: any) => task.accessArr
              );
              let ids = dataSource.map((item: any) => item._id);

              let uniqueIds: string[] = await new Promise((resolve) => {
                resolve(
                  Array.from(new Set(allAccessArr.map((item: any) => item._id)))
                );
              });
              console.log(uniqueIds.length);
              if (uniqueIds.length > 0) {
                dispatch(
                  createRemoveInstallComponents({
                    companyID: localStorage.getItem('companyID') || '',
                    projectId: projectData._id || '',
                    createDate: new Date(),
                    createUserID: USER_ID || '',
                    accessIds: uniqueIds,
                    projectTaskIds: ids,
                  })
                );
              }
            }}
          >
            REMOVE/INSTALL COMPONENTS
          </a>
        </Space>{' '}
      </Row>{' '}
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
            updateProjectTask({
              id: rowKey,
              rewiewStatus: data.rewiewStatus,
              cascader: data.cascader,
              note: data.note,
              status: data.status,
            })
          );
          if (result.meta.requestStatus === 'fulfilled') {
            const result = await dispatch(
              getFilteredGroupsTasks({
                projectId: projectID,
              })
            );
            setDataSource(result.payload);
            setProjectTasks(dataSource);
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
        yScroll={yscroll}
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
      <IssuedMatForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        issuedRecord={undefined}
        isLoading={isLoading}
        menuItems={undefined}
        yScroll={0}
      />
      <DrawerPanel
        title={`Edit WP:`}
        size={'medium'}
        placement={'right'}
        open={openEditWOForm}
        onClose={setOpenEditWOForm}
      >
        <WOEditFormPlanning selectedWP={projectData}></WOEditFormPlanning>
      </DrawerPanel>
      <DrawerPanel
        title={`Add New Task`}
        size={'medium'}
        placement={'right'}
        open={openAddWOForm}
        onClose={setOpenAddWOForm}
        getContainer={false}
      >
        <WOAddForm></WOAddForm>
      </DrawerPanel>
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
          showSearchInput={true}
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
      <DrawerPanel
        title={`${currentProjectTask?.taskNumber?.toUpperCase()} ###${currentProjectTask?.taskDescription?.toUpperCase()}`}
        size={'large'}
        placement={'bottom'}
        onClose={() => {
          setOpenTaskDrawer(false);
          dispatch(setCurrentProjectTask(null));
          dispatch(setCurrentActionIndexMtb(0));
          dispatch(setCurrentAction(null));
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
              content: <TaskDetails task={currentProjectTask} />,
              title: `${t('Details')}`,
            },
            {
              content: (
                <>
                  <div className="flex col relative overflow-hidden">
                    <RequirementItems
                      data
                      projectTaskData={currentProjectTask}
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

export default GroupTaskList;
