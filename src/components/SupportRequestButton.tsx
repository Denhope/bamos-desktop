import React, { useState } from 'react';
import { Button, Dropdown, Menu, Modal, Form, Input, Select, Tooltip, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSubmitSupportRequestMutation } from '@/store/slices/supportRequestApi';
import { SubscriptionType } from '@/services/utilites';

const { Option } = Select;

const SupportRequestButton: React.FC = () => {
  const { t } = useTranslation();
  const [submitSupportRequest, { isLoading }] = useSubmitSupportRequestMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [requestType, setRequestType] = useState<SubscriptionType | null>(null);

  const handleMenuClick = (e: { key: React.Key }) => {
    setRequestType(e.key as SubscriptionType);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setRequestType(null);
  };

  const handleSubmit = async (values: any) => {
    if (requestType) {
      try {
        await submitSupportRequest({
          ...values,
          requestType,
        }).unwrap();
        message.success(t('Support request submitted successfully'));
        setIsModalVisible(false);
        setRequestType(null);
      } catch (error) {
        message.error(t('Failed to submit support request'));
      }
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key={SubscriptionType.NewPartNumber}>{t('NEW PART NUMBER')}</Menu.Item>
      <Menu.Item key={SubscriptionType.AddAlternative}>{t('ADD ALTERNATIVE')}</Menu.Item>
      <Menu.Item key={SubscriptionType.PickslipError}>{t('PICKSLIP ERROR')}</Menu.Item>
      <Menu.Item key={SubscriptionType.TaskError}>{t('TASK ERROR')}</Menu.Item>
      <Menu.Item key={SubscriptionType.BugReport}>{t('BUG REPORT')}</Menu.Item>
    </Menu>
  );

  return (
    <>
      <Tooltip title={t('Support Request')}>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button 
            type="primary" 
            icon={<QuestionCircleOutlined />} 
            size="middle"
            style={{ 
              borderRadius: '50%', 
              width: '22px', 
              height: '22px', 
              padding: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          />
        </Dropdown>
      </Tooltip>
      <Modal
        title={t('Support Request')}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form onFinish={handleSubmit} layout="vertical">
          <Form.Item name="title" label={t('Title')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t('Description')} rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="priority" label={t('Priority')} rules={[{ required: true }]}>
            <Select>
              <Option value="low">{t('Low')}</Option>
              <Option value="medium">{t('Medium')}</Option>
              <Option value="high">{t('High')}</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {t('Submit')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SupportRequestButton;