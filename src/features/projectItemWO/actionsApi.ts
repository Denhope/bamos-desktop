import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { Action, IStep } from '@/models/IStep';

export const actionApi = createApi({
  reducerPath: 'actions',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Actions'],
  endpoints: (builder) => ({
    getActionsByStepId: builder.query<Action[], string>({
      query: (stepId) => `actions/step/${stepId}`,
      providesTags: (result, error, stepId) => [{ type: 'Actions', stepId }],
    }),
    addAction: builder.mutation<
      Action,
      {
        action: Partial<Action>;
        stepId: string;
        projectItemID: string;
        projectId: string;
        projectTaskID?: string;
      }
    >({
      query: ({ action, stepId, projectItemID, projectId, projectTaskID }) => ({
        url: `projectTaskStepsActions/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...action,
          createUserID: USER_ID,
          projectStepId: stepId,
          companyID: COMPANY_ID,
          projectId,
          projectItemID,
          projectTaskID,
        },
      }),
      invalidatesTags: ['Actions'],
    }),
    addMultiAction: builder.mutation<
      any,
      {
        ids: any;
        actionType: string;
        userInspectDurations?: any;
        userPerformDurations?: any;
      }
    >({
      query: ({
        actionType,
        ids,
        userInspectDurations,
        userPerformDurations,
      }) => ({
        url: `projectTaskStepsActions/multi-actions/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          actionType,
          createUserID: USER_ID,
          companyID: COMPANY_ID,
          ids,
          userInspectDurations: userInspectDurations,
          userPerformDurations: userPerformDurations,
        },
      }),
      invalidatesTags: ['Actions'],
    }),
    updateAction: builder.mutation<Action, { action: Action }>({
      query: ({ action }) => ({
        url: `projectTaskStepsActions/company/${COMPANY_ID}/projectTaskStepAction/${action.id}`,
        method: 'PUT',
        body: { ...action, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['Actions'],
    }),
    getFilteredActions: builder.query<
      Action[],
      { projectStepId: string; status?: string }
    >({
      query: ({ projectStepId, status }) => ({
        url: `projectTaskStepsActions/company/${COMPANY_ID}`,
        params: { status, projectStepId },
      }),
      providesTags: (result, error, { projectStepId }) => [
        { type: 'Actions', projectStepId },
      ],
    }),
    deleteAction: builder.mutation<void, string>({
      query: (actionId) => ({
        url: `projectTaskStepsActions/company/${COMPANY_ID}/projectTaskStepAction/${actionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Actions'],
    }),
  }),
});

export const {
  useGetActionsByStepIdQuery,
  useAddActionMutation,
  useUpdateActionMutation,
  useGetFilteredActionsQuery,
  useDeleteActionMutation,
  useAddMultiActionMutation,
} = actionApi;
