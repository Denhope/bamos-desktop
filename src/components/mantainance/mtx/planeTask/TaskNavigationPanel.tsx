import React, { FC, useState } from 'react';
import {
  AppstoreOutlined,
  MailOutlined,
  DownloadOutlined,
  SettingOutlined,
  DeleteColumnOutlined,
  PlusOutlined,
  FilterOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { Checkbox, Dropdown, Menu, MenuProps, Row, Space } from 'antd';
import AicraftList from '../airCraft/AicrafViewList';
import AddTaskPackageform from './AddTaskPackageform';
import DownloadTaskPackageView from './DownloadTaskPackageView';
import TaskFilteredForm from './TaskFilteredFormView';
import { useTypedSelector } from '@/hooks/useTypedSelector';
import { useTranslation } from 'react-i18next';
interface TaskNavigationPanelProps {
  toggleColumn: (columnKey: any) => void;
  columns: any;
  initialColumns: any;
}
const TaskNavigationPanel = ({
  columns,
  toggleColumn,
  initialColumns,
}: TaskNavigationPanelProps) => {
  const [open, setOpen] = useState(false);
  const [openAddPackForm, setOpenAddPackForm] = useState(false);
  const [openTaskFilterForm, setopenTaskFilterForm] = useState(false);
  const { t } = useTranslation();
  const menu = (
    <Menu>
      {initialColumns.map((column: any) => (
        <Menu.Item key={column.key}>
          <Checkbox
            checked={columns.some(
              (col: { key: any }) => col.key === column.key
            )}
            onChange={() => toggleColumn(column.key)}
          >
            {column.title}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );
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
      label: 'VIEWS',
      key: 'views',
      icon: <SettingOutlined />,
      children: [
        {
          label: (
            <Dropdown overlay={menu}>
              <a onClick={(e) => e.preventDefault()}>Columns</a>
            </Dropdown>
          ),
          key: 'setting:188',
        },

        getItem('Saved Views', 'sub4', <DeleteColumnOutlined />, [
          getItem(
            <div onClick={() => console.log('Quick Print Card open Form')}>
              Default
            </div>,
            '9445'
          ),
          getItem(
            <div onClick={() => console.log('Quick Print Card open Form')}>
              User Default
            </div>,
            '10444'
          ),
        ]),
      ],
    },
    // {
    //   label: (
    //     <div onClick={() => setopenTaskFilterForm(true)}>
    //       <FilterOutlined className="mr-2" />
    //       FILTERS
    //     </div>
    //   ),
    //   key: 'filter',
    // },
    // {
    //   label: 'Sort By',
    //   key: 'sort',
    //   icon: <AppstoreOutlined />,
    // },
    {
      label: `${t('Print')}`,
      key: 'print',
      icon: <AppstoreOutlined />,
      children: [
        {
          label: (
            <div onClick={() => console.log('Quick Print Card open Form')}>
              <PrinterOutlined className="mr-2" />
              Quick Print Card
            </div>
          ),

          key: 'setting:1',
        },
        getItem('Print Status Report', 'sub4', <PrinterOutlined />, [
          getItem(
            <div onClick={() => console.log('Quick Print Card open Form')}>
              Selected Items
            </div>,
            '9'
          ),
          getItem(
            <div onClick={() => console.log('Quick Print Card open Form')}>
              Complete Items
            </div>,
            '10'
          ),
          getItem(
            <div onClick={() => console.log('Quick Print Card open Form')}>
              All Items
            </div>,
            '11'
          ),
        ]),
      ],
    },

    {
      label: `${t('Actions')}`,
      key: 'actions',
      icon: <SettingOutlined />,
      children: [
        getItem('Add to Work Order', 'sub09', <PlusOutlined />, [
          getItem(
            <div onClick={() => console.log('New Work Order open Form')}>
              New Work Order
            </div>,
            '9ss'
          ),
          getItem(
            <div onClick={() => console.log('Quick Print Card open Form')}>
              1111
            </div>,
            '1011'
          ),
          getItem(
            <div onClick={() => console.log('Quick Print Card open Form')}>
              345
            </div>,
            '1111'
          ),
        ]),
        getItem('Add to Group', 'sub09s', <PlusOutlined />, [
          getItem(
            <div onClick={() => console.log('New Work Order open Form')}>
              New Group
            </div>,
            '9sxs'
          ),
          getItem(
            <div onClick={() => console.log('Quick Print Card open Form')}>
              1111
            </div>,
            '10x11'
          ),
          getItem(
            <div onClick={() => console.log('Quick Print Card open Form')}>
              345
            </div>,
            '11x11'
          ),
        ]),
        getItem(
          <div onClick={() => console.log('Edit Selected Task open Form')}>
            Edit Selected Task
          </div>,
          '9sxs'
        ),
        getItem('Add New Task to', 'sub09gts', <PlusOutlined />, [
          getItem(
            <div
              onClick={() => console.log('Add New Task to  AirCraft open Form')}
            >
              Simple Task
            </div>,
            '9sssxs'
          ),
          getItem(
            <div onClick={() => setOpenAddPackForm(true)}>
              <DownloadOutlined /> Download Package
            </div>,
            '9sessxs'
          ),
        ]),
      ],
    },
    {
      label: 'Update',
      children: [
        {
          label: (
            <div onClick={() => console.log('Update Task open Form')}>
              Update Task
            </div>
          ),
          key: '1563',
        },
      ],

      key: 'update',
    },
    // {
    //   label: `${t(`AIRCRAFT`)}`,
    //   children: [
    //     {
    //       label: <div onClick={() => setOpen(true)}>AirCraft List</div>,
    //       key: '1iu3',
    //     },
    //   ],

    //   key: 'airCraft',
    // },
  ];
  const [current, setCurrent] = useState('mail');

  const onClick: MenuProps['onClick'] = (e) => {
    // console.log('click ', e);
    setCurrent(e.key);
  };
  const { planesTasks } = useTypedSelector((state) => state.planes);

  return (
    <>
      <AicraftList open={open} setOpen={setOpen} taskNumber={undefined} />
      <DownloadTaskPackageView
        open={openAddPackForm}
        setOpen={setOpenAddPackForm}
      ></DownloadTaskPackageView>
      <TaskFilteredForm
        open={openTaskFilterForm}
        setOpen={setopenTaskFilterForm}
      ></TaskFilteredForm>
      <div className="my-0 py-0">
        <Menu
          style={{
            // marginLeft: 'auto',
            background: 'rgba(255, 255, 255, 00)',
          }}
          onClick={onClick}
          selectedKeys={[current]}
          mode="horizontal"
          items={items}
        />
        {/* <Row>A/C: {'RRRRRRRRR'}</Row> */}
      </div>
    </>
  );
};

export default TaskNavigationPanel;
