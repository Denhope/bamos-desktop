import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IProjectItem } from '@/models/AC';

export const pickSlipBookingsItemsApi = createApi({
  reducerPath: 'pickSlipBookingsItemReducer',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PickSlipBookingItem'],
  endpoints: (builder) => ({
    getPickSlipBookingsItems: builder.query<
      any[],
      {
        pickSlipID?: string;
        pickSlipItemID?: string;
        requirementID?: string;
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
        pickSlipItemID,
        requirementID,
      }) => ({
        url: `pickSlipBokingsItems/getFilteredItems/company/${COMPANY_ID}`,
        params: {
          partNumberID,
          pickSlipID,
          status,
          name,
          companyID,
          projectID,
          projectTaskID,
          pickSlipItemID,
          requirementID,
        },
      }),
      providesTags: ['PickSlipBookingItem'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setprojectItems(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getPickSlipBookingsItem: builder.query<any, string>({
      query: (id) => `pickSlipBokingsItems/company/${id}`,
    }),
    addPickSlipBookingsItem: builder.mutation<
      any,
      {
        pickSlipItem: Partial<any>;
        projectID?: string;
        projectTaskID?: string;
        vendorID?: string;
      }
    >({
      query: ({
        pickSlipItem,
        projectID,
        vendorID,

        projectTaskID,
      }) => ({
        url: `pickSlipBokingsItems/company/${COMPANY_ID}`,
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
      invalidatesTags: ['PickSlipBookingItem'], // Указываем, что это мутация недействительна тега 'UserGroups'
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
        url: `pickSlipBokingsItems/multi/company/${COMPANY_ID}`,
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
      invalidatesTags: ['PickSlipBookingItem'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updatePickSlipBookingsItem: builder.mutation<any, any>({
      query: (pickSlipBokingsItem) => ({
        url: `pickSlipBokingsItems/company/${COMPANY_ID}/partBookingsPickSlipItem/${pickSlipBokingsItem?.pickSlipBokingsItem?.id}`,
        method: 'PUT',
        body: {
          ...pickSlipBokingsItem,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['PickSlipBookingItem'],
    }),
    deletePickSlipBookingsItem: builder.mutation<
      { success: boolean; projectItem: string },
      string
    >({
      query: (id) => ({
        url: `pickSlipBokingsItems/company/${COMPANY_ID}/partBookingsPickSlipItem/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PickSlipBookingItem'],
    }),
  }),
});

export const {
  useAddPickSlipBookingsItemMutation,
  useGetPickSlipBookingsItemQuery,
  useDeletePickSlipBookingsItemMutation,
  useGetPickSlipBookingsItemsQuery,
  useUpdatePickSlipBookingsItemMutation,
} = pickSlipBookingsItemsApi;
