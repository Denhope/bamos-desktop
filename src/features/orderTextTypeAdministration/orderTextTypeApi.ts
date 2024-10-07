import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { IVendor } from '@/models/IUser';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';

export const orderTextTypeApi = createApi({
  reducerPath: 'orderTextTypeApiReducer',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['OrderTextTypes'],
  endpoints: (builder) => ({
    getOrderTextTypes: builder.query<
      any[],
      {
        code?: string;
        status?: string[];
        name?: string;
        companyID?: string;
      }
    >({
      query: ({ code, status, name, companyID }) => ({
        url: `orderTextTypes/getFilteredOrderTextTypes/company/${COMPANY_ID}`,
        params: { code, status, name, companyID },
      }),
      providesTags: ['OrderTextTypes'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setorderTextTypes(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getOrderText: builder.query<any, string>({
      query: (id) => `orderTextTypes/company/${id}`,
    }),
    addOrderText: builder.mutation<any, Partial<any>>({
      query: (orderTextType) => ({
        url: `orderTextTypes/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...orderTextType,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['OrderTextTypes'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updateOrderText: builder.mutation<any, any>({
      query: (orderTextType) => ({
        url: `orderTextTypes/company/${COMPANY_ID}/orderTextType/${orderTextType.id}`,
        method: 'PUT',
        body: {
          ...orderTextType,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['OrderTextTypes'],
    }),
    deleteOrderText: builder.mutation<
      { success: boolean; orderTextType: string },
      string
    >({
      query: (id) => ({
        url: `orderTextTypes/company/${COMPANY_ID}/orderTextType/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OrderTextTypes'],
    }),
  }),
});

export const {
  useGetOrderTextQuery,
  useDeleteOrderTextMutation,
  useAddOrderTextMutation,
  useGetOrderTextTypesQuery,
  useUpdateOrderTextMutation,
} = orderTextTypeApi;
