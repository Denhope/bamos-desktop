import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IPartNumber } from '@/models/IUser';

export const partTaskNumberApi = createApi({
  reducerPath: 'partTaskAdmin',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PartTaskNumber'], // Add tag types for caching
  endpoints: (builder) => ({
    getPartTaskNumbers: builder.query<
      IPartNumber[],
      {
        partNumber?: string;
        partNumberID?: string;
        description?: string;
        type?: string;
        group?: string;
        unit?: string;
        status?: string;
        acTypeID?: string;
        taskId?: string;
      }
    >({
      query: ({
        partNumber,
        description,
        type,
        group,
        unit,
        status,
        partNumberID,
        acTypeID,
        taskId,
      }) => ({
        url: `task-admin-parts/getFilteredTaskParts/company/${COMPANY_ID}`,
        params: {
          partNumber,
          partNumberID,
          description,
          type,
          group,
          unit,
          status,
          acTypeID,
          taskId,
        },
      }),
      providesTags: ['PartTaskNumber'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setpartNumbersGroups(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
      // Provide the 'Users' tag after fetching
    }),
    getPartTaskNumber: builder.query<IPartNumber, string>({
      query: (id) => `task-admin-parts/company/${COMPANY_ID}/part/${id}`,
      providesTags: ['PartTaskNumber'], // Provide the 'Users' tag after fetching
    }),
    addPartTaskNumber: builder.mutation<
      IPartNumber,
      { partNumber: Partial<any>; acTypeID?: string }
    >({
      query: ({ partNumber }) => ({
        url: `task-admin-parts/companyID/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...partNumber,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['PartTaskNumber'], // Invalidate the 'Users' tag after mutation
    }),
    addMultiPartTaskNumber: builder.mutation<
      IPartNumber[],
      {
        partNumberDTO: Partial<IPartNumber[]>;
      }
    >({
      query: ({ partNumberDTO }) => ({
        url: `partNumbers/multi/companyID/${COMPANY_ID}`,
        method: 'POST',
        body: {
          partNumberDTO,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['PartTaskNumber'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updatePartTaskNumber: builder.mutation<any, any>({
      query: ({ partTaskNumber }) => ({
        url: `task-admin-parts/part/${partTaskNumber.id}/company/${COMPANY_ID}`,
        method: 'PUT',
        body: {
          partNumberID: partTaskNumber.partNumberID,
          quantity: partTaskNumber.quantity,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['PartTaskNumber'], // Invalidate the 'Users' tag after mutation
    }),
    deletePartTaskNumber: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `task-admin-parts/company/${COMPANY_ID}/part/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PartTaskNumber'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useAddMultiPartTaskNumberMutation,
  useAddPartTaskNumberMutation,
  useGetPartTaskNumberQuery,
  useLazyGetPartTaskNumberQuery,
  useGetPartTaskNumbersQuery,
  useDeletePartTaskNumberMutation,
  useUpdatePartTaskNumberMutation,
} = partTaskNumberApi;
