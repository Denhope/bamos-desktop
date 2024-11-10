// @ts-nocheck

import React, { useState } from 'react';
import { Button, List, notification, Popover, Space, Tag } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Action } from '@/models/IStep';
import { PlusOutlined } from '@ant-design/icons';
import {
  useCheckStepEditStatusQuery,
  useSetStepEditStatusMutation,
} from '@/features/projectItemWO/stepApi';
import { USER_ID } from '@/utils/api/http';
import ActionForm from './ActionForm';
import { useAddBookingMutation } from '@/features/bookings/bookingApi';
import { useAddActionMutation } from '@/features/projectItemWO/actionsApi';
import { useGlobalState } from './GlobalStateContext';
import { useGetUsersQuery } from '@/features/userAdministration/userApi';
import { useGetActionsTemplatesQuery } from '@/features/templatesAdministration/actionsTemplatesApi';
import ActionInspection from './ActionInspection';

interface ActionListProps {
  step?: any;
  task?: any;
  actions: Action[];
  selectedItems: string[];
  handleItemClick: (
    event: React.MouseEvent<HTMLDivElement>,
    action: Action
  ) => void;
  setVisibleEdit: (visible: boolean) => void;
  setCurrentAction: (action: Action) => void;
}

const getActionColor = (type: string) => {
  switch (type) {
    case 'pfmd':
      return 'bg-green-50';
    case 'inspect':
      return 'bg-orange-50';
    case 'doubleInspect':
      return 'bg-red-50';
    case 'closed':
      return 'bg-gray-50';
    default:
      return 'bg-yellow-50';
  }
};

const ActionList: React.FC<ActionListProps> = ({
  actions,
  selectedItems,
  handleItemClick,
  setVisibleEdit,
  setCurrentAction,
  step,
  task,
}) => {
  const { t } = useTranslation();

  const { data: users } = useGetUsersQuery({});

  const { data: templates, isLoading: isTemplatesLoading } =
    useGetActionsTemplatesQuery({});
  const [visibleActionAdd, setVisibleActionAdd] = useState(false);
  const { data: editStatus, refetch: refetchEditStatus } =
    useCheckStepEditStatusQuery(step?.id || '', {
      skip: !step?.id,
    });
  const [setStepEditStatus] = useSetStepEditStatusMutation({});
  const handleActionAddClick = async (event: React.MouseEvent) => {
    event.stopPropagation(); // Предотвращаем всплытие события
    console.log('Action add clicked');
    const stepId = step?.id;
    try {
      const response = await refetchEditStatus().unwrap();
      if (response && response.isEditing && response.editingUser !== USER_ID) {
        notification.warning({
          message: t('STEP EDITING'),
          description: `${t('Step is being edited by')} ${
            response.editingUser
          }`,
        });
      } else {
        stepId && (await setStepEditStatus({ stepId, isEditing: true }));
        setVisibleActionAdd(true);
      }
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error checking step edit status.'),
      });
    }
  };

  const [addAction] = useAddActionMutation();
  const handleActionAddCancel = async () => {
    console.log('Action edit cancelled');
    const stepId = step.id;
    try {
      setVisibleActionAdd(false);
      stepId && (await setStepEditStatus({ stepId, isEditing: false }));
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error updating step edit status.'),
      });
    }
  };
  const { setCurrentTime } = useGlobalState();
  const handleActionSave = async (data: any) => {
    console.log(data);
    try {
      if (!data || !data.inspectedAction) {
        notification.error({
          message: t('VALIDATION ERROR'),
          description: t('Inspection action is required.'),
        });
        return;
      }

      // if (
      //   !data.performAction.userDurations ||
      //   data.performAction.userDurations.length === 0
      // ) {
      //   notification.error({
      //     message: t('VALIDATION ERROR'),
      //     description: t(
      //       'Perform action must have at least one user duration.'
      //     ),
      //   });
      //   return;
      // }

      // const isValidPerformAction = data.performAction.userDurations.every(
      //   (item) => item.userID && item.duration !== 0
      // );

      // if (!isValidPerformAction) {
      //   notification.error({
      //     message: t('VALIDATION ERROR'),
      //     description: t(
      //       'Please ensure that all userIDs are filled and durations are not zero in Perform durations.'
      //     ),
      //   });
      //   return;
      // }

      if (data.inspectedAction) {
        if (
          !data.inspectedAction.userDurations ||
          data.inspectedAction.userDurations.length === 0
        ) {
          notification.error({
            message: t('VALIDATION ERROR'),
            description: t(
              'Inspected action must have at least one user duration.'
            ),
          });
          return;
        }

        const isValidInspectedAction = data.inspectedAction.userDurations.every(
          (item) => item.userID && item.duration !== 0
        );

        if (!isValidInspectedAction) {
          notification.error({
            message: t('VALIDATION ERROR'),
            description: t(
              'Please ensure that all userIDs are filled and durations are not zero in Inspect durations.'
            ),
          });
          return;
        }
      }

      // try {
      //   await addAction({
      //     action: data.performAction,
      //     stepId: step?.id || '',
      //     projectItemID: step?.projectItemID,
      //     projectId: step?.projectId,
      //     projectTaskID: step?.projectTaskID,
      //     status: data.status,
      //   }).unwrap();

      //   setVisibleActionAdd(false);
      //   // setCurrentAction(null);
      //   // refetch(); // Оставляем только этот запрос
      //   // refetchTasks();
      //   setCurrentTime(Date.now());
      // } catch (actionError) {
      //   console.error('Error adding perform action:', actionError);
      //   notification.error({
      //     message: t('ERROR SAVING'),
      //     description: t('ERROR SAVING PERFORM ACTION'),
      //   });
      //   return;
      // }

      if (data.inspectedAction) {
        try {
          await addAction({
            action: data.inspectedAction,
            stepId: step?.id || '',
            projectItemID: step?.projectItemID,
            projectId: step?.projectId,
            projectTaskID: step?.projectTaskID,
            status: data.status,
          }).unwrap();

          setVisibleActionAdd(false);
          // setCurrentAction(null);
          // refetch(); // Оставляем только этот запрос
          // refetchTasks();
          setCurrentTime(Date.now());
        } catch (actionError) {
          console.error('Error adding inspect action:', actionError);
          notification.error({
            message: t('ERROR SAVING'),
            description: t('ERROR SAVING INSPECT ACTION'),
          });
          return;
        }
      }

      notification.success({
        message: t('ACTION ADDED'),
        description: t('ACTION SUCCESSFULLY ADDED'),
      });

      try {
        await addBooking({
          booking: { voucherModel: 'ADD_ACTION', data: data.performAction },
        }).unwrap();
      } catch (bookingError) {
        console.error('Error adding perform booking:', bookingError);
        notification.error({
          message: t('ERROR SAVING'),
          description: t('ERROR SAVING PERFORM BOOKING'),
        });
        return;
      }

      if (data.inspectedAction) {
        try {
          await addBooking({
            booking: { voucherModel: 'ADD_ACTION', data: data.inspectedAction },
          }).unwrap();
        } catch (bookingError) {
          console.error('Error adding inspect booking:', bookingError);
          notification.error({
            message: t('ERROR SAVING'),
            description: t('ERROR SAVING INSPECT BOOKING'),
          });
          return;
        }
      }

      // setVisibleActionEdit(false);
      await setStepEditStatus({
        stepId: step.id || '',
        isEditing: false,
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      notification.error({
        message: t('ERROR SAVING'),
        description: t('ERROR SAVING ACTION '),
      });
    }
  };

  const [addBooking] = useAddBookingMutation({});
  const handleNewActionSave = (data: any) => {
    handleActionSave(data);
    console.log(newAction);
    // setVisibleActionAdd(false);
    // setCurrentAction(null);
    // refetch(); // Оставляем только этот запрос
    // refetchTasks();
    // setCurrentTime(Date.now());
  };
  return (
    <>
      <List
        dataSource={actions}
        renderItem={(action) => (
          <List.Item
            style={{ padding: '5px 10px' }}
            className={`cursor-pointer flex rounded-sm ${
              action?._id && selectedItems.includes(action?._id)
                ? 'bg-blue-50'
                : ''
            }`}
          >
            <>
              {visibleActionAdd && (
                <ActionInspection
                  performedAction={action}
                  task={task}
                  step={step}
                  key="newAction"
                  visible={visibleActionAdd}
                  onCancel={handleActionAddCancel}
                  onSave={handleNewActionSave}
                  templates={templates || []}
                  users={users || []}
                />
              )}
            </>
            <List.Item.Meta
              style={{ padding: 0 }}
              title={
                <>
                  <div
                    className={`cursor-pointer flex justify-between items-center rounded-sm ${
                      action?._id && selectedItems.includes(action?._id)
                        ? 'bg-blue-50'
                        : getActionColor(action.type)
                    }`}
                    onClick={(event) => handleItemClick(event, action)}
                    onDoubleClick={() => {
                      setVisibleEdit(true);
                      setCurrentAction(action);
                    }}
                    style={{ padding: '5px', borderRadius: '4px' }}
                  >
                    <Space style={{ width: '100%' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        {action?.type === 'pfmd' && `${t('PFMD')}`}
                        {action?.type === 'inspect' && `${t('INSPECTION')}`}
                        {action?.type === 'doubleInspect' &&
                          `${t('DINSPECTION')}`}
                        {action?.type === 'closed' && `${t('CLOSE')}`}
                        {action?.type === 'diClosed' && `${t('DI CLOSE')}`}
                      </div>
                      <Space
                        className="ml-auto font-bold"
                        style={{ fontSize: '12px' }}
                      >
                        <div style={{ color: '#666' }}>{t('added by')}</div>
                        <Tag color="#ffbe69">
                          {action?.userDurations &&
                            action.userDurations[0]?.userID
                              ?.organizationAuthorization}
                        </Tag>
                        <Tag color="#ffbe69">
                          {action?.userDurations &&
                            `${action.userDurations[0]?.userID?.firstNameEnglish?.toUpperCase()} ${action.userDurations[0]?.userID?.lastNameEnglish?.toUpperCase()}`}
                        </Tag>
                      </Space>
                      <Space className="font-bold" style={{ fontSize: '12px' }}>
                        {(task &&
                          task.projectItemType == 'RC' &&
                          (action?.type == 'inspect' ||
                            action?.type == 'pfmd')) ||
                        action?.type == 'closed' ||
                        action?.type == 'diClosed'
                          ? moment(action?.createDate || new Date())
                              .utc()
                              .format('YYYY-MM-DD HH:mm')
                          : moment(action?.createDate || new Date()).format(
                              'YYYY-MM-DD HH:mm'
                            )}
                      </Space>
                    </Space>
                    <>
                      <div className="font-bold" style={{ fontSize: '14px' }}>
                        {/* {`${t('STEP ID')} ${step.stepIdentificator}`} */}
                      </div>
                      {action?.type === 'pfmd' && (
                        <Popover content={t('ADD INSPECTOR')}>
                          <Button
                            danger
                            size="small"
                            type="primary"
                            shape="circle"
                            icon={<>I</>}
                            onClick={handleActionAddClick}
                          />
                        </Popover>
                      )}
                    </>
                  </div>
                </>
              }
              description={
                <div
                  className={`cursor-pointer flex rounded-sm flex-col ${
                    action?._id && selectedItems.includes(action._id)
                      ? 'bg-blue-50'
                      : ''
                  }`}
                  onClick={(event) => handleItemClick(event, action)}
                  onDoubleClick={() => {
                    setVisibleEdit(true);
                    setCurrentAction(action);
                  }}
                  style={{
                    padding: '5px',
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <span
                    className="font-semibold my-0 py-0"
                    dangerouslySetInnerHTML={{ __html: action?.headline }}
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                  <span
                    dangerouslySetInnerHTML={{ __html: action?.description }}
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                </div>
              }
            />
          </List.Item>
        )}
      />
    </>
  );
};

export default ActionList;
