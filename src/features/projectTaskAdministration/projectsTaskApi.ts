import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { IProject } from '@/models/IProject';
import { IProjectTask } from '@/models/IUser';

export const projectsTaskApi = createApi({
  reducerPath: 'projectTaskAdmin',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ProjectTask'], // Add tag types for caching
  endpoints: (builder) => ({
    getProjectTasks: builder.query<
      IProjectTask[],
      {
        status?: string;
        requirementsIds?: any[];
        workPackageID?: string;
        startDate: Date;
        finishDate: Date;
        projectId?: string;
      }
    >({
      query: ({ status, requirementsIds, projectId }) => ({
        url: `/projectsTasksNew/getFilteredProjectsTasks/company/${COMPANY_ID}`,
        params: { status, requirementsIds, projectId },
      }),
      providesTags: ['ProjectTask'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setProjectsGroups(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
      // Provide the 'Users' tag after fetching
    }),
    getProjectTask: builder.query<IProjectTask, string>({
      query: (id) => `projectsTasksNew/company/${COMPANY_ID}/project/${id}`,
      providesTags: ['ProjectTask'], // Provide the 'Users' tag after fetching
    }),
    addProjectTask: builder.mutation<
      IProjectTask,
      { project: Partial<IProjectTask>; acTypeId?: string }
    >({
      query: ({ project, acTypeId }) => ({
        url: `projectsTasksNew/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...project,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['ProjectTask'], // Invalidate the 'Users' tag after mutation
    }),
    updateProjectTask: builder.mutation<IProjectTask, IProjectTask>({
      query: (project) => ({
        url: `projectsTasksNew/company/${COMPANY_ID}/projectTask/${project?.id}`,
        method: 'PUT',
        body: {
          ...project,
          updateUserID: USER_ID,
          updateDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['ProjectTask'], // Invalidate the 'Users' tag after mutation
    }),
    deleteProjectTask: builder.mutation<{ success: boolean; id: any }, any>({
      query: (id) => ({
        url: `projectsTasksNew/company/${COMPANY_ID}/projectTask/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProjectTask'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useAddProjectTaskMutation,
  useDeleteProjectTaskMutation,
  useGetProjectTaskQuery,
  useGetProjectTasksQuery,
  useUpdateProjectTaskMutation,
} = projectsTaskApi;
