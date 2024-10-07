//@ts-nocheck

import { Button, DatePicker, Form, Input } from "antd";
import { IProjectInfo } from "@/models/IProject";
import React, { FC, useState } from "react";

import {
  setCurrentProject,
  setOptional,
  setProjectStart,
  updateProjectName,
  updateStartTime,
  updatefinishDate,
  setEditedMode,
} from "@/store/reducers/ProjectSlise";
import moment from "moment";
import { useAppDispatch, useTypedSelector } from "@/hooks/useTypedSelector";
import {
  createProjectTask,
  featchAllTasksByProjectId,
} from "@/utils/api/thunks";
import {
  includeTasks,
  compareArrays,
  notIncludeTasks,
} from "@/services/utilites";
import toast, { Toaster } from "react-hot-toast";
import { setIsLoading } from "@/store/reducers/ProjectTaskSlise";
import { useNavigate } from "react-router-dom";
import { RouteNames } from "@/router";
import { IReferencesLinkType } from "@/models/IAdditionalTask";
import { ITaskType, ITaskTypeUpdate } from "@/types/TypesData";

export type IprojectPropsType = { project: IProjectInfo };

const ProjectForm: FC<IprojectPropsType> = ({ project }) => {
  const [disabled, setDisabled] = useState(false);
  const dispatch = useAppDispatch();
  const { currentProject } = useTypedSelector((state) => state.projects);
  const { isLoading, ProjectsTask } = useTypedSelector(
    (state) => state.projectTask
  );
  const initialForm = {
    projectName: project.projectName,
    createDate: moment(project.createDate).format("Do MMM  YYYY, h:mm:a"),
    type: project.aplicationId.planeType || "",
    fuctureNumber: project.aplicationId.planeNumber || "",
    companyName: project.aplicationId.companyName || "",
    // planedStartDate:
    //   moment(project.planedStartDate) ||
    //   moment(new Date()).format('dddd, MMMM Do YYYY'),
    // planeFinishDate: dayjs(project.planedFinishDate, dateFormat),
    startDate: moment(project.startDate).format("Do MMM  YYYY, h:mm:a" || null),

    finishDate: moment(project.finishDate).format("dDo MMM  YYYY, h:mm:a"),
    user: String(localStorage.getItem("name")) || "",
    status: project.status,
  };
  const { routineTasks, additionalTasks, hardTimeTasks } = useTypedSelector(
    (state) => state.projects.currentProject.aplicationId
  );
  const { allTasks } = useTypedSelector((state) => state.tasks);
  const allTasksDTO = [...routineTasks, ...additionalTasks, ...hardTimeTasks];

  const filteredRoutineItems = includeTasks(allTasks, routineTasks);
  const filteredAdditionalItems = includeTasks(allTasks, additionalTasks);
  const filteredHardTimesItems = includeTasks(allTasks, hardTimeTasks);

  const history = useNavigate();
  const notFoundedRoutineTasks = notIncludeTasks(
    filteredRoutineItems,
    routineTasks
  );

  const notFoundedAdditionalTasks = notIncludeTasks(
    filteredAdditionalItems,
    additionalTasks
  );
  const notFoundedHardTimesTasks = notIncludeTasks(
    filteredHardTimesItems,
    hardTimeTasks
  );

  const allCheackTasks = [
    ...filteredRoutineItems,
    ...filteredAdditionalItems,
    ...filteredHardTimesItems,
  ];
  const notFoundedAlllTasks = notIncludeTasks(allCheackTasks, allTasksDTO);
  const updatedFilteredRoutineTasks = compareArrays(
    filteredRoutineItems,
    routineTasks
  );

  const updatedfilteredAdditionalTasks = compareArrays(
    filteredAdditionalItems,
    additionalTasks
  );
  const updatedfilteredHardTimesTasks = compareArrays(
    filteredHardTimesItems,
    hardTimeTasks
  );

  const [disabledButton, setDisabledButton] = useState(false);
  return (
    <div>
      <Form
        initialValues={initialForm}
        autoComplete="off"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
        onFinish={(values: IProjectInfo) => {
          dispatch(updateProjectName(values.projectName));
        }}
        onFinishFailed={(error: any) => {
          console.log({ error });
        }}
      >
        <Form.Item name="projectName" label="Название проекта">
          <Input disabled={!disabled} />
        </Form.Item>
        <Form.Item name="createDate" label="Дата создания">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Тип ВС" name="type">
          <Input disabled></Input>
        </Form.Item>
        <Form.Item name="fuctureNumber" label="Заводской номер">
          <Input disabled />
        </Form.Item>
        <Form.Item name="companyName" label="Компания">
          <Input disabled />
        </Form.Item>

        {/* <Form.Item name="planedStartDate" label="Планируемая дата начала работ">
          <DatePicker disabled={!disabled} />
        </Form.Item> */}

        {/* <Form.Item
          name="planedFinishDate"
          label="Планируемая дата завершения работ"
        >
          <DatePicker disabled={!disabled} />
        </Form.Item> */}
        <Form.Item name="startDate" label="Дата начала">
          <Input disabled />
        </Form.Item>
        <Form.Item name="finishDate" label="Дата завершения работ">
          <Input disabled />
        </Form.Item>
        <Form.Item name="status" label="Статус">
          <Input disabled />
        </Form.Item>
        <Form.Item name="user" label="Пользователь">
          <Input disabled />
        </Form.Item>

        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 8 }}
          onFinish={() => {}}
        >
          <div className="flex justify-center gap-1 flex-wrap">
            {project.optional?.isRoutineTaskCreated ? (
              <Form.Item hasFeedback validateStatus="success">
                <Input
                  disabled
                  style={{ width: "220px" }}
                  defaultValue={"Пакет рутинных работ  создан"}
                ></Input>
              </Form.Item>
            ) : (
              <Form.Item>
                <Button
                  disabled={!disabled}
                  loading={isLoading}
                  onClick={() => {
                    dispatch(setIsLoading(true));
                    notFoundedRoutineTasks.forEach(async (task) => {
                      const resultNotFounded = await dispatch(
                        createProjectTask({
                          projectId: currentProject.id || "",
                          taskType: "routine",
                          createDate: new Date(),
                          ownerId: currentProject.aplicationId.ownerId,
                          optional: {
                            amtoss: task.amtoss,
                            MJSSNumber: task.id,
                            WOCustomer: task.WOCustomer,
                            WOPackageType: task.WOPackageType,
                            taskNumber: task.taskNumber,
                            position: task.position,
                            taskDescription: task.taskDescription,
                            isActive: false,
                            isDone: false,
                            isFavorite: false,
                            isStarting: false,
                          },
                          status: "отложен",
                          _id: "",
                          actions: [
                            {
                              actionDescription: `ВЫПОЛНЕНО: \r\n ${
                                task.taskDescription
                                //   ?.replace(
                                //   /ДОСТУП ПРИМЕЧАНИЕ:.+/,
                                //   ''.replace(/ДОСТУП:.+/, '')
                                // )
                                // }\nв соответствии с:\nAMM-${task.amtoss}`,
                              }\nв соответствии с:${task.amtoss}`,
                            },
                          ],
                          projectTaskNRSs: [],

                          workStepReferencesLinks: [
                            {
                              type: "WO",
                              reference: task.WOCustomer || "",
                              description: "Customer WO / WO Заказчика",
                            },
                            {
                              type: "WO",
                              reference: String(currentProject.projectWO) || "",
                              description: "Local WO / Внутренний WO",
                            },
                          ],
                          materialReuest: [],
                          materialReuestAplications: [],
                          plane: {
                            registrationNumber:
                              currentProject.aplicationId.planeNumber,
                            type: currentProject.aplicationId.planeType || "",
                            companyName:
                              currentProject.aplicationId.companyName,
                          },
                          projectWO: currentProject.projectWO,
                          newMaterial: [],
                        })
                      );
                    });

                    updatedFilteredRoutineTasks &&
                      updatedFilteredRoutineTasks.forEach(async (task) => {
                        let refArr = task.ammtossArrNew?.map(
                          (item: string): IReferencesLinkType =>
                            ({
                              type: "AMM",
                              reference: item,
                              description: "",
                            } || [])
                        );

                        const result = await dispatch(
                          createProjectTask({
                            taskId: task.id,
                            projectId: currentProject.id || "",
                            taskType: "routine",
                            createDate: new Date(),
                            ownerId: currentProject.aplicationId.ownerId,
                            optional: {
                              amtoss: task.amtoss,
                              MJSSNumber: task.MJSSNumber,
                              WOCustomer: task.WOCustomer,
                              WOPackageType: task.WOPackageType,
                              position: task.position,
                              taskNumber: task.taskNumber,
                              taskDescription: task.taskDescription,
                              isActive: false,
                              isDone: false,
                              isFavorite: false,
                              isStarting: false,
                            },
                            status: "отложен",
                            _id: "",
                            name: String(localStorage.getItem("name")),
                            sing: String(localStorage.getItem("singNumber")),
                            actions: [
                              {
                                actionDescription: `ВЫПОЛНЕНО: \r\n ${
                                  task.taskDescription
                                  //   ?.replace(
                                  //   /ДОСТУП ПРИМЕЧАНИЕ:.+/,
                                  //   ''.replace(/ДОСТУП:.+/, '')
                                  // )
                                  // }\nв соответствии с:\nAMM-${task.amtoss}`,
                                }\nв соответствии с:${task.ammtossArrNew?.map(
                                  (item: string) => `\n${item.toUpperCase()}`
                                )}`,

                                actionNumber: 1,
                              },
                            ],
                            projectTaskNRSs: [],

                            workStepReferencesLinks: [
                              ...(refArr || []),
                              {
                                type: "WO",
                                reference: task.WOCustomer || "",
                                description: "Customer WO / WO Заказчика",
                              },
                              {
                                type: "WO",
                                reference:
                                  String(currentProject.projectWO) || "",
                                description: "Local WO / Внутренний WO",
                              },
                            ],
                            materialReuest: [],
                            materialReuestAplications: [],
                            plane: {
                              registrationNumber:
                                currentProject.aplicationId.planeNumber,
                              type: currentProject.aplicationId.planeType || "",
                              companyName:
                                currentProject.aplicationId.companyName,
                            },
                            projectWO: currentProject.projectWO,
                            newMaterial: [],
                          })
                        );

                        if (
                          updatedFilteredRoutineTasks[
                            updatedFilteredRoutineTasks.length - 1
                          ] === task &&
                          result.meta.requestStatus === "fulfilled"
                        ) {
                          dispatch(
                            setOptional({
                              isDone: currentProject.optional?.isDone,
                              isRoutineTaskCreated: true,
                              isAdditionalTaskCreated:
                                currentProject.optional
                                  ?.isAdditionalTaskCreated,
                              isHardTimeTasksCreated:
                                currentProject.optional?.isHardTimeTasksCreated,
                              isStarting: currentProject.optional?.isStarting,
                              isFavorite: currentProject.optional?.isFavorite,
                            })
                          );
                          toast.success("Пакет задач успешно создан");
                          dispatch(setIsLoading(false));
                        } else if (result.meta.requestStatus === "rejected") {
                          dispatch(setIsLoading(false));
                          toast.error("Пакет задач не загружен");
                        }
                      });
                  }}
                >
                  Создать пакет Рутинных работ
                </Button>
              </Form.Item>
            )}
            {project.optional?.isAdditionalTaskCreated ? (
              <Form.Item hasFeedback validateStatus="success">
                <Input
                  disabled
                  style={{ width: "220px" }}
                  defaultValue={"Пакет бюллетеней  создан"}
                ></Input>
              </Form.Item>
            ) : (
              <Form.Item>
                <Button
                  loading={isLoading}
                  disabled={!disabled}
                  onClick={() => {
                    dispatch(setIsLoading(true));
                    notFoundedAdditionalTasks &&
                      notFoundedAdditionalTasks.forEach(async (task) => {
                        const resultNotFounded = await dispatch(
                          createProjectTask({
                            projectId: currentProject.id || "",
                            taskType: "additional",
                            createDate: new Date(),
                            ownerId: currentProject.aplicationId.ownerId,
                            name: String(localStorage.getItem("name")),
                            sing: String(localStorage.getItem("singNumber")),
                            optional: {
                              amtoss: task.amtoss,
                              MJSSNumber: task.id,
                              WOCustomer: task.WOCustomer,
                              WOPackageType: task.WOPackageType,
                              taskNumber: task.taskNumber,
                              position: task.position,
                              taskDescription: task.taskDescription,
                              isActive: false,
                              isDone: false,
                              isFavorite: false,
                              isStarting: false,
                            },
                            status: "отложен",
                            _id: "",
                            actions: [
                              {
                                actionDescription: `ВЫПОЛНЕНО: \r\n ${
                                  task.taskDescription
                                  //   ?.replace(
                                  //   /ДОСТУП ПРИМЕЧАНИЕ:.+/,
                                  //   ''.replace(/ДОСТУП:.+/, '')
                                  // )
                                  // }\nв соответствии с:\nAMM-${task.amtoss}`,
                                }\nв соответствии с:${task.amtoss}`,
                              },
                            ],
                            projectTaskNRSs: [],

                            workStepReferencesLinks: [
                              {
                                type: "WO",
                                reference: task.WOCustomer || "",
                                description: "Customer WO / WO Заказчика",
                              },
                              {
                                type: "WO",
                                reference:
                                  String(currentProject.projectWO) || "",
                                description: "Local WO / Внутренний WO",
                              },
                            ],
                            materialReuest: [],
                            materialReuestAplications: [],
                            plane: {
                              registrationNumber:
                                currentProject.aplicationId.planeNumber,
                              type: currentProject.aplicationId.planeType || "",
                              companyName:
                                currentProject.aplicationId.companyName,
                            },
                            projectWO: currentProject.projectWO,
                            newMaterial: [],
                          })
                        );
                      });
                    updatedfilteredAdditionalTasks.forEach(
                      async (task, index) => {
                        let refArr = task.ammtossArrNew?.map(
                          (item: string): IReferencesLinkType =>
                            ({
                              type: "AMM",
                              reference: item,
                              description: "",
                            } || [])
                        );
                        const result = await dispatch(
                          createProjectTask({
                            taskId: task.id,
                            projectId: currentProject.id || "",
                            taskType: "additional",
                            createDate: new Date(),
                            ownerId: currentProject.aplicationId.ownerId,
                            optional: {
                              amtoss: task.amtoss,
                              MJSSNumber: task.MJSSNumber,
                              WOCustomer: task.WOCustomer,
                              WOPackageType: task.WOPackageType,
                              taskNumber: task.taskNumber,
                              position: task.position,
                              taskDescription: task.taskDescription,
                              isActive: false,
                              isDone: false,
                              isFavorite: false,
                              isStarting: false,
                            },
                            status: "отложен",
                            name: String(localStorage.getItem("name")),
                            sing: String(localStorage.getItem("singNumber")),
                            _id: "",
                            actions: [
                              {
                                actionDescription: `ВЫПОЛНЕНО: \r\n ${
                                  task.taskDescription
                                  //   ?.replace(
                                  //   /ДОСТУП ПРИМЕЧАНИЕ:.+/,
                                  //   ''.replace(/ДОСТУП:.+/, '')
                                  // )
                                  // }\nв соответствии с:\nAMM-${task.amtoss}`,
                                }\nв соответствии с:${
                                  task.ammtossArrNew &&
                                  task.ammtossArrNew?.map(
                                    (item: string) => `\n${item.toUpperCase()}`
                                  )
                                }`,

                                actionNumber: 1,
                              },
                            ],
                            projectTaskNRSs: [],
                            workStepReferencesLinks: [
                              ...(refArr || []),
                              {
                                type: "WO",
                                reference: task.WOCustomer || "",
                                description: "Customer WO",
                              },
                              {
                                type: "WO",
                                reference:
                                  String(currentProject.projectWO) || "",
                                description: "Local WO / Внутренний WO",
                              },
                            ],
                            materialReuest: [],
                            materialReuestAplications: [],
                            plane: {
                              registrationNumber:
                                currentProject.aplicationId.planeNumber,
                              type: currentProject.aplicationId.planeType || "",
                              companyName:
                                currentProject.aplicationId.companyName,
                            },
                            projectWO: currentProject.projectWO,
                            newMaterial: [],
                          })
                        );

                        if (
                          updatedfilteredAdditionalTasks[
                            updatedfilteredAdditionalTasks.length - 1
                          ] === task &&
                          result.meta.requestStatus === "fulfilled"
                        ) {
                          dispatch(
                            setOptional({
                              isDone: currentProject.optional?.isDone,
                              isRoutineTaskCreated:
                                currentProject.optional?.isRoutineTaskCreated,
                              isAdditionalTaskCreated: true,
                              isHardTimeTasksCreated:
                                currentProject.optional?.isHardTimeTasksCreated,
                              isStarting: currentProject.optional?.isStarting,
                              isFavorite: currentProject.optional?.isFavorite,
                            })
                          );

                          toast.success("Пакет задач успешно создан");
                          dispatch(setIsLoading(false));
                        } else if (result.meta.requestStatus === "rejected") {
                          dispatch(setIsLoading(false));
                          toast.error("Пакет задач не загружен");
                        }
                      }
                    );
                  }}
                >
                  Создать пакет Доп.Работ{" "}
                </Button>
              </Form.Item>
            )}

            {project.optional?.isHardTimeTasksCreated ? (
              <Form.Item hasFeedback validateStatus="success">
                <Input
                  disabled
                  style={{ width: "200px" }}
                  defaultValue={"Пакет работ Вне ВС  создан"}
                ></Input>
              </Form.Item>
            ) : (
              <Form.Item>
                <Button
                  loading={isLoading}
                  disabled={!disabled}
                  onClick={() => {
                    dispatch(setIsLoading(true));
                    notFoundedHardTimesTasks.forEach(async (task) => {
                      const resultNotFounded = await dispatch(
                        createProjectTask({
                          projectId: currentProject.id || "",
                          taskType: "hardTime",
                          createDate: new Date(),
                          ownerId: currentProject.aplicationId.ownerId,
                          optional: {
                            amtoss: task.amtoss,
                            MJSSNumber: task.id,
                            WOCustomer: task.WOCustomer,
                            WOPackageType: task.WOPackageType,
                            taskNumber: task.taskNumber,
                            position: task.position,
                            taskDescription: task.taskDescription,
                            isActive: false,
                            isDone: false,
                            isFavorite: false,
                            isStarting: false,
                          },
                          name: String(localStorage.getItem("name")),
                          sing: String(localStorage.getItem("singNumber")),
                          status: "отложен",
                          _id: "",
                          actions: [
                            {
                              actionDescription: `ВЫПОЛНЕНО: \r\n ${
                                task.taskDescription
                                //   ?.replace(
                                //   /ДОСТУП ПРИМЕЧАНИЕ:.+/,
                                //   ''.replace(/ДОСТУП:.+/, '')
                                // )
                                // }\nв соответствии с:\nAMM-${task.amtoss}`,
                              }\nв соответствии с:${task.amtoss}`,
                            },
                          ],
                          projectTaskNRSs: [],

                          workStepReferencesLinks: [
                            {
                              type: "WO",
                              reference: task.WOCustomer || "",
                              description: "Customer WO / WO Заказчика",
                            },
                            {
                              type: "WO",
                              reference: String(currentProject.projectWO) || "",
                              description: "Local WO / Внутренний WO",
                            },
                          ],
                          materialReuest: [],
                          materialReuestAplications: [],
                          plane: {
                            registrationNumber:
                              currentProject.aplicationId.planeNumber,
                            type: currentProject.aplicationId.planeType || "",
                            companyName:
                              currentProject.aplicationId.companyName,
                          },
                          projectWO: currentProject.projectWO,
                          newMaterial: [],
                        })
                      );
                    });
                    updatedfilteredHardTimesTasks.forEach(async (task) => {
                      let refArr = task.ammtossArrNew?.map(
                        (item: string): IReferencesLinkType =>
                          ({
                            type: "AMM",
                            reference: item,
                            description: "",
                          } || [])
                      );
                      const result = await dispatch(
                        createProjectTask({
                          taskId: task.id,
                          projectId: currentProject.id || "",
                          taskType: "hardTime",
                          createDate: new Date(),
                          ownerId: currentProject.aplicationId.ownerId,
                          optional: {
                            amtoss: task.amtoss,
                            MJSSNumber: task.MJSSNumber,
                            WOCustomer: task.WOCustomer,
                            WOPackageType: task.WOPackageType,
                            taskNumber: task.taskNumber,
                            position: task.position,
                            taskDescription: task.taskDescription,
                            isActive: false,
                            isDone: false,
                            isFavorite: false,
                            isStarting: false,
                          },
                          name: String(localStorage.getItem("name")),
                          sing: String(localStorage.getItem("singNumber")),
                          status: "отложен",
                          _id: "",
                          actions: [
                            {
                              actionDescription: `ВЫПОЛНЕНО: \r\n ${
                                task.taskDescription
                                //   ?.replace(
                                //   /ДОСТУП ПРИМЕЧАНИЕ:.+/,
                                //   ''.replace(/ДОСТУП:.+/, '')
                                // )
                                // }\nв соответствии с:\nAMM-${task.amtoss}`,
                              }\nв соответствии с:${
                                task.ammtossArrNew &&
                                task.ammtossArrNew?.map(
                                  (item: string) => `\n${item.toUpperCase()}`
                                )
                              }`,
                              actionNumber: 1,
                            },
                          ],
                          projectTaskNRSs: [],
                          workStepReferencesLinks: [
                            ...(refArr || []),
                            {
                              type: "WO",
                              reference: task.WOCustomer || "",
                              description: "Customer WO",
                            },
                            {
                              type: "WO",
                              reference: String(currentProject.projectWO) || "",
                              description: "Local WO / Внутренний WO",
                            },
                          ],
                          materialReuest: [],
                          materialReuestAplications: [],
                          plane: {
                            registrationNumber:
                              currentProject.aplicationId.planeNumber,
                            type: currentProject.aplicationId.planeType || "",
                            companyName:
                              currentProject.aplicationId.companyName,
                          },
                          projectWO: currentProject.projectWO,
                          newMaterial: [],
                        })
                      );
                      if (
                        updatedfilteredHardTimesTasks[
                          updatedfilteredHardTimesTasks.length - 1
                        ] === task &&
                        result.meta.requestStatus === "fulfilled"
                      ) {
                        dispatch(
                          setOptional({
                            isDone: currentProject.optional?.isDone,
                            isRoutineTaskCreated:
                              currentProject.optional?.isRoutineTaskCreated,
                            isAdditionalTaskCreated:
                              currentProject.optional?.isAdditionalTaskCreated,
                            isHardTimeTasksCreated: true,
                            isStarting: currentProject.optional?.isStarting,
                            isFavorite: currentProject.optional?.isFavorite,
                          })
                        );
                        toast.success("Пакет задач успешно создан");
                        dispatch(setIsLoading(false));
                      } else if (result.meta.requestStatus === "rejected") {
                        dispatch(setIsLoading(false));
                        toast.error("Пакет задач не загружен");
                      }
                    });
                  }}
                >
                  Создать пакет Вне ВС
                </Button>
              </Form.Item>
            )}
          </div>
        </Form>

        <div className="flex justify-center gap-1 flex-wrap">
          <Form.Item>
            <Button
              disabled={currentProject.isEdited}
              onClick={() => {
                console.log(updatedFilteredRoutineTasks);
                setDisabled(true);
                dispatch(setEditedMode(true));
              }}
            >
              Редактировать
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              disabled={
                !disabled ||
                disabledButton ||
                currentProject.optional?.isDone ||
                currentProject.status == "В работе"
              }
              onClick={() => {
                dispatch(setProjectStart("В работе"));
                dispatch(updateStartTime(new Date()));
                dispatch(
                  setOptional({
                    isDone: false,
                    isRoutineTaskCreated:
                      currentProject.optional?.isRoutineTaskCreated || false,
                    isAdditionalTaskCreated:
                      currentProject.optional?.isAdditionalTaskCreated || false,
                    isHardTimeTasksCreated:
                      currentProject.optional?.isHardTimeTasksCreated || false,
                    isStarting: true,
                    isFavorite: currentProject.optional?.isFavorite || false,
                  })
                );
              }}
            >
              Начать Проект
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              disabled={!currentProject.isEdited}
              htmlType="submit"
              onClick={() => {
                setDisabled(false);
                dispatch(setEditedMode(false));
              }}
            >
              Применить Изменения
            </Button>
          </Form.Item>
          <Form></Form>
          <Form.Item>
            {project.optional?.isDone ? (
              <Form.Item hasFeedback validateStatus="success">
                <Input
                  disabled
                  style={{ width: "200px" }}
                  defaultValue={"Проект Завершен"}
                ></Input>
              </Form.Item>
            ) : (
              <Button
                onClick={() => {
                  dispatch(updatefinishDate(new Date()));
                  dispatch(
                    setOptional({
                      isDone: true,
                      isRoutineTaskCreated:
                        currentProject.optional?.isRoutineTaskCreated || false,
                      isAdditionalTaskCreated:
                        currentProject.optional?.isAdditionalTaskCreated ||
                        false,
                      isHardTimeTasksCreated:
                        currentProject.optional?.isHardTimeTasksCreated ||
                        false,
                      isStarting: false,
                      isFavorite: currentProject.optional?.isFavorite || false,
                    })
                  );
                  dispatch(setProjectStart("завершен"));
                  setDisabledButton(true);
                }}
                disabled={!disabled || currentProject.status == "отложен"}
              >
                Отметить проект как "Выполненный"
              </Button>
            )}
          </Form.Item>
          {/* <Form.Item>
            <Button
              disabled={
                currentProject.isEdited
                // ||!currentProject.optional?.isRoutineTaskCreated
              }
              onClick={() => {
                history(`${RouteNames.PROJECTTASKS}`);
              }}
            >
              Перейти к задачам
            </Button>
          </Form.Item> */}
        </div>
      </Form>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default ProjectForm;
