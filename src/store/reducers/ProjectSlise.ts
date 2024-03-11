import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProjectInfo, TStatus } from '@/models/IProject';

import { fetchAllProjects, fetchProjectById } from '@/utils/api/thunks';

type ProjectsState = {
  allProjects: IProjectInfo[];
  currentProject: IProjectInfo;
  isLoading: boolean;
  allProjectsFetchError: string | null;
};

export const initialCurrent: IProjectInfo = {
  projectName: '',
  aplicationId: {
    additionalTasks: [],
    aplicationName: '',
    companyID: '',
    hardTimeTasks: [],
    id: '',
    routineTasks: [],
    serviceType: '',
  },
  ownerId: {
    email: '',
    password: '',
    companyID: '',
    telegramID: '',
    nameEnglish: '',
    name: '',
    pass: '',
    id: '',
  },
};

const initialState: ProjectsState = {
  allProjects: [],
  isLoading: false,
  allProjectsFetchError: null,
  currentProject: {
    aplicationId: {
      additionalTasks: [],
      aplicationName: '',
      companyID: '',
      hardTimeTasks: [],
      id: '',
      routineTasks: [],
      serviceType: '',
    },
    ownerId: {
      email: '',
      password: '',
      companyID: '',
      telegramID: '',
      nameEnglish: '',
      name: '',
      pass: '',
      id: '',
    },
    projectName: '',
    projectId: '',
    status: 'отложен',
    isEdited: false,
  },
};

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    addNewProject: (state, action: PayloadAction<IProjectInfo>) => {
      state.allProjects.push(action.payload);
    },
    setCurrentProject: (state, action: PayloadAction<IProjectInfo>) => {
      state.currentProject = action.payload;
    },
    setProjectStart: (state, action: PayloadAction<TStatus>) => {
      state.currentProject.status = action.payload;
    },
    setEditedMode: (state, action: PayloadAction<boolean>) => {
      state.currentProject.isEdited = action.payload;
    },
    updateProjectName: (state, action: PayloadAction<string>) => {
      state.currentProject.projectName = action.payload;
    },
    updatefinishDate: (state, action: PayloadAction<any>) => {
      state.currentProject.finishDate = action.payload;
    },
    updateStartTime: (state, action: PayloadAction<any>) => {
      state.currentProject.startDate = action.payload;
    },
    setOptional: (state, action: PayloadAction<any>) => {
      state.currentProject.optional = action.payload;
    },
  },

  extraReducers: (builder) => {
    // fetchAllProjects
    builder.addCase(fetchAllProjects.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      fetchAllProjects.fulfilled,
      (state, action: PayloadAction<IProjectInfo[]>) => {
        state.isLoading = false;
        state.allProjects = action.payload;
      }
    );
    builder.addCase(
      fetchAllProjects.rejected,
      (state, action: PayloadAction<any>) => {
        state.allProjectsFetchError = action.payload;
        console.error(action.payload);
      }
    );

    // fetchProjectById
    builder.addCase(fetchProjectById.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      fetchProjectById.fulfilled,
      (state, action: PayloadAction<IProjectInfo[]>) => {
        state.isLoading = false;
        state.allProjects = action.payload; // This might not be the correct assignment if you want to store a single project
      }
    );
    builder.addCase(
      fetchProjectById.rejected,
      (state, action: PayloadAction<string | any>) => {
        state.allProjectsFetchError = action.payload;
        console.error(action.payload);
      }
    );
  },
});
export const {
  setCurrentProject,
  setProjectStart,
  updateStartTime,
  updateProjectName,
  setOptional,
  updatefinishDate,
  setEditedMode,
  addNewProject,
} = projectsSlice.actions;

export default projectsSlice.reducer;
