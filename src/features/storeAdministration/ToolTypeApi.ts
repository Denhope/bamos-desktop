import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { ILocationType } from '@/models/IUser';

export const toolTypeApi = createApi({
  reducerPath: 'toolTypeReduser',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TooType'], // Add tag types for caching
  endpoints: (builder) => ({
    getToolsType: builder.query<
      any[],
      {
        status?: string;
        storeID?: string;
        ownerID?: string;
        toolTypeID?: string;
      }
    >({
      query: ({ status, storeID, ownerID, toolTypeID }) => ({
        url: `/tools/types/getFilteredToolTypes/company/${COMPANY_ID}`,
        params: { status, storeID, ownerID, toolTypeID },
      }),
      providesTags: ['TooType'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setlocationsGroups(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
      // Provide the 'Users' tag after fetching
    }),
    getToolsCodes: builder.query<
      any[],
      {
        status?: string;
        storeID?: string;
        ownerID?: string;
        toolTypeID?: string;
        toolCodeID?: string;
      }
    >({
      query: ({ status, storeID, ownerID, toolTypeID }) => ({
        url: `/tools/codes/getFilteredToolCodes/company/${COMPANY_ID}`,
        params: { status, storeID, ownerID, toolTypeID },
      }),
      providesTags: ['TooType'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setlocationsGroups(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
      // Provide the 'Users' tag after fetching
    }),
    getLocation: builder.query<ILocationType, string>({
      query: (id) => `tools/type/company/${COMPANY_ID}/type/${id}`,
      providesTags: ['TooType'], // Provide the 'Users' tag after fetching
    }),
    addLocation: builder.mutation<
      ILocationType,
      { location: Partial<ILocationType>; acTypeId?: string }
    >({
      query: ({ location, acTypeId }) => ({
        url: `tools/type/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...location,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['TooType'], // Invalidate the 'Users' tag after mutation
    }),
    updateLocation: builder.mutation<ILocationType, ILocationType>({
      query: (location) => ({
        url: `tools/type/company/${COMPANY_ID}/type/${location.id}`,
        method: 'PUT',
        body: {
          ...location,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['TooType'], // Invalidate the 'Users' tag after mutation
    }),
    deletelocationTask: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `tools/type/company/${COMPANY_ID}/type/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TooType'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const { useGetToolsTypeQuery, useGetToolsCodesQuery } = toolTypeApi;
