import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {
  getRencanaStudiDetail,
  getRencanaStudiDosenRiwayatMahasiswa,
  revisiRencanaStudi,
  setujuiRencanaStudi,
} from '../../../../api/rencanaStudi.js';
import useFetch from '../../../../hooks/useFetch.js';
import FrsPeriodeTabs from '../../../mahasiswa/perwalian/components/FrsPeriodeTabs.jsx';
import DosenRencanaStudiDetailView from './DosenRencanaStudiDetailView.jsx';

function DetailMahasiswaRencanaStudiTab({ mahasiswa }) {
  // useState: tab dalam tab untuk memilih histori FRS per periode mahasiswa.
  // Default diatur ke periode terbaru setelah data riwayat selesai dimuat.
  const [activePeriodeIndex, setActivePeriodeIndex] = useState(0);

  // useFetch: ambil daftar FRS mahasiswa bimbingan dari service layer.
  // Data ini menjadi sumber tab histori di dalam tab Rencana Studi.
  const {
    data: riwayat,
    loading: loadingRiwayat,
    error: riwayatError,
    refetch: refetchRiwayat,
  } = useFetch(() => getRencanaStudiDosenRiwayatMahasiswa(mahasiswa.id), [mahasiswa.id]);

  // useMemo: urut lama -> baru supaya tab histori konsisten dengan sisi mahasiswa.
  const sortedRiwayat = useMemo(() => (
    [...(riwayat ?? [])].sort((a, b) => a.periode.id - b.periode.id)
  ), [riwayat]);

  // useEffect: setelah riwayat tersedia, buka periode terbaru di tab paling kanan.
  useEffect(() => {
    if (sortedRiwayat.length > 0) {
      setActivePeriodeIndex(sortedRiwayat.length - 1);
    }
  }, [sortedRiwayat.length]);

  const activeRencanaStudiId = sortedRiwayat[activePeriodeIndex]?.id ?? null;

  // useFetch: detail FRS dipisah dari riwayat supaya approve/revisi bisa refetch detail aktif saja.
  const {
    data: rencanaStudi,
    loading: loadingDetail,
    error: detailError,
    refetch: refetchDetail,
  } = useFetch(
    () => activeRencanaStudiId
      ? getRencanaStudiDetail(activeRencanaStudiId)
      : Promise.resolve({ data: null }),
    [activeRencanaStudiId],
  );

  async function handleReview(decision, catatan) {
    try {
      if (decision === 'APPROVED') {
        await setujuiRencanaStudi(rencanaStudi.id, { catatan });
      } else {
        await revisiRencanaStudi(rencanaStudi.id, { catatan });
      }

      refetchDetail();
      refetchRiwayat();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loadingRiwayat && !riwayat) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (riwayatError && !riwayat) {
    return <Alert severity="error">{riwayatError.message}</Alert>;
  }

  if (sortedRiwayat.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Mahasiswa ini belum memiliki histori rencana studi.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <FrsPeriodeTabs
        riwayat={sortedRiwayat}
        activeTabIndex={activePeriodeIndex}
        onChange={setActivePeriodeIndex}
      />

      {loadingDetail && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {detailError && !loadingDetail && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {detailError.message}
        </Alert>
      )}

      {!loadingDetail && !detailError && rencanaStudi && (
        <DosenRencanaStudiDetailView rencanaStudi={rencanaStudi} onReview={handleReview} />
      )}
    </Box>
  );
}

export default DetailMahasiswaRencanaStudiTab;
