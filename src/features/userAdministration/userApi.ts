import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { IUser, User, UserGroup } from '@/models/IUser';
import { setUsersGroup } from './userSlice';
import { COMPANY_ID } from '@/utils/api/http';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Users'], // Add tag types for caching
  endpoints: (builder) => ({
    getGroupUsers: builder.query<
      UserGroup[],
      { singNumber?: string; pass?: string }
    >({
      query: ({ singNumber, pass }) => ({
        url: `users/getFilteredGroupUsers/company/${COMPANY_ID}`,
        params: { singNumber, pass },
      }),
      providesTags: ['Users'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setUsersGroup(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
      // Provide the 'Users' tag after fetching
    }),
    getUser: builder.query<User, string>({
      query: (id) => `users/${id}`,
      providesTags: ['Users'], // Provide the 'Users' tag after fetching
    }),
    addUser: builder.mutation<User, Partial<User>>({
      query: (user) => ({
        url: `users/company/${COMPANY_ID}`,
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['Users'], // Invalidate the 'Users' tag after mutation
    }),
    updateUser: builder.mutation<User, User>({
      query: (user) => ({
        url: `users/company/${COMPANY_ID}/user/${user.id || user._id}`,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: ['Users'], // Invalidate the 'Users' tag after mutation
    }),
    deleteUser: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `users/company/${COMPANY_ID}/user/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'], // Invalidate the 'Users' tag after mutation
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetGroupUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
