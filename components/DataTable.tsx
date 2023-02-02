import * as React from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { IconButton, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { CopyToClipboard } from './Clipboard';

const ValueCellRenderer = (params: GridValueGetterParams) => (
  <CopyToClipboard>
    {({ copy }) => (
      <>
        <IconButton disableRipple>
          <ContentCopyIcon
            onClick={() => {
              copy(params.value);
            }}
            style={{
              fontSize: 12,
              marginRight: 5,
            }}
          />
        </IconButton>

        <span>{params.value}</span>
      </>
    )}
  </CopyToClipboard>
);
const columns: GridColDef[] = [
  { field: 'clientName', headerName: 'Client name', width: 200 },
  {
    field: 'url',
    headerName: 'Manual App URL',
    width: 350,
    renderCell: ValueCellRenderer,
  },
  {
    field: 'id',
    headerName: 'Client ID',
    width: 250,
    renderCell: ValueCellRenderer,
  },
];

export default function DataTable(rows) {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows.rows} columns={columns} pageSize={25} />
    </div>
  );
}
