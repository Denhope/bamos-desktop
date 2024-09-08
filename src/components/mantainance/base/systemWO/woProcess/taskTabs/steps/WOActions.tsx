import React, { FC, useEffect, useState } from 'react';
import { MenuProps } from 'antd';

import { DownloadOutlined, StopOutlined } from '@ant-design/icons';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';

import { exportToExcel } from '@/services/utilites';
import {
  setCurrentAction,
  setCurrentActionIndexMtb,
  setUpdatedProjectTask,
} from '@/store/reducers/MtbSlice';

import { getFilteredProjectTask, updateProjectTask } from '@/utils/api/thunks';
import EditableTable from '@/components/shared/Table/EditableTable';
import { ProColumns } from '@ant-design/pro-components';
import { IActionType, IProjectTask } from '@/models/IProjectTaskMTB';
import { useTranslation } from 'react-i18next';
import { USER_ID } from '@/utils/api/http';

export interface IActionDescriptionListPrors {
  data1: IActionType[];
  currentActiveIndex: any;
  onActiveClick: (record: any) => void;
  onActiveAction: (record: any) => void;
  updatedData: (record: any) => void;
  currentProjectTask: IProjectTask | null;
}

const WOActionDescriptionList: FC<IActionDescriptionListPrors> = ({
  data1,
  currentActiveIndex,
  onActiveClick,
  onActiveAction,
  currentProjectTask,
  updatedData,
}) => {
  const {
    isLoading,
    // currentProjectTask,
    currentAction,
    projectTasks,
    // currentActiveIndex,
  } = useTypedSelector((state) => state.mtbase);

  const [currentActiveIndexT, setCurrentActiveIndex] =
    useState(currentActiveIndex);

  const [openAddStepForm, setOpenAddStepForm] = useState(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [editingDescription, setEditingDescription] = useState('');

  const [editing, setEditing] = useState(false);
  const [editableRecord, setEditableRecord] = useState<IActionType | null>(
    null
  );
  const columns: ProColumns<IActionType>[] = [
    {
      title: `${t('Steps')}`,
      dataIndex: 'actionNumber',
      key: 'actionNumber',
      responsive: ['sm'],
      width: '9%',
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: `${t('DESCRIPTIONS')}`,
      dataIndex: 'actionDescription',
      key: 'actionDescription',
      //ellipsis: true,

      // },
      responsive: ['sm'],
    },
    {
      title: `${t('PERFOMED')}`,
      width: '14%',
      dataIndex: 'performedSing',
      key: 'performedSing',
      responsive: ['sm'],
      editable: (text, record, index) => {
        return false;
      },
      // width: '8%',
    },
    {
      title: `${t('INSPECTION')}`,
      width: '14%',
      dataIndex: 'inspectedSing',
      key: 'inspectedSing',
      responsive: ['sm'],
      // width: '8%',
      editable: (text, record, index) => {
        return false;
      },
    },

    // },
    {
      title: `${t('OPTION')}`,
      valueType: 'option',
      key: 'option',
      width: '14%',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.actionNumber);
          }}
        >
          Edit
        </a>,
      ],
    },
  ];
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [dataState, setData] = useState<any>(data1);
  useEffect(() => {
    setData(data1);
  }, [dispatch]);

  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleVisibleColumnsChange = (newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  };
  useEffect(() => {
    if (currentProjectTask) {
      onActiveAction(currentProjectTask?.actions?.[0] || null);
      setSelectedRowKey(1);
    }
  }, []);

  useEffect(() => {
    if (currentActiveIndexT) {
      onActiveAction(
        currentProjectTask?.actions?.[currentActiveIndexT] || null
      );
    }
  }, [currentAction, currentActiveIndexT, currentProjectTask]);

  const dataEmpty = [
    {
      actionDescription: '',
      performedSing: '',
      performedDate: '',
      performedTime: '',
    },
  ];
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedRowKey, setSelectedRowKey] = useState<number | null>(1);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleDeleteSelectedItems = () => {
    // Удаляем выбранные строки из данных
    const updatedData = dataState.filter(
      (row: any) =>
        row.actionNumber && !selectedRowKeys.includes(row.actionNumber)
    );

    // Обновляем данные

    dispatch(
      updateProjectTask({
        actions: updatedData,
        id: currentProjectTask?._id,
      })
    );

    // Очищаем выбранные ключи
    setSelectedRowKeys([]);
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
                  dataState,
                  `Filtred-Actions-${
                    currentProjectTask && currentProjectTask?.taskNumber
                  }`
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
                dataState.length &&
                exportToExcel(
                  true,
                  selectedRowKeys,
                  visibleColumns,
                  dataState,
                  `ALL-Actions-${
                    currentProjectTask && currentProjectTask?.taskNumber
                  }`
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
        getItem(' Update Selected Steps', 'subydd09', '', [
          getItem(
            <div onClick={() => console.log('New Work Order open Form')}>
              Perfomed Step
            </div>,
            '9saqrrss'
          ),
          getItem(
            <div onClick={() => console.log('New Work Order open Form')}>
              Inspected Step
            </div>,
            '9saryjsyhqss'
          ),
          getItem(
            <div onClick={() => console.log('New Work Order open Form')}>
              DInspected Step
            </div>,
            '9sasmvfyhqss'
          ),
        ]),

        getItem(
          <div onClick={handleDeleteSelectedItems}>
            <StopOutlined /> Delete Selected Items
          </div>,
          '9ss2hhhxs'
        ),
      ],
    },
  ];
  const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>(
    'bottom'
  );
  return (
    <div className="flex my-0 mx-auto flex-col  overflow-hidden relative ">
      <EditableTable
        recordCreatorProps={
          currentProjectTask?.status !== 'closed'
            ? {
                position: position as 'top',
                record: () => ({
                  actionNumber: dataState?.length ? dataState.length + 1 : 1,
                  cteateDate: new Date(),
                  actionCteateUserID: USER_ID,
                }),
                creatorButtonText: 'ADD NEW STEP',
              }
            : false
        }
        data={data1}
        initialColumns={columns}
        isLoading={isLoading}
        menuItems={items}
        onRowClick={function (record: any, rowIndex: number): void {
          setSelectedRowKey(record.actionNumber || null);
          // console.log(record.actionNumber);
          // console.log(rowIndex);
          onActiveAction(record);
          // dispatch(setCurrentActionIndexMtb(rowIndex));
          onActiveClick(rowIndex);
          setCurrentActiveIndex(rowIndex);
        }}
        onSave={async function (
          rowKey: any,
          data: any,
          row: any
        ): Promise<void> {
          let updatedActions = currentProjectTask?.actions || [];
          let updatedAction = {
            ...updatedActions[data.index],
            actionDescription: data.actionDescription,
            actionNumber: data.actionNumber,
            updateDate: new Date(),
            actionUpdateUserID: USER_ID,
          };
          updatedActions = [
            ...updatedActions.slice(0, data.index),
            updatedAction,
            ...updatedActions.slice(data.index + 1),
          ];
          const result = await dispatch(
            updateProjectTask({
              actions: updatedActions,
              id: currentProjectTask?._id,
            })
          );
          //setData(updatedActions);
          //console.log(updatedActions);
          if (result.meta.requestStatus === 'fulfilled') {
            updatedData(result.payload);
            // setData(updatedActions);
            setData(result.payload.actions);
            const index = projectTasks.findIndex(
              (task) => task._id === currentProjectTask?._id
            );
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
        yScroll={34}
        onSelectedRowKeysChange={handleSelectedRowKeysChange}
        onVisibleColumnsChange={handleVisibleColumnsChange}
        externalReload={() => {
          return dispatch(
            getFilteredProjectTask({
              workOrderNbr: String(currentProjectTask?.projectTaskWO || ''),
            })
          );
        }}
      ></EditableTable>
    </div>
  );
};

export default WOActionDescriptionList;
