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
        status?: string[];
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
    getProjectItemWO: builder.query<IProjectItemWO, string>({
      query: (id) => `projectsTasksNew/company/${id}`,
    }),
    addProjectItemWO: builder.mutation<
      IProjectItemWO,
      {
        projectItemWO?: Partial<IProjectItemWO>;
        projectID?: string;
        vendorID?: string;
        projectItemID?: string[];
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
  }),
});

export const {
  useGetProjectItemWOQuery,
  useDeleteProjectItemWOMutation,
  useAddProjectItemWOMutation,
  useGetProjectItemsWOQuery,
} = projectItemWOApi;
