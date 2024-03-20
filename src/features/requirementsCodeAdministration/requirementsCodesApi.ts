import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { IVendor } from '@/models/IUser';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IRequirementCode } from '@/models/AC';

export const requirementsCodesApi = createApi({
  reducerPath: 'requirementsCodesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['REQCodes'],
  endpoints: (builder) => ({
    getREQCodes: builder.query<
      IRequirementCode[],
      {
        code?: string;
        status?: string[];
        name?: string;
        companyID?: string;
        reqTypeID?: string;
      }
    >({
      query: ({ code, status, name, companyID, reqTypeID }) => ({
        url: `requirementCodes/getFilteredRequirementCodes/company/${COMPANY_ID}`,
        params: { code, status, name, companyID, reqTypeID },
      }),
      providesTags: ['REQCodes'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setreqCodes(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getREQCode: builder.query<IRequirementCode, string>({
      query: (id) => `requirementCodes/company/${id}`,
    }),
    addREQCode: builder.mutation<
      IRequirementCode,
      { reqCode: Partial<IRequirementCode>; reqTypesID: string }
    >({
      query: ({ reqCode, reqTypesID }) => ({
        url: `requirementCodes/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...reqCode,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
          reqTypesID: reqTypesID,
        },
      }),
      invalidatesTags: ['REQCodes'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updateREQCode: builder.mutation<IRequirementCode, IRequirementCode>({
      query: (reqCode) => ({
        url: `requirementCodes/company/${COMPANY_ID}/requirementCode/${reqCode.id}`,
        method: 'PUT',
        body: { ...reqCode, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['REQCodes'],
    }),
    deleteREQCode: builder.mutation<
      { success: boolean; reqCode: string },
      string
    >({
      query: (id) => ({
        url: `requirementCodes/company/${COMPANY_ID}/requirementCode/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['REQCodes'],
    }),
  }),
});

export const {
  useUpdateREQCodeMutation,
  useAddREQCodeMutation,
  useDeleteREQCodeMutation,
  useGetREQCodeQuery,
  useGetREQCodesQuery,
} = requirementsCodesApi;
