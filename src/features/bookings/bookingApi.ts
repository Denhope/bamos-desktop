import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IBookingItem } from '@/models/IBooking';

export const bookingApi = createApi({
  reducerPath: 'bookingsReducer',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Bookings'], // Add tag types for caching
  endpoints: (builder) => ({
    getFilteredBookings: builder.query<
      IBookingItem[],
      {
        voucherModel?: string;
        acTypeID?: string;
        bookingID?: string;
        projectID?: string;
        accessProjectID?: string;
      }
    >({
      query: ({ acTypeID, voucherModel, projectID, accessProjectID }) => ({
        url: `bookingItems/getFilteredBookingItem/companyID/${COMPANY_ID}`,
        params: {
          acTypeID,
          voucherModel,
          projectID,
          accessProjectID,
        },
      }),
      providesTags: ['Bookings'],
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
    getBooking: builder.query<IBookingItem, string>({
      query: (id) => `bookingItems/companyID/${COMPANY_ID}/Booking/${id}`,
      providesTags: ['Bookings'], // Provide the 'Users' tag after fetching
    }),
    addBooking: builder.mutation<
      any,
      { booking: Partial<any>; acTypeId?: string; userID?: string }
    >({
      query: ({ booking, acTypeId, userID }) => ({
        url: `bookingItems/companyID/${COMPANY_ID}`,
        method: 'POST',
        body: {
          data: {
            ...booking,
            createUserID: userID || USER_ID,
            createDate: new Date(),
            companyID: COMPANY_ID,
            acTypeID: acTypeId,
          },
        },
      }),
      invalidatesTags: ['Bookings'], // Invalidate the 'Users' tag after mutation
    }),
    updateBooking: builder.mutation<IBookingItem, any>({
      query: (booking) => ({
        url: `bookingItems/companyID/${COMPANY_ID}/booking/${
          booking.id || booking._id
        }`,
        method: 'PUT',
        body: {
          ...booking,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['Bookings'], // Invalidate the 'Users' tag after mutation
    }),
    deleteBooking: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `bookingItems/company/${COMPANY_ID}/Booking/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bookings'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useGetFilteredBookingsQuery,
  useDeleteBookingMutation,
  useAddBookingMutation,
  useUpdateBookingMutation,
} = bookingApi;
