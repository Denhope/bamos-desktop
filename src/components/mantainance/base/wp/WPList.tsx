import {
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  MenuProps,
  Modal,
  Row,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  message,
} from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import { IProjectInfo, IProjectResponce } from '@/models/IProject';
import React, { FC, useState } from 'react';

import { setProjectTaskMode } from '@/store/reducers/AdditionalTaskSlice';
import {
  PlusOutlined,
  AppstoreOutlined,
  FilterOutlined,
  DownloadOutlined,
  StopOutlined,
  CloseOutlined,
  SettingOutlined,
  PrinterOutlined,
  EditOutlined,
  FileMarkdownOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

import {
  featchCountAdditionalByStatus,
  featchCountByStatus,
  getFilteredGroups,
  getFilteredProjectTasks,
  updateProject,
} from '@/utils/api/thunks';
import toast, { Toaster } from 'react-hot-toast';
import moment from 'moment';
import { exportToExcel } from '@/services/utilites';
import NavigationPanel from '@/components/shared/NavigationPanel';
import {
  setCurrentProject,
  setNullProjectTasks,
} from '@/store/reducers/MtbSlice';
import DrawerPanel from '@/components/shared/DrawerPanel';
import WOEditForm from './WOEditForm';
import EditableTable from '@/components/shared/Table/EditableTable';
import { ProColumns } from '@ant-design/pro-components';
import { useTranslation } from 'react-i18next';
type PlaneWOListPropsType = {
  data: IProjectResponce[];
  isLoading: boolean;
  onRowClick: (record: IProjectResponce) => void;
};
const WPList: FC<PlaneWOListPropsType> = ({ data, isLoading, onRowClick }) => {
  const { t } = useTranslation();
  const [openEditWOForm, setOpenEditWOForm] = useState(false);
  const { currentProject } = useTypedSelector((state) => state.mtbase);
  const dispatch = useAppDispatch();
  const { RangePicker } = DatePicker;
  const [open, setOpen] = useState(false);
  const [searchedText, setSerchedText] = useState('');
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const rowClassName = (record: any) => {
    return record.id === selectedRowKey
      ? 'cursor-pointer text-sm text-transform: uppercase bg-blue-100'
      : 'cursor-pointer text-sm text-transform: uppercase ';
  };
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('W/O NBR')}`,
      dataIndex: 'projectWO',
      key: 'projectWO',
      responsive: ['sm'],
      sorter: (a, b) => (a.projectWO || 0) - (b.projectWO || 0),
      filteredValue: [searchedText],
      onFilter: (value: any, record: any) => {
        return String(record?.projectWO).includes(value);
      },
    },
    {
      title: `${t('WP NAME')}`,
      dataIndex: 'projectName',
      key: 'projectName',
      responsive: ['sm'],
    },
    {
      title: `${t('CUSTOMER')}`,
      dataIndex: 'companyName',
      key: 'companyName',
      width: '12%',

      responsive: ['sm'],
    },
    {
      title: `${t('A/C NBR')}`,
      dataIndex: 'planeNumber',
      key: 'planeNumber',
      responsive: ['sm'],
    },
    {
      title: `${t('WP TYPE')}`,
      dataIndex: 'WOType',
      key: 'WOType',
      responsive: ['sm'],
      valueType: 'select',
      valueEnum: {
        baseMaintanance: { text: t('BASE MAINTENANCE') },
        lineMaintanance: { text: t('LINE MAINTENANCE') },
        partCange: { text: t('COMPONENT CHANGE') },
        addWork: { text: t('ADD WORK') },
        enginiring: { text: t('ENGINEERING SERVICES') },
        nonProduction: { text: t('NOT PRODUCTION SERVICES') },
      },
    },
    {
      title: `${t('Status')}`,
      dataIndex: 'status',

      key: 'status',
      width: '9%',
      editable: (text, record, index) => {
        return false;
      },

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
    // {
    //   title: 'LAST MODIFIED',
    //   dataIndex: 'updateDate',
    //   key: 'updateDate',
    //   valueType: 'date',
    //   sorter: (a, b) => {
    //     if (a.updateDate && b.updateDate) {
    //       const aFinishDate = new Date(a.updateDate);
    //       const bFinishDate = new Date(b.updateDate);
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
      title: `${t('DATE IN')}`,
      dataIndex: 'startDate',
      key: 'startDate',
      valueType: 'date',
      sorter: (a, b) => {
        if (a.startDate && b.startDate) {
          const aFinishDate = new Date(a.startDate);
          const bFinishDate = new Date(b.startDate);
          return aFinishDate.getTime() - bFinishDate.getTime();
        } else {
          return 0; // default value
        }
      },
      renderFormItem: () => {
        return <RangePicker />;
      },
    },

    // width: '17%',

    {
      title: `${t('DATE OUT')}`,
      dataIndex: 'finishDate',
      key: 'finishDate',
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
      title: `${t('DATE CLOSE')}`,
      dataIndex: 'dateClose',
      key: 'dateClose',

      valueType: 'date',
      sorter: (a, b) => {
        if (a.dateClose && b.dateClose) {
          const aFinishDate = new Date(a.dateClose);
          const bFinishDate = new Date(b.dateClose);
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
      title: `${t('DOC')}`,
      dataIndex: 'doc',
      key: 'doc',
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
      filters: [{ text: 'DOC', value: true }],
      onFilter: (value, record) => {
        if (value) {
          return !!record.doc;
        } else {
          return true;
        }
      },
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
  ];
  const [columns, setColumns] = useState(initialColumns);
  const [selectedColumns, setSelectedColumns] = useState(
    columns.map((column: any) => column.key)
  );
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const handleMenuClick = (e: { key: React.Key }) => {
    if (selectedColumns.includes(e.key)) {
      setSelectedColumns(selectedColumns.filter((key: any) => key !== e.key));
    } else {
      setSelectedColumns([...selectedColumns, e.key]);
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
                  data,
                  `Filtred-WO-${data[0].projectName}`
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
                data.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  visibleColumns,
                  data,
                  `ALL-WO-${data[0].projectName}`
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
      icon: <SettingOutlined />,
      children: [
        getItem(
          <div
            onClick={() => {
              const selectedCount = selectedRowKeys && selectedRowKeys.length;
              if (selectedCount !== 1) {
                message.error('Please select only one Item.');
                return;
              }

              setOpenEditWOForm(true);
            }}
          >
            <EditOutlined /> Edit WO
          </div>,
          '9sshhhxs'
        ),
        getItem(
          <div
            onClick={async () => {
              const selectedCount = selectedRowKeys && selectedRowKeys.length;
              if (selectedCount !== 1) {
                message.error('Please select only one Item.');
                return;
              }
            }}
          >
            <CloseOutlined /> Close WO
          </div>,
          '9sshsssshhxs'
        ),
        getItem(
          <div
            onClick={async () => {
              const currentPlaneID = localStorage.getItem('currentPlaneID');
              const selectedCount = selectedRowKeys && selectedRowKeys.length;
              if (selectedCount !== 1) {
                message.error('Please select only one Item.');
                return;
              }
            }}
          >
            <StopOutlined /> Cansel WO
          </div>,
          '9sshssssishhxs'
        ),
      ],
    },
  ];
  //

  const [openProjectInfoForm, setOpenProjectInfoForm] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };
  return (
    <div className="flex my-0  flex-col  h-[78vh] relative overflow-hidden">
      {currentProject && currentProject.projectName && (
        <DrawerPanel
          title={currentProject.projectName}
          size={'medium'}
          placement={'right'}
          open={openProjectInfoForm}
          onClose={setOpenProjectInfoForm}
          children={undefined}
          getContainer={false}
        ></DrawerPanel>
      )}

      <EditableTable
        data={data}
        initialColumns={initialColumns}
        isLoading={isLoading}
        menuItems={items}
        recordCreatorProps={false}
        onRowClick={function (record: any, rowIndex?: any): void {
          dispatch(setCurrentProject(record));
          dispatch(setNullProjectTasks([]));
          dispatch(
            getFilteredGroups({
              projectId: record._id,
              companyID: record.companyID,
            })
          );

          setOpenProjectInfoForm(true);
        }}
        onSave={function (rowKey: any, data: any, row: any): void {
          console.log(rowKey);
        }}
        yScroll={76}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onVisibleColumnsChange={handleVisibleColumnsChange}
        externalReload={function (): Promise<void> {
          throw new Error('Function not implemented.');
        }}
        // onTableDataChange={}
      />
      <DrawerPanel
        title={`Edit WP: ${currentProject?.projectName}(W/O: ${currentProject?.projectWO})`}
        size={'medium'}
        placement={'right'}
        open={openEditWOForm}
        onClose={setOpenEditWOForm}
      >
        <WOEditForm selectedWOumber={currentProject?._id}></WOEditForm>
      </DrawerPanel>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default WPList;
