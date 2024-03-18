import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { IZoneCode, IZoneCodeGroup } from '@/models/ITask';
import { setZonesGroups } from './accessSlice';
import {
  IRequirement,
  IRequirementGroup,
  Requirement,
} from '@/models/IRequirement';

export const requirementApi = createApi({
  reducerPath: 'requirements',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Requirement'], // Add tag types for caching
  endpoints: (builder) => ({
    getFilteredRequirements: builder.query<
      Requirement[],
      {
        projectID?: string;
        startDate?: any;
        status?: string;
      }
    >({
      query: ({ status, projectID, startDate }) => ({
        url: `requirements/getFilteredRequirements/company/${COMPANY_ID}`,
        params: { projectID, startDate, status },
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
    getRequirements: builder.query<
      Requirement[],
      {
        projectID?: string;
        status?: string;
      }
    >({
      query: ({ status, projectID }) => ({
        url: `requirements/getRequirements/company/${COMPANY_ID}`,
        params: { status, projectID },
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
    getZoneCode: builder.query<IZoneCode, string>({
      query: (id) => `requirements/company/${COMPANY_ID}/zoneCode/${id}`,
      providesTags: ['Requirement'], // Provide the 'Users' tag after fetching
    }),
    addRequirement: builder.mutation<
      IZoneCode,
      { zoneCode: Partial<IZoneCode>; acTypeId?: string }
    >({
      query: ({ zoneCode, acTypeId }) => ({
        url: `requirements/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...zoneCode,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
          acTypeId: acTypeId,
        },
      }),
      invalidatesTags: ['Requirement'], // Invalidate the 'Users' tag after mutation
    }),
    updateZoneCode: builder.mutation<IZoneCode, IZoneCode>({
      query: (zoneCode) => ({
        url: `zones/company/${COMPANY_ID}/zoneCode/${zoneCode.id}`,
        method: 'PUT',
        body: {
          ...zoneCode,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['Requirement'], // Invalidate the 'Users' tag after mutation
    }),
    deleteZoneCode: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `zones/company/${COMPANY_ID}/zoneCode/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Requirement'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useAddRequirementMutation,
  useGetRequirementsQuery,
  useGetFilteredRequirementsQuery,
} = requirementApi;
