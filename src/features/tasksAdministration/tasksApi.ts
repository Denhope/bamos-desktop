import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import {
  ITask,
  ITaskCode,
  ITaskCodeGroup,
  ITaskResponce,
} from '@/models/ITask';
import { setTasks } from './taskSlice';

export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TaskTypes'], // Add tag types for caching
  endpoints: (builder) => ({
    getTasks: builder.query<
      ITask[],
      {
        code?: string;
        status?: any;
        acTypeID?: string;
        taskNumber?: string;
        taskType?: string;
      }
    >({
      query: ({ code, acTypeID, taskNumber, status, taskType }) => ({
        url: `tasks/administration/getFilteredTasks/company/${COMPANY_ID}`,
        params: { code, status, acTypeID, taskNumber, taskType },
      }),
      providesTags: ['TaskTypes'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setTasks(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getTask: builder.query<ITask, string>({
      query: (id) => `tasks/administration/company/${COMPANY_ID}/task/${id}`,
      providesTags: ['TaskTypes'],
    }),
    addTask: builder.mutation<
      ITask,
      {
        task: Partial<ITask>;
        acTypeId?: string;
        mpdDocumentationId?: string;
      }
    >({
      query: ({ task, acTypeId, mpdDocumentationId }) => ({
        url: `tasks/administration/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...task,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['TaskTypes'], // Invalidate the 'taskCodes' tag after mutation
    }),
    addMultiTaskItems: builder.mutation<
      ITask[],
      {
        taskNumberDTO: Partial<ITask[]>;
      }
    >({
      query: ({ taskNumberDTO }) => ({
        url: `tasks/administration/multi/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          taskNumberDTO,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['TaskTypes'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updateTask: builder.mutation<ITask, ITask>({
      query: (taskCode) => ({
        url: `tasks/administration/company/${COMPANY_ID}/task/${taskCode.id}`,
        method: 'PUT',
        body: { ...taskCode, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['TaskTypes'], // Invalidate the 'taskCodes' tag after mutation
    }),
    deleteTask: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `tasks/administration/company/${COMPANY_ID}/task/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TaskTypes'], // Invalidate the 'taskCodes' tag after mutation
    }),
  }),
});

export const {
  useAddTaskMutation,
  useDeleteTaskMutation,
  useGetTaskQuery,
  useUpdateTaskMutation,
  useGetTasksQuery,
  useAddMultiTaskItemsMutation,
} = taskApi;
