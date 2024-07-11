import React, { useMemo, useState } from 'react';
import { Button, Row, Col, Modal, message, Space, Spin, Switch } from 'antd';
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
import { transformToIProjectItem } from '@/services/utilites';
interface AdminPanelRProps {
  projectID: string;
  project: any;
}

const ProjectWPAdmin: React.FC<AdminPanelRProps> = ({ projectID, project }) => {
  const [editingReqCode, setEditingReqCode] = useState<IProjectItem | null>(
    null
  );
  const [isTreeView, setIsTreeView] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  // let projectItems = null;
  // let isLoading = false;

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
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: t('ARE YOU SURE, YOU WANT TO DELETE THIS PROJECT ITEM?'),
      onOk: async () => {
        try {
          await deleteProjectItem(id).unwrap();
          message.success(t('PROJECT ITEM SUCCESSFULLY DELETED'));
        } catch (error) {
          message.error(t('ERROR DELETING PROJECT ITEM'));
        }
      },
    });
  };
  const handleGenerateWOTasks = async (ids: any[]) => {
    Modal.confirm({
      title: t(' ВЫ УВЕРЕНЫ, ВЫ ХОТИТЕ СОЗДАТЬ ЗАКАЗЫ ДЛЯ ВЫДЕЛЕННЫХ ПОЗИЦИЙ?'),
      onOk: async () => {
        try {
          await createWO({
            isSingleWO: true,
            isMultiWO: false,
            projectItemID: ids,
          }).unwrap();
          refetchProjectItems();
          message.success(t('ЗАКАЗЫ УСПЕШНО СОЗДАНЫ'));
          Modal.destroyAll();
          // Modal.confirm({
          //   width: 550,
          //   title: t('СОЗДАТЬ ЗАКАЗ ПОД КАЖДУЮ ПОЗИЦИЮ?'),
          //   footer: [
          //     <Space>
          //       {/* <Button
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
          //       </Button> */}
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
          message.error(t('ОШИБКА '));
        }
      },
    });
  };

  const handleGenerateWOPanels = async (ids: any[]) => {
    Modal.confirm({
      title: t(
        ' ВЫ УВЕРЕНЫ, ВЫ ХОТИТЕ СОЗДАТЬ ДОСТУПЫ ДЛЯ ВЫДЕЛЕННЫХ ПОЗИЦИЙ?'
      ),
      onOk: async () => {
        try {
          await addPanels({
            projectID: projectID,
          }).unwrap();
          refetchProjectItems();
          message.success(t('ЗАКАЗЫ УСПЕШНО СОЗДАНЫ'));
          Modal.destroyAll();
        } catch (error) {
          message.error(t('ОШИБКА '));
        }
      },
    });
  };

  const handleSubmit = async (reqCode: any) => {
    try {
      if (editingReqCode) {
        await updateProjectItem(reqCode).unwrap();
        message.success(t('УСПЕШНО ОБНОВЛЕНО'));
        setEditingReqCode(null);
      } else {
        await addProjectItem({
          projectItem: reqCode,
          projectID: projectID,
        }).unwrap();
        message.success(t('УСПЕШНО ДОБАВЛЕНО'));
        setEditingReqCode(null);
      }
    } catch (error) {
      message.error(t('ОШИБКА СОХРАНЕНИЯ'));
    }
  };
  const handleAddMultiItems = async (data: any) => {
    try {
      {
        await addMultiProjectItems({
          projectItemsDTO: data,
          projectID: projectID,
          planeID: project?.planeId._id,
        }).unwrap();
        message.success(t('УСПЕШНО ДОБАВЛЕНО'));
        setEditingReqCode(null);
      }
    } catch (error) {
      message.error(t('ОШИБКА СОХРАНЕНИЯ'));
    }
  };

  const { t } = useTranslation();

  if (loading) {
    return (
      <div>
        <Spin />
      </div>
    );
  }

  const columnItems = [
    {
      field: 'taskNumber',
      headerName: `${t('TASK No')}`,
      cellDataType: 'text',
    },
    {
      field: 'taskDescription',
      headerName: `${t('TASK DESCREIPTION')}`,
      cellDataType: 'text',
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
        <Col style={{ textAlign: 'right' }}>
          {
            <Button
              disabled={!selectedKeys.length && selectedKeys.length < 1}
              size="small"
              icon={<MinusSquareOutlined />}
              onClick={() => {
                // Проверяем, есть ли в элементах editingReqCode.projectItemsWOID заказы со статусом отличным от CANCELED или DELETED
                const hasActiveOrders = editingReqCode?.projectItemsWOID?.some(
                  (item) =>
                    item.status !== 'CANCELED' && item.status !== 'DELETED'
                );

                if (hasActiveOrders) {
                  // Если есть активные заказы, выводим предупреждение
                  Modal.warning({
                    title: t('УДАЛЕНИЕ НЕВОЗМОЖНО'),
                    content: t(
                      'Удаление невозможно из-за того, что уже созданы заказы. Если вы хотите удалить записи, установите статус ЗАКАЗА на ОТМЕНЕН.'
                    ),
                  });
                } else {
                  editingReqCode &&
                    // Если все заказы отменены или удалены, вызываем handleDelete
                    handleDelete(editingReqCode.id);
                }
              }}
            >
              {t('DELETE ITEM')}
            </Button>
          }
        </Col>
        <Col>
          <FileUploader
            onFileProcessed={function (data: any[]): void {
              handleAddMultiItems(data);
            }}
            requiredFields={['taskNumber']}
          ></FileUploader>
        </Col>
        <Col style={{ textAlign: 'right' }}>
          <Button
            // disabled
            // disabled={!selectedKeys.length && selectedKeys.length < 1}
            size="small"
            icon={<ProjectOutlined />}
            onClick={() => handleGenerateWOPanels(selectedKeys)}
          >
            {t('GENERATE ACCEESS')}
          </Button>
        </Col>

        <Col style={{ textAlign: 'right' }}>
          <Button
            disabled={!selectedKeys.length && selectedKeys.length < 1}
            size="small"
            icon={<ProjectOutlined />}
            onClick={() => handleGenerateWOTasks(selectedKeys)}
          >
            {t('CREATE TRACE')}
          </Button>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {/* <Button
            disabled
            // disabled={!selectedKeys.length && selectedKeys.length < 1}
            size="small"
            icon={<ProjectOutlined />}
            // onClick={() => handleGenerateWOTasks(selectedKeys)}
          >
            {t('GENERATE REQUIREMENTS')}
          </Button> */}
        </Col>

        <Col span={4} style={{ textAlign: 'right' }}>
          {/* <Button
            disabled
            // disabled={!selectedKeys.length && selectedKeys.length < 1}
            size="small"
            icon={<ProjectOutlined />}
            // onClick={() => handleGenerateWOTasks(selectedKeys)}
          >
            {t('LINK REQUIREMENTS')}
          </Button> */}
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          {/* <Button
            disabled
            // disabled={!selectedKeys.length && selectedKeys.length < 1}
            size="small"
            icon={<ProjectOutlined />}
            // onClick={() => handleGenerateWOTasks(selectedKeys)}
          >
            {t('CANCEL LINK')}
          </Button> */}
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
            className="h-[57vh] bg-white px-4 py-3 rounded-md brequierement-gray-400 p-3 overflow-y-auto "
            // sm={11}
          >
            <ProjectWPAdministrationForm
              project={project}
              reqCode={editingReqCode || undefined}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
            />
          </div>
        </Split>
      </div>
    </>
  );
};

export default ProjectWPAdmin;
