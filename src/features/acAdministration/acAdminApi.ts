import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import {
  ITask,
  ITaskCode,
  ITaskCodeGroup,
  ITaskResponce,
} from '@/models/ITask';
import { setPlanes } from './acAdminSlice';

export const acAdminApi = createApi({
  reducerPath: 'acAdminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ACTypes'], // Add tag types for caching
  endpoints: (builder) => ({
    getPlanes: builder.query<
      any[],
      {
        code?: string;
        status?: any;
        acTypeID?: string;
        taskNumber?: string;
        taskType?: string;
      }
    >({
      query: ({ code, acTypeID, taskNumber, taskType }) => ({
        url: `planes/administration/getFilteredAC/company/${COMPANY_ID}`,
        params: { code, status, acTypeID, taskNumber, taskType },
      }),
      providesTags: ['ACTypes'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setPlanes(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getPlane: builder.query<any, string>({
      query: (id) => `planes/administration/company/${COMPANY_ID}/task/${id}`,
      providesTags: ['ACTypes'],
    }),
    addPlane: builder.mutation<
      any,
      {
        task: Partial<ITask>;
        acTypeId?: string;
        mpdDocumentationId?: string;
      }
    >({
      query: ({ task, acTypeId, mpdDocumentationId }) => ({
        url: `planes/administration/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...task,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['ACTypes'], // Invalidate the 'taskCodes' tag after mutation
    }),
    updatePlane: builder.mutation<any, any>({
      query: (taskCode) => ({
        url: `planes/administration/company/${COMPANY_ID}/plane/${taskCode.id}`,
        method: 'PUT',
        body: { ...taskCode, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['ACTypes'], // Invalidate the 'taskCodes' tag after mutation
    }),
    deletePlane: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `planes/administration/company/${COMPANY_ID}/plane/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ACTypes'], // Invalidate the 'taskCodes' tag after mutation
    }),
  }),
});

export const {
  useAddPlaneMutation,
  useDeletePlaneMutation,
  useGetPlaneQuery,
  useGetPlanesQuery,
  useUpdatePlaneMutation,
} = acAdminApi;
