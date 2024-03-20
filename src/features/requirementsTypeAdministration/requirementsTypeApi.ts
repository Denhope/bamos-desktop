import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { IVendor } from '@/models/IUser';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';
import { setACTypes } from './acTypesSlice';
import { IRequirementType } from '@/models/AC';

export const requirementsTypeApi = createApi({
  reducerPath: 'requirementsTypeApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['REQTypes'],
  endpoints: (builder) => ({
    getREQTypes: builder.query<
      IRequirementType[],
      {
        code?: string;
        status?: string[];
        name?: string;
        companyID?: string;
      }
    >({
      query: ({ code, status, name, companyID }) => ({
        url: `requirementTypes/getFilteredRequirementTypes/company/${COMPANY_ID}`,
        params: { code, status, name, companyID },
      }),
      providesTags: ['REQTypes'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setACTypes(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getREQType: builder.query<IRequirementType, string>({
      query: (id) => `requirementTypes/company/${id}`,
    }),
    addREQType: builder.mutation<IRequirementType, Partial<IRequirementType>>({
      query: (acType) => ({
        url: `requirementTypes/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...acType,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['REQTypes'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updateREQType: builder.mutation<IRequirementType, IRequirementType>({
      query: (acType) => ({
        url: `requirementTypes/company/${COMPANY_ID}/requirementType/${acType.id}`,
        method: 'PUT',
        body: { ...acType, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['REQTypes'],
    }),
    deleteREQType: builder.mutation<
      { success: boolean; acType: string },
      string
    >({
      query: (id) => ({
        url: `requirementTypes/company/${COMPANY_ID}/requirementType/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['REQTypes'],
    }),
  }),
});

export const {
  useGetREQTypeQuery,
  useDeleteREQTypeMutation,
  useAddREQTypeMutation,
  useGetREQTypesQuery,
  useUpdateREQTypeMutation,
} = requirementsTypeApi;
