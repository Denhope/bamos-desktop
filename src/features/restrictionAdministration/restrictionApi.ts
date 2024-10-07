import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { Action, IStep } from '@/models/IStep';

export const restrictionApi = createApi({
  reducerPath: 'restrictionsReduser',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Restriction'],
  endpoints: (builder) => ({
    updateAction: builder.mutation<Action, { action: Action }>({
      query: ({ action }) => ({
        url: `restrictions/company/${COMPANY_ID}/projectTaskStepAction/${action.id}`,
        method: 'PUT',
        body: { ...action, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['Restriction'],
    }),
    getFilteredRestrictions: builder.query<
      any[],
      { restrictionId?: string; code?: string; acTypeId?: string }
    >({
      query: ({ restrictionId, code, acTypeId }) => ({
        url: `restrictions/getFilteredRestrictions/company/${COMPANY_ID}`,
        params: { code, restrictionId, acTypeId },
      }),
      providesTags: ['Restriction'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log(queryFulfilled);

          // dispatch(setlocationsGroups(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    deleteAction: builder.mutation<void, string>({
      query: (actionId) => ({
        url: `projectTaskStepsActions/company/${COMPANY_ID}/projectTaskStepAction/${actionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Restriction'],
    }),
  }),
});

export const { useGetFilteredRestrictionsQuery } = restrictionApi;
