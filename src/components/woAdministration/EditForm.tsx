//ts-nocheck

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
import ReportPrintUnserviceTag from '../shared/ReportPrintUnserviceTag';

dayjs.extend(utc);

interface EditFormProps {
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

const EditForm: React.FC<EditFormProps> = ({
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
  >(currentAction?.componentChange?.installAction?.userDurations || []);
  const [userDurationsRemove, setUserDurationsRemove] = useState<
    UserDuration[]
  >(currentAction?.componentChange?.removeAction?.userDurations || []);
  const [activeTabKey, setActiveTabKey] = useState('1');

  const handleFinish = (values: any) => {
    const removalDate = dayjs(values.removalDate).utc().startOf('minute');
    const installDate = dayjs(values.installDate).utc().startOf('minute');
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
      createDate: new Date(),
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
      removalDate: removalDate.toISOString(),
      createUserID: USER_ID,
      type: 'remove',
      createDate: new Date(),
      position: values.position,
      serialNumberOf: values?.serialNumberOf,
      partNumberID: values?.partNumberIDOf,
      userDurations: userDurationsRemove,
      reasonToRemoval: values.reasonToRemoval,
    };

    onSave({
      ...currentAction,
      componentChange: {
        installAction: newActionInstall,
        removeAction:
          userDurationsRemove && userDurationsRemove.length > 0
            ? newActionRemove
            : null,
        // status: values.status,}
      },
    });
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
    if (visible && currentAction) {
      const currentDateTime = dayjs().utc().startOf('minute');

      form.setFieldsValue({
        headline: currentAction.headline || '',
        description: currentAction.description || '',
        certificateNumber:
          currentAction.componentChange?.installAction?.certificateNumber || '',
        serialOnNumber:
          currentAction.componentChange?.installAction?.serialOnNumber || '',
        partNumberIDOn:
          currentAction.componentChange?.installAction?.partNumberID?._id ||
          null,
        nameOfMaterialOn:
          currentAction.componentChange?.installAction?.partNumberID
            ?.DESCRIPTION || '',
        position: currentAction.componentChange?.installAction?.position || '',
        installDate: currentAction.componentChange?.installAction?.installDate
          ? dayjs(currentAction.componentChange.installAction.installDate)
          : currentDateTime,
        serialNumberOf:
          currentAction.componentChange?.removeAction?.serialNumberOf || '',
        partNumberIDOf:
          currentAction.componentChange?.removeAction?.partNumberID?._id || '',
        nameOfMaterialOf:
          currentAction.componentChange?.installAction?.partNumberID
            ?.DESCRIPTION || '',
        removalDate: currentAction.componentChange?.removeAction?.removalDate
          ? dayjs(currentAction.componentChange.removeAction.removalDate)
          : currentDateTime,
        status: task.status,
        reasonToRemoval:
          currentAction.componentChange?.removeAction?.reasonToRemoval || '',
      });

      setUserDurationsInstall(
        currentAction.componentChange?.installAction?.userDurations || []
      );
      setUserDurationsRemove(
        currentAction.componentChange?.removeAction?.userDurations || []
      );
    }
  }, [visible, currentAction, form]);

  const disabledDate = (current: dayjs.Dayjs) => {
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
      acc[partNumber._id] = partNumber;
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
      <div>
        <ProForm
          submitter={false}
          size="small"
          form={form}
          layout="horizontal"
          onFinish={handleFinish}
        >
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
            <Title className="bg-slate-50 p-1 my-0 rounded-sm" level={5}>{`${t(
              'INSTALL'
            )}`}</Title>
            <ProFormGroup>
              <ProFormGroup direction="vertical">
                <ProFormText
                  name="certificateNumber"
                  label={t('CERTIFICATE No')}
                  width="md"
                  tooltip={t('CERTIFICATE')}
                ></ProFormText>
                <ProFormSelect
                  showSearch
                  width={'md'}
                  name="partNumberIDOn"
                  label={`${t(`PART No`)}`}
                  onChange={(value, data) => {
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
                  name="nameOfMaterial"
                  label={t('DESCRIPTION')}
                  width="md"
                  tooltip={t('DESCRIPTION')}
                ></ProFormText>
                <ProFormText
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
                    format: 'YYYY-MM-DD HH:mm',
                    showTime: {
                      defaultValue: dayjs('00:00', 'HH:mm'),
                      format: 'HH:mm',
                      disabledHours: disabledDateTime().disabledHours,
                      disabledMinutes: disabledDateTime().disabledMinutes,
                    },
                    defaultValue: dayjs().utc().startOf('minute'),
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
                </div>
              </ProFormGroup>
            </ProFormGroup>
          </div>
          <Divider className="m-0 p-0"></Divider>
          <div className=" p-2 rounded-sm">
            <Title className="bg-slate-50 p-3 my-0 rounded-sm" level={5}>{`${t(
              'REMOVE'
            )}`}</Title>
            <ProFormGroup>
              <ProFormGroup direction="vertical">
                <ProFormSelect
                  showSearch
                  width={'md'}
                  name="partNumberIDOf"
                  label={`${t(`PART No`)}`}
                  onChange={(value, data) => {
                    form.setFields([
                      {
                        name: 'nameOfMaterialOf',
                        value: data.data.DESCRIPTION,
                      },
                      { name: 'unit', value: data.data.UNIT_OF_MEASURE },
                      {
                        name: 'reasonToRemoval',
                        value: data.data.reasonToRemoval,
                      },
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
                  name="nameOfMaterialOf"
                  label={t('DESCRIPTION')}
                  width="md"
                  tooltip={t('DESCRIPTION')}
                ></ProFormText>
                <ProFormText
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
                  fieldProps={{
                    format: 'YYYY-MM-DD HH:mm',
                    showTime: {
                      defaultValue: dayjs('00:00', 'HH:mm'),
                      format: 'HH:mm',
                      disabledHours: disabledDateTime().disabledHours,
                      disabledMinutes: disabledDateTime().disabledMinutes,
                    },
                    defaultValue: dayjs().utc().startOf('minute'),
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
                </div>
              </ProFormGroup>
            </ProFormGroup>
          </div>
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

                <ReportPrintUnserviceTag
                  task={task}
                  currentAction={currentAction}
                  isDisabled={!currentAction?._id}
                  xmlTemplate={''}
                  data={[]}
                  ids={[currentAction?._id]}
                ></ReportPrintUnserviceTag>
              </ProFormGroup>
            </div>
          </ProFormGroup>
        </ProForm>
      </div>
    </Modal>
  );
};

export default EditForm;
