import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { IAccessCode, IZoneCode, IZoneCodeGroup } from '@/models/ITask';
import { setZonesGroups } from './accessSlice';

export const accessCodeApi = createApi({
  reducerPath: 'accessReducer',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Access'], // Add tag types for caching
  endpoints: (builder) => ({
    getAccessCodes: builder.query<
      IAccessCode[],
      {
        acTypeID: string;
        majoreZoneNbr?: number;
        subZoneNbr?: number;
        areaNbr?: number;
        status?: string;
        zoneCodeID?: string;
      }
    >({
      query: ({
        acTypeID,
        majoreZoneNbr,
        subZoneNbr,
        areaNbr,
        status,
        zoneCodeID,
      }) => ({
        url: `accessNew/getFilteredAccessCode/company/${COMPANY_ID}`,
        params: {
          acTypeID,
          majoreZoneNbr,
          subZoneNbr,
          areaNbr,
          status,
          zoneCodeID,
        },
      }),
      providesTags: ['Access'],
      // async onQueryStarted(arg, { dispatch, queryFulfilled }) {
      //   try {
      //     const { data } = await queryFulfilled;

      //     dispatch(setZonesGroups(data));
      //   } catch (error) {
      //     console.error('Ошибка при выполнении запроса:', error);
      //   }
      // },
      // Provide the 'Users' tag after fetching
    }),
    getAccessCode: builder.query<IAccessCode, string>({
      query: (id) => `access/company/${COMPANY_ID}/accessCode/${id}`,
      providesTags: ['Access'], // Provide the 'Users' tag after fetching
    }),
    addAccessCode: builder.mutation<
      IAccessCode,
      { accessCode: Partial<IAccessCode>; acTypeId?: string }
    >({
      query: ({ accessCode, acTypeId }) => ({
        url: `accessNew/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...accessCode,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
          acTypeID: acTypeId,
        },
      }),
      invalidatesTags: ['Access'], // Invalidate the 'Users' tag after mutation
    }),
    updateAccessCode: builder.mutation<IAccessCode, IAccessCode>({
      query: (zoneCode) => ({
        url: `accessNew/company/${COMPANY_ID}/accessCode/${
          zoneCode.id || zoneCode._id
        }`,
        method: 'PUT',
        body: {
          ...zoneCode,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['Access'], // Invalidate the 'Users' tag after mutation
    }),
    deleteAccessCode: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `accessNew/company/${COMPANY_ID}/accessCode/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Access'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useGetAccessCodesQuery,
  useDeleteAccessCodeMutation,
  useAddAccessCodeMutation,
  useUpdateAccessCodeMutation,
} = accessCodeApi;
