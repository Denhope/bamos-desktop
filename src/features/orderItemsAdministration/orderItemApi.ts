import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { IOrderItem } from '@/models/IRequirement';

export const orderItemApi = createApi({
  reducerPath: 'ordersItems',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['OrderItem'], // Add tag types for caching
  endpoints: (builder) => ({
    getFilteredOrderItems: builder.query<
      IOrderItem[],
      {
        projectID?: string;
        startDate?: any;
        endDate?: any;
        status?: string;
        vendorID?: string;
      }
    >({
      query: ({ projectID, startDate, status, vendorID, endDate }) => ({
        url: `orderItemsNew/getFilteredOrderItems/company/${COMPANY_ID}`,
        params: {
          projectID,
          startDate,
          status,
          vendorID,
          endDate,
        },
      }),
      providesTags: ['OrderItem'],
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

    getOrderItem: builder.query<IOrderItem, string>({
      query: (id) => `orderItemsNew/company/${COMPANY_ID}/OrderItem/${id}`,
      providesTags: ['OrderItem'],
    }),
    addOrderItem: builder.mutation<
      IOrderItem,
      { OrderItem: Partial<IOrderItem> }
    >({
      query: ({ OrderItem }) => ({
        url: `orderItemsNew/companyID/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...OrderItem,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['OrderItem'],
    }),
    updateOrderItem: builder.mutation<IOrderItem, IOrderItem>({
      query: (orderItem) => ({
        url: `orderItemsNew/companyID/${COMPANY_ID}/orderItem/${
          orderItem._id || orderItem.id
        }`,
        method: 'PUT',
        body: {
          ...orderItem,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['OrderItem'], // Invalidate the 'Users' tag after mutation
    }),
    deleteOrderItem: builder.mutation<{ success: boolean; id: string }, string>(
      {
        query: (id) => ({
          url: `orderItemsNew/company/${COMPANY_ID}/OrderItem/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['OrderItem'], // Invalidate the 'Users' tag after mutation
      }
    ),
  }),
});

export const {
  useAddOrderItemMutation,

  useGetFilteredOrderItemsQuery,
  useGetOrderItemQuery,
  useDeleteOrderItemMutation,
  useUpdateOrderItemMutation,
} = orderItemApi;
