import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { IProject } from '@/models/IProject';

export const projectsApi = createApi({
  reducerPath: 'projectsAdministration',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Projects'], // Add tag types for caching
  endpoints: (builder) => ({
    getProjects: builder.query<
      IProject[],
      {
        status?: string;
        planeId?: string;
      }
    >({
      query: ({ status, planeId }) => ({
        url: `projects/getFilteredProjects/company/${COMPANY_ID}`,
        params: { status, planeId },
      }),
      providesTags: ['Projects'],
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
    getProject: builder.query<IProject, string>({
      query: (id) => `projects/company/${COMPANY_ID}/project/${id}`,
      providesTags: ['Projects'], // Provide the 'Users' tag after fetching
    }),
    addProject: builder.mutation<
      IProject,
      { project: Partial<IProject>; acTypeId?: string }
    >({
      query: ({ project, acTypeId }) => ({
        url: `projects/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...project,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['Projects'], // Invalidate the 'Users' tag after mutation
    }),
    updateProject: builder.mutation<IProject, IProject>({
      query: (project) => ({
        url: `projects/company/${COMPANY_ID}/project/${project.id}`,
        method: 'PUT',
        body: {
          ...project,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['Projects'], // Invalidate the 'Users' tag after mutation
    }),
    deleteProject: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `projects/company/${COMPANY_ID}/project/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useAddProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
  useGetProjectQuery,
} = projectsApi;