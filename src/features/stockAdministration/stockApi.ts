import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const stockApi = createApi({
  reducerPath: 'stockApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAvailableQuantity: builder.query<
      { totalQuantity: number },
      {
        companyID: string;
        alternatives?: boolean;
        isAllExpDate?: boolean;
        isAlternative?: boolean;
        storeID?: string[];
        partNumberID: string;
      }
    >({
      query: (params) => ({
        url: '/materialStore/available-quantity',
        params,
      }),
    }),
  }),
});

export const { useGetAvailableQuantityQuery } = stockApi;