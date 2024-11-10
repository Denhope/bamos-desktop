import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { IProjectItem } from '@/models/AC';

interface IFilteredPickSlipItemsParams {
  pickSlipID?: string;
  partNumberID?: string;
  status?: string[];
  name?: string;
  companyID?: string;
  projectID?: string;
  projectTaskID?: string;
  tabId?: string;
}

interface IFilteredMaterialsReportParams extends IFilteredPickSlipItemsParams {
  customer?: string;
  state?: string[];
  updateUserID?: string;
  updateDate?: string;
  createUserID?: string;
  vendorID?: string[];
  type?: string[];
  storeFromID?: string[];
  neededOnID?: string[];
  pickSlipNumberNew?: string;
  pickSlipItemID?: string;
  tabId?: string;
}

interface MaterialsReportQueryParams {
  projectID?: string;
  pickSlipNumberNew?: string;
  partNumberID?: string;
  projectTaskID?: string;
  neededOnID?: string[];
  WOReferenceID?: string;
  state?: string[];
  forceRefresh?: number;
  tabId?: string;
  startDate?: string;
  finishDate?: string;
}

export const pickSlipItemsApi = createApi({
  reducerPath: 'pickSlipItemReducer',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PickSlipItem'],
  endpoints: (builder) => ({
    getPickSlipItems: builder.query<any[], IFilteredPickSlipItemsParams>({
      query: ({
        partNumberID,
        pickSlipID,
        status,
        name,
        companyID,
        projectID,
        projectTaskID,
        tabId,
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
          tabId,
        },
      }),
      providesTags: ['PickSlipItem'],
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
        requirementID?: string;
      }
    >({
      query: ({
        pickSlipItem,
        projectID,
        vendorID,
        pickSlipID,
        projectTaskID,
        requirementID,
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
          requirementID: requirementID,
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
    cancelPickSlipItems: builder.mutation<
      void,
      {
        pickSlipID: string;
        items: Array<{
          id: string;
          QTYCANCEL: number;
          locationID: string;
          storeItemID: string;
          projectTaskWO: string;
          projectWO: string;
          neededOnID?: string;
          WOReferenceID?: string;
          projectID?: string;
          projectTaskID?: string;
          storeID: string;
        }>;
        storeManID: string;
        userID: string;
        bookingDate: string;
      }
    >({
      query: (data: any) => ({
        url: `pickSlipItem/company/${COMPANY_ID}/cancel`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PickSlipItem'],
    }),
    getFilteredMaterialsReport: builder.query<any, MaterialsReportQueryParams>({
      query: (params) => ({
        url: `pickSlipBokingsItems/partBookingsPickSlipItems/getFilteredItems/company/${COMPANY_ID}`,
        params: {
          ...params,
          projectID: Array.isArray(params.projectID)
            ? params.projectID.join(',')
            : params.projectID,
          // state: params.state || ['ACTIVE', 'COMPLETED'],
        },
      }),
      transformResponse: (response: any) => {
        return response || [];
      },
      keepUnusedDataFor: 0,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }: any) => ({
                type: 'PickSlipItem' as const,
                id,
              })),
              { type: 'PickSlipItem' as const, id: 'LIST' },
            ]
          : [{ type: 'PickSlipItem' as const, id: 'LIST' }],
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
  useCancelPickSlipItemsMutation,
  useGetFilteredMaterialsReportQuery,
} = pickSlipItemsApi;
