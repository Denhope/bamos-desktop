import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IProjectItem } from '@/models/AC';

export const pickSlipApi = createApi({
  reducerPath: 'pickSlipReducer',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PickSlip'],
  endpoints: (builder) => ({
    getPickSlips: builder.query<
      any[],
      {
        partNumberID?: string;
        status?: string[];
        name?: string;
        companyID?: string;
        projectID?: string;
        projectTaskID?: string;
        pickSlipItemID?: string;
        startDate?: any;
        endDate?: any;
        pickSlipNumberNew?: number;
        neededOnID?: string;
        includeAlternates?: boolean;
        storeFromID?: any;
        WOReferenceID?: any;
      }
    >({
      query: ({
        partNumberID,
        status,
        name,
        companyID,
        projectID,
        projectTaskID,
        includeAlternates,
        neededOnID,
        pickSlipNumberNew,
        endDate,
        startDate,
        storeFromID,
        WOReferenceID,
      }) => ({
        url: `pickSlipAdministration/getFilteredPickSlips/company/${COMPANY_ID}`,
        params: {
          partNumberID,
          status,
          name,
          companyID,
          projectID,
          projectTaskID,
          includeAlternates,
          neededOnID,
          pickSlipNumberNew,
          endDate,
          startDate,
          storeFromID,
          WOReferenceID,
        },
      }),
      providesTags: ['PickSlip'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setprojectItems(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getPickSlipItem: builder.query<IProjectItem, string>({
      query: (id) => `pickSlipAdministration/company/${id}`,
    }),
    addPickSlip: builder.mutation<
      any,
      {
        pickSlipItem: Partial<any>;
        projectID: string;
        projectTaskID: string;
        vendorID?: string;
      }
    >({
      query: ({ pickSlipItem, projectID, vendorID, projectTaskID }) => ({
        url: `pickSlipAdministration/company/${COMPANY_ID}`,
        method: 'POST',
        body: {
          ...pickSlipItem,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
          projectID: projectID,
          projectTaskID: projectTaskID,
          vendorID: vendorID,
        },
      }),
      invalidatesTags: ['PickSlip'], // Указываем, что это мутация недействительна тега 'UserGroups'
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
        url: `pickSlipAdministration/multi/company/${COMPANY_ID}`,
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
      invalidatesTags: ['PickSlip'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updatePickSlip: builder.mutation<any, any>({
      query: (pickSlip) => ({
        url: `pickSlipAdministration/company/${COMPANY_ID}/pickSlip/${
          pickSlip?.pickSlip.id || pickSlip?.pickSlip?._id
        }`,
        method: 'PUT',
        body: {
          ...pickSlip,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['PickSlip'],
    }),
    deletePickSlip: builder.mutation<
      { success: boolean; projectItem: string },
      string
    >({
      query: (id) => ({
        url: `pickSlipAdministration/company/${COMPANY_ID}/pickSlipItem/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PickSlip'],
    }),
  }),
});

export const {
  useAddPickSlipMutation,
  useDeletePickSlipMutation,
  useGetPickSlipsQuery,
  useUpdatePickSlipMutation,
  useGetPickSlipItemQuery,

  useAddMultiPickSlipItemsMutation,
} = pickSlipApi;
