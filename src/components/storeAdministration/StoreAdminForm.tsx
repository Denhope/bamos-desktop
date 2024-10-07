import { useGetCompaniesQuery } from '@/features/companyAdministration/companyApi';
import { useGetUsersQuery } from '@/features/userAdministration/userApi';
import { IStore } from '@/models/IUser';
import {
  ProForm,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Tabs } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StoreLocationAdmin from './storeLocations/StoreLocationAdmin';
import PermissionGuard, { Permission } from '../auth/PermissionGuard';
interface UserFormProps {
  store?: IStore | undefined;
  storeItem?: any | {};
  // requirements?:
  onSubmit?: (company: any) => void;
  onDelete?: (storeID: string) => void;
  onstoreItemUpdate?: (storeItem: any) => void;
}
const StoreAdminForm: FC<UserFormProps> = ({ store, storeItem, onSubmit }) => {
  const [form] = ProForm.useForm();

  const { t } = useTranslation();
  const [activeTabKey, setActiveTabKey] = useState('1'); // Default to the first tab
  const [tabTitles, setTabTitles] = useState({
    '1': `${t('STORE INFO')}`,
    '2': `${t('LOCATIONS')}`,
    // '3': `${t('STEPS')}`,
  });
  const updateTabTitle = (selectedItem: any | null, store: any) => {
    if (store) {
      setTabTitles({
        ...tabTitles,
        '1': `${t('STORE №:')} ${
          String(store?.storeShortName).toUpperCase() || ''
        }`,
        '2': `${t('STORE №:')} ${
          String(store?.storeShortName).toUpperCase() || ''
        } - ${t('LOCATIONS')}`,
      });
    }
  };
  const handleSubmit = async (values: any) => {
    const newUser: IStore = store ? { ...store, ...values } : { ...values };

    onSubmit && onSubmit(newUser);
  };
  const { data: companies, isLoading } = useGetCompaniesQuery({});
  const { data: users } = useGetUsersQuery({});
  const SubmitButton = () => (
    <PermissionGuard requiredPermissions={[Permission.STORE_ACTIONS]}>
      <Button type="primary" htmlType="submit">
        {store ? t('UPDATE') : t('CREATE')}
      </Button>
    </PermissionGuard>
  );
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  useEffect(() => {
    updateTabTitle(storeItem, store);
  }, [storeItem, store]);
  const usersCodesValueEnum: Record<string, string> =
    users?.reduce<Record<string, string>>((acc, mpdCode) => {
      acc[
        mpdCode.id
      ] = `${mpdCode.firstName?.toUpperCase()} ${mpdCode.lastName?.toUpperCase()}`;
      return acc;
    }, {}) || {};

  useEffect(() => {
    setShowSubmitButton(activeTabKey === '1');
  }, [activeTabKey]);
  const companiesCodesValueEnum: Record<string, string> =
    companies?.reduce<Record<string, string>>((acc, mpdCode) => {
      acc[mpdCode.id] = mpdCode.companyName;
      return acc;
    }, {}) || {};
  useEffect(() => {
    if (store) {
      form.resetFields();
      form.setFieldsValue(store);
    } else {
      form.resetFields();
      // setSelectedProjectId(undefined);
    }
  }, [store, form]);
  return (
    <ProForm
      layout="horizontal"
      onReset={() => {
        form.resetFields();
        // setSelectedProjectId(null);
      }}
      size="small"
      form={form}
      onFinish={handleSubmit}
      submitter={{
        render: (_, dom) => {
          if (showSubmitButton) {
            return [<SubmitButton key="submit" />, dom.reverse()[1]];
          }
          return null;
        },
      }}
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
        <Tabs.TabPane tab={tabTitles['1']} key="1">
          <ProFormGroup size={'small'}>
            <ProFormText
              name="storeLongName"
              label={`${t('STORE LONG NAME')}`}
              width="lg"
              tooltip={`${t('STORE LONG NAME')}`}
              rules={[{ required: true }]}
            ></ProFormText>
            <ProFormText
              name="storeShortName"
              label={`${t('STORE SHORT NAME')}`}
              width="sm"
              tooltip={`${t('STORE SHORT NAME')}`}
              rules={[{ required: true }]}
            ></ProFormText>
            <ProFormSelect
              name="status"
              label={`${t('STATUS')}`}
              width="lg"
              valueEnum={{
                ACTIVE: { text: t('ACTIVE') },
                INACTIVE: { text: t('INACTIVE') },
              }}
            />
          </ProFormGroup>
          <ProFormSelect
            showSearch
            rules={[{ required: true }]}
            name="ownerID"
            label={t('OWNER')}
            width="lg"
            valueEnum={companiesCodesValueEnum || []}
            // disabled={!projectId}
          />
          <ProFormSelect
            showSearch
            rules={[{ required: true }]}
            name="storemanID"
            label={t('STOREMAN')}
            width="sm"
            valueEnum={usersCodesValueEnum || []}
            // disabled={!projectId}
          />
          <ProFormTextArea
            fieldProps={{ style: { resize: 'none' } }}
            name="remarks"
            colSize={1}
            label={t('REMARKS')}
            width="xl"
          ></ProFormTextArea>
        </Tabs.TabPane>
        <Tabs.TabPane tab={tabTitles['2']} key="2">
          {store && store?.id && (
            <StoreLocationAdmin storeID={store?.id}></StoreLocationAdmin>
          )}
        </Tabs.TabPane>
        {/* <Tabs.TabPane tab={tabTitles['3']} key="3"></Tabs.TabPane> */}
      </Tabs>
    </ProForm>
  );
};

export default StoreAdminForm;
