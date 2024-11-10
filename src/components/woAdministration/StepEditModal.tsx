// @ts-nocheck

import React, { useState } from 'react';
import { Modal, Form, Input, Button, Select, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import TemplateSelector from './TemplateSelector';
import { Split } from '@geoffcox/react-splitter';
import { IStep } from '@/models/IStep';
import { ISkill, UserGroup } from '@/models/IUser';
import {
  ProFormSelect,
  ProFormText,
  ProFormGroup,
  ProFormTextArea,
  ProForm,
  ProFormDateTimePicker,
} from '@ant-design/pro-components';
import { getDefectTypes, getAtaChapters } from '@/services/utilites';
import { useGetFilteredZonesQuery } from '@/features/zoneAdministration/zonesApi';
import UserTaskAllocation from './UserTaskAllocation';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useGetUsersQuery } from '@/features/userAdministration/userApi';
dayjs.extend(utc);
interface Template {
  description: any;
  id: string;
  name: string;
  content: string;
  type: string; // Add the missing properties type and planeType
  planeType: string;
}

const StepEditModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  step: IStep;
  groups: UserGroup[];
  skills: ISkill[];
  task?: any;
  onSave: (updatedStep: IStep) => void;
  templates: Template[]; // Update the type of templates to Template[]
}> = ({ visible, onCancel, step, onSave, templates, groups, skills, task }) => {
  const [form] = Form.useForm();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  const { data: users } = useGetUsersQuery({});
  const [activeTabKey, setActiveTabKey] = useState('1');
  console.log(task);
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const selected = templates.find((t) => t.id === templateId);
    if (selected) {
      form.setFieldsValue({
        stepDescription: selected.description,
      });
    }
  };
  const [userDurations, setUserDurations] = useState<any[]>(step.userDurations);
  const handleFinish = (values: any) => {
    const performedDate = dayjs(values.performedDate).utc().startOf('minute');
    const updatedStep: IStep = {
      ...step,
      stepHeadLine: values.stepHeadLine,
      stepDescription: values.stepDescription,
      skillID: values.skillID,
      userGroupID: values.userGroupID,
      stepType: values.stepType,
      userDurations: userDurations,
      createDate: performedDate,
      defectCodeID: values.defectCodeID,
      taskStatus: values.status,
    };
    onSave(updatedStep);
    onCancel();
  };

  const groupOptions = groups.map((group) => ({
    label: group.title,
    value: group.id, // Use the _id as the value
  }));
  const { data: zones, isLoading: loading } = useGetFilteredZonesQuery({});
  const zonesValueEnum: Record<string, string> =
    zones?.reduce((acc: any, zone: any) => {
      acc[zone?._id] = zone?.areaNbr || zone?.subZoneNbr || zone?.majoreZoneNbr;
      return acc;
    }, {} as Record<string, string>) || {};
  const skillOptions = skills.map((skill: { code: any; id: any }) => ({
    label: skill.code,
    value: skill.id, // Use the _id as the value
  }));
  const { t } = useTranslation();
  const { Option } = Select;

  const [tabTitles, setTabTitles] = useState({
    '1': `${t('TEMPLATES')}`,
    '2': `${t('COMPONENT CHANGE')}`,
  });
  const optionsT = getAtaChapters(t);

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
  const options = getDefectTypes(t);
  return (
    <Modal
      width={'80%'}
      visible={visible}
      title={t('EDIT STEP')}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t('CANCEL')}
        </Button>,
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
              stepHeadLine: step.stepHeadLine || 'mainWork',
              stepDescription: step.stepDescription,
              skillID: step.skillID,
              userGroupID: step.userGroupID,
              stepType: step.stepType,
              projectItemType: task?.projectItemType,
              taskNumber: task?.taskNumber,
              amtoss: task.refTask || task?.amtoss,
              status: task?.status,
              ata: task.ata,
              zonesID: task.zonesID,
              externalNumber: task.externalNumber,
              performedDate: step.createDate,
              defectCodeID: task.defectCodeID,
            }}
            onFinish={handleFinish}
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
                label={
                  task.projectItemType == 'NRC'
                    ? t('NRC NUMBER')
                    : t('TASK NUMBER')
                }
              />

              <ProFormSelect
                disabled
                showSearch
                name="projectItemType"
                label={t('TYPE')}
                width={'sm'}
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
                // fieldProps={{ style: { resize: 'none' } }}
                name="amtoss"
                fieldProps={{
                  rows: 1, // Устанавливаем количество строк равным 2
                }}
                label={
                  task.projectItemType == 'NRC'
                    ? t('NRC REFERENCE')
                    : t('TASK REFERENCE')
                }
              />
              {task.projectItemType == 'NRC' && (
                <ProFormSelect
                  disabled
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
                  // rules={[{ required: true }]}
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
                mode="multiple"
                name="skillID"
                width={'md'}
                label={t('RESPONSIABLE')}
                options={skillOptions}
                rules={[{ required: true }]}
              />

              {/* {task.projectItemType == 'NRC' && (
                <ProFormSelect
                  showSearch
                  width={'md'}
                  // mode="multiple"
                  name="defectCodeID"
                  label={t('DEFECT TYPE')}
                  options={options}
                  rules={[{ required: true }]}
                />
              )} */}
              <ProFormSelect
                // disabled
                name="status"
                label={
                  task.projectItemType == 'NRC'
                    ? t('NRC STATUS')
                    : t('TASK STATUS')
                }
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
            </ProFormGroup>

            <Form.Item
              name="stepDescription"
              label={t('WORK STEP')}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.TextArea rows={10} />
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
                      // disabledHours: disabledDateTime().disabledHours,
                      // disabledMinutes: disabledDateTime().disabledMinutes,
                    },
                    defaultValue: dayjs().utc().startOf('minute'), // Текущее время UTC без секунд
                    disabledDate,
                  }}
                />
              </ProFormGroup>
              <div className="disabled">
                <UserTaskAllocation
                  isTime={true}
                  isSingle={true}
                  users={users}
                  initialTaskAllocations={step.userDurations || []}
                  onTaskAllocationsChange={setUserDurations}
                  onlyWithOrganizationAuthorization={true}
                />
              </div>
            </ProFormGroup>
          </ProForm>
        </div>

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
        </Tabs>
      </Split>
    </Modal>
  );
};

export default StepEditModal;
