import React, { useState } from 'react';
import StepCard from './StepCard';
import { IStep } from '@/models/IStep';
import { Button, Modal, Form, Input, Empty, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { ProFormSelect } from '@ant-design/pro-components';
import { ISkill, UserGroup } from '@/models/IUser';
import { Split } from '@geoffcox/react-splitter';
import TemplateSelector from './TemplateSelector';

interface Props {
  steps: IStep[];
  onAddStep: (newStep: IStep) => void;
  onDeleteStep: (stepIds: string[]) => void;
  groups: UserGroup[];
  skills: ISkill[];
  templates?: any;
}

const StepContainer: React.FC<Props> = ({
  steps,
  onAddStep,
  onDeleteStep,
  groups,
  templates,

  skills,
}) => {
  const [selectedStepItems, setSelectedStepItems] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { Option } = Select;
  const handleStepClick = (
    event: React.MouseEvent<HTMLDivElement>,
    step: IStep
  ) => {
    console.log('Step clicked:', step);
  };

  const handleAddStep = () => {
    form.resetFields();
    setIsModalVisible(true);
  };
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const newStep: IStep = {
        stepNumber: steps.length + 1,
        stepHeadLine: values.stepHeadLine,
        stepDescription: values.stepDescription,
        skillID: values.skillID,
        userGroupID: values.userGroupID,
        stepType: values.stepType,
      };
      onAddStep(newStep);
      setIsModalVisible(false);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const selected = templates.find((t: any) => t.id === templateId);
    if (selected) {
      form.setFieldsValue({
        stepDescription: selected.description,
      });
    }
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
  const { t } = useTranslation();
  const hasSteps = steps.length > 0;

  const groupOptions = groups.map((group) => ({
    label: group.title,
    value: group.id, // Use the _id as the value
  }));

  const skillOptions = skills.map((skill) => ({
    label: skill.code,
    value: skill.id, // Use the _id as the value
  }));
  return (
    <div>
      {steps.length > 0 ? (
        <div>
          {/* Добавляем компонент SkillTimeAggregate */}
          {steps.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              selectedStepItems={selectedStepItems}
              handleStepClick={handleStepClick}
              handleStepSelect={handleStepSelect}
            />
          ))}
          {/* <SkillTimeAggregate steps={steps} />{' '} */}
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
          <Form form={form} layout="vertical">
            {/* <Form.Item
            name="stepType"
            label={`${t('STEP_TYPE')}`}
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="incomingInspection">
                {t('INCOMING_INSPECTION')}
              </Option>
              <Option value="mechanicsProcess">{t('MECHANIC_PROCESS')}</Option>

              <Option value="inspection">{t('INSPECTION')}</Option>
              <Option value="diInspection">{t('DI_INSPECTION')}</Option>

              <Option value="technicalControl">{t('TECHNICAL_CONTROL')}</Option>
              <Option value="coating">{t('COATING')}</Option>
              <Option value="marking">{t('MARKERING')}</Option>
              <Option value="package">{t('PACKAGE')}</Option>
              <Option value="additionalWorks">{t('ADD_WORKS')}</Option>
              <Option value="store">{t('STORE')}</Option>
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

            {/* <Form.Item
            name="stepHeadLine"
            label="Step Headline"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item> */}
            <Form.Item
              name="stepDescription"
              label={t('STEP DESCRITION')}
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
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
