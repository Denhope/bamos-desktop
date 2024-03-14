import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { IZoneCode, IZoneCodeGroup } from '@/models/ITask';
import { setZonesGroups } from './accessSlice';

export const zoneCodeApi = createApi({
  reducerPath: 'zones',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Access'], // Add tag types for caching
  endpoints: (builder) => ({
    getZonesByGroup: builder.query<
      IZoneCodeGroup[],
      {
        acTypeId: string;
        majoreZoneNbr?: number;
        subZoneNbr?: number;
        areaNbr?: number;
        status?: string;
      }
    >({
      query: ({ acTypeId, majoreZoneNbr, subZoneNbr, areaNbr, status }) => ({
        url: `zones/getFilteredZonesByGroup/company/${COMPANY_ID}`,
        params: { acTypeId, majoreZoneNbr, subZoneNbr, areaNbr, status },
      }),
      providesTags: ['Access'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setZonesGroups(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
      // Provide the 'Users' tag after fetching
    }),
    getZoneCode: builder.query<IZoneCode, string>({
      query: (id) => `zones/company/${COMPANY_ID}/zoneCode/${id}`,
      providesTags: ['Access'], // Provide the 'Users' tag after fetching
    }),
    addZoneCode: builder.mutation<
      IZoneCode,
      { zoneCode: Partial<IZoneCode>; acTypeId?: string }
    >({
      query: ({ zoneCode, acTypeId }) => ({
        url: `zones/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...zoneCode,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
          acTypeId: acTypeId,
        },
      }),
      invalidatesTags: ['Access'], // Invalidate the 'Users' tag after mutation
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
      invalidatesTags: ['Access'], // Invalidate the 'Users' tag after mutation
    }),
    deleteZoneCode: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `zones/company/${COMPANY_ID}/zoneCode/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Access'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useGetZonesByGroupQuery,
  useAddZoneCodeMutation,
  useDeleteZoneCodeMutation,
  useUpdateZoneCodeMutation,
  useGetZoneCodeQuery,
} = zoneCodeApi;
