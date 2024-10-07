import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ReportType, ReportData } from '@/types/reports'

interface GenerateReportRequest {
  type: ReportType
  dateRange: [string, string]
  user?: string
  specialty?: string
  material?: string
  defectType?: string
  workType?: string
  department?: string
  project?: string
  minEfficiency?: number
  maxCost?: number
}

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    generateReport: builder.mutation<ReportData, GenerateReportRequest>({
      query: (body) => ({
        url: 'generateReport',
        method: 'POST',
        body,
      }),
    }),
    exportToExcel: builder.mutation<Blob, ReportData>({
      query: (body) => ({
        url: 'exportToExcel',
        method: 'POST',
        body,
        responseHandler: (response) => response.blob(),
      }),
    }),
    exportToPDF: builder.mutation<Blob, ReportData>({
      query: (body) => ({
        url: 'exportToPDF',
        method: 'POST',
        body,
        responseHandler: (response) => response.blob(),
      }),
    }),
    getUsers: builder.query<string[], void>({
      query: () => 'users',
    }),
    getSpecialties: builder.query<string[], void>({
      query: () => 'specialties',
    }),
    getMaterials: builder.query<string[], void>({
      query: () => 'materials',
    }),
    getDefectTypes: builder.query<string[], void>({
      query: () => 'defectTypes',
    }),
    getWorkTypes: builder.query<string[], void>({
      query: () => 'workTypes',
    }),
    getDepartments: builder.query<string[], void>({
      query: () => 'departments',
    }),
    getProjects: builder.query<string[], void>({
      query: () => 'projects',
    }),
  }),
})

export const {
  useGenerateReportMutation,
  useExportToExcelMutation,
  useExportToPDFMutation,
  useGetUsersQuery,
  useGetSpecialtiesQuery,
  useGetMaterialsQuery,
  useGetDefectTypesQuery,
  useGetWorkTypesQuery,
  useGetDepartmentsQuery,
  useGetProjectsQuery,
} = reportsApi