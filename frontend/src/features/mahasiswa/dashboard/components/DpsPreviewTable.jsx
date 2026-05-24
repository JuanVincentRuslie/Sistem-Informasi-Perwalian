import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

function StatusChip({ status }) {
  const color = status === 'LULUS' ? 'success' : 'error';
  const label = status === 'LULUS' ? 'LULUS' : 'TIDAK LULUS';
  return <Chip size="small" color={color} label={label} variant="outlined" />;
}

function DpsPreviewTable({ rows }) {
  return (
    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Table size="small" aria-label="Preview DPS">
        <TableHead>
          <TableRow>
            <TableCell>Kode</TableCell>
            <TableCell>Nama Mata Kuliah</TableCell>
            <TableCell>Nilai</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={`${row.kode_matkul}-${row.nama_matkul}-${index}`}>
              <TableCell>{row.kode_matkul}</TableCell>
              <TableCell>{row.nama_matkul}</TableCell>
              <TableCell>{row.nilai_huruf}</TableCell>
              <TableCell>
                <StatusChip status={row.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DpsPreviewTable;
