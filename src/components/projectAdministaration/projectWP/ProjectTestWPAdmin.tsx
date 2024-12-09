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
import FileUploaderV2 from '@/components/shared/FileUploaderV2';
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
import { useGetACTypesQuery } from '@/features/acTypeAdministration/acTypeApi';
import { useGetMPDCodesQuery } from '@/features/MPDAdministration/mpdCodesApi';

interface SelectOption {
  value: string;
  label: string;
}

interface AdditionalSelect {
  key: string;
  label: string;
  options: SelectOption[];
  required?: boolean;
  width?: number;
  mode?: 'multiple' | 'single';
  dependsOn?: string;
}

interface Project {
  status: string;
  projectType: string;
  planeId?: {
    _id: string;
  };
}

interface AdminPanelRProps {
  projectID: string;
  project: Project;
}

const ProjectTestWPAdmin: React.FC<AdminPanelRProps> = ({
  projectID,
  project,
}) => {
  // Все хуки должны быть в начале компонента
  const { t } = useTranslation();
  const [editingReqCode, setEditingReqCode] = useState<IProjectItem | null>(
    null
  );
  const [isTreeView, setIsTreeView] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [selectedAcType, setSelectedAcType] = useState<string>('');
  const [selectedMpdCodes, setSelectedMpdCodes] = useState<string[]>([]);

  // API queries
  const { data: acTypes } = useGetACTypesQuery({});
  const { data: mpdCodes } = useGetMPDCodesQuery(
    { acTypeID: selectedAcType },
    { skip: !selectedAcType }
  );
  const {
    data: projectItems,
    isLoading: loading,
    isFetching,
    refetch: refetchProjectItems,
  } = useGetProjectItemsQuery({
    projectID,
  });

  // Mutations
  const [createWO] = useAddProjectItemWOMutation({});
  const [addProjectItem] = useAddProjectItemMutation({});
  const [addMultiProjectItems] = useAddMultiProjectItemsMutation({});
  const [updateProjectItem] = useUpdateProjectItemsMutation();
  const [reloadProjectItem] = useReloadProjectItemMutation();
  const [deleteProjectItem] = useDeleteProjectItemMutation();
  const [addPanels] = useAddProjectPanelsMutation({});

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

  const transformedItems = useMemo(() => {
    return transformToIProjectItem(projectItems || []);
  }, [projectItems]);

  const handleCreate = () => {
    setEditingReqCode(null);
  };

  const handleEdit = (reqCode: IProjectItem) => {
    setEditingReqCode(reqCode);
  };

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
      if (!selectedAcType || !selectedMpdCodes.length) {
        notification.error({
          message: t('VALIDATION_ERROR'),
          description: t('Please select Aircraft Type and MPD Code'),
        });
        return;
      }

      const enrichedData = data.map((item: any) => ({
        ...item,
        // Обязательные поля
        acTypeId: selectedAcType,
        mpdDocumentationId: selectedMpdCodes[0],
        taskType:
          item.taskType || (project.projectType === 'production' ? 'FC' : 'RC'),
        isCriticalTask: item?.isCriticalTask || false,

        // Необязательные поля - добавляем их только если они есть в исходных данных
        ...(item.taskDescription
          ? { taskDescription: item.taskDescription }
          : {}),
        ...(item.mainWorkTime
          ? { mainWorkTime: Number(item.mainWorkTime) }
          : {}),
      }));

      await addMultiProjectItems({
        projectItemsDTO: enrichedData,
        projectID,
        planeID: project.planeId?._id,
      }).unwrap();

      notification.success({
        message: t('SUCCESSFULLY UPDATED'),
        description: t('Items have been successfully updated.'),
      });
    } catch (error) {
      notification.error({
        message: t('FAILED TO SAVE'),
        description: 'There was an error adding Items.',
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

  // Определяем additionalSelects после инициализации хуков
  // const additionalSelects: AdditionalSelect[] = [
  //   {
  //     key: 'acTypeId',
  //     label: 'SELECT_AC_TYPE',
  //     options: (acTypes || []).map((acType) => ({
  //       value: acType.id,
  //       label: acType.name,
  //     })),
  //     required: true,
  //     width: 400,
  //   },
  //   {
  //     key: 'mpdDocumentationId',
  //     label: 'SELECT_MPD_CODES',
  //     options: (mpdCodes || []).map((mpdCode) => ({
  //       value: mpdCode.id,
  //       label: mpdCode.code,
  //     })),
  //     mode: 'multiple',
  //     dependsOn: 'acTypeId',
  //     width: 400,
  //   },
  // ];

  const columnItems = [
    {
      field: 'readyStatus',
      headerName: ``,
      cellRenderer: CircleTaskRenderer,
      width: 80,
      filter: 'agSetColumnFilter',
      sortable: true,
      comparator: (valueA: any, valueB: any) => {
        const colorA = valueA === 'green' ? 1 : 0;
        const colorB = valueB === 'green' ? 1 : 0;

        if (colorA === colorB) return 0;
        return colorA > colorB ? -1 : 1;
      },
      valueGetter: (params: any) => {
        return params.data.taskNumberID ? 'green' : 'red';
      },
      filterParams: {
        values: (params: any) => ['green', 'red'],
        cellRenderer: (params: any) => {
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
            : params?.data?.reference;
        if (!files || files.length === 0) return null;

        const file = files[0];

        return (
          <div
            className="cursor-pointer hover:text-blue-500"
            onClick={() => {}}
          >
            <FileOutlined />
          </div>
        );
      },
      sortable: true,
      comparator: (valueA: any, valueB: any) => {
        const hasFileA = valueA && valueA.length > 0;
        const hasFileB = valueB && valueB.length > 0;

        if (hasFileA === hasFileB) return 0;
        return hasFileA ? -1 : 1;
      },
      valueGetter: (params: any) => {
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
        const projectItemsWOID = params.data.projectItemsWOID;
        if (projectItemsWOID && projectItemsWOID.length > 0) {
          return projectItemsWOID[0].taskWO;
        }
        return null;
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
      }),
    },
    {
      field: 'createDate',
      width: 120,
      editable: false,
      cellDataType: 'date',
      headerName: `${t('CREATE DATE')}`,
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
      field: 'name',
      headerName: `${t('CREATE BY')}`,
      cellDataType: 'text',
    },
  ];

  // Добавляем конфигурацию шаблона
  const getTemplateConfig = (projectType: string) => ({
    fields: [
      ...(projectType === 'baseMaintanance' ||
      projectType === 'addWork' ||
      projectType === 'lineMaintanance'
        ? [
            {
              name: 'taskNumber',
              displayName: t('TASK_NUMBER'),
              required: true,
              description: t('TASK_NUMBER_DESCRIPTION'),
              example: 'TASK-001',
              width: 20,
            },
            {
              name: 'taskType',
              displayName: t('TASK_TYPE'),
              required: true,
              description: t('TASK_TYPE_DESCRIPTION'),
              example: 'RC',
              width: 15,
            },
            {
              name: 'taskDescription',
              displayName: t('TASK_DESCRIPTION'),
              required: false,
              description: t('TASK_DESCRIPTION_HELP'),
              example: 'Check and inspect...',
              width: 40,
            },
            {
              name: 'mainWorkTime',
              displayName: t('MAIN_WORK_TIME'),
              required: false,
              description: t('MAIN_WORK_TIME_HELP'),
              example: '2.5',
              width: 15,
            },
            {
              name: 'isCriticalTask',
              displayName: t('IS_CRITICAL_TASK'),
              required: false,
              description: t('IS_CRITICAL_TASK_DESCRIPTION'),
              example: 'false',
              width: 15,
            },
          ]
        : [
            {
              name: 'PART_NUMBER',
              displayName: t('PART_NUMBER'),
              required: true,
              description: t('PART_NUMBER_DESCRIPTION'),
              example: 'PN12345',
              width: 20,
            },
            {
              name: 'QUANTITY',
              displayName: t('QUANTITY'),
              required: true,
              description: t('QUANTITY_DESCRIPTION'),
              example: '1',
              width: 10,
            },
            {
              name: 'taskType',
              displayName: t('TASK_TYPE'),
              required: true,
              description: t('TASK_TYPE_DESCRIPTION'),
              example: 'FC',
              width: 15,
            },
            {
              name: 'taskDescription',
              displayName: t('TASK_DESCRIPTION'),
              required: false,
              description: t('TASK_DESCRIPTION_HELP'),
              example: 'Install part...',
              width: 40,
            },
            {
              name: 'mainWorkTime',
              displayName: t('MAIN_WORK_TIME'),
              required: false,
              description: t('MAIN_WORK_TIME_HELP'),
              example: '1.5',
              width: 15,
            },
            {
              name: 'isCriticalTask',
              displayName: t('IS_CRITICAL_TASK'),
              required: false,
              description: t('IS_CRITICAL_TASK_DESCRIPTION'),
              example: 'false',
              width: 15,
            },
          ]),
    ],
    templateFileName: `wp_template_${projectType.toLowerCase()}.xlsx`,
    additionalInstructions: {
      tabs: [
        {
          key: 'instructions',
          label: t('INSTRUCTIONS'),
          content: getInstructionsConfig(projectType),
        },
        {
          key: 'taskTypes',
          label: t('TASK_TYPES'),
          content: {
            type: 'text',
            content: [
              t('Available task types:'),
              'FC - Fabrication card',
              'RC - TC (MPD, Customer MP, Access, CDCCL, ALI, STR inspection)',
              'NRC_ADD - ADHOC(Adhoc Task)',
            ],
          },
        },
      ],
    },
  });

  // Обновляем инструкции
  const getInstructionsConfig = (projectType: string) => ({
    type: 'text',
    content:
      projectType === 'baseMaintanance' ||
      projectType === 'addWork' ||
      projectType === 'lineMaintanance'
        ? [
            '1. Заполните номер задачи в поле taskNumber (обязательно)',
            '2. Укажите тип задачи в поле taskType (RC, NRC_ADD) - можно указывать разные типы для разных задач (обязательно)',
            '3. При необходимости добавьте описание задачи в поле taskDescription (необязательно)',
            '4. При необходимости укажите время выполнения в поле mainWorkTime в часах (необязательно)',
            '5. Убедитесь, что задача существует в системе',
            '6. Загрузите заполненный файл',
            '7. Проверьте данные в предпросмотре',
            '8. Нажмите Import для завершения',
            '3. При необходимости укажите критичность задачи в поле isCriticalTask (true/false, по умолчанию false)',
          ]
        : [
            '1. Заполните номер детали в поле PART_NUMBER (обязательно)',
            '2. Укажите количество в поле QUANTITY (обязательно)',
            '3. Укажите тип задачи в поле taskType (FC, RC, NRC_ADD) - можно указывать разные типы для разных задач (обязательно)',
            '4. При необходимости добавьте описание задачи в поле taskDescription (необязательно)',
            '5. При необходимости укажите время выполнения в поле mainWorkTime в часах (необязательно)',
            '6. Загрузите заполненный файл',
            '7. Проверьте данные в предпросмотре',
            '8. Нажмите Import для завершения',
            '4. При необходимости укажите критичность задачи в поле isCriticalTask (true/false, по умолчанию false)',
          ],
  });

  // Определяем селекты
  const additionalSelects: AdditionalSelect[] = [
    {
      key: 'acTypeId',
      label: 'SELECT_AC_TYPE',
      options: (acTypes || []).map(
        (acType): SelectOption => ({
          value: acType.id || '',
          label: acType.name || '',
        })
      ),
      required: true,
      width: 400,
    },
    {
      key: 'mpdDocumentationId',
      label: 'SELECT_MPD_CODES',
      options: (mpdCodes || []).map(
        (mpdCode): SelectOption => ({
          value: mpdCode.id || '',
          label: mpdCode.code || '',
        })
      ),
      mode: 'multiple',
      dependsOn: 'acTypeId',
      width: 400,
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
          <FileUploaderV2
            templateConfig={getTemplateConfig(project.projectType)}
            onFileProcessed={handleAddMultiItems}
            buttonText="IMPORT_WP"
            modalTitle="IMPORT_WORK_PACKAGES"
            tooltipText="CLICK_TO_VIEW_WP_TEMPLATE"
            disabled={
              project.status === 'CLOSED' || project.status === 'COMPLETED'
            }
            additionalSelects={additionalSelects}
            onSelectChange={(key, value) => {
              if (key === 'acTypeId') {
                setSelectedAcType(value);
                setSelectedMpdCodes([]); // Сбрасываем MPD коды при смене типа самолета
              } else if (key === 'mpdDocumentationId') {
                setSelectedMpdCodes(value);
              }
            }}
          />
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
