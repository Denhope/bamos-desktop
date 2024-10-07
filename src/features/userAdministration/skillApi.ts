import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/baseQueryWithReauth';

import { COMPANY_ID, USER_ID } from '@/utils/api/http';

import { ISkill } from '@/models/IUser'; // Подключаем нужную модель

export const skillApi = createApi({
  reducerPath: 'skillsAdmin',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Skill'], // Добавляем типы тегов для кэширования
  endpoints: (builder) => ({
    getSkills: builder.query<
      ISkill[],
      {
        code?: string;
        skillID?: string;
        description?: string;
        type?: string;
        group?: string;
        unit?: string;
        status?: string;
        acTypeID?: string;
      }
    >({
      query: ({ code, description, skillID }) => ({
        url: `skills/getFilteredSkill/company/${COMPANY_ID}`,
        params: {
          code,
          skillID,
          description,
        },
      }),
      providesTags: ['Skill'], // Предоставляем тег 'Skill' после получения данных
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // dispatch(setSkillsGroups(data));
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        }
      },
    }),
    getSkill: builder.query<ISkill, string>({
      query: (id) => `skills/company/${COMPANY_ID}/skill/${id}`,
      providesTags: ['Skill'], // Предоставляем тег 'Skill' после получения данных
    }),
    addSkill: builder.mutation<
      ISkill,
      { skill: Partial<ISkill>; acTypeID?: string }
    >({
      query: ({ skill, acTypeID }) => ({
        url: `skills/companyID/${COMPANY_ID}/new`,
        method: 'POST',
        body: {
          ...skill,
          createUserID: USER_ID,
          createDate: new Date(),
          companyID: COMPANY_ID,
        },
      }),
      invalidatesTags: ['Skill'], // Отменяем тег 'Skill' после мутации
    }),
    updateSkill: builder.mutation<ISkill, ISkill>({
      query: (skill) => ({
        url: `skills/updateSkill/company/${COMPANY_ID}/skillID/${skill.id}`,
        method: 'PUT',
        body: {
          ...skill,
          updateUserID: USER_ID,
          updateDate: new Date(),
        },
      }),
      invalidatesTags: ['Skill'], // Отменяем тег 'Skill' после мутации
    }),
    deleteSkill: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `skills/company/${COMPANY_ID}/skillID/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Skill'], // Отменяем тег 'Skill' после мутации
    }),
  }),
});

export const {
  useAddSkillMutation,
  useDeleteSkillMutation,
  useGetSkillQuery,
  useGetSkillsQuery,
  useUpdateSkillMutation,
} = skillApi;
