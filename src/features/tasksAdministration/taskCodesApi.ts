import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { ITaskCode, ITaskCodeGroup } from '@/models/ITask';

export const taskCodeApi = createApi({
  reducerPath: 'taskCodeApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TaskCodesTypes'], // Add tag types for caching
  endpoints: (builder) => ({
    getGroupTaskCodes: builder.query<
      ITaskCode[],
      { code?: string; acTypeID: string }
    >({
      query: ({ code, acTypeID }) => ({
        url: `tasksCodes/getFilteredGroupsTaskCodes/company/${COMPANY_ID}`,
        params: { code, acTypeID },
      }),
      providesTags: ['TaskCodesTypes'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(settaskCodesGroup(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getTaskCode: builder.query<ITaskCode, string>({
      query: (id) => `tasksCodes/${id}`,
      providesTags: ['TaskCodesTypes'],
    }),
    addTaskCode: builder.mutation<
      ITaskCode,
      { taskCode: Partial<ITaskCode>; acTypeId?: string }
    >({
      query: ({ taskCode, acTypeId }) => ({
        url: `tasksCodes/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...taskCode,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
          acTypeID: acTypeId,
        },
      }),
      invalidatesTags: ['TaskCodesTypes'], // Invalidate the 'taskCodes' tag after mutation
    }),
    updateTaskCode: builder.mutation<ITaskCode, ITaskCode>({
      query: (taskCode) => ({
        url: `tasksCodes/company/${COMPANY_ID}/taskCode/${taskCode.id}`,
        method: 'PUT',
        body: { ...taskCode, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['TaskCodesTypes'], // Invalidate the 'taskCodes' tag after mutation
    }),
    deleteTaskCode: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `tasksCodes/company/${COMPANY_ID}/taskCode/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TaskCodesTypes'], // Invalidate the 'taskCodes' tag after mutation
    }),
  }),
});

export const {
  useUpdateTaskCodeMutation,
  useAddTaskCodeMutation,
  useDeleteTaskCodeMutation,
  useGetGroupTaskCodesQuery,
  useGetTaskCodeQuery,
} = taskCodeApi;
