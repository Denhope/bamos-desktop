import { RouteNames } from '@/router';
import { getItem } from '@/services/utilites';
import { Layout, Menu, MenuProps, Tabs, message } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import TabPane, { TabPaneProps } from 'antd/es/tabs/TabPane';
import React, { FC, useEffect, useState } from 'react';
import {
  UserOutlined,
  GroupOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import AdminPanel from '@/components/userAdministration/accountAdminisrtation/AdminPanel';

import {} from '@/features/userAdministration/userGroupApi';

import AdminuserGroupPanel from '@/components/userAdministration/userGroupAdministration/AdminuserGroupPanel';

import AdminCompanyPanel from '@/components/userAdministration/companyAdministration/AdminCompanyPanel';
import AdminVendorPanel from '@/components/userAdministration/vendorAdministration/AdminVendorPanel';
import VendorFilteredForm, {
  VendorFilteredFormValues,
} from '@/components/userAdministration/vendorAdministration/VendorFilteredForm';
import { useGetVendorsQuery } from '@/features/vendorAdministration/vendorApi';

import AdminACTypesPanel from '@/components/userAdministration/acTypesAdministration/AdminACTypesPanel';
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';
import { ACTypesFilteredFormValues } from '@/components/userAdministration/acTypesAdministration/ASTypesFilteredForm';

import AdminTaskPanel from '@/components/userAdministration/taskAdministration/AdminTaskPanel';
import AdminTaskFilterdForm from '@/components/userAdministration/taskAdministration/AdminTaskFilterdForm';
import { useGetTasksQuery } from '@/features/tasksAdministration/tasksApi';

import ACAdministrationPanel from '@/components/userAdministration/ACAdministration/ACAdministrationPanel';
import { useGetPlanesQuery } from '@/features/acAdministration/acAdminApi';
import RequirementsTypesPanel from '@/components/userAdministration/requirementsTypes/RequirementsTypesPanel';

const UserAdministration: FC = () => {
  type MenuItem = Required<MenuProps>['items'][number];
  interface TabData extends TabPaneProps {
    key: string;
    title: string;
    content: React.ReactNode;
  }
  const { t } = useTranslation();
  const items: MenuItem[] = [
    getItem(
      <>{t('ADMINISTRATION')}</>,
      RouteNames.USER_ADMINISTRATION,
      <UserSwitchOutlined />
    ),
    getItem(<>{t('ACCOUNTS')}</>, RouteNames.USER_ACCOUNTS, <UserOutlined />),
    // getItem(<>{t('ROLES')}</>, RouteNames.USER_ROLES, <ControlOutlined />),
    getItem(
      <>{t('ACCOUNTS GROUPS')}</>,
      RouteNames.USER_GROUPS,
      <GroupOutlined />
    ),
    getItem(
      <>{t('REQUIREMENTS TYPES ')}</>,
      RouteNames.REQUIREMENTS_CODES,
      <GroupOutlined />
    ),
    getItem(<>{t('COMPANIES ')}</>, RouteNames.COMPANIES, <GroupOutlined />),
    getItem(<>{t('VENDORS ')}</>, RouteNames.VENDORS, <GroupOutlined />),
    getItem(<>{t('AC TYPES ')}</>, RouteNames.AC_TYPES, <GroupOutlined />),
    getItem(<>{t('AC TASKS ')}</>, RouteNames.AC_TASKS, <GroupOutlined />),
    getItem(<>{t('AC ADMINISTRATION ')}</>, RouteNames.AC, <GroupOutlined />),
  ];
  const [collapsed, setCollapsed] = useState(false);
  const [panes, setPanes] = useState<TabData[]>([]);

  const [activeKey, setActiveKey] = useState<string>('');
  const [acrFormValues, setACFormValues] = useState<any>({
    status: [''],
  });
  const [vendorFormValues, setVendorFormValues] =
    useState<VendorFilteredFormValues>({
      CODE: '',
      NAME: '',
      status: [''],
    });
  const [tasksFormValues, setTasksFormValues] = useState<any>({
    taskNumber: '',
    status: [''],
  });
  const [ACTypesFormValues, setACTypesFormValues] =
    useState<ACTypesFilteredFormValues>({
      code: '',
      name: '',
      status: [''],
    });
  const { refetch: refetchPlanes } = useGetPlanesQuery({
    status: tasksFormValues.status,
    // planeNumber: tasksFormValues.taskNumber,
    acTypeID: tasksFormValues.acTypeId,
  });
  const { refetch: refetchTasks } = useGetTasksQuery({
    status: tasksFormValues.status,
    taskNumber: tasksFormValues.taskNumber,
    acTypeID: tasksFormValues.acTypeId,
    taskType: tasksFormValues.taskType,
  });
  const { refetch: refetchVendors } = useGetVendorsQuery({
    code: vendorFormValues.CODE,
    status: vendorFormValues.status,
    name: vendorFormValues.NAME,
    isResident: vendorFormValues.IS_RESIDENT,
  });
  const { refetch: refetchACTypes } = useGetACTypesQuery({
    code: ACTypesFormValues.code,
    status: ACTypesFormValues.status,
    name: ACTypesFormValues.name,
  });
  // useGetACTypesQuery
  useEffect(() => {
    refetchVendors();
  }, [vendorFormValues, refetchVendors]);

  useEffect(() => {
    refetchTasks();
  }, [tasksFormValues, refetchTasks]);
  useEffect(() => {
    refetchACTypes();
  }, [ACTypesFormValues, refetchACTypes]);
  useEffect(() => {
    refetchPlanes();
  }, [acrFormValues, refetchPlanes]);
  const onEdit = (
    targetKey:
      | string
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>,
    action: 'add' | 'remove'
  ) => {
    if (typeof targetKey === 'string') {
      if (action === 'remove') {
        const newPanes = panes.filter((pane) => pane.key !== targetKey);
        setPanes(newPanes);
        if (newPanes.length > 0) {
          setActiveKey(newPanes[newPanes.length - 1].key);
        }
      }
    } else {
    }
  };
  const onMenuClick = ({ key }: { key: string }) => {
    if (key === RouteNames.AC) {
      const tab = {
        key,
        title: `${t('AC ADMINISTRATION')}`,
        content: (
          <div>
            <ACAdministrationPanel values={acrFormValues} />
          </div>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.REQUIREMENTS_CODES) {
      const tab = {
        key,
        title: `${t('REQUIREMENTS TYPES')}`,
        content: (
          <div>
            <RequirementsTypesPanel values={[]} />
          </div>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }

    if (key === RouteNames.USER_GROUPS) {
      const tab = {
        key,
        title: `${t('ACCOUNTS GROUPS')}`,
        content: (
          <div>
            <AdminuserGroupPanel />
          </div>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.VENDORS) {
      const tab = {
        key,
        title: `${t('VENDORS')}`,
        content: (
          <div>
            <AdminVendorPanel values={vendorFormValues} />
          </div>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.AC_TYPES) {
      const tab = {
        key,
        title: `${t('AC TYPES')}`,
        content: (
          <div>
            <AdminACTypesPanel values={ACTypesFormValues} />
          </div>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.AC_TASKS) {
      const tab = {
        key,
        title: `${t('AC TASKS')}`,
        content: (
          <div>
            <AdminTaskPanel values={vendorFormValues} />
          </div>
        ),
        closable: true,
      };

      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }

    if (key === RouteNames.USER_PERMISSIONS) {
      const tab = {
        key,
        title: `${t('PERMISSIONS')}`,
        content: <></>,
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.COMPANIES) {
      const tab = {
        key,
        title: `${t('COMPANIES')}`,
        content: <AdminCompanyPanel></AdminCompanyPanel>,
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.USER_ROLES) {
      const tab = {
        key,
        title: `${t('ROLES')}`,
        content: <></>,
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.USER_ACCOUNTS) {
      const tab = {
        key,
        title: `${t('ACCOUNTS')}`,
        content: (
          <>
            <AdminPanel />
          </>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
  };

  return (
    <Layout>
      <Sider
        className="h-[85vh] overflow-hidden"
        theme="light"
        width={300}
        collapsible
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        <Menu theme="light" mode="inline" items={items} onClick={onMenuClick} />

        {activeKey === RouteNames.VENDORS && !collapsed && (
          <VendorFilteredForm
            onSubmit={function (values: VendorFilteredFormValues): void {
              setVendorFormValues(values);
            }}
          />
        )}
        {activeKey === RouteNames.AC_TASKS && !collapsed && (
          <AdminTaskFilterdForm
            onSubmit={function (values: VendorFilteredFormValues): void {
              setTasksFormValues(values);
            }}
          />
        )}
      </Sider>
      <Content className="pl-4">
        <Tabs
          // style={{
          //   width: '97%',
          // }}
          className="mx-auto"
          size="small"
          hideAdd
          onChange={setActiveKey}
          activeKey={activeKey}
          type="editable-card"
          onEdit={onEdit}
        >
          {panes.map((pane) => (
            <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
              {pane.content}
            </TabPane>
          ))}
        </Tabs>
      </Content>
    </Layout>
  );
};

export default UserAdministration;
