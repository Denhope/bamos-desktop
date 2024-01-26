import { ITaskDTO } from "@/components/mantainance/base/workPackage/packageAplications/AddAplicationForm";
import { IAdditionalTask } from "@/models/IAdditionalTask";
import { TDifficulty, IActionType } from "@/models/IAdditionalTaskMTB";
import { IBookingItem } from "@/models/IBooking";
import { IMaterialStoreRequestItem } from "@/models/IMaterialStoreItem";
import { IPickSlip, IReturnSlip, IPickSlipResponse } from "@/models/IPickSlip";
import { IPlane } from "@/models/IPlane";
import { IPlaneWO } from "@/models/IPlaneWO";
import { IProjectTask } from "@/models/IProjectTaskMTB";
import { IRemovedItemResponce } from "@/models/IRemovedItem";
import { IStore } from "@/models/IStore";
import { IUser } from "@/models/IUser";
import AuthService from "@/services/authService";
import TaskService, { taskFilters } from "@/services/taskService";
import { MatRequestAplication } from "@/store/reducers/ProjectTaskSlise";
import { ISignIn } from "@/store/types";
import { IPurchaseMaterial } from "@/types/TypesData";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { $authHost, API_URL } from "./http";

//Auth
export const registration = createAsyncThunk(
  "auth/createUser",

  async (data: IUser, thunkAPI) => {
    const { name, email, password, firstName, lastName, role, singNumber } =
      data;
    try {
      const response = await AuthService.registration(
        name,
        email,
        password,
        firstName,
        lastName,
        role,
        singNumber
      );
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue(
        "Не удалось создать нового пользователя!"
      );
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (data: ISignIn, thunkAPI) => {
    const { email, password } = data;
    try {
      const response = await AuthService.login(email, password);

      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue("Неверный логин или пароль");
    }
  }
);
//User
export const getUserById = createAsyncThunk(
  "user/getUserById",
  async (userId: string, thunkAPI) => {
    try {
      const response = await $authHost.get(`/users/${userId}`, {});
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const getNewUserTokens = createAsyncThunk(
  "user/getUserTokens",
  async (userId: any, thunkAPI) => {
    try {
      const response = await AuthService.getNewTokens(userId);

      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const getAllTasks = createAsyncThunk(
  "getAllTasks",
  async (_, thunkAPI) => {
    try {
      const response = await $authHost.get(`/tasks`);
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const getAllMaterials = createAsyncThunk(
  "getAllMaterials",
  async (_, thunkAPI) => {
    try {
      const response = await $authHost.get(`/materials`);
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);
export const getAllPanels = createAsyncThunk(
  "getAllPanels",
  async (_, thunkAPI) => {
    try {
      const response = await $authHost.get(`/panels`);
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);
export const getAllZones = createAsyncThunk(
  "getAllZones",
  async (_, thunkAPI) => {
    try {
      const response = await $authHost.get(`/zones`);
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);
export const getInspectionScope = createAsyncThunk(
  "getInspectionScope",
  async (_, thunkAPI) => {
    try {
      const response = await $authHost.get(`/inspectionscope`);
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const getAllAplication = createAsyncThunk(
  "getAllAplications",
  async (_, thunkAPI) => {
    try {
      const response = await $authHost.get(`/aplications`);
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const getAllInstruments = createAsyncThunk(
  "getAllInstruments",
  async (_, thunkAPI) => {
    try {
      const response = await $authHost.get(`/instruments`);
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const fetchAllProjects = createAsyncThunk(
  "fetchAllProjects",
  async (_, thunkAPI) => {
    try {
      const response = await $authHost.get(`/projects`);
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  "fetchAllProjectbyId",
  async (projectId: string, thunkAPI) => {
    try {
      const response = await $authHost.get(`/projects/${projectId}`, {});
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);
export const createProject = createAsyncThunk(
  "saveProject",
  async (data: any, { rejectWithValue }) => {
    const {
      aplicationId,
      createDate,
      projectName,
      ownerId,
      planedFinishDate,
      optional,
      startDate,
      planedStartDate,
      finishDate,
      projectId,
      status,
      isEdited,
      companyID,
      customer,
      acRegistrationNumber,
      manufactureNumber,
      acType,
      acHours,
      acLDG,
      WOType,
      classification,
      department,
      createBySing,
      createByID,
      updateDate,
      updateUserID,
      updateUserSing,
      description,
      projectType,
    } = data;

    try {
      const response = await $authHost.post(`projects`, {
        aplicationId: aplicationId,
        createDate: createDate,
        createBySing,
        createByID,
        projectName: projectName,
        ownerId: ownerId,
        planedFinishDate,
        optional: optional,
        startDate: startDate,
        planedStartDate: planedStartDate,
        finishDate: finishDate,
        projectId: projectId,
        status: status,
        isEdited: isEdited,
        companyID: companyID,
        customer,
        acRegistrationNumber,
        manufactureNumber,
        acType,
        acHours,
        acLDG,
        WOType,
        classification,
        department,
        description,
        updateDate,
        updateUserID,
        updateUserSing,
        projectType,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось создать проект");
    }
  }
);

export const updateProject = createAsyncThunk(
  "updateProject",
  async (data: any, { rejectWithValue }) => {
    const {
      aplicationId,
      createDate,
      projectName,
      ownerId,
      planedFinishDate,
      optional,
      startDate,
      planedStartDate,
      finishDate,
      projectId,
      status,
      id,
      projectWO,
      companyID,
      department,
      classification,
      description,
      planeStatus,
      customer,
      acRegistrationNumber,
      manufactureNumber,
      acType,
      acHours,
      acLDG,
      WOType,
      updateDate,
      updateUserID,
      updateUserSing,
      projectType,
    } = data;
    try {
      const response = await $authHost.put(`projects/${id}`, {
        aplicationId: aplicationId,
        createDate: createDate,
        projectName: projectName,
        ownerId: ownerId,
        planedFinishDate,
        optional: optional,
        startDate: startDate,
        planedStartDate: planedStartDate,
        finishDate: finishDate,
        projectId: projectId,
        status: status,
        id: id,
        projectWO: projectWO,
        companyID: companyID,
        department,
        classification,
        description,
        planeStatus,
        customer,
        acRegistrationNumber,
        manufactureNumber,
        acType,
        acHours,
        acLDG,
        WOType,
        updateDate,
        updateUserID,
        updateUserSing,
        projectType,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось обновить проект");
    }
  }
);

export const deleteProjectById = createAsyncThunk(
  "deleteProjectbyId",
  async (projectId: string, thunkAPI) => {
    try {
      const response = await $authHost.delete(`/projects/${projectId}`, {});
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const createProjectTask = createAsyncThunk(
  "saveProjectTask",
  async (data: any, { rejectWithValue }) => {
    const {
      ownerId,
      projectId,
      taskId,
      finishDate,
      optional,
      planedFinishDate,
      planedStartDate,
      startDate,
      createDate,
      taskType,
      status,
      actions,

      workStepReferencesLinks,
      materialReuestAplications,

      plane,
      projectWO,
      name,
      sing,
      companyID,
      cascader,
      rewiewStatus,
      zonesArr,
    } = data;

    try {
      const response = await $authHost.post(`projects/tasks/`, {
        taskId: taskId,
        createDate: createDate,
        companyID: companyID,
        ownerId: ownerId,
        planedFinishDate: planedFinishDate,
        optional: optional,
        startDate: startDate,
        planedStartDate: planedStartDate,
        finishDate: finishDate,
        projectId: projectId,
        taskType: taskType,
        status: status,
        actions: actions,
        materialReuestAplications: materialReuestAplications,
        workStepReferencesLinks: workStepReferencesLinks,
        plane: plane,
        projectWO: projectWO,
        name,
        sing,
        cascader,
        rewiewStatus,
        zonesArr,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось создать задачу");
    }
  }
);

export const updateProjectTask = createAsyncThunk(
  "updateProjectTask",
  async (data: any, { rejectWithValue }) => {
    const {
      ownerId,
      finalAction,
      currentActionIndex,
      projectId,
      taskId,
      finishDate,
      optional,
      planedFinishDate,
      planedStartDate,
      startDate,
      createDate,
      closeDate,
      taskType,
      status,
      id,
      actions,
      projectTaskNRSs,
      workNeed,
      currentAction,
      currentActiveIndex,
      workStepReferencesLinks,
      _id,
      projectTaskWO,
      QRCodeLink,
      material,
      instrument,
      inspectionScope,
      materialReuestAplications,
      name,
      sing,
      cascader,
      rewiewStatus,
      note,
      updatedActions,
      requirementItemsIds,
    } = data;

    try {
      const response = await $authHost.put(`projects/tasks/${id}`, {
        taskId: taskId,
        createDate: createDate,
        ownerId: ownerId,
        planedFinishDate: planedFinishDate,
        optional: optional,
        startDate: startDate,
        planedStartDate: planedStartDate,
        finishDate: finishDate,
        projectId: projectId,
        taskType: taskType,
        status: status,
        id: id,
        actions: actions,
        projectTaskNRSs: projectTaskNRSs,
        workNeed: workNeed,
        currentAction: currentAction,
        currentActiveIndex: currentActiveIndex,
        workStepReferencesLinks,
        _id: _id,
        projectTaskWO: projectTaskWO,
        QRCodeLink: QRCodeLink,
        material: material,
        instrument: instrument,
        inspectionScope: inspectionScope,
        materialReuestAplications: materialReuestAplications,
        name,
        sing,
        closeDate: closeDate,
        cascader: cascader,
        rewiewStatus: rewiewStatus,
        note: note,
        currentActionIndex: currentActionIndex,
        updatedActions: updatedActions,
        finalAction: finalAction,
        requirementItemsIds,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось обновить задачу");
    }
  }
);

export const featchAllProjectsTasks = createAsyncThunk(
  "featchAllProjectsTasks",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await $authHost.get(`projects/tasks`, {});
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить задачи");
    }
  }
);

export const featchAllTasksByProjectId = createAsyncThunk(
  "featchAllTasksByProjectId",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await $authHost.get(`projects/${projectId}/tasks/`);
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить задачи проекта");
    }
  }
);

export const featchFilteredTasksByProjectId = createAsyncThunk(
  "featchFilteredTasks",
  async (data: IFetchFilteredProjectDatasks, { rejectWithValue }) => {
    try {
      const response = await $authHost.get(
        `projects/${data.projectId}/tasks/${data.filter}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить задачи проекта");
    }
  }
);
export interface IfeatchProjectTasksByProjectId {
  projectId: string;
  projectTaskId: string;
}
export const featchProjectTasksByProjectId = createAsyncThunk(
  "featchProjectTasksByProjectId",
  async (data: IfeatchProjectTasksByProjectId, { rejectWithValue }) => {
    try {
      const response = await $authHost.get(
        `projects/${data.projectId}/tasks/${data.projectTaskId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить задачи проекта");
    }
  }
);
export interface IFetchFilteredProjectDatasks {
  projectId: string;
  filter: TDifficulty;
}

export interface IFetchFilteredProjectTasksMaterials {
  projectWO: number;
  projectTaskWO: number;
}
export interface IFetchProjectDatasksData {
  projectId: string;
  page?: number;
  filter?: any;
}

export const featchRoutineProjectTasks = createAsyncThunk(
  "featchRoutineProjectTasks}",
  async (data: IFetchProjectDatasksData, { rejectWithValue }) => {
    const { projectId } = data;
    try {
      const response = await TaskService.feathFiltered(
        projectId,
        taskFilters.onlyRoutine
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить рутинные задачи проекта");
    }
  }
);

export const featchHardTimeProjectTasks = createAsyncThunk(
  "featchHardTimeProjectTasks}",
  async (projectId: string, { rejectWithValue }) => {
    // const { projectId, page } = data;
    try {
      const response = await TaskService.feathFiltered(
        projectId,
        taskFilters.onlyHardTime
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить рутинные задачи проекта");
    }
  }
);

export const createNRC = createAsyncThunk(
  "saveNRC",
  async (data: IAdditionalTask, { rejectWithValue }) => {
    const {
      ownerId,
      projectId,
      taskId,
      finishDate,
      optional,
      planedFinishDate,
      planedStartDate,
      startDate,
      createDate,
      taskType,
      status,
      isDoubleInspectionRequired,
      workStepReferencesLinks,
      actions,
      material,
      location,
      projectTaskID,
      taskDescription,
      editMode,
      plane,
      planeId,
      taskHeadLine,
      resourcesRequests,

      additionalNumberId,
      projectWO,
      projectTaskWO,
      companyID,
    } = data;

    try {
      const response = await $authHost.post(
        `projects/${projectId}/company/${companyID}/additionalTasks`,
        {
          taskId: taskId,
          createDate: createDate,
          ownerId: ownerId,
          planedFinishDate: planedFinishDate,
          optional: optional,
          startDate: startDate,
          planedStartDate: planedStartDate,
          finishDate: finishDate,
          projectId: projectId,
          taskType: taskType,
          status: status,
          isDoubleInspectionRequired: isDoubleInspectionRequired,
          workStepReferencesLinks: workStepReferencesLinks,
          actions: actions,
          material: material,
          location: location,
          projectTaskID: projectTaskID,
          taskDescription: taskDescription,
          editMode: editMode,
          plane: plane,
          planeId: planeId,
          taskHeadLine: taskHeadLine,
          resourcesRequests: resourcesRequests,
          additionalNumberId,
          projectWO,
          projectTaskWO,
          companyID,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось создать задачу");
    }
  }
);

// export const featchProjectNRC = createAsyncThunk(
//   'featchProjectNRC}',
//   async (projectId: string, { rejectWithValue }) => {
//     // const { projectId, page } = data;
//     try {
//       const response = await TaskService.feathFiltered(
//         projectId,
//         taskFilters.onlyNrcMaint
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue('Не удалось загрузить NRC проекта');
//     }
//   }
// );

export interface IFetchFilteredProjectNRC {
  projectId: string;
  filter?: TDifficulty;
}
export const featchFilteredNRCProject = createAsyncThunk(
  "featchFilteredNRC",
  async (data: IFetchFilteredProjectNRC, { rejectWithValue }) => {
    try {
      const response = await $authHost.get(
        `projects/${data.projectId}/additionalTasks`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить задачи проекта");
    }
  }
);
export interface IFetchFilteredProjectTaskNRC {
  projectTaskId: string;
  projectId: string;
  // filter?: TDifficulty;
}
export const featchFilteredNRCProjectTask = createAsyncThunk(
  "featchFilteredNRCProjectTask",
  async (data: IFetchFilteredProjectTaskNRC, { rejectWithValue }) => {
    try {
      const response = await $authHost.get(
        `projects/${data.projectId}/additionalTasks/${data.projectTaskId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить задачи проекта");
    }
  }
);

export const updateAdditionalTask = createAsyncThunk(
  "updateAdditionalTask",
  async (data: any, { rejectWithValue }) => {
    const {
      actions,
      finalAction,
      note,
      _id,
      projectId,
      status,
      finishDate,
      instrument,
      material,
      optional,
      taskHeadLine,
      taskDescription,
      isDoubleInspectionRequired,
      resourcesRequests,
      workStepReferencesLinks,
      closeDate,
      skill,
      area,
      cascader,
      rewiewStatus,
      nrcType,
      tResources,
      companyID,
      requirementItemsIds,

      currentMaterialReuestAplication,
      steps,
      updateDate,
      updateById,
    } = data;
    try {
      const response = await $authHost.put(
        `projects/${projectId}/additionalTasks/${_id}`,
        {
          actions: actions,
          projectId: projectId,
          _id: _id,
          status: status,
          finishDate: finishDate,
          instrument: instrument,
          material: material,
          optional: optional,
          taskHeadLine: taskHeadLine,
          taskDescription: taskDescription,
          isDoubleInspectionRequired,
          resourcesRequests,
          workStepReferencesLinks,
          closeDate,
          skill,
          area,
          nrcType,
          tResources,
          currentMaterialReuestAplication,
          cascader,
          rewiewStatus,
          companyID,
          note,
          requirementItemsIds,
          steps,
          updateDate,
          updateById,
          finalAction,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось обновить задачу");
    }
  }
);

export const featchCountByStatus = createAsyncThunk(
  "featchProjectTasksCountByStatus",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await $authHost.get(
        `projects/${projectId}/tasks/getCountByStatus`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить количество задач");
    }
  }
);
export const featchCountAdditionalByStatus = createAsyncThunk(
  "featchAdditionalCountByStatus",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await $authHost.get(
        `projects/${projectId}/additionalTasks/getCountByStatus`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить количество задач");
    }
  }
);

interface UploadFileResponse {
  message: string;
}

export const uploadFile = createAsyncThunk<
  UploadFileResponse,
  File,
  { rejectValue: UploadFileResponse }
>("files/uploadFile", async (file, thunkAPI) => {
  try {
    const formData = new FormData();
    formData.append("pdf", file);
    const response = await $authHost.post("upload", formData);
    return response.data;
  } catch (error) {
    return error;
  }
});

export const searchFiles = createAsyncThunk(
  "files/searchFiles",
  async (query: string, thunkAPI) => {
    try {
      const response = await $authHost.get(`files/search?q=${query}`);

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ results: [] });
    }
  }
);

export const createProjectTaskMaterialAplication = createAsyncThunk(
  "sendProjectTaskMatirialAplication",
  async (data: any, { rejectWithValue }) => {
    const {
      createDate,
      materials,
      projectId,
      projectTaskId,
      projectTaskWO,
      projectWO,
      user,
      userId,
      id,
      userTelID,
      materialAplicationNumber,
      planeType,
      registrationNumber,
      status,
      taskNumber,
      editedAction,
      additionalTaskID,
      additionalTaskWO,
      companyID,
      createUserId,
      plannedDate,
      getFrom,
      remarks,
      neededOn,
    } = data;

    try {
      const response = await $authHost.post(`/materialAplications`, {
        createDate,
        materials,
        projectId,
        projectTaskId,
        projectTaskWO,
        projectWO,
        user,
        userId,
        id,
        materialAplicationNumber,
        planeType,
        registrationNumber,
        status,
        taskNumber,
        editedAction,
        userTelID,
        additionalTaskID,
        companyID,
        createUserId,
        plannedDate,
        getFrom,
        remarks,
        neededOn,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось создать заявку");
    }
  }
);

export const getAllMaterialAplication = createAsyncThunk(
  "getAllMaterialAplication",
  async (_, thunkAPI) => {
    // const {} = data;

    try {
      const response = await $authHost.get(`/materialAplications`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось загрузить заявки");
    }
  }
);
export const getCountByStatusProjectAplications = createAsyncThunk(
  "getCountByStatusProjectAplications",
  async (projectId: string, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `materialAplications/project/${projectId}/countAplications`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить счетчик");
    }
  }
);

export const getAllProjectAplications = createAsyncThunk(
  "getAllProjectAplications",
  async (projectId: string, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `/materialAplications/project/${projectId}/allAplications`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявки");
    }
  }
);
export const getAllProjectTaskAplications = createAsyncThunk(
  "getAllProjectTaskAplications",
  async (projectTaskId: string, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `/materialAplications/projectTask/${projectTaskId}/allAplications`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявки");
    }
  }
);

export const getProjectClosedAplications = createAsyncThunk(
  "getProjectActiveAplications",
  async (projectId: string, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `/materialAplications/project/${projectId}/closedAplications`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявки");
    }
  }
);
export const getProjectActiveAplications = createAsyncThunk(
  "getProjectActiveAplications",
  async (projectId: string, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `/materialAplications/project/${projectId}/activeAplications`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявки");
    }
  }
);

export const getProjectPostponedAplications = createAsyncThunk(
  "getProjectPostponedAplications",
  async (projectId: string, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `/materialAplications/project/${projectId}/postponedAplications`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявки");
    }
  }
);
export const getProjectCompletedAplications = createAsyncThunk(
  "getProjectCompletedAplications",
  async (projectId: string, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `/materialAplications/project/${projectId}/completedAplications`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявки");
    }
  }
);

export const getProjectNotClosedAplications = createAsyncThunk(
  "getProjectNotClosedAplications",
  async (projectId: string, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `/materialAplications/project/${projectId}/notClosedAplications`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявки");
    }
  }
);
export const getAplicationById = createAsyncThunk(
  "common/getAplicationById",
  async (materialAplicationId: string, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `/materialAplications/${materialAplicationId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявку");
    }
  }
);
export const getAplicationByNumber = createAsyncThunk(
  "getAplicationByNumber",
  async (materialAplicationNumber: string, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `/materialAplications/${materialAplicationNumber}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявку");
    }
  }
);

export const updateAplicationById = createAsyncThunk(
  "updateAplicationById",
  async (data: MatRequestAplication, { rejectWithValue }) => {
    const {
      _id,
      completedDate,
      createDate,
      id,
      materialAplicationNumber,
      materials,
      planeType,
      projectId,
      projectTaskId,
      projectTaskWO,
      projectWO,
      registrationNumber,
      status,
      taskNumber,
      user,
      userId,
      editedAction,
      isPickSlipCreated,
      closedDate,
    } = data;

    try {
      const response = await $authHost.put(`/materialAplications/${_id}`, {
        completedDate,
        createDate,
        id,
        materialAplicationNumber,
        materials,
        planeType,
        projectId,
        projectTaskId,
        projectTaskWO,
        projectWO,
        registrationNumber,
        status,
        taskNumber,
        user,
        userId,
        editedAction,
        isPickSlipCreated,
        closedDate,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявку");
    }
  }
);

export const createPickSlip = createAsyncThunk(
  "createPickSlip",
  async (data: IPickSlip, { rejectWithValue }) => {
    const {
      materialAplicationId,
      pickSlipNumber,
      _id,
      id,
      status,
      materials,
      createDate,
      closeDate,
      consigneeName,
      materialAplicationNumber,
      planeType,
      projectTaskWO,
      projectWO,
      recipient,
      registrationNumber,
      storeMan,
      taskNumber,
      additionalTaskID,
      store,
      workshop,
      recipientID,
      storeManID,
      companyID,
    } = data;

    try {
      const response = await $authHost.post(`pickSlips`, {
        materialAplicationId,
        pickSlipNumber,
        materials,
        _id,
        id,
        status,
        createDate,
        closeDate,
        consigneeName,
        materialAplicationNumber,
        planeType,
        projectTaskWO,
        projectWO,
        recipient,
        registrationNumber,
        storeMan,
        taskNumber,
        additionalTaskID,
        store,
        workshop,
        recipientID,
        storeManID,
        companyID,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось создать расходное требование");
    }
  }
);
export const createReturnSlip = createAsyncThunk(
  "createReturnSlip",
  async (data: IReturnSlip, { rejectWithValue }) => {
    const {
      materialAplicationId,
      pickSlipNumber,
      _id,
      id,
      status,
      materials,
      createDate,
      closeDate,
      consigneeName,
      materialAplicationNumber,
      planeType,
      projectTaskWO,
      projectWO,
      recipient,
      registrationNumber,
      storeMan,
      taskNumber,
      additionalTaskID,
      store,
      workshop,
      recipientID,
      storeManID,
      companyID,
    } = data;

    try {
      const response = await $authHost.post(`returnSlips`, {
        materialAplicationId,
        pickSlipNumber,
        materials,
        _id,
        id,
        status,
        createDate,
        closeDate,
        consigneeName,
        materialAplicationNumber,
        planeType,
        projectTaskWO,
        projectWO,
        recipient,
        registrationNumber,
        storeMan,
        taskNumber,
        additionalTaskID,
        store,
        workshop,
        recipientID,
        storeManID,
        companyID,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось создать расходное требование");
    }
  }
);

export const getAllPickSlips = createAsyncThunk(
  "getAllPickSlips",
  async (_, thunkAPI) => {
    try {
      const response = await $authHost.get(`pickSlips`, {});
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Не удалось загрузить расходное требование"
      );
    }
  }
);

export interface IUpdatePickSlip {
  pickSlipId: string;
  updatedData: IPickSlipResponse;
}
// export const updatePickSlip = createAsyncThunk(
//   'updatePickSlipById',
//   async (data: IUpdatePickSlip, { rejectWithValue }) => {
//     try {
//       const response = await $authHost.put(
//         `/pickSlips/${data.pickSlipId}`,
//         data.updatedData
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue('Не удалось загрузить заявку');
//     }
//   }
// );
export const updatePickSlip = createAsyncThunk(
  "updatePickSlipById",
  async (data: any, { rejectWithValue }) => {
    const {
      materialAplicationId,
      pickSlipId,
      closeDate,
      consigneeName,
      createDate,
      recipient,
      status,
      storeMan,
      pickSlipNumber,
      id,
      _id,
      materials,
      materialAplicationNumber,
      planeType,
      projectTaskWO,
      projectWO,
      registrationNumber,
      taskNumber,
      additionalTaskId,
      workshop,
    } = data;
    try {
      const response = await $authHost.put(
        `/pickSlips/${data._id || data.id}`,
        {
          materialAplicationId,
          pickSlipId,
          _id,
          closeDate,
          consigneeName,
          createDate,
          id,
          pickSlipNumber,
          recipient,
          status,
          storeMan,
          materials,
          materialAplicationNumber,
          planeType,
          projectTaskWO,
          projectWO,
          registrationNumber,
          taskNumber,
          additionalTaskId,
          workshop,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось обновить Расходное Требование");
    }
  }
);

export const fetchProjectTasks = createAsyncThunk(
  "projectTasks/fetchProjectTasks",
  async (data: any, thunkAPI) => {
    const {
      status,
      aircraftNumber,
      projectTaskWO,
      projectWO,
      type,
      customer,
      page = 1,
      limit = 10,
    } = data;
    const params = { status, projectTaskWO };

    if (projectTaskWO) {
      params.projectTaskWO = projectTaskWO;
    }

    if (status) {
      params.status = status;
    }
    try {
      const response = await $authHost.get(
        `projectTasks/query?page=${page}&limit=${limit}`,
        { params }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось загрузить Задачи");
    }
  }
);

export const fetchTotalQuantity = createAsyncThunk(
  `fetchTotalQuantity`,
  async (partNumber: string, thunkAPI) => {
    try {
      const response = await $authHost.get(
        `materialStore/search/${partNumber}`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось загрузить ");
    }
  }
);

export const fetchCurrentMaterials = createAsyncThunk(
  `fetchCurrentMaterials`,
  async (partNumber: string, thunkAPI) => {
    try {
      const response = await $authHost.get(
        `materialStore/searchItems/${partNumber}`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось загрузить ");
    }
  }
);
export const fetchSameMaterials = createAsyncThunk(
  `fetchSameMaterials`,
  async (partNumber: string, thunkAPI) => {
    try {
      const response = await $authHost.get(
        `materialStore/searchSameItems/${partNumber}`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось загрузить ");
    }
  }
);

export const updateForReservation = createAsyncThunk(
  "updateForReservation",
  async (data: IMaterialStoreRequestItem, { rejectWithValue }) => {
    try {
      const response = await $authHost.put(
        `/materialStore/update/${data.ID}/${data.BATCH}/reservation/${data.QUANTITY}`,
        { data }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявку");
    }
  }
);
export const updateAfterIssued = createAsyncThunk(
  "updateMaterialStoreItemByID",
  async (data: IMaterialStoreRequestItem, { rejectWithValue }) => {
    try {
      const response = await $authHost.put(
        `/materialStore/update/${data.ID}/${data.BATCH}/issued/${data.QUANTITY}`,
        { data }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявку");
    }
  }
);

export const getCountAllprojectsAplications = createAsyncThunk(
  "getCountAllprojectsAplications",
  async (_, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `/materialAplications/allprojects/countAplications`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить счетчик");
    }
  }
);

export const createRemoveItem = createAsyncThunk(
  "createRemoveItem",
  async (data: IRemovedItemResponce, { rejectWithValue }) => {
    const {
      id,
      _id,
      installItemNumber,
      installMan,
      projectId,
      removeItemNumber,
      removeMan,
      additionalTaskId,
      additionalTaskWO,
      area,
      consigneeName,
      description,
      installDate,
      panelId,
      pickSlipNumber,
      plane,
      position,
      projectTaskId,
      projectTaskWO,
      projectWO,
      removeItemName,
      registrationNumber,
      removeDate,
      removeName,
      status,
      installName,
      zone,
      reference,
    } = data;
    try {
      const response = await $authHost.post(`removedItems`, {
        id,
        _id,
        installItemNumber,
        installMan,
        projectId,
        removeItemNumber,
        removeMan,
        additionalTaskId,
        additionalTaskWO,
        area,
        consigneeName,
        description,
        installDate,
        panelId,
        pickSlipNumber,
        plane,
        position,
        projectTaskId,
        projectTaskWO,
        projectWO,
        removeItemName,
        registrationNumber,
        removeDate,
        removeName,
        status,
        installName,
        zone,
        reference,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось создать новую запись");
    }
  }
);

export const getAllRemovedItems = createAsyncThunk(
  "getAllRemovedItems",
  async (_, thunkAPI) => {
    try {
      const response = await $authHost.get(`removedItems`, {});
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Не удалось загрузить перечень снятого оборудования"
      );
    }
  }
);
export const getAllProjectRemovedItems = createAsyncThunk(
  "getAllRemovedItems",
  async (projectWO: any, thunkAPI) => {
    try {
      const response = await $authHost.get(
        `removedItems/project/${projectWO}/allItems`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Не удалось загрузить перечень снятого оборудования"
      );
    }
  }
);

export const updateremovedItem = createAsyncThunk(
  "updateremovedItem",
  async (data: any, { rejectWithValue }) => {
    const {
      id,
      _id,
      installItemNumber,
      installMan,
      projectId,
      removeItemNumber,
      removeMan,
      additionalTaskId,
      additionalTaskWO,
      area,
      consigneeName,
      description,
      installDate,
      panelId,
      pickSlipNumber,
      plane,
      position,
      projectTaskId,
      projectTaskWO,
      projectWO,
      removeItemName,
      registrationNumber,
      removeDate,
      removeName,
      status,
      installName,
      zone,
      reference,
    } = data;
    try {
      const response = await $authHost.put(
        `removedItems/${data.id || data._id}`,
        {
          id,
          _id,
          installItemNumber,
          installMan,
          projectId,
          removeItemNumber,
          removeMan,
          additionalTaskId,
          additionalTaskWO,
          area,
          consigneeName,
          description,
          installDate,
          panelId,
          pickSlipNumber,
          plane,
          position,
          projectTaskId,
          projectTaskWO,
          projectWO,
          removeItemName,
          registrationNumber,
          removeDate,
          status,
          removeName,
          installName,
          zone,
          reference,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось обновить Расходное Требование");
    }
  }
);

export const getSelectedItems = createAsyncThunk(
  "getSelectedItems",
  async (ids: any[], thunkAPI) => {
    try {
      const response = await $authHost.post(`removedItems/project/printItems`, {
        ids,
      });
      return response.data as IRemovedItemResponce[];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Не удалось загрузить перечень снятого оборудования"
      );
    }
  }
);

export const getAllPurchaseItems = createAsyncThunk(
  "getAllPurchaseItems",
  async (_, thunkAPI) => {
    try {
      const response = await $authHost.get(`purchase`, {});
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Не удалось загрузить перечень заказанных материалов"
      );
    }
  }
);

export const createPurchaseItems = createAsyncThunk(
  "createPurchaseItems",
  async (data: IPurchaseMaterial[], thunkAPI) => {
    try {
      const response = await $authHost.post(`purchase`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось создать новую запись");
    }
  }
);

export const getAllAdditionalTaskAplications = createAsyncThunk(
  "getAllAdditionalTaskAplications",
  async (additionalTaskId: string, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `/materialAplications/projectTask/${additionalTaskId}/allAplications`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявки");
    }
  }
);

export const updatePushesItem = createAsyncThunk(
  "updatePushesItem",
  async (data: IPurchaseMaterial, { rejectWithValue }) => {
    const {
      id,
      amout,
      unit,
      PN,
      alternative,
      amtoss,
      code,
      _id,
      consignee,
      createDate,
      materialAplicationNumber,
      nameOfMaterial,
      note,
      onPurchaseDate,
      onPurchaseMan,
      onReleaseMan,
      plane,
      planeNumber,
      projectWO,
      realeseDate,
      registrationNumber,
      startOfWork,
      status,
      storeMan,
      taskId,
      taskNumber,
      taskWO,
      workInterval,
    } = data;
    try {
      const response = await $authHost.put(`purchase/${data._id}`, {
        id,
        amout,
        unit,
        PN,
        alternative,
        amtoss,
        code,
        _id,
        consignee,
        createDate,
        materialAplicationNumber,
        nameOfMaterial,
        note,
        onPurchaseDate,
        onPurchaseMan,
        onReleaseMan,
        plane,
        planeNumber,
        projectWO,
        realeseDate,
        registrationNumber,
        startOfWork,
        status,
        storeMan,
        taskId,
        taskNumber,
        taskWO,
        workInterval,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось обновить расходное Требование");
    }
  }
);

export const getAllProjectMaterialsForStatistic = createAsyncThunk(
  "getAllProjectMaterialsForStatistic",
  async (projectWO: string, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `statistic/requiredItemRouter/?projectWO=${projectWO}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявки");
    }
  }
);

export const getAllProjectTaskMaterialsForStatistic = createAsyncThunk(
  "getAllProjectTaskMaterialsForStatistic",
  async (data: IFetchFilteredProjectTasksMaterials, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `statistic/requiredItemRouter/taskMaterial/?projectWO=${data.projectWO}&projectTaskWO=${data.projectTaskWO}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить материалы");
    }
  }
);

export const getAllAdditionalTaskMaterialsForStatistic = createAsyncThunk(
  "getAllAdditionalTaskMaterialsForStatistic",
  async (data: IFetchFilteredProjectTasksMaterials, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(
        `statistic/requiredItemRouter/taskMaterial/?projectWO=${data.projectWO}&projectTaskWO=${data.projectTaskWO}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить материалы");
    }
  }
);

export const getTasks = async (taskNumber: any) => {
  // const {} = data;

  try {
    const response = await $authHost.get(
      `/tasks/getTasksNumber/taskNumber?taskNumber=${taskNumber}`
    );
    return response.data;
  } catch (error) {
    return "Не удалось загрузить задачи";
  }
};

export const getProjectNumber = async (projectNumber: any) => {
  // const {} = data;

  try {
    const response = await $authHost.get(
      `/projects/getProjectNumber/projectNumber?projectNumber=${projectNumber}`
    );
    return response.data;
  } catch (error) {
    return "Не удалось загрузить материалы";
  }
};

export const createNewPlane = createAsyncThunk(
  "mtx/createPlane",

  async (data: IPlane, thunkAPI) => {
    const {
      model,
      planeType,
      regNbr,
      serialNbr,
      apu,
      certification,
      companyID,
      eng1,
      eng2,

      status,
      utilisation,
    } = data;
    try {
      const response = await $authHost.post(`planes/new`, {
        model,
        planeType,
        regNbr,
        serialNbr,
        apu,
        certification,
        companyID,
        eng1,
        eng2,
        status,

        utilisation,
      });
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue("Не удалось создать new A/C!");
    }
  }
);

export const getAllPlanes = createAsyncThunk(
  "mtx/getAll",
  async (_, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(`/planes`);
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);
export const getPlaneByID = createAsyncThunk(
  "mtx/getPlaneByID",
  async (planeId: string, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(`/planes/${planeId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);

export const editPlane = createAsyncThunk(
  "mtx/editPlane",

  async (data: IPlane, thunkAPI) => {
    const {
      model,
      planeType,
      regNbr,
      serialNbr,
      apu,
      certification,
      companyID,
      eng1,
      eng2,
      status,
      utilisation,
      _id,
      id,
    } = data;
    try {
      const response = await $authHost.put(`planes/${id}`, {
        model,
        planeType,
        regNbr,
        serialNbr,
        apu,
        certification,
        companyID,
        eng1,
        eng2,
        status,
        utilisation,
        _id,
        id,
      });
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue("Не удалось update A/C!");
    }
  }
);

// export const getPlane = createAsyncThunk(
//   'mtx/getPlane',

//   async (planeID: string, thunkAPI) => {
//     try {
//       const response = await $authHost.put(`mtx/getPlane/${planeID}`, {});
//       return response.data;
//     } catch (e) {
//       if (e instanceof Error) {
//         console.error(e.message);
//       }
//       return thunkAPI.rejectWithValue('Не удалось get A/C!');
//     }
//   }
// );

export const getPlane = async (planeID: string) => {
  // const {} = data;

  try {
    const response = await $authHost.get(`/planes/${planeID}`);
    return response.data;
  } catch (error) {
    return "Не удалось get A/C!";
  }
};
export interface IfeatchuploadExcelFile {
  planeID: string;
  tasks: any[];
}
export const uploadExcelFile = async (data: IfeatchuploadExcelFile) => {
  const response = $authHost.post(
    `/planesTasks/upload/${data.planeID}`,
    JSON.stringify(data.tasks)
  );
  return response;
};

export interface IfeatchUploadAppExcelFile {
  aplicationName: string;
  companyName: string;
  planeNumber: string;
  planeType: string;
  planeID?: string;
  companyID?: string;
  routineTasks?: any;
  additionalTasks?: any[];
  dateOfAplication?: Date;
  serviceType?: string;
  isCreatedProject: boolean;
  ownerId: string;
}
// export const uploadExcelAppFile = async (data: IfeatchUploadAppExcelFile) => {
//   const response = $authHost.post(`/aplications`, data);
//   console.log(data);
//   return await response;
// };
export const uploadExcelAppFile = async (data: IfeatchUploadAppExcelFile) => {
  const response = $authHost.post(`/aplications`, data);
  console.log(data);
  return await response;
};

export const createNewAplications = createAsyncThunk(
  "mtx/createAplication",

  async (data: IfeatchUploadAppExcelFile, thunkAPI) => {
    const {
      aplicationName,
      companyName,
      isCreatedProject,
      ownerId,
      planeNumber,
      planeType,
      companyID,
      additionalTasks,
      dateOfAplication,
      planeID,
      routineTasks,
      serviceType,
    } = data;
    try {
      const response = await $authHost.post(`aplications`, {
        aplicationName,
        companyName,
        isCreatedProject,
        ownerId,
        planeNumber,
        planeType,
        companyID,
        additionalTasks,
        dateOfAplication,
        planeID,
        routineTasks,
        serviceType,
      });
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue("Не удалось создать new Aplication!");
    }
  }
);

export const getPlanesNumber = async (regNumber: any) => {
  // const {} = data;

  try {
    const response = await $authHost.get(
      `/planes/getPlanesRegNumber/regNumber?regNumber=${regNumber}`
    );
    return response.data;
  } catch (error) {
    return "Не удалось загрузить planes";
  }
};
export const getPlanesTaskNumber = async (taskNumber: any, planeID: string) => {
  // const {} = data;

  try {
    const response = await $authHost.get(
      `/planesTasks/getFilteredPlanesTasksNumbers/numbers?taskNumber=${taskNumber}&planeID=${planeID}`
    );
    return response.data;
  } catch (error) {
    return "Не удалось загрузить planes";
  }
};
export interface IfeatchFilteredPlanesTasks {
  planeID?: string;
  ata?: string[];
  taskType?: string[];
  taskNbr?: string;
  description?: string;
  regNbr?: string;
  startDate?: any;
  endDate?: any;
}

interface SearchParams {
  ata?: string[];
}

export const createSearchUrl = (params: any) => {
  const url = new URL(
    "/planesTasks/getPlaneTasks/tasks",
    window.location.origin
  );
  if (params.ata) {
    url.searchParams.append("ata", params.ata.join(","));
  }
  if (params.taskType) {
    url.searchParams.append("taskType", params.taskType.join(","));
  }
  if (params.taskNbr) {
    url.searchParams.append("taskNbr", params.taskNbr.join(","));
  }
  if (params.description) {
    url.searchParams.append("description", params.description.join(","));
  }
  if (params.planeID) {
    url.searchParams.append("planeID", params.planeID);
  }

  return url.toString();
};

export const getFilteredPlanesTasks = createAsyncThunk(
  "mtx/getFilteredPlaneTasks",
  async (params: IfeatchFilteredPlanesTasks, { rejectWithValue }) => {
    // const { ataArr, taskTypeArr, planeID } = data;
    const url = new URL("/planesTasks/getFilteredPlanesTasks/tasks", API_URL);
    const searchParams = new URLSearchParams();
    if (params.ata) searchParams.append("ata", params.ata.join(","));
    if (params.taskType)
      searchParams.append("taskType", params.taskType.join(","));
    if (params.taskNbr) searchParams.append("taskNbr", params.taskNbr);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.planeID) searchParams.append("planeID", params.planeID);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      localStorage.setItem("taskSearchUrl", url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);
export const getAllPlaneTasks = createAsyncThunk(
  "mtx/getAllPlaneTasks",
  async (_, { rejectWithValue }) => {
    // const {} = data;

    try {
      const response = await $authHost.get(`/planesTasks`);

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);

export const createNewPlaneWO = createAsyncThunk(
  "mtx/createPlaneWO",

  async (data: IPlaneWO, thunkAPI) => {
    const {
      taskNbr,
      dateCreate,
      dateOut,
      status,
      userID,
      WONbr,
      WOType,
      classification,
      companyID,
      dateIn,
      planeID,
      regNbr,
      station,
      description,
      department,
      disposition,
      updateDate,
    } = data;
    try {
      const response = await $authHost.post(`planeswo`, {
        WONbr,
        WOType,
        classification,
        dateIn,
        dateOut,
        taskNbr,
        dateCreate,
        status,
        userID,
        companyID,
        planeID,
        regNbr,
        station,
        description,
        department,
        disposition,
        updateDate,
      });
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue("Не удалось создать new W/O!");
    }
  }
);
export const editPlaneWO = createAsyncThunk(
  "mtx/updatePlaneWO",

  async (data: IPlaneWO, thunkAPI) => {
    const {
      taskNbr,
      dateCreate,
      dateOut,
      status,
      userID,
      WONbr,
      WOType,
      dateClose,
      classification,
      companyID,
      dateIn,
      planeID,
      regNbr,
      station,
      description,
      department,
      disposition,
      updateDate,
      _id,
      id,
    } = data;
    try {
      const response = await $authHost.put(`planeswo/${id}`, {
        WONbr,
        WOType,
        dateClose,
        classification,
        dateIn,
        dateOut,
        taskNbr,
        dateCreate,
        status,
        userID,
        companyID,
        planeID,
        regNbr,
        station,
        description,
        department,
        disposition,
        updateDate,
        _id,
        id,
      });
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue("Не удалось создать new W/O!");
    }
  }
);

export interface IfeatchFilteredPlanesWO {
  planeID?: string;
  ata?: string[];
  WOType?: string[];
  WONbr?: string;
  description?: string;
  regNbr?: string;
  dateIn?: any;
  dateOut?: any;
  dateCreate?: any;
  status?: string[];
  classification?: string[];
}

export const getFilteredPlanesWO = createAsyncThunk(
  "mtx/getFilteredPlaneWO",
  async (params: IfeatchFilteredPlanesWO, { rejectWithValue }) => {
    // const { ataArr, taskTypeArr, planeID } = data;
    const url = new URL("/planeswo/getFilteredPlanesWO/wo", API_URL);
    const searchParams = new URLSearchParams();
    if (params.classification)
      searchParams.append("classification", params.classification.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.WOType) searchParams.append("WOType", params.WOType.join(","));
    if (params.regNbr) searchParams.append("regNbr", params.regNbr);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.WONbr) searchParams.append("WONbr", params.WONbr);
    if (params.planeID) searchParams.append("planeID", params.planeID);
    if (params.dateIn) searchParams.append("dateIn", params.dateIn);
    if (params.dateOut) searchParams.append("dateOut", params.dateOut);
    if (params.dateCreate) searchParams.append("dateCreate", params.dateCreate);
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);

export const getPlanesWONumber = async (WONumber: any, planeID: string) => {
  // const {} = data;

  try {
    const response = await $authHost.get(
      `/planeswo/getFilteredPlanesWONumbers/numbers?WONumber=${WONumber}&planeID=${planeID}`
    );
    return response.data;
  } catch (error) {
    return "Не удалось загрузить planes";
  }
};

// export const updatePlaneTasksByIds = async (
//   ids: any,
//   workOrderID: any,
//   workOrderNbr: any
// ) => {
//   try {
//     const response = await $authHost.put(
//       `/planesTasks/addtaskstoPlaneWO/tasks`,
//       {
//         ids,
//         workOrderID,
//         workOrderNbr,
//       }
//     );
//     return response.data;
//   } catch (error) {
//     return 'Не удалось загрузить заявку';
//   }
// };

export const updatePlaneTasksByIds = createAsyncThunk(
  "mtx/updatePlaneTasksByIds",

  async (data: any, thunkAPI) => {
    const { ids, workOrderID, workOrderNbr } = data;
    try {
      const response = await $authHost.put(
        `/planesTasks/addtaskstoPlaneWO/tasks`,
        {
          ids,
          workOrderID,
          workOrderNbr,
        }
      );
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue("Не удалось updateTasks");
    }
  }
);

export const getFilteredPlanesTasksForUpdate = createAsyncThunk(
  "mtx/getFilteredPlaneTasksWO",
  async (params: string, { rejectWithValue }) => {
    // const { ataArr, taskTypeArr, planeID } = data;

    try {
      const response = await $authHost.get(params);

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить PlanesTasks");
    }
  }
);

export const updatePlaneTasksForTimes = createAsyncThunk(
  "mtx/updatePlaneTasksForTimes",

  async (data: any, thunkAPI) => {
    const { planeID, timeMOS, timeHRS, timeAFL, timeENC, timeAPUS } = data;
    try {
      const response = await $authHost.put(
        `/planesTasks/update/remain/times/byplaneId`,
        {
          planeID,
          timeMOS,
          timeHRS,
          timeAFL,
          timeENC,
          timeAPUS,
        }
      );
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue("Не удалось updateTasks");
    }
  }
);

export interface IfeatchFilteredPlanesWODUE {
  planeID?: string;
  taskType?: string[];
  dateIn?: any;
  dateOut?: any;
  targetACAFL?: string;
  targetACHRS?: string;
}

export const getFilteredPlanesTasksForDue = createAsyncThunk(
  "mtx/getFilteredPlanesWOForDue",
  async (params: IfeatchFilteredPlanesWODUE, { rejectWithValue }) => {
    const url = new URL(
      "/planesTasks/getFilteredPlanesWOForDue/tasks",
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.planeID) searchParams.append("planeID", params.planeID);
    if (params.dateIn) searchParams.append("dateIn", params.dateIn);
    if (params.dateOut) searchParams.append("dateOut", params.dateOut);
    if (params.targetACAFL)
      searchParams.append("targetACAFL", params.targetACAFL);
    if (params.targetACHRS)
      searchParams.append("targetACHRS", params.targetACHRS);
    if (params.taskType)
      searchParams.append("taskType", params.taskType.join(","));

    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      localStorage.setItem("dueSearchUrl", url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);

export const getFilteredPlanesTasksForDueUpdate = createAsyncThunk(
  "mtx/getFilteredPlanesTasksForDueUpdate",
  async (params: string, { rejectWithValue }) => {
    // const { ataArr, taskTypeArr, planeID } = data;

    try {
      const response = await $authHost.get(params);

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить PlanesTasks");
    }
  }
);

export interface IfeatchFilteredPlanesTasksForWO {
  planeID?: string;
  ata?: string[];
  taskType?: string[];
  taskNbr?: string;
  description?: string;
  regNbr?: string;
  startDate?: any;
  endDate?: any;
  workOrderID?: string;
  workOrderNbr?: string;
  status?: string;
}
export const getFilteredPlanesTasksForWO = createAsyncThunk(
  "mtx/getFilteredPlanesTasksForWO",
  async (params: IfeatchFilteredPlanesTasksForWO, { rejectWithValue }) => {
    // const { ataArr, taskTypeArr, planeID } = data;
    const url = new URL(
      "/planesTasks/getFilteredPlanesTasksForWO/tasks",
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.workOrderNbr)
      searchParams.append("workOrderNbr", params.workOrderNbr);
    if (params.status) searchParams.append("status", params.status);
    if (params.ata) searchParams.append("ata", params.ata.join(","));
    if (params.taskType)
      searchParams.append("taskType", params.taskType.join(","));
    if (params.taskNbr) searchParams.append("taskNbr", params.taskNbr);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.planeID) searchParams.append("planeID", params.planeID);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      localStorage.setItem("taskSearchUrl", url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);

export const getPlaneWOByID = async (workOrderID: string) => {
  // const {} = data;

  try {
    const response = await $authHost.get(`/planeswo/${workOrderID}`);
    return response.data;
  } catch (error) {
    return "Не удалось get planeswo!";
  }
};

export interface IfeatchFilteredProjectTasks {
  planeID?: string;
  ata?: string[];
  taskType?: string[];
  taskNbr?: string;
  description?: string;
  regNbr?: string;
  startDate?: any;
  endDate?: any;
  workOrderID?: string;
  workOrderNbr?: string;
  projectId?: string;
  amtoss?: string;
  woPackageType?: string[];
  projectNames?: string[]; // изменено на массив
  userName?: string;
  position?: string;
  code?: string[]; // добавлен новый параметр
  status?: string[];
  projectGroprojectGroupID?: string;
}
export const getFilteredProjectTasks = createAsyncThunk(
  "mtb/getFilteredProjectTasks",
  async (params: IfeatchFilteredProjectTasks, { rejectWithValue }) => {
    const url = new URL(
      "/projects/tasks/getFilteredProjectsTasks/tasks",
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.workOrderNbr)
      searchParams.append("workOrderNbr", params.workOrderNbr);

    if (params.ata) searchParams.append("ata", params.ata.join(","));
    if (params.taskType)
      searchParams.append("taskType", params.taskType.join(","));
    if (params.taskNbr) searchParams.append("taskNbr", params.taskNbr);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectId", params.projectId);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);
export const getFilteredProjectTask = createAsyncThunk(
  "mtb/getFilteredProjectTask",
  async (params: IfeatchFilteredProjectTasks, { rejectWithValue }) => {
    const url = new URL(
      "/projects/tasks/getFilteredProjectsTasks/tasks",
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.workOrderNbr)
      searchParams.append("workOrderNbr", params.workOrderNbr);

    if (params.ata) searchParams.append("ata", params.ata.join(","));
    if (params.taskType)
      searchParams.append("taskType", params.taskType.join(","));
    if (params.taskNbr) searchParams.append("taskNbr", params.taskNbr);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectId", params.projectId);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);
export interface IfeatchFilteredAplications {
  ata?: string[];
  taskType?: string[];
  taskNbr?: string;
  description?: string;
  regNbr?: string;
  dateIn?: any;
  dateOut?: any;
  workOrderID?: string;
  workOrderNbr?: string;
  amtoss?: string;
  woPackageType?: string[];
  userName?: string;
  position?: string;
  code?: string[]; // добавлен новый параметр
  status?: string[];
  planeType?: string;
  aplicationName?: string;
  planeNumber?: string;
  companyName?: string;
  companyID: string;
  aplicationID?: string;
}
export const getFilteredAplications = createAsyncThunk(
  "mplaning/getFilteredAplications",
  async (params: IfeatchFilteredAplications, { rejectWithValue }) => {
    const url = new URL(
      `aplications/getFilteredAplications/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.amtoss) searchParams.append("amtoss", params.amtoss);
    if (params.workOrderNbr)
      searchParams.append("workOrderNbr", params.workOrderNbr);

    if (params.ata) searchParams.append("ata", params.ata.join(","));
    if (params.aplicationID)
      searchParams.append("aplicationID", params.aplicationID);
    if (params.taskType)
      searchParams.append("taskType", params.taskType.join(","));
    if (params.taskNbr) searchParams.append("taskNbr", params.taskNbr);
    if (params.description)
      searchParams.append("description", params.description);

    if (params.dateIn) searchParams.append("dateIn", params.dateIn);
    if (params.dateOut) searchParams.append("endDate", params.dateOut);
    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.aplicationName)
      searchParams.append("aplicationName", params.aplicationName);
    if (params.status) searchParams.append("status", params.status.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузитьAplications");
    }
  }
);

export interface IFeatchplication {
  companyID: string;
  aplicationID: string;
}
export const getAplicationByID = createAsyncThunk(
  "mtp/getAplicationByID",
  async (data: IFeatchplication, { rejectWithValue }) => {
    const { aplicationID, companyID } = data;

    try {
      const response = await $authHost.get(`/aplications/${aplicationID}`);
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);
export interface IUpdateProjectAplicationByID {
  companyID: string;
  aplicationID: string;
  newData: any;
}
export const updateProjectAplicationByID = createAsyncThunk(
  "mtp/updateProjectAplicationByID",
  async (data: IUpdateProjectAplicationByID, { rejectWithValue }) => {
    const { aplicationID, companyID, newData } = data;

    try {
      const response = await $authHost.put(
        `/aplications/${aplicationID}`,
        newData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);

export interface IfindTasksAndCalculateTotalTime {
  taskDTO: ITaskDTO[];
}
export const findTasksAndCalculateTotalTime = createAsyncThunk(
  "mtp/findTasksAndCalculateTotalTime",
  async (data: IfindTasksAndCalculateTotalTime, { rejectWithValue }) => {
    const { taskDTO } = data;

    try {
      const response = await $authHost.post(
        `/tasks/findTasksAndCalculateTotalTime/`,
        taskDTO
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);
export interface IfindMaterialsByTaskNumbers {
  taskDTO: ITaskDTO[];
}
export const findMaterialsByTaskNumbers = createAsyncThunk(
  "mtp/findMaterialsByTaskNumbers",
  async (data: IfindMaterialsByTaskNumbers, { rejectWithValue }) => {
    const { taskDTO } = data;

    try {
      const response = await $authHost.post(
        `/materials/findMaterialsByTaskNumbers/`,
        taskDTO
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);
export interface IfindInstrumentsByTaskNumbers {
  taskDTO: ITaskDTO[];
}
export const findInstrumentsByTaskNumbers = createAsyncThunk(
  "mtp/findInstrumentsByTaskNumbers",
  async (data: IfindInstrumentsByTaskNumbers, { rejectWithValue }) => {
    const { taskDTO } = data;

    try {
      const response = await $authHost.post(
        `/instruments/findInstrumentsByTaskNumbers/`,
        taskDTO
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить instruments");
    }
  }
);

export interface IfeatchFilteredProjects {
  ata?: string[];
  taskType?: string[];
  taskNbr?: string;
  description?: string;
  regNbr?: string;
  dateIn?: any;
  dateOut?: any;
  workOrderID?: string;
  projectWO?: string;
  customer?: string;
  userName?: string;

  code?: string[]; // добавлен новый параметр
  status?: string[];
  planeType?: string[];
  aplicationName?: string;
  planeNumber?: string;
  companyName?: string;
  companyID: string;
  woPackageType?: string[];
  projectType?: string[];
  startDate?: any;
  endDate?: any;
  planedStartDate?: any;
  planedEndDate?: any;
  createStartDate?: any;
  createFinishDate?: any;
}
export const getFilteredProjects = createAsyncThunk(
  "mplaning/getFilteredProjects",
  async (params: IfeatchFilteredProjects, { rejectWithValue }) => {
    const url = new URL(
      `projects/getFilteredProjects/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();
    if (params.createStartDate)
      searchParams.append("createStartDate", params.createStartDate);
    if (params.createFinishDate)
      searchParams.append("createFinishDate", params.createFinishDate);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.customer) searchParams.append("customer", params.customer);
    if (params.planedStartDate)
      searchParams.append("planedStartDate", params.planedStartDate);
    if (params.planedEndDate)
      searchParams.append("planedEndDate", params.planedEndDate);
    if (params.planeNumber)
      searchParams.append("planeNumber", params.planeNumber);
    if (params.projectWO) searchParams.append("projectWO", params.projectWO);
    if (params.woPackageType)
      searchParams.append("woPackageType", params.woPackageType.join(","));
    if (params.projectType)
      searchParams.append("projectType", params.projectType.join(","));
    if (params.planeType)
      searchParams.append("planeType", params.planeType.join(","));

    if (params.dateIn) searchParams.append("dateIn", params.dateIn);
    if (params.dateOut) searchParams.append("endDate", params.dateOut);
    if (params.status) searchParams.append("status", params.status.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Projects");
    }
  }
);
export interface IupdateProjectTaskActions {
  projectTaskId: string;
  actionIndex: number;
  updatedAction: IActionType;
  currentProjectTask: IProjectTask | null;
}
export const updateProjectTaskActions = createAsyncThunk(
  "tasks/updateProjectTaskAction",
  async (data: IupdateProjectTaskActions, { rejectWithValue }) => {
    // Получить текущий документ задачи из базы данных

    const { projectTaskId, actionIndex, updatedAction, currentProjectTask } =
      data;

    // Создать новый массив действий с обновленным действием
    const updatedActions =
      currentProjectTask && currentProjectTask.actions
        ? currentProjectTask.actions.map(
            (action: IActionType, index: number) => {
              if (index === actionIndex) {
                return updatedAction;
              }
              return action;
            }
          )
        : [];

    // Обновить документ задачи с новым массивом действий
    try {
      const response = await $authHost.put(
        `/projects/tasks/${projectTaskId}/actions`,
        updatedActions
      );
      return {
        projectTaskId,
        updatedTask: {
          ...currentProjectTask,
          actions: updatedActions,
        },
      };
    } catch (error) {
      return rejectWithValue("Не удалось update action");
    }

    // Вернуть обновленный документ задачи
  }
);
export interface IgetFilteredUsersprops {
  companyID: string;
  pass?: number;
  singNumber?: number;
}

export const getFilteredUsers = async (params: IgetFilteredUsersprops) => {
  const url = new URL(
    `users/getFilteredUsers/company/${params.companyID}`,
    API_URL
  );
  const searchParams = new URLSearchParams();
  if (params.pass) searchParams.append("pass", String(params.pass));
  if (params.singNumber)
    searchParams.append("singNumber", String(params.singNumber));
  url.search = searchParams.toString();
  try {
    const response = await $authHost.get(url.toString());

    return response.data;
  } catch (error) {
    return error;
  }
};

export const createNRCMTB = createAsyncThunk(
  "saveNRC",
  async (data: any, { rejectWithValue }) => {
    const {
      ownerId,
      projectId,
      taskId,
      finishDate,
      optional,
      planedFinishDate,
      planedStartDate,
      startDate,
      createDate,
      taskType,
      status,
      isDoubleInspectionRequired,
      workStepReferencesLinks,
      actions,
      material,
      location,
      projectTaskID,
      taskDescription,
      editMode,
      plane,
      planeId,
      taskHeadLine,
      resourcesRequests,
      currentAction,
      currentActiveIndex,
      additionalNumberId,
      projectWO,
      projectTaskWO,
      companyID,
      zoneNbr,
      steps,

      ata,
      zone,
      area,
      position,
      ТResources,
      nrcType,
      skill,
    } = data;

    try {
      const response = await $authHost.post(
        `projects/${projectId}/additionalTasks`,
        {
          taskId: taskId,
          createDate: createDate,
          ownerId: ownerId,
          planedFinishDate: planedFinishDate,
          optional: optional,
          startDate: startDate,
          planedStartDate: planedStartDate,
          finishDate: finishDate,
          projectId: projectId,
          taskType: taskType,
          status: status,
          isDoubleInspectionRequired: isDoubleInspectionRequired,
          workStepReferencesLinks: workStepReferencesLinks,
          actions: actions,
          material: material,
          location: location,
          projectTaskID: projectTaskID,
          taskDescription: taskDescription,
          editMode: editMode,
          plane: plane,
          planeId: planeId,
          taskHeadLine: taskHeadLine,
          resourcesRequests: resourcesRequests,
          additionalNumberId,
          projectWO,
          projectTaskWO,
          companyID,
          zoneNbr,
          ata,
          area,
          zone,
          position,
          ТResources,
          nrcType,
          skill,
          steps,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось создать задачу");
    }
  }
);
export interface IfeatchFilteredAditionalTask {
  planeID?: string;
  ata?: string[];
  taskType?: string[];
  taskNbr?: string;
  regNbr?: string;
  startDate?: any;
  endDate?: any;
  workOrderID?: string;
  workOrderNbr?: string;
  projectId?: string;
  amtoss?: string;
  woPackageType?: string[];
  projectNames?: string[]; // изменено на массив
  userName?: string;
  position?: string;
  code?: string[]; // добавлен новый параметр
  status?: string[];

  companyID: string;

  registrationNumber?: string;
  companyName?: string;

  taskDescription?: string;

  projectTaskID?: string;
  projectTaskWO?: string;
  projectWO?: string[];

  tResources?: string[];
  nrcType?: string[];
  skill?: string[];
  taskHeadLine?: string;
}

export const getFilteredAditionalTasks = createAsyncThunk(
  "mtb/getFilteredAditionalTasks",
  async (params: IfeatchFilteredAditionalTask, { rejectWithValue }) => {
    const url = new URL(
      `/additionalTask/getFilteredAditionalTasks/company/${params.companyID}/tasks`,
      API_URL
    );
    const searchParams = new URLSearchParams();
    if (params.companyName)
      searchParams.append("companyName", params.companyName);
    if (params.registrationNumber)
      searchParams.append("registrationNumber", params.registrationNumber);
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.taskHeadLine)
      searchParams.append("taskHeadLine", params.taskHeadLine);
    if (params.tResources)
      searchParams.append("tResources", params.tResources.join(","));
    if (params.nrcType)
      searchParams.append("nrcType", params.nrcType.join(","));
    if (params.skill) searchParams.append("skill", params.skill.join(","));
    if (params.ata) searchParams.append("ata", params.ata.join(","));
    if (params.taskType)
      searchParams.append("taskType", params.taskType.join(","));
    if (params.taskNbr) searchParams.append("taskNbr", params.taskNbr);
    if (params.taskDescription)
      searchParams.append("taskDescription", params.taskDescription);
    if (params.projectId) searchParams.append("projectId", params.projectId);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить NRC");
    }
  }
);

export const getFilteredAditionalTask = createAsyncThunk(
  "mtb/getFilteredAditionalTask",
  async (params: IfeatchFilteredAditionalTask, { rejectWithValue }) => {
    const url = new URL(
      `/additionalTask/getFilteredAditionalTasks/company/${params.companyID}/tasks`,
      API_URL
    );
    const searchParams = new URLSearchParams();
    if (params.workOrderNbr)
      searchParams.append("workOrderNbr", params.workOrderNbr);
    if (params.companyName)
      searchParams.append("companyName", params.companyName);
    if (params.registrationNumber)
      searchParams.append("registrationNumber", params.registrationNumber);
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.taskHeadLine)
      searchParams.append("taskHeadLine", params.taskHeadLine);
    if (params.tResources)
      searchParams.append("tResources", params.tResources.join(","));
    if (params.nrcType)
      searchParams.append("nrcType", params.nrcType.join(","));
    if (params.skill) searchParams.append("skill", params.skill.join(","));
    if (params.ata) searchParams.append("ata", params.ata.join(","));
    if (params.taskType)
      searchParams.append("taskType", params.taskType.join(","));
    if (params.taskNbr) searchParams.append("taskNbr", params.taskNbr);
    if (params.taskDescription)
      searchParams.append("taskDescription", params.taskDescription);
    if (params.projectId) searchParams.append("projectId", params.projectId);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить NRC");
    }
  }
);

export interface IUpdateProjectTasksByIds {
  ids: any[];
  status?: string;
  cascader?: string[];
  rewiewStatus?: string;
  userWorkData?: Object;
  projectGroprojectGroupID?: string;
}
export const updateProjectTasksByIds = createAsyncThunk(
  "mtb/updateProjectTasksByIds",

  async (data: IUpdateProjectTasksByIds, thunkAPI) => {
    const {
      ids,
      status,
      cascader,
      rewiewStatus,
      userWorkData,
      projectGroprojectGroupID,
    } = data;
    try {
      const response = await $authHost.put(
        `/projects/tasks/updateProjectTasksByIds/tasks`,
        {
          ids,
          status,
          cascader,
          rewiewStatus,
          userWorkData,
          projectGroprojectGroupID,
        }
      );
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue("Не удалось updateTasks");
    }
  }
);
export interface ICreateProjectGroup {
  groupName: string;
  groupDescription: string;
  projectId: string;
  companyID: string;
  createDate: Date;
  status: string;
  createUserID: string;
}

export const createProjectGroup = createAsyncThunk(
  "mtx/createProjectGroup",

  async (data: ICreateProjectGroup, thunkAPI) => {
    const {
      groupDescription,
      groupName,
      companyID,
      projectId,
      createDate,
      status,
      createUserID,
    } = data;
    try {
      const response = await $authHost.post(
        `groups/company/${data.companyID}`,
        {
          groupDescription,
          groupName,
          companyID,
          projectId,
          createDate,
          status,
          createUserID,
        }
      );
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue("Не удалось создать new W/O!");
    }
  }
);
export interface IfeatchFilteredGroups {
  regNbr?: string;
  startDate?: any;
  endDate?: any;
  workOrderID?: string;
  workOrderNbr?: string;
  projectId: string;
  userName?: string;
  status?: string[];
  companyID: string;
  registrationNumber?: string;
  companyName?: string;
  taskDescription?: string;
  projectWO?: string[];
}

export const getFilteredGroups = createAsyncThunk(
  "mtb/getFilteredGroups",
  async (params: IfeatchFilteredGroups, { rejectWithValue }) => {
    const url = new URL(
      `/groups/getFilteredProjectGroups/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();
    if (params.companyName)
      searchParams.append("companyName", params.companyName);
    if (params.registrationNumber)
      searchParams.append("registrationNumber", params.registrationNumber);

    if (params.taskDescription)
      searchParams.append("taskDescription", params.taskDescription);
    if (params.projectId) searchParams.append("projectId", params.projectId);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.status) searchParams.append("status", params.status.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить NRC");
    }
  }
);

export interface IfeatchFilteredProjectTasks {
  planeID?: string;
  ata?: string[];
  taskType?: string[];
  taskNbr?: string;
  description?: string;
  regNbr?: string;
  startDate?: any;
  endDate?: any;
  workOrderID?: string;
  workOrderNbr?: string;
  projectId?: string;
  amtoss?: string;
  woPackageType?: string[];
  projectNames?: string[]; // изменено на массив
  userName?: string;
  position?: string;
  code?: string[]; // добавлен новый параметр
  status?: string[];
  projectGroprojectGroupID?: string;
}
export const getFilteredGroupsTasks = createAsyncThunk(
  "mtb/getFilteredGroupsTasks",
  async (params: IfeatchFilteredProjectTasks, { rejectWithValue }) => {
    const url = new URL(
      "/projects/tasks/getFilteredProjectsTasks/tasks",
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.projectGroprojectGroupID)
      searchParams.append(
        "projectGroprojectGroupID",
        params.projectGroprojectGroupID
      );
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.workOrderNbr)
      searchParams.append("workOrderNbr", params.workOrderNbr);

    if (params.ata) searchParams.append("ata", params.ata.join(","));
    if (params.taskType)
      searchParams.append("taskType", params.taskType.join(","));
    if (params.taskNbr) searchParams.append("taskNbr", params.taskNbr);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectId", params.projectId);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);
// export const getFilteredGroupsTasks = async (
//   params: IfeatchFilteredProjectTasks
// ) => {
//   const url = new URL(
//     '/projects/tasks/getFilteredProjectsTasks/tasks',
//     API_URL
//   );
//   const searchParams = new URLSearchParams();

//   if (params.workOrderID)
//     searchParams.append('workOrderID', params.workOrderID);
//   if (params.workOrderNbr)
//     searchParams.append('workOrderNbr', params.workOrderNbr);

//   if (params.ata) searchParams.append('ata', params.ata.join(','));
//   if (params.taskType)
//     searchParams.append('taskType', params.taskType.join(','));
//   if (params.taskNbr) searchParams.append('taskNbr', params.taskNbr);
//   if (params.description)
//     searchParams.append('description', params.description);
//   if (params.projectId) searchParams.append('projectId', params.projectId);
//   if (params.startDate) searchParams.append('startDate', params.startDate);
//   if (params.endDate) searchParams.append('endDate', params.endDate);
//   if (params.code) searchParams.append('code', params.code.join(','));
//   if (params.position) searchParams.append('position', params.position);
//   if (params.projectNames)
//     searchParams.append('projectNames', params.projectNames.join(','));
//   if (params.status) searchParams.append('status', params.status.join(','));
//   url.search = searchParams.toString();

//   try {
//     const response = await $authHost.get(url.toString());
//     //localStorage.setItem('taskSearchUrl', url.toString());

//     return response.data;
//   } catch (error) {
//     return error;
//   }
// };

export interface IdeleteGroupsByIds {
  ids: any[];
  projectID?: string;
}
export const deleteGroupsByIds = createAsyncThunk(
  `mtb/deleteGroupsByIds`,

  async (data: IdeleteGroupsByIds, thunkAPI) => {
    const { ids, projectID } = data;
    try {
      const response = await $authHost.delete(
        `/groups/deleteGroupsByIds/project/${data.projectID}`,
        { data }
      );
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue("Не удалось updateTasks");
    }
  }
);
export interface IUpdateGroupByID {
  id: string;
  projectID: string;
  groupName: string;
  groupDescription: string;
  status: string;
}
export const updateGroupByID = createAsyncThunk(
  "mtb/updateGroupByID",
  async (data: IUpdateGroupByID, { rejectWithValue }) => {
    const { id, projectID, groupName, groupDescription, status } = data;

    try {
      const response = await $authHost.put(
        `groups/project/${data.projectID}/group/${data.id}`,
        { id, groupName, groupDescription, status }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось обновить задачу");
    }
  }
);

export interface IUpdateProjectAdditionalTasksByIds {
  ids: any[];
  status?: string;
  cascader?: string[];
  rewiewStatus?: string;
  userWorkData?: Object;
  projectGroprojectGroupID?: string;
  projectId?: string;
}
export const updateProjectAdditionalTasksByIds = createAsyncThunk(
  "mtb/updateProjectTasksByIds",

  async (data: IUpdateProjectAdditionalTasksByIds, thunkAPI) => {
    const {
      ids,
      status,
      cascader,
      rewiewStatus,
      userWorkData,
      projectGroprojectGroupID,
      projectId,
    } = data;
    try {
      const response = await $authHost.put(
        `/projects/${projectId}/additionalTasks/updateProjectAdditionalTasksByIds/tasks`,
        {
          ids,
          status,
          cascader,
          rewiewStatus,
          userWorkData,
          projectGroprojectGroupID,
          projectId,
        }
      );
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue("Не удалось updateTasks");
    }
  }
);
export interface ICreateRequirement {
  ids: any[];
  projectID: string;
  companyID: string;
  createDate: Date;
  createUserID: string;
  projectTaskID?: string;
  cascader?: string[];
  rewiewStatus?: string;
  issuedQuantity?: number;
  status: "onCheack" | "canceled" | "open";
}
export const createRequirement = createAsyncThunk(
  "createPurchaseItems",
  async (data: ICreateRequirement, thunkAPI) => {
    try {
      const response = await $authHost.post(
        `/requirements/company/${data.companyID}/project/${data.projectID}`,
        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось создать новую запись");
    }
  }
);
export interface ICreateSingleRequirement {
  projectID: string;
  companyID: string;
  createDate: Date;
  createUserID: string;
  projectTaskID?: string;
  additionalTaskID?: string;
  cascader?: string[];
  rewiewStatus?: string;
  status: "onCheack" | "canceled" | "open";
  registrationNumber?: any;
  taskNumber: string;
  partNumber: string;
  description: string;
  quantity: number;
  alternative?: string;
  unit: string;
  isNewAdded: boolean;
  issuedQuantity: any;
  additionalTaskWO?: any;
  plannedDate?: any;
  id?: any;
  group?: any;
  type?: any;
}
export const createSingleRequirement = createAsyncThunk(
  "mtb/createSingleRequirement",
  async (data: ICreateSingleRequirement, thunkAPI) => {
    try {
      const response = await $authHost.post(
        `/requirements/addsingleitem/company/${data.companyID}/project/${data.projectID}`,
        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось создать новую запись");
    }
  }
);

export interface IfeatchFilteredRequirements {
  taskNumber?: string;
  description?: string;
  regNbr?: string;
  startDate?: any;
  endDate?: any;
  workOrderID?: string;
  projectTaskWO?: any;
  projectId?: string;
  amtoss?: string;
  projectNames?: string[]; // изменено на массив
  userName?: string;
  position?: string;
  code?: string[]; // добавлен новый параметр
  status?: string[];
  projectGroprojectGroupID?: string;
  companyID: string;
  projectTaskID?: string;
  ids?: any[];
  materialOrders?: any[];
  additionalTaskID?: string;
  needOnLocationShop?: string;
  projectIds?: string[];
  partRequestNumber?: number;
  plannedDate?: any;
  reservationQTY?: any;
  foForecast?: any;
  group?: string[];
  type?: string[];
  partNumbers?: string[];
  isAlternatine?: any;
  partRequestNumbers?: number[];
}
export const getFilteredRequirements = createAsyncThunk(
  "mtb/getFilteredRequirements",
  async (params: IfeatchFilteredRequirements, { rejectWithValue }) => {
    const url = new URL(
      `/requirements/getFilteredRequirements/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.projectGroprojectGroupID)
      searchParams.append(
        "projectGroprojectGroupID",
        params.projectGroprojectGroupID
      );
    if (params.partRequestNumbers)
      searchParams.append(
        "partRequestNumbers",
        params.partRequestNumbers.join(",")
      );
    if (params.partNumbers)
      searchParams.append("partNumbers", params.partNumbers.join(","));
    if (params.additionalTaskID)
      searchParams.append("additionalTaskID", params.additionalTaskID);
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);

    if (params.taskNumber) searchParams.append("taskNumber", params.taskNumber);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectID", params.projectId);

    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.ids) searchParams.append("ids", params.ids.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);
export const getFilteredRequirementsForecast = createAsyncThunk(
  "mtb/getFilteredRequirementsForecast",
  async (params: IfeatchFilteredRequirements, { rejectWithValue }) => {
    const url = new URL(
      `/requirements/getFilteredRequirements/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.partRequestNumber)
      searchParams.append(
        "partRequestNumber",
        String(params.partRequestNumber)
      );
    if (params.foForecast) searchParams.append("foForecast", params.foForecast);
    if (params.projectGroprojectGroupID)
      searchParams.append(
        "projectGroprojectGroupID",
        params.projectGroprojectGroupID
      );
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.needOnLocationShop)
      searchParams.append("needOnLocationShop", params.needOnLocationShop);
    if (params.additionalTaskID)
      searchParams.append("additionalTaskID", params.additionalTaskID);
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);
    if (params.regNbr) searchParams.append("planeNumber", params.regNbr);
    if (params.taskNumber) searchParams.append("taskNumber", params.taskNumber);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectID", params.projectId);
    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.group) searchParams.append("group", params.group.join(","));
    if (params.type) searchParams.append("type", params.type.join(","));
    if (params.projectIds)
      searchParams.append("projectIDs", params.projectIds.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.ids) searchParams.append("ids", params.ids.join(","));
    url.search = searchParams.toString();
    if (params.isAlternatine)
      searchParams.append("isAlternatine", params.isAlternatine);

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);
export interface IUpdateRequirementsByIds {
  ids: any[];
  updateUserID: string;
  updateDate: Date;
  status?: "onCheack" | "canceled" | "open" | "inStockReserve";
  companyID: string;
  cascader?: string[];
  rewiewStatus?: string;
}

export const updateRequirementsByIds = createAsyncThunk(
  "mtb/updateRequirementsByIds",

  async (data: IUpdateRequirementsByIds, thunkAPI) => {
    const {
      ids,
      status,
      updateDate,
      updateUserID,
      companyID,
      cascader,
      rewiewStatus,
    } = data;
    try {
      const response = await $authHost.put(
        `/requirements/updateRequirementsByIds/company/${data.companyID}`,
        {
          ids,
          status,
          updateDate,
          updateUserID,
          companyID,
          cascader,
          rewiewStatus,
        }
      );
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue("Не удалось updateTasks");
    }
  }
);
export interface IUpdateRequirementByID {
  id: any;
  updateUserID: string;
  updateDate: Date;
  status?: "onCheack" | "canceled" | "open" | "closed";
  companyID: string;
  cascader?: string[];
  rewiewStatus?: string;
  projectID: string;
  projectTaskID?: string;
  createDate?: string;
  createUserID?: string;
  optional?: any;
  planedFinishDate?: any;
  planedStartDate?: any;
  closeDate?: any;

  materialTaskItemID?: any;
  note?: string;
  PN?: string;
  code?: string;
  taskNumber?: string;
  nameOfMaterial?: string;
  amout?: any;
  alternative?: string;
  unit?: any;
  projectTaskWO?: any;
  requestQuantity?: number;
  issuedQuantity?: number;
  plannedDate?: any;
}
export const updateRequirementByID = createAsyncThunk(
  "mtb/updateRequirementByID",
  async (data: IUpdateRequirementByID, { rejectWithValue }) => {
    const {
      id,
      projectID,
      projectTaskID,
      updateUserID,
      createUserID,
      companyID,
      optional,
      planedFinishDate,
      planedStartDate,
      createDate,
      closeDate,
      updateDate,
      materialTaskItemID,
      status,
      cascader,
      rewiewStatus,
      note,
      PN,
      code,
      taskNumber,
      nameOfMaterial,
      amout,
      alternative,
      unit,
      requestQuantity,
      issuedQuantity,

      projectTaskWO,
      plannedDate,
    } = data;

    try {
      const response = await $authHost.put(
        `/requirements/updateRequirementsByID/company/${data.companyID}/requirement/${id}`,
        {
          id,
          projectID,
          projectTaskID,
          updateUserID,
          createUserID,
          companyID,
          optional,
          planedFinishDate,
          planedStartDate,
          createDate,
          closeDate,
          updateDate,
          materialTaskItemID,
          status,
          cascader,
          rewiewStatus,
          note,
          PN,
          code,
          taskNumber,
          nameOfMaterial,
          amout,
          alternative,
          unit,
          projectTaskWO,
          issuedQuantity,
          requestQuantity,
          plannedDate,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось обновить задачу");
    }
  }
);
export interface IDeleteRequirementsByIds {
  ids: any[];
  projectID: string;
  companyID: string;
}
export const deleteRequirementsByIds = createAsyncThunk(
  `mtb/deleteGroupsByIds`,

  async (data: IDeleteRequirementsByIds, thunkAPI) => {
    const { ids, projectID, companyID } = data;
    try {
      const response = await $authHost.delete(
        `/requirements/deleteRequirementsIds/company/${data.companyID}/project/${data.projectID}`,
        { data }
      );
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue("Не удалось updateTasks");
    }
  }
);

export interface updateRequirementsByBody {
  newData: any;
  status?: "onCheack" | "canceled" | "open" | "inStockReserve" | "onOrder";
  companyID: string;
  plannedDate?: any;
  neededOn?: string;
}

export const updateRequirementsByBody = createAsyncThunk(
  "mtb/updateRequirementsByBody",

  async (data: updateRequirementsByBody, thunkAPI) => {
    const { status, newData, companyID, plannedDate, neededOn } = data;
    try {
      const response = await $authHost.put(
        `/requirements/updateRequirementsByBody/company/${data.companyID}`,
        {
          newData,
          plannedDate,
          neededOn,
        }
      );
      return response.data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      return thunkAPI.rejectWithValue("Не удалось updateTasks");
    }
  }
);

export interface getFilteredMaterialOrders {
  taskNumber?: string;
  description?: string;
  regNbr?: string;
  startDate?: any;
  endDate?: any;
  workOrderID?: string;
  projectTaskWO?: any;
  projectId?: string;
  amtoss?: string;
  projectNames?: string[]; // изменено на массив
  userName?: string;
  position?: string;
  code?: string[]; // добавлен новый параметр
  status?: string[];
  projectGroprojectGroupID?: string;
  companyID: string;
  projectTaskID?: string;
  ids?: any[];
  materialOrders?: any[];
  materialAplicationNumber?: any;
  partNumber?: string;
}

export const getFilteredMaterialOrders = createAsyncThunk(
  "mtb/getFilteredMaterialOrders",
  async (params: getFilteredMaterialOrders, { rejectWithValue }) => {
    const url = new URL(
      `/materialAplications/getFilteredMaterialOrders/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.projectGroprojectGroupID)
      searchParams.append(
        "projectGroprojectGroupID",
        params.projectGroprojectGroupID
      );
    if (params.partNumber) searchParams.append("partNumber", params.partNumber);
    if (params.materialAplicationNumber)
      searchParams.append(
        "materialAplicationNumber",
        params.materialAplicationNumber
      );
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.regNbr) searchParams.append("registrationNumber", params.regNbr);
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);

    if (params.taskNumber) searchParams.append("taskNumber", params.taskNumber);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectId", params.projectId);

    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.ids) searchParams.append("ids", params.ids.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить MaterialOrders");
    }
  }
);
export const getFilteredCancelMaterialOrders = createAsyncThunk(
  "mtb/getFilteredCancelMaterialOrders",
  async (params: getFilteredMaterialOrders, { rejectWithValue }) => {
    const url = new URL(
      `/materialAplications/getFilteredMaterialOrders/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.projectGroprojectGroupID)
      searchParams.append(
        "projectGroprojectGroupID",
        params.projectGroprojectGroupID
      );
    if (params.partNumber) searchParams.append("partNumber", params.partNumber);
    if (params.materialAplicationNumber)
      searchParams.append(
        "materialAplicationNumber",
        params.materialAplicationNumber
      );
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.regNbr) searchParams.append("registrationNumber", params.regNbr);
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);

    if (params.taskNumber) searchParams.append("taskNumber", params.taskNumber);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectId", params.projectId);

    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.ids) searchParams.append("ids", params.ids.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить MaterialOrders");
    }
  }
);
export const getFilteredPickSlip = createAsyncThunk(
  "store/getFilteredPickSlip",
  async (params: getFilteredMaterialOrders, { rejectWithValue }) => {
    const url = new URL(
      `/materialAplications/getFilteredMaterialOrders/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.projectGroprojectGroupID)
      searchParams.append(
        "projectGroprojectGroupID",
        params.projectGroprojectGroupID
      );
    if (params.partNumber) searchParams.append("partNumber", params.partNumber);
    if (params.materialAplicationNumber)
      searchParams.append(
        "materialAplicationNumber",
        params.materialAplicationNumber
      );
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.regNbr) searchParams.append("registrationNumber", params.regNbr);
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);

    if (params.taskNumber) searchParams.append("taskNumber", params.taskNumber);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectId", params.projectId);

    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.ids) searchParams.append("ids", params.ids.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить MaterialOrders");
    }
  }
);

export interface getFilteredMaterialItems {
  taskNumber?: string;
  description?: string;
  regNbr?: string;
  startDate?: any;
  endDate?: any;
  workOrderID?: string;
  projectTaskWO?: any;
  projectId?: string;
  amtoss?: string;
  projectNames?: string[]; // изменено на массив
  userName?: string;
  position?: string;
  code?: string[]; // добавлен новый параметр
  status?: string[];
  projectGroprojectGroupID?: string;
  companyID: string;
  projectTaskID?: string;
  ids?: any[];
  ID?: string;
  STOCK?: string;
  PART_NUMBER?: any;
  SERIAL_NUMBER?: any;
  GROUP?: any;
  TYPE?: any;
  alternatives?: any[];
  location?: any[];
  condition?: any;
  localID?: any;
  isAllDate?: any;
  isAlternative?: any;
}

export const getFilteredMaterialItems = createAsyncThunk(
  "mtb/getFilteredMaterialItems",
  async (params: getFilteredMaterialItems, { rejectWithValue }) => {
    const url = new URL(
      `/materialStore/getFilteredItems/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();
    if (params.location)
      searchParams.append("location", params.location.join(","));
    if (params.isAllDate) searchParams.append("isAllExpDate", params.isAllDate);
    if (params.isAlternative)
      searchParams.append("isAlternative", params.isAlternative);
    if (params.localID) searchParams.append("localID", params.localID);
    if (params.ID) searchParams.append("ID", params.ID);
    if (params.PART_NUMBER)
      searchParams.append("PART_NUMBER", params.PART_NUMBER);
    if (params.SERIAL_NUMBER)
      searchParams.append("SERIAL_NUMBER", params.SERIAL_NUMBER);
    if (params.GROUP) searchParams.append("GROUP", params.GROUP.join(","));
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);

    if (params.taskNumber) searchParams.append("taskNumber", params.taskNumber);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectId", params.projectId);
    if (params.alternatives)
      searchParams.append("alternatives", params.alternatives.join(","));
    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.STOCK) searchParams.append("STOCK", params.STOCK);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.ids) searchParams.append("ids", params.ids.join(","));
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить MaterialOrders");
    }
  }
);
export const getFilteredMaterialItemsStock = createAsyncThunk(
  "mtb/getFilteredMaterialStockItems",
  async (params: getFilteredMaterialItems, { rejectWithValue }) => {
    const url = new URL(
      `/materialStore/getFilteredItems/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.isAllDate) searchParams.append("isAllExpDate", params.isAllDate);

    if (params.alternatives)
      searchParams.append("alternatives", params.alternatives.join(","));
    if (params.ID) searchParams.append("ID", params.ID);
    if (params.PART_NUMBER)
      searchParams.append("PART_NUMBER", params.PART_NUMBER);
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);

    if (params.taskNumber) searchParams.append("taskNumber", params.taskNumber);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectId", params.projectId);

    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.STOCK) searchParams.append("STOCK", params.STOCK);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.ids) searchParams.append("ids", params.ids.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить MaterialOrders");
    }
  }
);
export const getFilteredTransferStockItems = createAsyncThunk(
  "mtb/getFilteredTransferStockItems",
  async (params: getFilteredMaterialItems, { rejectWithValue }) => {
    const url = new URL(
      `/materialStore/getFilteredItems/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();
    if (params.alternatives)
      searchParams.append("alternatives", params.alternatives.join(","));
    if (params.ID) searchParams.append("ID", params.ID);
    if (params.PART_NUMBER)
      searchParams.append("PART_NUMBER", params.PART_NUMBER);
    if (params.location)
      searchParams.append("location", params.location.join(","));
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);

    if (params.taskNumber) searchParams.append("taskNumber", params.taskNumber);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectId", params.projectId);

    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.STOCK) searchParams.append("STOCK", params.STOCK);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.ids) searchParams.append("ids", params.ids.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить MaterialOrders");
    }
  }
);
export const getFilteredUnserviseStockItems = createAsyncThunk(
  "mtb/getFilteredUnserviseStockItems",
  async (params: getFilteredMaterialItems, { rejectWithValue }) => {
    const url = new URL(
      `/materialStore/getFilteredItems/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();
    if (params.alternatives)
      searchParams.append("alternatives", params.alternatives.join(","));
    if (params.ID) searchParams.append("ID", params.ID);
    if (params.condition) searchParams.append("condition", params.condition);
    if (params.PART_NUMBER)
      searchParams.append("PART_NUMBER", params.PART_NUMBER);
    if (params.location)
      searchParams.append("location", params.location.join(","));
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);

    if (params.taskNumber) searchParams.append("taskNumber", params.taskNumber);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectId", params.projectId);

    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.STOCK) searchParams.append("STOCK", params.STOCK);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.ids) searchParams.append("ids", params.ids.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить MaterialOrders");
    }
  }
);
export const getFilteredStockDetails = createAsyncThunk(
  "mtb/getFilteredStockDetails",
  async (params: getFilteredMaterialItems, { rejectWithValue }) => {
    const url = new URL(
      `/materialStore/getFilteredItems/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();
    if (params.isAllDate) searchParams.append("isAllExpDate", params.isAllDate);
    if (params.alternatives)
      searchParams.append("alternatives", params.alternatives.join(","));
    if (params.ID) searchParams.append("ID", params.ID);
    if (params.PART_NUMBER)
      searchParams.append("PART_NUMBER", params.PART_NUMBER);
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);

    if (params.taskNumber) searchParams.append("taskNumber", params.taskNumber);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectId", params.projectId);

    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.STOCK) searchParams.append("STOCK", params.STOCK);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.ids) searchParams.append("ids", params.ids.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить MaterialOrders");
    }
  }
);
export const getFilteredItemsStockQuantity = createAsyncThunk(
  "mtb/getFilteredItemsStockQuantity",
  async (params: any, { rejectWithValue }) => {
    const url = new URL(
      `/materialStore/getFilteredItemsStockQuantity/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.ID) searchParams.append("ID", params.ID);
    if (params.isAllDate) searchParams.append("isAllDate", params.isAllDate);
    if (params.PART_NUMBER)
      if (params.isAlternative)
        searchParams.append("isAlternative", params.isAlternative);
    searchParams.append("PART_NUMBER", params.PART_NUMBER);
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);

    if (params.taskNumber) searchParams.append("taskNumber", params.taskNumber);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectId", params.projectId);

    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.ids) searchParams.append("ids", params.ids.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить MaterialOrders");
    }
  }
);

export const updatedMaterialOrdersById = createAsyncThunk(
  "store/updatedMaterialOrdersById",
  async (data: any, { rejectWithValue }) => {
    const {
      _id,
      completedDate,
      createDate,
      id,
      materialAplicationNumber,
      materials,
      planeType,
      projectId,
      projectTaskId,
      projectTaskWO,
      projectWO,
      registrationNumber,
      status,
      taskNumber,
      user,
      userId,
      editedAction,
      isPickSlipCreated,
      closedDate,
      createBy,
      additionalTaskId,
      onBlock,
      pickSlipID,
      pickSlipNumber,
      userTelID,
      updateUserID,
      updateBy,
      updateDate,
      returnPickIDs,
    } = data;

    try {
      const response = await $authHost.put(`/materialAplications/${_id}`, {
        completedDate,
        createDate,
        id,
        materialAplicationNumber,
        materials,
        planeType,
        projectId,
        projectTaskId,
        projectTaskWO,
        projectWO,
        registrationNumber,
        status,
        taskNumber,
        user,
        userId,
        editedAction,
        isPickSlipCreated,
        closedDate,
        createBy,
        additionalTaskId,
        onBlock,
        pickSlipID,
        pickSlipNumber,
        userTelID,
        updateUserID,
        updateBy,
        updateDate,
        returnPickIDs,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявку");
    }
  }
);

export interface IUpdatedMaterialItemsById {
  STOCK?: string;
  NAME_OF_MATERIAL?: string;
  UNIT_OF_MEASURE?: string;
  PART_NUMBER?: string;
  RACK_NUMBER?: string;
  SHELF_NUMBER?: string;
  QUANTITY?: number;
  BATCH?: string;
  BATCH_ID?: string;
  CUSTOMER_MATERIAL?: boolean;
  SERIAL_NUMBER?: string;
  ID?: string;
  RESERVATION?: number;
  PRICE?: string;
  PRODUCT_EXPIRATION_DATE?: Date;
  INVENTORY_ACCOUNT?: string;
  _id?: string;
  id?: string;
  companyID?: string;
  ONBLOCK_QUANTITY?: number;
  RESERVATION_TASKSIDS?: any[];
  STATUS?: string;
  issuedQuantity?: number;
  localID?: any;
  ids?: any[];
  LOCATION?: any;
  OWNER?: any;
  files?: any;
  FILES?: any;
  RECEIVED_DATE?: any;
  AWB_DATE?: any;
  AWB_NUMBER?: any;
  AWB_TYPE?: any;
  AWB_REFERENCE?: any;
  SUPPLIER_BATCH_NUMBER?: any;
}

export const updatedMaterialItemsById = createAsyncThunk(
  "updatedMaterialItemsById",
  async (data: IUpdatedMaterialItemsById, { rejectWithValue }) => {
    try {
      const response = await $authHost.put(
        `/materialStore/updateForBlock/companyID/${data.companyID}/item/${
          data.ID || data._id
        }`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявку");
    }
  }
);

export const updatedMaterialItemsByIdAfterIssued = createAsyncThunk(
  "updatedMaterialItemsByIdAfterIssued",
  async (data: IMaterialStoreRequestItem, { rejectWithValue }) => {
    try {
      const response = await $authHost.put(
        `/materialStore/update/${data.ID}/${data.BATCH}/issued/${data.QUANTITY}`,
        { data }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявку");
    }
  }
);

export interface IFeatchPickSlipByID {
  pickSlipID?: string;
  companyID: string;
  returnSlipID?: string;
}
export const featchPickSlipByID = createAsyncThunk(
  "featchPickSlipByID",
  async (data: IFeatchPickSlipByID, thunkAPI) => {
    try {
      const response = await $authHost.get(
        `/pickSlips/company/${data.companyID}/pickSlip/${data.pickSlipID}`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("ERROR");
    }
  }
);
export const featchReturnSlipByID = createAsyncThunk(
  "featchReturnSlipByID",
  async (data: IFeatchPickSlipByID, thunkAPI) => {
    try {
      const response = await $authHost.get(
        `/returnSlips/company/${data.companyID}/returnSlip/${data.returnSlipID}`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("ERROR");
    }
  }
);

export interface getFilteredPickSlips {
  taskNumber?: string;
  description?: string;
  regNbr?: string;
  startDate?: any;
  endDate?: any;
  workOrderID?: string;
  projectTaskWO?: any;
  projectId: string;
  amtoss?: string;
  projectNames?: string[]; // изменено на массив
  userName?: string;
  position?: string;
  code?: string[]; // добавлен новый параметр
  status?: string[];
  projectGroprojectGroupID?: string;
  companyID: string;
  projectTaskID?: string;
  ids?: any[];
  pickSlips?: any[];
}
export const getFilteredPickSlips = createAsyncThunk(
  "store/getFilteredPickSlips",
  async (params: getFilteredPickSlips, { rejectWithValue }) => {
    const url = new URL(
      `/pickSlips/getFilteredPickSlips/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.projectGroprojectGroupID)
      searchParams.append(
        "projectGroprojectGroupID",
        params.projectGroprojectGroupID
      );
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);

    if (params.taskNumber) searchParams.append("taskNumber", params.taskNumber);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectId", params.projectId);

    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.ids) searchParams.append("ids", params.ids.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить MaterialOrders");
    }
  }
);

export interface IcreateRemoveInstallComponents {
  projectId: string;
  companyID: string;
  createDate: Date;
  createUserID: string;
  accessIds?: string[];
  projectTaskIds?: string[];
  additionalTaskIds?: string[];
}
export const createRemoveInstallComponents = createAsyncThunk(
  "planning/createRemoveInstallComponents",
  async (data: IcreateRemoveInstallComponents, thunkAPI) => {
    try {
      const response = await $authHost.post(
        `removedItems/company/${data.companyID}/project/${data.projectId}`,
        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось создать новую запись");
    }
  }
);

export interface IfeatchFilteredRemovedItems {
  taskNumber?: string;
  description?: string;
  regNbr?: string;
  startDate?: any;
  endDate?: any;
  workOrderID?: string;
  projectTaskWO?: any;
  projectId: string;
  amtoss?: string;
  projectNames?: string[]; // изменено на массив
  userName?: string;
  position?: string;
  code?: string[]; // добавлен новый параметр
  status?: string[];
  projectGroprojectGroupID?: string;
  companyID: string;
  projectTaskID?: string;
  ids?: any[];
  materialOrders?: any[];
  additionalTaskID?: string;
}
export const getFilteredRemoverdItemsForPrint = createAsyncThunk(
  "mtb/getFilteredRemoverdItemsForPrint",
  async (params: IfeatchFilteredRemovedItems, { rejectWithValue }) => {
    const url = new URL(
      `removedItems/getFilteredRemovedItems/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.projectGroprojectGroupID)
      searchParams.append(
        "projectGroprojectGroupID",
        params.projectGroprojectGroupID
      );
    if (params.additionalTaskID)
      searchParams.append("additionalTaskID", params.additionalTaskID);
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);

    if (params.taskNumber) searchParams.append("taskNumber", params.taskNumber);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectID", params.projectId);

    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.ids) searchParams.append("ids", params.ids.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);

export const getFilteredRemoverdItems = createAsyncThunk(
  "mtb/getFilteredRemoverdItems",
  async (params: IfeatchFilteredRemovedItems, { rejectWithValue }) => {
    const url = new URL(
      `removedItems/getFilteredRemovedItems/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.projectGroprojectGroupID)
      searchParams.append(
        "projectGroprojectGroupID",
        params.projectGroprojectGroupID
      );
    if (params.additionalTaskID)
      searchParams.append("additionalTaskID", params.additionalTaskID);
    if (params.projectTaskID)
      searchParams.append("projectTaskID", params.projectTaskID);
    if (params.workOrderID)
      searchParams.append("workOrderID", params.workOrderID);
    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);

    if (params.taskNumber) searchParams.append("taskNumber", params.taskNumber);
    if (params.description)
      searchParams.append("description", params.description);
    if (params.projectId) searchParams.append("projectID", params.projectId);

    if (params.code) searchParams.append("code", params.code.join(","));
    if (params.position) searchParams.append("position", params.position);
    if (params.projectNames)
      searchParams.append("projectNames", params.projectNames.join(","));
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.ids) searchParams.append("ids", params.ids.join(","));
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить Planes");
    }
  }
);

interface IfeatchFilteredAccess {
  accessNbr?: string;
  description?: string;
  companyID: string;
  acType: string;
  zone?: string;
  subZone?: string;
  type?: string;
}

export const getfilteredAccessNumbers = async (
  params: IfeatchFilteredAccess
) => {
  // const {} = data;
  const url = new URL(
    `panels/getfilteredAccessNumbers/company/${params.companyID}`,
    API_URL
  );
  const searchParams = new URLSearchParams();

  if (params.accessNbr) searchParams.append("accessNbr", params.accessNbr);
  if (params.acType) searchParams.append("acType", params.acType);
  if (params.description)
    searchParams.append("description", params.description);
  if (params.zone) searchParams.append("zone", params.zone);
  if (params.subZone) searchParams.append("subZone", params.subZone);
  if (params.type) searchParams.append("type", params.type);
  url.search = searchParams.toString();

  try {
    const response = await $authHost.get(url.toString());
    return response.data;
  } catch (error) {
    return "Не удалось загрузить задачи";
  }
};

export interface IcreateRemoveInstallSingleComponent {
  projectId: string;
  companyID: string;
  createDate: Date;
  createUserID: string;
  accessIds?: any[] | null;
  projectTaskIds?: string[];
  additionalTaskIds?: string[];
  projectTaskWOs?: number[];
  additionalTaskWOs?: number[];
  serialNbr?: string;
  type?: string;
  panelNbr?: string;
  removeItem?: Object;
  installItem?: Object;
}

export const createRemoveInstallSingleComponent = createAsyncThunk(
  "planning/createRemoveInstallSingleComponent",
  async (data: IcreateRemoveInstallSingleComponent, thunkAPI) => {
    try {
      const response = await $authHost.post(
        `removedItems/createSingleComponent/company/${data.companyID}/project/${data.projectId}`,
        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось создать новую запись");
    }
  }
);

export type updateRemovedItemProps = {
  removeManId?: string;
  installManId?: string;
  updateDate: any;
  removeDate?: any;
  installDate?: any;
  status: string;
  removeItem?: Object;
  installItem?: Object;
  ids: any[];
  updateUserID: string;
  companyID: string;
};

export const updateRemovedItemByIds = createAsyncThunk(
  "mtb/updateremovedItem",
  async (data: updateRemovedItemProps, { rejectWithValue }) => {
    try {
      const response = await $authHost.put(
        `/removedItems/updateremovedItemByIds/update/company/${data.companyID}`,
        { data }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заявку");
    }
  }
);
export type getfilteredPartNumbersProps = {
  alternatine?: string;
  companyID: string;
  partNumber?: string;
  description?: string;
  group?: any[];
};

export const getFilteredAlternativePN = createAsyncThunk(
  "mtb/getFilteredAlternativePN",
  async (params: getfilteredPartNumbersProps, { rejectWithValue }) => {
    const url = new URL(
      `alternative/getFilteredAlternativePN/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.partNumber) searchParams.append("partNumber", params.partNumber);
    if (params.group) searchParams.append("group", params.group.join(","));

    if (params.alternatine)
      searchParams.append("alternatine", params.alternatine);

    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      return response.data;
    } catch (error) {
      return "Не удалось загрузить PN";
    }
  }
);
export const getFilteredPartNumber = createAsyncThunk(
  "enginiring/getFilteredPartNumber",
  async (params: getfilteredPartNumbersProps, { rejectWithValue }) => {
    const url = new URL(
      `partNumbers/getFilteredPartNumber/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.partNumber) searchParams.append("partNumber", params.partNumber);
    if (params.group) searchParams.append("group", params.group.join(","));

    if (params.alternatine)
      searchParams.append("alternatine", params.alternatine);

    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      return response.data;
    } catch (error) {
      return "Не удалось загрузить PN";
    }
  }
);

export interface IfeatchFilteredShops {
  shopShortName?: string;
  shopLongName?: string;
  status?: string[];
  planeNumber?: string;

  companyID: string;
  shopType?: string[];
  updateDate?: string;
  updateUserID?: string;
}
export const getFilteredShops = createAsyncThunk(
  "common/getFilteredShops",
  async (params: any, { rejectWithValue }) => {
    const url = new URL(
      `shops/getFilteredShops/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.shopShortName)
      searchParams.append("shopShortName", params.shopShortName);

    if (params.shopLongName)
      searchParams.append("shopLongName", params.shopLongName);

    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить SHOPS");
    }
  }
);
export const updateStoreByID = createAsyncThunk(
  "common/updateStoreByID",
  async (data: IStore, { rejectWithValue }) => {
    try {
      console.log(data);
      const response = await $authHost.put(
        `/shops/${data._id || data.id}/company/${data.companyID}/`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось update store");
    }
  }
);

export const postNewStoreShop = createAsyncThunk(
  "common/postNewStoreShop",
  async (data: IStore, thunkAPI) => {
    try {
      const response = await $authHost.post(
        `shops/company/${data.companyID}/new`,
        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось создать новую запись");
    }
  }
);
export type reservationItemProps = {
  ids: any[];
  updateUserID: string;
  companyID: string;
  updateDate?: Date;
};
export const reservationRequarementByIds = createAsyncThunk(
  "logistic/reservationRequarementByIds",
  async (data: reservationItemProps, { rejectWithValue }) => {
    try {
      const response = await $authHost.put(
        `/reservation/byTaskPN/companyID/${data.companyID}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить");
    }
  }
);

export const updateManyMaterialItems = createAsyncThunk(
  "common/updateManyMaterialItes",
  async (data: IUpdatedMaterialItemsById, { rejectWithValue }) => {
    try {
      const response = await $authHost.put(
        `/materialStore/updatemany/companyID/${data.companyID}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось ");
    }
  }
);
export const updateManyMaterialItemByID = createAsyncThunk(
  "common/updateManyMaterialItemByID",
  async (data: IUpdatedMaterialItemsById, { rejectWithValue }) => {
    try {
      const response = await $authHost.put(
        `/materialStore/updateManyMaterialItemByID/${data.companyID}/companyID/${data.companyID}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось ");
    }
  }
);

// export const uploadFileServer = createAsyncThunk(
//   'common/uploadFileServer',
//   async (formData: FormData, { rejectWithValue }) => {
//     try {
//       const response = await $authHost.post('files/upload/company', formData);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue('Не удалось загрузить файл');
//     }
//   }
// );
// export async function uploadFileServer(formData: any) {
//   try {
//     const response = await $authHost.post('files/upload/company', formData);
//     return response.data;
//   } catch (error) {
//     console.error('Не удалось загрузить файл', error);
//     throw error;
//   }
// }

export async function uploadFileServer(formData: any) {
  try {
    const response = await axios.post(
      `${API_URL}/files/upload/company`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Не удалось загрузить файл", error);
    throw error;
  }
}

// Функция для просмотра файла
export async function getFileFromServer(companyID: string, fileId: string) {
  try {
    const response = await axios.get(
      `${API_URL}/files/getById/company/${companyID}/file/${fileId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        responseType: "blob", // Важно указать, что ответ должен быть в виде blob
      }
    );
    return response.data;
  } catch (error) {
    console.error("Не удалось получить файл", error);
    throw error;
  }
}

// Функция для удаления файла
export const deleteFile = createAsyncThunk(
  "common/deleteFile",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await $authHost.delete(`/file/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось удалить файл");
    }
  }
);

export const postNewOrder = createAsyncThunk(
  "common/postNewOrder",
  async (data: any, thunkAPI) => {
    try {
      const response = await $authHost.post(
        `orders/companyID/${data.companyID}/new`,
        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось создать новую запись");
    }
  }
);
export const updateOrderByID = createAsyncThunk(
  "common/updateOrderByID",
  async (data: any, thunkAPI) => {
    try {
      const response = await $authHost.put(
        `orders/${data._id || data.id}/companyID/${data.companyID}/`,

        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось создать новую запись");
    }
  }
);

export const getFilteredOrders = createAsyncThunk(
  "common/getFilteredOrders",
  async (params: any, { rejectWithValue }) => {
    const url = new URL(
      `orders/getFilteredOrders/companyID/${params.companyID}`,

      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.vendorName) searchParams.append("vendorName", params.vendorName);

    if (params.orderType) searchParams.append("orderType", params.orderType);

    if (params.orderCreateDate)
      searchParams.append("orderCreateDate", params.orderCreateDate);

    if (params.orderItems)
      searchParams.append("orderItems", params.orderItems.join(","));
    if (params.state) searchParams.append("state", params.state.join(","));

    if (params.partNumber) searchParams.append("partNumber", params.partNumber);

    if (params.costType) searchParams.append("costType", params.costType);

    if (params.updateUserID)
      searchParams.append("updateUserID", params.updateUserID);

    if (params.address) searchParams.append("address", params.address);

    if (params.updateDate) searchParams.append("updateDate", params.updateDate);

    if (params.createUserID)
      searchParams.append("createUserID", params.createUserID);

    if (params.shippingAddress)
      searchParams.append("shippingAddress", params.shippingAddress);

    if (params.paymentMethod)
      searchParams.append("paymentMethod", params.paymentMethod);

    if (params.paymentResult)
      searchParams.append("paymentResult", params.paymentResult);

    if (params.taxPrice)
      searchParams.append("taxPrice", params.taxPrice.toString());

    if (params.shippingPrice)
      searchParams.append("shippingPrice", params.shippingPrice.toString());

    if (params.totalPrice)
      searchParams.append("totalPrice", params.totalPrice.toString());

    if (params.isPaid) searchParams.append("isPaid", params.isPaid.toString());

    if (params.paidAt) searchParams.append("paidAt", params.paidAt);

    if (params.isDelivered)
      searchParams.append("isDelivered", params.isDelivered.toString());

    if (params.deliveredAt)
      searchParams.append("deliveredAt", params.deliveredAt);

    if (params.orderNumber)
      searchParams.append("orderNumber", params.orderNumber.toString());

    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заказы");
    }
  }
);

export const postNewReceiving = createAsyncThunk(
  "common/postNewReceiving",
  async (data: any, thunkAPI) => {
    try {
      const response = await $authHost.post(
        `/receiving/companyID/${data.companyID}/new`,
        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось создать новую запись");
    }
  }
);
export const getFilteredReceivingItems = createAsyncThunk(
  "common/getFilteredReceivingItems",
  async (params: any, { rejectWithValue }) => {
    const url = new URL(
      `receivingItem/getFilteredReceivingItem/companyID/${params.companyID}`,

      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.vendorName) searchParams.append("vendorName", params.vendorName);
    if (params.isReturned) searchParams.append("isReturned", params.isReturned);
    if (params.isCancelled)
      searchParams.append("isCancelled", params.isCancelled);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.orderType)
      searchParams.append("orderType", params.orderType.join(","));
    if (params.label) searchParams.append("label", params.label);

    if (params.partNumber) searchParams.append("partNumber", params.partNumber);
    if (params.store) searchParams.append("store", params.store);
    if (params.location) searchParams.append("location", params.location);
    if (params.updateDate) searchParams.append("updateDate", params.updateDate);
    if (params.orderNumber)
      searchParams.append("orderNumber", params.orderNumber.toString());
    if (params.receiningItemNumber)
      searchParams.append("receiningItemNumber", params.receiningItemNumber);
    if (params.batchNumber)
      searchParams.append("batchNumber", params.batchNumber);
    if (params.serialNumber)
      searchParams.append("serialNumber", params.serialNumber);

    if (params.receiningNumber)
      searchParams.append("receiningNumber", params.receiningNumber);

    if (params.store) searchParams.append("store", params.store);
    if (params.station) searchParams.append("station", params.station);
    if (params.partGroup)
      searchParams.append("partGroup", params.partGroup.join(","));
    if (params.partType)
      searchParams.append("partType", params.partType.join(","));
    if (params.receivedBy) searchParams.append("receivedBy", params.receivedBy);
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заказы");
    }
  }
);

export const postNewReceivingItem = createAsyncThunk(
  "common/postNewReceiving",
  async (data: any, thunkAPI) => {
    try {
      const response = await $authHost.post(
        `/receivingItem/companyID/${data.companyID}/new`,
        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось создать новую запись");
    }
  }
);
export const postNewStoreItem = createAsyncThunk(
  "common/postNewStoreItem",
  async (data: any, thunkAPI) => {
    try {
      const response = await $authHost.post(
        `/materialStore/companyID/${data.company_ID}/new`,
        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось создать новую запись");
    }
  }
);

// export const getFilteredShops = createAsyncThunk(
//   'common/getFilteredShops',
//   async (params: any, { rejectWithValue }) => {
//     const url = new URL(
//       `shops/getFilteredShops/company/${params.companyID}`,
//       API_URL
//     );
//     const searchParams = new URLSearchParams();

//     if (params.shopShortName)
//       searchParams.append('shopShortName', params.shopShortName);

//     if (params.shopLongName)
//       searchParams.append('shopLongName', params.shopLongName);

//     url.search = searchParams.toString();

//     try {
//       const response = await $authHost.get(url.toString());

//       return response.data;
//     } catch (error) {
//       return rejectWithValue('Не удалось загрузить SHOPS');
//     }
//   }
// );

export const updateReceivingByNumber = createAsyncThunk(
  "common/updateReceivingByNumber",
  async (data: any, thunkAPI) => {
    try {
      const response = await $authHost.put(
        `receiving/updateReceivingByNumber/${data.RECEIVING_NUMBER}/companyID/${data.COMPANY_ID}/`,

        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось обновить");
    }
  }
);

export const updateManyReceivingItems = createAsyncThunk(
  "common/updateManyReceivingItems",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await $authHost.put(
        `receivingItem/updatemany/companyID/${data.companyID}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось ");
    }
  }
);

export const updatePartByID = createAsyncThunk(
  "common/updatePart",
  async (data: any, { rejectWithValue }) => {
    const id = data?.id;
    const companyID = data?.companyID;

    try {
      const response = await $authHost.put(
        `/partNumbers/updatePart/company/${companyID}/partID/${id}`,
        data
      );

      return response.data;
    } catch (error) {
      return rejectWithValue("error");
    }
  }
);

export const postNewPart = createAsyncThunk(
  "common/postNewPart",
  async (data: any, thunkAPI) => {
    try {
      const response = await $authHost.post(
        `/partNumbers/companyID/${data.companyID}/new`,
        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось создать новую запись");
    }
  }
);

export const updateAlternativePartByID = createAsyncThunk(
  "common/updatePart",
  async (data: any, { rejectWithValue }) => {
    const id = data?.id;
    const companyID = data?.companyID;

    try {
      const response = await $authHost.put(
        `/alternative/updateAlternativePart/company/${companyID}/partID/${id}`,
        data
      );

      return response.data;
    } catch (error) {
      return rejectWithValue("error");
    }
  }
);
export const updateReceivingByID = createAsyncThunk(
  "common/updateReceivingByID",
  async (data: any, { rejectWithValue }) => {
    const id = data?.id;
    const companyID = data?.companyID;

    try {
      const response = await $authHost.put(
        `/receivingItem/updateReceivingByID/company/${companyID}/receiving/${id}`,
        data
      );

      return response.data;
    } catch (error) {
      return rejectWithValue("error");
    }
  }
);

export const getFilteredMaterialItemsExpiry = createAsyncThunk(
  "common/getFilteredMaterialItemsExpiry",
  async (params: getFilteredMaterialItems, { rejectWithValue }) => {
    const url = new URL(
      `/materialStore/getFilteredItemsExpiry/company/${params.companyID}`,
      API_URL
    );
    const searchParams = new URLSearchParams();
    if (params.location)
      searchParams.append("location", params.location.join(","));
    if (params.isAllDate) searchParams.append("isAllExpDate", params.isAllDate);

    if (params.localID) searchParams.append("localID", params.localID);
    if (params.ID) searchParams.append("ID", params.ID);
    if (params.SERIAL_NUMBER)
      searchParams.append("SERIAL_NUMBER", params.SERIAL_NUMBER);
    if (params.PART_NUMBER)
      searchParams.append("PART_NUMBER", params.PART_NUMBER);
    if (params.GROUP) searchParams.append("GROUP", params.GROUP.join(","));
    if (params.TYPE) searchParams.append("TYPE", params.TYPE.join(","));
    if (params.STOCK) searchParams.append("STOCK", params.STOCK);
    if (params.status) searchParams.append("status", params.status.join(","));
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());
      //localStorage.setItem('taskSearchUrl', url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить MaterialOrders");
    }
  }
);

export const postNewAlternativePart = createAsyncThunk(
  "common/postNewAlternativePart",
  async (data: any, thunkAPI) => {
    try {
      const response = await $authHost.post(
        `/alternative/companyID/${data.companyID}/new`,
        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось создать новую запись");
    }
  }
);

export const deleteAlternativePartByID = createAsyncThunk(
  "common/deleteAlternativePartByID",
  async (data: any, thunkAPI) => {
    try {
      const response = await $authHost.delete(
        `/alternative/companyID/${data.companyID}/part/${data.id}/`,
        { data }
      );
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const deleteMaterialStoreItemByID = createAsyncThunk(
  "common/deleteMaterialStoreItemByID",
  async (data: any, thunkAPI) => {
    try {
      const response = await $authHost.delete(
        `/materialStore/companyID/${data.companyID}/item/${data.id}/`,
        { data }
      );
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  }
);

export const getBookingItem = createAsyncThunk<
  any,
  { id: string; data: IBookingItem }
>("booking/get", async ({ id, data }, thunkAPI) => {
  try {
    const response = await $authHost.get(
      `/bookingItems/companyID/${data.companyID}/${id}`
    );
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Не удалось получить запись");
  }
});

export const createBookingItem = createAsyncThunk<
  any,
  { companyID: string; data: IBookingItem }
>("booking/create", async (data, thunkAPI) => {
  try {
    const response = await $authHost.post(
      `/bookingItems/companyID/${data.companyID}/`,
      data
    );
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Не удалось создать новую запись");
  }
});

export const updateBookingItem = createAsyncThunk<
  any,
  { id: string; data: IBookingItem }
>("booking/update", async ({ id, data }, thunkAPI) => {
  try {
    const response = await $authHost.put(
      `/bookingItems/companyID/${data.companyID}/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Не удалось обновить запись");
  }
});

export const deleteBookingItem = createAsyncThunk<
  any,
  { id: string; data: IBookingItem }
>("booking/delete", async ({ id, data }, thunkAPI) => {
  try {
    const response = await $authHost.delete(
      `/bookingItems/companyID/${data.companyID}/${id}`
    );
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Не удалось удалить запись");
  }
});

export const getLocationDetails = createAsyncThunk(
  "common/getLocationDetails",
  async (data: any, thunkAPI) => {
    try {
      const response = await $authHost.post(
        `shops/companyID/${data.companyID}/getLocationDetails`,

        data
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Не удалось создать новую запись");
    }
  }
);

export const getFilteredBookingItems = createAsyncThunk(
  "common/getFilteredBookingItems",
  async (params: any, { rejectWithValue }) => {
    const url = new URL(
      `bookingItems/getFilteredBookingItem/companyID/${params.companyID}`,

      API_URL
    );
    const searchParams = new URLSearchParams();

    if (params.workshop) searchParams.append("workshop", params.workshop);
    if (params.isReturned) searchParams.append("isReturned", params.isReturned);
    if (params.isCancelled)
      searchParams.append("isCancelled", params.isCancelled);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.projectWO)
      searchParams.append("projectWO", params.projectWO.join(","));
    if (params.label) searchParams.append("label", params.label);

    if (params.partNumber) searchParams.append("partNumber", params.partNumber);
    if (params.store) searchParams.append("store", params.store);
    if (params.location) searchParams.append("location", params.location);
    if (params.updateDate) searchParams.append("updateDate", params.updateDate);
    if (params.orderNumber)
      searchParams.append("orderNumber", params.orderNumber.toString());
    if (params.registrationNumber)
      searchParams.append("registrationNumber", params.registrationNumber);
    if (params.batchNumber)
      searchParams.append("batchNumber", params.batchNumber);
    if (params.serialNumber)
      searchParams.append("serialNumber", params.serialNumber);

    if (params.projectTaskWO)
      searchParams.append("projectTaskWO", params.projectTaskWO);

    if (params.storeShop) searchParams.append("storeShop", params.storeShop);
    if (params.store) searchParams.append("store", params.store);
    if (params.station) searchParams.append("station", params.station);
    if (params.partGroup)
      searchParams.append("partGroup", params.partGroup.join(","));
    if (params.partType)
      searchParams.append("partType", params.partType.join(","));
    if (params.voucherModel)
      searchParams.append("voucherModel", params.voucherModel.join(","));
    if (params.receivedBy) searchParams.append("receivedBy", params.receivedBy);
    url.search = searchParams.toString();

    try {
      const response = await $authHost.get(url.toString());

      return response.data;
    } catch (error) {
      return rejectWithValue("Не удалось загрузить заказы");
    }
  }
);
