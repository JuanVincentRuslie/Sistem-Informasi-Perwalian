import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { formatTanggal } from '../../../../utils/formatDate.js';

function PeriodeHistoryTable({ periods, activatingId, deletingId, onActivate, onDelete }) {
  return (
    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Table size="small" aria-label="Histori periode">
        <TableHead>
          <TableRow>
            <TableCell>Periode</TableCell>
            <TableCell>Rentang Tanggal</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Upload Jadwal</TableCell>
            <TableCell align="right">Aksi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {periods.map((periode) => (
            <TableRow key={periode.id} hover>
              <TableCell>
                <Typography fontWeight={700}>{periode.nama}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {periode.jenis === 'genap' ? 'Semester genap' : 'Semester ganjil'}
                </Typography>
              </TableCell>
              <TableCell>
                {formatTanggal(periode.tanggal_mulai)} - {formatTanggal(periode.tanggal_selesai)}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={
                    periode.status === 'active'
                      ? 'success'
                      : periode.status === 'expired'
                        ? 'default'
                        : 'warning'
                  }
                  label={
                    periode.status === 'active'
                      ? 'Aktif'
                      : periode.status === 'expired'
                        ? 'Berakhir'
                        : 'Tidak aktif'
                  }
                  icon={periode.status === 'active' ? <CheckCircleIcon /> : undefined}
                  variant={periode.status === 'active' ? 'filled' : 'outlined'}
                />
              </TableCell>
              <TableCell>
                {periode.upload_jadwal ? (
                  <Typography variant="body2">
                    {periode.upload_jadwal.total_kelas} kelas
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Belum ada upload
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="text"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDelete(periode.id)}
                  disabled={deletingId === periode.id}
                  sx={{ mr: 1 }}
                >
                  {deletingId === periode.id ? 'Menghapus...' : 'Hapus'}
                </Button>

                {periode.status === 'active' ? (
                  <Button size="small" disabled>
                    Sedang Aktif
                  </Button>
                ) : null}

                {periode.status === 'inactive' ? (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => onActivate(periode.id)}
                    disabled={activatingId === periode.id}
                  >
                    {activatingId === periode.id ? 'Mengaktifkan...' : 'Aktifkan'}
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PeriodeHistoryTable;
