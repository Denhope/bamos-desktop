import AuthService from '@/services/authService';
import { $authHost, API_URL } from '@/utils/api/http';
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

  // Prepare the fetch arguments
  let fetchArgs: any;
  if (typeof args === 'string') {
    fetchArgs = { url: args };
  } else {
    fetchArgs = args;
  }

  // Add the Authorization header to the request if a token is present
  if (token) {
    fetchArgs.headers = {
      ...fetchArgs.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  // Execute the base query with the updated args
  let result = await fetchBaseQuery({ baseUrl: API_URL })(
    fetchArgs,
    api,
    extraOptions
  );

  // If the request was unauthorized, try to refresh the token
  if (
    (result.error && result.error.status === 401) ||
    (result.error && result.error.status === 'PARSING_ERROR')
  ) {
    // AuthService.handleAuthError(Error);
    try {
      await AuthService.handleAuthError(Error);
      // Re-attempt the request with the new token
      const result = await $authHost.request(fetchArgs);
      return { data: result.data };
    } catch (refreshError) {
      // Handle the refresh error or logout the user
      console.error('Error refreshing token:', refreshError);
      // You might want to logout the user or handle the error differently
      // AuthService.userLogout();
    }
  }

  return result;
};

// import {
//   BaseQueryFn,
//   FetchArgs,
//   FetchBaseQueryError,
//   fetchBaseQuery,
// } from '@reduxjs/toolkit/query/react';
// import { $authHost } from '@/utils/api/http';
// import AuthService from '@/services/authService';

// type Args = Parameters<BaseQueryFn>[0];
// type Api = Parameters<BaseQueryFn>[1];
// type ExtraOptions = Parameters<BaseQueryFn>[2];

// // Define the baseQueryWithReauth function with proper types
// export const baseQueryWithReauth: BaseQueryFn<
//   string | FetchArgs,
//   unknown,
//   FetchBaseQueryError
// > = async (args: Args | string, api: Api, extraOptions: ExtraOptions) => {
//   // Get the token from localStorage
//   const token = localStorage.getItem('token');

//   // Prepare the fetch arguments
//   let fetchArgs: any;
//   if (typeof args === 'string') {
//     fetchArgs = { url: args }; // Assuming GET request by default
//   } else {
//     fetchArgs = args;
//   }

//   // Add the Authorization header to the request if a token is present
//   if (token) {
//     fetchArgs.headers = {
//       ...fetchArgs.headers,
//       Authorization: `Bearer ${token}`,
//     };
//   }

//   // If params are an array, convert them to a comma-separated string
//   if (fetchArgs.params && typeof fetchArgs.params === 'object') {
//     for (const key in fetchArgs.params) {
//       if (Array.isArray(fetchArgs.params[key])) {
//         fetchArgs.params[key] = fetchArgs.params[key].join(',');
//       }
//     }
//   }

//   // Execute the base query with the updated args
//   try {
//     const result = await $authHost.request(fetchArgs);
//     return { data: result.data };
//   } catch (error: any) {
//     // If the request was unauthorized, try to refresh the token
//     if (error.response && error.response.status === 401) {
//       // Call the AuthService to handle the error and refresh the token
//       try {
//         await AuthService.handleAuthError(error);
//         // Re-attempt the request with the new token
//         const result = await $authHost.request(fetchArgs);
//         return { data: result.data };
//       } catch (refreshError) {
//         // Handle the refresh error or logout the user
//         console.error('Error refreshing token:', refreshError);
//         // You might want to logout the user or handle the error differently
//         // AuthService.userLogout();
//       }
//     }
//     // Re-throw the error if it's not a 401 Unauthorized error
//     throw error;
//   }
// };
