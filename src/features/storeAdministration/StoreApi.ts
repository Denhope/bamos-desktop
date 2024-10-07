import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IStore } from '@/models/IUser';

export const storesTaskApi = createApi({
  reducerPath: 'storesReducer',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['StoreItem'], // Add tag types for caching
  endpoints: (builder) => ({
    getStores: builder.query<
      IStore[],
      {
        status?: string;
        ownerID?: string;
        stationID?: string;
        storeShortName?: string;
        ids?: string;
      }
    >({
      query: ({ status, ownerID, stationID, storeShortName, ids }) => ({
        url: `/storesNew/getFilteredStores/company/${COMPANY_ID}`,
        params: { status, ownerID, stationID, storeShortName, ids },
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
    updateStore: builder.mutation<IStore, IStore>({
      query: (store) => ({
        url: `storesNew/company/${COMPANY_ID}/store/${store.id}`,
        method: 'PUT',
        body: {
          ...store,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['StoreItem'], // Invalidate the 'Users' tag after mutation
    }),
    deleteStore: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `storesNew/company/${COMPANY_ID}/store/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StoreItem'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useGetStoresQuery,
  useDeleteStoreMutation,
  useAddStoreMutation,
  useUpdateStoreMutation,
} = storesTaskApi;
