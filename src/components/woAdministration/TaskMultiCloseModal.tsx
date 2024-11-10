import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { ProFormDateTimePicker } from '@ant-design/pro-components';
import UserTaskAllocation from './UserTaskAllocation';
import { USER_ID } from '@/utils/api/http';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const TaskMultiCloseModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  currentAction?: any;
  currentTask?: any;
  users: any[];
  onlyWithOrganizationAuthorization?: boolean;
  onSave: (data: any) => void;
}> = ({
  visible,
  onCancel,
  onSave,
  users,
  currentTask,
  currentAction,
  onlyWithOrganizationAuthorization,
}) => {
  const [form] = Form.useForm();
  const [userPerformDurations, setPerformUserDurations] = useState<any[]>(
    currentAction?.userDurations || [{ id: uuidv4(), userID: '', duration: 0 }]
  );
  const [userInspectDurations, setInspectUserDurations] = useState<any[]>(
    currentAction?.userDurations || [{ id: uuidv4(), userID: '', duration: 0 }]
  );

  const { t } = useTranslation();

  const isNRCType =
    currentTask?.projectItemType === 'NRC' ||
    currentTask?.projectItemType === 'NRC_ADD' ||
    currentTask?.status === 'diRequired';

  const isAccessType = currentTask?.projectItemType === 'ACCESS';

  useEffect(() => {
    if (visible) {
      const currentDateTime = dayjs().utc().startOf('minute');

      form.setFieldsValue({
        performDateTime: currentAction?.performDate
          ? dayjs(currentAction.performDate).utc()
          : currentDateTime,
        inspectDateTime: currentAction?.inspectDate
          ? dayjs(currentAction.inspectDate).utc()
          : currentDateTime,
      });
      setPerformUserDurations(currentAction?.userDurations || []);
      setInspectUserDurations(currentAction?.userDurations || []);
    }
  }, [visible, currentAction, form]);

  const handleFinish = (values: any) => {
    const performDateTimeISO = dayjs(values.performDateTime)
      .utc()
      .startOf('minute')
      .toISOString();
    const inspectDateTimeISO = dayjs(values.inspectDateTime)
      .utc()
      .startOf('minute')
      .toISOString();
    console.log(performDateTimeISO);
    console.log(inspectDateTimeISO);

    if (isAccessType) {
      const newAccessAction: any = {
        id: currentAction ? currentAction._id : null,
        createDate: performDateTimeISO,
        createUserID: USER_ID,
        type: 'accessOpen',
        userPerformDurations: userPerformDurations,
      };

      // const isValidPerformDurations = userPerformDurations.every(
      //   (item) => item.userID && item.duration !== 0
      // );

      if (userPerformDurations.length > 0) {
        onSave([newAccessAction]);
        onCancel();
      } else {
        notification.error({
          message: 'Validation Error',
          description: 'Please ensure that a user is selected.',
        });
      }
    } else {
      const newPerfAction: any = {
        id: currentAction ? currentAction._id : null,
        createDate: performDateTimeISO,
        createUserID: USER_ID,
        type: 'pfmd',
        userPerformDurations: userPerformDurations,
      };
      const newInspectfAction: any = {
        id: currentAction ? currentAction._id : null,
        createDate: inspectDateTimeISO,
        createUserID: USER_ID,
        type: 'inspect',
        userInspectDurations: userInspectDurations,
      };
      const newClosedfAction: any = {
        id: currentAction ? currentAction._id : null,
        createDate: inspectDateTimeISO,
        createUserID: USER_ID,
        type: 'closed',
        userInspectDurations:
          userInspectDurations.length > 0
            ? [{ ...userInspectDurations[0], duration: 0 }]
            : [],
      };
      const newCDIlosedfAction: any = {
        id: currentAction ? currentAction._id : null,
        createDate: inspectDateTimeISO,
        createUserID: USER_ID,
        type: 'diClosed',
        userInspectDurations:
          userInspectDurations.length > 0
            ? [{ ...userInspectDurations[0], duration: 0 }]
            : [],
      };

      const isValidPerformDurations = userPerformDurations.every(
        (item) => item.userID && item.duration !== 0
      );
      const isValidInspectDurations = userInspectDurations.every(
        (item) => item.userID && item.duration !== 0
      );

      if (
        !isNRCType &&
        !isAccessType &&
        userPerformDurations.length > 0 &&
        userInspectDurations.length > 0 &&
        isValidPerformDurations &&
        isValidInspectDurations
      ) {
        onSave([newPerfAction, newInspectfAction, newClosedfAction]);
        onCancel();
      } else if (
        isNRCType &&
        userInspectDurations.length > 0 &&
        isValidInspectDurations
      ) {
        console.log(currentTask?.status);
        if (currentTask?.status === 'diRequired') {
          onSave([newCDIlosedfAction]);
        } else {
          onSave([newInspectfAction, newClosedfAction]);
        }
        onCancel();
      } else {
        notification.error({
          message: 'Validation Error',
          description:
            'Please ensure that all users are filled and durations are not zero in both Perform and Inspect durations.',
        });
      }
    }
  };

  return (
    <Modal
      width={isAccessType ? '50%' : !isNRCType ? '90%' : '50%'}
      visible={visible}
      title={t('USERS DURATIONS')}
      onOk={form.submit}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          {t('Cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={form.submit}>
          {t('Submit')}
        </Button>,
      ]}
    >
      <Form form={form} onFinish={handleFinish}>
        <div className="flex justify-between content-center justify-items-center gap-2">
          {(isAccessType || !isNRCType) && (
            <div
              style={{
                border: '0.5px solid #ccc',
                padding: '10px',
                marginBottom: '5px',
                borderRadius: '5px',
              }}
            >
              <h4 className="storeman">{t('PERFORM')}</h4>
              <UserTaskAllocation
                onlyWithOrganizationAuthorization={
                  onlyWithOrganizationAuthorization
                }
                task={currentTask}
                users={users}
                initialTaskAllocations={userPerformDurations}
                onTaskAllocationsChange={setPerformUserDurations}
                isSingle={isAccessType}
                isTime={isAccessType ? true : false}
              />
              <ProFormDateTimePicker
                width={'md'}
                name="performDateTime"
                label={`${t('DATE & TIME')}`}
                rules={[
                  {
                    required: true,
                    message: t('Please select date and time'),
                  },
                ]}
                fieldProps={{
                  format: 'YYYY-MM-DD HH:mm',
                  showTime: {
                    defaultValue: dayjs('00:00', 'HH:mm'),
                    format: 'HH:mm',
                  },
                  defaultValue: dayjs().utc().startOf('minute'),
                }}
              />
            </div>
          )}

          {!isAccessType && (
            <div
              style={{
                border: '0.5px solid #ccc',
                padding: '10px',
                marginBottom: '5px',
                borderRadius: '5px',
              }}
            >
              <h4 className="storeman">
                {isNRCType ? t('CLOSE') : t('INSPECT')}
              </h4>
              <UserTaskAllocation
                isSingle
                users={users}
                initialTaskAllocations={userInspectDurations}
                onTaskAllocationsChange={setInspectUserDurations}
                onlyWithOrganizationAuthorization={
                  onlyWithOrganizationAuthorization
                }
                isTime={false}
              />
              <ProFormDateTimePicker
                width={'md'}
                name="inspectDateTime"
                label={`${t('DATE & TIME')}`}
                rules={[
                  { required: true, message: t('Please select date and time') },
                ]}
                fieldProps={{
                  format: 'YYYY-MM-DD HH:mm',
                  showTime: {
                    defaultValue: dayjs('00:00', 'HH:mm'),
                    format: 'HH:mm',
                  },
                  defaultValue: dayjs().utc().startOf('minute'),
                }}
              />
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default TaskMultiCloseModal;
