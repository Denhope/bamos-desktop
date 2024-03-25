import {
  Button,
  Checkbox,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  Skeleton,
  Table,
  Tabs,
  TabsProps,
} from 'antd';
import Paragraph from 'antd/es/typography/Paragraph';
import NRCADDForm from '@/components/projectask/projectTaskForm/NRCADDForm';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppDispatch, useTypedSelector } from '@/hooks/useTypedSelector';
import React, { FC, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  addAdditionalTask,
  initialAdditionalTask,
  setInitialTask,
} from '@/store/reducers/AdditionalTaskSlice';
import {
  addworkStepReferencesLinks,
  setCurrentProjectTaskMaterialRequest,
  setCurrentProjectTaskMaterialRequestAplication,
  setCurrentProjectTaskNewMaterial,
  updateCurrentProjectTaskMaterialRequest,
  updateCurrentProjectTaskNewMaterial,
} from '@/store/reducers/ProjectTaskSlise';
import {
  createNRC,
  createProjectTaskMaterialAplication,
  featchCountAdditionalByStatus,
  featchCountByStatus,
  featchFilteredTasksByProjectId,
  fetchSameMaterials,
  fetchTotalQuantity,
  getAllProjectTaskAplications,
  updateProjectTask,
} from '@/utils/api/thunks';
import WOCardView from './WO/WOCardView';
import WOFormChangeView from './WO/changeForm/WOFormChangeView';
import TaskCardView from './WO/taskCard/TaskCarView';
import { filterMaterial } from '@/services/utilites';
import { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import layout from 'antd/es/layout';

import { setInitialMaterial } from '@/store/reducers/MaterialStoreSlice';
import { IMatData1 } from '@/types/TypesData';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useTranslation } from 'react-i18next';

const WorkOrderView: FC = () => {
  const [searchIsVisible, setSearchIsVisible] = useState(false);

  const [inputSearchValue, setSerchedText] = useState('');
  const [inputSearchValueNewMaterial, setSerchedTextNewMaterial] = useState('');
  const [openRec, setOpenRec] = useState(false);
  const [openMaterialList, setOpenMateialList] = useState(false);
  const [openAplications, setOpenAplications] = useState(false);
  const [open, setOpen] = useState(false);
  const [openNRC, setOpenNRC] = useState(false);
  const { currentProjectTask } = useTypedSelector((state) => state.projectTask);
  const { currentAdditionalTask } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const { searchedAllItemsQuantity, searchedSameItemsQuantity } =
    useTypedSelector((state) => state.materialStore);
  const [addButtonDisabled, setAddButtonDisabled] = useState<boolean>(false);
  const { allMaterials } = useTypedSelector((state) => state.material);
  const { currentProject, isLoading } = useTypedSelector(
    (state) => state.projects
  );
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  let matRequest = filterMaterial(currentProjectTask, allMaterials);
  const columnsMatStore: ColumnsType<any> = [
    {
      title: 'P/N',
      dataIndex: 'PART_NUMBER',
      key: 'PART_NUMBER',
      responsive: ['sm'],
      render: (record) => {
        return <Paragraph copyable>{record}</Paragraph>;
      },
    },
    {
      title: 'Партия',
      dataIndex: 'BATCH',
      key: 'BATCH',
      responsive: ['sm'],
    },
    {
      title: 'S/N',
      dataIndex: 'BATCH_ID',
      key: 'BATCH_ID',
      responsive: ['sm'],
    },

    {
      title: <p className="text- my-0 py-0">Наим.</p>,
      dataIndex: 'NAME_OF_MATERIAL',
      key: 'NAME_OF_MATERIAL',
      responsive: ['sm'],
    },
    {
      title: 'Кол-во',
      dataIndex: 'QUANTITY',
      key: 'QUANTITY',
      responsive: ['sm'],
    },
    {
      title: 'Бронь',
      dataIndex: 'RESERVATION',
      key: 'RESERVATION',
      responsive: ['sm'],
    },
    {
      title: 'Ед. Измер.',
      dataIndex: 'UNIT_OF_MEASURE',
      key: 'UNIT_OF_MEASURE',
      responsive: ['sm'],
    },
    {
      title: 'Склад',
      dataIndex: 'STOCK',
      key: 'STOCK',
      responsive: ['sm'],
    },
  ];
  const columnsMat: ColumnsType<any> = [
    {
      title: <p className=" my-0 py-0">Код</p>,
      dataIndex: 'code',
      key: 'code',
      responsive: ['sm'],
    },
    {
      title: 'P/N',
      dataIndex: 'PN',
      key: 'PN',
      responsive: ['sm'],
      // render: (record) => {
      //   return <Paragraph copyable>{record}</Paragraph>;
      // },
    },

    {
      title: <p className="text- my-0 py-0">Наименование</p>,
      dataIndex: 'nameOfMaterial',
      key: 'nameOfMaterial',
      responsive: ['sm'],
    },
    {
      title: 'Альтернатива',
      dataIndex: 'alternative',
      key: 'alternative',
      responsive: ['sm'],
    },
    {
      title: 'Кол-во',
      dataIndex: 'amout',
      key: 'amout',
      responsive: ['sm'],
    },
    {
      title: 'Ед. Измер.',
      dataIndex: 'unit',
      key: 'unit',
      responsive: ['sm'],
    },
    {
      key: '5',
      title: `${t('Actions')}`,
      render: (record: any) => {
        return (
          <>
            <EditOutlined
              onClick={() => {
                onEditStudent(record);
              }}
            />
            <DeleteOutlined
              onClick={() => {
                onDeleteStudent(record);
              }}
              style={{ color: 'red', marginLeft: 12 }}
            />
          </>
        );
      },
    },
  ];
  const columnsMatNewMaterial: ColumnsType<any> = [
    {
      title: <p className=" my-0 py-0">Код</p>,
      dataIndex: 'code',
      key: 'code',
      responsive: ['sm'],
    },
    {
      title: 'P/N',
      dataIndex: 'PN',
      key: 'PN',
      responsive: ['sm'],
      // render: (record) => {
      //   return <Paragraph copyable>{record}</Paragraph>;
      // },
    },

    {
      title: <p className="text- my-0 py-0">Наименование</p>,
      dataIndex: 'nameOfMaterial',
      key: 'nameOfMaterial',
      responsive: ['sm'],
    },
    {
      title: 'Альтернатива',
      dataIndex: 'alternative',
      key: 'alternative',
      responsive: ['sm'],
    },
    {
      title: 'Кол-во',
      dataIndex: 'amout',
      key: 'amout',
      responsive: ['sm'],
    },
    {
      title: 'Ед. Измер.',
      dataIndex: 'unit',
      key: 'unit',
      responsive: ['sm'],
    },
    {
      key: '5',
      title: `${t('Actions')}`,
      render: (record: any) => {
        return (
          <>
            <EditOutlined
              onClick={() => {
                onEditNewMaterial(record);
              }}
            />
            <DeleteOutlined
              onClick={() => {
                onDeleteNewMaterial(record);
              }}
              style={{ color: 'red', marginLeft: 12 }}
            />
          </>
        );
      },
    },
  ];
  const columnsAplications: ColumnsType<any> = [
    {
      title: <p className=" my-0 py-0">Номер Заявки</p>,
      dataIndex: 'materialAplicationNumber',
      key: 'materialAplicationNumber',
      responsive: ['sm'],
    },

    {
      title: <p className="text- my-0 py-0">Заказчик</p>,
      dataIndex: 'user',
      key: 'user',
      responsive: ['sm'],
    },
    {
      title: 'Дата создания',
      dataIndex: 'createDate',
      key: 'createDate',
      responsive: ['sm'],
      render(text: Date) {
        return moment(text).format('Do MMM  YYYY, HH:mm');
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      responsive: ['sm'],
    },
  ];
  const columnsTasksMaterials: ColumnsType<any> = [
    {
      title: <p className=" my-0 py-0">PN</p>,
      dataIndex: 'PN',
      key: 'PN',
      responsive: ['sm'],
    },

    {
      title: <p className="text- my-0 py-0">Описание</p>,
      dataIndex: 'description',
      key: 'description',
      width: '20%',
      responsive: ['sm'],
    },
    {
      title: 'Количество',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '7%',
      responsive: ['sm'],
    },
    {
      title: 'Ед. Изм',
      dataIndex: 'unit',
      key: 'unit',
      width: '5%',
      responsive: ['sm'],
    },
    {
      title: <p className=" my-0 py-0">Получил</p>,
      dataIndex: 'recipient',
      key: 'recipient',
      responsive: ['sm'],
    },
    {
      title: <p className=" my-0 py-0">Дата </p>,
      dataIndex: 'closeDate',
      key: 'closeDate',
      render(text: Date) {
        return moment(text).format('DD.MM.YYYY, HH:mm');
      },
      width: '10%',
      responsive: ['sm'],
    },
    {
      title: <p className=" my-0 py-0">Номер Требования</p>,
      dataIndex: 'pickSlipNumber',
      key: 'pickSlipNumber',
      width: '8%',
      responsive: ['sm'],
    },

    {
      title: <p className=" my-0 py-0">Номер Партии</p>,
      dataIndex: 'batch',
      key: 'batch',
      responsive: ['sm'],
    },
    {
      title: <p className=" my-0 py-0">Серийный номер</p>,
      dataIndex: 'batchId',
      key: 'batchId',
      responsive: ['sm'],
    },
  ];

  const label = 'Подтверждаю информацию, указанную в заявке';
  const columnsMaterial: ColumnsType<any> = [
    {
      title: <p className=" my-0 py-0">Код</p>,
      dataIndex: 'code',
      key: 'code',
      responsive: ['sm'],
    },
    { title: 'P/N', dataIndex: 'PN', key: 'PN', responsive: ['sm'] },

    {
      title: <p className="text- my-0 py-0">Наименование</p>,
      dataIndex: 'nameOfMaterial',
      key: 'nameOfMaterial',
      responsive: ['sm'],
    },
    {
      title: 'Альтернатива',
      dataIndex: 'alternative',
      key: 'alternative',
      responsive: ['sm'],
    },
    {
      title: 'Кол-во',
      dataIndex: 'amout',
      key: 'amout',
      responsive: ['sm'],
    },
    {
      title: 'Ед. Измер.',
      dataIndex: 'unit',
      key: 'unit',
      responsive: ['sm'],
    },
  ];

  const onChange = (e: CheckboxChangeEvent) => {
    setChecked(e.target.checked);
  };
  const onChange1 = (e: CheckboxChangeEvent) => {
    setCheckedNewmaterial(e.target.checked);
  };
  const { searchedItemQuantity } = useTypedSelector(
    (state) => state.materialStore
  );
  const [dataSource, setDataSource] = useState(
    currentProjectTask.materialReuest
  );
  const [dataSourceNewMaterial, setDataSourceNewMaterial] = useState(
    currentProjectTask.newMaterial
  );

  const [disabled, setDisabled] = useState(false);
  const [editingStudent, setEditingStudent] = useState<IMatData1 | null>(null);
  const [editingNewMaterial, setEditingNewMaterial] =
    useState<IMatData1 | null>(null);
  const [checked, setChecked] = useState(false);
  const [checkedNewMaterial, setCheckedNewmaterial] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingNewMaterial, setIsEditingNewMaterial] = useState(false);
  const onAddStudent = () => {
    const randomNumber = 1;
    const newStudent: IMatData1 = {
      id: String(currentProjectTask.materialReuest.length + 1),
      code: 'CODE ' + randomNumber,
      PN: 'PN' + randomNumber,
      amout: 1,
      unit: 'Eд.',
      alternative: '-',
      nameOfMaterial: 'Описание',
      amtoss: currentProjectTask.taskId?.amtoss,
      taskNumber: currentProjectTask.taskId?.taskNumber,
    };
    setDataSource((pre: any) => {
      dispatch(
        setCurrentProjectTaskMaterialRequest([
          ...currentProjectTask.materialReuest,
          newStudent,
        ])
      );

      return [...pre, newStudent];
    });
  };
  const onAddNewMaterial = () => {
    const randomNumber = 1;
    const newMaterial: IMatData1 = {
      id: String(currentProjectTask.newMaterial.length + 1),
      code: 'CODE ' + randomNumber,
      PN: 'PN' + randomNumber,
      amout: 1,
      unit: 'Eд.',
      alternative: '-',
      nameOfMaterial: 'Описание',
      amtoss: currentProjectTask.taskId?.amtoss,
      taskNumber: currentProjectTask.taskId?.taskNumber,
    };
    setDataSourceNewMaterial((pre: any) => {
      dispatch(
        setCurrentProjectTaskNewMaterial([
          ...currentProjectTask.newMaterial,
          newMaterial,
        ])
      );

      return [...pre, newMaterial];
    });
  };
  const onDeleteStudent = (record: IMatData1) => {
    Modal.confirm({
      title: 'Вы уверены что хотите удалить запись?',
      okText: 'Да',
      cancelText: 'Отмена',
      okType: 'danger',
      onOk: () => {
        dispatch(
          setCurrentProjectTaskMaterialRequest(
            currentProjectTask.materialReuest.filter(
              (item: IMatData1) => item.id !== record.id
            ) || []
          )
        );
      },
      onCancel: () => {
        // setDataSource(currentProjectTask?.material);
        resetEditing();
      },
    });
  };
  const onDeleteNewMaterial = (record: IMatData1) => {
    Modal.confirm({
      title: 'Вы уверены что хотите удалить запись?',
      okText: 'Да',
      cancelText: 'Отмена',
      okType: 'danger',
      onOk: () => {
        dispatch(
          setCurrentProjectTaskNewMaterial(
            currentProjectTask.newMaterial.filter(
              (item: IMatData1) => item.id !== record.id
            ) || []
          )
        );
      },
      onCancel: () => {
        // setDataSource(currentProjectTask?.material);
        resetEditing();
      },
    });
  };

  const onEditStudent = (record: IMatData1) => {
    setIsEditing(true);
    setEditingStudent({ ...record });
    if (record.PN && record.PN !== 'НЕ РЕГЛАМЕНТИРУЕТСЯ') {
      dispatch(
        fetchTotalQuantity(
          String(record.PN || record.alternative)
            .trim()
            .toUpperCase()
        )
      );
    } else
      dispatch(
        fetchTotalQuantity(
          String(record.nameOfMaterial || record.alternative)
            .trim()
            .toUpperCase()
        )
      );
  };
  const onEditNewMaterial = (record: IMatData1) => {
    setIsEditingNewMaterial(true);
    setEditingNewMaterial({ ...record });
    if (record.PN && record.PN !== 'НЕ РЕГЛАМЕНТИРУЕТСЯ') {
      dispatch(
        fetchTotalQuantity(
          String(record.PN || record.alternative)
            .trim()
            .toUpperCase()
        )
      );
    } else
      dispatch(
        fetchTotalQuantity(
          String(record.nameOfMaterial || record.alternative)
            .trim()
            .toUpperCase()
        )
      );
  };
  const resetEditing = () => {
    setIsEditing(false);
    setEditingStudent(null);
    setIsEditingNewMaterial(false);
    setEditingNewMaterial(null);
    // dispatch(
    // setCurrentProjectTaskMaterialRequest(currentProjectTask.materialReuest);
    // );
  };
  const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `Материалы возможные к использованию`,
      children: (
        <div className="App">
          <header className="App-header">
            <Button className="my-2" onClick={onAddStudent}>
              Добавить материалы
            </Button>
            {
              <Table
                // bordered
                pagination={false}
                columns={columnsMat}
                size="small"
                scroll={{ y: 'calc(60vh)' }}
                rowClassName="cursor-pointer  text-xs text-transform: uppercase"
                dataSource={currentProjectTask.materialReuest}
              ></Table>
            }

            <p style={{ marginBottom: '20px' }}>
              <Checkbox
                checked={checked}
                disabled={disabled || localStorage.getItem('role') == 'boss'}
                onChange={onChange}
              >
                {label}
              </Checkbox>
            </p>
            <Button
              disabled={
                !checked ||
                localStorage.getItem('role') == 'boss' ||
                !currentProjectTask.materialReuest?.length
              }
              onClick={async () => {
                Modal.confirm({
                  title: 'Вы уверены что  хотите отправить заявку на склад?',
                  okText: 'Да',
                  cancelText: 'Отмена',
                  okType: 'danger',
                  onOk: async () => {
                    const result = await dispatch(
                      createProjectTaskMaterialAplication({
                        materials: currentProjectTask.materialReuest,
                        createDate: new Date(),
                        user: localStorage.getItem('name') || '',
                        userTelID: localStorage.getItem('telegramID') || '',
                        projectTaskId:
                          currentProjectTask._id || currentProjectTask.id || '',
                        projectTaskWO: currentProjectTask.projectTaskWO || null,
                        projectId: currentProject.id || '',
                        projectWO: currentProject.projectWO || null,
                        planeType: currentProject.aplicationId.planeType,
                        registrationNumber:
                          currentProject.aplicationId.planeNumber,
                        taskNumber: currentProjectTask.optional?.taskNumber,
                        status: 'отложена',
                        userId: currentProjectTask.ownerId,
                        editedAction: {
                          editedStoreMaterials: [],
                          purchaseStoreMaterials: [],
                          sing: '',
                        },
                      })
                    );
                    if (result.meta.requestStatus === 'fulfilled') {
                      const result = await dispatch(
                        updateProjectTask({
                          ...currentProjectTask,
                          id: currentProjectTask._id || currentProjectTask.id,
                        })
                      );
                      if (result.meta.requestStatus === 'fulfilled') {
                        toast.success('Заявка отправлена');
                        setOpen(false);
                        dispatch(setCurrentProjectTaskMaterialRequest([]));
                        dispatch(
                          getAllProjectTaskAplications(
                            currentProjectTask._id ||
                              currentProjectTask.id ||
                              ''
                          )
                        );
                        setAddButtonDisabled(false);
                      } else {
                        toast.error('Заявка не отправлена');
                        setAddButtonDisabled(false);
                      }
                      setChecked(false);
                      const result1 = await dispatch(
                        getAllProjectTaskAplications(
                          currentProjectTask?._id ||
                            currentProjectTask?.id ||
                            ''
                        )
                      );
                      setAddButtonDisabled(true);
                    }
                  },
                });
              }}
            >
              Создать заявку
            </Button>
            <Modal
              title="Редактировать
    "
              visible={isEditing}
              okText="Сохранить"
              onCancel={() => {
                resetEditing();
              }}
              onOk={() => {
                setDataSource((pre: any) => {
                  return pre.map((item: IMatData1) => {
                    if (item.id === editingStudent?.id) {
                      return editingStudent;
                    } else {
                      return item;
                    }
                  });
                });
                resetEditing();
              }}
            >
              <Form {...layout} style={{ maxWidth: 800 }}>
                <div className="uppercase my-1 flex flex-wrap text-l font-bold gap-1">
                  Наличие на складе{' '}
                  <Paragraph copyable>
                    {(editingStudent?.PN !== 'НЕ РЕГЛАМЕНТИРУЕТСЯ' &&
                      editingStudent?.PN) ||
                      editingStudent?.nameOfMaterial}
                  </Paragraph>
                  : {searchedItemQuantity[0]?.totalQuantity || 0}
                  {editingStudent?.unit}
                </div>

                <Form.Item label="Поиск">
                  <Input.Search
                    defaultValue={''}
                    allowClear
                    placeholder="Для поиска введите значение"
                    onSearch={(value) => {
                      value.length > 0 && setSearchIsVisible(true);
                      dispatch(fetchSameMaterials(value.trim()));
                    }}
                    onChange={(e) => {
                      setSerchedText(e.target.value.trim());
                      dispatch(fetchSameMaterials(inputSearchValue.trim()));
                    }}
                  />
                </Form.Item>
                <Divider></Divider>

                <Modal
                  title="Просмотр наличия на складе"
                  visible={searchIsVisible}
                  okText="Применить"
                  cancelText="Отмена"
                  footer={null}
                  onCancel={() => {
                    setSearchIsVisible(false);
                    dispatch(setInitialMaterial([]));
                    setSerchedText('');
                  }}
                  onOk={() => {
                    setSearchIsVisible(false);
                    dispatch(setInitialMaterial([]));

                    setSerchedText('');
                  }}
                  width={'60%'}
                >
                  <>{editingStudent?.PN}</>
                  {/* <Form.Item label="Поиск"> */}
                  <Input.Search
                    defaultValue={''}
                    allowClear
                    placeholder="Для поиска введите значение"
                    onSearch={(value) => {
                      value.length > 0 && setSearchIsVisible(true);
                      dispatch(fetchSameMaterials(inputSearchValue.trim()));
                    }}
                    onChange={(e) => {
                      setSerchedText(e.target.value.trim());
                      // dispatch(fetchSameMaterials(inputSearchValue.trim()));
                    }}
                  />
                  {/* </Form.Item> */}
                  <Table
                    size="small"
                    scroll={{ y: 'calc(60vh)' }}
                    rowClassName="cursor-pointer  text-xs text-transform: uppercase"
                    dataSource={isLoading ? [] : searchedSameItemsQuantity}
                    locale={{
                      emptyText: isLoading ? (
                        <Skeleton active={true} />
                      ) : (
                        <Empty />
                      ),
                    }}
                    columns={columnsMatStore}
                  ></Table>
                </Modal>

                <Form.Item label={t('CODE')}>
                  <Input
                    // disabled
                    value={editingStudent?.code}
                    allowClear
                    onChange={(e) => {
                      setEditingStudent((pre: any) => {
                        dispatch(
                          updateCurrentProjectTaskMaterialRequest({
                            id: pre.id - 1,
                            payload: { ...pre, code: e.target.value },
                          })
                        );
                        return { ...pre, code: e.target.value };
                      });
                    }}
                  />
                </Form.Item>
                <Form.Item label="PN">
                  <Input
                    // disabled
                    value={editingStudent?.PN}
                    required
                    allowClear
                    onChange={(e) => {
                      setEditingStudent((pre: any) => {
                        dispatch(
                          updateCurrentProjectTaskMaterialRequest({
                            id: pre.id - 1,
                            payload: { ...pre, PN: e.target.value },
                          })
                        );
                        return { ...pre, PN: e.target.value };
                      });
                    }}
                  />
                </Form.Item>
                <Form.Item label="Описание">
                  {' '}
                  <Input
                    // disabled

                    value={editingStudent?.nameOfMaterial}
                    allowClear
                    onChange={(e) => {
                      setEditingStudent((pre: any) => {
                        dispatch(
                          updateCurrentProjectTaskMaterialRequest({
                            id: pre.id - 1,
                            payload: {
                              ...pre,
                              nameOfMaterial: e.target.value,
                            },
                          })
                        );
                        return { ...pre, nameOfMaterial: e.target.value };
                      });
                    }}
                  />
                </Form.Item>
                <Form.Item label="Кол-во">
                  <Input
                    required
                    value={editingStudent?.amout}
                    allowClear
                    onChange={(e) => {
                      setEditingStudent((pre: any) => {
                        dispatch(
                          updateCurrentProjectTaskMaterialRequest({
                            id: pre.id - 1,
                            payload: { ...pre, amout: e.target.value },
                          })
                        );
                        return { ...pre, amout: e.target.value };
                      });
                    }}
                  />
                </Form.Item>
                <Form.Item label="Ед.езм">
                  <Input
                    value={editingStudent?.unit}
                    allowClear
                    onChange={(e) => {
                      setEditingStudent((pre: any) => {
                        dispatch(
                          updateCurrentProjectTaskMaterialRequest({
                            id: pre.id - 1,
                            payload: { ...pre, unit: e.target.value },
                          })
                        );
                        return { ...pre, unit: e.target.value };
                      });
                    }}
                  />
                </Form.Item>
              </Form>
            </Modal>
          </header>
        </div>
      ),
    },

    {
      key: '2',
      label: `Новая Заявка`,
      children: (
        <div className="App">
          <header className="App-header">
            <Button className="my-2" onClick={onAddNewMaterial}>
              Добавить материалы
            </Button>
            {
              <Table
                // bordered
                pagination={false}
                columns={columnsMatNewMaterial}
                size="small"
                scroll={{ y: 'calc(60vh)' }}
                rowClassName="cursor-pointer  text-xs text-transform: uppercase"
                dataSource={currentProjectTask.newMaterial}
              ></Table>
            }

            <p style={{ marginBottom: '20px' }}>
              <Checkbox
                checked={checked}
                disabled={disabled || localStorage.getItem('role') == 'boss'}
                onChange={onChange}
              >
                {label}
              </Checkbox>
            </p>
            <Button
              disabled={
                !checked ||
                localStorage.getItem('role') == 'boss' ||
                !currentProjectTask.newMaterial?.length
              }
              onClick={async () => {
                Modal.confirm({
                  title: 'Вы уверены что  хотите отправить заявку на склад?',
                  okText: 'Да',
                  cancelText: 'Отмена',
                  okType: 'danger',
                  onOk: async () => {
                    const result = await dispatch(
                      createProjectTaskMaterialAplication({
                        materials: currentProjectTask?.newMaterial || [],
                        createDate: new Date(),
                        user: localStorage.getItem('name') || '',
                        userTelID: localStorage.getItem('telegramID') || '',
                        projectTaskId:
                          currentProjectTask._id || currentProjectTask.id || '',
                        projectTaskWO: currentProjectTask.projectTaskWO || null,
                        projectId: currentProject.id || '',
                        projectWO: currentProject.projectWO || null,
                        planeType: currentProject.aplicationId.planeType,
                        registrationNumber:
                          currentProject.aplicationId.planeNumber,
                        taskNumber: currentProjectTask.optional?.taskNumber,
                        status: 'отложена',
                        userId: currentProjectTask.ownerId,
                        editedAction: {
                          editedStoreMaterials: [],
                          purchaseStoreMaterials: [],
                          sing: '',
                        },
                      })
                    );
                    if (result.meta.requestStatus === 'fulfilled') {
                      const result = await dispatch(
                        updateProjectTask({
                          ...currentProjectTask,
                          id: currentProjectTask._id || currentProjectTask.id,
                        })
                      );
                      if (result.meta.requestStatus === 'fulfilled') {
                        toast.success('Заявка отправлена');
                        setOpen(false);
                        dispatch(setCurrentProjectTaskNewMaterial([]));
                        dispatch(
                          getAllProjectTaskAplications(
                            currentProjectTask._id ||
                              currentProjectTask.id ||
                              ''
                          )
                        );
                        setAddButtonDisabled(false);
                      } else {
                        toast.error('Заявка не отправлена');
                        setAddButtonDisabled(false);
                      }
                      setChecked(false);
                      const result1 = await dispatch(
                        getAllProjectTaskAplications(
                          currentProjectTask?._id ||
                            currentProjectTask?.id ||
                            ''
                        )
                      );
                      setAddButtonDisabled(true);
                    }
                  },
                });
              }}
            >
              Создать заявку
            </Button>
            <Modal
              title="Редактировать
"
              visible={isEditingNewMaterial}
              okText="Сохранить"
              onCancel={() => {
                resetEditing();
              }}
              onOk={() => {
                setDataSourceNewMaterial((pre: any) => {
                  return pre.map((item: IMatData1) => {
                    if (item.id === editingNewMaterial?.id) {
                      return editingNewMaterial;
                    } else {
                      return item;
                    }
                  });
                });
                resetEditing();
              }}
            >
              <Form {...layout} style={{ maxWidth: 800 }}>
                <div className="uppercase my-1 flex flex-wrap text-l font-bold gap-1">
                  Наличие на складе{' '}
                  <Paragraph copyable>
                    {(editingNewMaterial?.PN !== 'НЕ РЕГЛАМЕНТИРУЕТСЯ' &&
                      editingNewMaterial?.PN) ||
                      editingNewMaterial?.nameOfMaterial}
                  </Paragraph>
                  : {searchedItemQuantity[0]?.totalQuantity || 0}
                  {editingNewMaterial?.unit}
                </div>

                <Form.Item label="Поиск">
                  <Input.Search
                    defaultValue={''}
                    allowClear
                    placeholder="Для поиска введите значение"
                    onSearch={(value) => {
                      value.length > 0 && setSearchIsVisible(true);
                      dispatch(fetchSameMaterials(value.trim()));
                    }}
                    onChange={(e) => {
                      setSerchedTextNewMaterial(e.target.value.trim());
                      dispatch(
                        fetchSameMaterials(inputSearchValueNewMaterial.trim())
                      );
                    }}
                  />
                </Form.Item>
                <Divider></Divider>

                <Modal
                  title="Просмотр наличия на складе"
                  visible={searchIsVisible}
                  okText="Применить"
                  cancelText="Отмена"
                  footer={null}
                  onCancel={() => {
                    setSearchIsVisible(false);
                    dispatch(setInitialMaterial([]));
                    setSerchedTextNewMaterial('');
                  }}
                  onOk={() => {
                    setSearchIsVisible(false);
                    dispatch(setInitialMaterial([]));

                    setSerchedTextNewMaterial('');
                  }}
                  width={'60%'}
                >
                  <>{editingNewMaterial?.PN}</>
                  {/* <Form.Item label="Поиск"> */}
                  <Input.Search
                    defaultValue={''}
                    allowClear
                    placeholder="Для поиска введите значение"
                    onSearch={(value) => {
                      value.length > 0 && setSearchIsVisible(true);
                      dispatch(
                        fetchSameMaterials(inputSearchValueNewMaterial.trim())
                      );
                    }}
                    onChange={(e) => {
                      setSerchedTextNewMaterial(e.target.value.trim());
                      // dispatch(fetchSameMaterials(inputSearchValue.trim()));
                    }}
                  />
                  {/* </Form.Item> */}
                  <Table
                    size="small"
                    scroll={{ y: 'calc(60vh)' }}
                    rowClassName="cursor-pointer  text-xs text-transform: uppercase"
                    dataSource={isLoading ? [] : searchedSameItemsQuantity}
                    locale={{
                      emptyText: isLoading ? (
                        <Skeleton active={true} />
                      ) : (
                        <Empty />
                      ),
                    }}
                    columns={columnsMatStore}
                  ></Table>
                </Modal>

                <Form.Item label={t('CODE')}>
                  <Input
                    // disabled
                    value={editingNewMaterial?.code}
                    allowClear
                    onChange={(e) => {
                      setEditingNewMaterial((pre: any) => {
                        dispatch(
                          updateCurrentProjectTaskNewMaterial({
                            id: pre.id - 1,
                            payload: { ...pre, code: e.target.value },
                          })
                        );
                        return { ...pre, code: e.target.value };
                      });
                    }}
                  />
                </Form.Item>
                <Form.Item label="PN">
                  <Input
                    // disabled
                    value={editingNewMaterial?.PN}
                    required
                    allowClear
                    onChange={(e) => {
                      setEditingNewMaterial((pre: any) => {
                        dispatch(
                          updateCurrentProjectTaskNewMaterial({
                            id: pre.id - 1,
                            payload: { ...pre, PN: e.target.value },
                          })
                        );
                        return { ...pre, PN: e.target.value };
                      });
                    }}
                  />
                </Form.Item>
                <Form.Item label="Описание">
                  {' '}
                  <Input
                    // disabled

                    value={editingNewMaterial?.nameOfMaterial}
                    allowClear
                    onChange={(e) => {
                      setEditingNewMaterial((pre: any) => {
                        dispatch(
                          updateCurrentProjectTaskNewMaterial({
                            id: pre.id - 1,
                            payload: {
                              ...pre,
                              nameOfMaterial: e.target.value,
                            },
                          })
                        );
                        return { ...pre, nameOfMaterial: e.target.value };
                      });
                    }}
                  />
                </Form.Item>
                <Form.Item label="Кол-во">
                  <Input
                    required
                    value={editingNewMaterial?.amout}
                    allowClear
                    onChange={(e) => {
                      setEditingNewMaterial((pre: any) => {
                        dispatch(
                          updateCurrentProjectTaskNewMaterial({
                            id: pre.id - 1,
                            payload: { ...pre, amout: e.target.value },
                          })
                        );
                        return { ...pre, amout: e.target.value };
                      });
                    }}
                  />
                </Form.Item>
                <Form.Item label="Ед.езм">
                  <Input
                    value={editingNewMaterial?.unit}
                    allowClear
                    onChange={(e) => {
                      setEditingNewMaterial((pre: any) => {
                        dispatch(
                          updateCurrentProjectTaskNewMaterial({
                            id: pre.id - 1,
                            payload: { ...pre, unit: e.target.value },
                          })
                        );
                        return { ...pre, unit: e.target.value };
                      });
                    }}
                  />
                </Form.Item>
              </Form>
            </Modal>
          </header>
        </div>
      ),
    },
    // {
    //   key: '3',
    //   label: `Заявки`,
    //   children: (
    //     <div className="gap-1 mx-auto justify-center flex-col">
    //       <Table
    //         size="small"
    //         scroll={{ y: 'calc(60vh)' }}
    //         rowClassName="cursor-pointer  text-xs text-transform: uppercase"
    //         columns={columnsAplications}
    //         dataSource={currentProjectTask.materialReuestAplications}
    //         // dataSource={dataSource}

    //         onRow={(record, rowIndex) => {
    //           return {
    //             onClick: async (event) => {
    //               setOpenMateialList(true);
    //               dispatch(
    //                 setCurrentProjectTaskMaterialRequestAplication(record)
    //               );
    //               // if (record.status == 'отложена') {
    //               //   dispatch(setCurrentMaterialAplicationStatus('в работе'));
    //               // }
    //             },
    //           };
    //         }}
    //       ></Table>
    //     </div>
    //   ),
    // },
    {
      key: '4',
      label: `Списанные материалы`,
      children: (
        <div className="gap-1 mx-auto justify-center flex-col">
          <Table
            pagination={false}
            bordered
            size="small"
            scroll={{ y: 'calc(60vh)' }}
            rowClassName="cursor-pointer  text-xs text-transform: uppercase"
            columns={columnsTasksMaterials}
            dataSource={currentProjectTask.taskPickSlipsMaterials}
            // dataSource={dataSource}
          ></Table>
        </div>
      ),
    },
  ];
  return (
    <div className="gap-1 mx-auto justify-center flex-col">
      <div className="flex gap-2 flex-wrap">
        <Button
          disabled={
            currentProjectTask.status == 'закрыт' ||
            localStorage.getItem('role') == 'boss'
          }
          size="small"
          type="primary"
          onClick={() => {
            setOpen(true);
          }}
        >
          Редактировать
        </Button>
        <Modal
          okButtonProps={{
            disabled: isLoading,
            //  ||
            // currentProjectTask.status == 'закрыт' ||
            // currentProjectTask.status == 'отложен',
          }}
          title="Редактирование WO"
          centered
          open={open}
          cancelText="отмена"
          okType={'default'}
          okText="Сохранить изменения"
          onOk={async () => {
            Modal.confirm({
              title: 'Вы уверены что хотите сохранить изменения?',
              okText: 'Да',
              cancelText: 'Отмена',
              okType: 'danger',
              onOk: async () => {
                const result = await dispatch(
                  updateProjectTask({
                    ...currentProjectTask,
                    id: currentProjectTask._id || currentProjectTask.id,
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  toast.success('Данные успешно обновлены');
                  dispatch(
                    featchFilteredTasksByProjectId({
                      projectId: currentProject.id || '',
                      filter: '',
                    })
                  );
                  dispatch(featchCountByStatus(currentProject.id || ''));
                  dispatch(setCurrentProjectTaskMaterialRequest(matRequest));
                  // setOpen(false);
                } else {
                  toast.error('Не удалось обновить проект');
                }
              },
              onCancel: () => {
                // setDataSource(currentProjectTask?.material);
                // resetEditing();
              },
            });
          }}
          onCancel={() => {
            setOpen(false);
          }}
          width={'70%'}
        >
          <WOFormChangeView currentDefault={1} taskData={currentProjectTask} />
        </Modal>
        <Button
          size="small"
          type="primary"
          disabled={
            currentProjectTask.status == 'в работе' ||
            currentProjectTask.status == 'выполнен' ||
            currentProjectTask.status == 'закрыт' ||
            localStorage.getItem('role') == 'boss'
          }
          onClick={async () => {
            Modal.confirm({
              title: 'Вы уверены что хотите отметить задачу начатой?',
              okText: 'Да',
              cancelText: 'Отмена',
              okType: 'danger',
              onOk: async () => {
                const result = await dispatch(
                  updateProjectTask({
                    ...currentProjectTask,
                    id: currentProjectTask._id || currentProjectTask.id,
                    status: 'в работе',
                    startDate: new Date(),

                    optional: {
                      ...currentProjectTask.optional,
                      isActive: true,
                      isDone: false,
                      isStarting: true,
                    },
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  toast.success('Данные успешно обновлены');
                  dispatch(
                    featchFilteredTasksByProjectId({
                      projectId: currentProject.id || '',
                      filter: '',
                    })
                  );
                  dispatch(featchCountByStatus(currentProject.id || ''));
                  dispatch(setCurrentProjectTaskMaterialRequest(matRequest));
                  setOpen(false);
                } else {
                  toast.error('Не удалось обновить проект');
                }
              },
              onCancel: () => {
                // setDataSource(currentProjectTask?.material);
                // resetEditing();
              },
            });
          }}
        >
          {currentProjectTask.status == 'в работе' ? (
            <>Задача в работе</>
          ) : (
            <>Отметить как начатую</>
          )}
        </Button>{' '}
        {/* <Button
          size="small"
          type="primary"
          disabled={
            currentProjectTask.status == 'отложен' ||
            localStorage.getItem('role') == 'boss' ||
            currentProjectTask.status == 'выполнен' ||
            currentProjectTask.status == 'закрыт'
          }
          onClick={async () => {
            Modal.confirm({
              title:
                'Вы уверены что хотите отметить задачу как выполненную? Дальнейшее редактирование станет невозможным',
              okText: 'Да',
              cancelText: 'Отмена',
              okType: 'danger',
              onOk: async () => {
                const result = await dispatch(
                  updateProjectTask({
                    ...currentProjectTask,
                    id: currentProjectTask._id || currentProjectTask.id,
                    status: 'выполнен',
                    finishDate: new Date(),

                    optional: {
                      ...currentProjectTask.optional,
                      isActive: false,
                      isDone: true,
                      isStarting: false,
                    },
                  })
                );
                if (result.meta.requestStatus === 'fulfilled') {
                  toast.success('Данные успешно обновлены');
                  dispatch(
                    featchFilteredTasksByProjectId({
                      projectId: currentProject.id || '',
                      filter: '',
                    })
                  );
                  dispatch(featchCountByStatus(currentProject.id || ''));
                  dispatch(setCurrentProjectTaskMaterialRequest(matRequest));
                  setOpen(false);
                } else {
                  toast.error('Не удалось обновить проект');
                }
              },
              onCancel: () => {
                // setDataSource(currentProjectTask?.material);
                // resetEditing();
              },
            });
          }}
        >
          {currentProjectTask.status == 'выполнен' ? (
            <>Задача выполнена</>
          ) : (
            <>Отметить как выполненную</>
          )}
        </Button> */}
        <Button
          size="small"
          type="primary"
          disabled={
            currentProjectTask.status == 'отложен' ||
            currentProjectTask.status == 'выполнен' ||
            currentProjectTask.status == 'закрыт' ||
            localStorage.getItem('role') == 'boss'
          }
          onClick={() => {
            dispatch(
              addAdditionalTask({
                projectWO: currentProjectTask.projectWO,
                projectTaskWO: currentProjectTask.projectTaskWO,
                editMode: true,
                status: 'отложен',
                createDate: new Date(),
                projectId: currentProjectTask?.projectId,
                projectTaskID: currentProjectTask._id || currentProjectTask.id,
                taskType: 'MAINT',
                plane: {
                  registrationNumber: currentProject.aplicationId.planeNumber,
                  companyName: currentProject.aplicationId.companyName,
                  type: currentProject.aplicationId?.planeType || '',
                },
                ownerId: currentProjectTask?.ownerId,
                taskHeadLine: `NRC-${
                  // currentAdditionalTask?.taskHeadLine ||
                  currentProjectTask.taskId?.taskNumber ||
                  currentProjectTask.optional?.taskNumber
                }`,

                taskDescription: currentAdditionalTask?.taskDescription || '',
                resourcesRequests: [],
                material: [],
                actions: [],
                isDoubleInspectionRequired: false,
                optional: currentAdditionalTask?.optional || {
                  isDone: false,
                  isActive: false,
                  sing: '',
                  isFavorite: false,
                  isStarting: false,
                },
                workStepReferencesLinks: [
                  {
                    type: 'WO',
                    reference: String(currentProjectTask?.projectTaskWO || ''),
                    description: 'TaskCard W/O',
                  },
                ],
                currentAction: {
                  actionDescription: '',
                  performedSing: '',
                  performedDate: '',
                  performedTime: '',
                  inspectedSing: undefined,
                  inspectedDate: undefined,
                  inspectedTime: undefined,
                  doubleInspectionSing: undefined,
                  doubleInspectedDate: undefined,
                  doubleInspectedTime: undefined,
                },
              })
            );
            setOpenNRC(true);
          }}
        >
          Открыть NRC
        </Button>
        <Button
          size={'small'}
          disabled={
            // currentProjectTask.status == 'отложен' ||
            // currentProjectTask.status == 'выполнен' ||
            // currentProjectTask.status == 'закрыт' ||
            localStorage.getItem('role') == 'boss'
          }
          type="primary"
          onClick={() => setOpenRec(true)}
        >
          Материалы
        </Button>
        <Modal
          okButtonProps={{
            disabled: isLoading || !checked || !addButtonDisabled,
            // !currentProjectTask.materialReuest.length,
          }}
          title="Заказ материалов "
          centered
          open={openRec}
          cancelText="отмена"
          okType={'default'}
          okText="Отправить Заявку"
          footer={null}
          onOk={async () => {
            Modal.confirm({
              title: 'Вы уверены что  хотите отправить заявку на склад?',
              okText: 'Да',
              cancelText: 'Отмена',
              okType: 'danger',
              onOk: async () => {
                if (addButtonDisabled) {
                }
              },
            });
          }}
          onCancel={() => {
            setOpenRec(false);
            setAddButtonDisabled(false);
            setChecked(false);
          }}
          width={'60%'}
        >
          <Tabs type="card" defaultActiveKey={'1'} items={items}></Tabs>
        </Modal>
        {/* <Button
          disabled={currentProjectTask.status == 'отложен'}
          size={'small'}
          type="primary"
          // className="ml-auto my-2"
          onClick={() => setOpenAplications(true)}
        >
          Просмотр заявок
        </Button> */}
        <Modal
          okButtonProps={{
            disabled:
              isLoading ||
              !currentAdditionalTask.taskHeadLine ||
              !currentAdditionalTask.taskDescription ||
              !currentAdditionalTask.optional?.sing ||
              !currentAdditionalTask.optional?.name,
          }}
          title="Открытие NRC"
          centered
          open={openNRC}
          cancelText="отмена"
          okType={'default'}
          okText="Открыть NRC"
          onOk={async () => {
            Modal.confirm({
              title:
                'Вы уверены что информация внесена верно? Хотите создать NRC?',
              okText: 'Да',
              cancelText: 'Отмена',
              okType: 'danger',
              onOk: async () => {
                const result = await dispatch(createNRC(currentAdditionalTask));
                if (result.meta.requestStatus === 'fulfilled') {
                  const result1 = await dispatch(
                    featchCountAdditionalByStatus(currentProject.id || '')
                  );
                  if (result.meta.requestStatus === 'fulfilled') {
                    await dispatch(
                      updateProjectTask({
                        ...currentProjectTask,
                        id: currentProjectTask._id || currentProjectTask.id,
                        workStepReferencesLinks: [
                          {
                            type: 'WO',
                            reference: String(
                              result.payload.additionalNumberId
                            ),
                            description: 'NRC W/O',
                          },
                          currentProjectTask.workStepReferencesLinks,
                        ].flat(10),
                      })
                    );
                    dispatch(
                      featchFilteredTasksByProjectId({
                        projectId: currentProject.id || '',
                        filter: '',
                      })
                    );

                    dispatch(setInitialTask(initialAdditionalTask));
                    toast.success('NRC Успешно создана');
                    setOpenNRC(false);
                  }

                  dispatch(setCurrentProjectTaskMaterialRequest(matRequest));
                } else {
                  toast.error('Не удалось создать NRC');
                }
              },
              onCancel: () => {
                // setDataSource(currentProjectTask?.material);
              },
            });
          }}
          onCancel={() => {
            setOpenNRC(false);
          }}
          width={'70%'}
        >
          <NRCADDForm currentDefault={1} taskData={currentAdditionalTask} />
        </Modal>
        <Modal
          okButtonProps={{}}
          title="Просмотр заявок"
          centered
          open={openAplications}
          cancelText="отмена"
          okType={'default'}
          // okText="Отправить Заявку"
          onOk={async () => {
            setOpenAplications(false);
          }}
          onCancel={() => setOpenAplications(false)}
          width={'60%'}
        >
          {' '}
          {
            <Table
              size="small"
              scroll={{ y: 'calc(60vh)' }}
              rowClassName="cursor-pointer  text-xs text-transform: uppercase"
              columns={columnsAplications}
              dataSource={currentProjectTask.materialReuestAplications}
              // dataSource={dataSource}

              onRow={(record, rowIndex) => {
                return {
                  onClick: async (event) => {
                    setOpenMateialList(true);
                    dispatch(
                      setCurrentProjectTaskMaterialRequestAplication(record)
                    );
                    // if (record.status == 'отложена') {
                    //   dispatch(setCurrentMaterialAplicationStatus('в работе'));
                    // }
                  },
                };
              }}
            ></Table>
          }
        </Modal>
        <Modal
          okButtonProps={{}}
          title="Список материалов"
          centered
          open={openMaterialList}
          cancelText="отмена"
          okType={'default'}
          // okText="Отправить Заявку"
          onOk={async () => {
            setOpenMateialList(false);
          }}
          onCancel={() => setOpenMateialList(false)}
          width={'60%'}
        >
          {' '}
          {
            <Table
              size="small"
              scroll={{ y: 'calc(60vh)' }}
              rowClassName="cursor-pointer  text-xs text-transform: uppercase"
              columns={columnsMaterial}
              dataSource={
                currentProjectTask.currentMaterialReuestAplication?.materials
              }
              // dataSource={dataSource}
            ></Table>
          }
        </Modal>
      </div>

      <TaskCardView />
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default WorkOrderView;
