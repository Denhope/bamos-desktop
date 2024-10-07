import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { ILocationType } from '@/models/IUser';

export const locationsTypeApi = createApi({
  reducerPath: 'locationTypeReduser',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['LocationType'], // Add tag types for caching
  endpoints: (builder) => ({
    getLocations: builder.query<
      ILocationType[],
      {
        status?: string;
        storeID?: string;
        ownerID?: string;
        locationTypeID?: string;
      }
    >({
      query: ({ status, storeID, ownerID, locationTypeID }) => ({
        url: `/locations/type/getFilteredlocations/company/${COMPANY_ID}`,
        params: { status, storeID, ownerID, locationTypeID },
      }),
      providesTags: ['LocationType'],
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
    getLocation: builder.query<ILocationType, string>({
      query: (id) => `locations/type/company/${COMPANY_ID}/type/${id}`,
      providesTags: ['LocationType'], // Provide the 'Users' tag after fetching
    }),
    addLocation: builder.mutation<
      ILocationType,
      { location: Partial<ILocationType>; acTypeId?: string }
    >({
      query: ({ location, acTypeId }) => ({
        url: `locations/type/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...location,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['LocationType'], // Invalidate the 'Users' tag after mutation
    }),
    updateLocation: builder.mutation<ILocationType, ILocationType>({
      query: (location) => ({
        url: `locations/type/company/${COMPANY_ID}/type/${location.id}`,
        method: 'PUT',
        body: {
          ...location,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['LocationType'], // Invalidate the 'Users' tag after mutation
    }),
    deletelocationTask: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `locations/type/company/${COMPANY_ID}/type/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LocationType'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {} = locationsTypeApi;
