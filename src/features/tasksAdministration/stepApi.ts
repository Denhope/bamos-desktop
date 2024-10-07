import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { IStep } from '@/models/IStep';

export const taskStepApi = createApi({
  reducerPath: 'stepsTask',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Steps'],
  endpoints: (builder) => ({
    getStepsByProjectId: builder.query<IStep[], string>({
      query: (projectId) => `steps/project/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: 'Steps', projectId },
      ],
    }),
    addStep: builder.mutation<IStep, { step: Partial<IStep>; taskId: string }>({
      query: ({ step, taskId }) => ({
        url: `steps-tasks/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...step,
          taskId,
          companyID: COMPANY_ID,
          createUserID: USER_ID,
          createDate: new Date(),
        },
      }),
      invalidatesTags: ['Steps'],
    }),
    updateStep: builder.mutation<IStep, { step: IStep }>({
      query: ({ step }) => ({
        url: `steps-tasks/step/${step.id}/company/${COMPANY_ID}`,
        method: 'PUT',
        body: { ...step, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: (result, error, { step }) => [
        { type: 'Steps', taskId: step.taskId },
      ],
    }),
    deleteStep: builder.mutation<void, string>({
      query: (stepId) => ({
        url: `steps-tasks/company/${COMPANY_ID}/taskStep/${stepId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Steps'],
    }),
    getFilteredSteps: builder.query<
      IStep[],
      { taskId?: string; status?: string }
    >({
      query: ({ taskId, status }) => ({
        url: `steps-tasks/getFilteredTaskSteps/company/${COMPANY_ID}`,
        params: { status, taskId },
      }),
      providesTags: (result, error, { taskId }) => [{ type: 'Steps', taskId }],
    }),
    // checkStepEditStatus: builder.query<
    //   { isEditing: boolean; editingUser?: string },
    //   string
    // >({
    //   query: (stepId) => `steps-tasks/step/${stepId}/edit-status`,
    // }),
    // setStepEditStatus: builder.mutation<
    //   void,
    //   { stepId: string; isEditing: boolean }
    // >({
    //   query: ({ stepId, isEditing }) => ({
    //     url: `steps-tasks/step/${stepId}/edit-status`,
    //     method: 'POST',
    //     body: { isEditing, userId: USER_ID },
    //   }),
    //   invalidatesTags: ['Steps'],
    // }),
  }),
});

export const {
  useGetStepsByProjectIdQuery,
  useAddStepMutation,
  useUpdateStepMutation,
  useDeleteStepMutation,
  useGetFilteredStepsQuery,
} = taskStepApi;
