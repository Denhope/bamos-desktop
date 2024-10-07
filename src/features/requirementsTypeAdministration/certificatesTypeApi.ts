import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { IVendor } from '@/models/IUser';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { setACTypes } from './acTypesSlice';
import { IRequirementType } from '@/models/AC';

export const certificatesTypeApi = createApi({
  reducerPath: 'certificatesTypeApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['certTypes'],
  endpoints: (builder) => ({
    getCERTSType: builder.query<
      IRequirementType[],
      {
        code?: string;
        status?: string[];
        name?: string;
        companyID?: string;
      }
    >({
      query: ({ code, status, name, companyID }) => ({
        url: `certificatesTypes/getFilteredCertificatesTypes/company/${COMPANY_ID}`,
        params: { code, status, name, companyID },
      }),
      providesTags: ['certTypes'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setACTypes(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getCERTType: builder.query<IRequirementType, string>({
      query: (id) => `certificatesTypes/company/${id}`,
    }),
    addCERTType: builder.mutation<IRequirementType, Partial<IRequirementType>>({
      query: (acType) => ({
        url: `certificatesTypes/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...acType,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['certTypes'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updateCERTType: builder.mutation<IRequirementType, IRequirementType>({
      query: (acType) => ({
        url: `certificatesTypes/company/${COMPANY_ID}/certificateType/${acType.id}`,
        method: 'PUT',
        body: { ...acType, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['certTypes'],
    }),
    deleteCERTType: builder.mutation<
      { success: boolean; acType: string },
      string
    >({
      query: (id) => ({
        url: `certificatesTypes/company/${COMPANY_ID}/certificateType/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['certTypes'],
    }),
  }),
});

export const {
  useGetCERTTypeQuery,
  useDeleteCERTTypeMutation,
  useAddCERTTypeMutation,
  useUpdateCERTTypeMutation,
  useGetCERTSTypeQuery,
} = certificatesTypeApi;
