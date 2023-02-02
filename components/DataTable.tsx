import * as React from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'clientName', headerName: 'Client name', width: 230 },
  { field: 'url', headerName: 'App URL', width: 630 },
  { field: 'id', headerName: 'Client ID', width: 300 },
];

export default function DataTable(rows) {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows.rows}
        columns={columns}
        pageSize={25}
      />
    </div>
  );
}