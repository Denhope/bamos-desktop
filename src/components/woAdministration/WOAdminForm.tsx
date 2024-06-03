import { ProForm } from '@ant-design/pro-components';
import { Button, Tabs } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
interface UserFormProps {
  order?: any;
  orderItem?: any | {};
  // requirements?:
  onSubmit?: (company: any) => void;
  onDelete?: (orderID: string) => void;
  onOrderItemUpdate?: (orderItem: any) => void;
}
const WOAdminForm: FC<UserFormProps> = ({ order, orderItem }) => {
  const [form] = ProForm.useForm();

  const { t } = useTranslation();

  const [tabTitles, setTabTitles] = useState({
    '1': `${t('WORKORDER INFO')}`,
    '2': `${t('PARTS')}`,
    '3': `${t('STEPS')}`,
  });
  const updateTabTitle = (selectedItem: any | null, order: any) => {
    if (order) {
      setTabTitles({
        ...tabTitles,
        '1': `${t('WORKORDER №:')} ${order?.taskWO}`,
      });
    }
    if (selectedItem) {
      setTabTitles({
        ...tabTitles,
        '3': `${t('WORKORDER №:')} ${order?.orderNumberNew}POS:${
          selectedItem?.index + 1
        } - PART_NUMBER: ${selectedItem?.partID?.PART_NUMBER}`,
      });
    }
    // else {
    //   setTabTitles({
    //     ...tabTitles,
    //     '2': `${t('WORKORDER №:')} ${order?.taskWO || '-'} PARTS`,
    //   });
    // }
  };
  useEffect(() => {
    updateTabTitle(orderItem, order);
  }, [orderItem, order]);
  const SubmitButton = () => (
    <Button type="primary" htmlType="submit">
      {order ? t('UPDATE') : t('CREATE')}
    </Button>
  );
  const [activeTabKey, setActiveTabKey] = useState('1'); // Default to the first tab
  const [showSubmitButton, setShowSubmitButton] = useState(true);

  return (
    <ProForm
      submitter={{
        render: (_, dom) => {
          if (showSubmitButton) {
            return [<SubmitButton key="submit" />, dom.reverse()[1]];
          }
          return null;
        },
      }}
      size="small"
      form={form}
    >
      <Tabs
        activeKey={activeTabKey}
        onChange={(key) => {
          setActiveTabKey(key);
          form.setFieldsValue({ activeTabKey: key });
        }}
        defaultActiveKey="1"
        type="card"
      >
        <Tabs.TabPane tab={tabTitles['1']} key="1"></Tabs.TabPane>
        <Tabs.TabPane tab={tabTitles['2']} key="2"></Tabs.TabPane>
        <Tabs.TabPane tab={tabTitles['3']} key="3"></Tabs.TabPane>
      </Tabs>
    </ProForm>
  );
};

export default WOAdminForm;
