import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

function DpsPreviewTable({ rows }) {
  return (
    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Table size="small" aria-label="Preview DPS">
        <TableHead>
          <TableRow>
            <TableCell>Kode</TableCell>
            <TableCell>Nama Mata Kuliah</TableCell>
            <TableCell align="right">SKS</TableCell>
            <TableCell>Nilai</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Validasi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.kode_matkul}-${row.nama_matkul}`}>
              <TableCell>
                <Typography variant="body2" fontWeight={700}>
                  {row.kode_matkul}
                </Typography>
              </TableCell>
              <TableCell>{row.nama_matkul}</TableCell>
              <TableCell align="right">{row.sks}</TableCell>
              <TableCell>{row.nilai_huruf}</TableCell>
              <TableCell>{row.status}</TableCell>
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
