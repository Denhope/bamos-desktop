import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IProjectItem } from '@/models/AC';

export const projectItemApi = createApi({
  reducerPath: 'projectItemReducer',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ProjectItem'],
  endpoints: (builder) => ({
    getProjectItems: builder.query<
      IProjectItem[],
      {
        partNumberID?: string;
        status?: string[];
        name?: string;
        companyID?: string;
        projectID?: string;
        vendorID?: string;
      }
    >({
      query: ({
        partNumberID,
        status,
        name,
        companyID,
        projectID,
        vendorID,
      }) => ({
        url: `projectItems/getFilteredProjectItems/company/${COMPANY_ID}`,
        params: { partNumberID, status, name, companyID, projectID, vendorID },
      }),
      providesTags: ['ProjectItem'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setprojectItems(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getProjectItem: builder.query<IProjectItem, string>({
      query: (id) => `projectItems/company/${id}`,
    }),
    addProjectItem: builder.mutation<
      IProjectItem,
      {
        projectItem: Partial<IProjectItem>;
        projectID: string;
        vendorID?: string;
        planeID?: string;
        taskType?: string;
      }
    >({
      query: ({ projectItem, projectID, vendorID, planeID, taskType }) => ({
        url: `projectItems/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...projectItem,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
          projectID: projectID,
          vendorID: vendorID,
          planeID,
          taskType,
        },
      }),
      invalidatesTags: ['ProjectItem'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    addMultiProjectItems: builder.mutation<
      any[],
      {
        projectItemsDTO: Partial<any[]>;
        planeID?: any;
        projectID: string;
        vendorID?: string;
        taskType?: string;
      }
    >({
      query: ({ projectItemsDTO, projectID, vendorID, planeID, taskType }) => ({
        url: `projectItems/multi/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          projectItemsDTO,
          planeID,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
          projectID: projectID,
          vendorID: vendorID,
          taskType: taskType,
        },
      }),
      invalidatesTags: ['ProjectItem'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updateProjectItems: builder.mutation<IProjectItem, IProjectItem>({
      query: (projectItem) => ({
        url: `projectItems/company/${COMPANY_ID}/projectItem/${projectItem.id}`,
        method: 'PUT',
        body: { ...projectItem, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['ProjectItem'],
    }),
    deleteProjectItem: builder.mutation<
      { success: boolean; projectItem: string },
      string
    >({
      query: (id) => ({
        url: `projectItems/company/${COMPANY_ID}/projectItem/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProjectItem'],
    }),
  }),
});

export const {
  useAddProjectItemMutation,
  useDeleteProjectItemMutation,
  useGetProjectItemQuery,
  useGetProjectItemsQuery,
  useUpdateProjectItemsMutation,
  useAddMultiProjectItemsMutation,
} = projectItemApi;
