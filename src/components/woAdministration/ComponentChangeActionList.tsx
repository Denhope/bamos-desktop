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
import ActionChangeForm from './ActionChangeForm';
import { useAddBookingMutation } from '@/features/bookings/bookingApi';
import { useAddActionMutation } from '@/features/projectItemWO/actionsApi';
import { useGlobalState } from './GlobalStateContext';
import { useGetUsersQuery } from '@/features/userAdministration/userApi';
import { useGetActionsTemplatesQuery } from '@/features/templatesAdministration/actionsTemplatesApi';
import { Split } from '@geoffcox/react-splitter';

interface ComponentChangeActionListProps {
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
    case 'install':
      return 'bg-green-50';
    case 'remove':
      return 'bg-red-50';
    default:
      return 'bg-yellow-50';
  }
};

const ComponentChangeActionList: React.FC<ComponentChangeActionListProps> = ({
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
  };

  return (
    <>
      {actions.length > 0 && (
        <div className="bg-slate-100 font-bold">{t('Component Change')}</div>
      )}
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
                <ActionChangeForm
                  currentAction={action}
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
                <Split initialPrimarySize="50%" splitterSize="10px">
                  <div
                    className={`cursor-pointer flex justify-between items-center rounded-sm ${
                      action?._id && selectedItems.includes(action?._id)
                        ? 'bg-blue-50'
                        : getActionColor(
                            action.componentChange?.installAction?.type
                          )
                    }`}
                    onClick={(event) => {
                      handleItemClick(event, action);
                      setVisibleEdit(true);
                      setCurrentAction(action);
                    }}
                    onDoubleClick={() => {
                      setVisibleEdit(true);
                      setCurrentAction(action);
                    }}
                    style={{ padding: '5px', borderRadius: '4px' }}
                  >
                    <Space style={{ width: '100%' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        {action?.componentChange?.installAction?.type ===
                          'install' && `${t('INSTALL')}`}
                      </div>
                      <Space
                        className="ml-auto font-bold"
                        style={{ fontSize: '12px' }}
                      >
                        <div style={{ color: '#666' }}>{t('added by')}</div>
                        <Tag color="#ffbe69">
                          {action?.componentChange?.installAction
                            ?.userDurations &&
                            action?.componentChange.installAction
                              .userDurations[0]?.userID
                              ?.organizationAuthorization}
                        </Tag>
                        <Tag color="#ffbe69">
                          {action?.componentChange?.installAction
                            ?.userDurations &&
                            `${action?.componentChange?.installAction.userDurations[0]?.userID?.firstNameEnglish?.toUpperCase()} ${action.componentChange.installAction.userDurations[0]?.userID?.lastNameEnglish?.toUpperCase()}`}
                        </Tag>
                      </Space>
                      <Space className="font-bold" style={{ fontSize: '12px' }}>
                        {moment(
                          action?.componentChange?.installAction?.installDate ||
                            new Date()
                        ).format('YYYY-MM-DD HH:mm')}
                      </Space>
                    </Space>
                  </div>
                  <div
                    className={`cursor-pointer flex justify-between items-center rounded-sm ${
                      action?._id && selectedItems.includes(action?._id)
                        ? 'bg-blue-50'
                        : getActionColor(
                            action.componentChange?.removeAction?.type
                          )
                    }`}
                    onClick={(event) => {
                      handleItemClick(event, action);
                      setVisibleEdit(true);
                      setCurrentAction(action);
                    }}
                    onDoubleClick={() => {
                      setVisibleEdit(true);
                      setCurrentAction(action);
                    }}
                    style={{ padding: '5px', borderRadius: '4px' }}
                  >
                    <Space style={{ width: '100%' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        {action?.componentChange?.removeAction?.type ===
                          'remove' && `${t('REMOVE')}`}
                      </div>
                      <Space
                        className="ml-auto font-bold"
                        style={{ fontSize: '12px' }}
                      >
                        <div style={{ color: '#666' }}>{t('added by')}</div>
                        <Tag color="#ffbe69">
                          {action?.componentChange?.removeAction
                            ?.userDurations &&
                            action.componentChange.removeAction.userDurations[0]
                              ?.userID?.organizationAuthorization}
                        </Tag>
                        <Tag color="#ffbe69">
                          {action?.componentChange?.removeAction
                            ?.userDurations &&
                            `${action.componentChange.removeAction.userDurations[0]?.userID?.firstNameEnglish?.toUpperCase()} ${action.componentChange.removeAction.userDurations[0]?.userID?.lastNameEnglish?.toUpperCase()}`}
                        </Tag>
                      </Space>
                      <Space className="font-bold" style={{ fontSize: '12px' }}>
                        {moment(
                          action?.componentChange?.removeAction?.removalDate ||
                            new Date()
                        ).format('YYYY-MM-DD HH:mm')}
                      </Space>
                    </Space>
                  </div>
                </Split>
              }
              description={
                <Split initialPrimarySize="50%" splitterSize="10px">
                  <div
                    className={`cursor-pointer flex rounded-sm flex-col ${
                      action?._id && selectedItems.includes(action._id)
                        ? 'bg-blue-50'
                        : ''
                    }`}
                    onClick={(event) => {
                      handleItemClick(event, action);
                      setVisibleEdit(true);
                      setCurrentAction(action);
                    }}
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
                    {/* Добавляем информацию о номерах установленных компонентов */}
                    <div>
                      <strong>{t('Installed Component')}:</strong>
                      <div>
                        <strong>{t('Certificate Number')}:</strong>{' '}
                        {
                          action?.componentChange?.installAction
                            ?.certificateNumber
                        }
                      </div>
                      <div>
                        <strong>{t('Serial Number ')}:</strong>{' '}
                        {action?.componentChange?.installAction?.serialOnNumber}
                      </div>
                      <div>
                        <strong>{t('Part Number')}:</strong>{' '}
                        {
                          action?.componentChange?.installAction?.partNumberID
                            ?.PART_NUMBER
                        }
                      </div>
                      <div>
                        <strong>{t('Description ')}:</strong>{' '}
                        {
                          action?.componentChange?.removeAction?.partNumberID
                            ?.DESCRIPTION
                        }
                      </div>
                      <div>
                        <strong>{t('Position')}:</strong>{' '}
                        {action?.componentChange?.installAction?.position}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`cursor-pointer flex rounded-sm flex-col ${
                      action?._id && selectedItems.includes(action._id)
                        ? 'bg-blue-50'
                        : ''
                    }`}
                    onClick={(event) => {
                      handleItemClick(event, action);
                      setVisibleEdit(true);
                      setCurrentAction(action);
                    }}
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
                    {/* Добавляем информацию о номерах снятых компонентов */}
                    <div>
                      <strong>{t('Removed Component')}:</strong>
                      <div>
                        <strong>{t('Serial Number ')}:</strong>{' '}
                        {action?.componentChange?.removeAction?.serialNumberOf}
                      </div>
                      <div>
                        <strong>{t('Part Number')}:</strong>{' '}
                        {
                          action?.componentChange?.removeAction?.partNumberID
                            ?.PART_NUMBER
                        }
                      </div>
                      <div>
                        <strong>{t('Description ')}:</strong>{' '}
                        {
                          action?.componentChange?.removeAction?.partNumberID
                            ?.DESCRIPTION
                        }
                      </div>
                      <div>
                        <strong>{t('Position')}:</strong>{' '}
                        {action?.componentChange?.installAction?.position}
                      </div>
                      <div>
                        <strong>{t('Reason to removal')}:</strong>{' '}
                        {action?.componentChange?.removeAction?.reasonToRemoval}
                      </div>
                    </div>
                  </div>
                </Split>
              }
            />
          </List.Item>
        )}
      />
    </>
  );
};

export default ComponentChangeActionList;
