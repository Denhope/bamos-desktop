//@ts-nocheck

import React, { useMemo, useState } from 'react';
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
import {
  ProjectOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined,
} from '@ant-design/icons';

import { useTranslation } from 'react-i18next';

import { IProjectItem } from '@/models/AC';
import FileUploader from '../../shared/FileUploader';
import ProjectWPAdministrationTree from './ProjectWPAdministrationTree';
import ProjectWPAdministrationForm from './ProjectWPAdministrationForm';
import {
  useAddMultiProjectItemsMutation,
  useAddProjectItemMutation,
  useDeleteProjectItemMutation,
  useGetProjectItemsQuery,
  useReloadProjectItemMutation,
  useUpdateProjectItemsMutation,
} from '@/features/projectItemAdministration/projectItemApi';

import {
  useAddProjectItemWOMutation,
  useAddProjectPanelsMutation,
} from '@/features/projectItemWO/projectItemWOApi';
// import projectItemsAdministrationForm from './projectItemsAdministrationForm';
// import projectItemsAdministrationTree from './projectItemsAdministrationTree';
import { Split } from '@geoffcox/react-splitter';

import { FileOutlined } from '@ant-design/icons';
import {
  ValueEnumType,
  ValueEnumTypeTask,
  getTaskTypeColor,
  handleFileOpenTask,
  transformToIProjectItem,
} from '@/services/utilites';
import CircleTaskRenderer from './CircleTaskRenderer';
import UniversalAgGrid from '@/components/shared/UniversalAgGrid';
interface AdminPanelRProps {
  projectID: string;
  project: any;
}

const ProjectTestWPAdmin: React.FC<AdminPanelRProps> = ({
  projectID,
  project,
}) => {
  const [editingReqCode, setEditingReqCode] = useState<IProjectItem | null>(
    null
  );
  const { t } = useTranslation();

  const [isTreeView, setIsTreeView] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  // let projectItems = null;
  // let isLoading = false;
  const valueEnumTask: ValueEnumTypeTask = {
    RC: t('TC'),
    CR_TASK: t('CR TASK (CRITICAL TASK/DI)'),
    NRC: t('NRC (DEFECT)'),
    MJC: t('MJC'),
    CMJC: t('CMJC'),
    FC: t('FC)'),
    NRC_ADD: t('ADHOC'),
    HARD_ACCESS: t('HARD ACCESS'),
  };

  // if (projectID) {
  const {
    data: projectItems,
    isLoading: loading,
    isFetching: isFetching,
    refetch: refetchProjectItems,
  } = useGetProjectItemsQuery({
    projectID,
  });
  // projectItems = data;
  // isLoading = loading;
  // }
  const [createWO] = useAddProjectItemWOMutation({});
  const [addProjectItem] = useAddProjectItemMutation({});
  const [addMultiProjectItems] = useAddMultiProjectItemsMutation({});
  const [updateProjectItem] = useUpdateProjectItemsMutation();

  const [reloadProjectItem] = useReloadProjectItemMutation();
  const [deleteProjectItem] = useDeleteProjectItemMutation();
  const transformedItems = useMemo(() => {
    return transformToIProjectItem(projectItems || []);
  }, [projectItems]);
  const handleCreate = () => {
    setEditingReqCode(null);
  };

  const handleEdit = (reqCode: IProjectItem) => {
    setEditingReqCode(reqCode);
  };
  const [addPanels] = useAddProjectPanelsMutation({});
  const handleDelete = async (ids: string[]) => {
    const selectedItems = transformedItems.filter((item) =>
      ids.includes(item._id)
    );
    const hasProjectItemsWOID = selectedItems.some(
      (item) => item.projectItemsWOID && item.projectItemsWOID.length > 0
    );

    if (hasProjectItemsWOID) {
      notification.warning({
        message: t('CANNOT DELETE'),
        description: t(
          'Cannot delete items with associated projectItemsWOID. Please remove associated WO first.'
        ),
      });
      return;
    }

    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS ITEM?'),
      onOk: async () => {
        try {
          await deleteProjectItem(ids).unwrap();
          notification.success({
            message: t('SUCCESSFULLY UPDATED'),
            description: t('Item has been successfully updated.'),
          });
        } catch (error) {
          notification.error({
            message: t('FAILED DELETING'),
            description: 'There was an error deleting Item.',
          });
        }
      },
    });
  };
  const handleReload = async (ids: string[]) => {
    const selectedItems = transformedItems.filter((item) =>
      ids.includes(item._id)
    );
    const hasProjectItemsWOID = selectedItems.some(
      (item) => item.projectItemsWOID && item.projectItemsWOID.length > 0
    );

    if (hasProjectItemsWOID) {
      notification.warning({
        message: t('CANNOT RELOAD'),
        description: t(
          'Cannot reload items with associated projectItemsWOID. Please remove associated WO first.'
        ),
      });
      return;
    }

    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO RELOAD THIS PROJECT ITEM?'),
      onOk: async () => {
        try {
          await reloadProjectItem(ids).unwrap();
          notification.success({
            message: t('SUCCESSFULLY UPDATED'),
            description: t('Item has been successfully updated.'),
          });
        } catch (error) {
          notification.error({
            message: t('FAILED TO SAVE'),
            description: 'There was an error adding Item.',
          });
        }
      },
    });
  };
  const handleGenerateWOTasks = async (ids: any[]) => {
    const selectedItems = transformedItems.filter((item) =>
      ids.includes(item._id)
    );
    const hasProjectItemsWOID = selectedItems.some(
      (item) => item.projectItemsWOID && item.projectItemsWOID.length > 0
    );

    if (hasProjectItemsWOID) {
      notification.warning({
        message: t('CANNOT CREATE TASKS'),
        description: t(
          'Cannot create tasks for items with associated projectItemsWOID. Please remove associated WO first.'
        ),
      });
      return;
    }

    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO CREATE TASKS?'),
      onOk: async () => {
        try {
          await createWO({
            isSingleWO: true,
            isMultiWO: false,
            projectItemID: ids,
          }).unwrap();
          refetchProjectItems();
          notification.success({
            message: t('TASKS SUCCESSFULLY ADDED'),
            description: t('The Tasks  has been successfully added.'),
          });
          Modal.destroyAll();
        } catch (error) {
          notification.error({
            message: t('FAILED '),
            description: 'There was an error add task.',
          });
        }
      },
    });
  };

  const handleSubmit = async (reqCode: any) => {
    try {
      if (editingReqCode) {
        await updateProjectItem(reqCode).unwrap();
        notification.success({
          message: t('SUCCESSFULLY UPDATED'),
          description: t('Item has been successfully updated.'),
        });
        // setEditingReqCode(null);
      } else {
        if (project && project.projectType == 'production') {
          await addProjectItem({
            projectItem: reqCode,
            projectID: projectID,
            planeID: project?.planeId?._id,
            taskType: reqCode?.taskType ? reqCode?.taskType : 'FC',
          }).unwrap();
          notification.success({
            message: t('SUCCESSFULLY UPDATED'),
            description: t('Item has been successfully updated.'),
          });
        } else if (
          (project && project && project.projectType === 'baseMaintanance') ||
          (project && project.projectType === 'addWork') ||
          project.projectType === 'lineMaintanance'
        ) {
          await addProjectItem({
            projectItem: reqCode,
            projectID: projectID,
            planeID: project?.planeId?._id,
            taskType: reqCode?.taskType ? reqCode?.taskType : 'RC',
          }).unwrap();
          notification.success({
            message: t('SUCCESSFULLY UPDATED'),
            description: t('Item has been successfully updated.'),
          });

          // setEditingReqCode(null);
        }
      }
    } catch (error) {
      notification.error({
        message: t('FAILED TO SAVE'),
        description: 'There was an error adding Item.',
      });
    }
  };
  const handleAddMultiItems = async (data: any) => {
    try {
      if (project && project.projectType == 'production') {
        {
          await addMultiProjectItems({
            projectItemsDTO: data,
            projectID: projectID,
            planeID: project?.planeId?._id,
            taskType: 'FC',
          }).unwrap();
          notification.success({
            message: t('SUCCESSFULLY UPDATED'),
            description: t('Item has been successfully updated.'),
          });
        }
      } else if (
        (project && project.projectType === 'baseMaintanance') ||
        (project && project.projectType === 'addWork') ||
        project.projectType === 'lineMaintanance'
      ) {
        await addMultiProjectItems({
          projectItemsDTO: data,
          projectID: projectID,
          planeID: project?.planeId?._id,
          taskType: 'RC',
        }).unwrap();
        notification.success({
          message: t('SUCCESSFULLY UPDATED'),
          description: t('Item has been successfully updated.'),
        });
      }
    } catch (error) {
      notification.error({
        message: t('FAILED TO SAVE'),
        description: 'There was an error adding Item.',
      });
    }
  };

  if (loading) {
    return (
      <div>
        <Spin />
      </div>
    );
  }

  const columnItems = [
    {
      field: 'readyStatus',
      headerName: ``,
      cellRenderer: CircleTaskRenderer,
      width: 80,
      filter: 'agSetColumnFilter', // Использование фильтра со списком значений
      sortable: true,
      comparator: (valueA: any, valueB: any) => {
        const colorA = valueA === 'green' ? 1 : 0;
        const colorB = valueB === 'green' ? 1 : 0;

        if (colorA === colorB) return 0;
        return colorA > colorB ? -1 : 1;
      },
      valueGetter: (params: any) => {
        // Определяет значение для фильтрации и сортировки
        return params.data.taskNumberID ? 'green' : 'red';
      },
      filterParams: {
        values: (params: any) => ['green', 'red'], // Значения для фильтрации
        cellRenderer: (params: any) => {
          // Отображение цветного круга в выпадающем списке фильтра
          const color = params.value;
          const circleStyle = {
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            backgroundColor: color,
            display: 'inline-block',
          };
          return <div style={circleStyle}></div>;
        },
      },
    },
    {
      field: 'reference',
      headerName: `${t('DB FILE')}`,
      width: 90,
      cellRenderer: (params: any) => {
        const files =
          params?.data?.taskNumberID?.reference &&
          params?.data?.taskNumberID?.reference?.length
            ? params?.data?.taskNumberID?.reference
            : params?.data?.reference; // Проверяем taskNumberID.reference, затем reference
        if (!files || files.length === 0) return null; // Проверка на наличие файлов

        // Предполагаем, что вы хотите взять первый файл из массива
        const file = files[0];

        return (
          <div
            className="cursor-pointer hover:text-blue-500"
            onClick={() => {
              // handleFileOpenTask(file.fileId, 'uploads', file.filename);
            }}
          >
            <FileOutlined />
          </div>
        );
      },
      sortable: true,
      comparator: (valueA: any, valueB: any) => {
        // Сравниваем по наличию файлов
        const hasFileA = valueA && valueA.length > 0;
        const hasFileB = valueB && valueB.length > 0;

        if (hasFileA === hasFileB) return 0;
        return hasFileA ? -1 : 1;
      },
      valueGetter: (params: any) => {
        // Извлекаем значения для сортировки
        const files =
          params?.data?.taskNumberID?.reference &&
          params?.data?.taskNumberID?.reference?.length
            ? params?.data?.taskNumberID?.reference
            : params?.data?.reference;
        return files;
      },
    },
    {
      field: 'isCriticalTask',
      headerName: t('CRITICAL TASK'),
      cellDataType: 'boolean',
      width: 120,
      cellRenderer: (params: { value: boolean }) => {
        return (
          <Tag color={params.value ? 'red' : 'green'}>
            {params.value ? t('YES') : t('NO')}
          </Tag>
        );
      },
      valueGetter: (params: any) => {
        return params.data.isCriticalTask;
      },
      filter: 'agSetColumnFilter',
      filterParams: {
        values: [true, false],
        valueFormatter: (params: any) => (params.value ? t('YES') : t('NO')),
      },
    },
    {
      field: 'taskWO',
      headerName: `${t('TRACE No')}`,
      filter: true,
      width: 120,
      valueGetter: (params: any) => {
        const projectItemsWOID = params.data.projectItemsWOID; // Предполагаем, что projectItemsWOID — это массив объектов
        if (projectItemsWOID && projectItemsWOID.length > 0) {
          return projectItemsWOID[0].taskWO; // Возвращаем taskWO первого объекта в массиве
        }
        return null; // Возвращаем null, если массив пуст или не существует
      },
    },

    {
      field: 'taskNumber',
      headerName: `${t('TASK No')}`,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
      width: 150,
    },
    {
      field: 'taskDescription',
      headerName: `${t('TASK DESCREIPTION')}`,
      cellDataType: 'text',
    },

    {
      field: 'taskType',
      width: 120,
      headerName: `${t('TASK TYPE')}`,
      filter: true,
      valueGetter: (params: { data: { taskType: keyof ValueEnumTypeTask } }) =>
        params.data.taskType,
      valueFormatter: (params: { value: keyof ValueEnumTypeTask }) => {
        const status = params.value;
        return valueEnumTask[status] || '';
      },
      cellStyle: (params: { value: keyof ValueEnumTypeTask }) => ({
        backgroundColor: getTaskTypeColor(params.value),
        // color: '#ffffff', // Text color
      }),
      // hide: true,
    },

    {
      field: 'createDate',
      width: 120,
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
      field: 'name',
      headerName: `${t('CREATE BY')}`,
      cellDataType: 'text',
    },
  ];

  return (
    <>
      <Space className=" pb-3 ">
        <Col>
          <Button
            disabled={
              project.status == 'CLOSED' || project.status == 'COMPLETED'
            }
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD ITEM')}
          </Button>
        </Col>
        <Col>
          <FileUploader
            isDisabled={
              project.status == 'CLOSED' || project.status == 'COMPLETED'
            }
            onFileProcessed={function (data: any[]): void {
              handleAddMultiItems(data);
            }}
            requiredFields={
              (project && project.projectType === 'baseMaintanance') ||
              (project && project.projectType === 'addWork') ||
              project.projectType === 'lineMaintanance'
                ? ['taskNumber']
                : ['PART_NUMBER', 'QUANTITY']
            }
          ></FileUploader>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {
            <Button
              disabled={
                (!selectedKeys.length && selectedKeys.length < 1) ||
                project.status == 'CLOSED' ||
                project.status == 'COMPLETED'
              }
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => {
                handleDelete(selectedKeys);
              }}
            >
              {t('DELETE ITEM')}
            </Button>
          }
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {
            <Button
              disabled={
                (!selectedKeys.length && selectedKeys.length < 1) ||
                project.status == 'CLOSED' ||
                project.status == 'COMPLETED'
              }
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => {
                handleReload(selectedKeys);
              }}
            >
              {t('RELOAD ITEM')}
            </Button>
          }
        </Col>
        <Col>
          <Col style={{ textAlign: 'right' }}>
            <Button
              disabled={
                (!selectedKeys.length && selectedKeys.length < 1) ||
                project.status == 'CLOSED' ||
                project.status == 'COMPLETED'
              }
              size="small"
              icon={<ProjectOutlined />}
              onClick={() => handleGenerateWOTasks(selectedKeys)}
            >
              {t('CREATE TASK')}
            </Button>
          </Col>
        </Col>

        <Col>
          <Switch
            size="default"
            checkedChildren="Table"
            unCheckedChildren="Tree"
            defaultChecked
            onChange={() => setIsTreeView(!isTreeView)}
          />
        </Col>
      </Space>

      <div className="flex gap-4 justify-between">
        <Split initialPrimarySize="40%">
          <div className="h-[50vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3">
            {isTreeView ? (
              <ProjectWPAdministrationTree
                projectItems={projectItems || []}
                onProjectItemSelect={handleEdit}
                onCheckItems={(selectedKeys) => {
                  setSelectedKeys(selectedKeys);
                }}
              />
            ) : (
              <UniversalAgGrid
                isChekboxColumn
                gridId="projectItemsGrid"
                rowData={transformedItems || []}
                columnDefs={columnItems}
                height="58vh"
                onRowSelect={(selectedRows) => {
                  if (selectedRows.length > 0) {
                    handleEdit(selectedRows[0]);
                    // setSelectedKeys(selectedRows.map((row) => row.id));
                  }
                }}
                isLoading={loading || isFetching}
                pagination={true}
                onCheckItems={(selectedKeys) => {
                  setSelectedKeys(selectedKeys);
                }}
                isMultiSelect={true}
                isCheckboxSelection={true}
              />
            )}
          </div>
          <div className="h-[58vh] bg-white px-4 py-3 rounded-md brequierement-gray-400 p-3 overflow-y-auto">
            <ProjectWPAdministrationForm
              project={project}
              reqCode={editingReqCode || undefined}
              onSubmit={handleSubmit}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default ProjectTestWPAdmin;
