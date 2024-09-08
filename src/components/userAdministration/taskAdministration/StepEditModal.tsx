//@ts-nocheck

import React, { useState } from 'react';
import { Modal, Form, Input, Button, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import TemplateSelector from './TemplateSelector';
import { Split } from '@geoffcox/react-splitter';
import { IStep } from '@/models/IStep';
import { ISkill, UserGroup } from '@/models/IUser';
import { ProFormSelect } from '@ant-design/pro-components';

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
  onSave: (updatedStep: IStep) => void;
  templates: Template[]; // Update the type of templates to Template[]
}> = ({ visible, onCancel, step, onSave, templates, groups, skills }) => {
  const [form] = Form.useForm();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const selected = templates.find((t) => t.id === templateId);
    if (selected) {
      form.setFieldsValue({
        stepDescription: selected.description,
      });
    }
  };

  const handleFinish = (values: any) => {
    const updatedStep: IStep = {
      ...step,
      stepHeadLine: values.stepHeadLine,
      stepDescription: values.stepDescription,
      skillID: values.skillID,
      userGroupID: values.userGroupID,
      stepType: values.stepType,
    };
    onSave(updatedStep);
    onCancel();
  };
  const groupOptions = groups.map((group) => ({
    label: group.title,
    value: group.id, // Use the _id as the value
  }));

  const skillOptions = skills.map((skill: { code: any; id: any }) => ({
    label: skill.code,
    value: skill.id, // Use the _id as the value
  }));
  const { t } = useTranslation();
  const { Option } = Select;
  return (
    <Modal
      width={'70%'}
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
      <Split initialPrimarySize="70%" splitterSize="10px">
        <div>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              stepHeadLine: step.stepHeadLine || 'mainWork',
              stepDescription: step.stepDescription,
              skillID: step.skillID,
              userGroupID: step.userGroupID,
              stepType: step.stepType,
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
            <ProFormSelect
              mode="multiple"
              name="skillID"
              label={t('SKILL')}
              options={skillOptions}
              // rules={[{ required: true, message: t('PLEASE SELECT A SKILL') }]}
            />
            <Form.Item
              name="stepDescription"
              label={t('DESCRIPTION')}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.TextArea rows={14} />
            </Form.Item>
          </Form>
        </div>
        <TemplateSelector
          templates={templates}
          onSelectTemplate={handleSelectTemplate}
        />
      </Split>
    </Modal>
  );
};

export default StepEditModal;
