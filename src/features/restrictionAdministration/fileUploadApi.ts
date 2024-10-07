import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { createApi } from '@reduxjs/toolkit/query/react';
import { COMPANY_ID, USER_ID } from '@/utils/api/http';

export interface UploadResult {
  success: string[];
  error: string[];
}

export const fileUploadApi = createApi({
  reducerPath: 'fileUploadApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['FileUpload'],
  endpoints: (builder) => ({
    uploadFiles: builder.mutation<UploadResult, FormData>({
      query: (formData) => ({
        url: `/files/api/upload`,
        method: 'POST',
        body: formData,
        formData: true,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 300000, // 5 минут
      }),
      invalidatesTags: ['FileUpload'],
    }),
    getUploadHistory: builder.query<UploadResult[], void>({
      query: () => ({
        url: `/files/api/upload/history/${COMPANY_ID}`,
      }),
      providesTags: ['FileUpload'],
    }),
    deleteUploadedFile: builder.mutation<{ success: boolean; filename: string }, string>({
      query: (filename) => ({
        url: `/files/api/upload/${filename}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FileUpload'],
    }),
  }),
});

export const {
  useUploadFilesMutation,
  useGetUploadHistoryQuery,
  useDeleteUploadedFileMutation,
} = fileUploadApi;