import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IStore, IStorePartItem } from '@/models/IUser';

export const storePartsApi = createApi({
  reducerPath: 'storePartsReducer',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['StoreItem'], // Add tag types for caching
  endpoints: (builder) => ({
    getStorePartStockQTY: builder.query<
      IStorePartItem[],
      {
        status?: string;
        ownerID?: string;
        stationID?: string;
        locationID?: string;
        storeID?: string[];
        partNumberID?: string;
        localID?: any;
        ids?: any[];

        includeAlternates?: boolean;
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
        includeAlternates,
      }) => ({
        url: `/materialStore/getFilteredStockQty/company/${COMPANY_ID}`,
        params: {
          status,
          ownerID,
          stationID,
          partNumberID,
          locationID,
          storeID,
          localID,
          ids,
          includeAlternates,
        },
      }),
      providesTags: ['StoreItem'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setstoresGroups(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
      // Provide the 'Users' tag after fetching
    }),
    getStoreParts: builder.query<
      IStorePartItem[],
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
        toolCodeID?: string;
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
        includeAlternates?: boolean;
        ifStockCulc?: boolean;
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
        toolCodeID,
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
        includeAlternates,
        ifStockCulc,
      }) => ({
        url: `/materialStore/getFilteredItems/company/${COMPANY_ID}`,
        params: {
          status,
          ownerID,
          stationID,
          locationID,
          storeID,
          localID,
          partNumberID,
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
          toolCodeID,
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
          includeAlternates,
          ifStockCulc,
        },
      }),
      providesTags: ['StoreItem'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setstoresGroups(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
      // Provide the 'Users' tag after fetching
    }),
    getStore: builder.query<IStore, string>({
      query: (id) => `storesNew/company/${COMPANY_ID}/store/${id}`,
      providesTags: ['StoreItem'], // Provide the 'Users' tag after fetching
    }),
    addStore: builder.mutation<
      IStore,
      { store: Partial<IStore>; acTypeId?: string }
    >({
      query: ({ store, acTypeId }) => ({
        url: `storesNew/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...store,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['StoreItem'], // Invalidate the 'Users' tag after mutation
    }),
    updateStoreParts: builder.mutation<
      any,
      {
        status?: any;
        partsIds: any[];
        locationID?: string;
        storeID?: string;
        SUPPLIER_BATCH_NUMBER?: any;
        SERIAL_NUMBER?: string;
        PRODUCT_EXPIRATION_DATE?: string;
        FILES?: any[];
        OWNER_SHORT_NAME?: string;
        QUANTITY?: number;
        RECEIVING_NUMBER?: any;
        OWNER_LONG_NAME?: any;
        UNIT_OF_MEASURE?: any;
        TYPE?: string;
        GROUP?: string;
        TOOL_TYPE_CODE?: string;
        TOOL_GROUP_CODE?: string;
        toolCodeID?: string;
        toolTypeID?: string;
        COMPANY_ID?: string;
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
      }
    >({
      query: ({
        status,
        partsIds,
        locationID,
        storeID,
        SUPPLIER_BATCH_NUMBER,
        SERIAL_NUMBER,
        PRODUCT_EXPIRATION_DATE,
        FILES,
        RECEIVING_NUMBER,
        QUANTITY,
        OWNER_SHORT_NAME,
        OWNER_LONG_NAME,
        UNIT_OF_MEASURE,
        TYPE,
        GROUP,
        TOOL_TYPE_CODE,
        TOOL_GROUP_CODE,
        toolCodeID,
        toolTypeID,
        COMPANY_ID,
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
      }) => ({
        url: `materialStore/updateItemByIds/company/${COMPANY_ID}`,
        method: 'PUT',
        body: {
          status,
          partsIds,
          locationID,
          storeID,
          SUPPLIER_BATCH_NUMBER,
          SERIAL_NUMBER,
          PRODUCT_EXPIRATION_DATE,
          FILES,
          RECEIVING_NUMBER,
          QUANTITY,
          OWNER_SHORT_NAME,
          OWNER_LONG_NAME,
          UNIT_OF_MEASURE,
          TYPE,
          GROUP,
          TOOL_TYPE_CODE,
          TOOL_GROUP_CODE,
          toolCodeID,
          toolTypeID,
          COMPANY_ID,
          NAME_OF_MATERIAL,
          PART_NUMBER,
          UNIT_LIMIT,
          PLACE_ON,
          intervalMOS,
          estimatedDueDate,
          nextDueMOS,
          updateUserID: USER_ID,
          updateDate: new Date(),
          REMARKS,
          SUPPLIES_ID,
          AWB_REFERENCE,
          AWB_TYPE,
          AWB_NUMBER,
          IS_CUSTOMER_GOODS,
        },
      }),
      invalidatesTags: ['StoreItem'],
    }),
    deleteStoreItem: builder.mutation<{ success: boolean; id: string }, string>(
      {
        query: (id) => ({
          url: `storesNew/company/${COMPANY_ID}/store/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['StoreItem'], // Invalidate the 'Users' tag after mutation
      }
    ),
  }),
});

export const {
  useGetStorePartsQuery,
  useGetStorePartStockQTYQuery,
  useAddStoreMutation,
  useUpdateStorePartsMutation,
} = storePartsApi;
