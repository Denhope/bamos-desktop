import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { IVendor } from '@/models/IUser';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';

export const actionsTemplatesApi = createApi({
  reducerPath: 'actionsTemplatesApiReducer',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ActionsTemplates'],
  endpoints: (builder) => ({
    getActionsTemplates: builder.query<
      any[],
      {
        code?: string;
        status?: string[];
        name?: string;
        companyID?: string;
        acTypeID?: string;
      }
    >({
      query: ({ code, status, name, companyID, acTypeID }) => ({
        url: `templatesTypes/getFilteredItems/company/${COMPANY_ID}`,
        params: { code, status, name, companyID, acTypeID },
      }),
      providesTags: ['ActionsTemplates'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setorderTextTypes(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getActionTemplate: builder.query<any, string>({
      query: (id) => `templates/company/${id}`,
    }),
    addActionTemplate: builder.mutation<any, Partial<any>>({
      query: (orderTextType) => ({
        url: `templatesTypes/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...orderTextType,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['ActionsTemplates'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updateActionTemplate: builder.mutation<any, any>({
      query: (orderTextType) => ({
        url: `templatesTypes/company/${COMPANY_ID}/template/${orderTextType.id}`,
        method: 'PUT',
        body: {
          ...orderTextType,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['ActionsTemplates'],
    }),
    deleteActionTemplate: builder.mutation<
      { success: boolean; orderTextType: string },
      string
    >({
      query: (id) => ({
        url: `templatesTypes/company/${COMPANY_ID}/template/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ActionsTemplates'],
    }),
  }),
});

export const {
  useGetActionTemplateQuery,
  useDeleteActionTemplateMutation,
  useAddActionTemplateMutation,
  useGetActionsTemplatesQuery,
  useUpdateActionTemplateMutation,
} = actionsTemplatesApi;
