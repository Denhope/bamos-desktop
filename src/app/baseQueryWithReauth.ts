import { API_URL } from '@/utils/api/http';
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';

type Args = Parameters<BaseQueryFn>[0];
type Api = Parameters<BaseQueryFn>[1];
type ExtraOptions = Parameters<BaseQueryFn>[2];

// Define the baseQueryWithReauth function with proper types
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args: Args | string, api: Api, extraOptions: ExtraOptions) => {
  // Get the token from localStorage
  const token = localStorage.getItem('token');

  // Add the Authorization header to the request if a token is present
  if (token) {
    // Ensure that the args are of type FetchArgs
    const fetchArgs = args as FetchArgs;
    fetchArgs.headers = {
      ...fetchArgs.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  // Execute the base query with the updated args
  return fetchBaseQuery({ baseUrl: API_URL })(args, api, extraOptions);
};
