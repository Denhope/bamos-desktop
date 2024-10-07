// @ts-nocheck

import React, { useState } from 'react';
import StepCard from './StepCard';
import { IStep } from '@/models/IStep';
import { Button, Modal, Form, Input, Empty, Select, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import SkillTimeAggregate from './SkillTimeAggregate';
import {
  ProFormSelect,
  ProFormGroup,
  ProFormText,
  ProFormTextArea,
  ProForm,
  ProFormDateTimePicker,
} from '@ant-design/pro-components';
import { useGetGroupsUserQuery } from '@/features/userAdministration/userGroupApi';
import { useGetSkillsQuery } from '@/features/userAdministration/skillApi';
import { useGlobalState } from './GlobalStateContext';
import { Split } from '@geoffcox/react-splitter';
import TemplateSelector from './TemplateSelector';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { getDefectTypes, getAtaChapters } from '@/services/utilites';
import { useGetFilteredZonesQuery } from '@/features/zoneAdministration/zonesApi';
import UserTaskAllocation from './UserTaskAllocation';
import { useGetUsersQuery } from '@/features/userAdministration/userApi';
dayjs.extend(utc);
interface Props {
  steps: IStep[];
  onAddStep: (newStep: IStep) => void;
  onDeleteStep: (stepIds: string[]) => void;
  templates: Template[]; // Update the type of templates to Template[]
}
interface Template {
  description: any;
  id: string;
  name: string;
  content: string;
  type: string; // Add the missing properties type and planeType
  planeType: string;
  task?: any;
}
const StepContainer: React.FC<Props> = ({
  steps,
  onAddStep,
  onDeleteStep,
  templates,
  task,
}) => {
  const [selectedStepItems, setSelectedStepItems] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleStepClick = (
    event: React.MouseEvent<HTMLDivElement>,
    step: IStep
  ) => {
    console.log('Step clicked:', step);
  };

  const { data: users } = useGetUsersQuery({});
  const { setCurrentTime } = useGlobalState();
  const handleAddStep = () => {
    form.resetFields();
    setIsModalVisible(true);
    // setCurrentTime(Date.now());
  };
  const { data: groups } = useGetGroupsUserQuery({});
  const { data: skills } = useGetSkillsQuery({});
  const [userDurations, setUserDurations] = useState<any[]>([]);
  const handleModalOk = () => {
    const performedDate = dayjs(form.getFieldValue('performedDate'))
      .utc()
      .startOf('minute');

    form.validateFields().then((values) => {
      // if (
      //   userDurations.length === 0 ||
      //   userDurations.some((duration) => !duration.userID || !duration.duration)
      // ) {
      //   notification.error({
      //     message: 'Error',
      //     description: 'Please fill in all user durations fields.',
      //   });
      //   return;
      // }

      const newStep: IStep = {
        stepNumber: steps.length + 1,
        stepHeadLine: values.stepHeadLine,
        stepDescription: values.stepDescription,
        stepType: values.stepType,
        skillID: values.skillID,
        userGroupID: values.userGroupID,
        userDurations: userDurations,
        createDate: performedDate,
      };
      onAddStep(newStep);

      setIsModalVisible(false);
    });
  };
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);

    const selected = templates.find((t) => t.id === templateId);
    if (selected) {
      console.log(selected.description);
      form.setFieldsValue({
        stepDescription: selected.description,
      });
    }
  };
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleDeleteStep = () => {
    onDeleteStep(selectedStepItems);
    setSelectedStepItems([]); // Очищаем выбранные элементы после удаления
  };

  const handleStepSelect = (stepId: string, isSelected: boolean) => {
    setSelectedStepItems((prevSelected) =>
      isSelected
        ? [...prevSelected, stepId]
        : prevSelected.filter((id) => id !== stepId)
    );
  };
  const groupOptions =
    groups &&
    groups.map((group) => ({
      label: group.title,
      value: group.id, // Use the _id as the value
    }));

  const skillOptions =
    skills &&
    skills.map((skill) => ({
      label: skill.code,
      value: skill.id, // Use the _id as the value
    }));
  const { t } = useTranslation();
  const hasSteps = steps.length > 0;

  const optionsT = getAtaChapters(t);

  const disabledDate = (current: dayjs.Dayjs) => {
    // Запрещаем выбор будущих дат
    return current && current > dayjs().endOf('day');
  };
  const { data: zones, isLoading: loading } = useGetFilteredZonesQuery({});
  const zonesValueEnum: Record<string, string> =
    zones?.reduce((acc: any, zone: any) => {
      acc[zone?._id] = zone?.areaNbr || zone?.subZoneNbr || zone?.majoreZoneNbr;
      return acc;
    }, {} as Record<string, string>) || {};

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
  const options = getDefectTypes(t);
  return (
    <div className="py-3">
      {steps.length > 0 ? (
        <div>
          {/* Добавляем компонент SkillTimeAggregate */}
          {steps.map((step) => (
            <StepCard
              task={task}
              key={step.id}
              step={step}
              selectedStepItems={selectedStepItems}
              handleStepClick={handleStepClick}
              handleStepSelect={handleStepSelect}
            />
          ))}
          <SkillTimeAggregate steps={steps} />{' '}
        </div>
      ) : (
        <Empty />
      )}

      <div className="flex justify-end mt-4">
        <Button type="primary" onClick={handleAddStep}>
          {t('ADD NEW STEP')}
        </Button>
        <Button
          danger
          onClick={handleDeleteStep}
          disabled={selectedStepItems.length === 0}
          className="ml-2"
        >
          {t('DELETE STEP')}
        </Button>
      </div>
      <Modal
        width={'80%'}
        title={`${t('ADD STEP')}`}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Split initialPrimarySize="70%" splitterSize="10px">
          <div>
            <ProForm
              submitter={false}
              form={form}
              layout="horizontal"
              initialValues={{
                stepHeadLine: 'mainWork',
                projectItemType: task?.projectItemType,
                taskNumber: task?.taskNumber,
                amtoss: task?.amtoss,
                status: task?.status,
                zonesID: task.zonesID,
                ata: task.ata,
                externalNumber: task.externalNumber,
                defectCodeID: task.defectCodeID,
                // performedDate: step.createDate,
              }}
            >
              {/* <Form.Item
                name="stepType"
                label={`${t('STEP_TYPE')}`}
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="incomingInspection">
                    {t('INCOMING_INSPECTION')}
                  </Option>
                  <Option value="mechanicsProcess">
                    {t('MECHANIC_PROCESS')}
                  </Option>

                  <Option value="inspection">{t('INSPECTION')}</Option>
                  <Option value="diInspection">{t('DI_INSPECTION')}</Option>

                  <Option value="technicalControl">
                    {t('TECHNICAL_CONTROL')}
                  </Option>
                  <Option value="coating">{t('COATING')}</Option>
                  <Option value="marking">{t('MARKERING')}</Option>
                  <Option value="package">{t('PACKAGE')}</Option>
                  <Option value="additionalWorks">{t('ADD_WORKS')}</Option>
                  <Option value="store">{t('STORE')}</Option>
                  <Option value="mainWork">{t('MAIN WORK')}</Option>
                </Select>
              </Form.Item> */}

              {/* <ProFormSelect
                name="userGroupID"
                mode="multiple"
                label={t('GROUP')}
                options={groupOptions}
                // rules={[{ required: true, message: t('PLEASE SELECT A GROUP') }]}
              /> */}

              <ProFormGroup>
                <ProFormText
                  disabled
                  // disabled={!order?.projectTaskReferenceID}
                  width={'md'}
                  name="taskNumber"
                  label={t('NUMBER')}
                />
                <ProFormSelect
                  disabled
                  showSearch
                  name="projectItemType"
                  label={t('TYPE')}
                  width={'md'}
                  valueEnum={{
                    RC: {
                      text: t(
                        'TC (MPD, Customer MP, Access, CDCCL, ALI, STR inspection)'
                      ),
                    },
                    CR_TASK: {
                      text: t('CR TASK (CRITICAL TASK/DI)'),
                    },

                    NRC: { text: t('NRC (Defect)') },
                    NRC_ADD: { text: t('ADHOC(Adhoc Task)') },
                    MJC: { text: t('MJC (Extended MPD)') },

                    CMJC: { text: t('CMJC (Component maintenance) ') },
                    FC: { text: t('FC (Fabrication card)') },
                  }}
                />
              </ProFormGroup>

              <ProFormGroup>
                <ProFormTextArea
                  disabled
                  // disabled={!order?.projectTaskReferenceID}
                  width={'md'}
                  fieldProps={{
                    rows: 1, // Устанавливаем количество строк равным 2
                    // Пример дополнительного стиля
                  }}
                  name="amtoss"
                  label={t('REFERENCE')}
                />
                <ProFormSelect
                  // disabled
                  name="status"
                  label={t('STATUS')}
                  width="sm"
                  rules={[{ required: true }]}
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
              </ProFormGroup>
              <ProFormGroup>
                <ProFormText
                  disabled
                  // disabled={!order?.projectTaskReferenceID}
                  width={'md'}
                  name="externalNumber"
                  label={t('EXTERNAL NUMBER')}
                />
              </ProFormGroup>
              <ProFormGroup>
                {task.projectItemType == 'NRC' && (
                  <ProFormSelect
                    disabled
                    showSearch
                    rules={[{ required: true }]}
                    name="ata"
                    label={t('ATA CHAPTER')}
                    width="lg"
                    // initialValue={'draft'}
                    options={optionsT}
                  />
                )}
                {task.projectItemType == 'NRC' && (
                  <ProFormSelect
                    disabled
                    rules={[{ required: true }]}
                    showSearch
                    name="zonesID"
                    // mode={'multiple'}
                    label={t('ZONE')}
                    width="sm"
                    valueEnum={zonesValueEnum}
                    // disabled={!acTypeID}
                  />
                )}
                {task.projectItemType !== 'NRC' && (
                  <ProFormSelect
                    disabled
                    rules={[{ required: true }]}
                    showSearch
                    name="zonesID"
                    mode={'multiple'}
                    label={t('ZONES')}
                    width="sm"
                    valueEnum={zonesValueEnum}
                    // disabled={!acTypeID}
                  />
                )}
              </ProFormGroup>

              <ProFormGroup>
                <ProFormSelect
                  rules={[{ required: true }]}
                  mode="multiple"
                  width={'md'}
                  name="skillID"
                  label={t('RESPONSIABLE')}
                  options={skillOptions}
                  // rules={[{ required: true, message: t('PLEASE SELECT A SKILL') }]}
                />
                {task.projectItemType == 'NRC' && (
                  <ProFormSelect
                    showSearch
                    width={'md'}
                    // mode="multiple"
                    name="defectCodeID"
                    label={t('DEFECT TYPE')}
                    options={options}
                    rules={[{ required: true }]}
                  />
                )}
              </ProFormGroup>

              {/* <Form.Item
                name="stepHeadLine"
                label="Step Headline"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item> */}
              <Form.Item
                name="stepDescription"
                label={t('WORK STEP')}
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={14} />
              </Form.Item>
              <ProFormGroup title="PERFORMED">
                <ProFormGroup>
                  <ProFormDateTimePicker
                    // disabled
                    width={'sm'}
                    name="performedDate"
                    label={`${t('DATE & TIME')}`}
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: t('Please select date and time'),
                    //   },
                    // ]}
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
                </ProFormGroup>
                <div className="disabled">
                  <UserTaskAllocation
                    isTime
                    isSingle={true}
                    users={users}
                    initialTaskAllocations={[]}
                    onTaskAllocationsChange={setUserDurations}
                  />
                </div>
              </ProFormGroup>
            </ProForm>
          </div>
          <TemplateSelector
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
          />
        </Split>
      </Modal>
    </div>
  );
};

export default StepContainer;
