import React, { useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import ProjectForm from './ProjectForm';

import ProjectTree from './ProjectTree';
import {
  useAddProjectMutation,
  useDeleteProjectMutation,
  useGetProjectQuery,
  useGetProjectsQuery,
  useUpdateProjectMutation,
} from '@/features/projectAdministration/projectsApi';
import { IProject } from '@/models/IProject';

interface AdminPanelProps {
  projectSearchValues: any;
}

const ProjectPanelAdmin: React.FC<AdminPanelProps> = ({
  projectSearchValues,
}) => {
  const [editingproject, setEditingproject] = useState<IProject | null>(null);

  const { data: projects, isLoading } = useGetProjectsQuery({
    projectTypesID: projectSearchValues?.projectTypesID,
    status: projectSearchValues?.status,
    startDate: projectSearchValues?.startDate,
    endDate: projectSearchValues?.endDate,
  });

  const [addProject] = useAddProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const handleCreate = () => {
    setEditingproject(null);
  };

  const handleEdit = (project: IProject) => {
    setEditingproject(project);
  };

  const handleDelete = async (projectId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS project?'),
      onOk: async () => {
        try {
          await deleteProject(projectId).unwrap();
          message.success(t('PROJECT SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING PROJECT'));
        }
      },
    });
  };

  const handleSubmit = async (project: IProject) => {
    try {
      if (editingproject) {
        await updateProject(project).unwrap();
        message.success(t('PROJECT SUCCESSFULLY UPDATED'));
      } else {
        await addProject({ project }).unwrap();
        message.success(t('PROJECT SUCCESSFULLY ADDED'));
      }
      setEditingproject(null);
    } catch (error) {
      message.error(t('ERROR SAVING PROJECT '));
    }
  };

  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div>
        <Spin />
      </div>
    );
  }

  return (
    <>
      <Space className="gap-4 pb-3">
        <Col>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD PROJECT')}
          </Button>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {editingproject && (
            <Button
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => handleDelete(editingproject.id)}
            >
              {t('DELETE PROJECT')}
            </Button>
          )}
        </Col>
      </Space>

      <div className="  flex gap-4 justify-between">
        <div className=" w-3/12 h-[78vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 ">
          <ProjectTree onProjectSelect={handleEdit} projects={projects || []} />
        </div>
        <div className=" w-9/12 h-[75vh] bg-white px-4 py-3  rounded-md brequierement-gray-400 p-3 ">
          <ProjectForm
            project={editingproject || undefined}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </>
  );
};

export default ProjectPanelAdmin;
