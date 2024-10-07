import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { ICompany } from '@/models/IUser';

const currentCompanyID = localStorage.getItem('companyID') || '';

export const companyApi = createApi({
  reducerPath: 'companyApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Companies'], // Добавляем типы тегов для кэширования
  endpoints: (builder) => ({
    getCompanies: builder.query<ICompany[], { companyName?: string }>({
      query: ({ companyName }) => ({
        url: `companies/getFilteredCompanies/company/${currentCompanyID}`,
        params: { companyName },
      }),
      providesTags: ['Companies'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setUserGroups(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getCompany: builder.query<ICompany, string>({
      query: (id) => `companies/company/${id}`,
    }),
    addCompany: builder.mutation<ICompany, Partial<ICompany>>({
      query: (company) => ({
        url: 'companies/company/',
        method: 'POST',
        body: company,
      }),
      invalidatesTags: ['Companies'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updateCompany: builder.mutation<ICompany, ICompany>({
      query: (company) => ({
        url: `companies/company/${company.id}`,
        method: 'PUT',
        body: company,
      }),
      invalidatesTags: ['Companies'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    deleteCompany: builder.mutation<
      { success: boolean; company: string },
      string
    >({
      query: (id) => ({
        url: `companies/company/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Companies'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
  }),
});

export const {
  useAddCompanyMutation,
  useDeleteCompanyMutation,
  useGetCompaniesQuery,
  useGetCompanyQuery,
  useUpdateCompanyMutation,
} = companyApi;
