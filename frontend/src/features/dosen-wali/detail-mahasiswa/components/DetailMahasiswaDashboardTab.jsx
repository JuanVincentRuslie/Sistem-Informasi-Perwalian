import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IpkCard from '../../../mahasiswa/dashboard/components/IpkCard.jsx';
import SksMetricRow from '../../../mahasiswa/dashboard/components/SksMetricRow.jsx';

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={700}>{value}</Typography>
    </Box>
  );
}

function DetailMahasiswaDashboardTab({ profile }) {
  const { mahasiswa, periode_aktif } = profile;

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="h5" component="h2">
        {mahasiswa.nama} - {mahasiswa.nim}
      </Typography>

      <SksMetricRow
        totalLulus={mahasiswa.total_sks_lulus}
        totalWajib={mahasiswa.total_sks_wajib_lulus}
        totalPilihan={mahasiswa.total_sks_pilihan_lulus}
      />

      <IpkCard ipk={mahasiswa.ipk} />

      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          IPS : {mahasiswa.ips_terakhir == null ? '-' : mahasiswa.ips_terakhir.toFixed(2)}
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: 'grey.100', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="h3">
            Report & Details
          </Typography>
        </Box>
        <Box sx={{ p: 2, display: 'grid', gap: 1 }}>
          <InfoRow label="Angkatan" value={mahasiswa.angkatan} />
          <InfoRow label="Periode Aktif" value={periode_aktif?.nama ?? '-'} />
          <InfoRow label="IPK" value={mahasiswa.ipk == null ? '-' : mahasiswa.ipk.toFixed(2)} />
          <InfoRow label="IPS Terakhir" value={mahasiswa.ips_terakhir == null ? '-' : mahasiswa.ips_terakhir.toFixed(2)} />
        </Box>
      </Paper>
    </Box>
  );
}

export default DetailMahasiswaDashboardTab;
