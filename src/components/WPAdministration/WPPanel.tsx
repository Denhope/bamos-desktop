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
} from 'antd';
import {
  PlusSquareOutlined,
  MinusSquareOutlined,
  ProjectOutlined,
} from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import ProjectForm from './WPForm';

import ProjectTree from './WPTree';
import {
  useAddProjectMutation,
  useDeleteProjectMutation,
  useGetProjectQuery,
  useGetfilteredWOQuery,
  useUpdateProjectMutation,
} from '@/features/wpAdministration/wpApi';
import { IProject } from '@/models/IProject';
import ProjectDiscription from './WPDiscription';
import { Split } from '@geoffcox/react-splitter';
import PartList from '../woAdministration/PartList';
import PartContainer from '../woAdministration/PartContainer';
import { ValueEnumType, getStatusColor } from '@/services/utilites';
import WPDiscription from './WPDiscription';
import WPForm from './WPForm';
import {
  useAddProjectPanelsMutation,
  useAppendProjectTaskMutation,
} from '@/features/projectItemWO/projectItemWOApi';
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
  } = useGetfilteredWOQuery(
    {
      projectTypesID: projectSearchValues?.projectTypesID,
      WOType: projectSearchValues?.projectType,
      status: projectSearchValues?.status,
      startDate: projectSearchValues?.startDate,
      endDate: projectSearchValues?.endDate,
      WONumber: projectSearchValues?.projectNumber,
      customerID: projectSearchValues?.customerID,
      time: projectSearchValues?.time,
    },
    { skip: !projectSearchValues }
  );
  const [addPanels] = useAddProjectPanelsMutation({});

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
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS WO?'),
      onOk: async () => {
        try {
          await deleteProject(projectId).unwrap();
          notification.success({
            message: t('WO SUCCESSFULLY DELETED'),
            description: t('Item has been successfully updated.'),
          });
        } catch (error) {
          notification.error({
            message: t('FAILED '),
            description: 'There was an error delete the WO.',
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
          message: t('SUCCESSFULLY ADDED'),
          description: t('Item has been successfully added.'),
        });

        // setEditingproject(null);
      }
      // setEditingproject(null);
    } catch (error) {
      notification.error({
        message: t('FAILED TO SAVE'),
        description: 'There was an error adding Item.',
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
    closed: t('CLOSED'),
    canceled: t('CANCELLED'),
    cancelled: t('CANCELLED'),
    CANCELLED: t('CANCELLED'),
    onOrder: t('ISSUED'),
    draft: t('DRAFT'),
    issued: t('ISSUED'),
    progress: t('IN PROGRESS'),
    inProgress: t('IN PROGRESS'),
    complete: t('COMPLETE'),
    RECEIVED: t('RECEIVED'),
    PARTLY_RECEIVED: t('PARTLY RECEIVED'),
    DRAFT: t('DRAFT'),
  };
  const columnItems = [
    {
      field: 'WONumber',
      headerName: `${t('WP No')}`,
      cellDataType: 'text',
    },
    {
      field: 'WOName',
      headerName: `${t('WO NAME')}`,
      cellDataType: 'text',
    },
    {
      field: 'WOType',
      headerName: `${t('WO TYPE')}`,
      cellDataType: 'text',
      valueFormatter: (params: any) => params?.value?.toUpperCase(),
    },
    {
      field: 'customerWO',
      headerName: `${t('CUSTOMER WO No')}`,
      cellDataType: 'text',
    },
    {
      field: 'status',
      headerName: `${t('Status')}`,
      cellDataType: 'text',
      width: 150,
      filter: true,
      valueGetter: (params: { data: { status: keyof ValueEnumType } }) =>
        params.data.status,
      valueFormatter: (params: { value: keyof ValueEnumType }) => {
        const status = params.value;
        return valueEnum[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumType }) => ({
        backgroundColor: getStatusColor(params.value),
        color: '#ffffff', // Text color
      }),
    },
    {
      field: 'createDate',
      editable: false,
      cellDataType: 'date',
      headerName: `${t('CREATE DATE')}`,
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
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
      editable: false,
      cellDataType: 'date',
      headerName: `${t('PLANNED START DATE')}`,
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
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
      editable: false,
      cellDataType: 'date',
      headerName: `${t('PLANNED FINISH DATE')}`,
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
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
      editable: false,
      cellDataType: 'date',
      headerName: `${t('START DATE')}`,
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
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
      editable: false,
      cellDataType: 'date',
      headerName: `${t('FINISH DATE')}`,
      valueFormatter: (params: any) => {
        if (!params.value) return ''; // Проверка отсутствия значения
        const date = new Date(params.value);
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
  ];
  const handleGenerateWOPanels = async (ids: any[]) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO ADD ACCESS'),
      onOk: async () => {
        try {
          await addPanels({
            // projectID: projectID,
            WOReferenceID: editingproject?._id,
            isFromWO: true,
          }).unwrap();
          // refetchProjectItems();
          notification.success({
            message: t('ACCESS SUCCESSFULLY ADDED'),
            description: t('The access has been successfully added.'),
          });
          Modal.destroyAll();
        } catch (error) {
          notification.error({
            message: t('FAILED TO ADD ACCESS'),
            description: 'There was an error adding the access.',
          });
        }
      },
    });
  };

  return (
    <>
      <Space>
        <Col
          className=" bg-white px-4 py-3   rounded-md brequierement-gray-400 "
          sm={24}
        >
          <WPDiscription
            // onRequirementSearch={setRequirement}
            project={editingproject}
          ></WPDiscription>
        </Col>
      </Space>
      <Space size={'small'} className="">
        <Col>
          <Button
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD WP')}
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
              {t('DELETE WP')}
            </Button>
          )}
        </Col>
        {/* <Col>
          <Button
            // disabled
            disabled={!editingproject}
            size="small"
            icon={<ProjectOutlined />}
            onClick={() => handleGenerateWOPanels(selectedKeys)}
          >
            {t('GENERATE ACCEESS')}
          </Button>
        </Col> */}
        <Col>
          <Switch
            checkedChildren="Table"
            unCheckedChildren="Tree"
            defaultChecked
            onChange={() => setIsTreeView(!isTreeView)}
          />
        </Col>
      </Space>

      <div className="  flex gap-4 justify-between">
        <Split initialPrimarySize="35%" splitterSize="20px">
          <div className=" h-[70vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 ">
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
              <PartContainer
                isVisible
                isButtonVisiable={false}
                isAddVisiable={true}
                isLoading={isFetching || isLoading}
                columnDefs={columnItems}
                partNumbers={[]}
                pagination={false}
                rowData={projects || []}
                onUpdateData={function (data: any[]): void {}}
                height={'65vh'}
                onRowSelect={handleEdit}
              ></PartContainer>
            )}
          </div>
          <div className="h-[70vh] bg-white px-4 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            <WPForm
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
