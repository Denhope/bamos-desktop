import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { IVendor } from '@/models/IUser';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IProjectType } from '@/models/AC';

export const projectTypeApi = createApi({
  reducerPath: 'projectTypeApiReducer',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ProjectTypes'],
  endpoints: (builder) => ({
    getProjectTypes: builder.query<
      IProjectType[],
      {
        code?: string;
        status?: string[];
        name?: string;
        companyID?: string;
      }
    >({
      query: ({ code, status, name, companyID }) => ({
        url: `projectTypes/getFilteredProjectTypes/company/${COMPANY_ID}`,
        params: { code, status, name, companyID },
      }),
      providesTags: ['ProjectTypes'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setprojectTypes(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getProjectType: builder.query<IProjectType, string>({
      query: (id) => `projectTypes/company/${id}`,
    }),
    addProjectType: builder.mutation<IProjectType, Partial<IProjectType>>({
      query: (projectType) => ({
        url: `projectTypes/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...projectType,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['ProjectTypes'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updateProjectType: builder.mutation<IProjectType, IProjectType>({
      query: (projectType) => ({
        url: `projectTypes/company/${COMPANY_ID}/projectType/${projectType.id}`,
        method: 'PUT',
        body: { ...projectType, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['ProjectTypes'],
    }),
    deleteProjectType: builder.mutation<
      { success: boolean; projectType: string },
      string
    >({
      query: (id) => ({
        url: `projectTypes/company/${COMPANY_ID}/projectType/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProjectTypes'],
    }),
  }),
});

export const {
  useGetProjectTypeQuery,
  useDeleteProjectTypeMutation,
  useAddProjectTypeMutation,
  useGetProjectTypesQuery,
  useUpdateProjectTypeMutation,
} = projectTypeApi;
