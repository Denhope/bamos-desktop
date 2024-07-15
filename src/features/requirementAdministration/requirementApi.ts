import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { IRequirement } from '@/models/IRequirement';

export const requirementApi = createApi({
  reducerPath: 'requirements',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Requirement'],
  endpoints: (builder) => ({
    getFilteredFullRequirements: builder.query<
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
        WOReferenceID?: string;
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
        WOReferenceID,
      }) => ({
        url: `requirementsNew/getFilteredRequirementsFull/company/${COMPANY_ID}`,
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
          WOReferenceID,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: 'Requirement' as const,
                id: _id,
              })),
              { type: 'Requirement' as const, id: 'LIST' },
            ]
          : [{ type: 'Requirement' as const, id: 'LIST' }],
    }),

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
        ifStockCulc?: boolean;
        includeAlternates?: boolean;
        WOReferenceID?: string;
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
        ifStockCulc,
        includeAlternates,
        WOReferenceID,
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
          ifStockCulc,
          includeAlternates,
          WOReferenceID,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: 'Requirement' as const,
                id: _id,
              })),
              { type: 'Requirement' as const, id: 'LIST' },
            ]
          : [{ type: 'Requirement' as const, id: 'LIST' }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Дополнительные действия с данными
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),

    getRequirement: builder.query<IRequirement, string>({
      query: (id) => `requirementsNew/company/${COMPANY_ID}/requirement/${id}`,
      providesTags: (result, error, id) => [
        { type: 'Requirement' as const, id },
      ],
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
      invalidatesTags: [{ type: 'Requirement' as const, id: 'LIST' }],
    }),

    updateRequirement: builder.mutation<IRequirement, IRequirement>({
      query: (requirement) => ({
        url: `requirementsNew/company/${COMPANY_ID}/requirement/${
          requirement._id || requirement.id
        }`,
        method: 'PUT',
        body: {
          ...requirement,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: 'Requirement' as const, id: _id },
        { type: 'Requirement' as const, id: 'LIST' },
      ],
    }),

    deleteRequirement: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `requirementsNew/company/${COMPANY_ID}/requirement/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        // { type: 'Requirement' as const, id },
        { type: 'Requirement' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useAddRequirementMutation,
  useGetFilteredFullRequirementsQuery,
  useGetFilteredRequirementsQuery,
  useGetRequirementQuery,
  useDeleteRequirementMutation,
  useUpdateRequirementMutation,
} = requirementApi;
