import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { IProject } from '@/models/IProject';

export const wpApi = createApi({
  reducerPath: 'wpAdministrationReuser',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['WorkPackages'], // Add tag types for caching
  endpoints: (builder) => ({
    getfilteredWO: builder.query<
      IProject[],
      {
        status?: string;
        planeId?: string;
        projectTypesID?: string;
        startDate?: any;
        endDate?: any;
        WONumber?: any;
        WOType?: any;
        customerID?: string;
      }
    >({
      query: ({
        status,
        planeId,
        projectTypesID,
        startDate,
        endDate,
        WONumber,
        WOType,
        customerID,
      }) => ({
        url: `workOrders/getFilteredWO/company/${COMPANY_ID}`,
        params: {
          status,
          planeId,
          projectTypesID,
          startDate,
          endDate,
          WONumber,
          WOType,
          customerID,
        },
      }),
      providesTags: ['WorkPackages'],
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
      query: (id) => `workOrders/company/${COMPANY_ID}/workOrder/${id}`,
      providesTags: ['WorkPackages'], // Provide the 'Users' tag after fetching
    }),
    addProject: builder.mutation<
      IProject,
      { project: Partial<IProject>; acTypeId?: string }
    >({
      query: ({ project, acTypeId }) => ({
        url: `workOrders/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...project,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['WorkPackages'], // Invalidate the 'Users' tag after mutation
    }),
    updateProject: builder.mutation<IProject, IProject>({
      query: (project) => ({
        url: `workOrders/company/${COMPANY_ID}/wpAdministration/${
          project.id || project._id
        }`,
        method: 'PUT',
        body: {
          ...project,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['WorkPackages'], // Invalidate the 'Users' tag after mutation
    }),
    deleteProject: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `workOrders/company/${COMPANY_ID}/wpAdministration/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WorkPackages'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useGetfilteredWOQuery,
  useAddProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
  useGetProjectQuery,
} = wpApi;
