//@ts-nocheck
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

import { Action, IStep } from '@/models/IStep';

import { USER_ID } from '@/utils/api/http';
import { Split } from '@geoffcox/react-splitter';
import { useGetGroupsUserQuery } from '@/features/userAdministration/userGroupApi';
import { useGetSkillsQuery } from '@/features/userAdministration/skillApi';
import { useAddBookingMutation } from '@/features/bookings/bookingApi';
import {
  useAddActionMutation,
  useUpdateActionMutation,
  useDeleteActionMutation,
} from '@/features/projectItemWO/actionsApi';
import {
  useCheckStepEditStatusQuery,
  useSetStepEditStatusMutation,
} from '@/features/projectItemWO/stepApi';
import { useTranslation } from 'react-i18next';
import { useGetUsersQuery } from '@/features/userAdministration/userApi';
import StepEditModal from './StepEditModal';
import {
  useGetFilteredStepsQuery,
  useUpdateStepMutation,
} from '@/features/tasksAdministration/stepApi';
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
  const { data: templates, isLoading: isTemplatesLoading } =
    useGetActionsTemplatesQuery({});
  const { data: groups } = useGetGroupsUserQuery({});
  const { data: skills } = useGetSkillsQuery({});

  const [updateStep] = useUpdateStepMutation({});

  const { refetch } = useGetFilteredStepsQuery(
    { taskId: step.taskId },
    {
      skip: !step.taskId,
    }
  );

  const [addBooking] = useAddBookingMutation({});

  const handleStepSave = async (updatedStep: IStep) => {
    try {
      setVisibleStepEdit(false);
      await updateStep({
        step: {
          id: updatedStep.id,
          stepNumber: updatedStep.stepNumber,
          skillID: updatedStep.skillID,
          userGroupID: updatedStep.userGroupID,
          stepType: updatedStep.stepType,
          stepHeadLine: updatedStep.stepHeadLine,
          stepDescription: updatedStep.stepDescription,
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

  const handleStepEditClick = async () => {
    setVisibleStepEdit(true);
  };

  const handleStepEditCancel = async () => {
    setVisibleStepEdit(false);
    //
  };

  const isSelected = step.id && selectedStepItems.includes(step.id);
  const { t } = useTranslation();
  useEffect(() => {
    if (visibleStepEdit) {
      // refetchEditStatus();
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
                {moment(step.createDate).utc().format('YYYY-MM-DD HH:mm')}
              </Space>
            </Space>
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
      </Card>

      {visibleStepEdit && (
        <Split initialPrimarySize="30%" splitterSize="20px">
          <div>
            <StepEditModal
              visible={visibleStepEdit}
              onCancel={handleStepEditCancel}
              step={step}
              onSave={handleStepSave}
              templates={templates}
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
