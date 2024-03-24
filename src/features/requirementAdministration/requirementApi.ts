import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IRequirement, Requirement } from '@/models/IRequirement';

export const requirementApi = createApi({
  reducerPath: 'requirements',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Requirement'], // Add tag types for caching
  endpoints: (builder) => ({
    getFilteredRequirements: builder.query<
      IRequirement[],
      {
        projectID?: string;
        startDate?: any;
        endDate?: any;
        status?: string;
        projectTaskID?: string;
        readyStatus?: string;
        reqTypesID?: string;
        reqCodesID?: string;
        partRequestNumberNew?: number;
        partNumberID?: string;
        neededOnID?: string;
      }
    >({
      query: ({
        projectID,
        startDate,
        status,
        projectTaskID,
        readyStatus,
        reqTypesID,
        reqCodesID,
        partRequestNumberNew,
        partNumberID,
        neededOnID,
        endDate,
      }) => ({
        url: `requirementsNew/getFilteredRequirements/company/${COMPANY_ID}`,
        params: {
          projectID,
          startDate,
          status,
          projectTaskID,
          readyStatus,
          reqTypesID,
          reqCodesID,
          partRequestNumberNew,
          partNumberID,
          neededOnID,
          endDate,
        },
      }),
      providesTags: ['Requirement'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setZonesGroups(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
      // Provide the 'Users' tag after fetching
    }),

    getRequirement: builder.query<IRequirement, string>({
      query: (id) => `requirementsNew/company/${COMPANY_ID}/requirement/${id}`,
      providesTags: ['Requirement'],
    }),
    addRequirement: builder.mutation<
      IRequirement,
      { requirement: Partial<IRequirement> }
    >({
      query: ({ requirement }) => ({
        url: `requirementsNew/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...requirement,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['Requirement'],
    }),
    updateRequirement: builder.mutation<IRequirement, IRequirement>({
      query: (requirement) => ({
        url: `requirementsNew/company/${COMPANY_ID}/requirement/${
          requirement.id || requirement._id
        }`,
        method: 'PUT',
        body: {
          ...requirement,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['Requirement'], // Invalidate the 'Users' tag after mutation
    }),
    deleteRequirement: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `requirementsNew/company/${COMPANY_ID}/requirement/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Requirement'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useAddRequirementMutation,

  useGetFilteredRequirementsQuery,
  useGetRequirementQuery,
  useDeleteRequirementMutation,
  useUpdateRequirementMutation,
} = requirementApi;
