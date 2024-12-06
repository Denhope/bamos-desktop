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
  ProjectOutlined,
  HomeOutlined,
  UserSwitchOutlined,
  EditOutlined,
  UsergroupAddOutlined,
  AppstoreAddOutlined,
  ForkOutlined,
  AimOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import AdminPanel from '@/components/userAdministration/accountAdminisrtation/AdminPanel';

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
// import { useGetPlanesQuery } from '@/features/ACAdministration/acApi';

import RequirementsTypesPanel from '@/components/userAdministration/requirementsTypes/RequirementsTypesPanel';
import ProjectTypePanel from '@/components/userAdministration/projectTypesAdministaration/ProjectTypePanel';
import AdminPanelSkills from '@/components/userAdministration/skillAdminisrtation/AdminPanelSkills';
import { useGetPartNumbersQuery } from '@/features/partAdministration/partApi';
import { useGlobalState } from '@/components/woAdministration/GlobalStateContext';
import CertificatesTypesPanel from '@/components/userAdministration/certificatesTypes/CertificatesTypesPanel';
import OrderTextPanel from '@/components/userAdministration/orderTextAdministaration/OrderTextPanel';
import ActionTemplateTextPanel from '@/components/views/actionTemplateAministaration/ActionTemplateTextPanel';
import { useGetPlanesQuery } from '@/features/acAdministration/acApi';

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
    getItem(<>{t('ACCOUNTS')}</>, '23', <UserOutlined />, [
      getItem(<>{t('USERS')}</>, RouteNames.USER_ACCOUNTS, <UserOutlined />),
      getItem(
        <>{t('ACCOUNTS GROUPS')}</>,
        RouteNames.USER_GROUPS,
        <UsergroupAddOutlined />
      ),
      getItem(
        <>{t('SKILLS')}</>,
        RouteNames.SKILLS_ACCOUNTS,
        <UsergroupAddOutlined />
      ),
    ]),
    getItem(<>{t('TYPES')}</>, '434557', <AimOutlined />, [
      getItem(
        <>{t('REQUIREMENTS TYPES')}</>,
        RouteNames.REQUIREMENTS_CODES,
        <AppstoreAddOutlined />
      ),
      getItem(
        <>{t('CERTIFICATES TYPES')}</>,
        RouteNames.CERTIFICATES_CODES,
        <AppstoreAddOutlined />
      ),
      getItem(
        <>{t('ORDER TEXT TYPES')}</>,
        RouteNames.ORDER_TEXT_CODES,
        <ProjectOutlined />
      ),
    ]),
    getItem(
      <>{t('TEMPLATES')}</>,
      RouteNames.ACTION_TEXT_CODES,
      <AppstoreAddOutlined />
    ),

    getItem(<>{t('COMPANIES')}</>, RouteNames.COMPANIES, <GroupOutlined />),
    getItem(<>{t('VENDORS')}</>, RouteNames.VENDORS, <HomeOutlined />),
    getItem(<>{t('AIRCRAFT')}</>, '4567', <AimOutlined />, [
      getItem(<>{t('A/C TYPES')}</>, RouteNames.AC_TYPES, <ForkOutlined />),
      getItem(<>{t('REGISTRATION')}</>, RouteNames.AC, <EditOutlined />),
    ]),
    getItem(<>{t('TASKS')}</>, RouteNames.AC_TASKS, <GroupOutlined />),
  ];
  const [collapsed, setCollapsed] = useState(false);
  const [panes, setPanes] = useState<TabData[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');
  const [acrFormValues, setACFormValues] = useState<any>({
    status: [''],
  });
  const [vendorFormValues, setVendorFormValues] = useState<any>({});
  const { setTasksFormValues, tasksFormValues } = useGlobalState();
  const [ACTypesFormValues, setACTypesFormValues] =
    useState<ACTypesFilteredFormValues>({
      code: '',
      name: '',
      status: [''],
    });
  const { refetch: refetchPlanes } = useGetPlanesQuery(
    {
      status: tasksFormValues?.status,
      acTypeID: tasksFormValues?.acTypeId,
    },
    { skip: !tasksFormValues }
  );
  const { refetch: refetchVendors } = useGetVendorsQuery({
    code: vendorFormValues?.CODE,
    status: vendorFormValues.status,
    name: vendorFormValues.NAME,
    isResident: vendorFormValues.IS_RESIDENT,
    unp: vendorFormValues.UNP,
  });
  const { refetch: refetchACTypes } = useGetACTypesQuery({
    code: ACTypesFormValues.code,
    status: ACTypesFormValues.status,
    name: ACTypesFormValues.name,
  });

  useEffect(() => {
    refetchVendors();
  }, [vendorFormValues, refetchVendors]);

  useEffect(() => {
    refetchACTypes();
  }, [ACTypesFormValues, refetchACTypes]);

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

  const [openKeys, setOpenKeys] = useState(['sub1']);
  const rootSubmenuKeys = ['434557', '4567', '23', RouteNames.AC_TASKS];
  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };
  const onMenuClick = ({ key }: { key: string }) => {
    // Закрытие всех пунктов меню при выборе "Tasks"
    if (key === RouteNames.AC_TASKS) {
      setCollapsed(false);
      setOpenKeys([]);
    } else {
      setCollapsed(false);
    }

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
    } else if (key === RouteNames.ORDER_TEXT_CODES) {
      const tab = {
        key,
        title: `${t('ORDER TEXT TYPES')}`,
        content: (
          <div>
            <OrderTextPanel />
          </div>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    } else if (key === RouteNames.ACTION_TEXT_CODES) {
      const tab = {
        key,
        title: `${t('TEMPLATES')}`,
        content: <div>{<ActionTemplateTextPanel />}</div>,
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }
    if (key === RouteNames.CERTIFICATES_CODES) {
      const tab = {
        key,
        title: `${t('CERTIFICATES TYPES')}`,
        content: (
          <div>
            <CertificatesTypesPanel values={[]} />
          </div>
        ),
        closable: true,
      };
      if (!panes.find((pane) => pane.key === tab.key)) {
        setPanes((prevPanes) => [...prevPanes, tab]);
      }
      setActiveKey(tab.key);
    }

    if (key === RouteNames.PROJECTS_CODES) {
      const tab = {
        key,
        title: `${t('PROJECT TYPES')}`,
        content: (
          <div>
            <ProjectTypePanel />
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
            <AdminTaskPanel values={tasksFormValues} />
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
    } else if (key === RouteNames.SKILLS_ACCOUNTS) {
      const tab = {
        key,
        title: `${t('SKILLS')}`,
        content: (
          <>
            <AdminPanelSkills />
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
        width={460}
        collapsible
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        <div className="h-[82vh] overflow-auto flex flex-col ">
          <Menu
            theme="light"
            mode="inline"
            items={items}
            onClick={onMenuClick}
          />
          {activeKey === RouteNames.VENDORS && !collapsed && (
            <VendorFilteredForm
              onSubmit={function (values: VendorFilteredFormValues): void {
                setVendorFormValues(values);
              }}
            />
          )}
          {activeKey === RouteNames.AC_TASKS && !collapsed && (
            <AdminTaskFilterdForm
              onSubmit={function (values: any): void {
                setTasksFormValues(values);
                console.log(values);
                // refetchTasks();
              }}
              formKey={'adminTaskForm'}
            />
          )}
        </div>
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
