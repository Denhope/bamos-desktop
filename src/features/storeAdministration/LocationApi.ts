import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { ILocation } from '@/models/IUser';

export const locationsApi = createApi({
  reducerPath: 'locationReduser',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Location'], // Add tag types for caching
  endpoints: (builder) => ({
    getLocations: builder.query<
      ILocation[],
      {
        status?: string;
        storeID?: string;
        ownerID?: string;
        locationTypeID?: string;
      }
    >({
      query: ({ status, storeID, ownerID, locationTypeID }) => ({
        url: `/locations/getFilteredlocations/company/${COMPANY_ID}`,
        params: { status, storeID, ownerID, locationTypeID },
      }),
      providesTags: ['Location'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setlocationsGroups(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
      // Provide the 'Users' tag after fetching
    }),
    getLocation: builder.query<ILocation, string>({
      query: (id) => `locations/company/${COMPANY_ID}/location/${id}`,
      providesTags: ['Location'], // Provide the 'Users' tag after fetching
    }),
    addLocation: builder.mutation<
      ILocation,
      { location: Partial<ILocation>; storeID?: string }
    >({
      query: ({ location, storeID }) => ({
        url: `locations/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...location,
          // storeID,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['Location'], // Invalidate the 'Users' tag after mutation
    }),
    updateLocation: builder.mutation<ILocation, ILocation>({
      query: (location) => ({
        url: `locations/company/${COMPANY_ID}/location/${location.id}`,
        method: 'PUT',
        body: {
          ...location,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['Location'], // Invalidate the 'Users' tag after mutation
    }),
    deletelocationTask: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `locations/company/${COMPANY_ID}/location/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Location'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useUpdateLocationMutation,
  useGetLocationsQuery,
  useGetLocationQuery,
  useAddLocationMutation,
  useDeletelocationTaskMutation,
} = locationsApi;
