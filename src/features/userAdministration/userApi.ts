import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { IUser, User, UserGroup } from '@/models/IUser';
import { API_URL } from '@/utils/api/http';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getUsersGroup: builder.query<any, string>({
      query: () => `users/`,
    }),
    getUser: builder.query<User, string>({
      query: (id) => `users/${id}`,
    }),
    addUser: builder.mutation<User, Partial<User>>({
      query: (user) => ({
        url: 'users',
        method: 'POST',
        body: user,
      }),
    }),
    updateUser: builder.mutation<User, User>({
      query: (user) => ({
        url: `users/${user.id}`,
        method: 'PUT',
        body: user,
      }),
    }),
    deleteUser: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetUserQuery,
  useGetUsersGroupQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
