import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { ILocation } from '@/models/IUser';

export const reportApi = createApi({
  reducerPath: 'reportReduser',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Report'], // Add tag types for caching
  endpoints: (builder) => ({
    getReports: builder.query<
      any[],
      {
        status?: string;
        ownerID?: string;
        stationID?: string;
        locationID?: string;
        storeID?: string;
        partNumberID?: string;
        localID?: any;
        ids?: any[];
        SERIAL_NUMBER?: any;
        startDate?: any;
        endDate?: any;
        startExpityDate?: any;
        endExpityDate?: any;
        SUPPLIER_BATCH_NUMBER?: any;
        PRODUCT_EXPIRATION_DATE?: string;
        OWNER_SHORT_NAME?: string;
        QUANTITY?: number;
        RECEIVING_NUMBER?: any;
        OWNER_LONG_NAME?: any;
        UNIT_OF_MEASURE?: any;
        TYPE?: string;
        GROUP?: string;
        TOOL_TYPE_CODE?: string;
        TOOL_GROUP_CODE?: string;
        toolGroupID?: string;
        toolTypeID?: string;
        NAME_OF_MATERIAL?: string;
        PART_NUMBER?: string;
        UNIT_LIMIT?: any;
        PLACE_ON?: string;
        intervalMOS?: number;
        estimatedDueDate?: any;
        nextDueMOS?: any;
        REMARKS?: string;
        CERTIFICATE_NUMBER?: any;
        PRICE?: string;
        INVENTORY_ACCOUNT?: any;
        SUPPLIES_ID?: any;
        AWB_REFERENCE?: any;
        AWB_TYPE?: any;
        AWB_NUMBER?: any;
        IS_CUSTOMER_GOODS?: any;
        title: string;
      }
    >({
      query: ({
        status,
        ownerID,
        stationID,
        partNumberID,
        locationID,
        storeID,
        localID,
        ids,
        SERIAL_NUMBER,
        startDate,
        endDate,
        startExpityDate,
        endExpityDate,
        SUPPLIER_BATCH_NUMBER,
        PRODUCT_EXPIRATION_DATE,
        RECEIVING_NUMBER,
        QUANTITY,
        OWNER_SHORT_NAME,
        OWNER_LONG_NAME,
        UNIT_OF_MEASURE,
        TYPE,
        GROUP,
        TOOL_TYPE_CODE,
        TOOL_GROUP_CODE,
        toolGroupID,
        toolTypeID,
        NAME_OF_MATERIAL,
        PART_NUMBER,
        UNIT_LIMIT,
        PLACE_ON,
        intervalMOS,
        estimatedDueDate,
        nextDueMOS,
        REMARKS,
        SUPPLIES_ID,
        AWB_REFERENCE,
        AWB_TYPE,
        AWB_NUMBER,
        IS_CUSTOMER_GOODS,
        title,
      }) => ({
        url: `/reports/generate-report/companyID/${COMPANY_ID}`,
        params: {
          status,
          ownerID,
          stationID,
          partNumberID,
          locationID,
          storeID,
          localID,
          ids,
          SERIAL_NUMBER,
          startDate,
          endDate,
          startExpityDate,
          endExpityDate,
          SUPPLIER_BATCH_NUMBER,
          PRODUCT_EXPIRATION_DATE,
          RECEIVING_NUMBER,
          QUANTITY,
          OWNER_SHORT_NAME,
          OWNER_LONG_NAME,
          UNIT_OF_MEASURE,
          TYPE,
          GROUP,
          TOOL_TYPE_CODE,
          TOOL_GROUP_CODE,
          toolGroupID,
          toolTypeID,
          NAME_OF_MATERIAL,
          PART_NUMBER,
          UNIT_LIMIT,
          PLACE_ON,
          intervalMOS,
          estimatedDueDate,
          nextDueMOS,
          REMARKS,
          SUPPLIES_ID,
          AWB_REFERENCE,
          AWB_TYPE,
          AWB_NUMBER,
          IS_CUSTOMER_GOODS,
          title,
        },
      }),
      providesTags: ['Report'],
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
      providesTags: ['Report'], // Provide the 'Users' tag after fetching
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
      invalidatesTags: ['Report'], // Invalidate the 'Users' tag after mutation
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
      invalidatesTags: ['Report'], // Invalidate the 'Users' tag after mutation
    }),
    deletelocationTask: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `locations/company/${COMPANY_ID}/location/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Report'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useUpdateLocationMutation,
  useGetReportsQuery,
  useGetLocationQuery,
  useAddLocationMutation,
  useDeletelocationTaskMutation,
} = reportApi;
