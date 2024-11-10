// @ts-nocheck

import React, { useEffect, useState } from 'react';
import {
  Modal,
  Button,
  Tabs,
  Divider,
  DatePicker,
  Form,
  TimePicker,
  notification,
} from 'antd';
import ProForm, {
  ProFormTextArea,
  ProFormSelect,
  ProFormDateTimePicker,
  ProFormGroup,
} from '@ant-design/pro-form';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Action } from '@/models/IStep';
import { USER_ID } from '@/utils/api/http';
import TemplateSelector from './TemplateSelector';
import UserDurationList from './UserDurationList';
import { Split } from '@geoffcox/react-splitter';
import { User } from '@/models/IUser';
import UserTaskAllocation from './UserTaskAllocation';
import UserTaskAllocationInspector from './UserTaskAllocationInspector';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

interface ActionFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (action: any) => void;
  onDelete?: (actionId: string) => void;
  task?: any;
  step?: any;
  currentAction?: Action;
  templates: {
    description: any;
    id: string;
    name: string;
    content: string;
    type: string;
    planeType: string;
  }[];
  users: User[];
}

const ActionForm: React.FC<ActionFormProps> = ({
  visible,
  onCancel,
  onSave,
  onDelete,
  currentAction,
  templates,
  users,
  step,
  task,
}) => {
  interface UserDuration {
    id: string;
    userID: string;
    duration: number;
  }
  const [form] = ProForm.useForm();
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [userDurations, setUserDurations] = useState<UserDuration[]>(
    currentAction?.userDurations || []
  );
  const [userDurationInspector, setUserDurationsInspector] = useState<
    UserDuration[]
  >([]);
  const [activeTabKey, setActiveTabKey] = useState('1');
  // taskStatus: step.projectTaskID.status, console.log(step);
  const handleFinish = (values: any) => {
    const performedDate = dayjs(values.performedDate)
      // .utc() // Преобразование в UTC
      .startOf('minute');

    const inspectedDate = dayjs(values.inspectedDate)
      // .utc() // Преобразование в UTC
      .startOf('minute');

    const now = dayjs().utc().startOf('minute');

    if (performedDate.isAfter(now)) {
      notification.error({
        message: t('DATE ERROR'),
        description: t('Performed date cannot be in the future.'),
      });
      return;
    }

    if (inspectedDate.isAfter(now)) {
      notification.error({
        message: t('DATE ERROR'),
        description: t('Inspected date cannot be in the future.'),
      });
      return;
    }

    if (inspectedDate.isBefore(performedDate)) {
      notification.error({
        message: t('DATE ERROR'),
        description: t('Inspected date cannot be before performed date.'),
      });
      return;
    }

    const newAction: Action = {
      id: currentAction ? currentAction._id : null,
      headline: values?.headline,
      description: values.description,
      createDate: performedDate, // Сохранение в формате ISO 8601
      createUserID: USER_ID,
      type: 'pfmd',
      userDurations,
    };

    const newActionInspected: any = {
      id: currentAction ? currentAction._id : null,
      headline: values?.headline,
      description: 'INSPECTED',
      createDate: inspectedDate, // Сохранение в формате ISO 8601
      createUserID: USER_ID,
      type: 'inspect',
      userDurations: userDurationInspector,
    };

    onSave({
      performAction: newAction,
      inspectedAction:
        userDurationInspector && userDurationInspector.length > 0
          ? newActionInspected
          : null,
      status: values.status,
    });
    console.log(newAction.createDate.toISOString());
  };

  const showDeleteConfirm = () => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this action?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        if (currentAction && onDelete) {
          currentAction._id && onDelete(currentAction._id);
        }
      },
    });
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const selected = templates.find((t) => t.id === templateId);
    if (selected) {
      form.setFieldsValue({
        description: selected.description,
      });
    }
  };

  const [tabTitles] = useState({
    '1': `${t('TEMPLATES')}`,
    '2': `${t('COMPONENT CHANGE')}`,
  });

  useEffect(() => {
    if (visible) {
      const currentDateTime = dayjs().utc().startOf('minute'); // Текущее время UTC без секунд

      if (task && task.projectItemType == 'RC') {
        form.setFieldsValue({
          performedDate: currentAction?.createDate
            ? dayjs(currentAction.createDate).utc()
            : currentDateTime,
          inspectedDate: currentAction?.inspectedDate
            ? dayjs(currentAction.inspectDate).utc()
            : currentDateTime,
        });
      } else {
        form.setFieldsValue({
          performedDate: currentAction?.createDate
            ? dayjs(currentAction.createDate)
            : currentDateTime,
          inspectedDate: currentAction?.inspectedDate
            ? dayjs(currentAction.inspectDate)
            : currentDateTime,
        });
      }
      // setPerformUserDurations(currentAction?.userDurations || []);
      // setInspectUserDurations(currentAction?.userDurations || []);
    }
  }, [currentAction, form]);
  const disabledDate = (current: dayjs.Dayjs) => {
    // Запрещаем выбор будущих дат
    return current && current > dayjs().endOf('day');
  };

  const disabledDateTime = () => {
    const now = dayjs();
    return {
      disabledHours: () => {
        const hours = now.hour();
        return Array.from({ length: 24 }, (_, i) => i).filter((h) => h > hours);
      },
      disabledMinutes: (selectedHour: number) => {
        if (selectedHour === now.hour()) {
          return Array.from({ length: 60 }, (_, i) => i).filter(
            (m) => m > now.minute()
          );
        }
        return [];
      },
    };
  };
  return (
    <Modal
      width={'90%'}
      visible={visible}
      title={currentAction ? 'EDIT ACTION' : 'ADD ACTION'}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t('CANCEL')}
        </Button>,
        currentAction && (
          <Button key="delete" danger onClick={showDeleteConfirm}>
            {t('DELETE')}
          </Button>
        ),
        <Button key="save" type="primary" onClick={() => form.submit()}>
          {t('SAVE')}
        </Button>,
      ]}
    >
      <Split initialPrimarySize="80%" splitterSize="10px">
        <div>
          <ProForm
            submitter={false}
            size="small"
            form={form}
            layout="horizontal"
            initialValues={{
              headline: currentAction?.headline || '',
              description: currentAction?.description || '',
              // performedDate: currentAction?.createDate,
              // inspectedDate:: currentAction?.createDate,
              // date: currentAction ? moment(currentAction.createDate) : null,
              // time: currentAction ? moment(currentAction.createDate) : null,
              // type: currentAction?.type || 'pfmd',
              status: task.status,
              userDurations: currentAction?.userDurations.map(
                (userDuration: any) => ({
                  ...userDuration,
                })
              ),
              stepDescription: step?.stepDescription,
            }}
            onFinish={handleFinish}
          >
            <ProFormTextArea
              disabled
              name="stepDescription"
              label={t('WORK STEP')}
              fieldProps={{
                rows: 4,
              }}
            />
            <div className=" p-5 rounded-sm">
              {/* <ProFormSelect
                name="type"
                label={t('TYPE')}
                rules={[{ required: true }]}
                options={[
                  { label: t('PERFORM'), value: 'pfmd' },
                  { label: t('INSPECT'), value: 'inspect' },
                  { label: t('DINSPECT'), value: 'doubleInspect' },
                  { label: t('CLOSE'), value: 'closed' },
                ]}
              /> */}
              <ProFormTextArea
                name="description"
                label={t('ACTION STEP')}
                rules={[{ required: true }]}
                fieldProps={{
                  rows: 4,
                }}
              />
              <ProFormSelect
                showSearch
                rules={[{ required: true }]}
                name="status"
                label={t('TASK STATUS')}
                width="sm"
                // initialValue={'draft'}
                options={[
                  { value: 'closed', label: t('CLOSE'), disabled: true },
                  { value: 'inspect', label: t('INSPECTION') },
                  { value: 'nextAction', label: t('NEXT ACTION') },
                  {
                    value: 'inProgress',
                    label: t('IN PROGRESS'),
                  },
                  { value: 'test', label: t('TEST') },
                  { value: 'open', label: t('OPEN') },

                  { value: 'cancelled', label: t('CANCEL'), disabled: true },
                ]}
              />
              {/* <Split initialPrimarySize="50%" splitterSize="10px"> */}
              <ProFormGroup title="PERFORMED">
                <ProFormGroup>
                  <ProFormDateTimePicker
                    width={'sm'}
                    name="performedDate"
                    label={`${t('DATE & TIME')}`}
                    rules={[
                      {
                        required: true,
                        message: t('Please select date and time'),
                      },
                    ]}
                    fieldProps={{
                      format: 'YYYY-MM-DD HH:mm', // формат без секунд
                      // showTime: {
                      //   defaultValue: dayjs('00:00', 'HH:mm'),
                      //   format: 'HH:mm',
                      //   disabledHours: disabledDateTime().disabledHours,
                      //   disabledMinutes: disabledDateTime().disabledMinutes,
                      // },
                      // defaultValue: dayjs().utc().startOf('minute'), // Текущее время UTC без секунд
                      // disabledDate,
                    }}
                  />
                  {/* <Form.Item
                  name="date"
                  label={t('DATE')}
                  rules={[{ required: true }]}
                >
                  <DatePicker />
                </Form.Item>
                <Form.Item
                  name="time"
                  label={t('TIME')}
                  rules={[{ required: true }]}
                >
                  <TimePicker format="HH:mm" />
                </Form.Item> */}
                </ProFormGroup>
                <div>
                  <UserTaskAllocation
                    users={users}
                    initialTaskAllocations={userDurations}
                    onTaskAllocationsChange={setUserDurations}
                    onlyWithOrganizationAuthorization={true}
                  />
                  {/* <UserDurationList
                  users={users}
                  initialUserDurations={userDurations}
                  onUserDurationsChange={setUserDurations}
                /> */}
                </div>
              </ProFormGroup>
            </div>
            <Divider className="m-2 p-0"></Divider>
            {!currentAction && (
              <div className=" p-5 rounded-sm">
                <ProFormGroup title="INSPECTION">
                  {userDurationInspector.length > 0 && (
                    <ProFormGroup>
                      <ProFormDateTimePicker
                        width={'sm'}
                        name="inspectedDate"
                        label={`${t('DATE & TIME')}`}
                        rules={[
                          {
                            required: true,
                            message: t('Please select date and time'),
                          },
                        ]}
                        fieldProps={{
                          format: 'YYYY-MM-DD HH:mm', // формат без секунд
                          showTime: {
                            defaultValue: dayjs('00:00', 'HH:mm'),
                            format: 'HH:mm',
                            // disabledHours: disabledDateTime().disabledHours,
                            // disabledMinutes: disabledDateTime().disabledMinutes,
                          },
                          defaultValue: dayjs().utc().startOf('minute'), // Текущее время UTC без секунд
                          disabledDate,
                        }}
                      />
                    </ProFormGroup>
                  )}
                  <div>
                    <UserTaskAllocationInspector
                      users={users}
                      initialTaskAllocations={userDurationInspector}
                      onTaskAllocationsChange={setUserDurationsInspector}
                    />
                    {/* <UserDurationList
                  users={users}
                  initialUserDurations={userDurations}
                  onUserDurationsChange={setUserDurations}
                /> */}
                  </div>
                </ProFormGroup>
              </div>
            )}
            {/* </Split> */}
          </ProForm>
        </div>
        <div>
          <Tabs
            size="small"
            activeKey={activeTabKey}
            onChange={(key) => setActiveTabKey(key)}
            defaultActiveKey="3"
            type="card"
          >
            <Tabs.TabPane tab={tabTitles['1']} key="1">
              <TemplateSelector
                templates={templates}
                onSelectTemplate={handleSelectTemplate}
              />
            </Tabs.TabPane>
            {/* <Tabs.TabPane tab={tabTitles['2']} key="2"></Tabs.TabPane> */}
          </Tabs>
        </div>
      </Split>
    </Modal>
  );
};

export default ActionForm;
