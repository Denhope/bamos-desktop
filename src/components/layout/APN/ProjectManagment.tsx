import { ApartmentOutlined } from '@ant-design/icons';
import { Col, Layout, Menu, MenuProps, Row } from 'antd';
import Sider from 'antd/es/layout/Sider';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getItem } from '@/services/utilites';
import ProjectFilterForm from '../projectManagment/ProjectFilterForm';
import { Content } from 'antd/es/layout/layout';
import ProjectList from '../projectManagment/ProjectList';
import ProjectDescription from '../projectManagment/ProjectDescription';
import ProjectDetails from '../projectManagment/ProjectDetails';

const ProjectManagment: FC = () => {
  const [project, setProject] = useState<any | null>(null);

  const [collapsed, setCollapsed] = useState(false);
  type MenuItem = Required<MenuProps>['items'][number];
  const { t } = useTranslation();
  const [projects, setProjects] = useState<any[] | []>([]);
  const [data, setdata] = useState<any[] | []>(projects);
  useEffect(() => {
    if (projects) {
      setdata(projects);
    }
  }, [projects]);
  const items: MenuItem[] = [
    getItem(
      <>{t('PROJECT MANAGMENT')} (BAN:100)</>,
      'sub1',
      <ApartmentOutlined />
    ),
  ];
  return (
    <Layout>
      <Sider
        className="h-[85vh] overflow-hidden"
        theme="light"
        width={400}
        collapsible
        // color="rgba(255, 255, 255, 0.2)"
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        <Menu theme="light" mode="inline" items={items} />
        <div className="mx-auto px-5">
          <div
            style={{
              display: !collapsed ? 'block' : 'none',
            }}
          >
            <ProjectFilterForm onProjectSearch={setProjects} />
            <ProjectList
              scroll={20}
              onSelectedProjects={setProject}
              projects={data}
            ></ProjectList>
          </div>
        </div>
      </Sider>
      <Content className="pl-4">
        <div className="h-[82vh] overflow-hidden flex flex-col justify-between gap-5">
          <ProjectDescription onProjectSearch={setProject} project={project} />
          <ProjectDetails
            project={project}
            onEditProjectDetailsEdit={setProject}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default ProjectManagment;
