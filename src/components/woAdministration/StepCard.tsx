// StepCard.tsx
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
import { PlusOutlined } from '@ant-design/icons';
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

interface Props {
  step: IStep;
  selectedStepItems: string[];
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
}) => {
  const [visibleActionEdit, setVisibleActionEdit] = useState(false);
  const [visibleActionAdd, setVisibleActionAdd] = useState(false);
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
  const handleActionSave = async (action: Action) => {
    try {
      if (action) {
        await addAction({
          action,
          stepId: step?.id || '',
          projectItemID: step?.projectItemID,
          projectId: step?.projectId,
          projectTaskID: step?.projectTaskID,
        });

        notification.success({
          message: t('ACTION ADDED'),
          description: t('ACTION SUCCESSFULLY ADDED'),
        });
        setCurrentTime(Date.now());

        await addBooking({
          booking: { voucherModel: 'ADD_ACTION', data: action },
        }).unwrap();
      }
      setVisibleActionEdit(false);
      await setStepEditStatus({
        stepId: step.id || '',
        isEditing: false,
      });
      refetch(); // Оставляем только этот запрос
      // refetchTasks();
      // setCurrentTime(Date.now());
    } catch (error) {
      notification.error({
        message: t('ERROR SAVING'),
        description: t('ERROR SAVING ACTION '),
      });
    }
  };

  const [addBooking] = useAddBookingMutation({});

  const handleActionEditSave = async (updateAction: Action) => {
    try {
      if (updateAction) {
        await editAction({
          action: {
            id: updateAction.id,
            type: updateAction.type,
            headline: updateAction.headline,
            description: updateAction.description,
            createDate: updateAction.createDate,
            userDurations: updateAction.userDurations,
          },
        });

        await addBooking({
          booking: { voucherModel: 'EDIT_ACTION', data: updateAction },
        });
        setCurrentAction(null);
        notification.success({
          message: t('ACTION EDIT'),
          description: t('ACTION SUCCESSFULLY EDIT.'),
        });
      }
      setVisibleActionEdit(false);
      setCurrentAction(null);
      step?.id &&
        (await setStepEditStatus({
          stepId: step?.id,
          isEditing: false,
        }));
      refetch();
      setCurrentTime(Date.now());
    } catch (error) {
      notification.error({
        message: t('ERROR EDIT'),
        description: t('ERROR EDIT ACTION.'),
      });
      await setStepEditStatus({
        stepId: updateAction?.projectStepId,
        isEditing: false,
      }).unwrap();

      refetch();
    }
  };

  const handleNewActionSave = (newAction: Action) => {
    setVisibleActionAdd(false);
    handleActionSave(newAction);
    console.log(newAction);
    setCurrentAction(null);
  };

  const handleStepSave = async (updatedStep: IStep) => {
    try {
      setVisibleStepEdit(false);
      await updateStep({
        step: {
          id: updatedStep.id,
          stepNumber: updatedStep.stepNumber,
          stepHeadLine: updatedStep.stepHeadLine,
          stepDescription: updatedStep.stepDescription,
          stepType: updatedStep.stepType,
          skillID: updatedStep.skillID,
          userGroupID: updatedStep.userGroupID,
        },
      });

      refetch();
      await addBooking({
        booking: { voucherModel: 'EDIT_STEP', data: updatedStep },
      }).unwrap();

      notification.success({
        message: t('STEP SAVED'),
        description: 'The step has been successfully saved.',
      });
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

    refetch();
  };

  const handleStepEditClick = async () => {
    const stepId = step.id;
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
    console.log('Action edit cancelled');
    const stepId = step.id;
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
  useEffect(() => {
    if (visibleStepEdit) {
      refetchEditStatus();
    }
  }, [visibleStepEdit]);

  return (
    <div className="my-2">
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
                <Tag color="#778D45">{step.createUserID?.singNumber}</Tag>
                <Tag color="#778D45">{step.createUserID?.name}</Tag>
              </Space>
              <Space className="font-bold" style={{ fontSize: '12px' }}>
                {moment(step.createDate).format('YYYY-MM-DD HH:mm')}
              </Space>
            </Space>

            <>
              <div className="font-bold" style={{ fontSize: '14px' }}>
                {`${t('STEP ID')} ${step.stepIdentificator}`}
              </div>
              <Popover content={t('ADD NEW ACTION')}>
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

        <div>
          <ActionList
            actions={step.actions || []}
            selectedItems={selectedStepItems}
            handleItemClick={handleActionClick}
            setVisibleEdit={setVisibleActionEdit}
            setCurrentAction={setCurrentAction}
          />
        </div>
      </Card>

      {currentAction && (
        <ActionForm
          key={currentAction._id}
          visible={visibleActionEdit}
          onCancel={handleActionEditCancel}
          onSave={handleActionEditSave}
          currentAction={currentAction}
          onDelete={handleActionDelete}
          templates={templates || []}
          users={users || []}
        />
      )}

      {visibleActionAdd && (
        <ActionForm
          key="newAction"
          visible={visibleActionAdd}
          onCancel={handleActionAddCancel}
          onSave={handleNewActionSave}
          templates={templates || []}
          users={users || []}
        />
      )}

      {visibleStepEdit && (
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div>
            <StepEditModal
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
