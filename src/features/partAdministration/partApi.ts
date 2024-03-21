import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IPartNumber } from '@/models/IUser';

export const partNumberApi = createApi({
  reducerPath: 'partNumbers',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PartNumber'], // Add tag types for caching
  endpoints: (builder) => ({
    getPartNumbers: builder.query<
      IPartNumber[],
      {
        partNumber?: string;
        description?: string;
        type?: string;
        group?: string;
        unit?: string;
        status?: string;
      }
    >({
      query: ({ partNumber, description, type, group, unit, status }) => ({
        url: `partNumbers/getFilteredPartNumber/company/${COMPANY_ID}`,
        params: {
          partNumber,
          description,
          type,
          group,
          unit,
          status,
        },
      }),
      providesTags: ['PartNumber'],
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
    getPartNumber: builder.query<IPartNumber, string>({
      query: (id) => `partNumbers/company/${COMPANY_ID}/partNumber/${id}`,
      providesTags: ['PartNumber'], // Provide the 'Users' tag after fetching
    }),
    addPartNumber: builder.mutation<
      IPartNumber,
      { partNumber: Partial<IPartNumber>; acTypeId?: string }
    >({
      query: ({ partNumber, acTypeId }) => ({
        url: `partNumbers/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...partNumber,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['PartNumber'], // Invalidate the 'Users' tag after mutation
    }),
    updatePartNumber: builder.mutation<IPartNumber, IPartNumber>({
      query: (partNumber) => ({
        url: `partNumbers/company/${COMPANY_ID}/partNumber/${partNumber.id}`,
        method: 'PUT',
        body: {
          ...partNumber,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['PartNumber'], // Invalidate the 'Users' tag after mutation
    }),
    deletePartNumber: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `partNumbers/company/${COMPANY_ID}/partNumber/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PartNumber'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useAddPartNumberMutation,
  useDeletePartNumberMutation,
  useGetPartNumberQuery,
  useGetPartNumbersQuery,
  useUpdatePartNumberMutation,
} = partNumberApi;
