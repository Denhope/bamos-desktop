import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { IOrder } from '@/models/IRequirement';

export const ordersNewApi = createApi({
  reducerPath: 'ordersNew',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Order'], // Add tag types for caching
  endpoints: (builder) => ({
    getFilteredOrders: builder.query<
      IOrder[],
      {
        orderNumber?: number;
        startDate?: any;
        endDate?: any;
        state?: string;
        vendorID?: string;
        orderType?: string;
        partNumberID?: string | number;
      }
    >({
      query: ({
        orderNumber,
        startDate,
        state,
        vendorID,
        endDate,
        orderType,
        partNumberID,
      }) => ({
        url: `ordersNew/getFilteredOrders/companyID/${COMPANY_ID}`,
        params: {
          orderNumber,
          startDate,
          state,
          vendorID,
          endDate,
          orderType,
          partNumberID,
        },
      }),
      providesTags: ['Order'],
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

    getOrder: builder.query<IOrder, string>({
      query: (id) => `order/companyID/${COMPANY_ID}/order/${id}`,
      providesTags: ['Order'],
    }),
    addOrder: builder.mutation<IOrder, { rderItem: Partial<IOrder> }>({
      query: (order) => ({
        url: `ordersNew/companyID/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...order,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrder: builder.mutation<IOrder, IOrder>({
      query: (order) => ({
        url: `ordersNew/companyID/${COMPANY_ID}/order/${order.id || order._id}`,
        method: 'PUT',
        body: {
          ...order,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['Order'], // Invalidate the 'Users' tag after mutation
    }),
    deleteOrder: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `ordersNew/companyID/${COMPANY_ID}/order/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'], // Invalidate the 'Users' tag after mutation
    }),
    sendEmail: builder.mutation<
      { success: boolean; message: string },
      { orderId: string }
    >({
      query: ({ orderId }) => ({
        url: `ordersNew/companyID/${COMPANY_ID}/send-order-emails/${orderId}`,
        method: 'POST',
        body: {
          orderId,
          userId: USER_ID,
          companyId: COMPANY_ID,
        },
      }),
      invalidatesTags: ['Order'], // Invalidate the 'Order' tag after mutation
    }),
  }),
});

export const {
  useAddOrderMutation,
  useSendEmailMutation,
  useGetFilteredOrdersQuery,
  useUpdateOrderMutation,
  useGetOrderQuery,
  useDeleteOrderMutation,
} = ordersNewApi;
