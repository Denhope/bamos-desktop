import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { createApi } from '@reduxjs/toolkit/query/react';
import { SubscriptionType } from '@/services/utilites';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';

export interface SupportRequest {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  requestType: SubscriptionType;
  status: 'open' | 'inProgress' | 'closed';
  createDate: string;
  updateDate?: string;
  closedDate?: string;
  companyID: string;
  createUserID: string;
  updateUserID?: string;
}

export const supportRequestApi = createApi({
  reducerPath: 'supportRequestApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['SupportRequest'],
  endpoints: (builder) => ({
    getSupportRequests: builder.query<SupportRequest[], any>({
      query: (params) => ({
        url: `/support/api/support-requests/company/${COMPANY_ID}`,
        params,
      }),
      providesTags: ['SupportRequest'],
    }),
    submitSupportRequest: builder.mutation<SupportRequest, Partial<SupportRequest>>({
      query: (request) => ({
        url: `/support/api/support-requests`,
        method: 'POST',
        body: {
          ...request,
          createUserID: USER_ID,
          createDate: new Date().toISOString(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['SupportRequest'],
    }),
    updateSupportRequest: builder.mutation<SupportRequest, Partial<SupportRequest> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/support/api/support-requests/${id}`,
        method: 'PUT',
        body: {
          ...patch,
          updateUserID: USER_ID,
          updateDate: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['SupportRequest'],
    }),
    deleteSupportRequest: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/support/api/support-requests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SupportRequest'],
    }),
  }),
});

export const {
  useGetSupportRequestsQuery,
  useSubmitSupportRequestMutation,
  useUpdateSupportRequestMutation,
  useDeleteSupportRequestMutation,
} = supportRequestApi;