//@ts-nocheck
import React, { FC, useEffect, useState } from 'react';
import {
  Button,
  Card,
  List,
  Space,
  Tag,
  Popover,
  Modal,
  Input,
  Form,
  TimePicker,
  DatePicker,
  Row,
  Popconfirm,
  MenuProps,
  message,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import {
  SnippetsOutlined,
  FieldTimeOutlined,
  SettingOutlined,
  EyeOutlined,
  UserOutlined,
} from '@ant-design/icons';

import {
  EditableProTable,
  ModalForm,
  ProCard,
  ProColumns,
  ProDescriptions,
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormGroup,
  ProFormItem,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormTimePicker,
  ProList,
  ProTable,
} from '@ant-design/pro-components';
import UserSearchForm from '@/components/shared/form/UserSearchProForm';
import { UserResponce } from '@/models/IUser';
import moment from 'moment';
import { IActionType } from '@/models/IAdditionalTaskMTB';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import { useTranslation } from 'react-i18next';
import { updateAdditionalTask } from '@/utils/api/thunks';
import { setUpdatedProjectAdditionalTask } from '@/store/reducers/MtbSlice';
import { v4 as originalUuidv4 } from 'uuid'; // Импортируйте библиотеку uuid
import EditableTable from '@/components/shared/Table/EditableTable';
import { getItem } from '@/services/utilites';
import { USER_ID } from '@/utils/api/http';
export interface INRCSTEPPrors {
  data: IStep[];
  currentProjectId: string | null;
  taskId: string | null;
  currentTask: any;
}
interface IStep {
  id: string;
  stepDescription?: string | null;
  stepHeadLine?: string | null;
  createDate?: any;
  actions: any[];
  finalActions?: any;
  status?: any;
  createById: string | null;
  createUser?: { createSing?: any; createName?: any };
}
interface Action {
  title: JSX.Element;
  subTitle: string;
  description: string;
  id: string;
  createUser: {
    createSing: string;
    createName: string;
  };
  createDate: Date;
}

interface Item {
  title: JSX.Element;
  avatar: string;
  description: string;
  actions: Action[];
}

const TestNRCStep: FC<INRCSTEPPrors> = ({
  data,
  currentProjectId,
  taskId,
  currentTask,
}) => {
  const [visibleEditTimes, setVisibleEditTimes] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleiInspection, setVisibleInspection] = useState(false);
  const [visibleClose, setVisibleClose] = useState(false);
  const [visibleTimes, setVisibleTimes] = useState(false);
  const [visibleEditInspection, setVisibleEditInspection] = useState(false);
  const [visibleStepEdit, setStepVisible] = useState(false);
  const [visibleStepAdd, setStepAddVisible] = useState(false);
  const [visibleActionEdit, setActionVisible] = useState(false);
  const uuidv4: () => string = originalUuidv4;
  const [form] = Form.useForm();
  const [formEditStep] = Form.useForm();
  const [formEditAction] = Form.useForm();
  const [formEditInspection] = Form.useForm();
  const [formClosed] = Form.useForm();
  const {
    isLoading,
    currentProjectAdditionalTask,
    currentAdditionalAction,
    projectAdditionalTasks,
    currentActiveAdditionalIndex,
  } = useTypedSelector((state) => state.mtbase);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [currentAction, setCurrentAction] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<UserResponce | null>();
  // useEffect(() => {
  //   // Здесь вы можете выполнить любое действие, которое должно произойти после обновления currentItem
  //   console.log('currentItem has been updated:', currentItem);
  //   setCurrentItem(null);
  //   setCurrentAction(null);
  // }, [currentItem, currentAction]);

  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const showStepAddModal = (item: any) => {
    // setCurrentItem(item);
    setStepAddVisible(true);
    setSelectedUser(null);
  };

  const handleStepAddOk = () => {
    setStepAddVisible(false);
    setSelectedUser(null);
    // setCurrentItem(null);
  };

  const handleStepAddCancel = () => {
    setStepAddVisible(false);
    setSelectedUser(null);

    // setCurrentItem(null);
  };

  const showActionEdit = (item: any) => {
    console.log(item);
    setCurrentAction(item);
    setActionVisible(true);
  };

  const handleActionEditOk = () => {
    setActionVisible(false);
    setCurrentAction(null);
  };

  const handleActionEditCancel = () => {
    setActionVisible(false);
    setCurrentAction(null);
  };
  const handleInspectionEditCancel = () => {
    setVisibleEditInspection(false);
    setCurrentAction(null);
  };

  const showStepModal = (item: any) => {
    setCurrentItem(item);
    setStepVisible(true);
  };

  const handleStepOk = () => {
    setStepVisible(false);
    setCurrentItem(null);
    setSelectedUser(null);
    setVisibleInspection(false);
  };

  const handleStepCancel = () => {
    setStepVisible(false);
    setCurrentItem(null);
    setSelectedUser(null);
  };

  const showModal = (item: any) => {
    setCurrentItem(item);
    setVisible(true);
    setSelectedUser(null);
  };
  const showInspectionModal = (item: any) => {
    // setCurrentItem(item);
    // setCurrentAction(item);
    setSelectedUser(null);
    setVisibleInspection(true);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        console.log(values);
        // здесь вы можете обработать значения формы
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
    setCurrentItem(null);
    setCurrentAction(null);
    setSelectedUser(null);
    setVisibleInspection(false);
    setVisibleClose(false);
    setVisibleTimes(false);
    setVisibleEditTimes(false);
  };
  const dateFormat = 'YYYY/MM/DD';
  const timeFormat = 'HH:mm';

  useEffect(() => {
    if (currentAction) {
      formEditAction.setFields([
        { name: 'editPerformedDate', value: moment(currentAction.createDate) },
        { name: 'editPerformedTime', value: moment(currentAction.createDate) },
        { name: 'editPerformedheadline', value: currentAction.headline },
        {
          name: 'editPerformedDescription',
          value: currentAction.description,
        },
        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [currentAction, formEditAction]);
  useEffect(() => {
    if (currentItem) {
      formEditStep.setFields([
        { name: 'editWorkStepDate', value: moment(currentItem.createDate) },
        { name: 'editWorkStepTime', value: moment(currentItem.createDate) },
        { name: 'editWorkStepHeadline', value: currentItem.stepHeadLine },
        { name: 'editStepDescription', value: currentItem.stepDescription },
        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [currentItem, formEditStep]);
  useEffect(() => {
    if (currentTask?.finalAction) {
      formEditStep.setFields([
        {
          name: 'closingDate',
          value:
            moment(currentTask?.finalAction?.closingDate) || moment(new Date()),
        },
        {
          name: 'closingTime',
          value:
            moment(currentTask?.finalAction?.closingDate) || moment(new Date()),
        },

        // Добавьте здесь другие поля, которые вы хотите обновить
      ]);
    }
  }, [currentTask?.finalAction]);
  const handleItemClick = (
    event: React.MouseEvent<HTMLDivElement>,
    action: Action
  ) => {
    event.stopPropagation();
    if (event.ctrlKey) {
      setSelectedStepItems([]);
      setSelectedInspection([]);
      setSelectedItems((prevSelectedItems) =>
        prevSelectedItems.includes(action.id)
          ? prevSelectedItems.filter((id) => id !== action.id)
          : [...prevSelectedItems, action.id]
      );
    } else {
      setSelectedItems((prevSelectedItems) =>
        prevSelectedItems.includes(action.id) ? [] : [action.id]
      );
      setSelectedStepItems([]);
    }
  };
  const handleInspectionItemClick = (
    event: React.MouseEvent<HTMLDivElement>,
    action: Action
  ) => {
    event.stopPropagation();
    if (event.ctrlKey) {
      setSelectedStepItems([]);
      setSelectedItems([]);
      setSelectedInspection((prevSelectedItems) =>
        prevSelectedItems.includes(action.id)
          ? prevSelectedItems.filter((id) => id !== action.id)
          : [...prevSelectedItems, action.id]
      );
    } else {
      setSelectedInspection((prevSelectedItems) =>
        prevSelectedItems.includes(action.id) ? [] : [action.id]
      );
      setSelectedStepItems([]);
      setSelectedItems([]);
    }
  };

  const handleStepClick = (
    event: React.MouseEvent<HTMLDivElement>,
    step: IStep
  ) => {
    event.stopPropagation();
    if (event.ctrlKey) {
      setSelectedItems([]);
      setSelectedInspection([]);
      setSelectedStepItems((prevSelectedItems) =>
        prevSelectedItems.includes(step.id)
          ? prevSelectedItems.filter((id) => id !== step.id)
          : [...prevSelectedItems, step.id]
      );
    } else {
      setSelectedStepItems((prevSelectedItems) =>
        prevSelectedItems.includes(step.id) ? [] : [step.id]
      );
      setSelectedItems([]);
    }
  };
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedStepItems, setSelectedStepItems] = useState<string[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<string[]>([]);
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (!event.target.closest('.ant-space-item')) {
        setSelectedItems([]);
        setSelectedStepItems([]);
        setSelectedInspection([]);
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [selectedItems, selectedStepItems]);

  // useEffect(() => {
  //   const handleClickOutside = () => {
  //     setSelectedStepItems([]);
  //     setSelectedItems([]);
  //   };

  //   window.addEventListener('click', handleClickOutside);
  //   return () => {
  //     window.removeEventListener('click', handleClickOutside);
  //   };
  // }, []);

  // Замените это на ваш реальный список действий
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  useEffect(() => {}, [selectedItems, selectedStepItems]);
  const handleDelete = async (selectedStepItems: string | string[]) => {
    const updatedSteps = data.filter(
      (item) => !selectedStepItems.includes(item.id)
    );

    const result = await dispatch(
      updateAdditionalTask({
        projectId: currentProjectId,
        steps: updatedSteps,
        finalAction: null,
        _id: taskId,
        updateDate: new Date(),
        updateById: USER_ID,
      })
    );
    if (result.meta.requestStatus === 'fulfilled') {
      const index = projectAdditionalTasks.findIndex(
        (task: any) => task._id === currentProjectAdditionalTask?._id
      );
      if (index !== -1) {
        dispatch(
          setUpdatedProjectAdditionalTask({
            index: index,
            task: result.payload,
          })
        );
      }
    }
  };
  const handleDeleteAction = async (selectedItems: string | string[]) => {
    const updatedSteps = data.map((step) => {
      const filteredActions = step.actions.filter(
        (action) => !selectedItems.includes(action.id)
      );
      return { ...step, actions: filteredActions };
    });

    const result = await dispatch(
      updateAdditionalTask({
        projectId: currentProjectId,
        steps: updatedSteps,
        _id: taskId,
        updateDate: new Date(),
        updateById: USER_ID,
      })
    );
    if (result.meta.requestStatus === 'fulfilled') {
      const index = projectAdditionalTasks.findIndex(
        (task: any) => task._id === currentProjectAdditionalTask?._id
      );
      if (index !== -1) {
        dispatch(
          setUpdatedProjectAdditionalTask({
            index: index,
            task: result.payload,
          })
        );
      }
    }
  };
  const handleSelectedRowKeysChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  interface DataType {
    id: string;
    skill: string;
    startTime: string;
    endDate: string;
    createDate: string;
    typeOfWork: string;
    user: {
      createName: string;
      createSing: string;
    };
    createUser: {
      createName: string;
      createSing: string;
    };
  }
  const initialColumns: ProColumns<DataType>[] = [
    {
      title: `${t('SING')}`,
      dataIndex: ['user', 'createSing'],
      editable: (text, record, index) => {
        return false;
      },
      ellipsis: true,
    },
    {
      title: `${t('END TIME')}`,
      dataIndex: 'endDate',
      valueType: 'dateTime',
      editable: (text, record, index) => {
        return true;
      },
      ellipsis: true,
      fieldProps: (form, config) => {
        return { format: 'YYYY-MM-DD HH:mm' };
      },
    },
    {
      title: `${t('END TIME')}`,
      dataIndex: 'endDate',
      valueType: 'dateTime',
      editable: (text, record, index) => {
        return true;
      },
      fieldProps: (form, config) => {
        return { format: 'YYYY-MM-DD HH:mm' };
      },

      ellipsis: true,
    },
    {
      title: `${t('SKILL')}`,
      dataIndex: 'skill',
      valueType: 'select',
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
      editable: (text: any, record: any, index: number) => {
        return true;
      },
    },

    {
      title: `${t('TYPE')}`,
      dataIndex: 'typeOfWork',
      editable: (text, record, index) => {
        return true;
      },
      valueType: 'select',
      valueEnum: {
        ROUTINE: { text: 'ROUTINE' },
        ACCESS: { text: 'ACCESS' },
        ADD_WORK: { text: 'ADD WORK' },
      },
      ellipsis: true,
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
            // setSelectedObject(record);
            action?.startEditable?.(record.id);
          }}
        >
          Edit
        </a>,
      ],
    },
  ];
  const [tableData, setTableData] = useState(currentAction?.times);
  useEffect(() => {
    setTableData(currentAction?.times);
  }, [currentAction?.times]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const items: MenuProps['items'] = [
    {
      label: `${t('Actions')}`,
      key: 'actions',
      icon: null,
      children: [
        getItem('Delete Items ', 'suaab85', <EyeOutlined />, [
          getItem(
            <div
              onClick={async () => {
                const selectedCount = selectedRowKeys && selectedRowKeys.length;
                if (selectedCount < 1) {
                  message.error('Please select Items.');
                  return;
                }
                const companyID = localStorage.getItem('companyID');
              }}
            >
              Selected Items
            </div>,
            '5.18'
          ),
          getItem(<div onClick={async () => {}}>All Items</div>, '5.1827'),
        ]),
      ],
    },
  ];
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="h-[48vh] overflow-y-auto flex flex-col justify-between w-full">
        <div className="">
          {data.map((item, index) =>
            item ? (
              <>
                <Card
                  bodyStyle={{ paddingTop: 2, paddingBottom: 2, width: '100%' }}
                  bordered
                  className={` ${
                    selectedStepItems.includes(item.id) ? 'bg-blue-200' : ''
                  }`}
                  style={{ width: '100%', padding: 0, marginTop: 1 }} // Добавьте эту строку            key={index}
                  title={
                    <div
                      className={`bg-slate-200 cursor-pointer flex justify-between py-0 my-0 px-2 rounded-md ${
                        selectedStepItems.includes(item.id) ? 'bg-blue-200' : ''
                      }`}
                      onClick={(event) => handleStepClick(event, item)}
                    >
                      <Space
                        className="cursor-pointer"
                        onDoubleClick={() => showStepModal(item)}
                        style={{ width: '100%' }}
                      >
                        <SnippetsOutlined />
                        <div className="font-bold">
                          <Space>
                            {index + 1}
                            Work Step
                          </Space>
                        </div>
                        <Space className="ml-auto font-bold">
                          <div>added by:</div>
                          <Tag color="#778D45">
                            {item?.createUser?.createSing}
                          </Tag>
                          <Tag color="#778D45">
                            {item?.createUser?.createName}
                          </Tag>
                        </Space>
                        <Space className="font-bold">
                          {' '}
                          on{' '}
                          {moment(item.createDate).format('YYYY-MM-DD HH:mm')}
                        </Space>
                      </Space>
                      <Space>
                        <Popover content="ADD NEW ACTION">
                          {/* <UserOutlined
            className="text-xl text-blue-800"
            onClick={() => showModal(item)}
          /> */}
                          <Button
                            size="small"
                            className=""
                            type="primary"
                            // shape="circle"
                            icon="+A"
                            onClick={() => showModal(item)}
                          />
                        </Popover>
                      </Space>
                    </div>
                  }
                >
                  <pre>
                    <div
                      onDoubleClick={() => showStepModal(item)}
                      className={`min-w-full cursor-pointer  py-0 my-0${
                        selectedStepItems.includes(item.id) ? 'bg-blue-200' : ''
                      }`}
                    >
                      {item.stepHeadLine}
                    </div>
                    <div
                      onDoubleClick={() => showStepModal(item)}
                      className={`min-w-full cursor-pointer my-0 ${
                        selectedStepItems.includes(item.id) ? 'bg-blue-200' : ''
                      }`}
                    >
                      {item.stepDescription}
                    </div>
                  </pre>
                  <List
                    style={{
                      paddingTop: 0,
                      padding: 0,
                      width: '100%',
                      marginLeft: '10px',
                    }}
                    itemLayout="horizontal"
                    dataSource={item.actions}
                    renderItem={(action: any) => (
                      <List.Item
                        style={{ paddingTop: 0, padding: 0 }}
                        className={` justify-between my-1 py-0 ${
                          selectedStepItems.includes(item.id) ||
                          selectedItems.includes(action.id)
                            ? 'bg-blue-200 rounded-md '
                            : ''
                        }`}
                      >
                        <List.Item.Meta
                          title={
                            <h3
                              style={{
                                marginTop: '1px',
                                paddingTop: 0,
                                paddingBottom: 0,
                              }}
                            >
                              <pre>
                                <div
                                  className={`cursor-pointer flex my-0 justify-between py-0  rounded-sm  px-1 ${
                                    selectedStepItems.includes(item.id) ||
                                    selectedItems.includes(action.id)
                                      ? 'bg-blue-200'
                                      : 'bg-slate-100'
                                  }`}
                                  onClick={(event) =>
                                    handleItemClick(event, action)
                                  }
                                >
                                  <Space
                                    onDoubleClick={() => {
                                      showActionEdit(action);
                                      setCurrentItem(item);
                                    }}
                                    style={{ width: '100%' }}
                                  >
                                    <div>Action</div>
                                    <Space className="ml-auto">
                                      <div>perfomed by:</div>
                                      <Tag color="#5BD8A6">
                                        {action?.createUser?.createSing}
                                      </Tag>
                                      <Tag color="#5BD8A6">
                                        {action?.createUser?.createName}
                                      </Tag>
                                    </Space>
                                    <Space>
                                      on{' '}
                                      {moment(action.createDate).format(
                                        'YYYY-MM-DD HH:mm'
                                      )}
                                    </Space>
                                  </Space>
                                  <Space>
                                    <Popover content="ADD NEW INSPECTION">
                                      <Button
                                        disabled={action?.inspectionAction}
                                        icon="I"
                                        shape="circle"
                                        size="small"
                                        className={` ${
                                          action?.inspectionAction
                                            ? ''
                                            : 'bg-red-400'
                                        }`}
                                        onClick={() => {
                                          setCurrentItem(item);
                                          setCurrentAction(action);
                                          setVisibleInspection(true);
                                        }}
                                      />
                                    </Popover>

                                    <Popover content="COMPONENT CHANGE">
                                      <SettingOutlined
                                        className="text-xl text-orange-800"
                                        onClick={() => null}
                                      />
                                    </Popover>
                                    <Popover content="TIMES">
                                      <FieldTimeOutlined
                                        className="text-xl"
                                        onClick={() => {
                                          setVisibleTimes(true);
                                          setCurrentItem(item);
                                          setCurrentAction(action);
                                        }}
                                      />
                                    </Popover>
                                  </Space>
                                </div>
                              </pre>
                            </h3>
                          }
                          description={
                            <pre>
                              <div className="flex flex-col">
                                <div
                                  style={{ padding: 0 }}
                                  className={`py-0 my-0  cursor-pointer ${
                                    selectedItems.includes(action.id)
                                      ? 'bg-blue-200'
                                      : 'py-0 my-0'
                                  }`}
                                  onClick={(event) =>
                                    handleItemClick(event, action)
                                  }
                                  onDoubleClick={() => {
                                    showActionEdit(action);
                                    setCurrentItem(item);
                                  }}
                                >
                                  <>{action.description}</>
                                </div>
                                {action?.inspectionAction?.description && (
                                  <List.Item
                                    style={{
                                      paddingTop: 0,
                                      padding: 0,
                                      marginLeft: '5px',
                                    }}
                                    className={`cursor-pointer flex my-0   rounded-sm  px-1 ${
                                      selectedStepItems.includes(item.id) ||
                                      selectedInspection.includes(action.id)
                                        ? 'bg-blue-200'
                                        : ''
                                    }`}
                                  >
                                    <List.Item.Meta
                                      style={{
                                        marginTop: '1px',
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                      }}
                                      title={
                                        <h3
                                          style={{
                                            marginTop: '1px',
                                            paddingTop: 0,
                                            paddingBottom: 0,
                                          }}
                                        >
                                          <pre>
                                            <div
                                              className={`cursor-pointer flex my-0 justify-between py-0  rounded-sm  px-1 ${
                                                selectedStepItems.includes(
                                                  item.id
                                                ) ||
                                                selectedInspection.includes(
                                                  action.id
                                                )
                                                  ? 'bg-blue-200'
                                                  : 'bg-amber-400'
                                              }`}
                                              onClick={(event) =>
                                                handleInspectionItemClick(
                                                  event,
                                                  action
                                                )
                                              }
                                            >
                                              <Space
                                                onDoubleClick={() => {
                                                  setVisibleEditInspection(
                                                    true
                                                  );
                                                  setCurrentItem(item);
                                                  setCurrentAction(action);
                                                }}
                                                style={{ width: '100%' }}
                                              >
                                                <div>Inspection Action </div>
                                                <Space className="ml-auto">
                                                  <div>inspected by:</div>
                                                  <Tag color="#fc9403">
                                                    {
                                                      action?.inspectionAction
                                                        ?.createUser?.createSing
                                                    }
                                                  </Tag>
                                                  <Tag color="#fc9403">
                                                    {
                                                      action?.inspectionAction
                                                        ?.createUser?.createName
                                                    }
                                                  </Tag>
                                                </Space>
                                                <Space>
                                                  on{' '}
                                                  {moment(
                                                    action?.inspectionAction
                                                      ?.createDate
                                                  ).format('YYYY-MM-DD HH:mm')}
                                                </Space>
                                              </Space>
                                              <Space>
                                                <Popover content="ADD NEW DI">
                                                  <Button
                                                    disabled
                                                    size="small"
                                                    type="primary"
                                                    shape="circle"
                                                    icon="DI"
                                                    onClick={() => null}
                                                  />
                                                </Popover>

                                                {/* <Popover content="TIMES">
                                                  <FieldTimeOutlined
                                                    className="text-xl"
                                                    onClick={() => null}
                                                  />
                                                </Popover> */}
                                              </Space>
                                            </div>
                                          </pre>
                                        </h3>
                                      }
                                      description={
                                        <pre>
                                          <div
                                            className={`cursor-pointer flex my-0   rounded-sm  px-1 ${
                                              selectedStepItems.includes(
                                                item.id
                                              ) ||
                                              selectedInspection.includes(
                                                action.id
                                              )
                                                ? 'bg-blue-200'
                                                : ''
                                            }`}
                                            // className={`py-0 my-0  cursor-pointer
                                            //   `}
                                            onClick={(event) =>
                                              handleInspectionItemClick(
                                                event,
                                                action
                                              )
                                            }
                                            onDoubleClick={() => {
                                              setVisibleEditInspection(true);
                                              setCurrentItem(item);
                                              setCurrentAction(action);
                                            }}
                                          >
                                            {
                                              action?.inspectionAction
                                                ?.description
                                            }
                                          </div>
                                        </pre>
                                      }
                                    />
                                  </List.Item>
                                )}
                                {action?.times && action?.times?.length ? (
                                  <List.Item
                                    onDoubleClick={() => {
                                      setVisibleEditTimes(true);
                                      setCurrentAction(action);
                                      setCurrentItem(item);
                                    }}
                                    style={{
                                      paddingTop: 0,
                                      padding: 0,
                                      marginLeft: '5px',
                                    }}
                                    className={`cursor-pointer flex my-0   rounded-sm  px-1 ${
                                      selectedStepItems.includes(item.id) ||
                                      selectedItems.includes(action.id)
                                        ? 'bg-blue-200'
                                        : ''
                                    }`}
                                  >
                                    <List.Item.Meta
                                      style={{
                                        marginTop: '1px',
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                      }}
                                      title={
                                        <h3
                                          style={{
                                            marginTop: '1px',
                                            paddingTop: 0,
                                            paddingBottom: 0,
                                          }}
                                        >
                                          <pre>
                                            <div
                                              className={`cursor-pointer flex my-0 justify-between py-0  rounded-sm  px-1 ${
                                                selectedStepItems.includes(
                                                  item.id
                                                ) ||
                                                selectedItems.includes(
                                                  action.id
                                                )
                                                  ? 'bg-blue-200'
                                                  : 'bg-slate-100'
                                              }`}
                                              onClick={(event) => null}
                                            >
                                              <Space
                                                onDoubleClick={() => {
                                                  setVisibleEditTimes(true);
                                                  setCurrentAction(action);
                                                  setCurrentItem(item);
                                                }}
                                                style={{ width: '100%' }}
                                              >
                                                <div>Times </div>
                                                <Space className="ml-auto"></Space>
                                              </Space>
                                            </div>
                                          </pre>
                                        </h3>
                                      }
                                      description={action?.times?.map(
                                        (time: any, index: number) => (
                                          <ProDescriptions column={6}>
                                            <ProDescriptions.Item
                                              span={0.2}
                                              label={`${t('SING')}`}
                                              valueType="text"
                                            >
                                              <Tag>
                                                {time?.user?.createSing}
                                              </Tag>
                                            </ProDescriptions.Item>
                                            <ProDescriptions.Item
                                              span={0.5}
                                              label={`${t('NAME')}`}
                                              valueType="text"
                                            >
                                              <Tag>
                                                {time?.user?.createName}
                                              </Tag>
                                            </ProDescriptions.Item>
                                            <ProDescriptions.Item
                                              span={2}
                                              className="font-bold"
                                              label={`${t('START TIME')}`}
                                              valueType="dateTime"
                                            >
                                              {time.startTime}
                                            </ProDescriptions.Item>
                                            <ProDescriptions.Item
                                              className="font-bold"
                                              span={2}
                                              label={`${t('END TIME')}`}
                                              valueType="dateTime"
                                            >
                                              {time.endDate}
                                            </ProDescriptions.Item>
                                            <ProDescriptions.Item
                                              span={0.5}
                                              label={`${t('SKILL')}`}
                                              valueType="text"
                                            >
                                              <Tag color="geekblue">
                                                {time?.skill}
                                              </Tag>
                                            </ProDescriptions.Item>
                                            <ProDescriptions.Item
                                              span={0.5}
                                              label={`${t('TYPE')}`}
                                              valueType="text"
                                            >
                                              <Tag>{time?.typeOfWork}</Tag>
                                            </ProDescriptions.Item>
                                          </ProDescriptions>
                                        )
                                      )}
                                    />
                                  </List.Item>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </pre>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </>
            ) : (
              <></>
            )
          )}
          {currentTask && currentTask?.finalAction && (
            <Card
              bodyStyle={{
                paddingTop: 2,
                paddingBottom: 2,
                width: '100%',
              }}
              bordered
              title={
                <div
                  className={
                    'bg-slate-200 cursor-pointer flex justify-between py-0 my-0 px-2 rounded-md'
                  }
                >
                  <Space
                    className="cursor-pointer"
                    onDoubleClick={() => null}
                    style={{ width: '100%' }}
                  >
                    <div className="font-bold">
                      <Space>Workorder Closed</Space>
                    </div>
                    {/* <Space className="ml-auto font-bold">
                            <div>added by:</div>
                            <Tag color="#778D45">
                              {currentTask?.finalAction?.createUser?.createSing}
                            </Tag>
                            <Tag color="#778D45">
                              {currentTask?.finalAction?.createUser?.createName}
                            </Tag>
                          </Space> */}
                    <Space className="font-bold">
                      {' '}
                      on{' '}
                      {moment(currentTask?.finalAction?.closingDate).format(
                        'YYYY-MM-DD HH:mm'
                      )}
                    </Space>
                  </Space>
                </div>
              }
            >
              <ProDescriptions>
                <ProDescriptions.Item
                  label={`${t('Closing Date Time')}`}
                  valueType="dateTime"
                >
                  {currentTask?.finalAction?.closingDate}
                </ProDescriptions.Item>
                <ProDescriptions.Item
                  label={`${t('Closing Station')}`}
                  // valueType="dateTime"
                >
                  {/* {currentTask?.finalAction?.closingDate} */}
                </ProDescriptions.Item>
                <ProDescriptions.Item
                  label={`${t('Closing TAH')}`}
                  // valueType="dateTime"
                >
                  {/* {currentTask?.finalAction?.closingDate} */}
                </ProDescriptions.Item>
                <ProDescriptions.Item
                  label={`${t('Closing TAC')}`}
                  // valueType="dateTime"
                >
                  {/* {currentTask?.finalAction?.closingDate} */}
                </ProDescriptions.Item>
                <ProDescriptions.Item
                  label={`${t('Approval No.')}`}
                  // valueType="dateTime"
                >
                  {/* {currentTask?.finalAction?.closingDate} */}
                </ProDescriptions.Item>
                <ProDescriptions.Item
                  label={`${t('Closing Sing')}`}
                  // valueType="dateTime"
                >
                  <Space className="ml-auto font-bold">
                    <Tag color="#778D45">
                      {currentTask?.finalAction?.createUser?.createSing}
                    </Tag>
                    <Tag color="#778D45">
                      {currentTask?.finalAction?.createUser?.createName}
                    </Tag>
                  </Space>
                </ProDescriptions.Item>
              </ProDescriptions>
            </Card>
          )}
        </div>
        <Modal
          footer={false}
          width={'60%'}
          title="WORK STEP EDIT"
          visible={visibleStepEdit}
          onOk={handleStepOk}
          onCancel={handleStepCancel}
        >
          <ProForm
            disabled={currentTask?.status === 'closed'}
            loading={isLoading}
            onFinish={async (values) => {
              // Обновите текущий элемент с новыми значениями
              const updatedItem = {
                ...currentItem,
                createDate: moment(values.editWorkStepDate)
                  .set({
                    hour: moment(values.editWorkStepTime, 'HH:mm').get('hour'),
                    minute: moment(values.editWorkStepTime, 'HH:mm').get(
                      'minute'
                    ),
                  })
                  .toISOString(),
                stepHeadLine: values.editWorkStepHeadline,
                stepDescription: values.editStepDescription,
                updateDate: new Date(),
                updateById: USER_ID,
                createUser: {
                  createName: selectedUser
                    ? selectedUser.name
                    : currentItem.createUser.createName,
                  createSing: selectedUser
                    ? selectedUser.singNumber
                    : currentItem.createUser.createSing,
                  createById: selectedUser
                    ? selectedUser._id
                    : currentItem.createById, // Замените это на ID пользователя, который выполнил действие
                },
              };

              // Найдите текущий элемент в исходных данных и замените его
              const updatedSteps = data.map((item) =>
                item.id === currentItem.id ? updatedItem : item
              );

              const result = await dispatch(
                updateAdditionalTask({
                  projectId: currentProjectId,
                  steps: updatedSteps,
                  _id: taskId,
                  updateDate: new Date(),
                  updateById: USER_ID,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                // setCurrentItem(null);
                // setCurrentAction(null);
                const index = projectAdditionalTasks.findIndex(
                  (task: any) => task._id === currentProjectAdditionalTask?._id
                );
                if (index !== -1) {
                  dispatch(
                    setUpdatedProjectAdditionalTask({
                      index: index,
                      task: result.payload,
                    })
                  );
                }
              }
            }}
            form={formEditStep}
            layout="vertical"
          >
            <ProFormGroup>
              <ProFormDatePicker
                rules={[{ required: true }]}
                label={`${t('DATE')}`}
                name="editWorkStepDate"
                // initialValue={
                //   currentItem ? moment(currentItem.createDate) : null
                // }
              />
              <ProFormTimePicker
                rules={[{ required: true }]}
                label={`${t('TIME')}`}
                name="editWorkStepTime"
                // initialValue={
                //   currentItem ? moment(currentItem.createDate) : null
                // }
              />
            </ProFormGroup>

            <ProFormText
              name="editWorkStepHeadline"
              label={`${t('HEADLINE')}`}
              rules={[{ required: true }]}
              // initialValue={currentItem ? currentItem.stepHeadLine : ''}
            ></ProFormText>
            <ProFormTextArea
              name="editStepDescription"
              label={`${t('DESCRIPTION TEXT')}`}
              rules={[{ required: true }]}
              fieldProps={{ autoSize: { minRows: 15, maxRows: 25 } }}
              // initialValue={currentItem ? currentItem.stepDescription : ''}
            ></ProFormTextArea>

            <ProFormItem label={`${t('DESCRIPTION SING')}`}>
              <UserSearchForm
                onUserSelect={function (user: UserResponce): void {
                  setSelectedUser(user);
                }}
                performedSing={currentItem && currentItem.createUser.createSing}
                performedName={currentItem && currentItem.createUser.createName}
                reset={false}
                actionNumber={null}
              ></UserSearchForm>
            </ProFormItem>
          </ProForm>
        </Modal>
        <Modal
          footer={false}
          width={'60%'}
          title="ADD NEW WORK STEP"
          visible={visibleStepAdd}
          onOk={handleStepAddOk}
          destroyOnClose
          onCancel={handleStepAddCancel}
        >
          <ProForm
            disabled={currentTask?.status === 'closed'}
            loading={isLoading}
            onFinish={async (values) => {
              // Обновите текущий элемент с новыми значениями
              const newStep = {
                id: uuidv4(),
                actions: [],
                stepHeadLine: values.stepAddHeadline,
                stepDescription: values.stepAddDescription,
                createUser: {
                  createName: selectedUser
                    ? selectedUser.name
                    : localStorage.getItem('name'),
                  createSing: selectedUser
                    ? selectedUser.singNumber
                    : localStorage.getItem('singNumber'),
                },

                createById: selectedUser ? selectedUser._id : USER_ID, // Замените это на ID пользователя, который выполнил действие
                createDate: moment(values.date)
                  .set({
                    hour: moment(values.time, 'HH:mm').get('hour'),
                    minute: moment(values.time, 'HH:mm').get('minute'),
                  })
                  .toISOString(),
              };
              // const updatedItem = {
              //   ...data,
              //   updateDate: new Date(),
              //   updateById: USER_ID,
              //   steps:[]
              // };

              // Найдите текущий элемент в исходных данных и замените его
              const updatedSteps = [...data, newStep];

              const result = await dispatch(
                updateAdditionalTask({
                  projectId: currentProjectId,
                  steps: updatedSteps,
                  _id: taskId,
                  updateDate: new Date(),
                  updateById: USER_ID,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                setSelectedUser(null);
                // setCurrentItem(null);
                // setCurrentAction(null);
                const index = projectAdditionalTasks.findIndex(
                  (task: any) => task._id === currentProjectAdditionalTask?._id
                );
                if (index !== -1) {
                  dispatch(
                    setUpdatedProjectAdditionalTask({
                      index: index,
                      task: result.payload,
                    })
                  );
                }
              }
            }}
            // form={formEditStep}
            layout="vertical"
          >
            <ProFormGroup>
              <ProFormDatePicker
                rules={[{ required: true }]}
                label={`${t('DATE')}`}
                name="date"
                initialValue={moment(new Date())}
              />
              <ProFormTimePicker
                rules={[{ required: true }]}
                label={`${t('TIME')}`}
                name="time"
                initialValue={moment(new Date())}
              />
            </ProFormGroup>

            <ProFormText
              name="stepAddHeadline"
              label={`${t('HEADLINE')}`}
              rules={[{ required: true }]}
              initialValue={data[0]?.stepHeadLine ? data[0]?.stepHeadLine : ''}
            ></ProFormText>
            <ProFormTextArea
              name="stepAddDescription"
              label={`${t('DESCRIPTION TEXT')}`}
              rules={[{ required: true }]}
              fieldProps={{ autoSize: { minRows: 15, maxRows: 25 } }}
              // initialValue={currentItem ? currentItem.stepDescription : ''}
            ></ProFormTextArea>
            <ProFormItem label={`${t('DESCRIPTION SING')}`}>
              <UserSearchForm
                onUserSelect={function (user: UserResponce): void {
                  setSelectedUser(user);
                }}
                reset={false}
                performedSing={localStorage.getItem('singNumber')}
                performedName={localStorage.getItem('name')}
                actionNumber={null}
              ></UserSearchForm>
            </ProFormItem>
          </ProForm>
        </Modal>

        <Modal
          footer={false}
          width={'60%'}
          title={`${t('ADD NEW ACTION')}`}
          visible={visible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <ProForm
            disabled={currentTask?.status === 'closed'}
            loading={isLoading}
            onFinish={async (values) => {
              const newAction = {
                id: uuidv4(),
                headline: values.performedHeadline,
                description: values.performedText,
                createUser: {
                  createName: selectedUser
                    ? selectedUser.name
                    : localStorage.getItem('name'),
                  createSing: selectedUser
                    ? selectedUser.singNumber
                    : localStorage.getItem('singNumber'),
                },

                createById: selectedUser ? selectedUser._id : USER_ID, // Замените это на ID пользователя, который выполнил действие
                createDate: moment(values.performedDate)
                  .set({
                    hour: moment(values.performedTime, 'HH:mm').get('hour'),
                    minute: moment(values.performedTime, 'HH:mm').get('minute'),
                  })
                  .toISOString(),
              };

              // Добавьте новое действие в массив действий текущего элемента
              const updatedItem = {
                ...currentItem,
                updateDate: new Date(),
                updateById: USER_ID,
                actions: [...currentItem.actions, newAction],
              };

              // Найдите текущий элемент в исходных данных и замените его
              const updatedSteps = data.map((item) =>
                item.id === currentItem.id ? updatedItem : item
              );

              const result = await dispatch(
                updateAdditionalTask({
                  projectId: currentProjectId,
                  steps: updatedSteps,
                  _id: taskId,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                // setCurrentItem(null);
                // setCurrentAction(null);
                const index = projectAdditionalTasks.findIndex(
                  (task: any) => task._id === currentProjectAdditionalTask?._id
                );
                if (index !== -1) {
                  dispatch(
                    setUpdatedProjectAdditionalTask({
                      index: index,
                      task: result.payload,
                    })
                  );
                }
              }
            }}
            form={form}
            layout="vertical"
          >
            <ProFormGroup>
              <ProFormDatePicker
                rules={[{ required: true }]}
                label={`${t('PERFORMED DATE')}`}
                name="performedDate"
                initialValue={currentItem ? moment(new Date()) : null}
              />
              <ProFormTimePicker
                rules={[{ required: true }]}
                label={`${t('TIME')}`}
                name="performedTime"
              />
            </ProFormGroup>

            <ProFormText
              initialValue={currentItem ? currentItem.stepHeadLine : ''}
              name="performedHeadline"
              label={`${t('HEADLINE')}`}
              rules={[{ required: true }]}
            ></ProFormText>
            <ProFormTextArea
              name="performedText"
              label={`${t('ACTION TEXT')}`}
              rules={[{ required: true }]}
              fieldProps={{ autoSize: { minRows: 15, maxRows: 15 } }}
            ></ProFormTextArea>

            <ProFormItem label={`${t('DESCRIPTION SING')}`}>
              <UserSearchForm
                onUserSelect={function (user: UserResponce): void {
                  setSelectedUser(user);
                }}
                reset={false}
                performedSing={localStorage.getItem('singNumber')}
                performedName={localStorage.getItem('name')}
                actionNumber={null}
              ></UserSearchForm>
            </ProFormItem>
          </ProForm>
        </Modal>
        <Modal
          footer={false}
          width={'60%'}
          title={`${t('ADD NEW INSPECTION')}`}
          visible={visibleiInspection}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <ProForm
            disabled={currentTask?.status === 'closed'}
            loading={isLoading}
            onFinish={async (values) => {
              const inspectionAction = {
                id: uuidv4(),
                headline: values.inspectinHeadline,
                description: values.inspectionText,
                createUser: {
                  createName: selectedUser
                    ? selectedUser.name
                    : localStorage.getItem('name'),
                  createSing: selectedUser
                    ? selectedUser.singNumber
                    : localStorage.getItem('singNumber'),
                },

                createById: selectedUser ? selectedUser._id : USER_ID, // Замените это на ID пользователя, который выполнил действие
                createDate: moment(values.performedDate)
                  .set({
                    hour: moment(values.inspectionTime, 'HH:mm').get('hour'),
                    minute: moment(values.inspectionTime, 'HH:mm').get(
                      'minute'
                    ),
                  })
                  .toISOString(),
              };
              const updatedAction = {
                ...currentAction,
                inspectionAction: inspectionAction,
                updateDate: new Date(),
                updateById: USER_ID,
              };
              const updatedActions = currentItem.actions.map((action: any) =>
                action.id === currentAction.id ? updatedAction : action
              );
              const updatedItem = {
                ...currentItem,
                actions: updatedActions,
                updateDate: new Date(),
                updateById: USER_ID,
              };
              const updatedSteps = data.map((item) =>
                item.id === currentItem.id ? updatedItem : item
              );
              // Добавьте новое действие в массив действий текущего элемента

              // Найдите текущий элемент в исходных данных и замените его

              const result = await dispatch(
                updateAdditionalTask({
                  projectId: currentProjectId,
                  steps: updatedSteps,
                  _id: taskId,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                // setCurrentItem(null);
                // setCurrentAction(null);
                const index = projectAdditionalTasks.findIndex(
                  (task: any) => task._id === currentProjectAdditionalTask?._id
                );
                if (index !== -1) {
                  dispatch(
                    setUpdatedProjectAdditionalTask({
                      index: index,
                      task: result.payload,
                    })
                  );
                }
              }
            }}
            form={form}
            layout="vertical"
          >
            <ProFormGroup>
              <ProFormDatePicker
                rules={[{ required: true }]}
                label={`${t('INSPECTION DATE')}`}
                name="inspectionDate"
                initialValue={currentItem ? moment(new Date()) : null}
              />
              <ProFormTimePicker
                rules={[{ required: true }]}
                label={`${t('TIME')}`}
                name="inspectionTime"
              />
            </ProFormGroup>

            <ProFormText
              initialValue={currentItem ? currentItem.stepHeadLine : ''}
              name="inspectinHeadline"
              label={`${t('HEADLINE')}`}
              rules={[{ required: true }]}
            ></ProFormText>
            <ProFormTextArea
              name="inspectionText"
              label={`${t('INSPECTION TEXT')}`}
              rules={[{ required: true }]}
              fieldProps={{ autoSize: { minRows: 15, maxRows: 15 } }}
            ></ProFormTextArea>

            <ProFormItem label={`${t('INSPECTION SING')}`}>
              <UserSearchForm
                onUserSelect={function (user: UserResponce): void {
                  setSelectedUser(user);
                }}
                reset={false}
                performedSing={localStorage.getItem('singNumber')}
                performedName={localStorage.getItem('name')}
                actionNumber={null}
              ></UserSearchForm>
            </ProFormItem>
          </ProForm>
        </Modal>
        <Modal
          footer={false}
          width={'60%'}
          title="EDIT INSPECTION"
          visible={visibleEditInspection}
          onOk={handleInspectionEditCancel}
          onCancel={handleInspectionEditCancel}
        >
          <ProForm
            disabled={currentTask?.status === 'closed'}
            size="middle"
            form={formEditInspection}
            loading={isLoading}
            onFinish={async (values) => {
              // Добавьте новое действие в массив действий текущего элемента
              const updatedAction = {
                ...currentAction,
                inspectionAction: {
                  headline: values.inspectinEditHeadline,
                  description: values.inspectionEditText,
                  createDate: moment(values.editInspectedDate)
                    .set({
                      hour: moment(values.editInspectedTime, 'HH:mm').get(
                        'hour'
                      ),
                      minute: moment(values.editInspectedTime, 'HH:mm').get(
                        'minute'
                      ),
                    })
                    .toISOString(),
                  createUser: {
                    createName: selectedUser
                      ? selectedUser.name
                      : localStorage.getItem('name'),
                    createSing: selectedUser
                      ? selectedUser.singNumber
                      : localStorage.getItem('singNumber'),
                  },
                },
                updateDate: new Date(),
                updateById: USER_ID,
              };

              // Найдите текущее действие в массиве действий текущего элемента и замените его
              const updatedActions = currentItem.actions.map((action: any) =>
                action.id === currentAction.id ? updatedAction : action
              );

              // Обновите текущий элемент с новым массивом действий
              const updatedItem = {
                ...currentItem,
                actions: updatedActions,
                updateDate: new Date(),
                updateById: USER_ID,
              };

              // Найдите текущий элемент в исходных данных и замените его
              const updatedSteps = data.map((item) =>
                item.id === currentItem.id ? updatedItem : item
              );

              const result = await dispatch(
                updateAdditionalTask({
                  projectId: currentProjectId,
                  steps: updatedSteps,
                  _id: taskId,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                const index = projectAdditionalTasks.findIndex(
                  (task: any) => task._id === currentProjectAdditionalTask?._id
                );
                if (index !== -1) {
                  dispatch(
                    setUpdatedProjectAdditionalTask({
                      index: index,
                      task: result.payload,
                    })
                  );
                }
              }
            }}
            layout="vertical"
          >
            <ProFormGroup>
              <ProFormDatePicker
                initialValue={
                  currentAction ? moment(currentAction.createDate) : null
                }
                rules={[{ required: true }]}
                label={`${t('INSPECTION DATE')}`}
                name="editInspectedDate"
              />
              <ProFormTimePicker
                initialValue={
                  currentAction ? moment(currentAction.createDate) : null
                }
                rules={[{ required: true }]}
                label={`${t('TIME')}`}
                name="editInspectedTime"
              />
            </ProFormGroup>

            <ProFormText
              initialValue={
                currentAction ? currentAction?.inspectionAction?.headline : ''
              }
              name="inspectinEditHeadline"
              label={`${t('HEADLINE')}`}
              rules={[{ required: true }]}
            ></ProFormText>
            <ProFormTextArea
              initialValue={
                currentAction
                  ? currentAction?.inspectionAction?.description
                  : ''
              }
              name="inspectionEditText"
              label={`${t('INSPECTION TEXT')}`}
              rules={[{ required: true }]}
              fieldProps={{ autoSize: { minRows: 15, maxRows: 15 } }}
            ></ProFormTextArea>

            <ProFormItem label={`${t('INSPECTION SING')}`}>
              <UserSearchForm
                onUserSelect={function (user: UserResponce): void {
                  setSelectedUser(user);
                }}
                performedSing={
                  currentAction &&
                  currentAction?.inspectionAction?.createUser?.createSing
                }
                performedName={
                  currentAction &&
                  currentAction?.inspectionAction?.createUser.createName
                }
                reset={false}
                actionNumber={null}
              ></UserSearchForm>
            </ProFormItem>
          </ProForm>
        </Modal>
        <Modal
          footer={false}
          width={'60%'}
          title="EDIT ACTION"
          visible={visibleActionEdit}
          onOk={handleActionEditCancel}
          onCancel={handleActionEditCancel}
        >
          <ProForm
            size="middle"
            form={formEditAction}
            loading={isLoading}
            onFinish={async (values) => {
              // Добавьте новое действие в массив действий текущего элемента
              const updatedAction = {
                ...currentAction,
                headline: values.editPerformedheadline,
                description: values.editPerformedDescription,
                createDate: moment(values.editPerformedDate)
                  .set({
                    hour: moment(values.editPerformedTime, 'HH:mm').get('hour'),
                    minute: moment(values.editPerformedTime, 'HH:mm').get(
                      'minute'
                    ),
                  })
                  .toISOString(),
                updateDate: new Date(),
                updateById: USER_ID,
                createUser: {
                  createName: selectedUser
                    ? selectedUser.name
                    : currentItem.createUser.createName,
                  createSing: selectedUser
                    ? selectedUser.singNumber
                    : currentAction.createUser.createSing,
                  createById: selectedUser
                    ? selectedUser._id
                    : currentAction.createById, // Замените это на ID пользователя, который выполнил действие
                },
              };

              // Найдите текущее действие в массиве действий текущего элемента и замените его
              const updatedActions = currentItem.actions.map((action: any) =>
                action.id === currentAction.id ? updatedAction : action
              );

              // Обновите текущий элемент с новым массивом действий
              const updatedItem = {
                ...currentItem,
                actions: updatedActions,
                updateDate: new Date(),
                updateById: USER_ID,
              };

              // Найдите текущий элемент в исходных данных и замените его
              const updatedSteps = data.map((item) =>
                item.id === currentItem.id ? updatedItem : item
              );

              const result = await dispatch(
                updateAdditionalTask({
                  projectId: currentProjectId,
                  steps: updatedSteps,
                  _id: taskId,
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                // setCurrentItem(null);
                // setCurrentAction(null);
                // handleActionEditCancel();
                const index = projectAdditionalTasks.findIndex(
                  (task: any) => task._id === currentProjectAdditionalTask?._id
                );
                if (index !== -1) {
                  dispatch(
                    setUpdatedProjectAdditionalTask({
                      index: index,
                      task: result.payload,
                    })
                  );
                }
              }
            }}
            layout="vertical"
          >
            <ProFormGroup>
              <ProFormDatePicker
                initialValue={
                  currentAction ? moment(currentAction.createDate) : null
                }
                rules={[{ required: true }]}
                label={`${t('PERFORMED DATE')}`}
                name="editPerformedDate"
              />
              <ProFormTimePicker
                initialValue={
                  currentAction ? moment(currentAction.createDate) : null
                }
                rules={[{ required: true }]}
                label={`${t('TIME')}`}
                name="editPerformedTime"
              />
            </ProFormGroup>

            <ProFormText
              initialValue={currentAction ? currentAction.headline : ''}
              name="editPerformedheadline"
              label={`${t('HEADLINE')}`}
              rules={[{ required: true }]}
            ></ProFormText>
            <ProFormTextArea
              initialValue={currentAction ? currentAction.description : ''}
              name="editPerformedDescription"
              label={`${t('ACTION TEXT')}`}
              rules={[{ required: true }]}
              fieldProps={{ autoSize: { minRows: 15, maxRows: 15 } }}
            ></ProFormTextArea>

            <ProFormItem label={`${t('DESCRIPTION SING')}`}>
              <UserSearchForm
                onUserSelect={function (user: UserResponce): void {
                  setSelectedUser(user);
                }}
                performedSing={
                  currentAction && currentAction.createUser.createSing
                }
                performedName={
                  currentAction && currentAction.createUser.createName
                }
                reset={false}
                actionNumber={null}
              ></UserSearchForm>
            </ProFormItem>
          </ProForm>
        </Modal>
        <ModalForm
          onFinish={async () => {
            const updatedAction = {
              ...currentAction,
              times: tableData,
              updateDate: new Date(),
              updateById: USER_ID,
            };

            // Найдите текущее действие в массиве действий текущего элемента и замените его
            const updatedActions = currentItem?.actions?.map((action: any) =>
              action.id === currentAction.id ? updatedAction : action
            );

            // Обновите текущий элемент с новым массивом действий
            const updatedItem = {
              ...currentItem,
              actions: updatedActions,
              updateDate: new Date(),
              updateById: USER_ID,
            };

            // Найдите текущий элемент в исходных данных и замените его
            const updatedSteps = data.map((item: { id: any }) =>
              item.id === currentItem.id ? updatedItem : item
            );

            const result = await dispatch(
              updateAdditionalTask({
                projectId: currentProjectId,
                steps: updatedSteps,
                _id: taskId,
              })
            );
            if (result.meta.requestStatus === 'fulfilled') {
              // setCurrentItem(null);
              // setCurrentAction(null);
              // handleActionEditCancel();
              const index = projectAdditionalTasks.findIndex(
                (task: any) => task._id === currentProjectAdditionalTask?._id
              );
              if (index !== -1) {
                dispatch(
                  setUpdatedProjectAdditionalTask({
                    index: index,
                    task: result.payload,
                  })
                );
              }
            }
          }}
          width={'60%'}
          title={`${t('EDIT TIMES')}`}
          open={visibleEditTimes}
          onOpenChange={setVisibleEditTimes}
          // onOk={handleOk}
          // onCancel={handleCancel}
        >
          <ProTable
            rowKey="id"
            options={{
              density: false,
              search: false,
              fullScreen: true,
              reload: false,
            }}
            search={false}
            columns={initialColumns}
            dataSource={tableData}
            editable={{
              type: 'multiple',
              editableKeys,
              onChange: setEditableRowKeys,
              onSave: async (rowKey, data) => {
                // Обновляем данные в состоянии после редактирования
                setTableData((prev: DataType[]) =>
                  prev.map((item: DataType) =>
                    item.id === rowKey ? { ...item, ...data } : item
                  )
                );
              },
              actionRender: (row, config, defaultDoms) => {
                return [
                  defaultDoms.save,
                  defaultDoms.cancel,
                  <a
                    key="delete"
                    onClick={() => {
                      // Удалить строку из исходных данных
                      setTableData((prev: any[]) =>
                        prev.filter((item) => item.id !== row.id)
                      );
                    }}
                  >
                    {t('Delete')}`,
                  </a>,
                ];
              },
            }}
          />
          {/* <EditableTable
            data={currentAction?.times}
            initialColumns={initialColumns}
            onSelectedRowKeysChange={handleSelectedRowKeysChange}
            isLoading={false}
            menuItems={undefined}
            recordCreatorProps={false}
            actionRenderDelete={true}
            onRowClick={function (record: any, rowIndex?: any): void {
              console.log(record);
            }}
            onSave={async function (
              rowKey: any,
              data: any,
              row: any
            ): Promise<void> {
              console.log('data', data);
              // const updatedAction = {
              //   ...currentAction,
              //   times: data,
              //   updateDate: new Date(),
              //   updateById: USER_ID,
              // };

              // // Найдите текущее действие в массиве действий текущего элемента и замените его
              // const updatedActions = currentItem?.actions?.map((action: any) =>
              //   action.id === currentAction.id ? updatedAction : action
              // );

              // // Обновите текущий элемент с новым массивом действий
              // const updatedItem = {
              //   ...currentItem,
              //   actions: updatedActions,
              //   updateDate: new Date(),
              //   updateById: USER_ID,
              // };

              // // Найдите текущий элемент в исходных данных и замените его
              // const updatedSteps = data.map((item: { id: any }) =>
              //   item.id === currentItem.id ? updatedItem : item
              // );

              // const result = await dispatch(
              //   updateAdditionalTask({
              //     projectId: currentProjectId,
              //     steps: updatedSteps,
              //     _id: taskId,
              //   })
              // );
              // if (result.meta.requestStatus === 'fulfilled') {
              //   // setCurrentItem(null);
              //   // setCurrentAction(null);
              //   // handleActionEditCancel();
              //   const index = projectAdditionalTasks.findIndex(
              //     (task: any) => task._id === currentProjectAdditionalTask?._id
              //   );
              //   if (index !== -1) {
              //     dispatch(
              //       setUpdatedProjectAdditionalTask({
              //         index: index,
              //         task: result.payload,
              //       })
              //     );
              //   }
              // }
            }}
            yScroll={50}
            externalReload={function () {
              throw new Error('Function not implemented.');
            }}
          ></EditableTable> */}
        </ModalForm>
        <Modal
          footer={false}
          width={'60%'}
          title={`${t('CLOSE WO')}`}
          visible={visibleClose}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <ProForm
            form={formClosed}
            disabled={currentTask?.status === 'closed'}
            loading={isLoading}
            onFinish={async (values) => {
              const finalAction = {
                id: uuidv4(),
                createUser: {
                  createName: selectedUser
                    ? selectedUser.name
                    : localStorage.getItem('name'),
                  createSing: selectedUser
                    ? selectedUser.singNumber
                    : localStorage.getItem('singNumber'),
                },

                createById: selectedUser ? selectedUser._id : USER_ID, // Замените это на ID пользователя, который выполнил действие
                closingDate: moment(values.closingDate)
                  .set({
                    hour: moment(values.closingTime, 'HH:mm').get('hour'),
                    minute: moment(values.closingTime, 'HH:mm').get('minute'),
                  })
                  .toISOString(),
              };

              const result = await dispatch(
                updateAdditionalTask({
                  projectId: currentProjectId,
                  _id: taskId,
                  finalAction: finalAction,
                  updateDate: new Date(),
                  updateById: USER_ID,
                  status: 'closed',
                })
              );
              if (result.meta.requestStatus === 'fulfilled') {
                // setCurrentItem(null);
                // setCurrentAction(null);
                const index = projectAdditionalTasks.findIndex(
                  (task: any) => task._id === currentProjectAdditionalTask?._id
                );
                if (index !== -1) {
                  dispatch(
                    setUpdatedProjectAdditionalTask({
                      index: index,
                      task: result.payload,
                    })
                  );
                }
              }
            }}
            layout="vertical"
          >
            <ProFormGroup>
              <ProFormDatePicker
                rules={[{ required: true }]}
                label={`${t('CLOSE DATE')}`}
                name="closingDate"
                initialValue={
                  currentTask && currentTask?.finalAction
                    ? moment(currentTask?.finalAction?.closingDate)
                    : moment(new Date())
                }
              />
              <ProFormTimePicker
                rules={[{ required: true }]}
                label={`${t('TIME')}`}
                name="closingTime"
                initialValue={
                  currentTask
                    ? currentTask?.finalAction?.closingDate
                    : moment(new Date())
                }
              />
            </ProFormGroup>

            <ProFormItem label={`${t('CLOSING SING')}`}>
              <UserSearchForm
                onUserSelect={function (user: UserResponce): void {
                  setSelectedUser(user);
                }}
                reset={false}
                performedSing={localStorage.getItem('singNumber')}
                performedName={localStorage.getItem('name')}
                actionNumber={null}
              ></UserSearchForm>
            </ProFormItem>
          </ProForm>
        </Modal>
      </div>
      <Modal
        footer={false}
        width={'40%'}
        title={`${t('ADD/EDIT TIME BOOKING')}`}
        visible={visibleTimes}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <ProForm
          // form={formClosed}
          // disabled={currentTask?.status === 'closed'}
          loading={isLoading}
          onFinish={async (values) => {
            const updatedAction = {
              ...currentAction,
              times: Array.isArray(currentAction?.times)
                ? [
                    ...currentAction.times,
                    {
                      id: uuidv4(),
                      skill: values.skill,
                      startTime: moment(values.startDate)
                        .set({
                          hour: moment(values.startTime, 'HH:mm').get('hour'),
                          minute: moment(values.startTime, 'HH:mm').get(
                            'minute'
                          ),
                        })
                        .toISOString(),
                      endDate: moment(values.startDate)
                        .set({
                          hour: moment(values.endDate, 'HH:mm').get('hour'),
                          minute: moment(values.endDate, 'HH:mm').get('minute'),
                        })
                        .toISOString(),
                      remarks: values.remarks,
                      createDate: new Date(),
                      typeOfWork: values.typeOfWork,
                      user: {
                        createName: selectedUser
                          ? selectedUser.name
                          : localStorage.getItem('name'),
                        createSing: selectedUser
                          ? selectedUser.singNumber
                          : localStorage.getItem('singNumber'),
                      },
                      createUser: {
                        createName: selectedUser
                          ? selectedUser.name
                          : localStorage.getItem('name'),
                        createSing: selectedUser
                          ? selectedUser.singNumber
                          : localStorage.getItem('singNumber'),
                      },
                    },
                  ]
                : [
                    {
                      id: uuidv4(),
                      skill: values.skill,
                      startTime: moment(values.startDate)
                        .set({
                          hour: moment(values.startTime, 'HH:mm').get('hour'),
                          minute: moment(values.startTime, 'HH:mm').get(
                            'minute'
                          ),
                        })
                        .toISOString(),
                      endDate: moment(values.startDate)
                        .set({
                          hour: moment(values.endDate, 'HH:mm').get('hour'),
                          minute: moment(values.endDate, 'HH:mm').get('minute'),
                        })
                        .toISOString(),
                      remarks: values.remarks,
                      createDate: new Date(),
                      typeOfWork: values.typeOfWork,
                      user: {
                        createName: selectedUser
                          ? selectedUser.name
                          : localStorage.getItem('name'),
                        createSing: selectedUser
                          ? selectedUser.singNumber
                          : localStorage.getItem('singNumber'),
                      },
                      createUser: {
                        createName: selectedUser
                          ? selectedUser.name
                          : localStorage.getItem('name'),
                        createSing: selectedUser
                          ? selectedUser.singNumber
                          : localStorage.getItem('singNumber'),
                      },
                    },
                  ],
              updateDate: new Date(),
              updateById: USER_ID,
            };

            // Найдите текущее действие в массиве действий текущего элемента и замените его
            const updatedActions = currentItem.actions.map((action: any) =>
              action.id === currentAction.id ? updatedAction : action
            );

            // Обновите текущий элемент с новым массивом действий
            const updatedItem = {
              ...currentItem,
              actions: updatedActions,
              updateDate: new Date(),
              updateById: USER_ID,
            };

            // Найдите текущий элемент в исходных данных и замените его
            const updatedSteps = data.map((item) =>
              item.id === currentItem.id ? updatedItem : item
            );

            const result = await dispatch(
              updateAdditionalTask({
                projectId: currentProjectId,
                steps: updatedSteps,
                _id: taskId,
              })
            );
            if (result.meta.requestStatus === 'fulfilled') {
              const index = projectAdditionalTasks.findIndex(
                (task: any) => task._id === currentProjectAdditionalTask?._id
              );
              if (index !== -1) {
                dispatch(
                  setUpdatedProjectAdditionalTask({
                    index: index,
                    task: result.payload,
                  })
                );
              }
            }
          }}
          layout="vertical"
        >
          {/* <ProFormGroup> */}
          <ProFormText bordered label={`${t('TASK WO')}`} width={'md'} disabled>
            {currentTask?.additionalNumberId}
          </ProFormText>
          <ProFormGroup>
            <ProFormDatePicker
              rules={[{ required: true }]}
              labelAlign="left"
              label={`${t('START DATE')}`}
              name="startDate"
              // initialValue={
              //   currentItem ? moment(currentItem.createDate) : null
              // }
            />
            <ProFormTimePicker
              rules={[{ required: true }]}
              label={`${t('START TIME')}`}
              name="startTime"
            />
          </ProFormGroup>
          <ProFormGroup>
            <ProFormDatePicker
              rules={[{ required: true }]}
              label={`${t('END DATE')}`}
              name="endDate"
              // initialValue={
              //   currentItem ? moment(currentItem.createDate) : null
              // }
            />
            <ProFormTimePicker
              rules={[{ required: true }]}
              label={`${t('START TIME')}`}
              name="endTime"
            />
            <ProFormDigit
              width={'xs'}
              name="duration"
              label={`${t('DURATIONS')}`}
            ></ProFormDigit>
          </ProFormGroup>
          <ProFormGroup>
            <ProFormSelect
              name="skill"
              width={'sm'}
              label={`${t('SKILL')}`}
              valueEnum={{
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
              }}
              rules={[
                {
                  required: true,
                },
              ]}
            ></ProFormSelect>
            <ProFormSelect
              width={'sm'}
              name="typeOfWork"
              label={`${t('TYPE OF WORK')}`}
              valueEnum={{
                ROUTINE: { text: 'ROUTINE' },
                ACCESS: { text: 'ACCESS' },
                ADD_WORK: { text: 'ADD WORK' },
              }}
              rules={[
                {
                  required: true,
                },
              ]}
            ></ProFormSelect>
            <ProFormItem label={`${t('USER SING')}`}>
              <UserSearchForm
                onUserSelect={function (user: UserResponce): void {
                  setSelectedUser(user);
                }}
                reset={false}
                performedSing={localStorage.getItem('singNumber')}
                performedName={localStorage.getItem('name')}
                actionNumber={null}
              ></UserSearchForm>
            </ProFormItem>
          </ProFormGroup>
          <ProFormTextArea
            name="remarks"
            label={`${t('REMARKS')}`}
          ></ProFormTextArea>
        </ProForm>
      </Modal>
      <div className="flex justify-between">
        <Space className="flex pt-5 ">
          <Popover content="ADD WORK STEP">
            <Button
              disabled={currentTask?.status === 'closed'}
              className={`${
                currentTask?.status === !'closed' ? 'bg-emerald-200' : ''
              }`}
              // shape="circle"
              icon="+ST"
              onClick={() => setStepAddVisible(true)}
            />
          </Popover>
          <Popover content="TRANSFER">
            <Button
              className="bg-orange-300"
              type="primary"
              // shape="circle"
              icon="T"
              onClick={() => null}
            />
          </Popover>
        </Space>
        <Space className="flex pt-5 ">
          <Popconfirm
            disabled={
              currentTask?.status === 'closed' ||
              !currentTask?.steps ||
              currentTask?.steps.some(
                (step: any) =>
                  !step.actions ||
                  !step.actions.some(
                    (action: any) => action.inspectionAction
                  ) ||
                  !step.actions.some((action: any) => action?.times)
              )
            }
            title="Are you sure you want to CLOSE WO?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => setVisibleClose(true)}
          >
            <Popover content="CLOSE WO">
              <Button
                disabled={
                  currentTask?.status === 'closed' ||
                  !currentTask?.steps ||
                  currentTask?.steps.some(
                    (step: any) =>
                      !step.actions ||
                      !step.actions.some(
                        (action: any) => action?.inspectionAction
                      ) ||
                      !step.actions.some((action: any) => action?.times)
                  )
                }
                className={`${
                  currentTask?.status === !'closed' ? 'bg-green-500' : ''
                }`}
                // shape="circle"
              >
                CLOSE
              </Button>
            </Popover>
          </Popconfirm>
        </Space>
        <Space className="flex pt-5 ">
          <Popconfirm
            disabled={!selectedItems.length || currentTask?.status === 'closed'}
            title="Are you sure you want to delete the selected items?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDeleteAction(selectedItems)}
          >
            <Popover content="DELETE SELECTED ACTIONS">
              <Button
                disabled={
                  !selectedItems.length || currentTask?.status === 'closed'
                }
                className={`${
                  selectedItems.length && currentTask?.status === !'closed'
                    ? 'bg-red-600'
                    : ''
                }`}
                // shape="circle"
                icon="-A"
              />
            </Popover>
          </Popconfirm>

          <Popconfirm
            title="Are you sure you want to delete the selected items?"
            okText="Yes"
            cancelText="No"
            disabled={
              !selectedStepItems.length || currentTask?.status === 'closed'
            }
            onConfirm={() => handleDelete(selectedStepItems)}
          >
            <Popover content="DELETE SELECTED WORK STEP">
              <Button
                disabled={
                  !selectedStepItems.length || currentTask?.status === 'closed'
                }
                className={`${
                  selectedStepItems.length && currentTask?.status === !'closed'
                    ? 'bg-red-600'
                    : ''
                } `}
                // shape="circle"
                icon="-ST"
              />
            </Popover>
          </Popconfirm>
        </Space>
      </div>
    </div>
  );
};
export default TestNRCStep;
