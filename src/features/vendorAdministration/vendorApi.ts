import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { IVendor } from '@/models/IUser';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { setVendors } from './vendorSlice';

export const vendorApi = createApi({
  reducerPath: 'vendorApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Vendors'], // Добавляем типы тегов для кэширования
  endpoints: (builder) => ({
    getVendors: builder.query<
      IVendor[],
      {
        companyName?: string;
        code?: string;
        status?: string[];
        name?: string;
        isResident?: boolean;
        unp?: string;
      }
    >({
      query: ({ companyName, code, status, name, isResident, unp }) => ({
        url: `vendors/getFilteredVendors/company/${COMPANY_ID}`,
        params: { code, status, name, isResident, unp },
      }),
      providesTags: ['Vendors'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setVendors(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getVendor: builder.query<IVendor, string>({
      query: (id) => `vendors/company/${id}`,
    }),
    addVendor: builder.mutation<IVendor, Partial<IVendor>>({
      query: (vendor) => ({
        url: `vendors/company/${COMPANY_ID}`,
        method: 'POST',
        body: { ...vendor, createUserID: USER_ID, createDate: new Date() },
      }),
      invalidatesTags: ['Vendors'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updateVendor: builder.mutation<IVendor, IVendor>({
      query: (vendor) => ({
        url: `vendors/company/${COMPANY_ID}/vendor/${vendor.id}`,
        method: 'PUT',
        body: { ...vendor, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['Vendors'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    deleteVendor: builder.mutation<
      { success: boolean; vendor: string },
      string
    >({
      query: (id) => ({
        url: `vendors/company/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vendors'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
  }),
});

export const {
  useAddVendorMutation,
  useDeleteVendorMutation,
  useGetVendorQuery,
  useGetVendorsQuery,
  useUpdateVendorMutation,
} = vendorApi;
