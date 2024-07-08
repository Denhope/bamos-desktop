import React, { useState } from 'react';
import {
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Input,
  Button,
  Select,
  Space,
} from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Action } from '@/models/IStep';
import { USER_ID } from '@/utils/api/http';
import TemplateSelector from './TemplateSelector';
import UserDurationList from './UserDurationList';
import { Split } from '@geoffcox/react-splitter';
import { User } from '@/models/IUser';

const { Option } = Select;

interface ActionFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (action: Action) => void;
  onDelete?: (actionId: string) => void;
  currentAction?: Action;
  templates: {
    id: string;
    name: string;
    content: string;
    type: string;
    planeType: string;
  }[];
  users: User[];
}

const ActionForm: React.FC<ActionFormProps> = ({
  visible,
  onCancel,
  onSave,
  onDelete,
  currentAction,
  templates,
  users,
}) => {
  interface UserDuration {
    id: string;
    userID: string;
    duration: number;
  }
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [userDurations, setUserDurations] = useState<UserDuration[]>(
    currentAction?.userDurations || []
  );

  const handleFinish = (values: any) => {
    const newAction: Action = {
      id: currentAction ? currentAction._id : null,
      headline: values?.headline,
      description: values.description,
      createDate: moment(
        `${values.date.format('YYYY-MM-DD')} ${values.time.format('HH:mm')}`
      ).toISOString(),
      createUserID: USER_ID,
      type: values.type,
      userDurations,
    };

    onSave(newAction);
  };

  const showDeleteConfirm = () => {
    Modal.confirm({
      title: 'Подтвердите удаление',
      content: 'Вы уверены, что хотите удалить это действие?',
      okText: 'Да',
      okType: 'danger',
      cancelText: 'Нет',
      onOk() {
        if (currentAction && onDelete) {
          currentAction._id && onDelete(currentAction._id);
        }
      },
    });
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    form.setFieldsValue({
      description: templates.find((template) => template.id === templateId)
        ?.content,
    });
  };

  return (
    <Modal
      width={'90%'}
      visible={visible}
      title={
        currentAction ? 'Редактирование действия' : 'Добавление нового действия'
      }
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t('CANCEL')}
        </Button>,
        currentAction && (
          <Button key="delete" danger onClick={showDeleteConfirm}>
            {t('DELETE')}
          </Button>
        ),
        <Button key="save" type="primary" onClick={() => form.submit()}>
          {t('SAVE')}
        </Button>,
      ]}
    >
      <Split initialPrimarySize="50%" splitterSize="10px">
        <div>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              headline: currentAction?.headline || '',
              description: currentAction?.description || '',
              date: currentAction ? moment(currentAction.createDate) : null,
              time: currentAction ? moment(currentAction.createDate) : null,
              type: currentAction?.type || 'done',
              userDurations: currentAction?.userDurations.map(
                (userDuration: any) => ({
                  ...userDuration,
                })
              ),
            }}
            onFinish={handleFinish}
          >
            <Form.Item
              name="type"
              label={t('TYPE')}
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="pfmd">{t('PERFOM')}</Option>
                <Option value="inspect">{t('INSPECT')}</Option>
                <Option value="doubleInspect">{t('DINSPECT')}</Option>
                <Option value="closed">{t('CLOSE')}</Option>
              </Select>
            </Form.Item>
            {/* <Form.Item
              name="headline"
              label="Заголовок"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item> */}
            <Form.Item
              name="description"
              label={t('DESCRIPTION')}
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Split initialPrimarySize="25%" splitterSize="10px">
              <div>
                <Form.Item
                  name="date"
                  label={t('DATE')}
                  rules={[{ required: true }]}
                >
                  <DatePicker />
                </Form.Item>
                <Form.Item
                  name="time"
                  label={t('TIME')}
                  rules={[{ required: true }]}
                >
                  <TimePicker format="HH:mm" />
                </Form.Item>
              </div>
              <div>
                <UserDurationList
                  users={users}
                  initialUserDurations={userDurations}
                  onUserDurationsChange={setUserDurations}
                />
              </div>
            </Split>
          </Form>
        </div>
        <div>
          <TemplateSelector
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
          />
        </div>
      </Split>
    </Modal>
  );
};

export default ActionForm;
