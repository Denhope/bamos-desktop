import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IProjectItem } from '@/models/AC';

export const pickSlipItemsApi = createApi({
  reducerPath: 'pickSlipItemReducer',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PickSlipItem'],
  endpoints: (builder) => ({
    getPickSlipItems: builder.query<
      any[],
      {
        pickSlipID?: string;
        partNumberID?: string;
        status?: string[];
        name?: string;
        companyID?: string;
        projectID?: string;
        projectTaskID?: string;
      }
    >({
      query: ({
        partNumberID,
        pickSlipID,
        status,
        name,
        companyID,
        projectID,
        projectTaskID,
      }) => ({
        url: `pickSlipItem/getFilteredPickSlipItems/company/${COMPANY_ID}`,
        params: {
          partNumberID,
          pickSlipID,
          status,
          name,
          companyID,
          projectID,
          projectTaskID,
        },
      }),
      providesTags: ['PickSlipItem'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setprojectItems(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getPickSlipItem: builder.query<any, string>({
      query: (id) => `pickSlipItem/company/${COMPANY_ID}/item/${id}`,
    }),
    addPickSlipItem: builder.mutation<
      any,
      {
        pickSlipItem: Partial<any>;
        pickSlipID: string;
        projectID: string;
        projectTaskID: string;
        vendorID?: string;
      }
    >({
      query: ({
        pickSlipItem,
        projectID,
        vendorID,
        pickSlipID,
        projectTaskID,
      }) => ({
        url: `pickSlipItem/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...pickSlipItem,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
          projectID: projectID,
          projectTaskID: projectTaskID,
          vendorID: vendorID,
          pickSlipID: pickSlipID,
        },
      }),
      invalidatesTags: ['PickSlipItem'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    addMultiPickSlipItems: builder.mutation<
      any[],
      {
        projectItemsDTO: Partial<any[]>;
        projectID: string;
        vendorID?: string;
      }
    >({
      query: ({ projectItemsDTO, projectID, vendorID }) => ({
        url: `pickSlipItem/multi/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          projectItemsDTO,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
          projectID: projectID,
          vendorID: vendorID,
        },
      }),
      invalidatesTags: ['PickSlipItem'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updatePickSlipItems: builder.mutation<IProjectItem, IProjectItem>({
      query: (projectItem) => ({
        url: `pickSlipItem/company/${COMPANY_ID}/pickSlipItem/${projectItem.id}`,
        method: 'PUT',
        body: { ...projectItem, updateUserID: USER_ID, updateDate: new Date() },
      }),
      invalidatesTags: ['PickSlipItem'],
    }),
    deletePickSlipItem: builder.mutation<
      { success: boolean; projectItem: string },
      string
    >({
      query: (id) => ({
        url: `pickSlipItem/company/${COMPANY_ID}/pickSlipItem/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PickSlipItem'],
    }),
  }),
});

export const {
  useAddPickSlipItemMutation,
  useDeletePickSlipItemMutation,
  useGetPickSlipItemQuery,
  useGetPickSlipItemsQuery,
  useUpdatePickSlipItemsMutation,
  useAddMultiPickSlipItemsMutation,
} = pickSlipItemsApi;
