import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IProjectItem, IProjectItemWO } from '@/models/AC';

export const projectItemWOApi = createApi({
  reducerPath: 'projectItemWOReduser',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ProjectItemWO'],
  endpoints: (builder) => ({
    getProjectItemsWO: builder.query<
      IProjectItemWO[],
      {
        partNumberID?: string;
        projectTaskWO?: any;
        projectItemID?: string;
        status?: string;
        name?: string;
        companyID?: string;
        projectID?: string;
        vendorID?: string;
        requirementsIds?: any[];
        workPackageID?: string;
        startDate?: Date;
        finishDate?: Date;
        projectId?: string;
        taskWO?: any;
        planeId?: any;
        restrictionID?: any;
        phasesID?: any;
        useID?: any;
        skillCodeID?: any;
        accessID?: any;
        zonesID?: any;
        preparationID?: any;
        projectItemType?: any;
        WOReferenceID?: any;
        ids?: any;
        time?: any;
        defectCodeID?: any;
        ata?: any;
      }
    >({
      query: ({
        partNumberID,
        projectTaskWO,
        status,
        name,
        companyID,
        projectID,
        projectId,
        vendorID,
        projectItemID,
        requirementsIds,
        workPackageID,
        startDate,
        finishDate,
        taskWO,
        planeId,
        restrictionID,
        phasesID,
        useID,
        skillCodeID,
        accessID,
        zonesID,
        preparationID,
        projectItemType,
        WOReferenceID,
        ids,
        defectCodeID,
        ata,
      }) => ({
        url: `projectsTasksNew/getFilteredProjectsTasks/company/${COMPANY_ID}`,
        params: {
          partNumberID,
          projectTaskWO,
          status,
          name,
          companyID,
          projectID,
          vendorID,
          projectItemID,
          requirementsIds,
          workPackageID,
          startDate,
          finishDate,
          projectId,
          taskWO,
          planeId,
          restrictionID,
          phasesID,
          useID,
          skillCodeID,
          accessID,
          zonesID,
          preparationID,
          projectItemType,
          WOReferenceID,
          ids,
          defectCodeID,
          ata,
        },
      }),
      providesTags: ['ProjectItemWO'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setprojectItems(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    reloadProjectTask: builder.mutation<
      any,
      {
        ids?: any;
        WOReferenceID?: any;
      }
    >({
      query: ({ ids, WOReferenceID }) => ({
        url: `projectsTasksNew/reload/company/${COMPANY_ID}`,
        method: 'PUT',
        body: {
          ids,
          WOReferenceID,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['ProjectItemWO'],
    }),

    appendProjectTask: builder.mutation<
      any,
      {
        ids?: any;
        WOReferenceID?: any;
      }
    >({
      query: ({ ids, WOReferenceID }) => ({
        url: `projectsTasksNew/append-new/company/${COMPANY_ID}`,
        method: 'PUT',
        body: {
          ids,
          WOReferenceID,
          createUserID: USER_ID,
          createDate: new Date(),
        },
      }),
      invalidatesTags: ['ProjectItemWO'],
    }),
    getProjectItemWO: builder.query<IProjectItemWO, string>({
      query: (id) => `projectsTasksNew/company/${id}`,
    }),
    addProjectItemWO: builder.mutation<
      IProjectItemWO,
      {
        projectItemWO?: Partial<IProjectItemWO>;
        projectID?: string;
        vendorID?: string;
        projectItemID?: any;
        isSingleWO?: boolean;
        isMultiWO?: boolean;
      }
    >({
      query: ({
        projectItemWO,
        projectID,
        vendorID,
        projectItemID,
        isSingleWO,
        isMultiWO,
      }) => ({
        url: `projectsTasksNew/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...projectItemWO,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
          projectID: projectID,
          vendorID: vendorID,
          projectItemID: projectItemID,
          isSingleWO,
          isMultiWO,
        },
      }),
      invalidatesTags: ['ProjectItemWO'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    addProjectPanels: builder.mutation<
      any,
      {
        projectItemWO?: Partial<any>;
        projectID?: string;
        projectItemID?: any;
        isAllPanels?: boolean;
        accessIds?: string;
        WOReferenceID?: string;
        projectTaskIds?: string;
        isFromWO?: boolean;
      }
    >({
      query: ({
        projectItemWO,
        projectID,
        projectItemID,
        isAllPanels,
        accessIds,
        WOReferenceID,
        projectTaskIds,
        isFromWO,
      }) => ({
        url: `projectsAccess/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...projectItemWO,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
          projectID: projectID,
          projectItemID: projectItemID,
          isAllPanels,
          accessIds,
          WOReferenceID,
          projectTaskIds,
          isFromWO,
        },
      }),
      invalidatesTags: ['ProjectItemWO'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    getProjectGroupPanels: builder.query<
      any[],
      {
        status?: any;
        accessProjectNumber?: any;
        companyID?: string;
        projectID?: string;
        vendorID?: string;
        selectedItems?: any[];
        workPackageID?: string;
        createStartDate?: Date;
        createFinishDate?: Date;
        projectId?: string;
        createUserID?: string;
        installUserId?: string;
        removeUserId?: string;
        inspectedUserID?: string;
        acTypeID?: string;
        accessType?: string;
        accessIds?: string;
        isOnlyWithPanels?: boolean;
        userID?: string;
        WOReferenceID?: string;
      }
    >({
      query: ({
        companyID,
        projectID,
        vendorID,
        selectedItems,
        workPackageID,
        createStartDate,
        createFinishDate,
        projectId,
        createUserID,
        installUserId,
        inspectedUserID,
        removeUserId,
        acTypeID,
        accessType,
        status,
        isOnlyWithPanels,
        accessIds,
        accessProjectNumber,
        userID,
        WOReferenceID,
      }) => ({
        url: `projectsAccess/getFilteredProjectsGroupAccess/company/${COMPANY_ID}`,
        params: {
          companyID,
          projectID,
          vendorID,
          selectedItems,
          workPackageID,
          createStartDate,
          createFinishDate,
          projectId,
          createUserID,
          installUserId,
          inspectedUserID,
          removeUserId,
          acTypeID,
          accessType,
          status,
          isOnlyWithPanels,
          accessIds,
          accessProjectNumber,
          userID,
          WOReferenceID,
        },
      }),
      providesTags: ['ProjectItemWO'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setprojectItems(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getProjectPanels: builder.query<
      any[],
      {
        status?: any;

        companyID?: string;
        projectID?: string;
        vendorID?: string;
        selectedItems?: any[];
        workPackageID?: string;
        createStartDate?: Date;
        createFinishDate?: Date;
        projectId?: string;
        createUserID?: string;
        installUserId?: string;
        inspectedUserID?: string;
        removeUserId?: string;
        acTypeID?: string;
        accessType?: string;
        accessIds?: string;
        isOnlyWithPanels?: boolean;
        userID?: string;
        WOReferenceID?: string;
        accessProjectNumber?: string;
      }
    >({
      query: ({
        companyID,
        projectID,
        vendorID,
        selectedItems,
        workPackageID,
        createStartDate,
        createFinishDate,
        projectId,
        createUserID,
        installUserId,
        inspectedUserID,
        removeUserId,
        acTypeID,
        accessType,
        status,
        isOnlyWithPanels,
        accessIds,
        userID,
        WOReferenceID,
        accessProjectNumber,
      }) => ({
        url: `projectsAccess/getFilteredProjectsAccess/company/${COMPANY_ID}`,
        params: {
          companyID,
          projectID,
          vendorID,
          selectedItems,
          workPackageID,
          createStartDate,
          createFinishDate,
          projectId,
          createUserID,
          installUserId,
          inspectedUserID,
          removeUserId,
          acTypeID,
          accessType,
          status,
          isOnlyWithPanels,
          accessIds,
          userID,
          WOReferenceID,
          accessProjectNumber,
        },
      }),
      providesTags: ['ProjectItemWO'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setprojectItems(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    updateProjectPanels: builder.mutation<
      any,
      {
        status: any;
        accessIds: any[];
        installUserId?: any;
        removeUserId?: any;
        inspectedUserID?: any;
      }
    >({
      query: ({
        status,
        accessIds,
        installUserId,
        removeUserId,
        inspectedUserID,
      }) => ({
        url: `projectsAccess/company/${COMPANY_ID}/updateByID`,
        method: 'PUT',
        body: {
          status,
          accessIds,
          installUserId,
          inspectedUserID,
          removeUserId,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['ProjectItemWO'],
    }),
    updateProjectItemsWO: builder.mutation<IProjectItemWO, IProjectItemWO>({
      query: (projectItem) => ({
        url: `projectsTasksNew/company/${COMPANY_ID}/projectTask/${projectItem.id}`,
        method: 'PUT',
        body: { ...projectItem, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['ProjectItemWO'],
    }),
    deleteProjectItemWO: builder.mutation<
      { success: boolean; projectItem: string },
      string
    >({
      query: (id) => ({
        url: `projectsTasksNew/company/${COMPANY_ID}/projectTask/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProjectItemWO'],
    }),

    getProjectTaskForCard: builder.query<
      any[],
      {
        ids?: any;
        WOReferenceID?: any;
      }
    >({
      query: ({ ids, WOReferenceID }) => ({
        url: `projectsTasksNew/getFilteredProjectsTaskCard/company/${COMPANY_ID}`,
        params: {
          ids,
          WOReferenceID,
        },
      }),
      providesTags: ['ProjectItemWO'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setprojectItems(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
      keepUnusedDataFor: 5,
    }),
  }),
});

export const {
  useAddProjectPanelsMutation,
  useGetProjectGroupPanelsQuery,
  useGetProjectItemWOQuery,
  useDeleteProjectItemWOMutation,
  useAddProjectItemWOMutation,
  useGetProjectItemsWOQuery,
  useUpdateProjectPanelsMutation,
  useGetProjectPanelsQuery,
  useGetProjectTaskForCardQuery,
  useReloadProjectTaskMutation,
  useAppendProjectTaskMutation,
} = projectItemWOApi;
