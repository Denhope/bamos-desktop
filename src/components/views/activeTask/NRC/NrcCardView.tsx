import {
  Button,
  Descriptions,
  Divider,
  List,
  Modal,
  Table,
  Tabs,
  TabsProps,
} from "antd";
import Title from "antd/es/typography/Title";
import { ColumnsType } from "antd/lib/table";
import AdditionalPartRequest from "@/components/projectask/projectTaskForm/AdditionalPartRequest";
import JobDescriptionList from "@/components/projectask/projectTaskForm/JobDescriptionList";
import NRCEditForm from "@/components/views/activeTask/NRC/changeForm/NRCEditForm";

import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";

import moment from "moment";
import React, { FC, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  initialAdditionalTask,
  setCurrentActionIndex,
  setCurrentAdditionalTask,
  setCurrentAdditionalTaskMaterialRequest,
  setCurrentAdditionalTaskMaterialRequestAplication,
  setInitialTask,
} from "@/store/reducers/AdditionalTaskSlice";

import {
  createProjectTaskMaterialAplication,
  featchCountAdditionalByStatus,
  featchFilteredNRCProject,
  fetchTotalQuantity,
  getAllAdditionalTaskAplications,
  updateAdditionalTask,
} from "@/utils/api/thunks";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { IMatData1 } from "@/types/TypesData";
import { IProjectTaskAll } from "@/models/IProjectTask";
const columnsAplications: ColumnsType<any> = [
  {
    title: <p className=" my-0 py-0">Номер Заявки</p>,
    dataIndex: "materialAplicationNumber",
    key: "materialAplicationNumber",
    responsive: ["sm"],
  },

  {
    title: <p className="text- my-0 py-0">Заказчик</p>,
    dataIndex: "user",
    key: "user",
    responsive: ["sm"],
  },
  {
    title: "Дата создания",
    dataIndex: "createDate",
    key: "createDate",
    responsive: ["sm"],
    render(text: Date) {
      return moment(text).format("Do MMM  YYYY, HH:mm");
    },
  },
  {
    title: "Статус",
    dataIndex: "status",
    key: "status",
    responsive: ["sm"],
  },
];

const NRCCardView: FC = () => {
  const [openAplications, setOpenAplications] = useState(false);

  const dispatch = useAppDispatch();
  const { routineTasks, additionalTasks, hardTimeTasks } = useTypedSelector(
    (state) => state.application.currentAplication
  );
  const { currentAdditionalTask, isLoading } = useTypedSelector(
    (state) => state.additioonalTasks
  );
  const { currentProject } = useTypedSelector((state) => state.projects);

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openMaterial, setOpenMaterial] = useState(false);
  const [editingStudent, setEditingStudent] = useState<IMatData1 | null>(null);
  const onEditStudent = (record: IMatData1) => {
    setIsEditing(true);
    setEditingStudent({ ...record });
    if (record.PN && record.PN !== "НЕ РЕГЛАМЕНТИРУЕТСЯ") {
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
    // dispatch(
    // setCurrentProjectTaskMaterialRequest(currentProjectTask.materialReuest);
    // );
  };
  const onDeleteStudent = (record: IMatData1) => {
    Modal.confirm({
      title: "Вы уверены что хотите удалить запись?",
      okText: "Да",
      cancelText: "Отмена",
      okType: "danger",
      onOk: () => {
        dispatch(
          setCurrentAdditionalTaskMaterialRequest(
            currentAdditionalTask.material.filter(
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

  const columnsMat: ColumnsType<any> = [
    {
      title: "P/N",
      dataIndex: "PN",
      key: "PN",
      responsive: ["sm"],
      // render: (record) => {
      //   return <Paragraph copyable>{record}</Paragraph>;
      // },
    },

    {
      title: <p className="text- my-0 py-0">Наименование</p>,
      dataIndex: "nameOfMaterial",
      key: "nameOfMaterial",
      responsive: ["sm"],
    },

    {
      title: "Кол-во",
      dataIndex: "amout",
      key: "amout",
      responsive: ["sm"],
    },
    {
      title: "Ед. Измер.",
      dataIndex: "unit",
      key: "unit",
      responsive: ["sm"],
    },
    {
      key: "5",
      title: "Удалить",
      render: (record: any) => {
        return (
          <>
            {/* <EditOutlined
              onClick={() => {
                onEditStudent(record);
              }}
            /> */}
            <DeleteOutlined
              onClick={() => {
                onDeleteStudent(record);
              }}
              style={{ color: "red", marginLeft: 12 }}
            />
          </>
        );
      },
    },
  ];

  const columnsMaterial: ColumnsType<any> = [
    { title: "P/N", dataIndex: "PN", key: "PN", responsive: ["sm"] },

    {
      title: <p className="text- my-0 py-0">Наименование</p>,
      dataIndex: "nameOfMaterial",
      key: "nameOfMaterial",
      responsive: ["sm"],
    },
    {
      title: "Альтернатива",
      dataIndex: "alternative",
      key: "alternative",
      responsive: ["sm"],
    },
    {
      title: "Кол-во",
      dataIndex: "amout",
      key: "amout",
      responsive: ["sm"],
    },
    {
      title: "Ед. Измер.",
      dataIndex: "unit",
      key: "unit",
      responsive: ["sm"],
    },
  ];
  const columnsTasksMaterials: ColumnsType<any> = [
    {
      title: <p className=" my-0 py-0">PN</p>,
      dataIndex: "PN",
      key: "PN",
      responsive: ["sm"],
    },

    {
      title: <p className="text- my-0 py-0">Описание</p>,
      dataIndex: "description",
      key: "description",
      width: "20%",
      responsive: ["sm"],
    },
    {
      title: "Количество",
      dataIndex: "quantity",
      key: "quantity",
      width: "7%",
      responsive: ["sm"],
    },
    {
      title: "Ед. Изм",
      dataIndex: "unit",
      key: "unit",
      width: "5%",
      responsive: ["sm"],
    },
    {
      title: <p className=" my-0 py-0">Получил</p>,
      dataIndex: "recipient",
      key: "recipient",
      responsive: ["sm"],
    },
    {
      title: <p className=" my-0 py-0">Дата </p>,
      dataIndex: "closeDate",
      key: "closeDate",
      render(text: Date) {
        return moment(text).format("DD.MM.YYYY, HH:mm");
      },
      width: "10%",
      responsive: ["sm"],
    },
    {
      title: <p className=" my-0 py-0">Номер Требования</p>,
      dataIndex: "pickSlipNumber",
      key: "pickSlipNumber",
      width: "8%",
      responsive: ["sm"],
    },

    {
      title: <p className=" my-0 py-0">Номер Партии</p>,
      dataIndex: "batch",
      key: "batch",
      responsive: ["sm"],
    },
    {
      title: <p className=" my-0 py-0">Серийный номер</p>,
      dataIndex: "batchId",
      key: "batchId",
      responsive: ["sm"],
    },
  ];
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Материалы возможные к использованию`,
      children: (
        <>
          {" "}
          <Table
            // bordered
            pagination={false}
            columns={columnsMat}
            size="small"
            scroll={{ y: "calc(60vh)" }}
            rowClassName="cursor-pointer  text-xs text-transform: uppercase"
            dataSource={currentAdditionalTask.material}
          ></Table>
        </>
      ),
    },
    {
      key: "2",
      label: `Новая заявка`,
      children: <></>,
    },
    {
      key: "3",
      label: `Списанные материалы`,
      children: (
        <div className="gap-1 mx-auto justify-center flex-col">
          <Table
            pagination={false}
            bordered
            size="small"
            scroll={{ y: "calc(60vh)" }}
            rowClassName="cursor-pointer  text-xs text-transform: uppercase"
            columns={columnsTasksMaterials}
            dataSource={currentAdditionalTask.taskPickSlipsMaterials}
            // dataSource={dataSource}
          ></Table>
        </div>
      ),
    },
  ];
  const [openMaterialList, setOpenMateialList] = useState(false);
  return (
    <div className="flex gap-2 mx-auto justify-center flex-col">
      <div className="flex gap-2 flex-wrap">
        <Button
          size="small"
          type="primary"
          onClick={() => {
            dispatch(setCurrentAdditionalTask(currentAdditionalTask));
            setOpen(true);
          }}
        >
          Редактировать
        </Button>
        <Button
          size="small"
          type="primary"
          disabled={
            currentAdditionalTask.status == "в работе" ||
            currentAdditionalTask.status == "выполнен" ||
            currentAdditionalTask.status == "закрыт" ||
            localStorage.getItem("role") == "boss"
          }
          onClick={async () => {
            Modal.confirm({
              title: "Вы уверены что хотите отметить задачу начатой?",
              okText: "Да",
              cancelText: "Отмена",
              okType: "danger",
              onOk: async () => {
                const result = await dispatch(
                  updateAdditionalTask({
                    ...currentAdditionalTask,
                    _id: currentAdditionalTask._id || currentAdditionalTask.id,
                    status: "в работе",
                  })
                );
                if (result.meta.requestStatus === "fulfilled") {
                  toast.success("Данные успешно загружены");
                  // setOpen(false);
                  dispatch(
                    featchFilteredNRCProject({
                      projectId: currentProject.id || "",
                    })
                  );
                  dispatch(
                    featchCountAdditionalByStatus(
                      currentAdditionalTask.projectId || ""
                    )
                  );
                } else {
                  toast.error("Не удалось обновить NRC");
                }
              },
              onCancel: () => {
                // setDataSource(currentProjectTask?.material);
                // resetEditing();
              },
            });
          }}
        >
          {currentAdditionalTask.status == "в работе" ? (
            <>Задача в работе</>
          ) : (
            <>Отметить как начатую</>
          )}
        </Button>{" "}
        <Button
          size={"small"}
          // disabled={
          //   currentAdditionalTask.status == 'отложен' ||
          //   currentAdditionalTask.status == 'выполнен' ||
          //   currentAdditionalTask.status == 'закрыт' ||
          //   localStorage.getItem('role') == 'boss' ||
          //   !currentAdditionalTask.material?.length
          // }
          type="primary"
          onClick={() => {
            setOpenMaterial(true);
          }}
        >
          Материалы
        </Button>
        <Modal
          okButtonProps={{
            disabled: isLoading || !currentAdditionalTask.material.length,
          }}
          title="Заказ расходных материалов"
          centered
          open={openMaterial}
          cancelText="отмена"
          okType={"default"}
          okText="Отправить Заявку"
          // footer={null}
          onOk={async () => {
            Modal.confirm({
              title: "Вы уверены что  хотите отправить заявку на склад?",
              okText: "Да",
              cancelText: "Отмена",
              okType: "danger",
              onOk: async () => {
                // if (addButtonDisabled) {
                const result = await dispatch(
                  createProjectTaskMaterialAplication({
                    materials: currentAdditionalTask.material || [],
                    additionalTaskId:
                      currentAdditionalTask.additionalNumberId || null,
                    createDate: new Date(),
                    user: localStorage.getItem("name") || "",
                    userTelID: localStorage.getItem("telegramID") || "",
                    //   projectTaskId:
                    //     currentProjectTask._id || currentProjectTask.id || '',
                    projectTaskWO:
                      currentAdditionalTask.additionalNumberId || null,
                    projectId: currentProject.id || "",
                    projectWO: currentProject.projectWO || null,
                    planeType: currentAdditionalTask.plane?.type,
                    registrationNumber:
                      currentAdditionalTask.plane?.registrationNumber,
                    // taskNumber: currentProjectTask.taskId?.taskNumber,
                    status: "отложена",
                    userId: currentAdditionalTask.ownerId,
                    editedAction: {
                      editedStoreMaterials: [],
                      purchaseStoreMaterials: [],
                      sing: "",
                    },
                    projectTaskId:
                      currentAdditionalTask._id || currentAdditionalTask.id,
                    taskNumber: currentAdditionalTask?.taskHeadLine,
                  })
                );
                if (result.meta.requestStatus === "fulfilled") {
                  toast.success("Заявка успешно отправлена");
                  dispatch(
                    getAllAdditionalTaskAplications(
                      currentAdditionalTask?._id ||
                        currentAdditionalTask?.id ||
                        ""
                    )
                  );

                  setOpenMaterial(false);
                } else {
                  toast.error("Не удалось создать заявку");
                }
                // }
              },
            });
          }}
          onCancel={() => {
            setOpenMaterial(false);
            // setAddButtonDisabled(false);
            // setChecked(false);
          }}
          width={"70%"}
        >
          {" "}
          <Tabs type="card" defaultActiveKey={"1"} items={items}></Tabs>
        </Modal>
        {/* <Button
          size="small"
          type="primary"
          onClick={() => {
            // setOpenMaterial(true);
            setOpenAplications(true);
          }}
        >
          Просмотр заявок
        </Button> */}
        <Modal
          okButtonProps={{}}
          title="Просмотр заявок"
          centered
          open={openAplications}
          cancelText="отмена"
          okType={"default"}
          // okText="Отправить Заявку"
          onOk={async () => {
            setOpenAplications(false);
          }}
          onCancel={() => setOpenAplications(false)}
          width={"60%"}
        >
          {" "}
          {
            <Table
              size="small"
              scroll={{ y: "calc(60vh)" }}
              rowClassName="cursor-pointer  text-xs text-transform: uppercase"
              columns={columnsAplications}
              dataSource={currentAdditionalTask.materialAplications}
              // dataSource={dataSource}

              onRow={(record, rowIndex) => {
                return {
                  onClick: async (event) => {
                    setOpenMateialList(true);
                    dispatch(
                      setCurrentAdditionalTaskMaterialRequestAplication(record)
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
          okType={"default"}
          // okText="Отправить Заявку"
          onOk={async () => {
            setOpenMateialList(false);
          }}
          onCancel={() => setOpenMateialList(false)}
          width={"60%"}
        >
          {" "}
          {
            <Table
              size="small"
              scroll={{ y: "calc(60vh)" }}
              rowClassName="cursor-pointer  text-xs text-transform: uppercase"
              columns={columnsMaterial}
              dataSource={
                currentAdditionalTask.currentMaterialReuestAplication?.materials
              }
              // dataSource={dataSource}
            ></Table>
          }
        </Modal>
      </div>
      <div className="flex p-3 flex-col gap-1 justify-items-center mx-auto border-8 border-indigo-600  h-[70vh] bg-slate-50 overflow-scroll">
        <Descriptions
          size="small"
          column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 2 }}
        >
          <Descriptions.Item label="Taskcard / Задача №">
            <p className="text-sm  font-semibold my-0">
              {currentAdditionalTask.taskHeadLine}
            </p>
          </Descriptions.Item>
          <Descriptions.Item>
            <p className="text-sm mt-0">
              {/* {String(currentAdditionalTask.taskDescription)} */}
            </p>
          </Descriptions.Item>

          <Descriptions.Item label="Check / Форма ТО">
            {currentProject.aplicationId.serviceType}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <p className="text-l text-center my-0">
                A/C Registration / Рег. Номер ВС
              </p>
            }
          >
            <p className="text-l text-center font-semibold my-0">
              {currentAdditionalTask.plane?.registrationNumber}
            </p>
          </Descriptions.Item>
          <Descriptions.Item label="A/C Type / Тип ВС">
            {currentAdditionalTask.plane?.type}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <p className="text-l text-center my-0">Workorder / Заказ №</p>
            }
          >
            <p className="text-l text-center font-semibold my-0">
              {String(currentAdditionalTask.additionalNumberId)}
            </p>
          </Descriptions.Item>
          <Descriptions.Item
            label={<p className="text-l text-center my-0">Пакет</p>}
          >
            <p className="font-semibold align-middle my-0">
              {currentProject.projectName}
            </p>
          </Descriptions.Item>

          {/* <Descriptions.Item label="Interval /Интервал">
          {currentProjectTask.taskId?.workInterval}
        </Descriptions.Item> */}
        </Descriptions>

        <Divider className="my-0"></Divider>
        {/* <Title className="my-0" level={5}>
        {currentAdditionalTask.taskDescription}
      </Title> */}
        <Descriptions
          size="small"
          column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item
          // label={<p className="text-xl text-center my-0">NRC Description</p>}
          >
            <p className="text-sm  font-semibold my-0 uppercase">
              {currentAdditionalTask.taskDescription}
            </p>
          </Descriptions.Item>
          <Descriptions.Item label="Zones / Зона">
            {
              <div className="flex flex-col">
                {/* <List> */}
                {/* {filteredZones.map((item) => (
                  <li className="">
                    {item.zone} - {item.description}
                  </li>
                ))} */}
                {/* </List> */}
              </div>
            }
            {/* {currentProjectTask.taskId?.area} */}
          </Descriptions.Item>
          <Descriptions.Item label="Panels / Панели доступа">
            {
              <div className="flex flex-col">
                {/* <List> */}
                {/* {filteredPanels.map((item) => (
                  <li className="">
                    {item.panel} - {item.description}
                  </li>
                ))} */}
                {/* </List> */}
                <div>
                  {/* {notFilteredPanels.map((item) => (
                  <div className="inline ">{item.access}, </div>
                ))} */}
                </div>
              </div>
            }
          </Descriptions.Item>
          <Descriptions.Item label="References / Ссылки">
            <List>
              <div>
                {currentAdditionalTask.workStepReferencesLinks.map((item) => (
                  <li>
                    {item.type}-{item.reference}
                    {item.description && ` - ${item.description}`}
                  </li>
                ))}
              </div>
            </List>
          </Descriptions.Item>
        </Descriptions>
        <Divider className="my-0"></Divider>
        {/* <Title className="my-0" level={5}>
          Part, mateial Requests / Необходимые компоненты, Оборудование
        </Title>
        <AdditionalPartRequest data={currentAdditionalTask.material || []} /> */}

        {/* <Divider className="my-0"></Divider> */}
        <JobDescriptionList data={currentAdditionalTask.actions} />
        {/* <Divider className="my-0"></Divider> */}
        {/* <Descriptions
          className=" my-0 py-0"
          layout="vertical"
          size="small"
          title={
            <div className="flex justify-between">
              Times used / Фактические трудозатраты
            </div>
          }
          bordered
          column={{ xxl: 6, xl: 6, lg: 3, md: 2, sm: 1, xs: 1 }}
        >
          <Descriptions.Item
            label="Perfomed / 
            Исполнитель"
          >
            <>NA</>
          </Descriptions.Item> */}
        {/* <Descriptions.Item
            label="Inspected / 
            Контроллер"
          >
            <>NA</>
          </Descriptions.Item>
          <Descriptions.Item
            label="D/Inspected / 
            Контроллер"
          >
            <>NA</>
          </Descriptions.Item> */}
        {/* </Descriptions> */}

        {/* <Descriptions
          className="w-full mt-2 py-0"
          layout="vertical"
          size="small"
          title="Work Performed / Работа выполнена Заказ закрыт"
          bordered
          column={{ xxl: 4, xl: 4, lg: 4, md: 2, sm: 2, xs: 2 }}
        >
          <Descriptions.Item label="Date(UTC) Time / Дата Время(UTC)">
            {(currentAdditionalTask.optional?.finalAction?.closingDate &&
              moment(currentAdditionalTask.finishDate).format(
                'Do MMM  YYYY'
              )) ||
              null}
          </Descriptions.Item> */}
        {/* <Descriptions.Item label="Place / Station Место / Станция">
            MSQ
          </Descriptions.Item> */}
        {/* <Descriptions.Item label="Closing Sign / Stamp Закрыл"> */}
        {/* <p className="h-2">
          {currentAdditionalTask.optional?.finalAction?.closingName &&
            `${currentAdditionalTask.optional?.finalAction?.closingName}(${currentAdditionalTask.optional?.finalAction?.closingSing})`}
        </p> */}
        {/* </Descriptions.Item> */}
        {/* <Descriptions.Item label="Double Inspection / Двойной контроль">
            <p className="h-2">
              {currentAdditionalTask.optional?.finalAction?.DIClosingSing}
            </p>
          </Descriptions.Item> */}
        {/* </Descriptions> */}
        {/* <Descriptions
        size="small"
        layout="vertical"
        bordered
        column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
      >
        <Descriptions.Item
          label={
            <div className="flex justify-between my-0 py-0">
              <p className="my-0  border-4">
                Released To Service / Допуск к эксплуатации
              </p>
            </div>
          }
        >
          <p className="text-sm py-0 my-0">
            CRS for the work caried out, either for single workorder or for the
            complete workpack, to be issued in Aircraft Technical Logbook - for
            line maintenance or in MRO CRS Form - for base maintenance.
            Свидетельство о ТО ВС (единичный заказ или весь пакет) должно быть
            оформлено для Оперативного ТО - в Бортовом Журнале, для
            Периодического ТО - на бланке Свидетельства о ТО ВС Организации по
            ТО.
          </p>
        </Descriptions.Item>
      </Descriptions> */}
        <Modal
          okButtonProps={{
            disabled: isLoading,
            // ||
            // currentAdditionalTask.status == 'закрыт' ||
            // currentAdditionalTask.status == 'отложен',
          }}
          title="Редактирование NRC"
          centered
          open={open}
          cancelText="отмена"
          okType={"default"}
          okText="Сохранить изменения"
          onOk={async () => {
            Modal.confirm({
              title: "Вы уверены что хотите сохранить изменения?",
              okText: "Да",
              cancelText: "Отмена",
              okType: "danger",
              onOk: async () => {
                const result = await dispatch(
                  updateAdditionalTask({
                    _id: currentAdditionalTask._id || currentAdditionalTask.id,
                    projectId: currentAdditionalTask.projectId,
                    actions: currentAdditionalTask.actions,
                    resourcesRequests: currentAdditionalTask.resourcesRequests,
                    isDoubleInspectionRequired:
                      currentAdditionalTask.isDoubleInspectionRequired,
                    workStepReferencesLinks:
                      currentAdditionalTask.workStepReferencesLinks,
                    finishDate: currentAdditionalTask.finishDate,
                    instrument: currentAdditionalTask.instrument,
                    material: currentAdditionalTask.material,
                    optional: currentAdditionalTask.optional,
                    status: currentAdditionalTask.status,
                    taskHeadLine: currentAdditionalTask.taskHeadLine,
                    taskDescription: currentAdditionalTask.taskDescription,
                    additionalNumberId:
                      currentAdditionalTask.additionalNumberId,
                  })
                );
                if (result.meta.requestStatus === "fulfilled") {
                  toast.success("Данные успешно загружены");
                  // setOpen(false);
                  dispatch(
                    featchFilteredNRCProject({
                      projectId: currentProject.id || "",
                    })
                  );
                  dispatch(
                    featchCountAdditionalByStatus(
                      currentAdditionalTask.projectId || ""
                    )
                  );
                } else {
                  toast.error("Не удалось обновить NRC");
                }
              },
            });
            dispatch(setCurrentAdditionalTask(currentAdditionalTask));
          }}
          onCancel={() => {
            setOpen(false);
          }}
          width={"70%"}
        >
          <NRCEditForm currentDefault={3} taskData={currentAdditionalTask} />
        </Modal>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    </div>
  );
};

export default NRCCardView;
