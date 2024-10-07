import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { IMPD } from '@/models/ITask';

export const mpdCodeApi = createApi({
  reducerPath: 'mpdCodeApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['MPDCodesTypes'], // Add tag types for caching
  endpoints: (builder) => ({
    getMPDCodes: builder.query<IMPD[], { code?: string; acTypeID: string }>({
      query: ({ code, acTypeID }) => ({
        url: `mpdCodes/getFilteredMPDCodes/company/${COMPANY_ID}`,
        params: { code, acTypeID },
      }),
      providesTags: ['MPDCodesTypes'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setmpdCodesGroup(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getMPDCode: builder.query<IMPD, string>({
      query: (id) => `mpdCodes/company/${COMPANY_ID}`,
      providesTags: ['MPDCodesTypes'],
    }),
    addMPDCode: builder.mutation<
      IMPD,
      { mpdCode: Partial<IMPD>; acTypeId?: string }
    >({
      query: ({ mpdCode, acTypeId }) => ({
        url: `mpdCodes/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...mpdCode,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
          acTypeID: acTypeId,
        },
      }),
      invalidatesTags: ['MPDCodesTypes'], // Invalidate the 'mpdCodes' tag after mutation
    }),
    updateMPDCode: builder.mutation<IMPD, IMPD>({
      query: (mpdCode) => ({
        url: `mpdCodes/company/${COMPANY_ID}/mpdCode/${mpdCode.id}`,
        method: 'PUT',
        body: { ...mpdCode, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['MPDCodesTypes'], // Invalidate the 'mpdCodes' tag after mutation
    }),
    deleteMPDCode: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `mpdCodes/company/${COMPANY_ID}/mpdCode/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MPDCodesTypes'], // Invalidate the 'mpdCodes' tag after mutation
    }),
  }),
});

export const {
  useAddMPDCodeMutation,
  useDeleteMPDCodeMutation,
  useUpdateMPDCodeMutation,
  useGetMPDCodesQuery,
  useGetMPDCodeQuery,
} = mpdCodeApi;
