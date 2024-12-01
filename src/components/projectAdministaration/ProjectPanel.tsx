//@ts-nocheck

import React, { useState } from 'react';
import {
  Button,
  Row,
  Col,
  Modal,
  message,
  Space,
  Spin,
  Switch,
  notification,
  Tag,
} from 'antd';
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
import ProjectDiscription from './ProjectDiscription';
import { Split } from '@geoffcox/react-splitter';
import PartList from '../woAdministration/PartList';
import PartContainer from '../woAdministration/PartContainer';
import { ValueEnumType, getStatusColor } from '@/services/utilites';
import UniversalAgGrid from '../shared/UniversalAgGrid';
interface AdminPanelProps {
  projectSearchValues: any;
}

const ProjectPanelAdmin: React.FC<AdminPanelProps> = ({
  projectSearchValues,
}) => {
  const [editingproject, setEditingproject] = useState<IProject | null>(null);
  const [isTreeView, setIsTreeView] = useState(false);
  const {
    data: projects,
    isLoading,
    isFetching,
  } = useGetProjectsQuery(
    {
      projectTypesID: projectSearchValues?.projectTypesID,
      projectType: projectSearchValues?.projectType,
      status: projectSearchValues?.status,
      startDate: projectSearchValues?.startDate,
      endDate: projectSearchValues?.endDate,
      projectWO: projectSearchValues?.projectNumber,
      customerID: projectSearchValues?.customerID,
      WOReferenceID: projectSearchValues?.WOReferenceID,
      time: projectSearchValues?.time,
    },
    { skip: !projectSearchValues }
  );

  const [addProject] = useAddProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const handleCreate = () => {
    setEditingproject(null);
  };

  const handleEdit = (project: any) => {
    project && project?.length
      ? setEditingproject(project[0])
      : setEditingproject(project);
  };

  const handleDelete = async (projectId: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS ITEM?'),
      onOk: async () => {
        try {
          await deleteProject(projectId).unwrap();
          notification.success({
            message: t('SUCCESSFULLY DELETED'),
            description: t('Item has been successfully deleted.'),
          });
        } catch (error) {
          notification.error({
            message: t('FAILED '),
            description: 'There was an error delete the task.',
          });
        }
      },
    });
  };

  const handleSubmit = async (project: IProject) => {
    try {
      if (editingproject) {
        await updateProject(project).unwrap();
        handleEdit(project);
        notification.success({
          message: t('SUCCESSFULLY UPDATED'),
          description: t('Item has been successfully updated.'),
        });
      } else {
        await addProject({ project }).unwrap();
        notification.success({
          message: t('SUCCESSFULLY UPDATED'),
          description: t('Item has been successfully updated.'),
        });
        // setEditingproject(null);
      }
      // setEditingproject(null);
    } catch (error) {
      notification.error({
        message: t('FAILED TO SAVE'),
        description: 'There was an error save Item.',
      });
    }
  };

  const { t } = useTranslation();
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const valueEnum: ValueEnumType = {
    onShort: t('ON SHORT'),
    onQuatation: t('QUATATION'),
    open: t('OPEN'),
    OPEN: t('OPEN'),
    closed: t('CLOSE'),
    CLOSED: t('CLOSED'),
    canceled: t('CANCEL'),
    cancelled: t('CANCEL'),
    CANCELLED: t('CANCEL'),
    onOrder: t('ISSUED'),
    draft: t('DRAFT'),
    issued: t('ISSUED'),
    progress: t('IN PROGRESS'),
    inProgress: t('IN PROGRESS'),
    complete: t('COMPLETE'),
    RECEIVED: t('RECEIVED'),
    COMPLETED: t('COMPLETED'),
    PARTLY_RECEIVED: t('PARTLY RECEIVED'),
    DRAFT: t('DRAFT'),
  };
  const columnDefs = [
    {
      field: 'projectWO',
      headerName: t('PROJECT No'),
    },
    {
      field: 'projectName',
      headerName: t('WO NAME'),
    },
    {
      field: 'projectType',
      headerName: `${t('WO TYPE')}`,
      cellDataType: 'text',
      cellRenderer: (params: any) => {
        const typeMap = {
          baseMaintanance: { text: t('BASE MAINTENANCE'), color: 'green' },
          lineMaintanance: { text: t('LINE MAINTENANCE'), color: 'blue' },
          repairPart: { text: t('REPAIR AC'), color: 'red' },
          partCange: { text: t('COMPONENT CHANGE'), color: 'cyan' },
          addWork: { text: t('ADD WORK'), color: 'purple' },
          enginiring: { text: t('ENGINEERING SERVICES'), color: 'magenta' },
          nonProduction: {
            text: t('NOT PRODUCTION SERVICES'),
            color: 'orange',
          },
        };

        const type = typeMap[params.value as keyof typeof typeMap];

        if (!type) return params.value?.toUpperCase();

        return (
          <Tag color={type.color} style={{ margin: '2px' }}>
            {type.text}
          </Tag>
        );
      },
    },
    {
      field: 'WONumber',
      headerName: t('WP No'),
    },
    {
      field: 'customerWO',
      headerName: t('CUSTOMER WO No'),
    },
    {
      field: 'status',
      headerName: t('Status'),
      cellRenderer: (params: any) => {
        const status = params.value;
        return (
          <div
            style={{
              backgroundColor: getStatusColor(status),
              // padding: '2px 5px',
              // borderRadius: '3px',
              // color: '#fff',
              textAlign: 'center',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {valueEnum[status] || ''}
          </div>
        );
      },
    },
    {
      field: 'createDate',
      headerName: t('CREATE DATE'),
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
    {
      field: 'planedStartDate',
      headerName: t('PLANNED START DATE'),
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
    {
      field: 'planedFinishDate',
      headerName: t('PLANNED FINISH DATE'),
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
    {
      field: 'startDate',
      headerName: t('START DATE'),
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
    {
      field: 'finishDate',
      headerName: t('FINISH DATE'),
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
    {
      field: 'createUser.name',
      headerName: t('CREATE USER'),
      valueGetter: (params: any) => {
        return params.data.createUserID?.name || '';
      },
    },
  ];
  return (
    <>
      <Space>
        <Col
          className=" bg-white px-4 py-3   rounded-md brequierement-gray-400 "
          sm={24}
        >
          <ProjectDiscription
            // onRequirementSearch={setRequirement}
            project={editingproject}
          ></ProjectDiscription>
        </Col>
      </Space>
      <Space size={'small'} className="">
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
              onClick={() =>
                handleDelete(editingproject.id || editingproject?._id)
              }
            >
              {t('DELETE PROJECT')}
            </Button>
          )}
        </Col>
        <Col>
          <Switch
            checkedChildren="Table"
            unCheckedChildren="Tree"
            defaultChecked
            onChange={() => setIsTreeView(!isTreeView)}
          />
        </Col>
      </Space>

      <div className="flex gap-4 justify-between">
        <Split initialPrimarySize="25%" splitterSize="20px">
          <div className="h-[70vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3">
            {isTreeView ? (
              <ProjectTree
                isLoading={isFetching || isLoading}
                onProjectSelect={handleEdit}
                projects={projects || []}
                onCheckItems={(selectedKeys) => {
                  setSelectedKeys(selectedKeys);
                }}
              />
            ) : (
              <UniversalAgGrid
                gridId="projectDetails"
                rowData={projects || []}
                columnDefs={columnDefs}
                height="65vh"
                onRowSelect={handleEdit}
                isLoading={isFetching || isLoading}
                pagination={true}
              />
            )}
          </div>
          <div className="h-[70vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            <ProjectForm
              project={editingproject || undefined}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default ProjectPanelAdmin;
