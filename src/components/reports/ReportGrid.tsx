import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { ReportData } from '@/types/reports'

interface ReportGridProps {
  data: ReportData
}

function ReportGrid({ data }: ReportGridProps) {
  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
      <AgGridReact
        rowData={data.rows}
        columnDefs={data.columns}
        defaultColDef={{
          sortable: true,
          filter: true,
        }}
      />
    </div>
  )
}

export default ReportGrid