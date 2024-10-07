import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IAltPartNumber, IPartNumber } from '@/models/IUser';

export const altPartNumberApi = createApi({
  reducerPath: 'altPartReducer',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AltPartNumber'], // Add tag types for caching
  endpoints: (builder) => ({
    getAltsPartNumbers: builder.query<
      IAltPartNumber[],
      {
        partNumber?: string;
        partNumberID?: string;
        description?: string;
        type?: string;
        group?: string;
        unit?: string;
        status?: string;
        acTypeID?: string;
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
      }) => ({
        url: `alternative/getFilteredAlternativePN/company/${COMPANY_ID}`,
        params: {
          partNumber,
          partNumberID,
          description,
          type,
          group,
          unit,
          status,
          acTypeID,
        },
      }),
      providesTags: ['AltPartNumber'],
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
    getPartNumber: builder.query<IAltPartNumber, string>({
      query: (id) => `alternative/company/${COMPANY_ID}/partNumber/${id}`,
      providesTags: ['AltPartNumber'], // Provide the 'Users' tag after fetching
    }),
    addPartNumber: builder.mutation<
      IAltPartNumber,
      { partNumber: Partial<IAltPartNumber>; partNumberID?: string }
    >({
      query: ({ partNumber, partNumberID }) => ({
        url: `alternative/companyID/${COMPANY_ID}/new`,
        method: 'POST',
        body: {
          ...partNumber,
          // partNumberID: partNumberID,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['AltPartNumber'], // Invalidate the 'Users' tag after mutation
    }),
    addMultiPartNumber: builder.mutation<
      IAltPartNumber[],
      {
        partNumberDTO: Partial<IAltPartNumber[]>;
      }
    >({
      query: ({ partNumberDTO }) => ({
        url: `alternative/multi/companyID/${COMPANY_ID}`,
        method: 'POST',
        body: {
          partNumberDTO,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['AltPartNumber'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updatePartNumber: builder.mutation<IAltPartNumber, IAltPartNumber>({
      query: (partNumber) => ({
        url: `alternative/updateAlternativePart/company/${COMPANY_ID}/partID/${partNumber._id}`,
        method: 'PUT',
        body: {
          ...partNumber,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['AltPartNumber'], // Invalidate the 'Users' tag after mutation
    }),
    deletePartNumber: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `alternative/companyID/${COMPANY_ID}/part/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AltPartNumber'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useAddPartNumberMutation,
  useDeletePartNumberMutation,
  useGetPartNumberQuery,
  useGetAltsPartNumbersQuery,
  useUpdatePartNumberMutation,
  useAddMultiPartNumberMutation,
} = altPartNumberApi;
