import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { IStep } from '@/models/IStep';

export const projectStepApi = createApi({
  reducerPath: 'steps',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Steps'],
  endpoints: (builder) => ({
    getStepsByProjectId: builder.query<IStep[], string>({
      query: (projectId) => `steps/project/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: 'Steps', projectId },
      ],
    }),
    addStep: builder.mutation<
      IStep,
      {
        step: Partial<IStep>;
        projectId: string;
        projectItemID: string;
        projectTaskID?: string;
      }
    >({
      query: ({ step, projectId, projectItemID, projectTaskID }) => ({
        url: `projectTaskSteps/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...step,
          projectId,
          projectItemID,
          projectTaskID,
          companyID: COMPANY_ID,
          createUserID: USER_ID,
          createDate: new Date(),
        },
      }),
      invalidatesTags: ['Steps'],
    }),
    updateStep: builder.mutation<IStep, { step: IStep }>({
      query: ({ step }) => ({
        url: `projectTaskSteps/step/${step.id}/company/${COMPANY_ID}`,
        method: 'PUT',
        body: { ...step, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: (result, error, { step }) => [
        { type: 'Steps', projectId: step.projectId },
      ],
    }),
    deleteStep: builder.mutation<void, string>({
      query: (stepId) => ({
        url: `projectTaskSteps/company/${COMPANY_ID}/projectTaskStep/${stepId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Steps'],
    }),
    getFilteredSteps: builder.query<
      IStep[],
      { projectId?: string; status?: string; projectItemID?: any }
    >({
      query: ({ projectId, status, projectItemID }) => ({
        url: `projectTaskSteps/getFilteredProjectsTaskSteps/company/${COMPANY_ID}`,
        params: { status, projectItemID, projectId },
      }),
      providesTags: (result, error, { projectId }) => [
        { type: 'Steps', projectId },
      ],
    }),
    checkStepEditStatus: builder.query<
      { isEditing: boolean; editingUser?: string },
      string
    >({
      query: (stepId) => `projectTaskSteps/step/${stepId}/edit-status`,
    }),
    setStepEditStatus: builder.mutation<
      void,
      { stepId: string; isEditing: boolean }
    >({
      query: ({ stepId, isEditing }) => ({
        url: `projectTaskSteps/step/${stepId}/edit-status`,
        method: 'POST',
        body: { isEditing, userId: USER_ID },
      }),
      invalidatesTags: ['Steps'],
    }),
  }),
});

export const {
  useGetStepsByProjectIdQuery,
  useAddStepMutation,
  useUpdateStepMutation,
  useDeleteStepMutation,
  useGetFilteredStepsQuery,
  useCheckStepEditStatusQuery,
  useSetStepEditStatusMutation,
} = projectStepApi;
