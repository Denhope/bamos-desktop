// @ts-nocheck
import { useGlobalState } from './GlobalStateContext';
import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Popover,
  Space,
  Tag,
  notification,
  Checkbox,
} from 'antd';
import { PlusOutlined, SwapOutlined } from '@ant-design/icons';
import moment from 'moment';
import ActionForm from './ActionForm';
import ActionList from './ActionListItem';
import { Action, IStep } from '@/models/IStep';

import { USER_ID } from '@/utils/api/http';
import { Split } from '@geoffcox/react-splitter';
import StepEditModal from './StepEditModal';
import TemplateSelector from './TemplateSelector';
import { useAddBookingMutation } from '@/features/bookings/bookingApi';
import {
  useAddActionMutation,
  useUpdateActionMutation,
  useDeleteActionMutation,
} from '@/features/projectItemWO/actionsApi';
import {
  useCheckStepEditStatusQuery,
  useSetStepEditStatusMutation,
  useUpdateStepMutation,
  useGetFilteredStepsQuery,
} from '@/features/projectItemWO/stepApi';
import { useTranslation } from 'react-i18next';
import { useGetUsersQuery } from '@/features/userAdministration/userApi';
import { useGetGroupsUserQuery } from '@/features/userAdministration/userGroupApi';
import { useGetSkillsQuery } from '@/features/userAdministration/skillApi';
import { useGetProjectItemsWOQuery } from '@/features/projectItemWO/projectItemWOApi';
import { useGetActionsTemplatesQuery } from '@/features/templatesAdministration/actionsTemplatesApi';
import { ipcRenderer } from 'electron';
import ActionInspection from './ActionInspection';
import ActionClosed from './ActionClosed';
import ActionChangeForm from './ActionChangeForm';
import ComponentChangeActionList from './ComponentChangeActionList';
import EditForm from './EditForm';

interface Props {
  step: IStep;
  selectedStepItems: string[];
  task?: any;
  handleStepClick: (
    event: React.MouseEvent<HTMLDivElement>,
    step: IStep
  ) => void;
  handleStepSelect: (stepId: string, isSelected: boolean) => void;
}

const StepCard: React.FC<Props> = ({
  step,
  selectedStepItems,
  handleStepClick,
  handleStepSelect,
  task,
}) => {
  const [visibleActionEdit, setVisibleActionEdit] = useState(false);
  const [visibleActionAdd, setVisibleActionAdd] = useState(false);
  const [visibleActionChange, setVisibleActionChange] = useState(false);
  const [visibleActionEditChange, setVisibleActionEditChange] = useState(false);
  const [currentAction, setCurrentAction] = useState<Action | null>(null);
  const [visibleStepEdit, setVisibleStepEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // New state to track editing status
  const { data: users } = useGetUsersQuery({});
  const { data: editStatus, refetch: refetchEditStatus } =
    useCheckStepEditStatusQuery(step.id || '', {
      skip: !step.id,
    });
  const [setStepEditStatus] = useSetStepEditStatusMutation({});

  const handleActionClick = async (
    event: React.MouseEvent<HTMLDivElement>,
    action: Action
  ) => {
    try {
      const response = await refetchEditStatus().unwrap();
      if (response && response.isEditing && response.editingUser !== USER_ID) {
        notification.warning({
          message: t('STEP EDITING'),
          description: t(
            'This step is currently being edited by another user.'
          ),
        });
      } else {
        setCurrentAction(action);
        setVisibleActionEdit(true);
        step.id &&
          (await setStepEditStatus({
            stepId: step.id,
            isEditing: true,
          }));
      }
    } catch (error) {
      notification.error({
        message: t('Error checking step edit status.'),
        description: t('Error checking step edit status.'),
      });
    }
  };

  const handleActionAddClick = async () => {
    console.log('Action add clicked');
    const stepId = step.id;
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

  const handleComponentChangeAddClick = async () => {
    console.log('Action add clicked');
    const stepId = step.id;
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
        setVisibleActionChange(true);
      }
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error checking step edit status.'),
      });
    }
  };

  const [addAction] = useAddActionMutation();
  const [editAction] = useUpdateActionMutation();
  const [deleteAction] = useDeleteActionMutation();
  const [updateStep] = useUpdateStepMutation({});

  const { refetch } = useGetFilteredStepsQuery(
    { projectItemID: step.projectItemID },
    {
      skip: !step.projectItemID,
    }
  );

  const { setCurrentTime } = useGlobalState();
  const handleActionSaveChance = async (data: any) => {
    if (!data || !data.removeAction) {
      notification.error({
        message: t('VALIDATION ERROR'),
        description: t('Removal action is required.'),
      });
      return;
    }
    if (
      !data.removeAction.userDurations ||
      data.removeAction.userDurations.length === 0
    ) {
      notification.error({
        message: t('VALIDATION ERROR'),
        description: t('Removal action must have at least one user duration.'),
      });
      return;
    }
    try {
      await addAction({
        componentAction: data,
        isComponentChangeAction: true,
        stepId: step?.id || '',
        projectItemID: step?.projectItemID,
        projectId: step?.projectId,
        projectTaskID: step?.projectTaskID,
        // status: data.status,
      }).unwrap();
      notification.success({
        message: t('ACTION ADDED'),
        description: t('ACTION SUCCESSFULLY ADDED'),
      });

      setVisibleActionChange(false);
      setCurrentAction(null);
      // refetch(); // Оставляем только этот запрос
      // refetchTasks();
      // setCurrentTime(Date.now());

      try {
        await addBooking({
          booking: { voucherModel: 'ADD_ACTION', data: data },
        }).unwrap();
      } catch (bookingError) {
        console.error('Error adding perform booking:', bookingError);
        notification.error({
          message: t('ERROR SAVING'),
          description: t('ERROR SAVING PERFORM BOOKING'),
        });
        return;
      }
    } catch (actionError) {
      console.error('Error adding  action:', actionError);
      notification.error({
        message: t('ERROR SAVING'),
        description: t('ERROR SAVING COMPONENT ACTION'),
      });
      return;
    }
  };
  const handleActionSave = async (data: any) => {
    try {
      if (!data || !data.performAction) {
        notification.error({
          message: t('VALIDATION ERROR'),
          description: t('Perform action is required.'),
        });
        return;
      }

      if (
        !data.performAction.userDurations ||
        data.performAction.userDurations.length === 0
      ) {
        notification.error({
          message: t('VALIDATION ERROR'),
          description: t(
            'Perform action must have at least one user duration.'
          ),
        });
        return;
      }

      const isValidPerformAction = data.performAction.userDurations.every(
        (item) => item.userID && item.duration !== 0
      );

      if (!isValidPerformAction) {
        notification.error({
          message: t('VALIDATION ERROR'),
          description: t(
            'Please ensure that all userIDs are filled and durations are not zero in Perform durations.'
          ),
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

      try {
        await addAction({
          action: data.performAction,
          stepId: step?.id || '',
          projectItemID: step?.projectItemID,
          projectId: step?.projectId,
          projectTaskID: step?.projectTaskID,
          status: data.status,
        });

        setVisibleActionAdd(false);
        setCurrentTime(Date.now());
        setCurrentAction(null);
        // refetch(); // Оставляем только этот запрос
        // refetchTasks();
      } catch (actionError) {
        console.error('Error adding perform action:', actionError);
        notification.error({
          message: t('ERROR SAVING'),
          description: t('ERROR SAVING PERFORM ACTION'),
        });
        return;
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
          });

          setVisibleActionAdd(false);
          setCurrentAction(null);
          // refetch(); // Оставляем только этот запрос
          // refetchTasks();
          // setCurrentTime(Date.now());
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
        });
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
          });
        } catch (bookingError) {
          console.error('Error adding inspect booking:', bookingError);
          notification.error({
            message: t('ERROR SAVING'),
            description: t('ERROR SAVING INSPECT BOOKING'),
          });
          return;
        }
      }

      setVisibleActionEdit(false);
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

  const handleActionEditSave = async (updateAction: any) => {
    try {
      if (!updateAction || !updateAction.performAction) {
        notification.error({
          message: t('VALIDATION ERROR'),
          description: t('Perform action is required.'),
        });
        return;
      }

      if (
        !updateAction.performAction.userDurations ||
        updateAction.performAction.userDurations.length === 0
      ) {
        notification.error({
          message: t('VALIDATION ERROR'),
          description: t(
            'Perform action must have at least one user duration.'
          ),
        });
        return;
      }

      const isValidPerformAction =
        updateAction.performAction.userDurations.every(
          (item) => item.userID && item.duration !== 0
        );

      if (!isValidPerformAction) {
        notification.error({
          message: t('VALIDATION ERROR'),
          description: t(
            'Please ensure that all userIDs are filled and durations are not zero in Perform durations.'
          ),
        });
        return;
      }

      await editAction({
        action: {
          id: updateAction.performAction.id,
          type: currentAction.type,
          headline: updateAction.performAction.headline,
          description: updateAction.performAction.description,
          createDate: updateAction.performAction.createDate,
          userDurations: updateAction.performAction.userDurations,
          status: updateAction.status,
        },
      });

      await addBooking({
        booking: { voucherModel: 'EDIT_ACTION', data: updateAction },
      });

      setVisibleActionEdit(false);
      setCurrentTime(Date.now());
      setCurrentAction(null);
      step?.id &&
        (await setStepEditStatus({
          stepId: step?.id,
          isEditing: false,
        }));
      notification.success({
        message: t('ACTION EDIT'),
        description: t('ACTION SUCCESSFULLY EDIT.'),
      });
      // refetch();
    } catch (error) {
      notification.error({
        message: t('ERROR EDIT'),
        description: t('ERROR EDIT ACTION.'),
      });
      await setStepEditStatus({
        stepId: updateAction?.projectStepId,
        isEditing: false,
      });
      // refetch();
    }
  };

  const handleActionEditInspectionSave = async (updateAction: any) => {
    try {
      if (!updateAction || !updateAction.inspectedAction) {
        notification.error({
          message: t('VALIDATION ERROR'),
          description: t('Perform action is required.'),
        });
        return;
      }

      if (
        !updateAction.inspectedAction.userDurations ||
        updateAction.inspectedAction.userDurations.length === 0
      ) {
        notification.error({
          message: t('VALIDATION ERROR'),
          description: t(
            'Perform action must have at least one user duration.'
          ),
        });
        return;
      }

      const isValidPerformAction =
        updateAction.inspectedAction.userDurations.every(
          (item: any) => item.userID && item.duration !== 0
        );

      if (!isValidPerformAction) {
        notification.error({
          message: t('VALIDATION ERROR'),
          description: t(
            'Please ensure that all userIDs are filled and durations are not zero in Perform durations.'
          ),
        });
        return;
      }

      await editAction({
        action: {
          id: updateAction.inspectedAction.id,
          type: currentAction.type,
          headline: updateAction.inspectedAction.headline,
          description: updateAction.inspectedAction.description,
          createDate: updateAction.inspectedAction.createDate,
          userDurations: updateAction.inspectedAction.userDurations,
          status: updateAction.status,
        },
      });

      await addBooking({
        booking: { voucherModel: 'EDIT_ACTION', data: updateAction },
      });

      notification.success({
        message: t('ACTION EDIT'),
        description: t('ACTION SUCCESSFULLY EDIT.'),
      });

      setVisibleActionEdit(false);
      step?.id &&
        (await setStepEditStatus({
          stepId: step?.id,
          isEditing: false,
        }));
      setCurrentTime(Date.now());
      setCurrentAction(null);
      console.log('stepId:', step);

      // refetch();
    } catch (error) {
      console.log(error);
      notification.error({
        message: t('ERROR EDIT'),
        description: t('ERROR EDIT ACTION.'),
      });
      // await setStepEditStatus({
      //   stepId: updateAction?.projectStepId,
      //   isEditing: false,
      // }).unwrap();

      // refetch();
    }
  };

  const handleActionEditChangeSave = async (updateAction: any) => {
    // console.log(updateAction);
    if (!updateAction || !updateAction.componentChange.removeAction) {
      notification.error({
        message: t('VALIDATION ERROR'),
        description: t('Removal action is required.'),
      });
      return;
    }
    if (
      !updateAction.componentChange.removeAction.userDurations ||
      updateAction.componentChange.removeAction.userDurations.length === 0
    ) {
      notification.error({
        message: t('VALIDATION ERROR'),
        description: t('Removal action must have at least one user duration.'),
      });
      return;
    }
    console.log(updateAction);
    await editAction({
      action: {
        id: updateAction._id,

        ...updateAction,
        // status: updateAction.status,
      },
    });
    await addBooking({
      booking: { voucherModel: 'EDIT_ACTION', data: updateAction },
    });
    notification.success({
      message: t('ACTION EDIT'),
      description: t('ACTION SUCCESSFULLY EDIT.'),
    });
    setVisibleActionChange(false);
    setCurrentTime(Date.now());
    setCurrentAction(null);

    step?.id &&
      (await setStepEditStatus({
        stepId: step?.id,
        isEditing: false,
      }));
    // refetch();
  };

  const handleActionEditClosedSave = async (updateAction: any) => {
    try {
      if (!updateAction || !updateAction.closedAction) {
        notification.error({
          message: t('VALIDATION ERROR'),
          description: t('Perform action is required.'),
        });
        return;
      }

      if (
        !updateAction.closedAction.userDurations ||
        updateAction.closedAction.userDurations.length === 0
      ) {
        notification.error({
          message: t('VALIDATION ERROR'),
          description: t(
            'Perform action must have at least one user duration.'
          ),
        });
        return;
      }

      const isValidPerformAction =
        updateAction.closedAction.userDurations.every(
          (item) => item.userID && item.duration !== 0
        );

      if (!isValidPerformAction) {
        notification.error({
          message: t('VALIDATION ERROR'),
          description: t(
            'Please ensure that all userIDs are filled and durations are not zero in Perform durations.'
          ),
        });
        return;
      }

      await editAction({
        action: {
          id: updateAction.closedAction.id,
          type: currentAction.type,
          headline: updateAction.closedAction.headline,
          description: updateAction.closedAction.description,
          createDate: updateAction.closedAction.createDate,
          userDurations: updateAction.closedAction.userDurations,
          status: updateAction.status,
        },
      });

      await addBooking({
        booking: { voucherModel: 'EDIT_ACTION', data: updateAction },
      });

      notification.success({
        message: t('ACTION EDIT'),
        description: t('ACTION SUCCESSFULLY EDIT.'),
      });

      setVisibleActionEdit(false);
      setCurrentAction(null);
      // setCurrentTime(Date.now());
      step?.id &&
        (await setStepEditStatus({
          stepId: step?.id,
          isEditing: false,
        }));
      // refetch();
    } catch (error) {
      notification.error({
        message: t('ERROR EDIT'),
        description: t('ERROR EDIT ACTION.'),
      });
      await setStepEditStatus({
        stepId: updateAction?.projectStepId,
        isEditing: false,
      }).unwrap();

      // refetch();
    }
  };

  const handleNewActionSave = (data: any) => {
    handleActionSave(data);
    // console.log(newAction);
    // setVisibleActionAdd(false);
    // setCurrentAction(null);
    // refetch(); // Оставляем только этот запрос
    // refetchTasks();
    // setCurrentTime(Date.now());
  };
  const handleNewActionSaveChange = (data: any) => {
    handleActionSaveChance(data);
    // console.log(newAction);
    // setVisibleActionAdd(false);
    // setCurrentAction(null);
    // refetch(); // Оставляем только этот запрос
    // refetchTasks();
    // setCurrentTime(Date.now());
  };

  const handleStepSave = async (updatedStep: IStep) => {
    try {
      await updateStep({
        step: {
          id: updatedStep.id,
          stepNumber: updatedStep.stepNumber,
          stepHeadLine: updatedStep.stepHeadLine,
          stepDescription: updatedStep.stepDescription,
          stepType: updatedStep.stepType,
          skillID: updatedStep.skillID,
          userGroupID: updatedStep.userGroupID,
          userDurations: updatedStep.userDurations,
          createDate: updatedStep.createDate,
          defectCodeID: updatedStep.defectCodeID,
          taskStatus: updatedStep.taskStatus,
        },
      });
      setVisibleStepEdit(false);

      // refetch();
      notification.success({
        message: t('STEP SAVED'),
        description: 'The step has been successfully saved.',
      });
      await addBooking({
        booking: { voucherModel: 'EDIT_STEP', data: updatedStep },
      });
      setCurrentTime(Date.now());
    } catch (error) {
      notification.error({
        message: t('Error Saving Step'),
        description: t('There was an error saving the step.'),
      });
    }
  };

  const handleActionDelete = async (actionId: string) => {
    try {
      if (actionId) {
        await deleteAction(actionId).unwrap();

        setCurrentAction(null);
        notification.success({
          message: t('ACTION DELETE'),
          description: t('THE ACTION HAS BEEN SUCCESSFULLY DELETED.'),
        });
        // refetch();
        // setCurrentTime(Date.now());
      } else {
        // Обработка случая, когда actionId не существует
      }
      setVisibleActionEdit(false);
      setCurrentAction(null);
    } catch (error) {
      // Используем CustomNotification вместо message.error
      notification.error({
        message: t('ERROR ACTION DELETE'),
        description: t('THERE WAS AN ERROR DELETING THE ACTION.'),
      });
    }
    setVisibleActionEdit(false);

    // refetch();
  };

  const handleStepEditClick = async () => {
    const stepId = step.id;
    // openNewWindow(StepEditModal, { step: stepData, onSave: handleSave });
    try {
      // Wait for the refetchEditStatus to complete
      const response = await refetchEditStatus().unwrap();

      // Check the result of the refetch
      if (response && response.isEditing && response.editingUser !== USER_ID) {
        notification.warning({
          message: t('STEP EDITING'),
          description: `${t('Step is being edited by')} ${
            response.editingUser
          }`,
        });
      } else {
        setVisibleStepEdit(true);
        stepId && (await setStepEditStatus({ stepId, isEditing: true }));
      }
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error editing step edit status.'),
      });
    }
  };

  const handleStepEditCancel = async () => {
    console.log('Step edit cancelled');
    const stepId = step.id;
    try {
      setVisibleStepEdit(false);
      stepId &&
        (await setStepEditStatus({
          stepId: stepId,
          isEditing: false,
        }));
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error updating step edit status.'),
      });
    }
  };

  const handleActionEditCancel = async () => {
    const stepId = step.id || step._id;
    console.log('stepId:', stepId);
    try {
      setVisibleActionEdit(false);
      stepId && (await setStepEditStatus({ stepId, isEditing: false }));
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error updating step edit status.'),
      });
    }
  };
  const { data: groups } = useGetGroupsUserQuery({});
  const { data: skills } = useGetSkillsQuery({});

  const handleActionAddCancel = async () => {
    console.log('Action edit cancelled');
    const stepId = step.id;
    try {
      setVisibleActionAdd(false);
      // setVisibleActionChange(false);
      stepId && (await setStepEditStatus({ stepId, isEditing: false }));
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error updating step edit status.'),
      });
    }
  };
  const handleActionAddCancelChange = async () => {
    console.log('Action edit cancelled');
    const stepId = step.id;
    try {
      // setVisibleActionAdd(false);
      setVisibleActionChange(false);
      stepId && (await setStepEditStatus({ stepId, isEditing: false }));
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error updating step edit status.'),
      });
    }
  };

  const handleActionAddCancelChangeEdit = async () => {
    console.log('Action edit cancelled');
    const stepId = step.id;
    try {
      // setVisibleActionAdd(false);
      setVisibleActionEditChange(false);
      stepId && (await setStepEditStatus({ stepId, isEditing: false }));
    } catch (error) {
      notification.error({
        message: t('ERROR'),
        description: t('Error updating step edit status.'),
      });
    }
  };

  const { data: templates, isLoading: isTemplatesLoading } =
    useGetActionsTemplatesQuery({});

  const isSelected = step.id && selectedStepItems.includes(step.id);
  const { t } = useTranslation();
  // useEffect(() => {
  //   if (visibleStepEdit) {
  //     refetchEditStatus();
  //     // <div>
  //     //   <button onClick={openNewWindow}>Open New Window</button>
  //     // </div>;
  //   }
  // }, [visibleStepEdit]);

  // const openNewWindow = () => {
  //   ipcRenderer.send('open-new-window', {
  //     htmlPath: 'path_to_your_html_file',
  //     data: { message: 'Hello from the main window!' },
  //   });
  // };

  return (
    <div className="my-2">
      {/* <Button onClick={openNewWindow}>Open New Window</Button> */}
      <Card
        key={step.id}
        bodyStyle={{ padding: '5px 10px' }}
        bordered
        className={`${isSelected ? 'bg-blue-100' : ''}`}
        style={{ width: '100%', padding: '0 10px', marginTop: '5px' }}
        title={
          <div
            className={`cursor-pointer gap-2 flex justify-between items-center px-2 rounded-md ${
              isSelected ? 'bg-blue-100' : 'bg-slate-200'
            }`}
            style={{ padding: '5px', borderRadius: '4px' }}
          >
            <Checkbox
              checked={isSelected || false}
              onChange={(e: { target: { checked: boolean } }) =>
                handleStepSelect(step.id || '', e.target.checked)
              }
            />
            <Space
              className="cursor-pointer"
              onClick={handleStepEditClick}
              style={{ width: '100%' }}
            >
              <div className="font-bold" style={{ fontSize: '14px' }}>
                {`${t('STEP')} ${step.stepNumber}`}
              </div>
              <Space className="ml-auto font-bold" style={{ fontSize: '12px' }}>
                <div>{t('added by')}</div>
                <Tag color="#778D45">
                  {step.createUserID?.organizationAuthorization ||
                    step.createUserID?.singNumber}
                </Tag>
                <Tag color="#778D45">
                  {step.createUserID?.firstNameEnglish?.toUpperCase()}{' '}
                  {step.createUserID?.lastNameEnglish?.toUpperCase()}
                </Tag>
              </Space>
              <Space className="font-bold" style={{ fontSize: '12px' }}>
                {moment(step.createDate).format('YYYY-MM-DD HH:mm')}
              </Space>
            </Space>

            <>
              {/* <div className="font-bold" style={{ fontSize: '14px' }}>
                {`${t('STEP ID')} ${step.stepIdentificator}`}
              </div> */}
              <Popover content={t('COMPONENT CHANGE')}>
                <Button
                  size="small"
                  danger
                  // type=""
                  // shape=""
                  icon={<SwapOutlined />}
                  onClick={handleComponentChangeAddClick}
                />
              </Popover>
              <Popover content={t('ADD ACTION STEP')}>
                <Button
                  size="small"
                  type="primary"
                  shape="circle"
                  icon={<PlusOutlined />}
                  onClick={handleActionAddClick}
                />
              </Popover>
            </>
          </div>
        }
      >
        <div
          onDoubleClick={handleStepEditClick}
          className={`cursor-pointer flex justify-between items-center px-2 rounded-md ${
            isSelected ? 'bg-blue-100' : ''
          }`}
          onClick={handleStepEditClick}
          style={{ padding: '5px', borderRadius: '4px' }}
        >
          <div
            className="flex flex-col"
            style={{
              maxWidth: '90%',
              fontSize: '14px',
              whiteSpace: 'pre-wrap',
            }}
          >
            <span
              className="font-semibold my-0 py-0"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {step.stepHeadLine}
            </span>
            <span style={{ whiteSpace: 'pre-wrap' }}>
              {step.stepDescription}
            </span>
          </div>
        </div>

        {step?.actions?.length > 0 && (
          <div>
            <ActionList
              task={task}
              step={step}
              actions={
                step.actions.filter(
                  (action) => !action.isComponentChangeAction
                ) || []
              }
              selectedItems={selectedStepItems}
              handleItemClick={handleActionClick}
              setVisibleEdit={setVisibleActionEdit}
              setCurrentAction={setCurrentAction}
            />
          </div>
        )}

        {step?.actions?.length > 0 &&
          step.actions.some((action) => action.isComponentChangeAction) && (
            <div>
              <ComponentChangeActionList
                task={task}
                step={step}
                actions={
                  step.actions.filter(
                    (action) => action.isComponentChangeAction
                  ) || []
                }
                selectedItems={selectedStepItems}
                handleItemClick={handleActionClick}
                setVisibleEdit={setVisibleActionEditChange}
                setCurrentAction={(data) => {
                  console.log(data);
                  setCurrentAction(data);
                }}
              />
            </div>
          )}
      </Card>

      {currentAction && currentAction.type == 'pfmd' && (
        <>
          <ActionForm
            task={task}
            step={step}
            key={currentAction._id}
            visible={visibleActionEdit}
            onCancel={handleActionEditCancel}
            onSave={handleActionEditSave}
            currentAction={currentAction}
            onDelete={handleActionDelete}
            templates={templates || []}
            users={users || []}
          />
        </>
      )}
      {currentAction && currentAction.type == 'inspect' && (
        <>
          <ActionInspection
            task={task}
            step={step}
            key={currentAction._id}
            visible={visibleActionEdit}
            onCancel={handleActionEditCancel}
            onSave={handleActionEditInspectionSave}
            currentAction={currentAction}
            onDelete={handleActionDelete}
            templates={templates || []}
            users={users || []}
          />
        </>
      )}

      {currentAction && currentAction.type == 'closed' && (
        <>
          <>{console.log(currentAction)}</>
          <ActionClosed
            task={task}
            step={step}
            key={currentAction._id}
            visible={visibleActionEdit}
            onCancel={handleActionEditCancel}
            onSave={handleActionEditClosedSave}
            currentAction={currentAction}
            onDelete={handleActionDelete}
            templates={templates || []}
            users={users || []}
          />
        </>
      )}

      {visibleActionAdd && (
        <ActionForm
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

      {visibleActionChange && (
        <ActionChangeForm
          task={task}
          step={step}
          key="newChange"
          visible={visibleActionChange}
          onCancel={handleActionAddCancelChange}
          onSave={handleNewActionSaveChange}
          templates={templates || []}
          users={users || []}
        />
      )}
      {visibleActionEditChange && currentAction && (
        <EditForm
          currentAction={currentAction}
          task={task}
          step={step}
          key={currentAction._id}
          visible={visibleActionEditChange}
          onCancel={handleActionAddCancelChangeEdit}
          onSave={handleActionEditChangeSave}
          templates={templates || []}
          users={users || []}
          onDelete={handleActionDelete}
        />
      )}

      {visibleStepEdit && (
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div>
            <StepEditModal
              task={task}
              visible={visibleStepEdit}
              onCancel={handleStepEditCancel}
              step={step}
              onSave={handleStepSave}
              templates={templates || []}
              groups={groups || []}
              skills={skills || []}
            />
          </div>
          <div>{/* Ваш функционал для поиска шаблонов */}</div>
        </Split>
      )}
    </div>
  );
};

export default StepCard;
