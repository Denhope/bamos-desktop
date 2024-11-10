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
  Tag,
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
import { ProDescriptions, ProFormText } from '@ant-design/pro-components';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import Title from 'antd/es/typography/Title';

dayjs.extend(utc);

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

const ActionChangeForm: React.FC<ActionFormProps> = ({
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
  const [userDurationsInstall, setUserDurationsInstall] = useState<
    UserDuration[]
  >(currentAction?.userDurations || []);
  const [userDurationsRemove, setUserDurationsRemove] = useState<
    UserDuration[]
  >([]);
  const [activeTabKey, setActiveTabKey] = useState('1');
  // taskStatus: step.projectTaskID.status, console.log(step);
  const handleFinish = (values: any) => {
    const removalDate = dayjs(values.removalDate).startOf('minute');

    const installDate = dayjs(values.installDate).startOf('minute');

    const now = dayjs().utc().startOf('minute');

    if (removalDate.isAfter(now)) {
      notification.error({
        message: t('DATE ERROR'),
        description: t('RemovalDate date cannot be in the future.'),
      });
      return;
    }

    if (installDate.isAfter(now)) {
      notification.error({
        message: t('DATE ERROR'),
        description: t('Install date cannot be in the future.'),
      });
      return;
    }

    if (installDate.isBefore(removalDate)) {
      notification.error({
        message: t('DATE ERROR'),
        description: t('Install date cannot be before removal date.'),
      });
      return;
    }

    const newActionInstall: Action = {
      id: currentAction ? currentAction._id : null,
      headline: values?.headline,
      description: values.description,
      installDate: installDate.toISOString(),
      createUserID: USER_ID,
      installUserID: USER_ID,
      createDate: new Date().toISOString(),
      type: 'install',
      certificateNumber: values?.certificateNumber,
      serialOnNumber: values?.serialOnNumber,
      partNumberID: values?.partNumberIDOn || null,
      position: values.position,
      userDurations: userDurationsInstall,
    };

    const newActionRemove: any = {
      id: currentAction ? currentAction._id : null,
      headline: values?.headline,
      // description: values.description,

      removalDate: removalDate.toISOString(),
      createUserID: USER_ID,
      type: 'remove',
      createDate: new Date().toISOString(),
      position: values.position,
      reasonToRemoval: values.reasonToRemoval,
      serialNumberOf: values?.serialNumberOf,
      partNumberID: values?.partNumberIDOf,
      userDurations: userDurationsRemove,
    };

    onSave({
      installAction: newActionInstall,
      removeAction:
        userDurationsRemove && userDurationsRemove.length > 0
          ? newActionRemove
          : null,
      status: values.status,
    });
  };

  const showDeleteConfirm = () => {
    Modal.confirm({
      title: 'Подтвердите удаление',
      content: 'Вы уверены, что хотите удалить это действие?',
      okText: 'Да',
      okType: 'danger',
      cancelText: 'Нет',
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

      form.setFieldsValue({
        removalDate: currentAction?.removalDate
          ? dayjs(currentAction.removalDate).utc()
          : currentDateTime,
        installDate: currentAction?.installDate
          ? dayjs(currentAction.inspectDate).utc()
          : currentDateTime,
      });
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
  const { data: partNumbers, isLoading, isError } = useGetPartNumbersQuery({});
  const partValueEnum: Record<string, any> =
    partNumbers?.reduce((acc, partNumber) => {
      acc[partNumber._id] = partNumber; // Store the entire partNumber object
      return acc;
    }, {}) || {};
  return (
    <Modal
      width={'90%'}
      visible={visible}
      title={currentAction ? 'EDIT COMPONENT CHANGE' : 'NEW COMPONENT CHANGE'}
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
      {/* <Split initialPrimarySize="80%" splitterSize="10px"> */}
      <div>
        <ProForm
          submitter={false}
          size="small"
          form={form}
          layout="horizontal"
          initialValues={{
            headline: currentAction?.headline || '',
            description: currentAction?.description || '',
            // removalDate: currentAction?.createDate,
            // installDate:: currentAction?.createDate,
            // date: currentAction ? moment(currentAction.createDate) : null,
            // time: currentAction ? moment(currentAction.createDate) : null,
            // type: currentAction?.type || 'pfmd',
            status: task.status,
            // userDurations: currentAction?.userDurations.map(
            //   (userDuration: any) => ({
            //     ...userDuration,
            //   })
            // ),
            // stepDescription: step?.stepDescription,
          }}
          onFinish={handleFinish}
        >
          {/* <ProFormTextArea
              disabled
              name="stepDescription"
              label={t('WORK STEP')}
              fieldProps={{
                rows: 4,
              }}
            /> */}
          <div className="bg-slate-50 px-4  rounded-md align-middle  py-0">
            <ProDescriptions
              column={7}
              size="small"
              className="bg-slate-50 px-4  rounded-md align-middle w-full py-0"
            >
              <ProDescriptions.Item label={`${t('AC Reg')}`} valueType="text">
                {task?.projectID?.WOReferenceID?.planeId?.regNbr && (
                  <Tag
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {task.projectID.WOReferenceID.planeId.regNbr}
                  </Tag>
                )}
              </ProDescriptions.Item>
              <ProDescriptions.Item label={`${t('AC Type')}`} valueType="text">
                {task?.projectID?.WOReferenceID?.planeId?.acTypeId[0]?.code && (
                  <Tag
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {task?.projectID?.WOReferenceID?.planeId?.acTypeId[0]?.code}
                  </Tag>
                )}
              </ProDescriptions.Item>

              <ProDescriptions.Item label={`${t('MSN')}`} valueType="text">
                {task?.projectID?.WOReferenceID?.planeId?.serialNbr && (
                  <Tag
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {task.projectID.WOReferenceID.planeId.serialNbr}
                  </Tag>
                )}
              </ProDescriptions.Item>
            </ProDescriptions>
            <Title className="bg-slate-50 p-1 rounded-sm" level={5}>{`${t(
              'PERT REMOVAL/INSTALATION'
            )}`}</Title>
          </div>
          <Divider className="m-0 p-0"></Divider>
          <div className=" p-2 rounded-sm">
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
            {/* <ProFormTextArea
                name="description"
                label={t('ACTION STEP')}
                rules={[{ required: true }]}
                fieldProps={{
                  rows: 4,
                }}
              /> */}
            {/* <ProFormSelect
              showSearch
              rules={[{ required: true }]}
              name="status"
              label={t('TASK STATUS')}
              width="sm"
              // initialValue={'draft'}
              valueEnum={{
                closed: { text: t('CLOSE'), status: 'SUCCESS' },
                inspect: { text: t('INSPECTION'), status: 'inspect' },
                nextAction: { text: t('NEXT ACTION'), status: 'PROGRESS' },
                inProgress: { text: t('IN PROGRESS'), status: 'PROGRESS' },
                test: { text: t('TEST'), status: 'Processing' },
                open: { text: t('OPEN'), status: 'Processing' },
                cancelled: { text: t('CANCEL'), status: 'Error' },
                // draft: { text: t('DRAFT'), status: 'DRAFT' },

                // needInspection: { text: t('NEED INSPECTION'), status: 'PROGRESS' },

                // PLANNED: { text: t('PLANNED'), status: 'Waiting' },
                // completed: { text: t('COMPLETED'), status: 'Default' },
                // performed: { text: t('PERFORMED'), status: 'Default' },
              }}
            /> */}
            {/* <Split initialPrimarySize="50%" splitterSize="10px"> */}
            <Title className="bg-slate-50 p-1 my-0 rounded-sm" level={5}>{`${t(
              'INSTALL'
            )}`}</Title>
            <ProFormGroup>
              <ProFormGroup direction="vertical">
                <ProFormText
                  // disabled
                  // rules={[{ required: true }]}
                  name="certificateNumber"
                  label={t('CERTIFICATE No')}
                  width="md"
                  tooltip={t('CERTIFICATE')}
                ></ProFormText>
                <ProFormSelect
                  showSearch
                  // rules={[{ required: true }]}
                  width={'md'}
                  name="partNumberIDOn"
                  label={`${t(`PART No`)}`}
                  // value={partNumber}
                  onChange={(value, data) => {
                    // console.log(data);
                    form.setFields([
                      { name: 'nameOfMaterial', value: data.data.DESCRIPTION },
                      { name: 'unit', value: data.data.UNIT_OF_MEASURE },
                      { name: 'type', value: data.data.TYPE },
                      { name: 'group', value: data.data.GROUP },
                    ]);
                  }}
                  options={Object.entries(partValueEnum).map(([key, part]) => ({
                    label: part.PART_NUMBER,
                    value: key,
                    data: part,
                  }))}
                />

                <ProFormText
                  disabled
                  // rules={[{ required: true }]}
                  name="nameOfMaterial"
                  label={t('DESCRIPTION')}
                  width="md"
                  tooltip={t('DESCRIPTION')}
                ></ProFormText>
                <ProFormText
                  // disabled
                  // rules={[{ required: true }]}
                  name="serialOnNumber"
                  label={t('SERIAL No')}
                  width="md"
                  tooltip={t('SERIAL')}
                ></ProFormText>
              </ProFormGroup>
              <ProFormGroup direction="vertical">
                <ProFormDateTimePicker
                  width={'sm'}
                  name="installDate"
                  label={`${t('DATE & TIME')}`}
                  fieldProps={{
                    format: 'YYYY-MM-DD HH:mm', // формат без секунд
                    showTime: {
                      defaultValue: dayjs('00:00', 'HH:mm'),
                      format: 'HH:mm',
                      disabledHours: disabledDateTime().disabledHours,
                      disabledMinutes: disabledDateTime().disabledMinutes,
                    },
                    defaultValue: dayjs().utc().startOf('minute'), // Текущее время UTC без секунд
                    disabledDate,
                  }}
                />
                <div>
                  <UserTaskAllocation
                    isTime
                    isSingle
                    users={users}
                    initialTaskAllocations={userDurationsInstall}
                    onTaskAllocationsChange={setUserDurationsInstall}
                  />
                  {/* <UserDurationList
                  users={users}
                  initialUserDurations={userDurations}
                  onUserDurationsChange={setUserDurations}
                /> */}
                </div>
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
            </ProFormGroup>
          </div>
          <Divider className="m-0 p-0"></Divider>
          {!currentAction && (
            <div className=" p-2 rounded-sm">
              <Title
                className="bg-slate-50 p-3 my-0 rounded-sm"
                level={5}
              >{`${t('REMOVE')}`}</Title>
              <ProFormGroup>
                <ProFormGroup direction="vertical">
                  <ProFormSelect
                    showSearch
                    rules={[{ required: true }]}
                    width={'md'}
                    name="partNumberIDOf"
                    label={`${t(`PART No`)}`}
                    // value={partNumber}
                    onChange={(value, data) => {
                      // console.log(data);
                      form.setFields([
                        {
                          name: 'nameOfMaterialOf',
                          value: data.data.DESCRIPTION,
                        },
                        {
                          name: 'reasonToRemoval',
                          value: data.data.reasonToRemoval,
                        },
                        { name: 'unit', value: data.data.UNIT_OF_MEASURE },
                      ]);
                    }}
                    options={Object.entries(partValueEnum).map(
                      ([key, part]) => ({
                        label: part.PART_NUMBER,
                        value: key,
                        data: part,
                      })
                    )}
                  />

                  <ProFormText
                    disabled
                    rules={[{ required: true }]}
                    name="nameOfMaterialOf"
                    label={t('DESCRIPTION')}
                    width="md"
                    tooltip={t('DESCRIPTION')}
                  ></ProFormText>
                  <ProFormText
                    // disabled
                    rules={[{ required: true }]}
                    name="serialNumberOf"
                    label={t('SERIAL No')}
                    width="md"
                    tooltip={t('SERIAL')}
                  ></ProFormText>
                </ProFormGroup>
                <ProFormGroup direction="vertical">
                  <ProFormDateTimePicker
                    width={'sm'}
                    name="removalDate"
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
                  <div>
                    <UserTaskAllocation
                      isTime
                      isSingle
                      users={users}
                      initialTaskAllocations={userDurationsRemove}
                      onTaskAllocationsChange={setUserDurationsRemove}
                    />
                    {/* <UserDurationList
                  users={users}
                  initialUserDurations={userDurations}
                  onUserDurationsChange={setUserDurations}
                /> */}
                  </div>
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
              </ProFormGroup>
            </div>
          )}
          <Divider className="m-0 p-0"></Divider>
          <ProFormGroup direction="vertical">
            <div className=" p-2 rounded-sm">
              <Title
                className="bg-slate-50 p-3 my-0 rounded-sm"
                level={5}
              >{`${t('POSITION')}`}</Title>
              <ProFormGroup>
                <ProFormText
                  // disabled
                  rules={[{ required: true }]}
                  name="position"
                  label={t('POSITION')}
                  width="md"
                  tooltip={t('POSITION')}
                ></ProFormText>
                <ProFormText
                  // disabled
                  rules={[{ required: true }]}
                  name="reasonToRemoval"
                  label={t('REASON FOR REMOVAL')}
                  width="xl"
                  tooltip={t('REASON FOR REMOVAL')}
                ></ProFormText>
              </ProFormGroup>
            </div>
          </ProFormGroup>
          {/* </Split> */}
        </ProForm>
      </div>
      {/* <div>
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
            <Tabs.TabPane tab={tabTitles['2']} key="2"></Tabs.TabPane>
          </Tabs>
        </div> */}
      {/* </Split> */}
    </Modal>
  );
};

export default ActionChangeForm;
