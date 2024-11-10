import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';

interface ICustomerCode {
  id?: string;
  prefix: string;
  acTypeId?: string;
  companyID?: string;
  createdAt?: Date;
  updateUserID?: string;
  updateUserSing?: string;
}

export const customerCodeApi = createApi({
  reducerPath: 'customerCodeApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CustomerCodes'],
  endpoints: (builder) => ({
    getCustomerCodes: builder.query<
      ICustomerCode[],
      {
        prefix?: string;
        acTypeId?: string;
        companyID?: string;
      }
    >({
      query: ({ prefix, acTypeId, companyID }) => ({
        url: `customerCodes/getFilteredCustomerCodes/company/${COMPANY_ID}`,
        params: { prefix, acTypeId, companyID },
      }),
      providesTags: ['CustomerCodes'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // dispatch(setCustomerCodes(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getCustomerCode: builder.query<ICustomerCode, string>({
      query: (id) => `customerCodes/company/${COMPANY_ID}/customerCode/${id}`,
    }),
    addCustomerCode: builder.mutation<ICustomerCode, Partial<ICustomerCode>>({
      query: (customerCode) => ({
        url: `customerCodes/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...customerCode,
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['CustomerCodes'],
    }),
    updateCustomerCode: builder.mutation<
      ICustomerCode,
      Partial<ICustomerCode> & { id: string }
    >({
      query: ({ id, ...customerCode }) => ({
        url: `customerCodes/company/${COMPANY_ID}/customerCode/${id}`,
        method: 'PUT',
        body: {
          ...customerCode,
          updateUserID: USER_ID,
          updateUserSing: 'Updated via API', // Можно заменить на реальную подпись пользователя
        },
      }),
      invalidatesTags: ['CustomerCodes'],
    }),
    deleteCustomerCode: builder.mutation<
      { success: boolean; customerCode: string },
      string
    >({
      query: (id) => ({
        url: `customerCodes/company/${COMPANY_ID}/customerCode/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CustomerCodes'],
    }),
  }),
});

export const {
  useAddCustomerCodeMutation,
  useGetCustomerCodeQuery,
  useDeleteCustomerCodeMutation,
  useGetCustomerCodesQuery,
  useUpdateCustomerCodeMutation,
} = customerCodeApi;
