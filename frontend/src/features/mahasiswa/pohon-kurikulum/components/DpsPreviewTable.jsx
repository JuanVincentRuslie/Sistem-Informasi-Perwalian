import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import { NILAI_HURUF_OPTIONS, STATUS_OPTIONS } from './dps-preview-utils.js';

function DpsPreviewTable({ rows, onRowChange }) {
  return (
    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Table size="small" aria-label="Preview DPS">
        <TableHead>
          <TableRow>
            <TableCell>Kode</TableCell>
            <TableCell>Nama Mata Kuliah</TableCell>
            <TableCell>Nilai</TableCell>
            <TableCell align="right">Angka</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Validasi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={`${row.kode_matkul}-${row.nama_matkul}-${index}`}>
              <TableCell>
                <TextField
                  size="small"
                  value={row.kode_matkul}
                  onChange={(event) => onRowChange(index, 'kode_matkul', event.target.value)}
                  slotProps={{ htmlInput: { 'aria-label': 'Kode mata kuliah' } }}
                  sx={{ minWidth: 120 }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  value={row.nama_matkul}
                  onChange={(event) => onRowChange(index, 'nama_matkul', event.target.value)}
                  slotProps={{ htmlInput: { 'aria-label': 'Nama mata kuliah' } }}
                  sx={{ minWidth: 220 }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  select
                  size="small"
                  value={row.nilai_huruf}
                  onChange={(event) => onRowChange(index, 'nilai_huruf', event.target.value)}
                  sx={{ minWidth: 90 }}
                >
                  {NILAI_HURUF_OPTIONS.map((nilai) => (
                    <MenuItem key={nilai} value={nilai}>
                      {nilai}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell align="right">
                <TextField
                  size="small"
                  type="number"
                  value={row.nilai_angka ?? ''}
                  onChange={(event) => onRowChange(index, 'nilai_angka', event.target.value)}
                  slotProps={{ htmlInput: { min: 0, max: 100, 'aria-label': 'Nilai angka' } }}
                  sx={{ width: 96 }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  select
                  size="small"
                  value={row.status}
                  onChange={(event) => onRowChange(index, 'status', event.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell>
                {row.valid ? (
                  <Chip
                    size="small"
                    color="success"
                    icon={<CheckCircleIcon />}
                    label="Valid"
                    variant="outlined"
                  />
                ) : (
                  <Chip
                    size="small"
                    color="error"
                    icon={<ErrorOutlinedIcon />}
                    label={row.errors?.join(', ') || 'Tidak valid'}
                    variant="outlined"
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DpsPreviewTable;
