// @ts-nocheck

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
import PartContainer from '@/components/woAdministration/PartContainer';
import {
  ValueEnumType,
  ValueEnumTypeTask,
  getTaskTypeColor,
  transformToIProjectItem,
} from '@/services/utilites';
import CircleTaskRenderer from './CircleTaskRenderer';
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
    RC: t('RC'),
    RC_ADD: t('RC (CRIRICAL TASK/DI)'),
    NRC: t('NRC (DEFECT)'),
    MJC: t('MJC)'),
    CMJC: t('CMJC)'),
    FC: t('FC)'),
    NRC_ADD: t('ADHOC)'),
  };

  // if (projectID) {
  const {
    data: projectItems,
    isLoading: loading,
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
          // Modal.confirm({
          //   width: 550,
          //   title: t('СОЗДАТЬ ЗАКАЗ ПОД КАЖДУЮ ПОЗИЦИЮ?'),
          //   footer: [
          //     <Space>
          //       {/* <ButtonMissing required fields: PART_NUMBER, QUANTITY
          //         key="single"
          //         onClick={async () => {
          //           try {
          //             await createWO({
          //               isSingleWO: false,
          //               isMultiWO: true,
          //               projectItemID: ids,
          //               projectID: projectID,
          //             }).unwrap();
          //             refetchProjectItems();
          //             message.success(t('ОДИН ЗАКАЗ УСПЕШНО СОЗДАН'));
          //             refetchProjectItems();
          //             Modal.destroyAll();
          //           } catch (error) {
          //             message.error(t('ОШИБКА ПРИ СОЗДАНИИ ЗАКАЗА'));
          //             Modal.destroyAll();
          //           }
          //         }}
          //       >
          //         {t('СОЗДАТЬ ОДИН ЗАКАЗ')}
          //       </ButtonMissing> */}
          //       <Button
          //         key="multiple"
          //         type="primary"
          //         onClick={async () => {
          //           try {
          //             await createWO({
          //               isSingleWO: true,
          //               isMultiWO: false,
          //               projectItemID: ids,
          //             }).unwrap();
          //             refetchProjectItems();
          //             message.success(t('ЗАКАЗЫ УСПЕШНО СОЗДАНЫ'));
          //             Modal.destroyAll();
          //           } catch (error) {
          //             message.error(t('ОШИБКА ПРИ СОЗДАНИИ ЗАКАЗОВ'));
          //             Modal.destroyAll();
          //           }
          //         }}
          //       >
          //         {t('ПОД КАЖДУЮ ПОЗИЦИЮ')}
          //       </Button>
          //       <Button
          //         key="cancel"
          //         onClick={() => {
          //           Modal.destroyAll(); // Закрываем все модальные окна
          //         }}
          //       >
          //         {t('Отмена')}
          //       </Button>
          //     </Space>,
          //   ],
          // });
        } catch (error) {
          notification.error({
            message: t('FAILED '),
            description: 'There was an error delete the alternative.',
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
            taskType: 'FC',
          }).unwrap();
          notification.success({
            message: t('SUCCESSFULLY UPDATED'),
            description: t('Item has been successfully updated.'),
          });
        } else if (project && project.projectType == 'baseMaintanance') {
          await addProjectItem({
            projectItem: reqCode,
            projectID: projectID,
            planeID: project?.planeId?._id,
            taskType: 'RC',
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
      } else if (project && project.projectType == 'baseMaintanance') {
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
        const colorA = valueA ? 'green' : 'red';
        const colorB = valueB ? 'green' : 'red';

        if (colorA === colorB) return 0;
        return colorA === 'green' ? -1 : 1;
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
      field: 'taskNumber',
      headerName: `${t('TASK No')}`,
      cellDataType: 'text',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'taskDescription',
      headerName: `${t('TASK DESCREIPTION')}`,
      cellDataType: 'text',
    },

    {
      field: 'taskType',
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
        color: '#ffffff', // Text color
      }),
      // hide: true,
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
            size="small"
            icon={<PlusSquareOutlined />}
            onClick={handleCreate}
          >
            {t('ADD ITEM')}
          </Button>
        </Col>
        <Col>
          <FileUploader
            onFileProcessed={function (data: any[]): void {
              handleAddMultiItems(data);
            }}
            requiredFields={
              (project && project.projectType === 'baseMaintanance') ||
              (project && project.projectType === 'addWork')
                ? ['taskNumber']
                : ['PART_NUMBER', 'QUANTITY']
            }
          ></FileUploader>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {
            <Button
              disabled={!selectedKeys.length && selectedKeys.length < 1}
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => {
                // Проверяем, есть ли в элементах editingReqCode.projectItemsWOID заказы со статусом отличным от CANCELED или DELETED
                // const hasActiveOrders = editingReqCode?.projectItemsWOID?.some(
                //   (item) =>
                //     item.status !== 'CANCELED' && item.status !== 'DELETED'
                // );

                // if (hasActiveOrders) {
                //   // Если есть активные заказы, выводим предупреждение
                //   Modal.warning({
                //     title: t('УДАЛЕНИЕ НЕВОЗМОЖНО'),
                //     content: t(
                //       'Удаление невозможно из-за того, что уже созданы заказы. Если вы хотите удалить записи, установите статус ЗАКАЗА на ОТМЕНЕН.'
                //     ),
                //   });
                // } else {
                //   editingReqCode &&
                //     // Если все заказы отменены или удалены, вызываем handleDelete
                handleDelete(selectedKeys);
                // }
              }}
            >
              {t('DELETE ITEM')}
            </Button>
          }
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {
            <Button
              disabled={!selectedKeys.length && selectedKeys.length < 1}
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => {
                handleReload(selectedKeys);
                // }
              }}
            >
              {t('RELOAD ITEM')}
            </Button>
          }
        </Col>
        <Col>
          <Col style={{ textAlign: 'right' }}>
            <Button
              disabled={!selectedKeys.length && selectedKeys.length < 1}
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

      <div className="  flex gap-4 justify-between">
        <Split initialPrimarySize="40%">
          <div
            // sm={12}
            className="h-[50vh] bg-white px-4 py-3 rounded-md border-gray-400 p-3 "
          >
            {isTreeView ? (
              <ProjectWPAdministrationTree
                projectItems={projectItems || []}
                onProjectItemSelect={handleEdit}
                onCheckItems={(selectedKeys) => {
                  setSelectedKeys(selectedKeys);
                }}
              />
            ) : (
              <PartContainer
                isVisible
                pagination={true}
                onCheckItems={setSelectedKeys}
                isChekboxColumn={true}
                isButtonVisiable={false}
                isAddVisiable={true}
                isLoading={loading}
                columnDefs={columnItems}
                partNumbers={[]}
                rowData={transformedItems || []}
                onUpdateData={function (data: any[]): void {}}
                height={'55vh'}
                onRowSelect={handleEdit}
              ></PartContainer>
            )}
          </div>
          <div
            className="h-[55vh] bg-white px-4 py-3 rounded-md brequierement-gray-400 p-3 overflow-y-auto "
            // sm={11}
          >
            <ProjectWPAdministrationForm
              project={project}
              reqCode={editingReqCode || undefined}
              onSubmit={handleSubmit}
              // onDelete={handleDelete}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default ProjectTestWPAdmin;
