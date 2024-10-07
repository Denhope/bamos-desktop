import TabContent from '@/components/shared/Table/TabContent';
import React, { FC, useState } from 'react';
import TaskDetails from './taskTabs/TaskDetails';
import StepsContent from './taskTabs/StepsContent';

import RequirementItems from './taskTabs/RequirementItems';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';

import { ModalForm, ProColumns } from '@ant-design/pro-components';
import EditableTable from '@/components/shared/Table/EditableTable';
import CloseContent from '../../wp/activeTask/close/CloseContent';
import NRCStepForm from '../../wp/activeTask/addNRC/NRCStepForm';
import GeneretedWOPdf from '@/components/pdf/GeneretedWOPdf';
import { useTranslation } from 'react-i18next';
import NavigationPanel from '@/components/shared/NavigationPanel';
import { MenuProps, Row, Space, Tag, message } from 'antd';
import {
  DownloadOutlined,
  StopOutlined,
  SettingOutlined,
  PlusOutlined,
  PrinterOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { updateProjectTask } from '@/utils/api/thunks';
import { setUpdatedProjectTask } from '@/store/reducers/MtbSlice';
import Title from 'antd/es/typography/Title';
type WOTaskProps = { currentTask: any };

const WOTask: FC<WOTaskProps> = ({ currentTask }) => {
  const [currentUpdatedTask, setUpdatedTask] = useState(currentTask);

  const [selectedObject, setSelectedObject] = useState({
    PART_NUMBER: '',
    QUANTITY: 0,
    NAME_OF_MATERIAL: '',
  });
  const [requirementRecord, setRequirementRecord] = useState(false);
  const { t } = useTranslation();
  const [requirementDrawer, setOpenRequirementDrawer] = useState(false);
  const [issuedRecord, setIssuedRecord] = useState(false);
  const [issuedtDrawer, setOpenIssuedDrawer] = useState(false);
  const { isLoadingReq } = useTypedSelector((state) => state.mtbase);
  const onIssuedClick = (record: any) => {
    setIssuedRecord(record);
    setOpenIssuedDrawer(true);
  };
  const onReqClick = (record: any) => {
    setRequirementRecord(record);
    setOpenRequirementDrawer(true);
  };
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
  const [columns, setColumns] = useState([]);

  const [selectedColumns, setSelectedColumns] = useState(
    columns.map((column: any) => column.key)
  );

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
  const dispatch = useAppDispatch();
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
                    id: currentUpdatedTask?._id,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  setUpdatedTask(result.payload);
                  const companyID = localStorage.getItem('companyID');
                  const index = projectTasks.findIndex(
                    (task) => task._id === currentUpdatedTask?._id
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
                    id: currentUpdatedTask?._id,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  setUpdatedTask(result.payload);
                  const companyID = localStorage.getItem('companyID');
                  const index = projectTasks.findIndex(
                    (task) => task._id === currentUpdatedTask?._id
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
  const { projectTasks } = useTypedSelector((state) => state.mtbase);
  return (
    <div className="flex flex-col mx-auto h-[78vh] overflow-hidden">
      {currentUpdatedTask && (
        <>
          <Row align={'middle'} justify={'space-between'}>
            <Title className="py-0 my-0 w-5/6" level={5}>
              {`${currentUpdatedTask?.taskNumber?.toUpperCase()} ###${currentUpdatedTask?.taskDescription?.toUpperCase()}`}{' '}
            </Title>

            <Row align={'middle'}>
              <Tag
                color={
                  currentUpdatedTask?.status === 'closed' ? 'green' : 'red'
                }
              >
                {String(
                  currentUpdatedTask?.status ? currentUpdatedTask?.status : ''
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
          </Row>

          <TabContent
            tabs={[
              {
                content: <TaskDetails task={currentUpdatedTask} />,
                title: `${t('Details')}`,
              },
              {
                content: (
                  <>
                    <div className="flex col relative overflow-hidden">
                      <RequirementItems
                        projectTaskData={currentUpdatedTask}
                        scroll={54}
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
                content: (
                  <StepsContent
                    task={currentUpdatedTask}
                    upData={setUpdatedTask}
                  />
                ),
                title: `${t('Steps')}`,
              },
              {
                content: (
                  <CloseContent
                    task={currentUpdatedTask}
                    upData={setUpdatedTask}
                  />
                ),
                title: `${t('Close Work Order')}`,
              },
              {
                content: (
                  <NRCStepForm
                    disabled={currentUpdatedTask?.status !== 'inProgress'}
                    task={currentUpdatedTask}
                    projectTasks={projectTasks}
                  />
                ),
                title: `${t('+ Add NRC')}`,
              },
              {
                content: (
                  <GeneretedWOPdf scroll="68vh" task={currentUpdatedTask} />
                ),
                title: `${t('Work Card')}`,
              },
            ]}
          />
        </>
      )}

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
          isLoading={isLoadingReq}
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
    </div>
  );
};

export default WOTask;
