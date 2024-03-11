import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { IVendor } from '@/models/IUser';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { setACTypes } from './acTypesSlice';
import { IACType } from '@/models/AC';

export const acTypeApi = createApi({
  reducerPath: 'acTypeApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ACTypes'], // Добавляем типы тегов для кэширования
  endpoints: (builder) => ({
    getACTypes: builder.query<
      IACType[],
      {
        code?: string;
        status?: string[];
        name?: string;
        companyID?: string;
      }
    >({
      query: ({ code, status, name, companyID }) => ({
        url: `acTypes/getFilteredACTypes/company/${COMPANY_ID}`,
        params: { code, status, name, companyID },
      }),
      providesTags: ['ACTypes'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setACTypes(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getACType: builder.query<IACType, string>({
      query: (id) => `acTypes/company/${id}`,
    }),
    addACType: builder.mutation<IACType, Partial<IACType>>({
      query: (acType) => ({
        url: `acTypes/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...acType,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['ACTypes'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updateACType: builder.mutation<IACType, IACType>({
      query: (acType) => ({
        url: `acTypes/company/${COMPANY_ID}/acType/${acType.id}`,
        method: 'PUT',
        body: { ...acType, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['ACTypes'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    deleteACType: builder.mutation<
      { success: boolean; acType: string },
      string
    >({
      query: (id) => ({
        url: `acTypes/company/${COMPANY_ID}/acType/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ACTypes'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
  }),
});

export const {
  useAddACTypeMutation,
  useGetACTypeQuery,
  useDeleteACTypeMutation,
  useGetACTypesQuery,
  useUpdateACTypeMutation,
} = acTypeApi;
