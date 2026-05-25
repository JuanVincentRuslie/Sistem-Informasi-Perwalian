import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const UJIAN_STATUS_CONFIG = {
  lengkap: { color: 'success', icon: <EventAvailableIcon />, label: 'UTS + UAS' },
  uts_only: { color: 'warning', icon: <EventAvailableIcon />, label: 'UTS only' },
  uas_only: { color: 'warning', icon: <EventAvailableIcon />, label: 'UAS only' },
  belum: { color: 'default', icon: <EventBusyIcon />, label: 'Belum' },
};

function JadwalUjianChip({ status }) {
  const config = UJIAN_STATUS_CONFIG[status] ?? UJIAN_STATUS_CONFIG.belum;
  return <Chip size="small" color={config.color} icon={config.icon} label={config.label} variant="outlined" />;
}

function JadwalKelasPreviewTable({ rows }) {
  return (
    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Table size="small" aria-label="Preview jadwal kelas">
        <TableHead>
          <TableRow>
            <TableCell>Kode</TableCell>
            <TableCell>Nama Mata Kuliah</TableCell>
            <TableCell align="right">SKS</TableCell>
            <TableCell>Kelas</TableCell>
            <TableCell align="right">Jumlah Sesi</TableCell>
            <TableCell>Jadwal Ujian</TableCell>
            <TableCell>Validasi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={`${row.kode_matkul}-${row.nama_kelas}-${index}`}>
              <TableCell>{row.kode_matkul}</TableCell>
              <TableCell>{row.nama_matkul}</TableCell>
              <TableCell align="right">{row.sks}</TableCell>
              <TableCell>{row.nama_kelas}</TableCell>
              <TableCell align="right">{row.sesi_count}</TableCell>
              <TableCell>
                {row.valid ? <JadwalUjianChip status={row.jadwal_ujian_status} /> : '—'}
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

export default JadwalKelasPreviewTable;
