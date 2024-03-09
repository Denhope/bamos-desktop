import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';
import { IUser, User, UserGroup } from '@/models/IUser';
import { setUserGroups } from './userGroupSlice';

const currentCompanyID = localStorage.getItem('companyID') || '';

export const userGroupApi = createApi({
  reducerPath: 'userGroupApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['UserGroups'], // Добавляем типы тегов для кэширования
  endpoints: (builder) => ({
    getGroupsUser: builder.query<
      UserGroup[],
      { singNumber?: string; pass?: string }
    >({
      query: ({ singNumber, pass }) => ({
        url: `userGroups/getFilteredUsersGroup/company/${currentCompanyID}`,
        params: { singNumber, pass },
      }),
      providesTags: ['UserGroups'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setUserGroups(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getGroupUser: builder.query<User, string>({
      query: (id) => `userGroups/company/${currentCompanyID}/group/${id}`,
    }),
    addGroupUser: builder.mutation<User, Partial<UserGroup>>({
      query: (user) => ({
        url: 'userGroups',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['UserGroups'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    updateGroupUser: builder.mutation<UserGroup, UserGroup>({
      query: (user) => ({
        url: `userGroups/company/${currentCompanyID}/group/${user.id}`,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: ['UserGroups'], // Указываем, что это мутация недействительна тега 'UserGroups'
    }),
    deleteGroupUser: builder.mutation<{ success: boolean; id: string }, string>(
      {
        query: (id) => ({
          url: `userGroups/company/${currentCompanyID}/group/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['UserGroups'], // Указываем, что это мутация недействительна тега 'UserGroups'
      }
    ),
  }),
});

export const {
  useGetGroupsUserQuery,
  useDeleteGroupUserMutation,
  useUpdateGroupUserMutation,
  useGetGroupUserQuery,
  useAddGroupUserMutation,
} = userGroupApi;
