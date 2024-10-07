import { ProColumns } from '@ant-design/pro-components';
import { DatePicker, MenuProps, message } from 'antd';
import MenuItem from 'antd/es/menu/MenuItem';
import EditableTable from '@/components/shared/Table/EditableTable';
import { useColumnSearchProps } from '@/components/shared/Table/columnSearch';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import React, { FC, useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import DrawerPanel from '@/components/shared/DrawerPanel';
import GroupAddForm from './GroupAddForm';
import {
  deleteGroupsByIds,
  getFilteredGroups,
  updateGroupByID,
} from '@/utils/api/thunks';
import { useTranslation } from 'react-i18next';
type GroupsListPropsType = {
  // isLoading: boolean;
  onRowClick: (record: any) => void;
};
const GroupsList: FC<GroupsListPropsType> = ({ onRowClick }) => {
  const dispatch = useAppDispatch();
  const { RangePicker } = DatePicker;
  const [dataSource, setDataSource] = useState<any[]>([]);
  const { projectTasks, isLoading, currentProject, projectGroups } =
    useTypedSelector((state) => state.mtbase);
  const companyID = localStorage.getItem('companyID');
  const [openAddGroupForm, setOpenAddGroupForm] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    setDataSource(projectGroups);
  }, [currentProject?._id, projectGroups]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };
  const initialColumns: ProColumns<any>[] = [
    {
      title: `${t('GROUP NAME')}`,
      dataIndex: 'groupName',
      key: 'groupName',
      // width: '7%',
      editable: (text, record, index) => {
        return true;
      },

      render: (text: any, record: any) => {
        return (
          <a
            onClick={() => {
              onRowClick(record);
              // dispatch(setCurrentProjectTask(record));
              // setOpenTaskDrawer(true);
            }}
          >
            {record.groupName && record.groupName}
          </a>
        );
      },
      ...useColumnSearchProps({
        dataIndex: 'groupName',
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
      title: `${t('GROUP DESCRIPTION')}`,
      dataIndex: 'groupDescription',
      key: 'groupDescription',
      // width: '7%',
      editable: (text, record, index) => {
        return true;
      },

      ...useColumnSearchProps({
        dataIndex: 'groupDescription',
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
      title: `${t('CREATE DATE')}`,
      editable: (text, record, index) => {
        return false;
      },

      dataIndex: 'createDate',
      key: 'createDate',
      // width: '7%',
      responsive: ['lg'],
      valueType: 'date',
      sorter: (a, b) => {
        if (a.createDate && b.createDate) {
          const aFinishDate = new Date(a.createDate);
          const bFinishDate = new Date(b.createDate);
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
      title: `${t('CREATE BY')}`,
      dataIndex: ['createUser', 'name'],
      key: 'name',
      // width: '7%',
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: `${t('Status')}`,
      dataIndex: 'status',

      key: 'status',
      width: '9%',
      editable: (text, record, index) => {
        return true;
      },

      filters: true,
      onFilter: true,
      valueType: 'select',
      filterSearch: true,
      valueEnum: {
        open: { text: t('OPEN'), status: 'Default' },
        inProgress: { text: t('IN_PROGRESS'), status: 'Processing' },
        closed: { text: t('CLOSE'), status: 'SUCCESS' },
        canceled: { text: t('CANCELED'), status: 'Error' },
      },
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
            action?.startEditable?.(record._id);
          }}
        >
          Edit
        </a>,
      ],
    },
  ];
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
      label: `${t('Add Group')}`,
      key: 'add',
      icon: <PlusOutlined />,
      onClick: () => {
        setOpenAddGroupForm(true);
      },
    },
    {
      label: `${t('Actions')}`,
      key: 'actions',
      icon: null,
      children: [
        getItem(
          <div
            onClick={async () => {
              const selectedCount = selectedRowKeys && selectedRowKeys.length;
              if (selectedCount < 1) {
                message.error('Please select  Items.');
                return;
              }
              const result = dispatch(
                deleteGroupsByIds({
                  ids: selectedRowKeys,
                  projectID: currentProject?._id,
                })
              );
              if ((await result).meta.requestStatus === 'fulfilled') {
                const res = await dispatch(
                  getFilteredGroups({
                    projectId: currentProject?._id || '',
                    companyID: currentProject?.companyID || '',
                  })
                );

                if ((await res).meta.requestStatus === 'fulfilled') {
                  setDataSource(res.payload);
                }
              }
            }}
          >
            Delete selected Item
          </div>,
          'deleteGroup',
          ''
        ),

        //   getItem('Update Status selected items', 'subydd09', '', [
        //     getItem(
        //       <div
        //         onClick={async () => {
        //           const selectedCount = selectedRowKeys && selectedRowKeys.length;
        //           if (selectedCount < 1) {
        //             message.error('Please select  Items.');
        //             return;
        //           }
        //           // console.log(selectedRowKeys);
        //           // const result = await dispatch(
        //           //   updateProjectTasksByIds({
        //           //     status: 'inProgress',
        //           //     ids: selectedRowKeys,
        //           //   })
        //           // );
        //           // if (result.meta.requestStatus === 'fulfilled') {
        //           //   selectedRowKeys.forEach((rowKey) => {
        //           //     const index = projectTasks.findIndex(
        //           //       (task) => task._id === rowKey
        //           //     );
        //           //     if (index !== -1) {
        //           //       const updatedTask = result.payload.find(
        //           //         (task: any) => task._id === rowKey
        //           //       );
        //           //       if (updatedTask) {
        //           //         dispatch(
        //           //           setUpdatedProjectTask({
        //           //             index: index,
        //           //             task: {
        //           //               ...projectTasks[index],
        //           //               status: 'inProgress',
        //           //             },
        //           //           })
        //           //         );
        //           //       }
        //           //     }
        //           //   });
        //           // }
        //         }}
        //       >
        //         In Progress
        //       </div>,
        //       '9sasyhqss'
        //     ),

        //     getItem(
        //       <div
        //         onClick={async () => {
        //           const selectedCount = selectedRowKeys && selectedRowKeys.length;
        //           if (selectedCount < 1) {
        //             message.error('Please select Items.');
        //             return;
        //           }
        //           // console.log(selectedRowKeys);
        //           // const result = await dispatch(
        //           //   updateProjectTasksByIds({
        //           //     status: 'canceled',
        //           //     ids: selectedRowKeys,
        //           //   })
        //           // );
        //           // if (result.meta.requestStatus === 'fulfilled') {
        //           //   selectedRowKeys.forEach((rowKey) => {
        //           //     const index = projectTasks.findIndex(
        //           //       (task) => task._id === rowKey
        //           //     );
        //           //     if (index !== -1) {
        //           //       const updatedTask = result.payload.find(
        //           //         (task: any) => task._id === rowKey
        //           //       );
        //           //       if (updatedTask) {
        //           //         dispatch(
        //           //           setUpdatedProjectTask({
        //           //             index: index,
        //           //             task: {
        //           //               ...projectTasks[index],
        //           //               status: 'canceled',
        //           //             },
        //           //           })
        //           //         );
        //           //       }
        //           //     }
        //           //   });
        //           // }
        //         }}
        //       >
        //         Canceled
        //       </div>,
        //       '9saqs46ms'
        //     ),
        //   ]),
      ],
    },
  ];
  return (
    <div className="flex my-0 mx-auto flex-col h-[78vh] relative overflow-hidden">
      <EditableTable
        actionRenderDelete={false}
        data={dataSource}
        initialColumns={initialColumns}
        isLoading={isLoading}
        menuItems={items}
        onRowClick={function (record: any): void {
          // onRowClick(record);
          // console.log(record);
        }}
        onSave={async function (
          rowKey: any,
          data: any,
          row: any
        ): Promise<void> {
          const result = await dispatch(
            updateGroupByID({
              id: rowKey,
              projectID: currentProject ? currentProject._id : '',
              groupName: data.groupName,
              groupDescription: data.groupDescription,
              status: data.status,
            })
          );
          if (result.meta.requestStatus === 'fulfilled') {
            dispatch(
              getFilteredGroups({
                projectId: currentProject?._id || '',
                companyID: currentProject?.companyID || '',
              })
            );
          }
        }}
        yScroll={51}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onVisibleColumnsChange={handleVisibleColumnsChange}
        recordCreatorProps={false}
        externalReload={function (): Promise<void> {
          throw new Error('Function not implemented.');
        }}
      ></EditableTable>
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
    </div>
  );
};

export default GroupsList;
